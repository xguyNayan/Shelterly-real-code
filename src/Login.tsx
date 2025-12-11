import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword, signInWithGoogle, resetPassword } from './firebase/auth';
import { useAuth } from './contexts/AuthContext';

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for saved credentials in localStorage if rememberMe was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('shelterlyEmail');
    const savedRememberMe = localStorage.getItem('shelterlyRememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      // Redirect to dashboard instead of home page
      // The ProtectedRoute and OnboardingRedirect components will handle
      // redirecting to onboarding if needed
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  // Responsive design adjustments based on screen size
  const isMobile = windowWidth < 768;
  const formMaxWidth = isMobile ? '90%' : '420px';
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setIsSubmitting(true);
      await loginWithEmailAndPassword(email, password);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('shelterlyEmail', email);
        localStorage.setItem('shelterlyRememberMe', 'true');
      } else {
        localStorage.removeItem('shelterlyEmail');
        localStorage.removeItem('shelterlyRememberMe');
      }
      
      // Redirect to dashboard instead of home page
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setIsResettingPassword(true);
      await resetPassword(email);
      setSuccess(`Password reset email sent to ${email}. Please check your inbox.`);
      setShowForgotPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsGoogleSubmitting(true);
      await signInWithGoogle();
      // Redirect to dashboard instead of home page
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };
  // Different layouts for mobile and desktop
  const renderDesktopLayout = () => (
    <>
      {/* Welcome text and tagline in the top-left area - Desktop only */}
      <div className="absolute top-32 left-0 p-8 md:p-12 lg:p-16 z-20 max-w-lg hidden md:block">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight">
          Welcome <span className="text-primary-300">Back</span>
        </h1>
        <p className="text-black/80 text-lg md:text-xl mb-6 leading-relaxed">
          Sign in to access your account and continue your search for the perfect college accommodation.
        </p>
        
        {/* Feature highlights - Desktop only */}
        <div className="flex flex-col space-y-3 mt-10">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-black/90 text-sm md:text-base">Save your favorite properties</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-black/90 text-sm md:text-base">Message landlords and potential roommates</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-black/90 text-sm md:text-base">Track your application status</span>
          </div>
        </div>
      </div>
    </>
  );
  
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-primary-800/20 to-primary-900/30 z-10 pointer-events-none"></div>
      
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none"></div>
      
      {/* Render desktop layout */}
      {renderDesktopLayout()}
        

      
      {/* Decorative elements */}
      <div className="absolute top-[15%] left-[40%] w-24 h-24 bg-primary-300/10 rounded-full blur-xl z-5 animate-float-slow"></div>
      <div className="absolute top-[10%] right-[30%] w-16 h-16 bg-primary-500/10 rounded-full blur-lg z-5 animate-float-medium"></div>
      
      {/* Mobile-specific welcome text - Mobile only */}
      <div className="md:hidden absolute top-0 left-0 right-0 p-6 z-20 text-center pt-16">
        <h1 className="text-3xl font-bold text-black mb-2 leading-tight">
          Welcome <span className="text-primary-300">Back</span>
        </h1>
        <p className="text-black/80 text-sm mb-2 leading-relaxed">
          Sign in to access your account
        </p>
      </div>
      
      {/* Full-screen 3D Model with restricted movement */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-900/50 backdrop-blur-sm z-50">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="w-full h-full relative">
          {/* 3D model only on desktop for better performance */}
          <div className="absolute inset-0 md:transform md:translate-y-[20%] md:scale-100 hidden md:block">
            <Spline 
              scene="https://prod.spline.design/4fcLcNSTs9aDKQMs/scene.splinecode" 
              onLoad={() => setIsLoading(false)}
            />
          </div>
          
          {/* Static design for mobile - better performance */}
          <div className="absolute inset-0 block md:hidden">
            <div className="relative w-full h-full bg-gradient-to-br from-teal-50 to-primary-50">
              {/* Grid pattern background */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>
              
              {/* Curved accent element */}
              <div className="absolute top-0 right-0 w-1/2 h-1/3">
                <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M100,0 C130,40 170,50 200,60 L200,0 Z"
                    fill="#40E0D0"
                    fillOpacity="0.5"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Responsive positioning of the Login Form */}
      <div className="absolute inset-0 w-full h-full flex md:items-center md:justify-end items-end justify-center z-20 px-4 md:px-12 lg:px-20">
        <div 
          className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl shadow-xl px-6 sm:px-8 py-8 sm:py-9 w-full glass-form animate-fade-in relative overflow-hidden md:mt-0 mt-auto mb-4 md:mb-0"
          style={{ 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            maxWidth: formMaxWidth,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)',
            maxHeight: isMobile ? '80vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}
        >
          {/* Decorative elements inside form - smaller and more subtle */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-300/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-28 h-28 bg-coral/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/4 -right-8 w-16 h-16 bg-primary-200/10 rounded-full blur-lg"></div>
          
          {/* Form content with enhanced styling */}
          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-primary-800 mb-1 text-center">Look Who's <span className="text-primary-500">Back</span> in Town!</h2>
            <p className="text-center text-gray-600 text-sm mb-5">Sign in to continue to your account</p>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-2 bg-green-50 border border-green-200 text-green-600 text-xs rounded-lg">
                {success}
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-medium text-gray-700 block ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="you@example.com" 
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/70 border border-white/60 focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none text-gray-800 text-sm placeholder-gray-400 transition shadow-sm" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-medium text-gray-700 block ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/70 border border-white/60 focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none text-gray-800 text-sm placeholder-gray-400 transition shadow-sm" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

              </div>
              
              <div className="flex items-center justify-between pt-1 pb-1">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                    className="h-3.5 w-3.5 text-primary-500 focus:ring-primary-400 border-gray-300 rounded" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <div className="text-xs">
                  <button 
                    type="button"
                    className="font-medium text-primary-600 hover:text-primary-500 transition"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm shadow-md transition transform hover:translate-y-[-1px] active:translate-y-0 active:shadow-sm flex items-center justify-center"
                style={{
                  background: 'linear-gradient(to right, #14b8a6, #0ea5e9)',
                  boxShadow: '0 3px 10px rgba(20, 184, 166, 0.2)'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="h-px w-full bg-primary-200/50" />
              <span className="text-xs text-gray-500 whitespace-nowrap">or continue with</span>
              <span className="h-px w-full bg-primary-200/50" />
            </div>
            
            <div className="mt-4">
              <button 
                type="button" 
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-200 bg-white/80 hover:bg-white transition shadow-sm hover:shadow"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting}
              >
                {isGoogleSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-700 text-xs font-medium">Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-gray-700 text-xs font-medium">Continue with Google</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Forgot Password Form */}
            {showForgotPassword && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Reset Your Password</h3>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="reset-email" className="text-xs font-medium text-gray-700 block ml-1">Email Address</label>
                    <input 
                      id="reset-email"
                      type="email" 
                      placeholder="you@example.com" 
                      className="w-full px-3 py-2.5 rounded-lg bg-white/70 border border-white/60 focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none text-gray-800 text-sm placeholder-gray-400 transition shadow-sm" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2 rounded-lg text-white font-medium text-xs shadow-md transition bg-primary-500 hover:bg-primary-600 flex items-center justify-center"
                      disabled={isResettingPassword}
                    >
                      {isResettingPassword ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="py-2 px-3 rounded-lg text-gray-600 font-medium text-xs border border-gray-300 hover:bg-gray-50 transition"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="mt-4 text-center text-xs text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 transition">
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to home link */}
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-black hover:text-primary-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </Link>
      

    </div>
  );
}
