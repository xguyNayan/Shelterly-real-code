import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { trackPageView } from './utils/analytics'
import { initializeAnalytics } from './services/analyticsService'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import TestimonialsSection from './components/TestimonialsSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import PerksSection from './components/PerksSection'
import ScrollToTop from './components/ScrollToTop'
import Login from './Login'
import Signup from './Signup'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/Admin/AdminRoute'
import AdminDashboard from './components/Admin/AdminDashboard'
import OnboardingModalTrigger from './components/Onboarding/OnboardingModalTrigger'
import PGListingPage from './components/PGListing/PGListingPage'
import { PGDetailsPage } from './components/PGDetails'
import WishlistPage from './components/Wishlist/WishlistPage'
import DashboardPage from './components/Dashboard/DashboardPage'
import ShelterSwipe from './components/ShelterSwipe/ShelterSwipe'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'
import AboutUs from './components/AboutUs'
import BlogList from './components/Blog/BlogList'
import BlogDetail from './components/Blog/BlogDetail'
import { AuthProvider } from './contexts/AuthContext'
import { ViewedPGsProvider } from './contexts/ViewedPGsContext'
import { WishlistProvider } from './contexts/WishlistContext'
import FAQSection from './components/FAQSection'

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PerksSection />
        <TestimonialsSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

// Analytics tracker component
const AnalyticsTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view when location changes
    trackPageView(location.pathname + location.search);
    
    // Initialize analytics on first load
    if (location.pathname === '/') {
      initializeAnalytics();
    }
  }, [location]);
  
  return null;
};

function App() {
  // Telegram notifications are now handled by Firebase functions
  useEffect(() => {
    console.log('🔔 Using Telegram for notifications instead of browser notifications');
  }, []);
  
  return (
    <Router>
      <ScrollToTop /> {/* This component will handle automatic scrolling to top on route changes */}
      <AuthProvider>
        <ViewedPGsProvider>
          <WishlistProvider>
            {/* Analytics tracking */}
            <AnalyticsTracker />
            {/* Modal Onboarding - will auto-open when needed */}
            <OnboardingModalTrigger autoOpen={true} />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/explore" element={<PGListingPage />} />
            <Route path="/pg-listing" element={<PGListingPage />} />
            {/* SEO-friendly URL format with both slug and ID */}
            <Route path="/pg/:slug/:id" element={<PGDetailsPage />} />
            {/* Backward compatibility for old links */}
            <Route path="/pg-details/:id" element={<PGDetailsPage />} />
            <Route path="/shelter-swipe" element={<ShelterSwipe />} />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } />
            {/* Dashboard route temporarily removed for production */}
            {/* Will be developed locally and added back later */}
            {/* 
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            */}
            
            {/* Admin Dashboard route */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </WishlistProvider>
        </ViewedPGsProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
