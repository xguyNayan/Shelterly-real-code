import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiX, FiInfo, FiArrowRight, FiCheck, FiArrowLeft, FiChevronRight, FiPhone, FiList } from 'react-icons/fi';
import logo from '../../assets/images/logo.png';
interface ShelterSwipeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShelterSwipeTutorial: React.FC<ShelterSwipeTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const tutorialSteps = [
    {
      title: "Welcome to ShelterSwipe!",
      description: "Find your perfect PG accommodation with a simple swipe interface.",
      icon: <FiInfo className="text-3xl text-blue-500" />
    },
    {
      title: "Swipe Right to Like",
      description: "Swipe right or tap the heart icon to add a PG to your wishlist.",
      icon: <FiHeart className="text-3xl text-pink-500" />
    },
    {
      title: "Swipe Left to Skip",
      description: "Swipe left or tap the X icon to skip a PG that doesn't interest you.",
      icon: <FiX className="text-3xl text-gray-500" />
    },
    {
      title: "Request a Callback",
      description: "Tap the phone icon to request a callback about a PG you're interested in.",
      icon: <FiPhone className="text-3xl text-primary-600" />
    },
    {
      title: "View Your Wishlist",
      description: "Use the heart button in the top right to access your saved PGs anytime.",
      icon: <FiList className="text-3xl text-pink-500" />
    },
    {
      title: "View Details",
      description: "Scroll down to see more photos and information about each PG.",
      icon: <FiInfo className="text-3xl text-blue-500" />
    },
    {
      title: "Ready to Go!",
      description: "Now you're ready to find your perfect PG accommodation!",
      icon: <FiCheck className="text-3xl text-green-500" />
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleSkip}
          />
          
          {/* Modal content - centered and fixed in place */}
          <motion.div
            className="bg-white/90 rounded-2xl p-6 max-w-md w-full shadow-xl backdrop-blur-md relative z-10"
            initial={{ scale: 0, opacity: 0, y: 100, x: 50, zIndex: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0, x: 0, zIndex: 100 }}
            exit={{ scale: 0, opacity: 0, y: 100, x: 50, zIndex: 100 }}
            transition={{ 
              type: "spring", 
              damping: 60, 
              stiffness: 600,
              duration: 0.3
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress indicator */}
            <div className="flex justify-center mb-6 gap-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'w-10 bg-primary-500' : 'w-5 bg-gray-200'
                  }`}
                ></div>
              ))}
            </div>

            {/* Step content */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4 bg-primary-50 w-16 h-16 rounded-full mx-auto items-center justify-center shadow-sm">
                {tutorialSteps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-bold mb-3 text-primary-800">{tutorialSteps[currentStep].title}</h2>
              <p className="text-gray-600 text-lg">{tutorialSteps[currentStep].description}</p>
            </div>

            {/* Tutorial illustration */}
            <div className="mb-8 flex justify-center">
              {currentStep === 0 && (
                <div className="w-64 h-64 bg-primary-50 rounded-xl flex items-center justify-center shadow-md">
                  <img 
                    src={logo}
                    alt="Welcome" 
                    className="w-40 h-40 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/150?text=ShelterSwipe";
                    }}
                  />
                </div>
              )}
              {currentStep === 1 && (
                <div className="w-64 h-64 bg-pink-50 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-52 bg-white rounded-lg shadow-lg flex items-center justify-center">
                      <FiHeart className="text-6xl text-pink-500" />
                    </div>
                  </div>
                  <motion.div
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    initial={{ x: 0 }}
                    animate={{ x: 30 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                  >
                    <FiArrowRight className="text-4xl text-primary-600" />
                  </motion.div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="w-64 h-64 bg-gray-50 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-52 bg-white rounded-lg shadow-lg flex items-center justify-center">
                      <FiX className="text-6xl text-gray-500" />
                    </div>
                  </div>
                  <motion.div
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    initial={{ x: 0 }}
                    animate={{ x: -30 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                  >
                    <FiArrowLeft className="text-4xl text-gray-500" />
                  </motion.div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="w-64 h-64 bg-primary-50 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-52 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center gap-3">
                      <div className="w-32 h-20 bg-gray-200 rounded-md"></div>
                      <div className="w-32 h-5 bg-gray-200 rounded-md"></div>
                      <div className="w-28 h-5 bg-gray-200 rounded-md"></div>
                      <div className="w-24 h-5 bg-gray-200 rounded-md"></div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute bottom-16 right-4 z-50"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.2 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                  >
                    <div className="bg-primary-600 p-3 rounded-full shadow-lg">
                      <FiPhone className="text-xl text-white" />
                    </div>
                  </motion.div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="w-64 h-64 bg-pink-50 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-52 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center gap-3">
                      <div className="w-32 h-8 bg-pink-200 rounded-md flex items-center justify-center">
                        <FiHeart className="text-pink-500" />
                      </div>
                      <div className="w-32 h-8 bg-pink-200 rounded-md flex items-center justify-center">
                        <FiHeart className="text-pink-500" />
                      </div>
                      <div className="w-32 h-8 bg-pink-200 rounded-md flex items-center justify-center">
                        <FiHeart className="text-pink-500" />
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute top-4 right-4"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.2 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                  >
                    <div className="bg-pink-500 p-3 rounded-full shadow-lg">
                      <FiHeart className="text-xl text-white" />
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-4">
              {currentStep > 0 ? (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-5 py-2.5 text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <FiArrowLeft />
                  Back
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  className="px-5 py-2.5 text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-7 py-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium shadow-md"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                <FiChevronRight />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShelterSwipeTutorial;
