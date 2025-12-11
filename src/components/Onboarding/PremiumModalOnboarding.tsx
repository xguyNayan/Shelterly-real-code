import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { completeOnboarding } from '../../firebase/firestore';
import QuirkyOccupationQuestion from './QuirkyOccupationQuestion';
import QuirkyReferralQuestion from './QuirkyReferralQuestion';
import QuirkyWhatsappQuestion from './QuirkyWhatsappQuestion';

interface PremiumModalOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModalOnboarding: React.FC<PremiumModalOnboardingProps> = ({ isOpen, onClose }) => {
  const [showReminder, setShowReminder] = useState(true);
  
  // Show reminder for 2 seconds when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowReminder(true);
      const timer = setTimeout(() => {
        setShowReminder(false);
      }, 2000); // Hide after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Prevent closing the modal with escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, []);
  const [step, setStep] = useState(1);
  const [occupation, setOccupation] = useState('');
  const [referral, setReferral] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setStep(1);
      setOccupation('');
      setReferral('');
      setWhatsapp('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!currentUser) {
      setError('You must be logged in to complete onboarding');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await completeOnboarding(currentUser.uid, {
        occupation,
        referralSource: referral,
        whatsapp,
        onboardingCompleted: true
      });
      
      // Success animation before closing
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        // Reload the page to refresh the auth context
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError('Failed to save your information. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <QuirkyOccupationQuestion
            value={occupation}
            onChange={setOccupation}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <QuirkyReferralQuestion
            value={referral}
            onChange={setReferral}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <QuirkyWhatsappQuestion
            value={whatsapp}
            onChange={setWhatsapp}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  // Modal animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.1
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  // Progress indicator animations
  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${(step / 3) * 100}%`, 
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking outside
        >
          {/* Modal Container */}
          <motion.div 
            className="relative w-full max-w-[90%] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Decorative Elements - reduced size */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-primary-500"></div>
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 rounded-bl-full opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-tr-full opacity-40"></div>
            
            {/* Grid pattern background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            
            {/* No close button - onboarding is mandatory */}
            
            {/* Temporary onboarding reminder message */}
            <AnimatePresence>
              {isOpen && showReminder && (
                <motion.div 
                  className="absolute top-2 right-2 left-2 z-40 flex items-center justify-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  key="reminder-message"
                >
                  <motion.div 
                    className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-full shadow-sm"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-medium">Please complete this onboarding to continue</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Progress bar - more visible */}
            <div className="absolute top-0 left-0 w-full px-3 sm:px-4 pt-4 sm:pt-5 z-10">
              <div className="h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-teal-500 to-primary-500"
                  variants={progressVariants}
                  initial="initial"
                  animate="animate"
                  key={step}
                ></motion.div>
              </div>
              
              {/* Step indicators - larger and more visible */}
              <div className="flex justify-between mt-2 px-1 sm:px-2 text-xs sm:text-sm">
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0.7 }}
                  animate={{ 
                    opacity: 1,
                    scale: step === 1 ? 1.05 : 1,
                    color: step >= 1 ? '#0891b2' : '#9ca3af'
                  }}
                >
                  <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                    step >= 1 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > 1 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : "1"}
                  </div>
                  <span className="ml-1 sm:ml-1.5 text-xs sm:text-sm font-medium">Occupation</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0.7 }}
                  animate={{ 
                    opacity: 1,
                    scale: step === 2 ? 1.05 : 1,
                    color: step >= 2 ? '#0891b2' : '#9ca3af'
                  }}
                >
                  <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                    step >= 2 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > 2 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : "2"}
                  </div>
                  <span className="ml-1 sm:ml-1.5 text-xs sm:text-sm font-medium">Discovery</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0.7 }}
                  animate={{ 
                    opacity: 1,
                    scale: step === 3 ? 1.05 : 1,
                    color: step >= 3 ? '#0891b2' : '#9ca3af'
                  }}
                >
                  <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                    step >= 3 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    3
                  </div>
                  <span className="ml-1 sm:ml-1.5 text-xs sm:text-sm font-medium">Contact</span>
                </motion.div>
              </div>
            </div>
            
            {/* Content area with optimized padding for mobile */}
            <div className="pt-14 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 md:px-8 max-h-[80vh] overflow-y-auto">
              {error && (
                <motion.div 
                  className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Subtle branding - smaller */}
            <div className="absolute bottom-1 right-2 text-[8px] sm:text-[10px] text-gray-400">
              <span className="font-medium">Shelterly</span> • Premium
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModalOnboarding;
