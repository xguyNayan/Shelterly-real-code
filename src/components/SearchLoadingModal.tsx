import React, { useEffect, useState } from 'react';
import { FiHome, FiSearch, FiMapPin } from 'react-icons/fi';

interface SearchLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchType: 'location' | 'nearMe';
  searchQuery?: string;
}

const SearchLoadingModal: React.FC<SearchLoadingModalProps> = ({ 
  isOpen, 
  onClose,
  searchType,
  searchQuery 
}) => {
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingDots, setLoadingDots] = useState('');
  
  // Array of quirky loading messages
  const quirkyMessages = [
    "Hunting for your dream PG like it's the last slice of pizza",
    "Scouting for places where WiFi is stronger than Monday blues",
    "Finding rooms with walls that don't judge your singing",
    "Locating PGs where roommates don't steal your food",
    "Searching for places with bathrooms bigger than a shoebox",
    "Finding homes where the neighbors don't practice drums at 2 AM",
    "Looking for PGs with fridges that don't smell like science experiments",
    "Seeking places where hot water isn't just a myth",
    "Finding rooms where you can actually fit your stuff",
    "Locating PGs with landlords who remember your name"
  ];
  
  // Choose a random message on mount
  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * quirkyMessages.length);
      setLoadingMessage(quirkyMessages[randomIndex]);
      
      // Animation for loading dots
      const dotsInterval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);
      
      // Auto-close after 3 seconds (simulating search completion)
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => {
        clearInterval(dotsInterval);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 opacity-30 rounded-bl-full"></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            {searchType === 'location' ? (
              <FiSearch className="text-primary-500" size={28} />
            ) : (
              <FiMapPin className="text-primary-500" size={28} />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {searchType === 'location' 
              ? `Searching near "${searchQuery}"` 
              : "Searching near your location"}
          </h3>
          
          <p className="text-gray-600 mb-4">{loadingMessage}{loadingDots}</p>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          <div className="flex items-center text-sm text-primary-600 font-medium">
            <FiHome className="mr-1" />
            <span>Finding your perfect shelter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchLoadingModal;
