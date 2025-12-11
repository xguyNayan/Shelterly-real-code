import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCards } from 'swiper/modules';
import { FiHome, FiHeart, FiX, FiInfo, FiMapPin, FiStar, FiWifi, FiCoffee, FiImage, FiUser, FiHelpCircle, FiPhone, FiList, FiCheck } from 'react-icons/fi';
import ThankYouModal from '../Callback/ThankYouModal';
import { useWishlist } from '../../contexts/WishlistContext';
import { PGData } from '../PGListing/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ShelterSwipeTutorial from './ShelterSwipeTutorial';
import { useAuth } from '../../contexts/AuthContext';
import { addCallbackRequest } from '../../firebase/callbackService';
import { useNavigate } from 'react-router-dom';
import { trackPGView } from '../../utils/analytics';
import { trackShelterSwipe, trackEvent, initializeSession } from '../../services/analyticsService';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';

// Add CSS to hide scrollbars but keep functionality
const globalStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Helper function to format price
const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  if (numPrice >= 1000) {
    return `${(numPrice / 1000).toFixed(1)}K/month`;
  }
  return `${numPrice}/month`;
};

// Helper function to get minimum price
const getMinPrice = (pg: PGData) => {
  const prices: number[] = [];
  if (pg.oneSharing?.available && pg.oneSharing.price) prices.push(parseInt(pg.oneSharing.price.toString()));
  if (pg.twoSharing?.available && pg.twoSharing.price) prices.push(parseInt(pg.twoSharing.price.toString()));
  if (pg.threeSharing?.available && pg.threeSharing.price) prices.push(parseInt(pg.threeSharing.price.toString()));
  if (pg.fourSharing?.available && pg.fourSharing.price) prices.push(parseInt(pg.fourSharing.price.toString()));
  if (pg.fiveSharing?.available && pg.fiveSharing.price) prices.push(parseInt(pg.fiveSharing.price.toString()));
  
  return prices.length > 0 ? Math.min(...prices) : 0;
};

// Constants for batch loading
const INITIAL_BATCH_SIZE = 10;
const NEXT_BATCH_SIZE = 5;

// Helper function to get next batch of PGs
const getNextBatch = (allPgs: PGData[], startIndex: number, batchSize: number) => {
  return allPgs.slice(startIndex, startIndex + batchSize);
};

// Enhanced image cache with loading status tracking
const imageCache = new Map<string, { loaded: boolean, image: HTMLImageElement }>();

// Helper function to preload images with improved caching and priority loading
const preloadPGImages = (pgs: PGData[], priorityIndex = 0) => {
  // First prioritize loading the first visible PG's main image
  if (pgs.length > priorityIndex && pgs[priorityIndex].photos && pgs[priorityIndex].photos.length > 0) {
    const priorityUrl = pgs[priorityIndex].photos[0].url;
    if (priorityUrl && !imageCache.has(priorityUrl)) {
      const img = new Image();
      // Use fetchPriority attribute for modern browsers
      (img as any).fetchPriority = 'high'; // Type assertion for newer browsers
      imageCache.set(priorityUrl, { loaded: false, image: img });
      
      img.onload = () => {
        imageCache.set(priorityUrl, { loaded: true, image: img });
        // Force re-render to show the loaded image
        // This is a hack to force React to re-render when the image loads
        document.dispatchEvent(new CustomEvent('imageLoaded', { detail: { url: priorityUrl } }));
        
        // Store in browser cache for persistence
        try {
          const cachedImages = JSON.parse(localStorage.getItem('cachedImages') || '{}');
          cachedImages[priorityUrl] = true;
          localStorage.setItem('cachedImages', JSON.stringify(cachedImages));
        } catch (error) {
          console.error('Error caching image URL:', error);
        }
      };
      
      img.src = priorityUrl;
    }
  }
  
  // Then load the rest of the images with normal priority
  pgs.forEach((pg, index) => {
    // Skip the priority image we already loaded
    if (index === priorityIndex) return;
    
    if (pg.photos && pg.photos.length > 0) {
      // Load main image first, then others
      const mainUrl = pg.photos[0].url;
      if (!imageCache.has(mainUrl)) {
        const img = new Image();
        imageCache.set(mainUrl, { loaded: false, image: img });
        
        img.onload = () => {
          imageCache.set(mainUrl, { loaded: true, image: img });
          // Store in browser cache
          try {
            const cachedImages = JSON.parse(localStorage.getItem('cachedImages') || '{}');
            cachedImages[mainUrl] = true;
            localStorage.setItem('cachedImages', JSON.stringify(cachedImages));
          } catch (error) {
            console.error('Error caching image URL:', error);
          }
        };
        
        img.src = mainUrl;
      }
      
      // Load other images with lower priority and delayed
      setTimeout(() => {
        pg.photos.slice(1).forEach(photo => {
          if (!imageCache.has(photo.url)) {
            const img = new Image();
            img.loading = 'lazy'; // Use browser's lazy loading
            imageCache.set(photo.url, { loaded: false, image: img });
            
            img.onload = () => {
              imageCache.set(photo.url, { loaded: true, image: img });
            };
            
            img.src = photo.url;
          }
        });
      }, 1000); // Delay secondary images loading
    }
  });
};

// Check if an image is cached and loaded
const isImageLoaded = (url?: string): boolean => {
  if (!url) return false;
  return imageCache.has(url) && imageCache.get(url)?.loaded === true;
};

