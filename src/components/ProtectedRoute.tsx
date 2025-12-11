import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading, needsOnboarding } = useAuth();

  // If auth is still loading, show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If user needs to complete onboarding, redirect to onboarding
  // But only if we're not already on the onboarding page
  if (needsOnboarding && window.location.pathname !== '/onboarding') {
     ('Redirecting to onboarding from protected route');
    return <Navigate to="/onboarding" />;
  }

  // If user is authenticated and has completed onboarding, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
