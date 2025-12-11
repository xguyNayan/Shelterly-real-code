import React, { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getOptimizedImageUrl, getResponsiveImageUrl, getLoadingAttribute, getFetchPriority } from '../../utils/imageOptimization';

interface Photo {
  url: string;
  category: string;
  caption?: string;
}

interface PGGalleryProps {
  photos: Photo[];
}

const PGGallery: React.FC<PGGalleryProps> = ({ photos }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  
  // If no photos provided, use placeholders
  const galleryPhotos = photos.length > 0 ? photos : [
    { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', category: 'Room' },
    { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc', category: 'Kitchen' },
    { url: 'https://images.unsplash.com/photo-1585128792020-803d29415281', category: 'Bathroom' },
    { url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115', category: 'Common Area' },
    { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', category: 'Exterior' },
  ];
  
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

  return (
    <>
      {/* Bento Grid Gallery */}
      <div className="mb-8 relative overflow-hidden rounded-[30px] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:h-[500px]">
          {/* Main large image */}
          <div 
            className="md:col-span-2 md:row-span-2 relative rounded-[20px] overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
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
                className="w-full h-full object-cover"
                width="600"
                height="600"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
              <span className="text-white text-sm font-medium">{galleryPhotos[0].category}</span>
            </div>
          </div>
          
          {/* Secondary images */}
          {galleryPhotos.slice(1, 5).map((photo, index) => (
            <div 
              key={index}
              className="hidden md:block relative rounded-[20px] overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openGalleryModal(index + 1)}
            >
              <picture>
                <source
                  srcSet={getOptimizedImageUrl(photo.url)}
                  type="image/webp"
                />
                <img 
                  src={photo.url} 
                  alt={photo.caption || photo.category}
                  className="w-full h-full object-cover"
                  width="300"
                  height="300"
                  loading={getLoadingAttribute(index)}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </picture>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-white text-xs font-medium">{photo.category}</span>
              </div>
            </div>
          ))}
          
          {/* Mobile gallery preview (shows only on mobile) */}
          <div className="md:hidden flex overflow-x-auto gap-2 py-2 px-1 -mx-1 after:content-[''] after:min-w-[1rem]">
            {galleryPhotos.slice(1).map((photo, index) => (
              <div 
                key={index}
                className="relative min-w-[180px] h-[120px] rounded-[20px] overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => openGalleryModal(index + 1)}
              >
                <picture>
                  <source
                    srcSet={getOptimizedImageUrl(photo.url)}
                    type="image/webp"
                  />
                  <img 
                    src={photo.url} 
                    alt={photo.caption || photo.category}
                    className="w-full h-full object-cover"
                    width="180"
                    height="120"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <span className="text-white text-xs font-medium">{photo.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* View all photos button */}
        <button 
          onClick={() => openGalleryModal(0)}
          className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium hover:shadow-lg transition-shadow"
        >
          View all photos
        </button>
      </div>
      
      {/* Full screen gallery modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button 
            onClick={closeGalleryModal}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full"
          >
            <FiX size={24} />
          </button>
          
          <button 
            onClick={prevPhoto}
            className="absolute left-4 z-10 p-2 bg-black/50 text-white rounded-full"
          >
            <FiChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextPhoto}
            className="absolute right-4 z-10 p-2 bg-black/50 text-white rounded-full"
          >
            <FiChevronRight size={24} />
          </button>
          
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <picture>
              <source
                srcSet={getOptimizedImageUrl(galleryPhotos[activePhotoIndex].url)}
                type="image/webp"
              />
              <img 
                src={galleryPhotos[activePhotoIndex].url} 
                alt={galleryPhotos[activePhotoIndex].caption || galleryPhotos[activePhotoIndex].category}
                className="max-w-full max-h-[80vh] object-contain"
                loading="lazy"
                decoding="async"
              />
            </picture>
            
            <div className="mt-4 text-white text-center">
              <p className="font-medium">{galleryPhotos[activePhotoIndex].category}</p>
              {galleryPhotos[activePhotoIndex].caption && (
                <p className="text-gray-300 text-sm mt-1">{galleryPhotos[activePhotoIndex].caption}</p>
              )}
              <p className="text-gray-400 text-sm mt-2">
                {activePhotoIndex + 1} of {galleryPhotos.length}
              </p>
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex justify-center gap-2 px-4 overflow-x-auto py-2">
              {galleryPhotos.map((photo, index) => (
                <div 
                  key={index}
                  onClick={() => setActivePhotoIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${
                    index === activePhotoIndex ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <picture>
                    <source
                      srcSet={getResponsiveImageUrl(photo.url, 64)}
                      type="image/webp"
                    />
                    <img 
                      src={photo.url} 
                      alt={photo.caption || photo.category}
                      className="w-full h-full object-cover"
                      width="64"
                      height="64"
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
    </>
  );
};

export default PGGallery;
