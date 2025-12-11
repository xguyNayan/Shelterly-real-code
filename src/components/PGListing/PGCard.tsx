import React, { useEffect, useMemo } from 'react';
import { PGData } from './types';
import { getOptimizedImageUrl, getLoadingAttribute, getFetchPriority } from '../../utils/imageOptimization';
import { FiCheck, FiWifi, FiCoffee, FiUsers, FiLock } from 'react-icons/fi';
import { TfiLocationPin } from 'react-icons/tfi';
import { trackEvent, trackPGView } from '../../utils/analytics';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// External counter for tracking renders
const renderCount = 0;
let imageLoadCount = 0;
let cachedImageCount = 0;

// Preload images function with improved caching and logging
const preloadImage = (url: string) => {
  if (!window.imageCache) {
    window.imageCache = new Map<string, boolean>();
  }
  
  if (!window.imageCache.has(url)) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imageLoadCount++;
      window.imageCache.set(url, true);
      
      // Store in browser cache for persistence across sessions
      try {
        const cachedImages = JSON.parse(localStorage.getItem('cachedImages') || '{}');
        cachedImages[url] = true;
        localStorage.setItem('cachedImages', JSON.stringify(cachedImages));
      } catch (error) {
        console.error('Error caching image URL:', error);
      }
    };
  } else {
    // Image is already cached
    cachedImageCount++;
  }
};

// Initialize image cache from localStorage
try {
  if (typeof window !== 'undefined') {
    window.imageCache = window.imageCache || new Map<string, boolean>();
    const cachedImages = JSON.parse(localStorage.getItem('cachedImages') || '{}');
    const cachedUrls = Object.keys(cachedImages);
    cachedUrls.forEach(url => {
      window.imageCache.set(url, true);
    });
  }
} catch (error) {
  console.error('Error loading cached images:', error);
}

interface PGCardProps {
  pg: PGData;
  onClick: (pg: PGData) => void;
  onHover: (pg: PGData | null) => void;
  isHovered: boolean;
  viewedPGCount?: number;
}

