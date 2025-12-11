import React, { useState, useEffect } from 'react';
import { storage } from '../firebase/config';
import { ref, getDownloadURL } from 'firebase/storage';

interface Testimonial {
  quote: string;
  name: string;
  college: string;
  image: string;
  imageRef?: string; // Firebase Storage reference path
}

const TestimonialsSection: React.FC = () => {
  // Default fallback images
  const defaultMaleImage = 'https://randomuser.me/api/portraits/men/32.jpg';
  const defaultFemaleImage = 'https://randomuser.me/api/portraits/women/44.jpg';
  
  const testimonials: Testimonial[] = [
    {
      quote: "I was skeptical at first, but Shelterly's verified PGs gave me peace of mind. My parents were impressed with the safety measures.",
      name: "Rayan Hussain",
      college: "St Joseph's University",
      image: defaultMaleImage, // Default image in case Firebase fails
      imageRef: "testimonials/WhatsApp Image 2025-04-22 at 21.32.55.jpeg"
    },
    {
      quote: "The 24/7 support team was incredibly helpful when I had an issue with my booking. They resolved it within hours!",
      name: "Mukundh SM",
      college: "Christ University",
      image: defaultMaleImage,
      imageRef: "testimonials/WhatsApp Image 2025-04-25 at 21.13.58.jpeg"
    },
    {
      quote: "Finding accommodation in prime locations near my college seemed impossible until I found Shelterly. Now I save hours on commuting every day.",
      name: "Kritika Kaushik",
      college: "St Joseph's University",
      image: defaultFemaleImage,
      imageRef: "testimonials/WhatsApp Image 2025-04-25 at 21.16.12.jpeg"
    },
    {
      quote: "The fast booking process was a lifesaver. I got my PG confirmed just three days before my semester started!",
      name: "Siddhart",
      college: "St Joseph's University",
      image: defaultMaleImage,
      imageRef: "testimonials/file_2025-04-25_16.44.56.png"
    },
    {
      quote: "Great experience. I was nervous about the PGs but then I found Shelterly!",
      name: "Jacob",
      college: "St Joseph's University",
      image: defaultMaleImage,
      imageRef: "testimonials/WhatsApp Image 2025-04-26 at 00.50.38.jpeg"
    },
    {
      quote: "The Shelter Swipe feature is amazing! I could swipe till i found my perfect PG.",
      name: "Hriday Bali",
      college: "Christ University",
      image: defaultMaleImage,
      imageRef: "testimonials/WhatsApp Image 2025-04-26 at 00.51.50.jpeg"
    },
    {
      quote: "The Shelter Swipe feature was a game-changer for me! I found my perfect PG in just a few swipes.",
      name: "Amisha",
      college: "Christ University",
      image: defaultMaleImage,
      imageRef: "testimonials/IMG-20250425-WA0013.jpg"
    },
    {
      quote: "Pg was easy to find and book. The app was user-friendly and the PG was spotless.",
      name: "Aarav",
      college: "Christ University",
      image: defaultMaleImage,
      imageRef: "testimonials/IMG-20250425-WA0015.jpg"
    },
    {
      quote: "Awesome app! I found my perfect PG in just a few swipes. Like a perfect match!",
      name: "Henry",
      college: "Christ University",
      image: defaultMaleImage,
      imageRef: "testimonials/IMG_6714.JPG"
    },
    {
      quote: "Just what I needed for the ease the hustle of finding a PG",
      name: "Khusbu Rajpurohit",
      college: "St. Joseph's University",
      image: defaultMaleImage,
      imageRef: "testimonials/WhatsApp Image 2025-04-26 at 21.20.03.jpeg"
    }
  ];

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedTestimonials, setLoadedTestimonials] = useState<Testimonial[]>([]);
  const [autoplay, setAutoplay] = useState(true); // Control autoplay

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
  
  // Load images from Firebase Storage
  useEffect(() => {
    const loadImages = async () => {
      try {
        const updatedTestimonials = await Promise.all(
          testimonials.map(async (testimonial) => {
            if (testimonial.imageRef) {
              try {
                const imageRef = ref(storage, testimonial.imageRef);
                const imageUrl = await getDownloadURL(imageRef);
                return { ...testimonial, image: imageUrl };
              } catch (error) {
                console.error(`Error loading image for ${testimonial.name}:`, error);
                // Image already has a default value, so just return the testimonial
                return testimonial;
              }
            }
            return testimonial;
          })
        );
        
        setLoadedTestimonials(updatedTestimonials);
      } catch (error) {
        console.error('Error loading testimonial images:', error);
        // If there's a catastrophic error, at least set the original testimonials
        // so we have something to display
        setLoadedTestimonials(testimonials);
      }
    };
    
    loadImages();
  }, []);

  useEffect(() => {
    // Only start the interval if we have loaded testimonials and autoplay is enabled
    if (loadedTestimonials.length === 0 || !autoplay) return;
    
    const intervalId = setInterval(() => {
      // Start fade out
      setIsVisible(false);
      
      // Change testimonial after fade out
      setTimeout(() => {
        setCurrentTestimonialIndex((prevIndex) => 
          prevIndex === loadedTestimonials.length - 1 ? 0 : prevIndex + 1
        );
        // Start fade in
        setIsVisible(true);
      }, 700); // This should match the transition duration
      
    }, 6000); // Change testimonial every 6 seconds
    
    return () => clearInterval(intervalId);
  }, [loadedTestimonials.length, autoplay]);
  
  // Function to navigate to a specific testimonial
  const goToTestimonial = (index: number) => {
    // Pause autoplay when manually navigating
    setAutoplay(false);
    
    // Start fade out
    setIsVisible(false);
    
    // Change testimonial after fade out
    setTimeout(() => {
      setCurrentTestimonialIndex(index);
      // Start fade in
      setIsVisible(true);
    }, 700);
  };
  
  // Function to go to the previous testimonial
  const prevTestimonial = () => {
    const newIndex = currentTestimonialIndex === 0 
      ? loadedTestimonials.length - 1 
      : currentTestimonialIndex - 1;
    goToTestimonial(newIndex);
  };
  
  // Function to go to the next testimonial
  const nextTestimonial = () => {
    const newIndex = currentTestimonialIndex === loadedTestimonials.length - 1 
      ? 0 
      : currentTestimonialIndex + 1;
    goToTestimonial(newIndex);
  };

  // Show a loading state if testimonials haven't loaded yet
  if (loadedTestimonials.length === 0) {
    return (
      <section className="py-24 bg-gray-50 relative overflow-hidden" id="testimonials">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="animate-pulse flex flex-col items-center justify-center h-[400px]">
            <div className="w-12 h-12 bg-primary-200 rounded-full mb-4"></div>
            <div className="h-4 bg-primary-100 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </section>
    );
  }
  
  const currentTestimonial = loadedTestimonials[currentTestimonialIndex];

  return (
    <section className={`${isMobile ? 'py-12' : 'py-24'} bg-gray-50 relative overflow-hidden`} id="testimonials">
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center ${isMobile ? 'mb-8' : 'mb-12'}`}>
          <span className={`bg-primary-100 text-primary-700 ${isMobile ? 'text-xs px-3 py-0.5' : 'text-sm px-4 py-1'} font-semibold rounded-full`}>SHELTERITE'S STORIES</span>
          <h2 className={`${isMobile ? 'text-2xl mt-3 mb-2' : 'text-4xl mt-4 mb-4'} font-bold text-gray-900`}>What Our Users Say</h2>
          <p className={`${isMobile ? 'text-sm' : 'text-xl'} text-gray-600 max-w-2xl mx-auto`}>
            Thousands of students have found their perfect accommodation through Shelterly.
          </p>
        </div>
      </div>
      
      {/* Floating avatars container */}
      <div className={`relative w-full ${isMobile ? 'h-[400px]' : 'h-[650px]'} overflow-hidden`}>
        {/* Central testimonial quote - positioned lower to leave space for avatar cloud above */}
        <div className={`absolute inset-x-0 ${isMobile ? 'bottom-[80px]' : 'bottom-[150px]'} flex items-center justify-center px-4`}>
          <div 
            className={`bg-white/40 backdrop-blur-sm ${isMobile ? 'px-5 py-4' : 'px-8 py-6'} rounded-xl shadow-md text-center max-w-xl mx-auto transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} relative`}
          >
            {/* Navigation arrows */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-20"
              aria-label="Previous testimonial"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-20"
              aria-label="Next testimonial"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <svg className={`${isMobile ? 'h-4 w-4 mb-2' : 'h-6 w-6 mb-3'} text-primary-400 mx-auto`} fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className={`text-gray-700 italic ${isMobile ? 'text-sm mb-3 line-clamp-4' : 'text-lg mb-4'}`}>{currentTestimonial.quote}</p>
            <div className="flex items-center justify-center">
              <img 
                src={currentTestimonial.image} 
                alt={currentTestimonial.name} 
                className={`${isMobile ? 'w-5 h-5' : 'w-10 h-10'} rounded-full object-cover border-2 border-primary-100`}
              />
              <div className="ml-3 text-left">
                <h4 className={`font-medium text-gray-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>{currentTestimonial.name}</h4>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>{currentTestimonial.college}</p>
              </div>
            </div>
            
            {/* Testimonial indicator dots */}
            <div className="flex justify-center mt-4 space-x-1">
              {loadedTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentTestimonialIndex === index 
                      ? 'bg-primary-500 w-4' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={currentTestimonialIndex === index ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating avatars - cloud arrangement above the testimonial */}
        
        {/* Safety check to ensure loadedTestimonials exists and has items */}
        {loadedTestimonials && loadedTestimonials.length > 0 && (
          <>
            {/* Large avatars - main focal points */}
            <div className={`absolute ${isMobile ? 'top-[8%] left-[30%] w-10 h-10' : 'top-[8%] left-[35%] w-28 h-28'} z-30`}>
              <img src={loadedTestimonials[3 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-slow object-cover w-full h-full" />
            </div>
            <div className={`absolute ${isMobile ? 'top-[28%] right-[38%] w-12 h-12' : 'top-[28%] right-[48%] w-32 h-32'} z-20`}>
              <img src={loadedTestimonials[0 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-medium object-cover w-full h-full" />
            </div>
            <div className={`absolute ${isMobile ? 'top-[20%] right-[55%] w-12 h-12' : 'top-[18%] right-[22%] w-32 h-32'} z-20`}>
              <img src={loadedTestimonials[9 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-medium object-cover w-full h-full" />
            </div>
            
            
            {/* Medium avatars - scattered in the upper middle area */}
            <div className={`absolute ${isMobile ? 'top-[20%] left-[55%] w-6 h-6' : 'top-[20%] left-[55%] w-16 h-16'} z-10`}>
              <img src={loadedTestimonials[2 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-delay-2 object-cover w-full h-full" />
            </div>
            <div className={`absolute ${isMobile ? 'top-[5%] left-[70%] w-9 h-9' : 'top-[5%] left-[30%] w-20 h-20'} z-30`}>
              <img src={loadedTestimonials[5 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-medium object-cover w-full h-full" />
            </div>
            <div className={`absolute ${isMobile ? 'top-[25%] left-[20%] w-9 h-9' : 'top-[25%] left-[27%] w-20 h-20'} z-30`}>
              <img src={loadedTestimonials[6 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-medium object-cover w-full h-full" />
            </div>
            
            
            {/* Smaller avatars - filling in the gaps */}
            <div className={`absolute ${isMobile ? 'top-[18%] left-[48%] w-5 h-5' : 'top-[18%] left-[42%] w-12 h-12'} z-10`}>
              <img src={loadedTestimonials[1 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-delay-2 object-cover w-full h-full" />
            </div>
            <div className={`absolute ${isMobile ? 'top-[35%] left-[35%] w-6 h-6' : 'top-[35%] left-[35%] w-14 h-14'} z-20`}>
              <img src={loadedTestimonials[4 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-slow object-cover w-full h-full" />
            </div>
            <div className={`absolute ${isMobile ? 'top-[35%] left-[76%] w-6 h-6' : 'top-[35%] left-[66%] w-14 h-14'} z-20`}>
              <img src={loadedTestimonials[7 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-slow object-cover w-full h-full" />
            </div>
            <div className={`absolute ${isMobile ? 'top-[20%] left-[70%] w-6 h-6' : 'top-[10%] left-[64%] w-14 h-14'} z-20`}>
              <img src={loadedTestimonials[8 % loadedTestimonials.length].image} alt="Student" className="rounded-full shadow-lg animate-float-slow object-cover w-full h-full" />
            </div>
            
          </>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-gray-100/50 to-transparent pointer-events-none"></div>
      <div className={`absolute top-0 right-0 ${isMobile ? 'w-24 h-24' : 'w-40 h-40'} bg-primary-100 rounded-full opacity-20 transform -translate-y-1/2 translate-x-1/2`}></div>
      <div className={`absolute bottom-0 left-0 ${isMobile ? 'w-36 h-36' : 'w-60 h-60'} bg-primary-50 rounded-full opacity-30 transform translate-y-1/3 -translate-x-1/3`}></div>
    </section>
  );
};

export default TestimonialsSection;
