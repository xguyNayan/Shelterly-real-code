import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';
import { getOptimizedImageUrl, getResponsiveImageUrl } from '../../utils/imageOptimization';

interface HeroCarouselProps {
  photos: { url: string; category: string; caption?: string }[];
  videos?: { videoUrl: string; thumbnailUrl: string; category: string; caption?: string; duration?: number }[];
  pgName: string;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ photos, videos = [], pgName }) => {
  // Combine photos and videos into a single media array for the carousel
  const mediaItems = [
    ...photos.map(photo => ({ type: 'photo', ...photo })),
    ...videos.map(video => ({ type: 'video', url: video.thumbnailUrl, videoUrl: video.videoUrl, category: video.category, caption: video.caption, duration: video.duration }))
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Auto-advance the carousel every 5 seconds, but only if no video is playing
  useEffect(() => {
    if (isVideoPlaying || mediaItems.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % mediaItems.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [mediaItems.length, isVideoPlaying]);
  
  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % mediaItems.length);
    setIsVideoPlaying(false);
  };
  
  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? mediaItems.length - 1 : current - 1));
    setIsVideoPlaying(false);
  };
  
  // Format video duration (seconds to MM:SS)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // If no media provided, use placeholders
  const carouselItems = mediaItems.length > 0 ? mediaItems : [
    { type: 'photo', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', category: 'Room' },
    { type: 'photo', url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc', category: 'Kitchen' },
    { type: 'photo', url: 'https://images.unsplash.com/photo-1585128792020-803d29415281', category: 'Bathroom' },
  ];
  
  return (
    <div className="relative w-full h-[60vh] overflow-hidden rounded-[30px] mb-8">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-teal-50 to-teal-100 opacity-20">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#00A99D 1px, transparent 1px), linear-gradient(to right, #00A99D 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          opacity: 0.05
        }}></div>
      </div>
      
      {/* Wavy design pattern at top */}
      <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute top-0 w-full h-24">
          <path fill="#00A99D" fillOpacity="0.1" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
          <path fill="#00A99D" fillOpacity="0.07" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"></path>
        </svg>
      </div>
      
      {/* Carousel media items (photos and videos) */}
      <div className="relative w-full h-full">
        {carouselItems.map((item, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
          >
            {item.type === 'photo' ? (
              /* Photo item */
              <picture>
                <source
                  srcSet={getOptimizedImageUrl(item.url)}
                  type="image/webp"
                />
                <img 
                  src={item.url} 
                  alt={item.caption || item.category || pgName}
                  className="w-full h-full object-cover"
                  width="1200"
                  height="800"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </picture>
            ) : (
              /* Video item */
              <div className="relative w-full h-full">
                {isVideoPlaying && index === activeIndex ? (
                  <video 
                    src={item.videoUrl} 
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    onEnded={() => setIsVideoPlaying(false)}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img 
                      src={item.url} 
                      alt={item.caption || item.category || pgName}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        if (index === activeIndex) {
                          setIsVideoPlaying(true);
                        } else {
                          setActiveIndex(index);
                        }
                      }}
                    >
                      <div className="bg-black bg-opacity-50 rounded-full p-6">
                        <FiPlay size={32} className="text-white" />
                      </div>
                    </div>
                    {item.duration && (
                      <div className="absolute bottom-16 right-6 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.duration)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{pgName}</h1>
              <div className="flex items-center">
                <p className="text-md md:text-2xl">{item.category}</p>
                {item.type === 'video' && (
                  <span className="ml-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded">Video</span>
                )}
              </div>
              {item.caption && <p className="text-sm opacity-80 mt-1">{item.caption}</p>}
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/30 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/50 transition-all"
        aria-label="Previous slide"
      >
        <FiChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/30 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/50 transition-all"
        aria-label="Next slide"
      >
        <FiChevronRight size={24} />
      </button>
      
      {/* Indicators */}
      <div className="absolute bottom-8  left-0 right-0 z-30 flex justify-center space-x-2">
        {carouselItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index);
              setIsVideoPlaying(false);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? 'bg-white scale-125' : 'bg-white/50'
            } ${
              item.type === 'video' ? 'border border-purple-300' : ''
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Curved accent element in corner */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-500 opacity-10 rounded-tl-full z-10"></div>
    </div>
  );
};

export default HeroCarousel;
