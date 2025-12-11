import { useState, useEffect, useRef } from 'react';
import logo from '../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/auth';
import { isAdmin } from '../firebase/admin';
import { ShelterSwipeButton } from './ShelterSwipe';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen, showUserMenu]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  return (
    <nav 
      ref={navbarRef}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white py-2 shadow-md border-b border-gray-100' 
          : 'bg-white py-3'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Properly sized for mobile and desktop, clickable to navigate to home */}
          <div className="flex items-center">
            <Link to="/" onClick={() => setActiveLink('home')}>
              <img 
                src={logo} 
                alt="Shelterly Logo" 
                className="h-16 md:h-24 cursor-pointer" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/150x50?text=Shelterly';
                }}
              />
            </Link>
          </div>
          
          {/* Center-aligned nav items - Desktop only */}
          <div className="hidden md:flex items-center justify-center space-x-10">
            {/* Home Link */}
            <Link 
              to="/"
              className={`text-md font-medium text-gray-800 hover:text-black transition-colors relative group ${
                activeLink === 'home' ? 'text-black' : ''
              }`}
              onClick={() => setActiveLink('home')}
            >
              Home
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full ${
                activeLink === 'home' ? 'w-full' : ''
              }`}></span>
            </Link>
            
            {/* PGs Menu with Dropdown */}
            <div className="relative group">
              <button 
                className={`flex items-center text-md font-medium text-gray-800 hover:text-black transition-colors relative group ${
                  activeLink === 'pgs' ? 'text-black' : ''
                }`}
                onClick={() => setActiveLink('pgs')}
              >
                PGs
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full ${
                  activeLink === 'pgs' ? 'w-full' : ''
                }`}></span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <Link 
                  to="/explore"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  onClick={() => setActiveLink('pgs')}
                >
                  Browse All PGs
                </Link>
                <Link 
                  to="/explore?filter=verified"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  onClick={() => setActiveLink('pgs')}
                >
                  Verified PGs
                </Link>
                <Link 
                  to="/explore?filter=premium"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  onClick={() => setActiveLink('pgs')}
                >
                  Premium PGs
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <Link 
                  to="/explore?filter=male"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  onClick={() => setActiveLink('pgs')}
                >
                  Male PGs
                </Link>
                <Link 
                  to="/explore?filter=female"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  onClick={() => setActiveLink('pgs')}
                >
                  Female PGs
                </Link>
                <Link 
                  to="/explore?filter=unisex"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  onClick={() => setActiveLink('pgs')}
                >
                  Unisex PGs
                </Link>
              </div>
            </div>
            
            
            
            {/* Wishlist link - only visible when logged in */}
            {currentUser && (
              <Link 
                to="/wishlist"
                className={`text-md font-medium text-gray-800 hover:text-black transition-colors relative group flex items-center ${
                  activeLink === 'wishlist' ? 'text-black' : ''
                }`}
                onClick={() => setActiveLink('wishlist')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Wishlist
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full ${
                  activeLink === 'wishlist' ? 'w-full' : ''
                }`}></span>
              </Link>
            )}
          </div>
          
          {/* Login/User Profile - Right aligned - Desktop only */}
          <div className="hidden md:flex space-x-4 items-center">
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200 overflow-hidden">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite error loop
                          target.style.display = 'none';
                          // Add a fallback initial
                          const parent = target.parentElement;
                          if (parent) {
                            const initialSpan = document.createElement('span');
                            initialSpan.className = 'text-primary-700 font-medium text-sm';
                            initialSpan.textContent = currentUser.displayName ? 
                              currentUser.displayName.charAt(0).toUpperCase() : 
                              currentUser.email?.charAt(0).toUpperCase() || '?';
                            parent.appendChild(initialSpan);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-primary-700 font-medium text-sm">
                        {currentUser.displayName ? 
                          currentUser.displayName.charAt(0).toUpperCase() : 
                          currentUser.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-600 transition-transform ${showUserMenu ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                    {/* Dashboard links temporarily removed for production */}
                    {/* Will be developed locally and added back later */}
                    {/* Dashboard link - hidden for now
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    */}
                    {isAdmin(userProfile) && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {/* Profile Settings link - to be implemented later
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    */}
                    <Link 
                      to="/wishlist" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      My Wishlist
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 focus:outline-none"
                    >
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-6 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-full hover:bg-primary-600 transition-colors shadow-md flex items-center justify-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 border border-primary-500 text-primary-500 bg-white text-sm font-medium rounded-full hover:bg-primary-50 transition-colors shadow-md flex items-center justify-center"
                  style={{ marginLeft: '0.5rem' }}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4 relative z-50">
            {/* Mobile Menu Button - Improved hamburger */}
            <button 
              className={`w-10 h-10 flex flex-col justify-center items-center focus:outline-none rounded-md transition-colors ${
                mobileMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span 
                className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'transform rotate-45 translate-y-1.5' : 'mb-1.5'
                }`}
              ></span>
              <span 
                className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0 transform translate-x-3' : 'opacity-100'
                }`}
              ></span>
              <span 
                className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'transform -rotate-45 -translate-y-1.5' : 'mt-1.5'
                }`}
              ></span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Overlay - Full screen with animation */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      ></div>
      
      {/* Mobile Menu Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ height: '100vh' }}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Menu Header with Logo and Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Link to="/">
              <img 
                src={logo} 
                alt="Shelterly Logo" 
                className="h-16" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/150x50?text=Shelterly';
                }}
              />
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 px-6 py-8">
            <div className="space-y-2">
              {/* Home Menu Section */}
              <Link 
                to="/"
                className="py-3 text-lg font-medium text-gray-800 border-b border-gray-100"
                onClick={() => {
                  setActiveLink('home');
                  setMobileMenuOpen(false);
                }}
              >
                Home
              </Link>
              {/* PGs Menu Section */}
              <div className="mb-2">
                <div 
                  className={`flex items-center justify-between py-4 px-5 text-lg font-medium rounded-lg transition-all ${
                    activeLink === 'pgs' 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ 
                    transitionDelay: '0ms',
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                    opacity: mobileMenuOpen ? 1 : 0,
                    transition: 'transform 0.3s ease, opacity 0.3s ease, background-color 0.2s ease, color 0.2s ease'
                  }}
                  onClick={() => {
                    setActiveLink(activeLink === 'pgs' ? '' : 'pgs');
                  }}
                >
                  <div className="flex items-center">
                    {/* Icon placeholder */}
                    <span className={`mr-3 w-6 h-6 flex items-center justify-center rounded-full ${
                      activeLink === 'pgs' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </span>
                    <span>PGs</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 transition-transform ${activeLink === 'pgs' ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* PGs Submenu */}
                {activeLink === 'pgs' && (
                  <div className="ml-8 mt-2 space-y-1 animate-fadeIn">
                    <Link 
                      to="/explore"
                      className="flex items-center py-3 px-4 text-base rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse All PGs
                    </Link>
                    <Link 
                      to="/explore?filter=verified"
                      className="flex items-center py-3 px-4 text-base rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Verified PGs
                    </Link>
                    <Link 
                      to="/explore?filter=premium"
                      className="flex items-center py-3 px-4 text-base rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Premium PGs
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <Link 
                      to="/explore?filter=male"
                      className="flex items-center py-3 px-4 text-base rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Male PGs
                    </Link>
                    <Link 
                      to="/explore?filter=female"
                      className="flex items-center py-3 px-4 text-base rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Female PGs
                    </Link>
                    <Link 
                      to="/explore?filter=unisex"
                      className="flex items-center py-3 px-4 text-base rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Unisex PGs
                    </Link>
                  </div>
                )}
              </div>
              
              {/* ShelterSwipe link for mobile */}
              <Link 
                to="/shelter-swipe"
                className={`flex items-center py-4 px-5 text-lg font-medium rounded-lg transition-all ${
                  activeLink === 'shelter-swipe' 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
                style={{ 
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transition: 'transform 0.3s ease, opacity 0.3s ease, background-color 0.2s ease, color 0.2s ease'
                }}
                onClick={() => {
                  setActiveLink('shelter-swipe');
                  setMobileMenuOpen(false);
                }}
              >
                <span className={`mr-3 w-6 h-6 flex items-center justify-center rounded-full ${
                  activeLink === 'shelter-swipe' ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-pink-400'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                </span>
                Shelter Swipe
              </Link>
              
              {/* Wishlist link for mobile - only visible when logged in */}
              {currentUser && (
                <Link 
                  to="/wishlist"
                  className={`flex items-center py-4 px-5 text-lg font-medium rounded-lg transition-all ${
                    activeLink === 'wishlist' 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ 
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                    opacity: mobileMenuOpen ? 1 : 0,
                    transition: 'transform 0.3s ease, opacity 0.3s ease, background-color 0.2s ease, color 0.2s ease'
                  }}
                  onClick={() => {
                    setActiveLink('wishlist');
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className={`mr-3 w-6 h-6 flex items-center justify-center rounded-full ${
                    activeLink === 'wishlist' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-red-400'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Wishlist
                </Link>
              )}
            </div>
          </div>
          
          {/* Footer with Login/Signup buttons or User Profile */}
          <div className="px-6 py-6 border-t border-gray-100">
            {currentUser ? (
              <div className="flex flex-col space-y-4">
                {/* User Profile */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200 overflow-hidden">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite error loop
                          target.style.display = 'none';
                          // Add a fallback initial
                          const parent = target.parentElement;
                          if (parent) {
                            const initialSpan = document.createElement('span');
                            initialSpan.className = 'text-primary-700 font-medium text-base';
                            initialSpan.textContent = currentUser.displayName ? 
                              currentUser.displayName.charAt(0).toUpperCase() : 
                              currentUser.email?.charAt(0).toUpperCase() || '?';
                            parent.appendChild(initialSpan);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-primary-700 font-medium text-base">
                        {currentUser.displayName ? 
                          currentUser.displayName.charAt(0).toUpperCase() : 
                          currentUser.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                
                {/* Navigation links for logged-in users */}
                {/* Dashboard links temporarily removed for production */}
                {/* Will be developed locally and added back later */}
                {/* 
                <Link 
                  to="/dashboard" 
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </Link>
                )}
                */}
                
                {isAdmin(userProfile) && (
                  <Link 
                    to="/admin" 
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                
                {/*<Link 
                  to="/profile" 
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 6a6 6 0 00-6 6 1 1 0 102 0 4 4 0 018 0 1 1 0 102 0 6 6 0 00-6-6z" />
                  </svg>
                  Profile Settings
                </Link>*/}
                
                {/* Logout button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center w-full px-6 py-3.5 mt-2 bg-red-50 text-red-600 text-base font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/login" 
                  className="flex items-center justify-center w-full px-6 py-3.5 bg-primary-500 text-white text-base font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center w-full px-6 py-3.5 border border-primary-500 text-primary-500 bg-white text-base font-medium rounded-lg hover:bg-primary-50 transition-colors shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 6a6 6 0 00-6 6 1 1 0 102 0 4 4 0 018 0 1 1 0 102 0 6 6 0 00-6-6z" clipRule="evenodd" />
                  </svg>
                  Signup
                </Link>
              </div>
            )}
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Need help? <a href="#contact" className="text-primary-500 hover:text-primary-600 font-medium">Contact us</a></p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
