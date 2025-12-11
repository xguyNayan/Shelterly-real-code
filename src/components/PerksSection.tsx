import React, { useState, useEffect, ReactElement } from 'react';

interface PerkCardProps {
  icon: ReactElement;
  title: string;
  description: string;
  delay: number;
  stepNumber: number;
  className?: string;
}

const PerkCard: React.FC<PerkCardProps> = ({ icon, title, description, delay, stepNumber, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300 + delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transform transition-all duration-700 ease-out relative
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        ${className}
      `}
    >
      {/* Step number indicator */}
      <div className={`absolute ${isMobile ? '-top-3 left-4' : '-top-4 left-8'} z-10`}>
        <div className={`bg-primary-500 text-white ${isMobile ? 'w-5 h-5 text-xs' : 'w-8 h-8 text-sm'} rounded-full flex items-center justify-center font-bold shadow-md`}>
          {stepNumber}
        </div>
      </div>
      
      <div className={`bg-white rounded-xl ${isMobile ? 'rounded-lg' : 'rounded-2xl'} shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group h-full border border-gray-100`}>
        {/* Colored top bar */}
        <div className={`${isMobile ? 'h-1' : 'h-2'} bg-primary-500`}></div>
        
        <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
          {/* Icon with colored background */}
          <div className={`bg-primary-100 ${isMobile ? 'p-2 w-10 h-10 mb-2' : 'p-4 w-16 h-16 mb-5'} rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-300 shadow-sm`}>
            <div className="text-primary-600 flex items-center justify-center w-full h-full">
              <div className={isMobile ? "h-5 w-5" : "h-8 w-8"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`${isMobile ? 'text-sm mb-1' : 'text-xl mb-3'} font-bold text-gray-800 group-hover:text-primary-600 transition-colors duration-300`}>{title}</h3>
          
          {/* Description - Truncated for mobile */}
          {isMobile ? (
            <p className="text-xs text-gray-600 leading-tight line-clamp-3">
              {description}
            </p>
          ) : (
            <p className="text-gray-600 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PerksSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('perks-section');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  // Add animation styles to the document
  useEffect(() => {
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes ping-slow {
        0% {
          transform: translateX(0);
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          transform: translateX(100%);
          opacity: 1;
        }
      }
      
      .animate-ping-slow {
        animation: ping-slow 3s linear infinite;
      }
      
      /* Add line-clamp utility */
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <section id="perks-section" className={`${isMobile ? 'py-10' : 'py-24'} px-4 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white`}>
      {/* Background accent */}
      <div className="absolute top-0 inset-x-0 h-40 bg-primary-50"></div>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Section Header with visual emphasis */}
        <div 
          className={`
            ${isMobile ? 'mb-8' : 'mb-16'} max-w-2xl mx-auto text-center
            transform transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
          `}
        >
          <div className="inline-block mb-3">
            <span className={`bg-primary-100 text-primary-700 ${isMobile ? 'text-xs px-3' : 'text-sm px-4'} font-semibold py-1 rounded-full`}>SHELTERLY EXCLUSIVE</span>
          </div>
          <h2 className={`${isMobile ? 'text-xl' : 'text-4xl md:text-5xl'} font-bold mb-6 text-gray-900`}>Exclusive Perks</h2>
          <p className={`${isMobile ? 'text-sm' : 'text-xl'} text-gray-600 max-w-xl mx-auto`}>
            Enjoy these special benefits available only when you book your PG accommodation through Shelterly.
          </p>
        </div>
        
        {/* Journey Title */}
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
          <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium text-primary-600`}>Your Shelterly Journey</h3>
        </div>
        
        {/* Perks Grid Layout with connecting lines */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-3 gap-8'} relative`}>
          {/* Connecting line (visible only on desktop) */}
          <div className="hidden md:block absolute top-20 left-0 right-0 z-0">
            <div className="h-0.5 bg-gradient-to-r from-primary-100 via-primary-300 to-primary-100 w-full relative">
              {/* Animated dot */}
              <div className="absolute h-3 w-3 rounded-full bg-primary-500 -top-1 animate-ping-slow opacity-75"></div>
              
              {/* Arrow markers */}
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-500">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="absolute top-1/2 left-2/3 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-500">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Mobile connecting lines (visible only on mobile) */}
          {isMobile && (
            <div className="absolute left-4 top-20 bottom-20 w-0.5 bg-gradient-to-b from-primary-100 via-primary-300 to-primary-100 z-0">
              {/* Arrow markers */}
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-500 rotate-90">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="absolute left-1/2 top-2/3 -translate-x-1/2">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-500 rotate-90">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {/* Animated dot */}
              <div className="absolute w-2 h-2 rounded-full bg-primary-500 -left-1 animate-ping-slow opacity-75"></div>
            </div>
          )}
          
          {/* FREE Laundry Service */}
          <PerkCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            }
            title="FREE Laundry Service"
            description="No more worrying about dirty clothes! Get complimentary laundry service for your first month when you book any PG through Shelterly."
            delay={100}
            stepNumber={1}
            className={isMobile ? 'ml-6' : ''}
          />
          
          {/* Gaming Lounge Access */}
          <PerkCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <line x1="6" y1="12" x2="10" y2="12"></line>
                <line x1="8" y1="10" x2="8" y2="14"></line>
                <circle cx="17" cy="12" r="2"></circle>
                <circle cx="13" cy="12" r="2"></circle>
              </svg>
            }
            title="Gaming Lounge Access"
            description="Our partnership with DSD Gaming gives you discounted access to premium gaming lounges with PS5 consoles, VR setups, and more. Perfect for unwinding after classes!"
            delay={200}
            stepNumber={2}
            className={isMobile ? 'ml-6' : ''}
          />
          
          {/* Mental Wellness Support */}
          <PerkCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
            }
            title="Mental Wellness Support"
            description="College life can be stressful. Get special access to AumHum's premium meditation and mindfulness programs to help maintain your mental well-being throughout the semester."
            delay={300}
            stepNumber={3}
            className={isMobile ? 'ml-6' : ''}
          />
        </div>
        
        {/* Journey description (visible only on desktop) */}
        <div className="hidden md:grid grid-cols-3 gap-8 mt-4 text-sm text-gray-600">
          <div className="text-center">
            <p className="font-medium text-primary-700">Start with free laundry</p>
            <p>When you first move in</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-primary-700">Unwind at gaming lounges</p>
            <p>After your classes</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-primary-700">Maintain mental well-being</p>
            <p>Throughout the semester</p>
          </div>
        </div>
        
        {/* Mobile journey descriptions */}
        {isMobile && (
          <div className="grid grid-cols-1 gap-3 mt-4 text-xs text-gray-600 ml-6 hidden">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-2 text-xs">1</div>
              <div>
                <p className="font-medium text-primary-700">Start with free laundry</p>
                <p className="text-xs">When you first move in</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-2 text-xs">2</div>
              <div>
                <p className="font-medium text-primary-700">Unwind at gaming lounges</p>
                <p className="text-xs">After your classes</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-2 text-xs">3</div>
              <div>
                <p className="font-medium text-primary-700">Maintain mental well-being</p>
                <p className="text-xs">Throughout the semester</p>
              </div>
            </div>
          </div>
        )}
        
        {/* CTA with visual emphasis */}
        <div className={`text-center ${isMobile ? 'mt-8' : 'mt-16'}`}>
          
          {/* Trust indicator */}
          <div className={`${isMobile ? 'mt-3 text-xs' : 'mt-6'} flex items-center justify-center gap-2 text-gray-500`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'} text-primary-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Trusted by many people across Bengaluru</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerksSection;
