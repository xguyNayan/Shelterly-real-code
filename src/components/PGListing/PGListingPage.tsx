import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import listingImage from '../../assets/images/listing.png';
import { motion } from 'framer-motion';


// Create a local debounce utility to fix the missing module error
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
import { useLocation, useNavigate } from 'react-router-dom';
import { createPgUrl } from '../../utils/seoUtils';
import { FiFilter, FiMapPin, FiStar, FiCheck, FiWifi, FiTv, FiCoffee, FiRefreshCw } from 'react-icons/fi';
// Google Maps imports removed
import { collection, getDocs, query, where, orderBy, limit, startAfter, doc, getDoc } from 'firebase/firestore';
// Static image import instead of Spline
import { db } from '../../firebase/config';
// Removed review service import to improve performance
import { getCoordinatesFromLocationName } from '../../utils/geocoding';
import NoPGsFoundScreen from './NoPGsFoundScreen';

// Google Maps window type definition removed
import Navbar from '../Navbar';
import Footer from '../Footer';
import { PGFilter } from '.';
import './PGListingPage.css';
import { useAuth } from '../../contexts/AuthContext';
import { useViewedPGs } from '../../contexts/ViewedPGsContext';
import QuirkyNewAuthModal from '../Auth/QuirkyNewAuthModal';
import { trackPgView } from '../../services/analyticsService';

// Import types
import { PGData } from './types';

// No longer using dynamic import for Spline
// Default center for Bangalore
const DEFAULT_CENTER = {
  lat: 12.9716,
  lng: 77.5946
};

// Libraries definition removed

// Position cache to avoid recalculating map positions
const positionCache = new Map<string, {lat: number, lng: number}>();

// Define global window interface to store image cache
declare global {
  interface Window {
    imageCache?: Map<string, boolean>;
  }
}

// Preload images function with improved caching and logging
const preloadImage = (url: string) => {
  if (typeof window === 'undefined') return;
  
  if (!window.imageCache) {
    window.imageCache = new Map<string, boolean>();
  }
  
  if (!window.imageCache.has(url)) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      window.imageCache?.set(url, true);
      
      // Store in browser cache for persistence across sessions
      try {
        const cachedImages = JSON.parse(localStorage.getItem('cachedImages') || '{}');
        cachedImages[url] = true;
        localStorage.setItem('cachedImages', JSON.stringify(cachedImages));
      } catch (error) {
        console.error('Error caching image URL:', error);
      }
    };
  }
};

// Initialize image cache from localStorage
try {
  if (typeof window !== 'undefined') {
    window.imageCache = window.imageCache || new Map<string, boolean>();
    const cachedImages = JSON.parse(localStorage.getItem('cachedImages') || '{}');
    const cachedUrls = Object.keys(cachedImages);
    cachedUrls.forEach(url => {
      window.imageCache?.set(url, true);
    });
  }
} catch (error) {
  console.error('Error loading cached images:', error);
}

// Import the PGCard component lazily
const PGCard = lazy(() => import('./PGCard'));

// Counter variables for tracking performance metrics
let renderCounter = 0;
let imageLoadCounter = 0;
let cachedImageCounter = 0;

