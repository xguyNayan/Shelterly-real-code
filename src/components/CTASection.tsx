import React, { useState, useEffect } from 'react';
import CTAImage from '../assets/images/landing.jpeg';
const CTASection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <>
      {/* Clean Premium CTA Section with catchy background */}
      <section className={`relative ${isMobile ? 'py-10' : 'py-16'} overflow-hidden`}>
        {/* Catchy background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-500"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSI+PC9yZWN0PjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSI+PC9yZWN0Pjwvc3ZnPg==')] opacity-40"></div>
        
        {/* Diagonal accent */}
        <div className="absolute -bottom-10 -right-10 w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-[30%] h-[30%] bg-coral/10 rounded-full blur-3xl"></div>
        
        {/* Animated dots */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute h-4 w-4 rounded-full bg-white top-[15%] left-[10%] animate-pulse"></div>
          <div className="absolute h-3 w-3 rounded-full bg-white top-[35%] left-[15%] animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute h-2 w-2 rounded-full bg-white top-[65%] left-[5%] animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute h-4 w-4 rounded-full bg-white top-[25%] right-[10%] animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute h-3 w-3 rounded-full bg-white top-[45%] right-[15%] animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute h-2 w-2 rounded-full bg-white top-[75%] right-[5%] animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left content - clean and aligned */}
            <div className={`w-full md:w-1/2 ${isMobile ? 'px-2 py-8' : 'px-6 py-12 md:py-16'} text-white`}>
              {/* Badge */}
              <div className={`inline-block ${isMobile ? 'px-3 py-1 mb-4' : 'px-4 py-1.5 mb-6'} rounded-full bg-white/20 backdrop-blur-sm shadow-sm border border-white/30`}>
                <span className="flex items-center text-sm font-medium text-white">
                  <svg className={`${isMobile ? 'w-3 h-3 mr-1.5' : 'w-4 h-4 mr-2'} text-white`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Company-Serviced
                </span>
              </div>
              
              <h2 className={`${isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-bold text-white mb-6 leading-tight`}>
                India's 1st <br />
                PG marketplace
              </h2>
              
              {/* Clean list items in a straight line */}
              <div className={`${isMobile ? 'mb-6 space-y-3' : 'mb-10 space-y-4'}`}>
                <div className="flex items-center text-white/90">
                  <div className={`flex items-center justify-center ${isMobile ? 'w-6 h-6 mr-2' : 'w-8 h-8 mr-3'} rounded-full bg-white/20`}>
                    <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>100% Verified Listings</span>
                </div>
                <div className="flex items-center text-white/90">
                  <div className={`flex items-center justify-center ${isMobile ? 'w-6 h-6 mr-2' : 'w-8 h-8 mr-3'} rounded-full bg-white/20`}>
                    <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>PGs curated, not dumped</span>
                </div>
                <div className="flex items-center text-white/90">
                  <div className={`flex items-center justify-center ${isMobile ? 'w-6 h-6 mr-2' : 'w-8 h-8 mr-3'} rounded-full bg-white/20`}>
                    <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>Shelterly Assisted Support</span>
                </div>
              </div>
            </div>
            
            {/* Right image - enhanced styling */}
            <div className={`w-full md:w-1/2 ${isMobile ? 'h-[300px]' : 'h-[400px]'} relative ${isMobile ? 'mt-8' : 'mt-16 md:mt-0'}`}>
              {/* Enhanced image container with decorative elements */}
              <div className="relative h-full w-full">
                {/* Decorative corner accents */}
                <div className={`absolute -top-2 -left-2 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-white/30 rounded-tl-lg z-10`}></div>
                <div className={`absolute -top-2 -right-2 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-white/30 rounded-tr-lg z-10`}></div>
                <div className={`absolute -bottom-2 -left-2 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-white/30 rounded-bl-lg z-10`}></div>
                <div className={`absolute -bottom-2 -right-2 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-white/30 rounded-br-lg z-10`}></div>
                
                {/* Main image with subtle border effect */}
                <div className="h-full w-full overflow-hidden rounded-lg shadow-xl border-4 border-white/20">
                  <img 
                    src={CTAImage} 
                    alt="Student in PG accommodation" 
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  
                  {/* Price tag - positioned cleanly */}
                  <div className={`absolute ${isMobile ? 'bottom-4 right-4 py-2 px-4' : 'bottom-6 right-6 py-3 px-6'} bg-white rounded-lg shadow-lg`}>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mb-1`}>Starting from</p>
                    <p className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-primary-600`}>₹7999</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CTASection;
