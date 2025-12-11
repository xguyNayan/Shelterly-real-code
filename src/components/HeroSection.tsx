import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SearchLoadingModal from './SearchLoadingModal';
import { trackSearchQuery } from '../services/analyticsService';
import { getLocationNameFromCoordinates } from '../utils/reverseGeocoding';
import { getCurrentLocation, GeolocationErrorType } from '../utils/geolocation';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
// Import optimized WebP images
import heroImageWebP from '../assets/images/hero.webp';
import heroImageSmallWebP from '../assets/images/hero-small.webp';

const HeroSection = () => {
  const navigate = useNavigate();
  const [testimonialImages, setTestimonialImages] = useState<string[]>([]);
  
  // Load testimonial images from Firebase Storage
  useEffect(() => {
    const loadTestimonialImages = async () => {
      try {
        const imageRefs = [
          'testimonials/WhatsApp Image 2025-04-25 at 21.16.12.jpeg',
          'testimonials/WhatsApp Image 2025-04-25 at 21.13.58.jpeg',
          'testimonials/WhatsApp Image 2025-04-26 at 00.50.38.jpeg'
        ];
        
        const imageUrls = await Promise.all(
          imageRefs.map(async (imagePath) => {
            try {
              const imageRef = ref(storage, imagePath);
              return await getDownloadURL(imageRef);
            } catch (error) {
              console.error(`Error loading image ${imagePath}:`, error);
              // Fallback to a default image if loading fails
              return 'https://via.placeholder.com/150';
            }
          })
        );
        
        setTestimonialImages(imageUrls);
      } catch (error) {
        console.error('Error loading testimonial images:', error);
      }
    };
    
    loadTestimonialImages();
  }, []);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [searchMode, setSearchMode] = useState('search'); // 'search' or 'nearMe'
  const [isMobile, setIsMobile] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  // Store location data for potential future use (e.g., displaying on UI)
  const [, setCurrentLocation] = useState<{lat: number, lng: number, name?: string} | null>(null);
  
  // For swipe animation in phone screen
  const [currentCard, setCurrentCard] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Sample PG cards for the swipe animation
  const samplePGs = [
    {
      id: 1,
      name: 'Comfort PG',
      location: 'Near Tech Park',
      price: '₹8.5K/month',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 2,
      name: 'Luxury Stays',
      location: 'Koramangala',
      price: '₹12K/month',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 3,
      name: 'Student House',
      location: 'Near University',
      price: '₹7K/month',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
    }
  ];

  useEffect(() => {
    // Check if device is mobile and detect Windows platform
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Detect Windows platform using user agent
      const isWindowsOS = navigator.userAgent.indexOf('Windows') !== -1;
      setIsWindows(isWindowsOS);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Swipe animation effect
  useEffect(() => {
    if (!isVisible) return;
    
    const swipeInterval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        // Alternate between left and right swipes
        const direction = currentCard % 2 === 0 ? 'right' : 'left';
        setSwipeDirection(direction);
        
        // Wait for animation to complete before resetting
        setTimeout(() => {
          setCurrentCard((prev) => (prev + 1) % samplePGs.length);
          setSwipeDirection(null);
          setIsAnimating(false);
        }, 1500);
      }
    }, 3000);
    
    return () => clearInterval(swipeInterval);
  }, [isVisible, currentCard, isAnimating, samplePGs.length]);

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Ensure search suggestions are visible when typing
    if (!isSearchFocused) {
      setIsSearchFocused(true);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') return;
    
    // Track search query in analytics
    try {
      console.log('Tracking search query:', searchQuery);
      trackSearchQuery(searchQuery, false)
        .then(() =>  ('Successfully tracked search query'))
        .catch(error => console.error('Error tracking search query:', error));
    } catch (error) {
      console.error('Error calling trackSearchQuery:', error);
    }
    
    // Show loading modal
    setShowLoadingModal(true);
    
    // After modal closes, redirect to PG listing with search query
    setTimeout(() => {
      navigate(`/pg-listing?location=${encodeURIComponent(searchQuery)}`);
    }, 3000);
    
    // Remove focus from the input
    setIsSearchFocused(false);
  };

  // Handle Near Me button click using our improved geolocation and detailed geocoding
  const handleNearMe = async () => {
    // Set loading state
    setIsGettingLocation(true);
    setLocationError('');
    
    // Track near me search in analytics
     ('Tracking Near Me search');
    try {
      trackSearchQuery('Near Me Location Search', true)
        .then(() =>  ('Successfully tracked Near Me search'))
        .catch(error => console.error('Error tracking Near Me search:', error));
    } catch (error) {
      console.error('Error calling trackSearchQuery for Near Me:', error);
    }
    
    // Show loading modal
    setShowLoadingModal(true);
    
    // Get current location
    getCurrentLocation()
      .then(async (position) => {
        const { latitude, longitude } = position;
        
        try {
          // Get location name from coordinates
          const locationName = await getLocationNameFromCoordinates(latitude, longitude);
          
          // Store location data for potential future use
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            name: locationName
          });
          
          // Navigate to PG listing with coordinates
          navigate(`/pg-listing?lat=${latitude}&lng=${longitude}&location=${encodeURIComponent(locationName || 'Current Location')}`);
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocationError('Error getting your location name. Please try again.');
          setShowLoadingModal(false);
        }
      })
      .catch((error: any) => {
        console.error('Error getting location:', error);
        
        // Hide loading modal
        setShowLoadingModal(false);
        
        // Set appropriate error message
        if (error.code === GeolocationErrorType.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please enable location services.');
        } else if (error.code === GeolocationErrorType.POSITION_UNAVAILABLE) {
          setLocationError('Location unavailable. Please try again later.');
        } else {
          setLocationError('Error getting your location. Please try again.');
        }
      })
      .finally(() => {
        setIsGettingLocation(false);
      });
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    if (searchMode === 'search') {
      setSearchMode('nearMe');
      // Track toggle to Near Me mode
      trackSearchQuery('Toggled to Near Me mode', true);
      handleNearMe();
    } else {
      setSearchMode('search');
      // Track toggle to Search mode
      trackSearchQuery('Toggled to Search mode', false);
    }
  };


  return (
    <section className="relative min-h-screen overflow-y-visible overflow-x-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Top wave */}
      <div className="absolute top-0 left-0 w-full">
        <svg viewBox="0 0 1440 320" className="w-full" preserveAspectRatio="none">
          <path 
            fill="#008080" 
            fillOpacity="0.3"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,176C960,213,1056,267,1152,266.7C1248,267,1344,213,1392,186.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>
      
      {/* Curved accent line - top right */}
      <div className="absolute top-0 right-0 w-1/2 h-1/3">
        <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M100,0 C130,40 170,50 200,60 L200,0 Z"
            fill="#40E0D0"
            fillOpacity="0.5"
          ></path>
        </svg>
      </div>
    
      {/* Grid pattern */}
      <div className="absolute inset-0 z-0 opacity-0">
        <div className="w-full h-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      
      {/* Decorative wave elements for mobile - top */}
      <div className="absolute top-0 left-0 w-full h-64 overflow-hidden md:hidden z-0">
        <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full">
          <path 
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" 
            fill="#14898A" 
            fillOpacity="0.2"
          ></path>
          <path 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" 
            fill="#62B299" 
            fillOpacity="0.15"
          ></path>
        </svg>
      </div>
      
      {/* Decorative floating shapes */}
      <div className="absolute top-20 right-5 w-16 h-16 rounded-full bg-primary-500 opacity-10 md:hidden animate-pulse"></div>
      <div className="absolute top-40 left-4 w-8 h-8 rounded-full bg-accent opacity-15 md:hidden animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-60 right-10 w-12 h-12 rounded-md rotate-45 bg-primary-500 opacity-10 md:hidden animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Mobile layout - flex column with model on top and text below */}
      <div className="md:hidden flex flex-col h-screen w-full pt-16 relative z-10">
        {/* Hero image - centered and properly sized for mobile */}
        <div className="relative w-full h-[40vh] flex items-center justify-center" >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden -top-24">
            <div className="relative">
              <picture>
                <source srcSet={heroImageSmallWebP} media="(max-width: 767px)" type="image/webp" />
                <source srcSet={heroImageWebP} media="(min-width: 768px)" type="image/webp" />
                <img 
                  src={heroImageWebP}
                  alt="Shelterly Hero" 
                  className="object-contain w-full h-full max-h-[550px]"
                  width="1428"
                  height="2000"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
              
              {/* Swipe animation overlay positioned on the phone screen in the image */}
              <div className="absolute top-[39%] right-[8%] w-[25%] h-[41%] overflow-hidden rounded-[20px] translate-y-[2px] before:content-[''] before:absolute before:top-0 before:left-[35%] before:right-[35%] before:h-[10px] before:bg-gray-900 before:rounded-b-[10px] before:z-50" style={{ transform: 'perspective(500px) rotateY(-8deg)' }}>
                <AnimatePresence>
                  {samplePGs.map((pg, index) => (
                    index === currentCard && (
                      <motion.div
                        key={pg.id}
                        className="absolute w-full h-full bg-white overflow-hidden rounded-[18px]"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          x: swipeDirection === 'left' ? -200 : swipeDirection === 'right' ? 200 : 0,
                          rotate: swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="h-[60%] overflow-hidden">
                          <img 
                            src={pg.image} 
                            alt={pg.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 bg-white">
                          <h3 className="font-bold text-xs text-primary-600 truncate">{pg.name}</h3>
                          <div className="flex items-center text-[8px] text-gray-500 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {pg.location}
                          </div>
                          <div className="text-xs font-semibold mt-1 text-primary-500">{pg.price}</div>
                        </div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
                
                {/* Swipe indicators - smaller for overlay */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-4 z-20">
                  <motion.div 
                    className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md"
                    animate={{
                      scale: swipeDirection === 'left' ? [1, 1.2, 1] : 1,
                      opacity: swipeDirection === 'left' ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </motion.div>
                  <motion.div 
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md"
                    animate={{
                      scale: swipeDirection === 'right' ? [1, 1.2, 1] : 1,
                      opacity: swipeDirection === 'right' ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content below model on mobile - centered with proper spacing */}
        <div className="w-full h-[60vh] flex flex-col items-center justify-start px-4 -mt-10">
          <div className="w-full max-w-md text-center">
            {/* Animated content elements */}
            <div 
              className={`transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <span className="inline-block mt-2 py-1 px-3 bg-black text-white text-xs tracking-wider uppercase rounded-sm mb-3">
                Shelterly Housing
              </span>
            </div>
            
            <h1 
              className={`text-3xl font-bold text-gray-900 leading-tight mb-3 transition-all duration-1000 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Find Your Perfect PG<br />
              <span className="text-primary-500">In a Swipe</span>
            </h1>
            
            <p 
              className={`text-xs font-light text-gray-800 mb-4 mt-4 mx-auto max-w-72 transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
             Everything you need to find your next PG—trusted, fast, and stress-free
            </p>
            
            <div 
              className={`flex flex-wrap gap-2 justify-center mb-4 mt-12 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Link 
                to="/pg-listing" 
                className="px-5 py-2 bg-white text-primary-600 text-sm font-medium rounded-full backdrop-blur-md bg-opacity-70 border border-primary-100 hover:bg-opacity-100 transition-colors shadow-md flex items-center justify-center"
              >
                <span>Explore PGs</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link 
                to="/shelter-swipe" 
                className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-full backdrop-blur-md bg-opacity-70 border border-primary-100 hover:bg-opacity-100 transition-colors shadow-md flex items-center justify-center"
              >
                <span>Swipe PGs</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div 
              className={`flex mt-8 items-center justify-center space-x-3 transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex -space-x-1.5">
                {testimonialImages.length > 0 ? (
                  testimonialImages.map((imageUrl, index) => (
                    <img 
                      key={index}
                      src={imageUrl} 
                      className="w-5 h-5 rounded-full border-2 border-white object-cover" 
                      alt={`Testimonial user ${index + 1}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  ))
                ) : (
                  // Fallback images while loading
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
                  </>
                )}
              </div>
              <span className="text-xs text-gray-700 bg-white/50 px-2 py-1 rounded-sm">100+ verified beds</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop layout - side by side */}
      <div className="hidden md:block">
        {/* Full-width and height hero image background */}
        <div className="absolute inset-0 w-full h-full left-80 pointer-events-auto z-10 flex items-center justify-center overflow-hidden -top-36">
          <div className="relative">
            <picture>
              <source srcSet={heroImageSmallWebP} media="(max-width: 767px)" type="image/webp" />
              <source srcSet={heroImageWebP} media="(min-width: 768px)" type="image/webp" />
              <img 
                src={heroImageWebP} 
                alt="Shelterly Hero" 
                className="object-contain h-full max-h-[950px]"
                width="1428"
                height="2000"
                loading="eager"
                fetchPriority="high"
              />
            </picture>
            
            {/* Swipe animation overlay positioned on the phone screen in the image */}
            <div className="absolute top-[39%] right-[30%] w-[12%] h-[41%] overflow-hidden rounded-[20px] translate-y-[2px] before:content-[''] before:absolute before:top-0 before:left-[35%] before:right-[35%] before:h-[10px] before:bg-gray-900 before:rounded-b-[10px] before:z-50" style={{ transform: 'perspective(500px) rotateY(-8deg)' }}>
              <AnimatePresence>
                {samplePGs.map((pg, index) => (
                  index === currentCard && (
                    <motion.div
                      key={pg.id}
                      className="absolute w-full h-full bg-white overflow-hidden rounded-[18px]"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        x: swipeDirection === 'left' ? -200 : swipeDirection === 'right' ? 200 : 0,
                        rotate: swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="h-[60%] overflow-hidden">
                        <img 
                          src={pg.image} 
                          alt={pg.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 bg-white">
                        <h3 className="font-bold text-xs text-primary-600 truncate">{pg.name}</h3>
                        <div className="flex items-center text-[8px] text-gray-500 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {pg.location}
                        </div>
                        <div className="text-xs font-semibold mt-1 text-primary-500">{pg.price}</div>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
              
              {/* Swipe indicators - smaller for overlay */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-4 z-20">
                <motion.div 
                  className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md"
                  animate={{
                    scale: swipeDirection === 'left' ? [1, 1.2, 1] : 1,
                    opacity: swipeDirection === 'left' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </motion.div>
                <motion.div 
                  className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md"
                  animate={{
                    scale: swipeDirection === 'right' ? [1, 1.2, 1] : 1,
                    opacity: swipeDirection === 'right' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content overlay - positioned to complement the 3D model - FIXED: increased z-index */}
        <div className="relative z-20 h-screen flex items-center left-40 pointer-events-none">
          <div className="container mx-auto">
            <div className="max-w-md md:ml-0 lg:ml-4 mt-0 md:-mt-12 pointer-events-auto">
              {/* Animated content elements */}
              <div 
                className={`transition-all duration-700 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
              >
                <span className="inline-block py-1 px-3 bg-black text-white text-xs tracking-wider uppercase rounded-sm mb-6">
                  Shelterly Housing
                </span>
              </div>
              
              <h1 
                className={`text-5xl md:text-6xl font-bold text-gray-900 leading-none mb-6 transition-all duration-1000 delay-100 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                Find Your<br />
                <span className="text-primary-500">Perfect PG</span>
              </h1>
              
              <p 
                className={`text-lg text-gray-800 mb-8 max-w-sm transition-all duration-1000 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                Swipe through verified PGs and find your perfect stay—fast and easy.

              </p>
              
              <div 
                className={`flex flex-wrap gap-4 mb-10 transition-all duration-1000 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <Link 
                  to="/pg-listing" 
                  className="px-8 py-3 bg-primary-500 text-white font-medium rounded-full backdrop-blur-md bg-opacity-90 hover:bg-opacity-100 transition-colors shadow-md flex items-center justify-center"
                >
                  <span>Explore PGs</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <a 
                  href="mailto:shelterly.in@gmail.com?subject=List%20my%20PG%20on%20Shelterly&body=Hello%20Shelterly%20Team,%0A%0AI%20would%20like%20to%20list%20my%20PG%20on%20your%20platform.%0A%0APG%20Details:%0A-%20Name:%0A-%20Location:%0A-%20Contact%20Number:%0A-%20Number%20of%20Rooms:%0A-%20Price%20Range:%0A%0AThank%20you!" 
                  className="px-8 py-3 bg-white/70 text-primary-600 font-medium rounded-full backdrop-blur-md border border-primary-100 hover:bg-white/90 transition-colors shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  List your PG
                </a>
              </div>
              
              <div 
                className={`flex items-center -space-x-2 transition-all duration-1000 delay-400 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                {testimonialImages.length > 0 ? (
                  testimonialImages.map((imageUrl, index) => (
                    <img 
                      key={index}
                      src={imageUrl} 
                      className="w-8 h-8 rounded-full border-2 border-white object-cover space-x-10" 
                      alt={`Testimonial user ${index + 1}`} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  ))
                ) : (
                  // Fallback images while loading
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
                    <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
                  </>
                )}
                <span className="text-sm text-gray-700 bg-white/50 py-1 px-4 rounded-sm">100+ verified beds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modern Search Bar - Fixed at bottom - Responsive for mobile and Windows */}
      <div className={`absolute ${isMobile ? 'bottom-16' : isWindows ? 'bottom-32' : 'bottom-24'} left-0 right-0 z-30 px-4`}>
        <div 
          className={`max-w-4xl mx-auto transition-all duration-1000 delay-500  ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className={`
            bg-primary-500/80 backdrop-blur-2xl ${isMobile ? 'p-1.5' : 'p-2'} rounded-full shadow-xl 
            border border-gray-100 hover:shadow-2xl transition-all duration-300
            ${isSearchFocused ? 'scale-[1.02] shadow-2xl' : ''}
            ${isWindows ? 'mb-4' : ''}
          `}>
            <form onSubmit={handleSearchSubmit} className="flex items-center justify-center text-white z-50">
              {/* Search Input - Smaller for mobile */}
              <input
                type="text"
                placeholder={isMobile ? "Search location..." : "Search by college, locality or landmark..."}
                className={`w-full text-white ${isMobile ? 'py-2 px-4 text-sm' : 'py-3 px-6'} bg-transparent text-white focus:outline-none placeholder:text-white/90`}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  // Delay hiding suggestions to allow click events on suggestions to fire
                  setTimeout(() => {
                    setIsSearchFocused(false);
                  }, 200);
                }}
              />
              
              {/* Toggle Switch - Smaller for mobile */}
              <div className="relative mx-2 flex items-center">
                <div 
                  className={`
                    ${isMobile ? 'w-[140px] h-[34px]' : 'w-[180px] h-[40px]'} rounded-full p-1 cursor-pointer flex text-white
                    ${searchMode === 'search' ? 'bg-gray-200' : 'bg-primary-100'}
                    transition-colors duration-300
                  `}
                  onClick={toggleSearchMode}
                >s
                  {/* Toggle Slider */}
                  <div 
                    className={`
                      absolute ${isMobile ? 'w-[68px] h-[26px]' : 'w-[90px] h-[32px]'} rounded-full bg-white shadow-md transform justify-center items-center transition-transform duration-300
                      ${searchMode === 'search' 
                        ? 'translate-x-0' 
                        : isMobile ? 'translate-x-[66px]' : 'translate-x-[84px]'
                      }
                    `}
                  ></div>
                  
                  {/* Search Option */}
                  <div className={`
                    flex items-center justify-center gap-1 ${isMobile ? 'w-[68px]' : 'w-[90px]'} h-full z-10
                    ${searchMode === 'search' ? 'text-primary-600 font-medium' : 'text-gray-500 text-white'}
                    transition-colors duration-300
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} whitespace-nowrap`}>Search</span>
                  </div>
                  
                  {/* Near Me Option */}
                  <div className={`
                    flex items-center justify-center gap-1 ${isMobile ? 'w-[68px]' : 'w-[90px]'} h-full z-10 px-2
                    ${searchMode === 'nearMe' ? 'text-primary-600 font-medium' : 'text-gray-500'}
                    transition-colors duration-300
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} whitespace-nowrap`}>Near Me</span>
                  </div>
                </div>
              </div>
              
              {/* Search Button - Icon Only - Smaller for mobile */}
              <button
                type="submit"
                className={`${isMobile ? 'p-2' : 'p-3'} bg-primary-500 text-white font-medium rounded-full hover:bg-primary-600 transition-colors shadow-md flex items-center justify-center`}
                aria-label={searchMode === 'search' ? 'Search' : 'Find Near Me'}
              >
                {isGettingLocation ? (
                  <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
              </button>
            </form>
            
            {/* Location Error Message */}
            {locationError && (
              <div className={`px-4 py-2 ${isMobile ? 'text-[10px]' : 'text-xs'} text-red-600`}>
                {locationError}
              </div>
            )}
            

            
            {/* Search Loading Modal */}
            <SearchLoadingModal 
              isOpen={showLoadingModal}
              onClose={() => setShowLoadingModal(false)}
              searchType={searchMode === 'search' ? 'location' : 'nearMe'}
              searchQuery={searchQuery}
            />
          </div>
          
          {/* Search Suggestions - Show when focused regardless of input */}
          {isSearchFocused && (
            <div className={`
              absolute top-full left-0 right-0 ${isWindows ? 'mt-6' : 'mt-2'} bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 overflow-hidden
              transition-all duration-300 max-h-60 overflow-y-auto z-70
            `}>
              <div className="p-2">
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 px-3 py-1 `}>Suggested locations</p>
                
                <div className="space-y-1">
                  {['Shanti Nagar', 'St joseph\'s', 'Wilson Garden']
                    .filter(suggestion => 
                      searchQuery.trim() === '' || suggestion.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((suggestion, index) => (
                      <div 
                        key={index}
                        className="px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // Set the search query
                          setSearchQuery(suggestion);
                          
                          // Keep focus on the input to show the selection visually
                          setTimeout(() => {
                            // Automatically submit the form after selecting a suggestion
                            if (searchMode === 'search') {
                              // Show loading modal
                              setShowLoadingModal(true);
                              
                              // After modal closes, redirect to PG listing with search query
                              setTimeout(() => {
                                navigate(`/pg-listing?location=${encodeURIComponent(suggestion)}`);
                              }, 3000);
                              
                              // Now remove focus
                              setIsSearchFocused(false);
                            }
                          }, 100);
                        }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400 mr-2`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-800`}>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
