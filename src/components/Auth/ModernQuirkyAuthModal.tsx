import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernQuirkyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewedPGCount?: number;
  redirectPath?: string;
  triggerType?: 'contact' | 'viewLimit' | 'viewDetails';
}

const ModernQuirkyAuthModal: React.FC<ModernQuirkyAuthModalProps> = ({ 
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
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Close button outside modal */}
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Modal container */}
          <motion.div 
            className="w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-500/30 rounded-full blur-3xl"></div>
            
            {/* Card with glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 pt-8 pb-16 px-8">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                  <div className="absolute top-8 left-8 w-16 h-16 border-4 border-white/20 rounded-full"></div>
                  <div className="absolute bottom-12 right-12 w-20 h-20 border-4 border-white/10 rounded-full"></div>
                  <div className="absolute top-20 right-20 w-8 h-8 border-2 border-white/30 rounded-md rotate-45"></div>
                </div>
                
                {/* Icon */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
                  <motion.div
                    className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-500 text-2xl font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {triggerType === 'contact' ? '✉️' : triggerType === 'viewDetails' ? '🔑' : '🏠'}
                  </motion.div>
                </div>
                
                <h2 className="text-3xl font-bold text-white text-center">{getModalTitle()}</h2>
                <p className="text-white/80 text-center mt-2 max-w-xs mx-auto">
                  {triggerType === 'contact' 
                    ? "Connect with PG owners in just a few clicks!" 
                    : triggerType === 'viewDetails'
                    ? "Unlock all the details about this amazing PG!"
                    : `You've viewed ${viewedPGCount} PGs! Sign up to explore more!`}
                </p>
              </div>
              
              {/* Content */}
              <div className="bg-white/90 backdrop-blur-md p-8 pt-12 relative z-10">
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                  <button
                    type="button"
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === 'login' 
                        ? 'bg-white text-violet-600 shadow-sm' 
                        : 'text-gray-600 hover:text-violet-500'
                    }`}
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === 'signup' 
                        ? 'bg-white text-violet-600 shadow-sm' 
                        : 'text-gray-600 hover:text-violet-500'
                    }`}
                    onClick={() => setActiveTab('signup')}
                  >
                    Sign Up
                  </button>
                </div>
                
                {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                    {error}
                  </div>
                )}
                
                {/* Login Form */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <a href="#" className="text-sm text-violet-600 hover:text-violet-700">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl hover:from-violet-700 hover:to-pink-600 transition-all disabled:opacity-50 relative overflow-hidden group"
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
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or continue with</span>
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
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {step === 1 ? (
                      <>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            placeholder="Your phone number"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            placeholder="Create a password"
                            required
                          />
                        </div>
                      </>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl hover:from-violet-700 hover:to-pink-600 transition-all disabled:opacity-50 relative overflow-hidden group"
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
                            <span className="px-2 bg-white text-gray-500">or continue with</span>
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
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>
                    {activeTab === 'login' ? (
                      <>
                        Don't have an account?{' '}
                        <button 
                          type="button"
                          className="text-violet-600 hover:text-violet-700 font-medium"
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
                          className="text-violet-600 hover:text-violet-700 font-medium"
                          onClick={() => setActiveTab('login')}
                        >
                          Login
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Decorative bottom wave */}
              <div className="h-6 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModernQuirkyAuthModal;
