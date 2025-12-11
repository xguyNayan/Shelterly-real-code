import React, { useEffect, useState, ReactElement } from 'react';
import { FiCheck, FiDollarSign, FiHome, FiMap, FiClock, FiShield, FiZap } from 'react-icons/fi';

interface FeatureProps {
  icon: ReactElement;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description }) => {
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
    <div className="group transform transition-all duration-300 hover:scale-105">
      {/* Hexagon shape using clip-path */}
      <div 
        className="relative bg-white shadow-2xl group-hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] transition-shadow duration-300 mx-auto border"
        style={{ 
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          width: isMobile ? "160px" : "250px",
          height: isMobile ? "160px" : "250px"
        }}
      >
        {/* Content container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5 border">
          {/* Icon with circular background */}
          <div className={`bg-primary-50 rounded-full ${isMobile ? 'p-2 mb-2' : 'p-3.5 mb-4'} text-primary-500 shadow-md border flex items-center justify-center`}>
            <div className={isMobile ? "h-5 w-5" : "h-8 w-8"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`font-bold ${isMobile ? 'text-sm mb-1' : 'text-lg mb-2'} text-gray-800`}>{title}</h3>
          
          {/* Description */}
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600 leading-tight`}>{description}</p>
        </div>
      </div>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
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

  const features = [
    {
      icon: <FiCheck size={24} />,
      title: "Verified PGs",
      description: "Every PG is personally verified by our team to ensure quality, safety, and comfort."
    },
    {
      icon: <FiDollarSign size={24} />,
      title: "No Brokerage",
      description: "Book directly with PG owners without paying any brokerage or hidden fees."
    },
    {
      icon: <FiHome size={24} />,
      title: "Virtual Tours",
      description: "Explore PGs from the comfort of your home with our detailed virtual tours and 360° views."
    },
    {
      icon: <FiMap size={24} />,
      title: "Prime Locations",
      description: "All our PGs are strategically located near colleges, transport hubs, and essential services."
    },
    {
      icon: <FiClock size={24} />,
      title: "24/7 Support",
      description: "Our dedicated support team is available round the clock to assist with any queries or issues."
    },
    {
      icon: <FiShield size={24} />,
      title: "Safe & Secure",
      description: "All our PGs have proper security measures to ensure your safety and peace of mind."
    },
    {
      icon: <FiZap size={24} />,
      title: "Fast Process",
      description: "Quick and hassle-free booking process to help you find your ideal PG accommodation."
    }
  ];

  return (
    <section className="py-12 md:py-24 bg-gray-50 relative overflow-hidden" id="features">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top right decorative ribbon */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100 rounded-full opacity-50 transform rotate-12"></div>
        
        {/* Bottom left decorative ribbon */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-100 rounded-full opacity-40"></div>
        
        {/* Top left pattern */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent opacity-10 rounded-full"></div>
        
        {/* Middle right pattern */}
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-primary-200 opacity-20 rounded-full"></div>
        
        {/* Diagonal ribbon */}
        <div className="absolute top-1/4 left-1/3 w-full h-20 bg-primary-50 opacity-30 transform -rotate-12"></div>
        
        {/* Dotted pattern - top */}
        <div className="absolute top-40 right-1/4 grid grid-cols-3 gap-4 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={`dot-top-${i}`} className="w-2 h-2 rounded-full bg-primary-400"></div>
          ))}
        </div>
        
        {/* Dotted pattern - bottom */}
        <div className="absolute bottom-20 left-1/4 grid grid-cols-3 gap-4 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={`dot-bottom-${i}`} className="w-2 h-2 rounded-full bg-primary-400"></div>
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-20">
          <span className="bg-primary-100 text-primary-700 text-xs md:text-sm font-semibold px-3 md:px-4 py-1 rounded-full">PREMIUM-FOCUSED</span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 md:mt-4 mb-3 md:mb-4 text-gray-900">Why Choose Shelterly?</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            We're revolutionizing how students and working professionals find accommodation with our curated selection of premium PGs.
          </p>
        </div>
        
        {/* Honeycomb layout - responsive */}
        <div className="max-w-7xl mx-auto">
          {isMobile ? (
            /* Mobile layout - grid */
            <div className="grid grid-cols-2 gap-4 px-2">
              {features.map((feature, index) => (
                <div key={index} className="flex justify-center">
                  <FeatureCard 
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Desktop layout - honeycomb */
            <>
              {/* First row - 4 hexagons */}
              <div className="flex justify-center -mb-16">
                <div className="px-6 sm:px-8 w-1/4 max-w-[280px]">
                  <FeatureCard 
                    icon={features[0].icon}
                    title={features[0].title}
                    description={features[0].description}
                  />
                </div>
                <div className="px-6 sm:px-8 w-1/4 max-w-[280px]">
                  <FeatureCard 
                    icon={features[1].icon}
                    title={features[1].title}
                    description={features[1].description}
                  />
                </div>
                <div className="px-6 sm:px-8 w-1/4 max-w-[280px]">
                  <FeatureCard 
                    icon={features[2].icon}
                    title={features[2].title}
                    description={features[2].description}
                  />
                </div>
                <div className="px-6 sm:px-8 w-1/4 max-w-[280px]">
                  <FeatureCard 
                    icon={features[3].icon}
                    title={features[3].title}
                    description={features[3].description}
                  />
                </div>
              </div>
              
              {/* Second row - 3 hexagons (offset) */}
              <div className="flex justify-center mt-6">
                <div className="px-6 sm:px-8 w-1/3 max-w-[280px] ml-[1px]">
                  <FeatureCard 
                    icon={features[4].icon}
                    title={features[4].title}
                    description={features[4].description}
                  />
                </div>
                <div className="px-6 sm:px-8 w-1/3 max-w-[280px] mx-4">
                  <FeatureCard 
                    icon={features[5].icon}
                    title={features[5].title}
                    description={features[5].description}
                  />
                </div>
                <div className="px-6 sm:px-8 w-1/3 max-w-[280px]">
                  <FeatureCard 
                    icon={features[6].icon}
                    title={features[6].title}
                    description={features[6].description}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
