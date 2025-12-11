import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMail, FiPhone, FiLock, FiUser, FiCheck } from 'react-icons/fi';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewedPGCount?: number;
  redirectPath?: string;
  triggerType?: 'contact' | 'viewLimit';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
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
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  
  const handleClose = () => {
    onClose();
    // If user closes modal, navigate back to listing page
    if (triggerType === 'viewLimit') {
      navigate('/pg-listing');
    }
  };
  
  const getModalTitle = () => {
    if (triggerType === 'contact') {
      return 'Create an account to contact PG owners';
    } else {
      return 'Unlock All PG Listings';
    }
  };
  
  const getModalDescription = () => {
    if (triggerType === 'contact') {
      return 'To contact this PG owner, please create a quick account. It takes just 30 seconds!';
    } else {
      return `You've viewed ${viewedPGCount} PG details for free. Sign up to unlock all listings and get personalized recommendations.`;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-primary-800/20 to-primary-900/30 z-10 pointer-events-none"></div>
      
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-[15%] left-[40%] w-24 h-24 bg-primary-300/10 rounded-full blur-xl z-5 animate-float-slow"></div>
      <div className="absolute top-[10%] right-[30%] w-16 h-16 bg-primary-500/10 rounded-full blur-lg z-5 animate-float-medium"></div>
      
      <div className="relative backdrop-blur-xl bg-transparent border border-white/60 rounded-2xl shadow-xl px-6 sm:px-8 py-8 sm:py-9 w-full glass-form animate-fade-in relative overflow-hidden z-20 max-w-md mx-4"
        style={{ 
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'
        }}
      >
        {/* Decorative elements inside form - smaller and more subtle */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-300/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-16 -left-16 w-28 h-28 bg-coral/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 -right-8 w-16 h-16 bg-primary-200/10 rounded-full blur-lg"></div>
        
        {/* Close button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <FiX size={24} />
        </button>
        
        <div className="flex justify-center mb-5 relative z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl font-bold text-primary-800 mb-1">{getModalTitle()}</h2>
          <p className="text-gray-600 text-sm">{getModalDescription()}</p>
        </div>
        
        {/* Progress indicator for signup */}
        {activeTab === 'signup' && (
          <div className="flex justify-center mb-6 relative z-10">
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
        )}
        
        {/* Tabs */}
        <div className="flex mb-6 relative z-10 bg-white/30 backdrop-blur-sm p-1 rounded-lg shadow-sm">
          <button
            className={`flex-1 py-2 font-medium rounded-md transition-all ${activeTab === 'login' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-primary-500'}`}
            onClick={() => {
              setActiveTab('login');
              setStep(1);
              setError('');
            }}
          >
            Log In
          </button>
          <button
            className={`flex-1 py-2 font-medium rounded-md transition-all ${activeTab === 'signup' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-primary-500'}`}
            onClick={() => {
              setActiveTab('signup');
              setStep(1);
              setError('');
            }}
          >
            Sign Up
          </button>
        </div>
        
        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="mb-4 relative z-10">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FiMail />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6 relative z-10">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FiLock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg relative z-10"
              onClick={(e) => {
                if (loading) {
                  e.preventDefault();
                }
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
        
        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup}>
            {step === 1 ? (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiMail />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiPhone />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiUser />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiLock />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>
              </>
            )}
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : step === 1 ? 'Continue' : 'Create Account'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center relative z-10">
          <p className="text-gray-600 text-sm">or continue with</p>
          <div className="flex justify-center space-x-4 mt-4">
            <button 
              className="flex items-center justify-center w-full py-2 border border-gray-300 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all shadow-sm hover:shadow-md"
              onClick={(e) => {
                e.preventDefault();
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
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            
            <button 
              className="flex items-center justify-center w-full py-2 border border-gray-300 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all shadow-sm hover:shadow-md"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              Facebook
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center relative z-10">
          <div className="flex items-center justify-center bg-white/30 backdrop-blur-sm p-2 rounded-xl shadow-sm">
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1">
                <FiCheck className="text-green-500" size={12} />
              </div>
              <span>Secure</span>
            </div>
            <div className="mx-3 w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1">
                <FiCheck className="text-green-500" size={12} />
              </div>
              <span>10,000+ Users</span>
            </div>
            <div className="mx-3 w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1">
                <FiCheck className="text-green-500" size={12} />
              </div>
              <span>No Spam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
