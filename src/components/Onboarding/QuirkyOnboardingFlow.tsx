import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { completeOnboarding } from '../../firebase/firestore';
import QuirkyOccupationQuestion from './QuirkyOccupationQuestion';
import QuirkyReferralQuestion from './QuirkyReferralQuestion';
import QuirkyWhatsappQuestion from './QuirkyWhatsappQuestion';

const QuirkyOnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [occupation, setOccupation] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    
  }, [step]);
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!currentUser) return;
    
    // Validate inputs
    if (!occupation) {
      setError('Please select your occupation');
      return;
    }
    
    if (!referralSource) {
      setError('Please select how you found us');
      return;
    }
    
    if (!whatsappNumber || whatsappNumber.length < 10) {
      setError('Please enter a valid WhatsApp number');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await completeOnboarding(
        currentUser.uid,
        {
          occupation,
          referralSource,
          whatsapp: whatsappNumber,
          onboardingCompleted: true
        }
      );
      
      await refreshUserProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
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
            onNext={handleNext} 
          />
        );
      case 2:
        return (
          <QuirkyReferralQuestion 
            value={referralSource} 
            onChange={setReferralSource} 
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <QuirkyWhatsappQuestion 
            value={whatsappNumber} 
            onChange={setWhatsappNumber} 
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-8 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Wavy pattern at the top - responsive sizing */}
      <div className="absolute top-0 left-0 w-full h-16 sm:h-24 overflow-hidden">
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill="url(#gradient)" 
            d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,74.7C1248,75,1344,53,1392,42.7L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fillOpacity="0.8"
          ></path>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" /> {/* teal-600 */}
              <stop offset="100%" stopColor="#0891b2" /> {/* primary-600 */}
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Curved accent in top-right corner - responsive sizing */}
      <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-teal-50 rounded-bl-full opacity-50 -mr-10 -mt-10 sm:-mr-16 sm:-mt-16"></div>
      
      {/* Responsive progress bar */}
      <div className="max-w-md mx-auto w-full mb-6 sm:mb-8 md:mb-10 relative z-10">
        <div className="relative">
          {/* Track */}
          <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full shadow-inner">
            {/* Progress */}
            <div 
              className="absolute h-1.5 sm:h-2 bg-gradient-to-r from-teal-500 to-primary-500 rounded-full transition-all duration-500 shadow-sm" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mt-2">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600 font-medium' : ''}`}>
              <div className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-1 sm:mr-1.5 ${step >= 1 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100'}`}>
                {step > 1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  "1"
                )}
              </div>
              <span className="hidden xs:inline">Occupation</span>
              <span className="xs:hidden">1</span>
            </div>
            
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600 font-medium' : ''}`}>
              <div className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-1 sm:mr-1.5 ${step >= 2 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100'}`}>
                {step > 2 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  "2"
                )}
              </div>
              <span className="hidden xs:inline">Referral</span>
              <span className="xs:hidden">2</span>
            </div>
            
            <div className={`flex items-center ${step >= 3 ? 'text-primary-600 font-medium' : ''}`}>
              <div className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-1 sm:mr-1.5 ${step >= 3 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100'}`}>
                "3"
              </div>
              <span className="hidden xs:inline">WhatsApp</span>
              <span className="xs:hidden">3</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium main content - mobile optimized */}
      <div className="max-w-4xl mx-auto w-full bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden relative z-10">
        {/* Curved accent in bottom-left corner - responsive sizing */}
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-teal-50 rounded-tr-full opacity-50"></div>
        
        <div className="p-4 sm:p-5 md:p-8 lg:p-10 relative">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center shadow-sm">
              {error}
            </div>
          )}
          {renderStep()}
        </div>
      </div>
      
      {/* Premium footer - mobile optimized */}
      <div className="mt-6 sm:mt-8 md:mt-10 text-center text-xs md:text-sm text-gray-600 relative z-10 px-2">
        <p className="bg-white/80 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full shadow-sm inline-block">Join the thousands of happy roomies who found their perfect PG with Shelterly!</p>
      </div>
    </div>
  );
};

export default QuirkyOnboardingFlow;
