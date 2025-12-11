import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMail, FiPhone, FiLock, FiUser, FiCheck } from 'react-icons/fi';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

interface QuirkyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewedPGCount?: number;
  redirectPath?: string;
  triggerType?: 'contact' | 'viewLimit' | 'viewDetails';
}

const QuirkyAuthModal: React.FC<QuirkyAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  viewedPGCount = 0,
  redirectPath,
  triggerType = 'viewLimit'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Define handleClose function before any hooks
  const handleClose = () => {
    onClose();
    // If user closes modal, navigate back to listing page
    if (triggerType === 'viewLimit' || triggerType === 'viewDetails') {
      navigate('/pg-listing');
    }
  };
  
  // Add useEffect hook in the correct position (before conditional returns)
  useEffect(() => {
    // Reset form when tab changes
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setStep(1);
    setError('');
    
    // Log screen size for debugging
     ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight });
  }, [activeTab]);
  
  if (!isOpen) return null;
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
     ({ email, password, screenWidth: window.innerWidth, screenHeight: window.innerHeight });
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
     ({ email, phone, name, password, step, screenWidth: window.innerWidth, screenHeight: window.innerHeight });
    
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      if (result.user) {
        await updateProfile(result.user, {
          displayName: name
        });
      }
      
      onClose();
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getModalTitle = () => {
    if (triggerType === 'contact') {
      return 'Create an account to contact PG owners';
    } else if (triggerType === 'viewLimit') {
      return `You've viewed ${viewedPGCount} PGs`;
    }
    return 'Sign in to continue';
  };
  
  // Note: We're not using this function directly anymore as we've replaced it with custom messages
  // but keeping it for future reference
  /* 
  const getModalDescription = () => {
    if (triggerType === 'contact') {
      return 'To contact this PG owner, please create a quick account. It takes just 30 seconds!';
    } else if (triggerType === 'viewLimit') {
      return 'Create a free account to continue viewing more PGs and unlock all features.';
    }
    return 'Sign in to access all features and save your favorite PGs.';
  };
  */
  
  const handleGoogleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
     ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, eventType: e.type });
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        onClose();
        if (redirectPath) {
          navigate(redirectPath);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to sign in with Google');
      });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with animated gradient background */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md bg-grid-pattern overflow-hidden" 
        onClick={(e) => {
           ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, eventType: e.type });
          handleClose();
        }}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -inset-[100px] bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 animate-gradient-slow rounded-full blur-3xl"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-white rounded-full animate-float-particle opacity-70"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary-300 rounded-full animate-float-particle-slow opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-300 rounded-full animate-float-particle-medium opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-float-particle opacity-80"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary-500/30 to-purple-500/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-tr from-teal-500/20 to-blue-500/20 rounded-full blur-3xl animate-float-medium"></div>
      <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-primary-300/30 to-pink-300/20 rounded-full blur-xl animate-pulse-slow"></div>
      
      {/* Top wave pattern */}
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden z-0 opacity-30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute w-full min-w-[1440px]">
          <path fill="#0099ff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      {/* Modal with enhanced glassmorphism */}
      <div className="relative z-10 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transition-all duration-300 hover:shadow-primary-500/20 hover:border-white/40">
        {/* Corner accent elements with animation */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/30 to-purple-500/10 rounded-bl-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-500/20 to-blue-500/10 rounded-tr-full animate-pulse-medium"></div>
        
        {/* Decorative geometric shapes */}
        <div className="absolute top-20 right-10 w-6 h-6 border-2 border-white/20 rounded-md rotate-12 animate-float-slow"></div>
        <div className="absolute bottom-16 left-8 w-4 h-4 border border-white/30 rounded-full animate-float-medium"></div>
        {/* Close button */}
        <button 
          onClick={(e) => {
             ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, eventType: e.type });
            handleClose();
          }}
          className="absolute top-4 right-4 z-20 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
        
        {/* Enhanced header with animated elements */}
        <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 pt-8 pb-16 px-6 text-white relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-pattern-dots rotate-12 scale-150"></div>
          </div>
          
          {/* Floating icons in background */}
          <div className="absolute top-4 left-6 opacity-20 animate-float-slow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div className="absolute bottom-10 right-6 opacity-20 animate-float-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          
          {/* Main icon with animation */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg z-10 border-2 border-primary-100">
            <div className="absolute inset-0 bg-white rounded-full animate-pulse-slow opacity-50"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* Title with subtle animation */}
          <h2 className="text-2xl font-bold text-center relative inline-block w-full">
            <span className="relative inline-block animate-slight-bounce">{getModalTitle()}</span>
            <span className="absolute -right-1 -top-1 text-yellow-300 text-xs animate-pulse-medium">✨</span>
          </h2>
          
          {/* Message with emoji and animation */}
          <p className="text-center text-white/90 mt-3 text-sm font-medium relative">
            {triggerType === 'contact' 
              ? <>
                  <span className="animate-float-slow inline-block mr-1">✨</span> 
                  Just a quick sign-up away from your dream PG! 
                  <span className="animate-float-medium inline-block ml-1">🏡</span>
                </>
              : triggerType === 'viewDetails'
              ? <>
                  <span className="animate-slight-bounce inline-block mr-1">🔒</span> 
                  Sign up to unlock detailed information about this PG! 
                  <span className="animate-float-slow inline-block ml-1">🔑</span>
                </>
              : <>
                  <span className="animate-float-medium inline-block mr-1">🔍</span> 
                  You've explored {viewedPGCount} PGs! Sign up to unlock all the cozy corners of Shelterly! 
                  <span className="animate-float-slow inline-block ml-1">🏠</span>
                </>
            }
          </p>
        </div>
        
        {/* Content with enhanced styling */}
        <div className="p-6 pt-10 backdrop-blur-md bg-white/70 relative z-10 border-t border-white/30">
          {/* Enhanced tabs with glass effect */}
          <div className="flex bg-primary-100/70 backdrop-blur-sm p-1 rounded-lg mb-6 shadow-sm border border-white/40 relative overflow-hidden">
            {/* Tab background shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 -skew-x-12 animate-shimmer"></div>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'login' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-primary-500'}`}
              onClick={(e) => {
                e.preventDefault();
                 ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, eventType: e.type });
                setActiveTab('login');
                setStep(1);
                setError('');
              }}
            >
              🔑 Log In
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'signup' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-primary-500'}`}
              onClick={(e) => {
                e.preventDefault();
                 ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, eventType: e.type });
                setActiveTab('signup');
                setStep(1);
                setError('');
              }}
            >
              ✨ Sign Up
            </button>
          </div>
          
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={(e) => {
               ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight });
              handleLogin(e);
            }}>
              {error && <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                onClick={(e) =>  ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, eventType: e.type })}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg relative overflow-hidden group"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></div>
                
                {/* Button content with animation */}
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2 animate-slight-bounce">🚀</span>
                      <span>Login</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          )}
          
          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={(e) => {
               ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, step });
              handleSignup(e);
            }}>
              {error && <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}
              
              {/* Progress indicator for signup */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${step >= 1 ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <div className={`w-16 h-1 ${step >= 2 ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${step >= 2 ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </div>
                </div>
              </div>
              
              {step === 1 ? (
                <>
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                        placeholder="your@email.com"
                        required
                      />
                      <div className="absolute inset-0 border border-white/50 rounded-lg pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6 relative group">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 transition-all group-focus-within:text-primary-600">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                        placeholder="1234567890"
                        required
                      />
                      <div className="absolute inset-0 border border-white/50 rounded-lg pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 relative group">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 transition-all group-focus-within:text-primary-600">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                        placeholder="John Doe"
                        required
                      />
                      <div className="absolute inset-0 border border-white/50 rounded-lg pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 7H7v6h6V7z" />
                          <path d="M6 11H3v6h3V11z" />
                          <path d="M17 7H9v6h8V7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6 relative group">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 transition-all group-focus-within:text-primary-600">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute inset-0 border border-white/50 rounded-lg pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <button
                type="submit"
                disabled={loading}
                onClick={(e) =>  ({ screenWidth: window.innerWidth, screenHeight: window.innerHeight, eventType: e.type, step })}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {loading ? '🔄 Creating account...' : step === 1 ? '👉 Continue' : '✨ Create Account'}
              </button>
            </form>
          )}
          
          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/80 backdrop-blur-sm text-gray-600 font-medium rounded-full border border-gray-200/50">or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center py-2.5 px-4 border border-gray-200 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoogleSignIn(e);
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></div>
                
                <div className="relative flex items-center">
                  <div className="mr-3 p-1.5 rounded-full bg-white shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c2.17 0 4.07.72 5.56 2.09l4.3-4.3C19.38.5 15.95-.58 12 .25 7.32 1.24 3.39 4.63 1.61 9.04h5.03c1.49-2.39 4.13-4 7.36-4z"
                      />
                      <path
                        fill="#34A853"
                        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                      />
                      <path
                        fill="#4A90E2"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H.19v3.09C2.17 21.47 6.71 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27 14.28C4.99 13.57 4.83 12.8 4.83 12s.16-1.57.44-2.28V6.63H.19C-.13 8.33-.33 10.13-.33 12s.2 3.67.52 5.37l4.89-3.09z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Google</span>
                </div>
              </button>
              
              <button
                className="flex items-center justify-center py-2.5 px-4 border border-gray-200 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></div>
                
                <div className="relative flex items-center">
                  <div className="mr-3 p-1.5 rounded-full bg-white shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#1877F2"
                        d="M24 12.073c0-5.8-4.702-10.503-10.503-10.503S2.994 6.273 2.994 12.073c0 5.242 3.84 9.583 8.851 10.366v-7.33h-2.663v-3.037h2.663V9.986c0-2.63 1.566-4.085 3.968-4.085 1.15 0 2.35.205 2.35.205v2.585h-1.322c-1.304 0-1.71.81-1.71 1.64v1.97h2.912l-.465 3.036H15.13v7.33c5.01-.783 8.85-5.124 8.85-10.366"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Facebook</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center mt-6 p-2 bg-primary-50/50 backdrop-blur-sm rounded-lg shadow-sm space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1">
                <FiCheck className="text-green-500" size={12} />
              </div>
              <span>🔒 Secure</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1">
                <FiCheck className="text-green-500" size={12} />
              </div>
              <span>👥 10,000+ Users</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1">
                <FiCheck className="text-green-500" size={12} />
              </div>
              <span>📧 No Spam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuirkyAuthModal;
