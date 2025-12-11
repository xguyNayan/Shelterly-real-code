import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PremiumModalOnboarding from './PremiumModalOnboarding';

interface OnboardingModalTriggerProps {
  children?: React.ReactNode;
  autoOpen?: boolean;
}

const OnboardingModalTrigger: React.FC<OnboardingModalTriggerProps> = ({ 
  children, 
  autoOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, needsOnboarding } = useAuth();
  
  // Always open the modal if user hasn't completed onboarding
  useEffect(() => {
    if (currentUser && needsOnboarding) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, needsOnboarding]);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    // Only allow closing if onboarding is not needed
    if (!needsOnboarding) {
      setIsOpen(false);
    }
  };
  
  return (
    <>
      {/* Clickable trigger */}
      {children && (
        <div onClick={openModal} className="cursor-pointer">
          {children}
        </div>
      )}
      
      {/* Premium Modal Onboarding */}
      <PremiumModalOnboarding 
        isOpen={isOpen} 
        onClose={closeModal} 
      />
    </>
  );
};

export default OnboardingModalTrigger;
