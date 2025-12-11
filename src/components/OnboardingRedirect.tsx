import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OnboardingRedirect: React.FC = () => {
  const { needsOnboarding, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after auth state is loaded
    if (!loading) {
      if (needsOnboarding) {
         ('User needs onboarding, redirecting to /onboarding');
        navigate('/onboarding');
      } else {
         ('User does not need onboarding, continuing to dashboard');
      }
    }
  }, [needsOnboarding, loading, navigate]);

  // This component doesn't render anything
  return null;
};

export default OnboardingRedirect;
