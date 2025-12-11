import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiX } from 'react-icons/fi';
import { ShelterSwipe } from './index';
import './ShelterSwipeButton.css';

const ShelterSwipeButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleShelterSwipe = () => {
    setIsOpen(!isOpen);
    // Prevent scrolling when modal is open
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Ensure body scroll is restored when component unmounts
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <button 
        className="shelter-swipe-button"
        onClick={toggleShelterSwipe}
        aria-label="Open ShelterSwipe"
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="button-content"
        >
          <FiHome className="icon" />
          <span className="label">Swipe</span>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="shelter-swipe-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleShelterSwipe}
            />
            
            <motion.div
              className="shelter-swipe-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <ShelterSwipe />
              
              <motion.button 
                className="close-button"
                onClick={toggleShelterSwipe}
                whileTap={{ scale: 0.9 }}
                aria-label="Close ShelterSwipe"
              >
                <FiX size={24} />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShelterSwipeButton;
