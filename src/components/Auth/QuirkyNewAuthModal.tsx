import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FiX, FiArrowRight, FiMail, FiPhone, FiUser, FiLock, FiCheck } from 'react-icons/fi';

interface QuirkyNewAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewedPGCount?: number;
  redirectPath?: string;
  triggerType?: 'contact' | 'viewLimit' | 'viewDetails';
}

const QuirkyNewAuthModal: React.FC<QuirkyNewAuthModalProps> = ({ 
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
  
  const handleClose = () => {
    onClose();
    // If user closes modal, navigate back to listing page
    if (triggerType === 'viewLimit' || triggerType === 'viewDetails') {
      navigate('/pg-listing');
    }
  };
  
  useEffect(() => {
    // Reset form when tab changes
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setStep(1);
    setError('');
  }, [activeTab]);
  
  if (!isOpen) return null;
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      onClose();
      if (redirectPath) {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    // Implement Google sign-in
  };

  const getModalTitle = () => {
    if (triggerType === 'contact') {
      return 'Sign Up to Contact';
    } else if (triggerType === 'viewDetails') {
      return 'Sign Up to View Details';
    } else {
      return 'Join Shelterly';
    }
  };

  const getModalMessage = () => {
    if (triggerType === 'contact') {
      return "Just a quick sign-up away from connecting with PG owners!";
    } else if (triggerType === 'viewDetails') {
      return "Sign up to unlock detailed information about this PG!";
    } else {
      return `You've reached your limit of ${viewedPGCount} free PGs! Sign up to unlock all the cozy corners of Shelterly!`;
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-6 md:p-8 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={handleClose}
    >
      {/* Main Modal Container */}
      <div 
        className="w-full max-w-md relative mx-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-300/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/30 rounded-full blur-3xl animate-pulse-medium"></div>
        
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute -top-12 sm:-top-10 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all z-10"
        >
          <FiX size={20} />
        </button>

        {/* Modal Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Quirky wave pattern at top */}
          <div className="absolute top-0 left-0 w-full h-16 overflow-hidden">
            <div className="absolute top-0 left-0 w-[200%] h-16 bg-primary-400 opacity-20 animate-wave1"></div>
            <div className="absolute top-0 left-0 w-[200%] h-16 bg-primary-500 opacity-10 animate-wave2"></div>
          </div>
          
          {/* Header */}
          <div className="relative pt-10 sm:pt-12 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 border-4 border-white/10 rounded-full animate-rotate-slow"></div>
            <div className="absolute bottom-4 left-8 w-12 h-12 border-2 border-white/20 rounded-full animate-float-medium"></div>
            <div className="absolute top-12 left-20 w-6 h-6 bg-primary-300/50 rounded-md rotate-45 animate-float-slow"></div>
            
            {/* Floating bubbles */}
            <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white/30 rounded-full animate-float1"></div>
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-float2"></div>
            <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-white/10 rounded-full animate-float3"></div>
            
            {/* Icon */}
            <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-lg flex items-center justify-center z-10 border-4 border-primary-100">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary-100 animate-pulse opacity-50"></div>
                <div className="relative z-10 text-2xl sm:text-3xl">
                  {triggerType === 'contact' ? '✉️' : triggerType === 'viewDetails' ? '🔑' : '🏠'}
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-center">{getModalTitle()}</h2>
            <p className="text-white/80 text-center mt-2 text-sm sm:text-base max-w-xs mx-auto">
              {getModalMessage()}
            </p>
          </div>
          
          {/* Content */}
          <div className="relative z-10 bg-white px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 pb-6 sm:pb-8">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-4 sm:mb-6">
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'login' 
                    ? 'bg-white text-primary-600 shadow-md' 
                    : 'text-gray-600 hover:text-primary-500'
                }`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'signup' 
                    ? 'bg-white text-primary-600 shadow-md' 
                    : 'text-gray-600 hover:text-primary-500'
                }`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-coral/10 border border-coral/20 text-coral text-xs sm:text-sm rounded-lg">
                {error}
              </div>
            )}
            
            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-400">
                      <FiMail />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      required
                    />
                    <div className="absolute inset-0 border border-primary-200 rounded-xl opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Password</label>
                    <a href="#" className="text-xs sm:text-sm text-primary-600 hover:text-primary-700">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-400">
                      <FiLock />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></span>
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
                        <span>Login</span>
                        <FiArrowRight className="ml-2" />
                      </>
                    )}
                  </span>
                </button>
                
                {/* Social Login */}
                <div className="mt-5 sm:mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-gray-500 text-xs sm:text-sm">or continue with</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      onClick={handleGoogleSignIn}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                      Google
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#1877F2"
                          d="M24 12.073c0-5.8-4.702-10.503-10.503-10.503S2.994 6.273 2.994 12.073c0 5.242 3.84 9.583 8.851 10.366v-7.33h-2.663v-3.037h2.663V9.986c0-2.63 1.566-4.085 3.968-4.085 1.15 0 2.35.205 2.35.205v2.585h-1.322c-1.304 0-1.71.81-1.71 1.64v1.97h2.912l-.465 3.036H15.13v7.33c5.01-.783 8.85-5.124 8.85-10.366"
                        />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
                {step === 1 ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-400">
                          <FiMail />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-400">
                          <FiPhone />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Your phone number"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-400">
                          <FiUser />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-400">
                          <FiLock />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Create a password"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></span>
                  <span className="relative flex items-center justify-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{step === 1 ? 'Continue' : 'Sign Up'}</span>
                        <FiArrowRight className="ml-2" />
                      </>
                    )}
                  </span>
                </button>
                
                {step === 1 && (
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">or continue with</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        onClick={handleGoogleSignIn}
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                        Google
                      </button>
                      
                      <button
                        type="button"
                        className="flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#1877F2"
                            d="M24 12.073c0-5.8-4.702-10.503-10.503-10.503S2.994 6.273 2.994 12.073c0 5.242 3.84 9.583 8.851 10.366v-7.33h-2.663v-3.037h2.663V9.986c0-2.63 1.566-4.085 3.968-4.085 1.15 0 2.35.205 2.35.205v2.585h-1.322c-1.304 0-1.71.81-1.71 1.64v1.97h2.912l-.465 3.036H15.13v7.33c5.01-.783 8.85-5.124 8.85-10.366"
                          />
                        </svg>
                        Facebook
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
            
            {/* Footer */}
            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
              <p>
                {activeTab === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                      onClick={() => setActiveTab('signup')}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      type="button"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
          
          {/* Quirky wave pattern at bottom */}
          <div className="h-6 sm:h-8 bg-gradient-to-r from-primary-500 to-primary-600 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[200%] h-16 bg-primary-400 opacity-20 animate-wave2"></div>
            <div className="absolute bottom-0 left-0 w-[200%] h-16 bg-primary-300 opacity-10 animate-wave1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuirkyNewAuthModal;