// Fallback function to get image URL
const getImageUrl = (pg: PGData): string => {
  if (pg.photos && pg.photos.length > 0 && pg.photos[0].url) {
    return pg.photos[0].url;
  }
  return 'https://via.placeholder.com/400x500?text=No+Image';
};

// Helper function to get cached PG data with improved caching strategy
const getCachedPGData = () => {
  const cached = localStorage.getItem('cachedPGs');
  if (cached) {
    try {
      const parsedData = JSON.parse(cached);
      const cacheTime = localStorage.getItem('pgsCacheTime');
      // Cache is valid for 24 hours for better offline support
      if (cacheTime && Date.now() - parseInt(cacheTime) < 24 * 3600000) {
        return parsedData;
      }
    } catch (error) {
      console.error('Error parsing cached PGs:', error);
    }
  }
  return null;
};

// Initialize image cache from localStorage on load
try {
  const cachedImages = JSON.parse(localStorage.getItem('cachedImages') || '{}');
  Object.keys(cachedImages).forEach(url => {
    if (!imageCache.has(url)) {
      const img = new Image();
      img.src = url;
      imageCache.set(url, { loaded: true, image: img });
    }
  });
   (`Loaded ${Object.keys(cachedImages).length} cached image URLs from localStorage`);
} catch (error) {
  console.error('Error loading cached images:', error);
}

// Helper function to cache PG data with compression
const cachePGData = (pgs: PGData[]) => {
  try {
    // Only store essential data to reduce cache size
    const essentialData = pgs.map(pg => ({
      id: pg.id,
      name: pg.name,
      address: pg.address,
      location: pg.location,
      gender: pg.gender,
      photos: pg.photos?.map(photo => ({ url: photo.url })) || [],
      oneSharing: pg.oneSharing,
      twoSharing: pg.twoSharing,
      threeSharing: pg.threeSharing,
      fourSharing: pg.fourSharing,
      fiveSharing: pg.fiveSharing,
      wifi: pg.wifi,
      food: pg.food,
      washingMachine: pg.washingMachine,
      tv: pg.tv,
      parking: pg.parking,
      washroom: pg.washroom,
      coordinates: pg.coordinates,
      isVerified: pg.isVerified
    }));
    
    localStorage.setItem('cachedPGs', JSON.stringify(essentialData));
    localStorage.setItem('pgsCacheTime', Date.now().toString());
     (`Cached ${essentialData.length} PGs with optimized data structure`);
  } catch (error) {
    console.error('Error caching PGs:', error);
  }
};

// Array of professional yet engaging messages to display randomly
const flirtyMessages = [
  " Find your ideal living space with just a swipe to the right ",
  " This accommodation could be the perfect match for your needs ",
  " Discover your new home by swiping right on properties you like ",
  " Looking for quality accommodation? This might be the one ",
  " Swipe right to add this property to your consideration list ",
  " This residence offers the amenities you've been searching for ",
  " Premium living space available - swipe right to save ",
  " Imagine the convenience of living here - swipe right to save ",
  " This property meets your search criteria - consider adding it to your list "
];

