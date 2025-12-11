import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { startPgDetailsTimer, stopPgDetailsTimer } from '../../services/analyticsService';
import { extractPgIdFromPath } from '../../utils/seoUtils';
import ShareModal from '../Share/ShareModal';
import { FiArrowLeft, FiHeart, FiShare2, FiMapPin, FiStar, FiInfo, FiCalendar } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import WishlistNotification from '../Wishlist/WishlistNotification';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { PGData } from '../PGListing/types';
import { demoPGs } from '../PGListing/demoData';
import './PGDetailsPage.css';
import { useAuth } from '../../contexts/AuthContext';
import { useViewedPGs } from '../../contexts/ViewedPGsContext';
import { useWishlist } from '../../contexts/WishlistContext';
import QuirkyNewAuthModal from '../Auth/QuirkyNewAuthModal';
import ThankYouModal from '../Callback/ThankYouModal';
import BookVisitModal from './BookVisitModal';
import { addCallbackRequest } from '../../firebase/callbackService';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { getPGReviews } from '../../firebase/reviewsService';

// Import our new stylish components
import HeroCarousel from './HeroCarousel';
// BentoGallery import removed
import QuirkyAmenities from './QuirkyAmenities';
import PricingCards from './PricingCards';

// Location component (we'll keep this one simple for now)
const PGLocation: React.FC<{pg: PGData}> = ({pg}) => (
  <div className="mb-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-primary-800 relative">
        Location
        <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-500 rounded-full"></div>
      </h2>
    </div>
    
    <div className="bg-white rounded-[30px] p-6 shadow-sm overflow-hidden relative">
      {/* Decorative corner element */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-100 opacity-30 rounded-tl-full"></div>
      
      <div className="flex items-center mb-6 relative z-10">
        <div className="p-3 bg-primary-100 text-primary-600 rounded-full mr-3">
          <FiMapPin size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-primary-800">Address</h3>
          <p className="text-gray-700">{pg.address}</p>
        </div>
      </div>
      
      <div className="h-80 rounded-[20px] overflow-hidden relative z-10">
        {/* Actual Google Map iframe with marker using PG coordinates */}
        <iframe 
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${pg.coordinates?.lng || 77.63764081482193}!3d${pg.coordinates?.lat || 12.934144090877566}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU2JzAyLjkiTiA3N8KwMzgnMTUuNSJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin&markers=color:red%7Clabel:${encodeURIComponent(pg.name.charAt(0))}%7C${pg.coordinates?.lat || 12.934144090877566},${pg.coordinates?.lng || 77.63764081482193}`}
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="PG Location Map"
          className="rounded-[20px]"
        ></iframe>
        
        {/* Map overlay with button */}
        <div className="absolute bottom-4 right-4 z-20">
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${pg.coordinates ? `${pg.coordinates.lat},${pg.coordinates.lng}` : encodeURIComponent(pg.address)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-primary-600 rounded-full shadow-lg hover:bg-primary-50 transition-colors flex items-center"
          >
            <FiMapPin className="mr-2" />
            View on Google Maps
          </a>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div className="bg-blue-50 p-4 rounded-xl">
          <h4 className="font-medium text-blue-800 mb-2">Nearby Places</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Supermarket (0.3 km)</li>
            <li>• Bus Stop (0.2 km)</li>
            <li>• Hospital (1.5 km)</li>
            <li>• Shopping Mall (2 km)</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl">
          <h4 className="font-medium text-green-800 mb-2">Commute</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• City Center (15 min)</li>
            <li>• IT Park (20 min)</li>
            <li>• University (10 min)</li>
            <li>• Airport (45 min)</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-xl">
          <h4 className="font-medium text-purple-800 mb-2">Neighborhood</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Safe & Secure Area</li>
            <li>• Residential Community</li>
            <li>• Parks & Recreation</li>
            <li>• Restaurants & Cafes</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Reviews component has been removed as requested

const PGDetailsPage: React.FC = () => {
  // Handle both URL formats: /pg/:slug/:id and /pg-details/:id
  const params = useParams<{ id?: string, slug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract ID from either the params or the path
  const id = params.id || extractPgIdFromPath(location.pathname);
  const [pg, setPg] = useState<PGData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const hasIncrementedViewRef = useRef<boolean>(false);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { currentUser } = useAuth();
  const { incrementViewedPGCount, viewedPGCount, viewedPGIds } = useViewedPGs();
  const { addItem, removeItem, isItemInWishlist } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTriggerType, setAuthTriggerType] = useState<'contact' | 'viewLimit'>('viewLimit');
  const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false);
  const [isSubmittingCallback, setIsSubmittingCallback] = useState<boolean>(false);
  const [isBookingVisit, setIsBookingVisit] = useState<boolean>(false);
  const [showBookVisitModal, setShowBookVisitModal] = useState<boolean>(false);
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [showWishlistNotification, setShowWishlistNotification] = useState<boolean>(false);
  const [wishlistNotificationType, setWishlistNotificationType] = useState<'add' | 'remove'>('add');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  // location is already defined above

  // Fetch PG details when component mounts or ID changes
  useEffect(() => {
    const fetchPGDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      // Check if we need to redirect to the SEO-friendly URL
      const currentPath = location.pathname;
      
      try {
        // Fetch from Firestore only
        const pgDocRef = doc(db, 'pgs', id);
        const pgDocSnap = await getDoc(pgDocRef);
        
        if (pgDocSnap.exists()) {
          // PG found in Firestore
          const pgData = { id: pgDocSnap.id, ...pgDocSnap.data() } as PGData;
          setPg(pgData);
          
          // Redirect to SEO-friendly URL if we're on the old URL format
          if (location.pathname.startsWith('/pg-details/')) {
            import('../../utils/seoUtils').then(({ createPgUrl }) => {
              const seoUrl = createPgUrl(pgData.name, pgData.id);
              navigate(seoUrl, { replace: true });
            });
          }
          
          // Fetch reviews for this PG to get accurate rating data
          try {
            const reviews = await getPGReviews(pgDocSnap.id);
            setReviewCount(reviews.length);
            
            // Calculate average rating if there are reviews
            if (reviews.length > 0) {
              const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
              setAverageRating(avgRating);
            } else {
              setAverageRating(null);
            }
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            // Keep the PG data even if reviews fail to load
          }
          
          // Track viewed PGs for non-authenticated users
          // Use a ref to ensure we only increment once per page load (prevents double counting in StrictMode)
          if (!currentUser && !hasIncrementedViewRef.current) {
            incrementViewedPGCount(pgDocSnap.id);
            hasIncrementedViewRef.current = true;
          }
          
          // Track PG view for analytics - add this here to ensure it happens after PG data is loaded
          try {
            // Import and use trackPgView from analyticsService
            import('../../services/analyticsService').then(({ trackPgView }) => {
              trackPgView(pgDocSnap.id, pgData.name);
            });
          } catch (error) {
            console.error('Error tracking PG view in details page:', error);
          }
        } else {
          console.error('PG not found in Firestore');
          // No fallback to demo data - we only want to show real PGs
          setPg(null);
        }
      } catch (error) {
        console.error('Error fetching PG details:', error);
        setPg(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Execute the fetch function
    fetchPGDetails();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Start timer to track time spent on this PG details page
    if (id) {
       ('Starting PG details timer from PGDetailsPage component');
      startPgDetailsTimer(id);
    }
    
    // Stop timer when component unmounts
    return () => {
      if (id) {
         ('Stopping PG details timer from PGDetailsPage component');
        stopPgDetailsTimer();
      }
    };
  }, [id, currentUser, incrementViewedPGCount, location.pathname, navigate]);
  
  // Separate useEffect to handle route changes within the same component
  // This ensures the timer is reset when navigating between different PGs
  useEffect(() => {
    // Only run this effect if we already have a PG loaded (not on initial mount)
    if (pg && id) {
      // Stop previous timer and start a new one
      stopPgDetailsTimer();
      startPgDetailsTimer(id);
    }
  }, [location.pathname]);

  // Check if PG is in wishlist when pg or currentUser changes
  useEffect(() => {
    if (pg && currentUser) {
      const inWishlist = isItemInWishlist(pg.id);
      setIsInWishlist(inWishlist);
    }
  }, [pg, currentUser, isItemInWishlist]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Render 404 state if PG not found
  if (!pg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">PG Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">The PG you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link to="/pg-listing" className="flex items-center text-primary-800">
          <FiArrowLeft className="mr-2" />
          <span>Back</span>
        </Link>
        <div className="flex items-center space-x-4">
          <button 
            className={`p-2 rounded-full ${isInWishlist ? 'bg-red-50' : 'bg-gray-100'} ${isInWishlist ? 'text-red-500' : 'text-primary-800'} transition-colors duration-300`}
            onClick={() => {
              if (!currentUser) {
                setAuthTriggerType('contact');
                setShowAuthModal(true);
                return;
              }
              
              if (pg) {
                if (isInWishlist) {
                  removeItem(pg.id || '');
                  setIsInWishlist(false);
                  setWishlistNotificationType('remove');
                  setShowWishlistNotification(true);
                } else {
                  addItem(pg);
                  setIsInWishlist(true);
                  setWishlistNotificationType('add');
                  setShowWishlistNotification(true);
                }
              }
            }}
          >
            {isInWishlist ? <FaHeart className="text-red-500" /> : <FiHeart />}
          </button>
          <button 
            className="p-2 rounded-full bg-gray-100 text-primary-800 hover:bg-gray-200 transition-colors"
            onClick={() => setShowShareModal(true)}
          >
            <FiShare2 />
          </button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Desktop Header - Back button and actions */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <Link to="/pg-listing" className="flex items-center text-primary-800 hover:text-primary-600 transition-all">
            <FiArrowLeft className="mr-2" />
            <span>Back to Listings</span>
          </Link>
          <div className="flex items-center space-x-3">
            <button 
              className={`flex items-center px-3 py-2 rounded-full ${isInWishlist ? 'bg-red-50' : 'bg-white'} shadow-sm hover:shadow ${isInWishlist ? 'text-red-500' : 'text-primary-800'} transition-all`}
              onClick={() => {
                if (!currentUser) {
                  setAuthTriggerType('contact');
                  setShowAuthModal(true);
                  return;
                }
                
                if (pg) {
                  if (isInWishlist) {
                    removeItem(pg.id || '');
                    setIsInWishlist(false);
                    setShowWishlistNotification(true);
                    setWishlistNotificationType('remove');
                  } else {
                    addItem(pg);
                    setIsInWishlist(true);
                    setShowWishlistNotification(true);
                    setWishlistNotificationType('add');
                  }
                }
              }}
            >
              {isInWishlist ? <FaHeart className="text-red-500" /> : <FiHeart />}
            </button>
            <button 
              className="flex items-center px-3 py-2 rounded-full bg-white shadow-sm hover:shadow text-primary-800 transition-all"
              onClick={() => setShowShareModal(true)}
            >
              <FiShare2 />
            </button>
            <button 
              onClick={() => {
                if (!currentUser) {
                  setAuthTriggerType('contact');
                  setShowAuthModal(true);
                } else {
                  // Show the book visit modal for logged in users
                  setShowBookVisitModal(true);
                }
              }}
              className="flex items-center px-4 py-2 rounded-full bg-white text-primary-700 border border-primary-700 hover:bg-primary-50 transition-all mr-2"
              type="button"
              disabled={isBookingVisit}
            >
              <FiCalendar className="h-5 w-5 mr-2" />
              Book a Visit
            </button>
            <button 
              onClick={async () => {
                 
                if (!currentUser) {
                  setAuthTriggerType('contact');
                  setShowAuthModal(true);
                } else {
                  // Handle callback request for logged in users
                  try {
                    setIsSubmittingCallback(true);
                    
                    // Add callback request to Firestore
                    await addCallbackRequest({
                      userId: currentUser.uid,
                      userName: currentUser.displayName || 'User',
                      userEmail: currentUser.email || '',
                      pgId: pg.id,
                      pgName: pg.name,
                      message: `Callback request for ${pg.name}`,
                      status: 'pending',
                      requestType: 'callback'
                    });
                    
                    // Show thank you modal
                    setShowThankYouModal(true);
                  } catch (error) {
                    console.error('Error submitting callback request:', error);
                    // Show the thank you modal even if there's an error to improve UX
                    setShowThankYouModal(true);
                  } finally {
                    setIsSubmittingCallback(false);
                  }
                }
              }}
              className="flex items-center px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-all"
              type="button"
              disabled={isSubmittingCallback}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Request a Callback
            </button>
          </div>
        </div>
        
        {/* Simplified PG Title Section with cleaner layout */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center flex-wrap">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-800" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.5px" }}>{pg.name}</h1>
              {/* Display minimum price right after PG name */}
                
            </div>
            <span className="ml-3 mt-2 text-lg sm:text-xl md:text-2xl font-semibold text-primary-600">
                  Starting from ₹{Math.min(
                    ...[pg.oneSharing?.available && pg.oneSharing?.price ? pg.oneSharing.price : Infinity,
                    pg.twoSharing?.available && pg.twoSharing?.price ? pg.twoSharing.price : Infinity,
                    pg.threeSharing?.available && pg.threeSharing?.price ? pg.threeSharing.price : Infinity,
                    pg.fourSharing?.available && pg.fourSharing?.price ? pg.fourSharing.price : Infinity,
                    pg.fiveSharing?.available && pg.fiveSharing?.price ? pg.fiveSharing.price : Infinity
                  ].filter(price => price !== Infinity)
                  ).toLocaleString()}/mo
                </span>
          </div>
          
          <div className="flex items-center text-center justify-center text-gray-600 mb-3">
            <span className="text-sm sm:text-base">{pg.address}</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            
            
            {pg.isVerified && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm">Verified</span>
            )}
            {pg.gender === 'male' && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm">Male Only</span>
            )}
            {pg.gender === 'female' && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-pink-100 text-pink-800 rounded-full text-xs sm:text-sm">Female Only</span>
            )}
          </div>
        </div>
        
        {/* Hero Carousel with photos and videos */}
        <HeroCarousel 
          photos={pg.photos || []} 
          videos={pg.videos || []} 
          pgName={pg.name}
        />
        
        {/* Bento Grid Gallery */}
        {/* Photo gallery removed */}
        
        {/* Tabs for different sections */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex overflow-x-auto space-x-4 pb-2 mb-6 scrollbar-hide">
            <button 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${activeTab === 'overview' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${activeTab === 'amenities' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('amenities')}
            >
              Amenities
            </button>
            <button 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${activeTab === 'pricing' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('pricing')}
            >
              Pricing
            </button>
            <button 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${activeTab === 'location' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('location')}
            >
              Location
            </button>
          </div>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="mb-8 sm:mb-12 bg-white rounded-[20px] sm:rounded-[30px] p-4 sm:p-6 shadow-sm relative overflow-hidden">
              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-primary-100 opacity-30 rounded-bl-full"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-800 relative mb-2 sm:mb-2">
                  About this PG
                  <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-500 rounded-full"></div>
                </h2>
              </div>
              
              <p className="text-gray-600 mb-4 sm:mb-6 relative z-10 text-sm sm:text-base">
                {pg.description || `${pg.name} is a comfortable PG accommodation with all the necessary amenities for a pleasant stay. Located in a prime area, it offers easy access to colleges, workplaces, and other essential services.`}
              </p>
              
              <div className="flex justify-start relative z-10">
                <div className="bg-teal-50 rounded-[20px] p-4 shadow-sm border border-teal-100 inline-block max-w-md">
                  <h3 className="text-lg font-semibold text-teal-800 mb-3">Key Details</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-teal-800">Property Type:</span>
                      <span className="ml-1 text-gray-700">
                        {pg.gender === 'male' ? 'Men\'s PG' : 
                         pg.gender === 'female' ? 'Women\'s PG' : 
                         'Unisex PG'}
                      </span>
                    </li>
                    
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-teal-800">Occupancy:</span>
                      <span className="ml-1 text-gray-700">
                        {pg.oneSharing.available && 'Single, '}
                        {pg.twoSharing.available && 'Double, '}
                        {pg.threeSharing.available && 'Triple, '}
                        {pg.fourSharing?.available && 'Four, '}
                        {pg.fiveSharing?.available && 'Five'}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-teal-800">Notice Period:</span>
                      <span className="ml-1 text-gray-700">{pg.noticePeriod || 1} month</span>
                    </li>
                    
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-teal-800">Food Type:</span>
                      <span className="ml-1 text-gray-700">
                        {pg.food ? 
                          (pg.foodType === 'veg' ? 'Vegetarian' : 
                           pg.foodType === 'non-veg' ? 'Non-Vegetarian' : 
                           pg.foodType === 'both' ? 'Veg & Non-Veg' : 'Food Available') : 
                          'No Food Service'}
                      </span>
                    </li>
                    
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-teal-800">Security Deposit:</span>
                      <span className="ml-1 text-gray-700">
                        {pg.deposit?.toLocaleString() || pg.securityDeposit || 'Contact for details'} Rent
                      </span>
                    </li>
                    
                    {/* Additional details from highlights section */}
                    {(pg.nearestCollege) && (
                      <li className="flex items-center">
                        <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <span className="font-medium text-teal-800">Nearest College:</span>
                        <span className="ml-1 text-gray-700">{pg.nearestCollege || 'Major educational institutions'}</span>
                      </li>
                    )}
                    
                    {(pg.security || pg.amenities?.security) && (
                      <li className="flex items-center">
                        <div className="w-3 h-3 bg-teal-500 rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <span className="font-medium text-teal-800">Security:</span>
                        <span className="ml-1 text-gray-700">{typeof pg.security === 'string' ? pg.security : '24/7 Security & Surveillance'}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              {/* End of Key Details section */}
            </div>
            
            <QuirkyAmenities pg={pg} />
            <PricingCards pg={pg} />
            <PGLocation pg={pg} />
          </div>
        )}
        
        {activeTab === 'amenities' && <QuirkyAmenities pg={pg} />}
        {activeTab === 'pricing' && <PricingCards pg={pg} />}
        {activeTab === 'location' && <PGLocation pg={pg} />}
        
        {/* Mobile Contact and Callback Section */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg md:hidden z-20">
          <div className="flex justify-center items-center gap-2">
            <button 
              className="w-3/4 px-2 py-3 text-xs bg-white text-primary-700 border border-primary-700 rounded-full hover:bg-primary-50 transition-all flex items-center justify-center"
              onClick={() => {
                if (currentUser) {
                  // Show the book visit modal for logged in users
                  setShowBookVisitModal(true);
                } else {
                  // Show auth modal for non-authenticated users
                  setAuthTriggerType('contact');
                  setShowAuthModal(true);
                }
              }}
              disabled={isBookingVisit}
            >
              <FiCalendar className="h-4 w-4 mr-1" />
              Book a Visit
            </button>
            <button 
              className="w-full py-3 text-xs bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all flex items-center justify-center"
              onClick={async () => {
                if (currentUser) {
                  // Handle callback request for authenticated users
                  setIsSubmittingCallback(true);
                  try {
                    // Add callback request to Firestore
                    await addCallbackRequest({
                      userId: currentUser.uid,
                      userName: currentUser.displayName || 'User',
                      userEmail: currentUser.email || '',
                      userPhone: currentUser.phoneNumber || '',
                      pgId: pg.id,
                      pgName: pg.name,
                      message: `Callback request for ${pg.name}`,
                      status: 'pending',
                      requestType: 'callback'
                    });
                    
                    // Show thank you modal
                    setShowThankYouModal(true);
                  } catch (error) {
                    console.error('Error submitting callback request:', error);
                    // Show the thank you modal even if there's an error to improve UX
                    setShowThankYouModal(true);
                  } finally {
                    setIsSubmittingCallback(false);
                  }
                } else {
                  // Show auth modal for non-authenticated users
                  setAuthTriggerType('contact');
                  setShowAuthModal(true);
                }
              }}
              disabled={isSubmittingCallback}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 align-center" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Request a Callback
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Wishlist notification */}
      <WishlistNotification 
        isOpen={showWishlistNotification} 
        onClose={() => setShowWishlistNotification(false)}
        message={wishlistNotificationType === 'add' ? 
          `${pg?.name || 'PG'} added to your wishlist` : 
          `${pg?.name || 'PG'} removed from your wishlist`
        }
        type={wishlistNotificationType}
      />
      
      {/* Auth modal */}
      <QuirkyNewAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        viewedPGCount={viewedPGCount}
        redirectPath={location.pathname}
        triggerType={authTriggerType}
      />
      
      {/* Thank you modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={() => setShowThankYouModal(false)}
        pgName={pg?.name || ''}
      />
      
      {/* Share modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={window.location.href}
        title={pg ? pg.name : 'PG Accommodation'}
      />
      
      {/* Book Visit modal */}
      {pg && (
        <BookVisitModal
          isOpen={showBookVisitModal}
          onClose={() => setShowBookVisitModal(false)}
          pgId={pg.id}
          pgName={pg.name}
          onSuccess={() => setShowThankYouModal(true)}
        />
      )}
    </div>
  );
};

export default PGDetailsPage;