const PGListingPage = () => {
  // Reset counters on component mount
  useEffect(() => {
    renderCounter = 0;
    imageLoadCounter = 0;
    cachedImageCounter = 0;
    
     ('PGListingPage mounted - Counters reset');
  }, []);
  
  // Log render statistics
  useEffect(() => {
     (`Render stats - PGCards: ${renderCounter}, Images loaded: ${imageLoadCounter}, Cached images: ${cachedImageCounter}`);
  }, []);

  const [pgs, setPgs] = useState<PGData[]>([]);
  const [filteredPGs, setFilteredPGs] = useState<PGData[]>([]);
  const [hoveredPG, setHoveredPG] = useState<PGData | null>(null);
  const [selectedPG, setSelectedPG] = useState<PGData | null>(null); // Used for InfoWindow display
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { viewedPGCount, hasExceededFreeLimit, viewedPGIds, incrementViewedPGCount } = useViewedPGs();
  const freeLimit = 3; // Match the default in ViewedPGsContext (3 PGs)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTriggerType, setAuthTriggerType] = useState<'contact' | 'viewLimit' | 'viewDetails'>('viewLimit');
  const navigate = useNavigate();
  
  // Define map center based on the first PG or default to Bangalore
  const mapCenter = useMemo(() => {
    if (filteredPGs.length > 0 && filteredPGs[0].coordinates) {
      return {
        lat: filteredPGs[0].coordinates.lat,
        lng: filteredPGs[0].coordinates.lng
      };
    }
    // Default to Bangalore coordinates
    return DEFAULT_CENTER;
  }, [filteredPGs]);
  
  // Simplified PG fetching without review data
  const fetchPGsFromFirestore = useCallback(async () => {
      try {
        setLoading(true);
        const pgsRef = collection(db, 'pgs');
        const querySnapshot = await getDocs(pgsRef);
        
        const firestorePGs: PGData[] = [];
        let activeCount = 0;
        let inactiveCount = 0;
        
        querySnapshot.forEach((doc) => {
          // Convert Firestore data to PGData format
          const pgData = doc.data() as PGData;
          
          // Only include PGs with 'active' status
          if (pgData.status === 'active') {
            activeCount++;
            // Make sure the PG has coordinates for the map
            // If not, we'll use a default location for Bangalore
            if (!pgData.coordinates) {
              pgData.coordinates = {
                lat: 12.9716 + (Math.random() * 0.05 - 0.025), // Add slight randomness for display
                lng: 77.5946 + (Math.random() * 0.05 - 0.025)
              };
            }
            
            firestorePGs.push({
              ...pgData,
              id: doc.id
            });
          } else {
            inactiveCount++;
          }
        });
        
         ('==== PG LISTING STATISTICS ====');
         (`Total PGs: ${activeCount + inactiveCount}`);
         (`Active PGs: ${activeCount}`);
         (`Inactive PGs: ${inactiveCount}`);
         (`PGs with photos: ${firestorePGs.filter(pg => pg.photos && pg.photos.length > 0).length}`);
         (`Total photos to cache: ${firestorePGs.reduce((total, pg) => total + (pg.photos?.length || 0), 0)}`);
        
        // Cache the PGs data for faster loading next time
        try {
          localStorage.setItem('pgListingCache', JSON.stringify(firestorePGs));
          localStorage.setItem('pgListingCacheTimestamp', Date.now().toString());
        } catch (error) {
          console.error('Error caching PGs data:', error);
        }
        
        // Only use Firestore PGs, no demo data
        setPgs(firestorePGs);
        setFilteredPGs(firestorePGs);
      } catch (error) {
        console.error('Error fetching PGs from Firestore:', error);
        // No fallback to demo data, just show empty state
        setPgs([]);
        setFilteredPGs([]);
      } finally {
        setLoading(false);
      }
  }, []);
  
  // Check for cached PGs first, then fetch if needed
  useEffect(() => {
    const cachedPGs = localStorage.getItem('pgListingCache');
    const cacheTimestamp = localStorage.getItem('pgListingCacheTimestamp');
    const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
    
    // Use cache if it exists and is less than 15 minutes old
    if (cachedPGs && cacheAge < 15 * 60 * 1000) {
      try {
        const parsedPGs = JSON.parse(cachedPGs);
         ('Using cached PGs data');
        setPgs(parsedPGs);
        setFilteredPGs(parsedPGs);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing cached PGs:', error);
        fetchPGsFromFirestore();
      }
    } else {
      fetchPGsFromFirestore();
    }
  }, [fetchPGsFromFirestore]);
  
  // Filters are closed by default
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const location = useLocation();

    // Google Maps loading code removed
  
  // Map reference code removed
  
  // State to track the last hovered PG
  const [lastHoveredPG, setLastHoveredPG] = useState<string | null>(null);

  // Map panning function completely removed

  // Function to handle hovering over a PG card - with persistent selection
  const handlePGHover = useCallback(debounce((pg: PGData | null) => {
    if (pg) {
      // Only update if it's a different PG
      if (!hoveredPG || hoveredPG.id !== pg.id) {
         (`Hovering PG: ${pg.name} (ID: ${pg.id})`);
        setHoveredPG(pg);
        // Set selected PG
        if (!lastHoveredPG || lastHoveredPG !== pg.id) {
          setSelectedPG(pg);
          setLastHoveredPG(pg.id);
        }
      }
    } else {
      setHoveredPG(null);
    }
  }, 50), [hoveredPG, lastHoveredPG, setSelectedPG, setLastHoveredPG]); // Reduced debounce time for faster response

  // handleMapPan is now defined above handlePGHover to fix the reference error

  // State for no results message
  const [noResultsMessage, setNoResultsMessage] = useState<string>('');
  const [showNoResultsModal, setShowNoResultsModal] = useState<boolean>(false);

  // Show no results modal when filtered PGs are empty
  useEffect(() => {
    if (filteredPGs.length === 0 && !loading && pgs.length > 0) {
      setShowNoResultsModal(true);
    } else {
      setShowNoResultsModal(false);
    }
  }, [filteredPGs, loading, pgs.length]);

  // Parse URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get('filter');
    const locationParam = queryParams.get('location');
    const queryParam = queryParams.get('query');
    const latParam = queryParams.get('lat');
    const lngParam = queryParams.get('lng');
    
    let filtered = [...pgs];
    let appliedFilters = false;
    
    // Handle location search
    if (locationParam) {
      appliedFilters = true;
      const locationLower = locationParam.toLowerCase();
      
      filtered = pgs.filter(pg => {
        // Check if location matches (case insensitive)
        const locationMatch = pg.location && pg.location.toLowerCase().includes(locationLower);
        
        // Check if college name matches (with variations)
        const collegeMatch = pg.nearestCollege ? (() => {
          const collegeNameLower = pg.nearestCollege.toLowerCase();
          
          // Direct match
          if (collegeNameLower.includes(locationLower)) return true;
          
          // St. Joseph's variations
          if (locationLower.includes('joseph') || collegeNameLower.includes('joseph')) {
            const josephVariations = [
              'st joseph', 'st. joseph', 'saint joseph',
              'st josephs', 'st. josephs', 'saint josephs',
              'st joseph\'s', 'st. joseph\'s', 'saint joseph\'s',
              'joe', 'joes', 'joe\'s'
            ];
            
            // Check if any variation of Joseph is in the location parameter
            const isJosephInSearch = josephVariations.some(v => locationLower.includes(v));
            
            // Check if any variation of Joseph is in the college name
            const isJosephInCollege = josephVariations.some(v => collegeNameLower.includes(v));
            
            return isJosephInSearch && isJosephInCollege;
          }
          
          return false;
        })() : false;
        
        // Check if address contains the location
        const addressMatch = pg.address && pg.address.toLowerCase().includes(locationLower);
        
        return locationMatch || collegeMatch || addressMatch;
      });
    }
    
    // Handle query search (search by name, address, nearest college, location, amenities, etc.)
    if (queryParam) {
      appliedFilters = true;
      const query = queryParam.toLowerCase();
      filtered = pgs.filter(pg => {
        // Search in basic properties
        const basicMatch = (
          (pg.name && pg.name.toLowerCase().includes(query)) ||
          (pg.address && pg.address.toLowerCase().includes(query)) ||
          (pg.location && pg.location.toLowerCase().includes(query)) ||
          (pg.gender && pg.gender.toLowerCase().includes(query))
        );
        
        // Special handling for college names with multiple variations
        const collegeMatch = pg.nearestCollege ? (() => {
          const collegeNameLower = pg.nearestCollege.toLowerCase();
          
          // Check for exact match first
          if (collegeNameLower.includes(query)) return true;
          
          // Check for common college name variations
          // For example: "St. Joseph's", "St Joseph", "Saint Joseph", etc.
          const commonVariations = [
            // Handle St./Saint variations
            collegeNameLower.replace(/st\s*\.?\s*/i, 'saint '),
            collegeNameLower.replace(/saint\s+/i, 'st '),
            collegeNameLower.replace(/st\s*\.?\s*/i, 'st. '),
            
            // Handle with/without apostrophes
            collegeNameLower.replace(/'/g, ''),
            collegeNameLower.includes("'") ? collegeNameLower : collegeNameLower.replace(/s(\s|$)/g, "'s$1"),
            
            // Handle abbreviations (like "Joseph" to "Joe")
            collegeNameLower.replace(/joseph/i, 'joe'),
            
            // Handle "College"/"University" variations
            collegeNameLower.replace(/\s+college/i, ''),
            collegeNameLower.replace(/\s+university/i, ''),
            collegeNameLower + ' college',
            collegeNameLower + ' university'
          ];
          
          // Check if query matches any of these variations
          return commonVariations.some(variation => variation.includes(query)) ||
                 query.includes('college') || query.includes('university');
        })() : false;
        
        if (basicMatch || collegeMatch) return true;
        
        // Search in nearby places if available
        if (pg.nearbyPlaces && Array.isArray(pg.nearbyPlaces)) {
          const nearbyMatch = pg.nearbyPlaces.some(
            (place) => place.name.toLowerCase().includes(query) || place.type.toLowerCase().includes(query)
          );
          if (nearbyMatch) return true;
        }
        
        // Search in amenities - both exact and partial matches
        const amenitiesMatch = [
          // Exact matches
          query.includes('wifi') && pg.wifi,
          query.includes('food') && pg.food,
          query.includes('washing') && pg.washingMachine,
          query.includes('tv') && pg.tv,
          query.includes('parking') && pg.parking,
          query.includes('attached') && pg.washroom === 'attached',
          query.includes('fridge') && pg.fridge,
          query.includes('security') && pg.security,
          query.includes('housekeeping') && pg.housekeeping,
          // Removed non-existent properties
          
          // Common variations
          query.includes('internet') && pg.wifi,
          query.includes('meal') && pg.food,
          query.includes('laundry') && pg.washingMachine,
          query.includes('television') && pg.tv,
          query.includes('car') && pg.parking,
          query.includes('bathroom') && (pg.washroom === 'attached' || pg.washroom === 'both'),
          query.includes('refrigerator') && pg.fridge,
          query.includes('guard') && pg.security,
          query.includes('cleaning') && pg.housekeeping,
          // Removed non-existent properties
        ].some(match => match);
        
        if (amenitiesMatch) return true;
        
        // Search in room types - more comprehensive matching
        const roomMatch = [
          // Standard terms
          (query.includes('single') || query.includes('1 sharing') || query.includes('one sharing')) && pg.oneSharing?.available,
          (query.includes('double') || query.includes('2 sharing') || query.includes('two sharing')) && pg.twoSharing?.available,
          (query.includes('triple') || query.includes('3 sharing') || query.includes('three sharing')) && pg.threeSharing?.available,
          (query.includes('four') || query.includes('4 sharing')) && pg.fourSharing?.available,
          
          // Additional variations
          query.includes('solo') && pg.oneSharing?.available,
          query.includes('shared') && (pg.twoSharing?.available || pg.threeSharing?.available || pg.fourSharing?.available)
        ].some(match => match);
        
        if (roomMatch) return true;
        
        // Price-based search
        if (query.includes('cheap') || query.includes('affordable') || query.includes('budget')) {
          const prices = [
            pg.oneSharing?.available && pg.oneSharing?.price ? pg.oneSharing.price : Infinity,
            pg.twoSharing?.available && pg.twoSharing?.price ? pg.twoSharing.price : Infinity,
            pg.threeSharing?.available && pg.threeSharing?.price ? pg.threeSharing.price : Infinity,
            pg.fourSharing?.available && pg.fourSharing?.price ? pg.fourSharing.price : Infinity,
          ].filter(price => price !== Infinity);
          
          if (prices.length > 0) {
            const minPGPrice = Math.min(...prices);
            // Consider "cheap" as below 10,000
            return minPGPrice < 10000;
          }
        }
        
        // Luxury/premium search
        if (query.includes('luxury') || query.includes('premium') || query.includes('high end')) {
          return pg.rating && pg.rating >= 4.5;
        }
        
        return false;
      });
    }
    
    // Handle coordinates search
    if (latParam && lngParam) {
      appliedFilters = true;
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      
      // Find PGs within 5km radius of the given coordinates
      filtered = pgs.filter(pg => {
        if (!pg.coordinates) return false;
        
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (pg.coordinates.lat - lat) * Math.PI / 180;
        const dLng = (pg.coordinates.lng - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(pg.coordinates.lat * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Return PGs within 5km
        return distance <= 5;
      });
    }
    
    // Handle predefined filters
    if (filterParam) {
      appliedFilters = true;
      
      switch(filterParam) {
        case 'verified':
          filtered = filtered.filter(pg => pg.isVerified);
          break;
        case 'premium':
          filtered = filtered.filter(pg => pg.rating && pg.rating >= 4.5);
          break;
        case 'male':
          filtered = filtered.filter(pg => pg.gender === 'male');
          break;
        case 'female':
          filtered = filtered.filter(pg => pg.gender === 'female');
          break;
        case 'unisex':
          filtered = filtered.filter(pg => pg.gender === 'unisex');
          break;
        default:
          break;
      }
    }
    
    // Set filtered PGs
    setFilteredPGs(filtered);
    
    // Show no results message if needed
    if (appliedFilters && filtered.length === 0) {
      if (locationParam) {
        setNoResultsMessage(`We don't have any PGs in ${locationParam} yet, but we're expanding quickly! Check back soon or try another location.`);
      } else if (queryParam) {
        setNoResultsMessage(`No PGs found matching "${queryParam}". We're adding new properties every day, so check back soon!`);
      } else if (locationParam) {
        setNoResultsMessage(`We don't have any PGs near "${locationParam}" yet. We're expanding to new areas every week, so check back soon!`);
      } else if (latParam && lngParam) {
        setNoResultsMessage(`No PGs found in this area. We're expanding to new neighborhoods every week!`);
      } else {
        setNoResultsMessage("We couldn't find any PGs matching your filters. Try adjusting your search criteria or check back later as we add new properties daily.");
      }
    } else {
      setNoResultsMessage(null);
    }
    
    // Keep filters closed by default, even when URL parameters are applied
    // User can click the filter button to see what filters are active
    
    // Map center update code removed
  }, [location.search, pgs]);
  
  // Fetch PGs on component mount
  useEffect(() => {
    setLoading(true);
    
    const fetchPGs = async () => {
      try {
        const pgsCollection = collection(db, 'pgs');
        const pgsSnapshot = await getDocs(pgsCollection);
        // Get all PGs from Firestore
        const pgsList = pgsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PGData[];
        
        // Filter to only include PGs with 'active' status
        const activePGs = pgsList.filter(pg => pg.status === 'active');
        
        if (activePGs.length > 0) {
          
          // Process PGs to ensure they all have coordinates
          const processedPGs = await Promise.all(
            activePGs.map(async (pg) => {
              // Mark all PGs as verified by default
              const updatedPg = { ...pg, isVerified: true };
              
              // If PG doesn't have coordinates but has location, geocode it
              if (!updatedPg.coordinates && updatedPg.location) {
                try {
                   (`Geocoding location for PG: ${updatedPg.name}`);
                  const coordinates = await getCoordinatesFromLocationName(updatedPg.location);
                  return { ...updatedPg, coordinates };
                } catch (error) {
                  console.error(`Failed to geocode location for PG: ${updatedPg.name}`, error);
                  // Add default coordinates for Bangalore with slight randomness if geocoding fails
                  return { 
                    ...updatedPg, 
                    coordinates: {
                      lat: 12.9716 + (Math.random() * 0.05 - 0.025),
                      lng: 77.5946 + (Math.random() * 0.05 - 0.025)
                    }
                  };
                }
              }
              return updatedPg;
            })
          );
          
          // Cache the PGs data
          try {
            localStorage.setItem('pgListingCache', JSON.stringify(processedPGs));
            localStorage.setItem('pgListingCacheTimestamp', Date.now().toString());
          } catch (error) {
            console.error('Error caching PGs data:', error);
          }
          
          setPgs(processedPGs);
          setFilteredPGs(processedPGs);
        } else {
          setPgs([]);
          setFilteredPGs([]);
        }
      } catch (error) {
        console.error('Error fetching PGs:', error);
        // Show empty state if there's an error
        setPgs([]);
        setFilteredPGs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPGs();
  }, []);

  // Debounced filter function to prevent excessive filtering
  const debouncedFilter = useCallback(
    debounce((filters: any) => {
       ('Applying filters with debounce');
      let filtered = [...pgs];
      
      // Apply actual filtering logic
      if (filters.location && filters.location.trim() !== '') {
        const locationLower = filters.location.toLowerCase();
        filtered = filtered.filter(pg => 
          (pg.location && pg.location.toLowerCase().includes(locationLower)) || 
          (pg.address && pg.address.toLowerCase().includes(locationLower)) ||
          (pg.location && pg.location.toLowerCase().includes(locationLower))
        );
      }
      
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        filtered = filtered.filter(pg => {
          const pgMinPrice = getMinPrice(pg);
          return pgMinPrice >= minPrice && pgMinPrice <= maxPrice;
        });
      }
      
      if (filters.gender && filters.gender !== 'all') {
        filtered = filtered.filter(pg => pg.gender === filters.gender);
      }
      
      // Filter by amenities
      if (filters.amenities) {
        if (filters.amenities.wifi) {
          filtered = filtered.filter(pg => pg.wifi);
        }
        if (filters.amenities.food) {
          filtered = filtered.filter(pg => pg.food);
        }
        if (filters.amenities.tv) {
          filtered = filtered.filter(pg => pg.tv);
        }
        if (filters.amenities.washingMachine) {
          filtered = filtered.filter(pg => pg.washingMachine);
        }
        if (filters.amenities.attachedBathroom) {
          filtered = filtered.filter(pg => pg.washroom === 'attached');
        }
      }
      
      // Filter by room type
      if (filters.roomType) {
        if (filters.roomType.single && !filters.roomType.double && !filters.roomType.triple) {
          filtered = filtered.filter(pg => pg.singleRoomPrice);
        } else if (!filters.roomType.single && filters.roomType.double && !filters.roomType.triple) {
          filtered = filtered.filter(pg => pg.doubleRoomPrice);
        } else if (!filters.roomType.single && !filters.roomType.double && filters.roomType.triple) {
          filtered = filtered.filter(pg => pg.tripleRoomPrice);
        } else if (filters.roomType.single && filters.roomType.double && !filters.roomType.triple) {
          filtered = filtered.filter(pg => pg.singleRoomPrice || pg.doubleRoomPrice);
        } else if (filters.roomType.single && !filters.roomType.double && filters.roomType.triple) {
          filtered = filtered.filter(pg => pg.singleRoomPrice || pg.tripleRoomPrice);
        } else if (!filters.roomType.single && filters.roomType.double && filters.roomType.triple) {
          filtered = filtered.filter(pg => pg.doubleRoomPrice || pg.tripleRoomPrice);
        }
        // If all or none selected, don't filter
      }
      
      setFilteredPGs(filtered);
      setShowNoResultsModal(filtered.length === 0);
      setNoResultsMessage(
        filtered.length === 0 
          ? `We couldn't find any PGs matching your filters. Try adjusting your search criteria or check back later as we add new properties daily.` 
          : ''
      );
    }, 300),
    [pgs]
  );
  
  // Filter PGs based on criteria - wrapper function that calls the debounced version
  const handleFilter = (filters: any) => {
    let filtered = [...pgs];
    
    // Apply filters
    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(pg => pg.gender === filters.gender);
    }
    
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(pg => pg.location === filters.location);
    }
    
    if (filters.minPrice && filters.maxPrice) {
      filtered = filtered.filter(pg => {
        const prices = [
          pg.oneSharing.available && pg.oneSharing.price ? pg.oneSharing.price : Infinity,
          pg.twoSharing.available && pg.twoSharing.price ? pg.twoSharing.price : Infinity,
          pg.threeSharing.available && pg.threeSharing.price ? pg.threeSharing.price : Infinity,
          pg.fourSharing.available && pg.fourSharing.price ? pg.fourSharing.price : Infinity,
        ].filter(price => price !== Infinity);
        
        if (prices.length === 0) return false;
        const minPGPrice = Math.min(...prices);
        return minPGPrice >= filters.minPrice && minPGPrice <= filters.maxPrice;
      });
    }
    
    if (filters.roomType) {
      filtered = filtered.filter(pg => {
        // Type-safe approach for checking room type availability
        switch(filters.roomType) {
          case 'oneSharing':
            return pg.oneSharing.available === true;
          case 'twoSharing':
            return pg.twoSharing.available === true;
          case 'threeSharing':
            return pg.threeSharing.available === true;
          case 'fourSharing':
            return pg.fourSharing.available === true;
          default:
            return true;
        }
      });
    }
    
    if (filters.minRating) {
      filtered = filtered.filter(pg => {
        return pg.rating ? pg.rating >= filters.minRating : false;
      });
    }
    
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(pg => {
        return filters.amenities.every((amenity: string) => {
          switch (amenity) {
            case 'wifi': return pg.wifi;
            case 'food': return pg.food;
            case 'washingMachine': return pg.washingMachine;
            case 'tv': return pg.tv;
            case 'parking': return pg.parking;
            case 'attachedWashroom': return pg.washroom === 'attached' || pg.washroom === 'both';
            default: return true;
          }
        });
      });
    }
    
    setFilteredPGs(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilteredPGs(pgs);
    setShowNoResultsModal(false);
    setIsFilterOpen(false); // Close the filter panel when resetting
  };

  // Get minimum price from a PG
  const getMinPrice = (pg: PGData) => {
    const prices: number[] = [];
    if (pg.oneSharing?.available && pg.oneSharing.price) prices.push(pg.oneSharing.price);
    if (pg.twoSharing?.available && pg.twoSharing.price) prices.push(pg.twoSharing.price);
    if (pg.threeSharing?.available && pg.threeSharing.price) prices.push(pg.threeSharing.price);
    if (pg.fourSharing?.available && pg.fourSharing.price) prices.push(pg.fourSharing.price);
    if (pg.fiveSharing?.available && pg.fiveSharing.price) prices.push(pg.fiveSharing.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Handle PG card click - allow viewing 3 PGs without login, then require authentication
  const handlePGClick = (pg: PGData) => {
    // Track PG view for analytics
    try {
      trackPgView(pg.id, pg.name);
    } catch (error) {
      console.error('Error tracking PG view:', error);
    }
    
    // Create SEO-friendly URL
    const pgUrl = createPgUrl(pg.name, pg.id);
    
    // Check if user is authenticated
    if (!currentUser) {
      // Increment the viewed PG count if this PG hasn't been viewed before
      incrementViewedPGCount(pg.id);
      
      // Check if user has exceeded the free limit (3 PGs)
      if (viewedPGCount >= freeLimit) {
        // Show auth modal with viewLimit trigger type
        setAuthTriggerType('viewLimit');
        setShowAuthModal(true);
        return;
      }
    }
    
    // Navigate to PG details page if authenticated or within free limit
    navigate(pgUrl);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navbar />
        <div className="container h-screen mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500 border-opacity-50"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Modern Hero section inspired by reference - reduced height */}
        <div className="hero-section relative mb-6 mt-4 border border-gray-100 rounded-3xl overflow-visible">
          {/* Simple, clean background */}
          <div className="absolute inset-0 z-0 bg-white overflow-hidden rounded-3xl">
            {/* Subtle accent elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-100 opacity-50"></div>
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-primary-50 opacity-50"></div>
            
            {/* Decorative curved arrow */}
            <div className="absolute top-20 left-[40%] w-24 h-24 opacity-30 hidden lg:block">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20,50 Q40,20 60,50 T100,50" stroke="#14898A" strokeWidth="4" fill="none" />
                <path d="M90,40 L100,50 L90,60" stroke="#14898A" strokeWidth="4" fill="none" />
              </svg>
            </div>
          </div>
          
          {/* Mobile layout: Side-by-side layout like desktop */}
          <div className="md:hidden container mx-auto relative z-10 py-6 px-4 overflow-hidden">
            <div className="flex flex-row">
              {/* Content section - full width on small screens, half on medium+ */}
              <div className="z-10 relative w-full sm:w-1/2 pr-2">
                {/* Brand tag */}
                <div className="text-xs font-semibold text-primary-600 mb-3 tracking-widest uppercase inline-block px-2 py-1 rounded-full font-mono border border-primary-100 bg-white">SHELTERLY</div>
                
                {/* Main heading */}
                <h1 className="mb-2 leading-tight text-left">
                  <span className="block text-black font-sans text-2xl font-bold tracking-tight">Because</span>
                  <span className="flex items-baseline">
                    <span className="text-black font-sans text-2xl font-bold tracking-tight"> </span>
                    <span className="text-primary-500 font-sans text-2xl font-bold tracking-tight">Finding a PG </span>
                  </span>
                  <span className="block text-black font-sans text-2xl font-bold tracking-tight">Shouldn’t feel Like a Job</span>
                </h1>
                
                {/* Subtitle */}
                <h2 className="font-sans text-xs text-gray-600 mb-3 leading-relaxed tracking-wide text-left">
                Redefining the PG experience—verified, simplified, personalized.
                </h2>
              
                
                {/* Stats section - grid for small screens, flex for larger */}
                <div className="grid grid-cols-3 sm:flex sm:items-center sm:space-x-3 mt-3 border-t border-gray-100 pt-3 w-full">
                  <div className="text-center p-2">
                    <div className="text-lg font-bold text-gray-900">400+</div>
                    <div className="text-xs text-gray-500">Verified Beds</div>
                  </div>
                  <div className="text-center p-2">
                    <div className="text-lg font-bold text-gray-900">4.8</div>
                    <div className="text-xs text-gray-500">User Rating</div>
                  </div>
                  <div className="text-center p-2">
                    <div className="text-lg font-bold text-gray-900">24h</div>
                    <div className="text-xs text-gray-500">Support</div>
                  </div>
                </div>
              </div>
              
              {/* Listing image - right side with responsive positioning - hidden on small screens */}
              <div className="relative w-1/2 hidden sm:flex justify-center items-center overflow-hidden">
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[400px] h-[120px] sm:w-[380px] sm:h-[180px] bg-primary-100 opacity-50 rounded-full -z-10"></div>
                <img 
                  src={listingImage}
                  alt="PG Listing" 
                  className="absolute max-w-[450px] sm:max-w-[480px] object-contain z-10"
                  loading="eager"
                />
              </div>
            </div>
          </div>
          
          {/* Desktop layout: Content on left, image on right - inspired by reference */}
          <div className="hidden md:flex container mx-auto flex-row items-center relative z-10 py-8 px-16">
            {/* Content - Desktop */}
            <div className="w-1/2 z-10 pr-10">
              {/* Brand tag */}
              <div className="text-sm font-semibold text-primary-600 mb-6 tracking-widest uppercase inline-block px-4 py-1.5 rounded-full font-mono border border-primary-100 bg-white">SHELTERLY</div>
              
              {/* Main heading */}
              <h1 className="mb-4 leading-tight text-left">
                <span className="block text-black font-sans text-4xl lg:text-5xl font-bold tracking-tight">Because</span>
                <span className="flex items-baseline">
                  <span className="text-black font-sans text-4xl lg:text-5xl font-bold tracking-tight"> </span>
                  <span className="text-primary-500 font-sans text-4xl lg:text-5xl font-bold tracking-tight ml-1">Finding a PG </span>
                </span>
                <span className="block text-black font-sans text-4xl lg:text-5xl font-bold tracking-tight">Shouldn't Feel Like a Job</span>
              </h1>
              
              {/* Subtitle */}
              <h2 className="font-sans text-base text-gray-600 mb-6 leading-relaxed tracking-wide text-left max-w-lg">
                Redefining the PG experience—verified, simplified, personalized.
              </h2>
              
              
              {/* Stats section */}
              <div className="flex items-center space-x-12 mt-8 border-t border-gray-100 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">400+</div>
                  <div className="text-sm text-gray-500">Verified Beds</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-500">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24h</div>
                  <div className="text-sm text-gray-500">Support</div>
                </div>
              </div>
            </div>
            
            {/* Listing image - Desktop - increased size */}
            <div className="w-1/2 absolute z-0 -right-0 top-80">
              <div className="relative w-full flex justify-center items-center">
                {/* Simple background circle - enlarged */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary-100 opacity-50 rounded-full -z-10"></div>
                
                {/* Image with clean styling - further increased size */}
                <img 
                  src={listingImage} 
                  alt="PG Listing" 
                  className="absolute max-w-[900px] object-contain z-10 -right-1/2 -translate-x-1/2"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Hot PGs Banner - Shantinagar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg mb-8 mx-2 sm:mx-0"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -inset-[10px] rotate-12">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-4 w-full bg-white opacity-20 my-8" 
                  style={{ transform: `translateX(${i * 15}px)` }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Static accent element instead of pulse */}
          <div 
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-yellow-400 opacity-40 blur-xl"
          />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between p-3 sm:p-6 z-10">
            <div className="flex-1 mb-3 sm:mb-0">
              {/* Mobile-optimized layout */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                {/* Premium "Filling Fast" badge with border animation - optimized for mobile */}
                <div className="self-start sm:mr-2 relative">
                  <div className="relative inline-block">
                    {/* Animated border effect */}
                    <motion.div 
                      className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 rounded-md z-0"
                      animate={{ 
                        background: [
                          'linear-gradient(90deg, #ef4444, #eab308, #ef4444)',
                          'linear-gradient(180deg, #ef4444, #eab308, #ef4444)',
                          'linear-gradient(270deg, #ef4444, #eab308, #ef4444)',
                          'linear-gradient(360deg, #ef4444, #eab308, #ef4444)'
                        ]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Badge content - smaller on mobile */}
                    <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-primary-900 text-[10px] sm:text-xs font-bold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md uppercase tracking-wide flex items-center relative z-10 overflow-hidden border border-transparent shadow-md whitespace-nowrap">
                      {/* Shine effect */}
                      <motion.div 
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 opacity-30"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      />
                      
                      {/* Fire icon - smaller on mobile */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-red-600">
                        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545a3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
                      </svg>
                      
                      <span className="relative z-10 font-extrabold">FILLING FAST</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-base sm:text-xl">PGs in Shanti Nagar are in high demand!</h3>
                  <p className="text-primary-50 text-xs sm:text-sm mt-1">
                    Don't miss out on premium accommodations in this popular area. Book your visit today!
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-primary-600 font-medium px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 whitespace-nowrap"
              onClick={() => handleFilter({ location: 'Shanti Nagar' })}
            >
              <span>View Shanti Nagar PGs</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
          
          {/* Countdown timer (optional) */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-700">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 60 * 60 * 2, ease: 'linear' }} // 2 hours countdown
              className="h-full bg-yellow-400"
            />
          </div>
        </motion.div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
         
          
          <div className="flex items-center mt-4 md:mt-0 space-x-4">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <FiFilter className="mr-2 text-primary-500" />
              <span>Filters</span>
            </button>
            
            <div className="relative">
              <select 
                className="appearance-none bg-white px-4 py-2 pr-8 rounded-full shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
                onChange={(e) => {
                  // Sort logic here
                  const sortedPGs = [...filteredPGs];
                  if (e.target.value === 'price-low') {
                    sortedPGs.sort((a, b) => getMinPrice(a) - getMinPrice(b));
                  } else if (e.target.value === 'price-high') {
                    sortedPGs.sort((a, b) => getMinPrice(b) - getMinPrice(a));
                  } else if (e.target.value === 'rating') {
                    sortedPGs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                  }
                  setFilteredPGs(sortedPGs);
                }}
              >
                <option value="popularity">Sort By: Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter panel */}
        {isFilterOpen && (
          <PGFilter onFilter={handleFilter} onReset={resetFilters} />
        )}
        
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* PG Listings */}
          <div className="w-full space-y-4 sm:space-y-6 px-3 sm:px-0">
            {filteredPGs.length === 0 ? (
              <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-teal-50/20 to-primary-100/20 min-h-[60vh]">
                {/* 3D model - only shown on desktop/laptop */}
                <div className="pointer-events-none hidden md:block md:scale-100 origin-center">
                 
                </div>
                
                {/* Static content for mobile */}
                <div className="block md:hidden absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-b from-teal-50 to-primary-50 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Grid pattern background */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Message card */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2
                            bg-white/30 backdrop-blur-xl p-3 sm:p-6 rounded-[16px] md:rounded-[30px] 
                            shadow-lg w-[80%] max-w-[240px] sm:max-w-md text-center z-10 
                            border border-primary-500 pointer-events-auto flex flex-col items-center">
                  
                  {/* Wavy design element at top of card */}
                  <div className="absolute top-0 left-0 w-full h-4 sm:h-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-8 sm:h-12 bg-primary-500/20 rounded-t-[16px] md:rounded-t-[30px]"></div>
                    <svg className="absolute top-0 left-0 w-full" height="8" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path fill="#0694a2" fillOpacity="0.2" d="M0,0 C30,10 70,0 100,10 L100,0 Z" />
                    </svg>
                  </div>
                  
                  {/* Message content */}
                  <h2 className="flex justify-center text-lg sm:text-2xl font-bold text-primary-700 mt-4 sm:mt-5 mb-1 sm:mb-2">No PGs Found</h2>
                  <p className="text-xs sm:text-base text-gray-800 mb-3 sm:mb-4">Adjust your filters to see more results</p>
                  
                  {/* Reset filters button */}
                  <button 
                    onClick={resetFilters}
                    className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-primary-500/80 text-white border border-primary-600 
                              rounded-[15px] sm:rounded-[20px] hover:bg-primary-600 transition-all 
                              shadow-md hover:shadow-xl transform 
                              text-sm sm:text-base font-medium mx-auto mb-3"
                  >
                    <FiRefreshCw className="mr-2" />
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              filteredPGs.map(pg => (
                <Suspense key={pg.id} fallback={<div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>}>
                  <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mb-5 sm:mb-0">
                    <PGCard
                      pg={pg}
                      onClick={handlePGClick}
                      onHover={handlePGHover}
                      isHovered={hoveredPG?.id === pg.id}
                    />
                  </div>
                </Suspense>
              ))
            )}
          </div>
          
          {/* Interactive Neighborhood Visualization - Replaces the map */}
          {filteredPGs.length > 0 && (
            <div className="w-full hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-150px)] bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-auto">
                  <h2 className="text-xl font-bold text-primary-700 mb-4">Neighborhood Insights</h2>
                  
                  {/* Neighborhood clusters */}
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Popular Areas</h3>
                    <div className="flex flex-wrap gap-3">
                      {Array.from(new Set(filteredPGs.map(pg => pg.location))).map(location => (
                        <div 
                          key={location} 
                          className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-300 ${hoveredPG && hoveredPG.location === location ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          onMouseEnter={() => {
                            // Find first PG in this location and highlight it
                            const firstPGInLocation = filteredPGs.find(pg => pg.location === location);
                            if (firstPGInLocation) setHoveredPG(firstPGInLocation);
                          }}
                          onMouseLeave={() => setHoveredPG(null)}
                        >
                          {location} ({filteredPGs.filter(pg => pg.location === location).length})
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Highlighted PG card */}
                  {hoveredPG && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-primary-500 transition-all duration-300">
                      <h3 className="font-bold text-primary-700">
                        {hoveredPG.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {hoveredPG.address}
                      </p>
                      <div className="flex items-center text-sm">
                        <span className="font-semibold text-primary-600">
                          ₹{getMinPrice(hoveredPG).toLocaleString()}/mo
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-700">
                          {hoveredPG.gender === 'male' ? 'Boys' : 
                           hoveredPG.gender === 'female' ? 'Girls' : 'Unisex'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Proximity visualization - Dynamic based on selected PG */}
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">
                      {hoveredPG ? 
                        `Points of Interest near ${hoveredPG.name}` : 
                        'Nearby Points of Interest'}
                    </h3>
                    <div className="relative h-[300px] bg-gray-50 rounded-lg p-4 overflow-hidden">
                      {/* Central point representing the current PG */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center z-10">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {hoveredPG ? hoveredPG.name.substring(0, 2) : 'PG'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Dynamic points of interest based on selected PG */}
                      {(() => {
                        // Get the selected PG or default to the first one
                        const selectedPg = hoveredPG ? 
                          hoveredPG : 
                          (filteredPGs.length > 0 ? filteredPGs[0] : null);
                          
                        if (!selectedPg) return null;
                        
                        // Generate pseudo-random but consistent points of interest based on PG name/id
                        const seed = selectedPg.id.charCodeAt(0) + (selectedPg.name.length * 7);
                        const randomize = (min: number, max: number, offset = 0) => {
                          const val = ((seed + offset) % (max - min)) + min;
                          return val.toFixed(1);
                        };
                        
                        // Determine nearby colleges based on nearestCollege property
                        const college = selectedPg.nearestCollege || 
                          ['IIT', 'Delhi University', 'Amity', 'AIIMS', 'JNU'][seed % 5];
                        
                        // Generate consistent but different distances for each PG
                        const collegeDistance = randomize(0.5, 2.5, 1);
                        const parkDistance = randomize(0.3, 1.5, 2);
                        const metroDistance = randomize(0.8, 3.0, 3);
                        const marketDistance = randomize(0.2, 1.0, 4);
                        
                        return (
                          <>
                            {/* College POI */}
                            <div className="absolute top-[30%] left-[20%] transform -translate-x-1/2 -translate-y-1/2">
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 bg-blue-500 rounded-full mb-1"></div>
                                <span className="text-xs text-gray-700">{college}</span>
                                <span className="text-xs text-gray-500">{collegeDistance} km</span>
                              </div>
                            </div>
                            
                            {/* Park POI */}
                            <div className="absolute top-[40%] right-[25%] transform -translate-x-1/2 -translate-y-1/2">
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full mb-1"></div>
                                <span className="text-xs text-gray-700">
                                  {['Central Park', 'Green Garden', 'City Park', 'Eco Park'][seed % 4]}
                                </span>
                                <span className="text-xs text-gray-500">{parkDistance} km</span>
                              </div>
                            </div>
                            
                            {/* Metro POI */}
                            <div className="absolute bottom-[30%] left-[35%] transform -translate-x-1/2 -translate-y-1/2">
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 bg-yellow-500 rounded-full mb-1"></div>
                                <span className="text-xs text-gray-700">
                                  {['Metro Station', 'Subway', 'City Metro', 'Rail Link'][seed % 4]}
                                </span>
                                <span className="text-xs text-gray-500">{metroDistance} km</span>
                              </div>
                            </div>
                            
                            {/* Market POI */}
                            <div className="absolute bottom-[20%] right-[30%] transform -translate-x-1/2 -translate-y-1/2">
                              <div className="flex flex-col items-center">
                                <div className="w-6 h-6 bg-red-500 rounded-full mb-1"></div>
                                <span className="text-xs text-gray-700">
                                  {['Local Market', 'Shopping Mall', 'Grocery Store', 'Supermarket'][seed % 4]}
                                </span>
                                <span className="text-xs text-gray-500">{marketDistance} km</span>
                              </div>
                            </div>
                            
                            {/* Connection lines */}
                            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                              <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="#CBD5E0" strokeWidth="2" strokeDasharray="5,5" />
                              <line x1="50%" y1="50%" x2="75%" y2="40%" stroke="#CBD5E0" strokeWidth="2" strokeDasharray="5,5" />
                              <line x1="50%" y1="50%" x2="35%" y2="70%" stroke="#CBD5E0" strokeWidth="2" strokeDasharray="5,5" />
                              <line x1="50%" y1="50%" x2="70%" y2="80%" stroke="#CBD5E0" strokeWidth="2" strokeDasharray="5,5" />
                            </svg>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* PG density visualization */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-3">PG Availability</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Gender Distribution</h4>
                        <div className="flex h-8 rounded-lg overflow-hidden">
                          {filteredPGs.length > 0 && (
                            <>
                              <div 
                                className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ 
                                  width: `${Math.max(5, filteredPGs.filter(pg => pg.gender === 'male').length / filteredPGs.length * 100)}%` 
                                }}
                              >
                                {Math.round(filteredPGs.filter(pg => pg.gender === 'male').length / filteredPGs.length * 100)}%
                              </div>
                              <div 
                                className="bg-pink-500 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ 
                                  width: `${Math.max(5, filteredPGs.filter(pg => pg.gender === 'female').length / filteredPGs.length * 100)}%` 
                                }}
                              >
                                {Math.round(filteredPGs.filter(pg => pg.gender === 'female').length / filteredPGs.length * 100)}%
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>Boys</span>
                          <span>Girls</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Price Range</h4>
                        <div className="relative pt-5">
                          <div className="h-2 bg-gray-200 rounded-full">
                            {filteredPGs.length > 0 && (
                              <div 
                                className="absolute h-2 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                                style={{ 
                                  left: '10%', 
                                  width: '80%' 
                                }}
                              ></div>
                            )}
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            {filteredPGs.length > 0 ? (
                              <>
                                <span>₹{Math.min(...filteredPGs.map(pg => getMinPrice(pg) || 0)).toLocaleString()}</span>
                                <span>₹{Math.max(...filteredPGs.map(pg => getMinPrice(pg) || 0)).toLocaleString()}</span>
                              </>
                            ) : (
                              <>
                                <span>₹0</span>
                                <span>₹0</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Search in nearby locations */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Explore Nearby Areas</h3>
                    <p className="text-sm text-gray-600 mb-3">Pro tip: Try searching for areas like "Koramangala" or colleges like "St. Joseph's" for best results.</p>
                    <div className="flex flex-wrap gap-2">
                      {['Koramangala', 'Indiranagar', 'HSR Layout', 'BTM Layout', 'Electronic City'].map(loc => (
                        <button 
                          key={loc}
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          onClick={() => handleFilter({ location: loc })}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Original Map component is commented out below
          {filteredPGs.length > 0 && (
            <div className="w-full hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-150px)] bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-white rounded-lg shadow-md p-0 h-full overflow-hidden">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '0.5rem'
                      }}
                      zoom={15}
                      center={mapCenter}
                      mapContainerClassName="w-full h-full"
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        scrollwheel: true,
                        maxZoom: 17,
                        minZoom: 12,
                        gestureHandling: 'greedy',
                        clickableIcons: false,
                        disableDoubleClickZoom: true,
                        draggableCursor: 'default',
                        draggingCursor: 'grabbing',
                        styles: [
                          // Map styles removed for brevity
                        ]
                      }}
                      onLoad={onMapLoad}
                    >
                      {filteredPGs.map(pg => {
                        // Marker implementation removed for brevity
                      })}
                    </GoogleMap>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary-500"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          */}
        </div>
      </main>
      
      <Footer />
      
      {/* Auth Modal */}
      <QuirkyNewAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        viewedPGCount={viewedPGCount}
        redirectPath="/pg-listing"
        triggerType="viewLimit"
      />
      
      {/* No Results Modal */}
      <NoPGsFoundScreen 
        isOpen={showNoResultsModal}
        message={noResultsMessage || "We couldn't find any PGs matching your filters. Try adjusting your search criteria or check back later as we add new properties daily."}
        onResetFilters={resetFilters}
        onClose={() => setShowNoResultsModal(false)}
      />
    </div>
  );
};

export default PGListingPage;
