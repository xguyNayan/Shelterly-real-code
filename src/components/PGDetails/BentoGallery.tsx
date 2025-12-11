import React, { useState } from 'react';
import { FiMaximize, FiX, FiImage } from 'react-icons/fi';
import { getOptimizedImageUrl, getResponsiveImageUrl, getLoadingAttribute } from '../../utils/imageOptimization';

interface BentoGalleryProps {
  photos: { url: string; category: string; caption?: string }[];
}

const BentoGallery: React.FC<BentoGalleryProps> = ({ photos }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  
  // Use actual photos or an empty array
  const galleryPhotos = photos.length > 0 ? photos : [];
  
  const openGalleryModal = (index: number) => {
    setActivePhotoIndex(index);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeGalleryModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };
  
  const nextPhoto = () => {
    setActivePhotoIndex((prevIndex) => 
      prevIndex === galleryPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevPhoto = () => {
    setActivePhotoIndex((prevIndex) => 
      prevIndex === 0 ? galleryPhotos.length - 1 : prevIndex - 1
    );
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showModal) return;
      
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') closeGalleryModal();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-md sm:text-2xl font-bold text-primary-800 relative">
          Photo Gallery
          <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-500 rounded-full"></div>
        </h2>
        <button 
          onClick={() => openGalleryModal(0)}
          className="flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors"
        >
          <FiImage className="mr-2" />
          <span>View All</span>
        </button>
      </div>
      
      {/* Bento Grid Gallery */}
      {galleryPhotos.length > 0 ? (
        <div className="grid grid-cols-12 gap-3 md:gap-4 auto-rows-[120px] md:auto-rows-[180px]">
          {/* Featured large image (spans 2 rows and 6 columns) */}
          <div 
            className="col-span-12 md:col-span-6 row-span-2 relative rounded-[24px] overflow-hidden cursor-pointer group"
            onClick={() => openGalleryModal(0)}
          >
            <picture>
              <source
                srcSet={getOptimizedImageUrl(galleryPhotos[0].url)}
                type="image/webp"
              />
              <img 
                src={galleryPhotos[0].url} 
                alt={galleryPhotos[0].caption || galleryPhotos[0].category}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                width="600"
                height="400"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-medium">{galleryPhotos[0].category}</h3>
                {galleryPhotos[0].caption && (
                  <p className="text-sm opacity-80">{galleryPhotos[0].caption}</p>
                )}
              </div>
              <div className="absolute top-4 right-4">
                <FiMaximize className="text-white text-xl" />
              </div>
            </div>
          </div>
          
          {/* Second image (spans 3 columns) */}
          {galleryPhotos.length > 1 && (
            <div 
              className="col-span-6 md:col-span-3 row-span-1 relative rounded-[24px] overflow-hidden cursor-pointer group"
              onClick={() => openGalleryModal(1)}
            >
              <picture>
                <source
                  srcSet={getOptimizedImageUrl(galleryPhotos[1]?.url || galleryPhotos[0].url)}
                  type="image/webp"
                />
                <img 
                  src={galleryPhotos[1]?.url || galleryPhotos[0].url} 
                  alt={galleryPhotos[1]?.caption || galleryPhotos[1]?.category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width="300"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium">{galleryPhotos[1]?.category}</h3>
                </div>
              </div>
            </div>
          )}
          
          {/* Third image (spans 3 columns) */}
          {galleryPhotos.length > 2 && (
            <div 
              className="col-span-6 md:col-span-3 row-span-1 relative rounded-[24px] overflow-hidden cursor-pointer group"
              onClick={() => openGalleryModal(2)}
            >
              <picture>
                <source
                  srcSet={getOptimizedImageUrl(galleryPhotos[2]?.url || galleryPhotos[0].url)}
                  type="image/webp"
                />
                <img 
                  src={galleryPhotos[2]?.url || galleryPhotos[0].url} 
                  alt={galleryPhotos[2]?.caption || galleryPhotos[2]?.category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width="300"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium">{galleryPhotos[2]?.category}</h3>
                </div>
              </div>
            </div>
          )}
          
          {/* Fourth image (spans 6 columns) */}
          {galleryPhotos.length > 3 && (
            <div 
              className="col-span-6 md:col-span-3 row-span-1 relative rounded-[24px] overflow-hidden cursor-pointer group"
              onClick={() => openGalleryModal(3)}
            >
              <picture>
                <source
                  srcSet={getOptimizedImageUrl(galleryPhotos[3]?.url || galleryPhotos[0].url)}
                  type="image/webp"
                />
                <img 
                  src={galleryPhotos[3]?.url || galleryPhotos[0].url} 
                  alt={galleryPhotos[3]?.caption || galleryPhotos[3]?.category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width="300"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium">{galleryPhotos[3]?.category}</h3>
                </div>
              </div>
            </div>
          )}
          
          {/* Fifth image (spans 3 columns) */}
          {galleryPhotos.length > 4 && (
            <div 
              className="col-span-6 md:col-span-3 row-span-1 relative rounded-[24px] overflow-hidden cursor-pointer group"
              onClick={() => openGalleryModal(4)}
            >
              <picture>
                <source
                  srcSet={getOptimizedImageUrl(galleryPhotos[4]?.url || galleryPhotos[0].url)}
                  type="image/webp"
                />
                <img 
                  src={galleryPhotos[4]?.url || galleryPhotos[0].url} 
                  alt={galleryPhotos[4]?.caption || galleryPhotos[4]?.category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width="300"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium">{galleryPhotos[4]?.category}</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[24px] p-8 text-center mb-12">
          <FiImage className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Photos Available</h3>
          <p className="text-gray-500">This PG doesn't have any photos uploaded yet.</p>
        </div>
      )}
      
      {/* Full screen gallery modal */}
      {showModal && galleryPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-90"></div>
          
          <div className="relative z-10 w-full max-w-6xl px-4">
            {/* Close button */}
            <button 
              onClick={closeGalleryModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <FiX size={24} />
            </button>
            
            {/* Main image */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <picture>
                <source
                  srcSet={getOptimizedImageUrl(galleryPhotos[activePhotoIndex].url)}
                  type="image/webp"
                />
                <img 
                  src={galleryPhotos[activePhotoIndex].url} 
                  alt={galleryPhotos[activePhotoIndex].caption || galleryPhotos[activePhotoIndex].category}
                  className="w-full h-full object-contain"
                  width="1200"
                  height="800"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            
            {/* Caption */}
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-medium">{galleryPhotos[activePhotoIndex].category}</h3>
              {galleryPhotos[activePhotoIndex].caption && (
                <p className="text-gray-300 mt-1">{galleryPhotos[activePhotoIndex].caption}</p>
              )}
            </div>
            
            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button 
                onClick={prevPhoto}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="text-white text-sm">
                {activePhotoIndex + 1} / {galleryPhotos.length}
              </div>
              
              <button 
                onClick={nextPhoto}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Thumbnails */}
            <div className="mt-8 grid grid-cols-6 gap-2 overflow-x-auto pb-4">
              {galleryPhotos.map((photo, index) => (
                <div 
                  key={index}
                  onClick={() => setActivePhotoIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${index === activePhotoIndex ? 'ring-2 ring-primary-500' : 'opacity-50'}`}
                >
                  <picture>
                    <source
                      srcSet={getResponsiveImageUrl(photo.url, 100)}
                      type="image/webp"
                    />
                    <img 
                      src={photo.url} 
                      alt={photo.caption || photo.category}
                      className="w-full h-full object-cover"
                      width="100"
                      height="100"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BentoGallery;
