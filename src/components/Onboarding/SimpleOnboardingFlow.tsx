import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { completeOnboarding } from '../../firebase/firestore';

const SimpleOnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [occupation, setOccupation] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser, refreshUserProfile, needsOnboarding, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
     (step);
     (currentUser);
     (needsOnboarding);
  }, [step, currentUser]);
  
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
  
  // Occupation Question
  const OccupationQuestion = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const occupationOptions = [
      { id: 'student', label: 'College Student', icon: '🎓' },
      { id: 'intern', label: 'Intern', icon: '💼' },
      { id: 'professional', label: 'Working Professional', icon: '👔' },
      { id: 'dreamer', label: 'Full-time Dreamer', icon: '✨' },
      { id: 'other', label: 'Other', icon: '🌈' }
    ];
    
    const getSelectedLabel = () => {
      const selected = occupationOptions.find(option => option.id === occupation);
      return selected ? `${selected.icon} ${selected.label}` : 'Select your occupation';
    };
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            What's your current hustle? 🚀
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Let us know what keeps you busy these days
          </p>
        </div>
        
        <div className="relative">
          <div 
            className={`w-full p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
              isOpen ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-primary-300'
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`${occupation ? 'text-gray-800' : 'text-gray-400'} text-sm`}>
              {getSelectedLabel()}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-auto">
              {occupationOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                    occupation === option.id 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setOccupation(option.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="pt-4">
          <button
            onClick={handleNext}
            disabled={!occupation}
            className={`w-full py-3 rounded-lg text-white font-medium text-sm transition ${
              occupation 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-md hover:shadow-lg' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-2 inline-block" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // Referral Question
  const ReferralQuestion = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const referralOptions = [
      { id: 'instagram', label: 'Instagram', icon: '📸' },
      { id: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
      { id: 'friend', label: 'Friend who swears by us', icon: '👂' },
      { id: 'google', label: 'Google Search', icon: '🔍' },
      { id: 'facebook', label: 'Facebook', icon: '👥' },
      { id: 'other', label: 'Other', icon: '✨' }
    ];
    
    const getSelectedLabel = () => {
      const selected = referralOptions.find(option => option.id === referralSource);
      return selected ? `${selected.icon} ${selected.label}` : 'Select how you found us';
    };
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Where did you discover our little secret? 🔮
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            We're curious how you stumbled upon Shelterly
          </p>
        </div>
        
        <div className="relative">
          <div 
            className={`w-full p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
              isOpen ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200 hover:border-primary-300'
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`${referralSource ? 'text-gray-800' : 'text-gray-400'} text-sm`}>
              {getSelectedLabel()}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-auto">
              {referralOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                    referralSource === option.id 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setReferralSource(option.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="pt-4 flex space-x-3">
          <button
            onClick={handleBack}
            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm transition hover:bg-gray-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2 inline-block" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!referralSource}
            className={`flex-1 py-3 rounded-lg text-white font-medium text-sm transition ${
              referralSource 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-md hover:shadow-lg' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-2 inline-block" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // WhatsApp Question
  const WhatsappQuestion = () => {
    // Direct approach without local state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow numbers
      const input = e.target.value.replace(/\D/g, '');
      setWhatsappNumber(input);
    };
    
    // Add a paste handler to properly handle pasting numbers
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const cleanedText = pastedText.replace(/\D/g, '');
      setWhatsappNumber(cleanedText);
    };
    
    const isValid = whatsappNumber.length >= 10;
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Drop your WhatsApp number 📱
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            We'll send magic (aka PG options) directly! No spam, only stays that slap 💥
          </p>
        </div>
        
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={handleChange}
              onPaste={handlePaste}
              placeholder="Enter your WhatsApp number"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                whatsappNumber 
                  ? isValid 
                    ? 'border-green-300 focus:border-green-400 focus:ring-green-100' 
                    : 'border-yellow-300 focus:border-yellow-400 focus:ring-yellow-100' 
                  : 'border-gray-200 focus:border-primary-400 focus:ring-primary-100'
              }`}
              maxLength={15}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel"
            />
          </div>
          
          <div className="mt-2 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ${isValid ? 'text-green-500' : 'text-gray-300'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`ml-2 text-xs ${isValid ? 'text-green-500' : 'text-gray-400'}`}>
              Valid phone number
            </span>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>🔒 Your number is safe with us. We'll only use it to send you relevant PG options and updates.</p>
          </div>
        </div>
        
        <div className="pt-4 flex space-x-3">
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2 inline-block" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`flex-1 py-3 rounded-lg text-white font-medium text-sm transition ${
              isValid && !isSubmitting
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-md hover:shadow-lg' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Finish
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-2 inline-block" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <OccupationQuestion />;
      case 2:
        return <ReferralQuestion />;
      case 3:
        return <WhatsappQuestion />;
      default:
        return null;
    }
  };
  
  // Add a simple loading indicator
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

   ('Rendering SimpleOnboardingFlow component');
  
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Tell us about yourself</h1>
          <p className="text-white/80 text-sm">Help us personalize your experience</p>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 mt-6">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <div 
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === step 
                      ? 'bg-white scale-125' 
                      : i < step 
                        ? 'bg-white/70' 
                        : 'bg-white/30'
                  }`}
                />
                {i < 3 && (
                  <div 
                    className={`w-8 h-0.5 transition-all duration-300 ${
                      i < step ? 'bg-white/70' : 'bg-white/30'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}
        
        {/* Question container */}
        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default SimpleOnboardingFlow;
