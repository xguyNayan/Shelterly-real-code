import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiRefreshCw, FiMapPin, FiCoffee, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface NoPGsFoundScreenProps {
  message: string;
  onResetFilters: () => void;
  isOpen: boolean;
  onClose?: () => void;
}

// Array of quirky messages
const quirkyMessages = [
  "Oops! Looks like our PGs are playing hide and seek!",
  "Houston, we have a problem... No PGs found in this galaxy!",
  "The PGs must be on vacation. They'll be back soon!",
  "Our PG detector is coming up empty. Time to expand our search!",
  "Hmm, no PGs here. They must be at a secret party!"
];

const NoPGsFoundScreen: React.FC<NoPGsFoundScreenProps> = ({ message, onResetFilters, isOpen, onClose }) => {
  const [quirkyMessage, setQuirkyMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Choose a random quirky message on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quirkyMessages.length);
    setQuirkyMessage(quirkyMessages[randomIndex]);
  }, []);

  // Handle closing the modal
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div 
            className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl bg-white"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
              aria-label="Close modal"
            >
              <FiX className="text-primary-600 text-xl" />
            </button>
            
            {/* Container with message content */}
            <div className="relative p-6 bg-gradient-to-b from-teal-50/20 to-primary-100/20 rounded-2xl">
        
              {/* Wavy design element at top */}
              <div className="absolute top-0 left-0 w-full h-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-8 bg-primary-500/20 rounded-t-2xl"></div>
                <svg className="absolute top-0 left-0 w-full" height="8" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,0 C30,10 70,0 100,10 L100,0 Z" fill="#0694a2" opacity="0.2"/>
                </svg>
              </div>
              
              {/* Message content */}
              <div className="text-center pt-6">
                <h2 className="text-2xl font-bold text-primary-700 mb-2">{quirkyMessage}</h2>
                <p className="text-gray-800 mb-6">{message}</p>
                
                {/* Responsive buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                  <button 
                    onClick={onResetFilters}
                    className="px-6 py-3 bg-primary-500/80 text-white border border-primary-600 
                              rounded-xl hover:bg-primary-600 transition-all 
                              flex items-center justify-center shadow-md hover:shadow-xl
                              font-medium"
                    onMouseEnter={() => setIsAnimating(true)}
                    onMouseLeave={() => setIsAnimating(false)}
                  >
                    <FiRefreshCw className={`mr-2 ${isAnimating ? 'animate-spin' : ''}`} />
                    Reset Filters
                  </button>
                  
                  <Link 
                    to="/" 
                    className="px-6 py-3 bg-teal-500/80 text-white border border-teal-600 
                              rounded-xl hover:bg-teal-600 transition-all 
                              flex items-center justify-center shadow-md hover:shadow-xl
                              font-medium"
                  >
                    <FiHome className="mr-2" />
                    Back to Home
                  </Link>
                </div>
                
                {/* Icon row */}
                <div className="flex justify-center mb-3">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiCoffee className="text-primary-600" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <FiMapPin className="text-teal-600" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiHome className="text-primary-600" />
                    </div>
                  </div>
                </div>
                
                {/* Pro tip box */}
                <div className="text-xs bg-black/50 p-2 rounded-xl text-white mt-2">
                  <span className="font-bold">Pro tip:</span> Try searching for areas like "Koramangala" or "Indiranagar" for best results.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoPGsFoundScreen;