// Create a memoized PG card component to prevent unnecessary re-renders
const PGCard: React.FC<PGCardProps> = React.memo(({ pg, onClick, onHover, isHovered, viewedPGCount = 0 }) => {
  const { currentUser } = useAuth();
  // Generate random visitor data for the quirky badge
  const visitorData = useMemo(() => {
    const visitorCount = Math.floor(Math.random() * 9) + 1; // Random number between 1-9
    
    // Array of quirky and flirty phrases with their corresponding background colors
    const options = [
      { 
        phrase: `${visitorCount} students fighting for this `, 
        bgColor: 'bg-yellow-50/70',
        textColor: 'text-yellow-800',
        accentColor: 'text-yellow-600'
      },
      { 
        phrase: `${visitorCount} people booked tours today `, 
        bgColor: 'bg-pink-50/70',
        textColor: 'text-pink-800',
        accentColor: 'text-pink-600'
      },
      { 
        phrase: `${visitorCount} rooms left - hurry up! `, 
        bgColor: 'bg-blue-50/70',
        textColor: 'text-blue-800',
        accentColor: 'text-blue-600'
      },
      { 
        phrase: `Swiped right by ${visitorCount} people today `, 
        bgColor: 'bg-green-50/70',
        textColor: 'text-green-800',
        accentColor: 'text-green-600'
      },
      { 
        phrase: `${visitorCount} people crushing on this PG `, 
        bgColor: 'bg-orange-50/70',
        textColor: 'text-orange-800',
        accentColor: 'text-orange-600'
      },
      { 
        phrase: `${visitorCount} people sliding into DMs for this `, 
        bgColor: 'bg-red-50/70',
        textColor: 'text-red-800',
        accentColor: 'text-red-600'
      },
      { 
        phrase: `This PG is ${visitorCount} people's type `, 
        bgColor: 'bg-indigo-50/70',
        textColor: 'text-indigo-800',
        accentColor: 'text-indigo-600'
      }
    ];
    
    // Pick a random option
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }, [pg.id]); // Stable for each PG
  // Calculate minimum price once based on room sharing options
  const minPrice = useMemo(() => {
    const prices: number[] = [];
    if (pg.oneSharing?.available && pg.oneSharing.price) prices.push(pg.oneSharing.price);
    if (pg.twoSharing?.available && pg.twoSharing.price) prices.push(pg.twoSharing.price);
    if (pg.threeSharing?.available && pg.threeSharing.price) prices.push(pg.threeSharing.price);
    if (pg.fourSharing?.available && pg.fourSharing.price) prices.push(pg.fourSharing.price);
    if (pg.fiveSharing?.available && pg.fiveSharing.price) prices.push(pg.fiveSharing.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [pg.oneSharing, pg.twoSharing, pg.threeSharing, pg.fourSharing, pg.fiveSharing]);

  // Preload additional images when hovering
  useEffect(() => {
    if (isHovered) {
      if (pg.photos && pg.photos.length > 1) {
        const timer = setTimeout(() => {
          preloadImage(pg.photos[1].url);
          if (pg.photos.length > 2) preloadImage(pg.photos[2].url);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [pg.photos, isHovered]);

  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden shadow-md transition-all cursor-pointer border border-primary-100 flex flex-col sm:flex-row ${isHovered ? 'shadow-lg border-primary-600' : 'border-primary-100'}`}
      onClick={() => {
        // Track PG click event in Google Analytics
        trackPGView(pg.id, pg.name);
        onClick(pg);
      }}
      onMouseEnter={() => onHover(pg)}
      onMouseLeave={() => onHover(null)}
    >
      {/* PG Image - Left Side on desktop, Top on mobile */}
      <div className="w-full sm:w-1/3 bg-gray-200 relative h-[180px] sm:h-auto">
        {pg.photos && pg.photos.length > 0 ? (
          <picture>
            <source srcSet={getOptimizedImageUrl(pg.photos[0].url)} type="image/webp" />
            <img 
              src={pg.photos[0].url} 
              alt={pg.name} 
              className="w-full h-full object-cover"
              loading={getLoadingAttribute(0)}
              fetchPriority={getFetchPriority(true)}
              width="300"
              height="280"
              decoding="async"
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {/* Gender Badge */}
        <div className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full ${
          pg.gender === 'male' ? 'bg-primary-100 text-primary-800' : 
          pg.gender === 'female' ? 'bg-pink-500 text-white' : 
          'bg-purple-100 text-purple-800'
        }`}>
          {pg.gender === 'male' ? 'MALE' :
           pg.gender === 'female' ? 'FEMALE' : 'UNISEX'}
        </div>
        
        {/* Verified Badge */}
        {pg.isVerified && (
          <div className="absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full bg-primary-600 text-white flex items-center">
            <FiCheck className="mr-1" />
            VERIFIED
          </div>
        )}
        
        {/* Gender Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-medium rounded-full flex items-center ${pg.gender === 'male' ? 'bg-blue-500 text-white' : pg.gender === 'female' ? 'bg-pink-500 text-white' : 'bg-purple-500 text-white'}`}>
          {pg.gender === 'male' ? 'Men\'s' : pg.gender === 'female' ? 'Women\'s' : 'Unisex'}
        </div>
        
        {/* Quirky Visitor Badge */}
        <motion.div 
          className={`absolute -bottom-0 left-0 right-0 px-3 py-2 text-xs font-medium ${visitorData.bgColor} backdrop-blur-md border-t border-white/30 ${visitorData.textColor} flex items-center justify-center shadow-lg overflow-hidden backdrop-filter`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1}}

        >
          {/* Enhanced shimmering glass effect */}
          <motion.div 
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 opacity-80"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ 
              duration: 1.8, 
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "easeInOut"
            }}
          />
          
          {/* Second shimmer layer for more depth */}
          <motion.div 
            className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-15deg] opacity-70"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ 
              duration: 2.2, 
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <FiUsers className={`mr-2 ${visitorData.accentColor}`} />
          <span className="relative z-10 font-medium">{visitorData.phrase}</span>
        </motion.div>
      </div>
      
      {/* PG Info - Right Side on desktop, Bottom on mobile */}
      <div className="w-full sm:w-2/3 p-3 flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-primary-800 mb-1">{pg.name}</h3>
          <p className="flex items-center text-sm text-gray-600 line-clamp-1 mb-1"> <TfiLocationPin className="mr-1" /> {pg.location}</p>
        </div>
        
        {/* Room Options */}
        <div className="mb-4 bg-primary-50 p-2 rounded-lg border border-primary-100">
          <p className="text-xs font-medium mb-1 text-primary-700">Room Options</p>
          <div className="grid grid-cols-2 gap-2">
            {pg.oneSharing?.available && pg.oneSharing.price && (
              <div className="text-xs bg-white px-2 py-1.5 rounded-md shadow-sm hover:shadow transition-shadow">
                <div className="font-medium text-gray-700 text-[10px]">Single</div>
                <div className="text-primary-600 font-bold">₹{pg.oneSharing.price.toLocaleString()}</div>
              </div>
            )}
            {pg.twoSharing?.available && pg.twoSharing.price && (
              <div className="text-xs bg-white px-2 py-1.5 rounded-md shadow-sm hover:shadow transition-shadow">
                <div className="font-medium text-gray-700 text-[10px]">Double</div>
                <div className="text-primary-600 font-bold">₹{pg.twoSharing.price.toLocaleString()}</div>
              </div>
            )}
            {pg.threeSharing?.available && pg.threeSharing.price && (
              <div className="text-xs bg-white px-2 py-1.5 rounded-md shadow-sm hover:shadow transition-shadow">
                <div className="font-medium text-gray-700 text-[10px]">Triple</div>
                <div className="text-primary-600 font-bold">₹{pg.threeSharing.price.toLocaleString()}</div>
              </div>
            )}
            {pg.fourSharing?.available && pg.fourSharing.price && (
              <div className="text-xs bg-white px-2 py-1.5 rounded-md shadow-sm hover:shadow transition-shadow">
                <div className="font-medium text-gray-700 text-[10px]">Four</div>
                <div className="text-primary-600 font-bold">₹{pg.fourSharing.price.toLocaleString()}</div>
              </div>
            )}
            {pg.fiveSharing?.available && pg.fiveSharing.price && (
              <div className="text-xs bg-white px-2 py-1.5 rounded-md shadow-sm hover:shadow transition-shadow">
                <div className="font-medium text-gray-700 text-[10px]">Five</div>
                <div className="text-primary-600 font-bold">₹{pg.fiveSharing.price.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Amenities */}
        <div className="mb-2">
          <p className="text-xs font-medium mb-1">Amenities</p>
          <div className="flex flex-wrap gap-1.5">
            {pg.wifi && (
            <span className="flex items-center text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
              WiFi
            </span>
          )}
          {pg.amenities?.ac && (
            <span className="flex items-center text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
              AC
            </span>
            )}
            {pg.food && (
            <span className="flex items-center text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
                Food
            </span>
            )}
            {pg.washroom === 'attached' && (
            <span className="flex items-center text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
                Attached Bath
            </span>
            )}
          </div>
        </div>
        
        <div className="mt-auto flex items-center justify-between pt-1 border-t border-gray-100">
          <div className="text-[10px] text-gray-600">
            Deposit: {pg.deposit ? `${pg.deposit.toLocaleString()} month${pg.deposit > 1 ? 's' : ''}` : 'None'}
          </div>
          <button 
            className="px-3 py-1 sm:px-4 sm:py-1.5 bg-primary-500 text-white text-xs sm:text-sm rounded-full hover:bg-primary-600 transition-colors flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the card click event
              onClick(pg); // This will be handled in PGListingPage
            }}
          >
            {!currentUser && <FiLock className="mr-1 sm:mr-1.5" size={12} />}
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});



PGCard.displayName = 'PGCard';

export default PGCard;