const ShelterSwipe: React.FC = () => {
  const [pgs, setPgs] = useState<PGData[]>([]);
  const [allPgs, setAllPgs] = useState<PGData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addItem, isItemInWishlist } = useWishlist();
  const swipeCardRef = useRef<HTMLDivElement>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showWishlistNotification, setShowWishlistNotification] = useState(false);
  const [flirtyMessage, setFlirtyMessage] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSubmittingCallback, setIsSubmittingCallback] = useState<boolean>(false);
  const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [currentPgForCallback, setCurrentPgForCallback] = useState<PGData | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if user has seen the tutorial before and restore last viewed PG
  useEffect(() => {
    // Check tutorial status
    const hasSeenTutorial = localStorage.getItem('shelterSwipeTutorialSeen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    
    // Restore last viewed PG index
    const savedIndex = localStorage.getItem('lastViewedPGIndex');
    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex));
    }
    
    // Track page view for ShelterSwipe
    trackEvent('ShelterSwipe', 'Page View', 'ShelterSwipe Feature');
  }, []);

  // Mark tutorial as seen when closed
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('shelterSwipeTutorialSeen', 'true');
    trackEvent('ShelterSwipe', 'Tutorial', 'Completed');
  };

  // Show tutorial again if user clicks help button
  const handleShowTutorial = () => {
    setShowTutorial(true);
    trackEvent('ShelterSwipe', 'Show Tutorial', 'Help Button Click');
  };
  
  // Navigate to wishlist page
  const handleGoToWishlist = () => {
    trackEvent('ShelterSwipe', 'Navigate', 'Go To Wishlist');
    navigate('/wishlist', { state: { from: '/shelter-swipe' } });
  };
  
  // Show confirmation dialog before callback request
  const showCallbackConfirmation = (pg: PGData) => {
    setCurrentPgForCallback(pg);
    setShowConfirmationModal(true);
    trackEvent('ShelterSwipe', 'Callback Request', 'Show Confirmation');
  };
  
  // Handle callback request after confirmation
  const handleCallbackRequest = async () => {
    if (!currentUser || !currentPgForCallback) {
       ('User not authenticated or no PG selected, redirecting to login');
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/shelter-swipe' } });
      return;
    }
    
    // Close confirmation modal
    setShowConfirmationModal(false);
    
    try {
       ('Submitting callback request...');
      setIsSubmittingCallback(true);
      
      // Add callback request to Firestore
      await addCallbackRequest({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        userEmail: currentUser.email || '',
        userPhone: currentUser.phoneNumber || '',
        pgId: currentPgForCallback.id,
        pgName: currentPgForCallback.name,
        message: `Callback request for ${currentPgForCallback.name} from ShelterSwipe`,
        status: 'pending'
      });
      
       ('Callback request submitted successfully');
      // Show thank you modal
      setShowThankYouModal(true);
      trackEvent('ShelterSwipe', 'Callback Request', 'Success');
    } catch (error) {
      console.error('Error submitting callback request:', error);
      // Show the thank you modal even if there's an error to improve UX
      setShowThankYouModal(true);
    } finally {
      setIsSubmittingCallback(false);
    }
  };
  
  // Cancel callback request
  const cancelCallbackRequest = () => {
    setShowConfirmationModal(false);
    setCurrentPgForCallback(null);
  };

  // Fetch PGs from Firestore - only show active PGs
  // Set a random flirty message when the current index changes and handle batch loading
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * flirtyMessages.length);
    setFlirtyMessage(flirtyMessages[randomIndex]);
    
    // Only show end message if we have loaded all PGs and viewed them all
    if (allPgs.length > 0 && currentIndex >= allPgs.length - 1) {
      setShowEndMessage(true);
    } else if (currentIndex >= pgs.length - 1 && currentIndex < allPgs.length - 1) {
      // Load next batch when approaching end of current batch
      const nextBatch = getNextBatch(allPgs, pgs.length, NEXT_BATCH_SIZE);
      setPgs(prev => [...prev, ...nextBatch]);
      
      // Preload images for next batch
      preloadPGImages(nextBatch);
    }
  }, [currentIndex, pgs.length, allPgs.length]);

  // Save current PG index whenever it changes
  useEffect(() => {
    if (currentIndex >= 0) {
      localStorage.setItem('lastViewedPGIndex', currentIndex.toString());
    }
  }, [currentIndex]);

  // Use memo for optimized rendering of PG cards
  const memoizedPGs = useMemo(() => pgs, [pgs]);
  
  // Use a ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Force re-render when images load
  const [imageLoadTrigger, setImageLoadTrigger] = useState(0);
  
  // Listen for image load events
  useEffect(() => {
    const handleImageLoaded = () => {
      if (isMounted.current) {
        setImageLoadTrigger(prev => prev + 1);
      }
    };
    
    document.addEventListener('imageLoaded', handleImageLoaded);
    
    return () => {
      document.removeEventListener('imageLoaded', handleImageLoaded);
    };
  }, []);
  
  useEffect(() => {
    // Initialize with a clean slate for swipe direction
    localStorage.removeItem('lastSwipeDirection');
    
    // Set mounted flag
    isMounted.current = true;
    
    // Initialize analytics session
    const initAnalytics = async () => {
      try {
         ('Initializing analytics session for ShelterSwipe');
        await initializeSession();
        const sessionId = sessionStorage.getItem('shelterlySessionRef');
        const userId = sessionStorage.getItem('shelterlyUserId');
         (`Analytics session initialized: sessionId=${sessionId}, userId=${userId}`);
      } catch (error) {
        console.error('Error initializing analytics session:', error);
      }
    };
    
    // Call the initialization function
    initAnalytics();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Fetch PGs when component mounts
  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true);
         ('Fetching PGs...');
        
        // Try to get cached PG data first
        const cachedData = getCachedPGData();
        if (cachedData) {
           ('Using cached PG data');
          setAllPgs(cachedData);
          setPgs(cachedData.slice(0, INITIAL_BATCH_SIZE));
          setLoading(false);
          return;
        }
        
         ('No cached PGs found, fetching from Firestore...');

        setLoading(true);
         ('Setting up Firestore query for active PGs...');
        const pgsRef = collection(db, 'pgs');
        // Only fetch PGs with 'active' status as per requirements
        const pgsQuery = query(pgsRef, where('status', '==', 'active'));
        const querySnapshot = await getDocs(pgsQuery);
        
        const pgsList: PGData[] = [];
        querySnapshot.forEach((doc) => {
          const pgData = doc.data() as PGData;
          // Make sure the PG has coordinates for the map display
          if (!pgData.coordinates) {
            pgData.coordinates = {  
              lat: 12.9716 + (Math.random() * 0.05 - 0.025), // Add slight randomness for display
              lng: 77.5946 + (Math.random() * 0.05 - 0.025)
            };
          }
          pgsList.push({ id: doc.id, ...pgData });
        });
        
        // Shuffle the PGs for a more engaging experience
        const shuffledPGs = [...pgsList].sort(() => Math.random() - 0.5);
        
        // Cache the fetched data
        cachePGData(shuffledPGs);
        setAllPgs(shuffledPGs);
        
        // Load initial batch
        setPgs(getNextBatch(shuffledPGs, 0, INITIAL_BATCH_SIZE));
        
        // Preload images for initial batch
        preloadPGImages(getNextBatch(shuffledPGs, 0, INITIAL_BATCH_SIZE));
      } catch (error) {
        console.error('Error fetching PGs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPGs();
  }, []);

  const handleSwipeLeft = () => {
     ('[SWIPE DEBUG] Handling swipe left...');
    
    // Reset states
    setShowDetails(false);
    
    // Track swipe left in analytics
    const currentPG = pgs[currentIndex];
    if (currentPG) {
       (`[SWIPE DEBUG] Current PG: ${JSON.stringify({
        id: currentPG.id,
        name: currentPG.name,
        index: currentIndex
      })}`);
      
      try {
         (`[SWIPE DEBUG] Attempting to track swipe left for PG: ${currentPG.id} - ${currentPG.name}`);
        
        // Check if session data exists
        const sessionId = sessionStorage.getItem('shelterlySessionRef');
        const userId = sessionStorage.getItem('shelterlyUserId');
         (`[SWIPE DEBUG] Session data before tracking: sessionId=${sessionId}, userId=${userId}`);
        
        // Log session storage contents
         ('[SWIPE DEBUG] Session storage contents:');
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
             (`[SWIPE DEBUG] ${key}: ${sessionStorage.getItem(key)}`);
          }
        }
        
        // Track swipe left in analytics
        trackShelterSwipe(currentPG.id, 'left')
          .then(() => {
            // Verify the session data after tracking
            const sessionIdAfter = sessionStorage.getItem('shelterlySessionRef');
            const userIdAfter = sessionStorage.getItem('shelterlyUserId');
          })
          .catch(error => {
            console.error('[SWIPE DEBUG] Error tracking swipe left:', error);
            if (error instanceof Error) {
              console.error('[SWIPE DEBUG] Error details:', error.message);
              console.error('[SWIPE DEBUG] Error stack:', error.stack);
            }
          });
      } catch (error) {
        console.error('[SWIPE DEBUG] Error calling trackShelterSwipe:', error);
        if (error instanceof Error) {
          console.error('[SWIPE DEBUG] Error details:', error.message);
          console.error('[SWIPE DEBUG] Error stack:', error.stack);
        }
      }
    }
    
    // Check if we need to load more PGs
    if (currentIndex >= pgs.length - 2 && currentIndex < allPgs.length - 1) {
      // Load next batch of PGs before reaching the end
      const nextBatch = getNextBatch(allPgs, pgs.length, NEXT_BATCH_SIZE);
      setPgs(prev => [...prev, ...nextBatch]);
      // Preload images for next batch
      preloadPGImages(nextBatch);
    }
    
    // Update current index if not at the end
    if (currentIndex < allPgs.length - 1) {
      
      // Store the current swipe direction for the next card's entrance
      // When card exits left, next card should enter from right
      localStorage.setItem('lastSwipeDirection', 'left');
      
      // Preload next card's images immediately
      const nextIndex = currentIndex + 1;
      if (pgs[nextIndex] && pgs[nextIndex].photos && pgs[nextIndex].photos.length > 0) {
        preloadPGImages([pgs[nextIndex]], 0);
      }
      
      // Use setTimeout to reset the swipe direction after the animation completes
      setTimeout(() => {
        if (isMounted.current) {
          setSwipeDirection(null); // Reset rotation for the next card
        }
      }, 300);
      
      setCurrentIndex(currentIndex + 1);
      setShowEndMessage(false); // Reset end message when moving to next PG
    } else if (currentIndex >= allPgs.length - 1 && !showEndMessage) {
       ('Reached end of PGs, showing end message');
      setShowEndMessage(true);
    }
  };

  const handleSwipeRight = () => {
    const currentPG = pgs[currentIndex];
    if (currentPG) {
      setShowWishlistNotification(true);
      
       (`[SWIPE DEBUG] Current PG: ${JSON.stringify({
        id: currentPG.id,
        name: currentPG.name,
        index: currentIndex
      })}`);
      
      // Track swipe right in analytics
      try {
         (`[SWIPE DEBUG] Attempting to track swipe right for PG: ${currentPG.id} - ${currentPG.name}`);
        
        // Check if session data exists
        const sessionId = sessionStorage.getItem('shelterlySessionRef');
        const userId = sessionStorage.getItem('shelterlyUserId');
         (`[SWIPE DEBUG] Session data before tracking: sessionId=${sessionId}, userId=${userId}`);
        
        // Log session storage contents
         ('[SWIPE DEBUG] Session storage contents:');
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
             (`[SWIPE DEBUG] ${key}: ${sessionStorage.getItem(key)}`);
          }
        }
        
        trackShelterSwipe(currentPG.id, 'right')
          .then(() => {
            // Verify the session data after tracking
            const sessionIdAfter = sessionStorage.getItem('shelterlySessionRef');
            const userIdAfter = sessionStorage.getItem('shelterlyUserId');
          })
          .catch(error => {
            console.error('[SWIPE DEBUG] Error tracking swipe right:', error);
            if (error instanceof Error) {
              console.error('[SWIPE DEBUG] Error details:', error.message);
              console.error('[SWIPE DEBUG] Error stack:', error.stack);
            }
          });
      } catch (error) {
        console.error('[SWIPE DEBUG] Error calling trackShelterSwipe:', error);
        if (error instanceof Error) {
          console.error('[SWIPE DEBUG] Error details:', error.message);
          console.error('[SWIPE DEBUG] Error stack:', error.stack);
        }
      }
      
      // Only add to wishlist if not already there
      if (!isItemInWishlist(currentPG.id)) {
        addItem(currentPG);
        trackEvent('ShelterSwipe', 'Add to Wishlist', currentPG.name);
      } else {
      }
      
      // Check if we need to load more PGs
      if (currentIndex >= pgs.length - 2 && currentIndex < allPgs.length - 1) {
        // Load next batch of PGs before reaching the end
        const nextBatch = getNextBatch(allPgs, pgs.length, NEXT_BATCH_SIZE);
        setPgs(prev => [...prev, ...nextBatch]);
        // Preload images for next batch
        preloadPGImages(nextBatch);
      }
      
      // Update current index if not at the end
      if (currentIndex < allPgs.length - 1) {
        
        // Store the current swipe direction for the next card's entrance
        // When card exits right, next card should enter from left
        localStorage.setItem('lastSwipeDirection', 'right');
        
        // Preload next card's images immediately
        const nextIndex = currentIndex + 1;
        if (pgs[nextIndex] && pgs[nextIndex].photos && pgs[nextIndex].photos.length > 0) {
          preloadPGImages([pgs[nextIndex]], 0);
        }
        
        // Use setTimeout to reset the swipe direction after the animation completes
        setTimeout(() => {
          if (isMounted.current) {
            setSwipeDirection(null); // Reset rotation for the next card
          }
        }, 300);
        
        setCurrentIndex(currentIndex + 1);
        setShowEndMessage(false); // Reset end message when moving to next PG
      } else if (currentIndex >= allPgs.length - 1 && !showEndMessage) {
         ('Reached end of PGs, showing end message');
        setShowEndMessage(true);
      }
    }
  };

  const resetSwipe = () => {
    setCurrentIndex(0);
    setShowEndMessage(false);
    setShowDetails(false);
  };

  const toggleDetails = () => {
    const newState = !showDetails;
    setShowDetails(newState);
    if (newState && currentIndex < pgs.length) {
      const currentPG = pgs[currentIndex];
      trackEvent('ShelterSwipe', 'View Details', currentPG.name);
    }
  };

  if (loading) {
    return (
      <div className="shelter-swipe-container">
        {/* Tutorial Modal */}
        <ShelterSwipeTutorial isOpen={showTutorial} onClose={handleCloseTutorial} />

        <div className="w-full max-w-md mx-auto pt-10 px-4 will-change-transform">
          <div className="animate-pulse">
            {/* Skeleton card */}
            <div className="w-full h-[70vh] bg-gray-200 rounded-2xl overflow-hidden relative mb-4">
              {/* Skeleton image carousel */}
              <div className="w-full h-3/4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
              
              {/* Skeleton badges */}
              <div className="absolute top-4 left-4 flex space-x-2">
                <div className="h-6 w-16 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-full"></div>
                <div className="h-6 w-20 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-full"></div>
              </div>
              
              {/* Skeleton amenities */}
              <div className="absolute bottom-32 left-4 flex space-x-3">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="h-8 w-8 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-lg"></div>
                ))}
              </div>
              
              {/* Skeleton title and price */}
              <div className="absolute bottom-16 left-4 right-4">
                <div className="h-8 w-48 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-lg mb-2"></div>
                <div className="h-6 w-32 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-lg"></div>
              </div>
              
              {/* Skeleton message */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-6 w-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-lg"></div>
              </div>
            </div>
            
            {/* Skeleton swipe buttons */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="h-12 w-12 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-full"></div>
              <div className="h-12 w-12 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-full"></div>
              <div className="h-12 w-12 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-full"></div>
            </div>
            
            <div className="text-center mt-6">
              <div className="inline-block">
                <div className="h-6 w-48 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Add shimmer animation style */}
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
            .animate-shimmer {
              background-size: 1000px 100%;
              animation: shimmer 2s infinite linear;
            }
          `}
        </style>
      </div>
    );
  }

  if (showEndMessage) {
    return (
      <div 
        className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-600 p-4 relative overflow-hidden"
        onTouchStart={(e) => {
          const touchStartX = e.touches[0].clientX;
          const touchObj = e.changedTouches[0];
          e.currentTarget.setAttribute('data-start-x', touchStartX.toString());
        }}
        onTouchEnd={(e) => {
          const touchEndX = e.changedTouches[0].clientX;
          const startX = parseInt(e.currentTarget.getAttribute('data-start-x') || '0');
          const swipeDistance = touchEndX - startX;
          
          // If swipe distance is significant, reset the swipe
          if (Math.abs(swipeDistance) > 50) {
            resetSwipe();
          }
        }}
        onClick={resetSwipe}
      >
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-10 left-10 w-20 h-20 rounded-full bg-yellow-300 opacity-50 blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0],
            x: [0, 10, 0],
            y: [0, -10, 0]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-pink-300 opacity-40 blur-xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -20, 0],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-blue-300 opacity-30 blur-xl"
          animate={{ 
            scale: [1, 1.4, 1],
            rotate: [0, 30, 0],
            x: [0, 20, 0],
            y: [0, 20, 0]
          }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Ribbon top left */}
        <motion.div 
          className="absolute top-0 left-0 w-32 h-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute top-0 left-0 w-40 h-10 bg-primary-500 rotate-45 origin-bottom-left transform translate-y-2 translate-x-[-30px] shadow-lg"></div>
        </motion.div>
        
        {/* Ribbon bottom right */}
        <motion.div 
          className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute bottom-0 right-0 w-40 h-10 bg-pink-500 rotate-45 origin-top-right transform translate-y-[-8px] translate-x-[30px] shadow-lg"></div>
        </motion.div>
        
        {/* Confetti particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div 
            key={i}
            className={`absolute rounded-full w-2 h-2 ${[
              'bg-pink-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-400'
            ][i % 5]}`}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: -20,
              opacity: Math.random() * 0.7 + 0.3
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
        
        {/* Main content card */}
        <motion.div 
          className="max-w-md w-full bg-white/60 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center space-y-6 relative z-10 border-2 border-white"
          style={{
            
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.7, 
            type: "spring", 
            bounce: 0.4 
          }}
        >
          
          {/* Heart icon with glow effect */}
          <motion.div
            className="relative"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut" 
            }}
          >
            <div className="absolute inset-0 text-pink-500 text-5xl blur-sm opacity-70 scale-110">
              💖
            </div>
            <div className="text-pink-500 text-5xl relative z-10">
              💖
            </div>
          </motion.div>
          
          {/* Decorative divider */}
          <div className="w-full flex items-center justify-center my-2">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-transparent w-3/4"></div>
          </div>
          
          <motion.h2 
            className="text-3xl font-bold text-primary-600 mb-2 font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            That's all the homes we have for now!
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 text-lg font-medium mb-2 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            "Home is where your story begins. Ready to find yours?"
          </motion.p>
          
          <motion.p
            className="text-primary-500 text-sm font-medium mb-6 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ 
              delay: 0.8, 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            <span>←</span>
            <span>Swipe anywhere to see more PGs</span>
            <span>→</span>
          </motion.p>
          
          {/* Decorative divider */}
          <div className="w-full flex items-center justify-center mb-4">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-transparent w-1/2"></div>
          </div>
          
          <motion.button 
            className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 relative overflow-hidden group"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
            }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSwipe}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <span className="relative z-10">Discover More Homes</span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-size-200 bg-pos-0 group-hover:bg-pos-100"></div>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentPG = pgs[currentIndex];
  if (!currentPG) return null;

  return (
    <>
      <style>{globalStyles}</style>
      {/* Tutorial Modal */}
      <ShelterSwipeTutorial isOpen={showTutorial} onClose={handleCloseTutorial} />
      
      {/* Confirmation modal for callback request */}
      {currentPgForCallback && showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelCallbackRequest}></div>
          
          {/* Modal */}
          <div className="relative bg-white/70 rounded-2xl shadow-xl max-w-sm w-full mx-auto overflow-hidden">
            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Ready to make a move?</h3>
              
              {/* Random flirty message */}
              <p className="text-center text-gray-600 mb-6">
                {[
                  `Looks like you're crushing on ${currentPgForCallback.name}! Want us to play matchmaker and give you a call?`,
                  `We caught you eyeing ${currentPgForCallback.name}! Should we help seal the deal with a quick call?`,
                  `${currentPgForCallback.name} could be your perfect match! Ready for us to make the introduction?`,
                  `Swiping right on ${currentPgForCallback.name}, huh? Let us help you take the next step!`,
                  `Is it hot in here, or is it just your interest in ${currentPgForCallback.name}? Let's make this happen!`
                ][Math.floor(Math.random() * 5)]}
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={cancelCallbackRequest}
                  className="flex-1 py-2 px-4 border border-primary-600 rounded-full text-primary-600 hover:bg-gray-100 transition-colors"
                >
                  Not now
                </button>
                <button 
                  onClick={handleCallbackRequest}
                  className="flex-1 py-2 px-4 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  disabled={isSubmittingCallback}
                >
                  {isSubmittingCallback ? 'Requesting...' : 'Yes, call me!'}
                  {!isSubmittingCallback && <FiPhone />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Thank you modal for callback request */}
      {currentPgForCallback && (
        <ThankYouModal 
          isOpen={showThankYouModal} 
          onClose={() => setShowThankYouModal(false)} 
          pgName={currentPgForCallback.name} 
        />
      )}
      
      <div className="w-full h-screen flex flex-col items-center justify-start bg-white">
        {/* Fixed buttons in top right with smooth animation */}
        <div className="fixed right-4 top-14 z-50 flex flex-col gap-3">
          {/* Help button to show tutorial */}
          <motion.button 
            onClick={handleShowTutorial}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Show tutorial"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          >
            <FiHelpCircle className="text-primary-600 text-xl" />
          </motion.button>
          
          {/* Wishlist button - using heart icon for better visibility */}
          <motion.button 
            onClick={handleGoToWishlist}
            className="bg-pink-500 p-3 rounded-full shadow-lg hover:bg-pink-600 transition-colors"
            aria-label="Go to wishlist"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          >
            <FiHeart className="text-white text-xl" />
          </motion.button>
        </div>
      {/* Swipe indicators attached to screen */}
      <AnimatePresence>
        {swipeDirection === 'left' && (
          <motion.div 
            className="fixed left-0 top-0 bottom-0 w-16 bg-gray-500/20 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FiX className="text-white text-3xl" />
          </motion.div>
        )}
        {swipeDirection === 'right' && (
          <motion.div 
            className="fixed right-0 top-0 bottom-0 w-16 bg-pink-500/20 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FiHeart className="text-pink-500/80 text-3xl" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          className="w-full max-w-md bg-white rounded-xl shadow-lg relative flex flex-col h-[90vh] overflow-y-auto no-scrollbar"
          ref={swipeCardRef}
          initial={{
            opacity: 0, 
            x: localStorage.getItem('lastSwipeDirection') === 'left' ? 300 : 
               localStorage.getItem('lastSwipeDirection') === 'right' ? -300 : 300,
            rotate: 0
          }}
          animate={{ opacity: 1, x: 0, rotate: 0 }} // Always animate to center with no rotation
          exit={{ 
            opacity: 0,
            x: swipeDirection === 'right' ? 300 : -300, // Exit to the right when swiping right, left when swiping left
            rotate: swipeDirection === 'right' ? 10 : swipeDirection === 'left' ? -5 : 0 // Only rotate on exit
          }}
          transition={{ 
            type: "spring", 
            stiffness: 260, // Reduced stiffness for better mobile performance
            damping: 25,    // Adjusted damping for smoother animation
            mass: 0.8       // Lighter mass for faster animation
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9} // Increased elasticity for better mobile feel
          style={{
            rotate: swipeDirection === 'left' ? '-5deg' : swipeDirection === 'right' ? '10deg' : '0deg',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transformOrigin: 'center center' // Ensure rotation happens from the center
          }}
          onDragStart={() => {
            setSwipeDirection(null);
          }}
          onDrag={(e, { offset }) => {
            // Update swipe direction based on drag position with a smoother threshold
            const dragThreshold = 5; // Even lower threshold for more responsive feel
            
            if (offset.x < -dragThreshold) {
              // Only update if direction changed to avoid constant re-renders
              if (swipeDirection !== 'left') {
                setSwipeDirection('left');
              }
            } else if (offset.x > dragThreshold) {
              if (swipeDirection !== 'right') {
                setSwipeDirection('right');
              }
            } else {
              if (swipeDirection !== null) {
                setSwipeDirection(null);
              }
            }
          }}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = offset.x;
            const swipeVelocity = velocity.x;
            
            // More sensitive swipe detection for mobile
            // Either a decent distance OR a quick flick will trigger the swipe
            if (swipe < -50 || (swipe < -20 && swipeVelocity < -0.3)) {
              // Keep track of direction for exit animation
              setSwipeDirection('left');
              handleSwipeLeft();
            } else if (swipe > 50 || (swipe > 20 && swipeVelocity > 0.3)) {
              // Keep track of direction for exit animation
              setSwipeDirection('right');
              handleSwipeRight();
            } else {
              setSwipeDirection(null);
            }
          }}
        >
          {/* Swipe indicators are now moved outside the card */}
          
          {/* Image at the top with badges */}
          <div className="w-full h-[70vh] min-h-[710px] relative overflow-hidden mt-2 rounded-2xl px-2">
            <div className="relative w-full h-full">
              {/* Always show the actual image */}
              <img 
                src={getImageUrl(currentPG)} 
                alt={currentPG.name} 
                className="w-full h-full object-cover rounded-2xl"
                loading="eager"
                decoding="async"
                onLoad={(e) => {
                  // Mark as loaded when the image loads
                  const url = (e.target as HTMLImageElement).src;
                  if (!imageCache.has(url)) {
                    imageCache.set(url, { loaded: true, image: new Image() });
                  } else {
                    const cached = imageCache.get(url);
                    if (cached) {
                      cached.loaded = true;
                      imageCache.set(url, cached);
                    }
                  }
                }}
              />
              
              {/* Show loading overlay if not loaded */}
              {!isImageLoaded(currentPG.photos?.[0]?.url) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/70 rounded-2xl">
                  <div className="animate-pulse flex flex-col items-center justify-center">
                    <div className="rounded-full bg-gray-200 h-16 w-16 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex flex-row gap-2">
              {currentPG.isVerified && (
                <span className="px-3 py-1 bg-white/50 text-primary-700 text-xs font-semibold rounded-full shadow-sm">Verified</span>
              )}
              <span className="px-3 py-1 bg-primary-600/50 text-white text-xs font-semibold rounded-full shadow-sm">
                {currentPG.gender === 'male' ? 'Male Only' : 
                 currentPG.gender === 'female' ? 'Female Only' : 'Co-ed'}
              </span>
            </div>
            <div>
              {isItemInWishlist(currentPG.id) && (
                  <motion.span 
                    className="w-auto align-center justify-center px-3 py-1 bg-pink-500/50 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1 absolute top-4 right-[5%]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiHeart className="text-xs" /> In Wishlist
                  </motion.span>
                )}
            </div>
            
            {/* Gradient overlay with PG name */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-16 left-0 right-0 px-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-light text-white italic " style={{ fontFamily: "'Poppins'" }}>{currentPG.name}</h2>
            </div>
            
            {/* Callback button - positioned outside the draggable area */}
            <div className="absolute bottom-16 right-5 z-10 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event propagation
                  e.preventDefault(); // Prevent default behavior
                  showCallbackConfirmation(currentPG);
                }}
                disabled={isSubmittingCallback}
                className="bg-primary-600 p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                aria-label="Request callback"
              >
                <FiPhone className="text-white text-xl" />
              </button>
            </div>
          </div>
          
          {/* PG details section */}
          <div className="p-4 flex flex-col gap-4 bg-white/30 rounded-2xl ">
            {/* Location and rating */}
            <div className="flex items-center gap-2">
              <FiMapPin className="text-primary-600" /> 
              <span className="text-gray-700 text-sm">{currentPG.location}</span>
              {currentPG.rating && (
                <div className="flex items-center ml-auto">
                  <FiStar className="text-yellow-500 mr-1" /> 
                  <span className="text-sm font-medium">{currentPG.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {/* Price info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-1">From</span>
                <span className="text-lg font-bold text-primary-600">₹{formatPrice(getMinPrice(currentPG))}</span>
                <span className="text-sm text-gray-600"></span>
              </div>
            </div>
            
            {/* About section */}
            <div className="mt-1 pb-4">
              <span className="text-sm font-bold text-primary-600 mb-1 block ">About {currentPG.name}</span>
              <p className="text-sm leading-relaxed text-gray-800 font-medium">{currentPG.description || `This is a premium PG accommodation offering a comfortable stay with all modern amenities and convenient location.`}</p>
            </div>
            
            {/* Amenities in rounded badges */}
            <div className="px-2">
              <h3 className="text-md text-primary-600 font-semibold text-left w-full my-4">Amenities</h3>
              <div className="w-full flex flex-wrap gap-4 mb-2 justify-center items-center">
                {currentPG.wifi && (
                  <div className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-2 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">
                    <FiWifi />
                    <span>WiFi</span>
                  </div>
                )}
                {currentPG.food && (
                  <div className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-2 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">
                    <FiCoffee />
                    <span>Food</span>
                  </div>
                )}
                {currentPG.washingMachine && (
                  <div className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-2 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">
                    <span role="img" aria-label="washing machine">🧺</span>
                    <span>Laundry</span>
                  </div>
                )}
              </div>
              <div className="w-full flex flex-wrap gap-4 mb-2">
                {currentPG.housekeeping && (
                  <div className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-2 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">
                    <span role="img" aria-label="housekeeping">🧹</span>
                    <span>Cleaning</span>
                  </div>
                )}
                {currentPG.parking && (
                  <div className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-2 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">
                    <span role="img" aria-label="parking">🅿️</span>
                    <span>Parking</span>
                  </div>
                )}
                {currentPG.security && (
                  <div className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-2 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">
                    <span role="img" aria-label="security">🔒</span>
                    <span>Security</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Featured photo after amenities */}
            {currentPG.photos && currentPG.photos.length > 1 && (
              <div className="w-full h-[500px] rounded-2xl overflow-hidden my-2 shadow-sm">
                <img 
                  src={currentPG.photos[1]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={`${currentPG.name} featured photo`} 
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Additional PG details */}
            <div className="mt-2 pb-6 px-2">
              <h3 className="text-md font-semibold text-primary-600 text-left w-full mb-2">PG Information</h3>
              <div className="flex flex-wrap w-full mb-2">
                <div className="bg-white p-1 rounded-xl shadow-sm">
                  <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">{currentPG.gender === 'male' ? 'Male Only' : currentPG.gender === 'female' ? 'Female Only' : 'Unisex'}</span>
                </div>
                
                <div className="bg-white p-1 rounded-xl shadow-sm">
                  <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">{currentPG.washroom === 'attached' ? 'Attached Washroom' : 'Common Washroom'}</span>
                </div>
                
                <div className="bg-white p-1 rounded-xl shadow-sm">
                  <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">{currentPG.beds || '50'} Beds</span>
                </div>
                
                <div className="bg-white p-1 rounded-xl shadow-sm">
                  <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">Nearest to {currentPG.nearestCollege || 'St Joseph\'s University'} - 400m</span>
                </div>
              </div>
              

              
              <h3 className="text-md font-semibold text-primary-600 text-left w-full mb-2 mt-10">Room Options</h3>
              <div className="flex flex-wrap w-full mb-2">
                {currentPG.oneSharing?.available && (
                  <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl shadow-sm text-center">
                    <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">Single Sharing : ₹{formatPrice(currentPG.oneSharing.price)}</span>
                  </div>
                )}
                
                {currentPG.twoSharing?.available && (
                  <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl shadow-sm text-center">
                    <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">Double Sharing : ₹{formatPrice(currentPG.twoSharing.price)}</span>
                  </div>
                )}
                
                {currentPG.threeSharing?.available && (
                  <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl shadow-sm text-center">
                    <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">Triple Sharing : ₹{formatPrice(currentPG.threeSharing.price)}</span>
                  </div>
                )}
                
                {currentPG.fourSharing?.available && (
                  <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl shadow-sm text-center">
                    <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">Four Sharing : ₹{formatPrice(currentPG.fourSharing.price)}</span>
                  </div>
                )}
              </div>
              
              {currentPG.fiveSharing?.available && (
                <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl shadow-sm text-center">
                  <span className="flex justify-center items-center gap-1 bg-white/50 border border-gray-300 px-4 py-2 rounded-full font-light text-sm text-primary-600 flex-1 shadow-md">Five Sharing : ₹{formatPrice(currentPG.fiveSharing.price)}</span>
                </div>
              )}
            </div>
            
            {/* More photos section */}
            <div className="mt-2 pb-6 px-2">
              <div className="flex flex-col w-full">
                {currentPG.photos?.slice(2, 6).map((photo, index) => (
                  <div key={index} className="w-full h-full rounded-xl overflow-hidden mb-4 shadow-sm">
                    <img 
                      src={photo.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                      alt={`${currentPG.name} photo ${index + 1}`} 
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Flirty text at the bottom */}
            <div className="relative bottom-4 text-center z-10 backdrop-blur-sm py-2 px-4 rounded-xl">
              <p className="text-black text-xs italic">"{flirtyMessage}"</p>
            </div>
                
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Wishlist notification */}
      <AnimatePresence>
        {showWishlistNotification && (
          <motion.div 
            className="fixed top-[50%] left-25 transform -translate-x-1/2 bg-pink-600/50 text-white px-6 py-3 rounded-full shadow-xl z-[9999] flex items-center gap-2"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ 
              duration: 0.5,
              type: "fade",
              stiffness: 300,
              damping: 15
            }}
          >
            <FiHeart className="text-white text-md" />
            <span className="font-medium">
              {currentPG && isItemInWishlist(currentPG.id) ? 'Already in wishlist!' : 'Added to wishlist!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      </div>
    </>
  );

};

export default ShelterSwipe;
