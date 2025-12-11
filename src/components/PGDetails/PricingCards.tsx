import React, { useState } from 'react';
import { FiCheck, FiInfo, FiX, FiHome } from 'react-icons/fi';
import { PGData } from '../PGListing/types';

interface PricingCardsProps {
  pg: PGData;
}

const PricingCards: React.FC<PricingCardsProps> = ({ pg }) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Define available room types based on PG data
  const availableRoomTypes = [];
  
  // Check for single room
  if (pg.oneSharing?.available) {
    availableRoomTypes.push({
      id: 'single',
      name: 'Single Room',
      price: pg.oneSharing.price || 0,
      description: 'Perfect for those who value privacy and personal space',
      features: [
        'Single bed with comfortable mattress',
        'Personal study desk and chair',
        'Wardrobe for storage',
        pg.wifi ? 'WiFi connectivity' : '',
        'Comfortable living space'
      ].filter(feature => feature !== ''),
      recommended: false,
      // Use the first bedroom photo if available, otherwise use any available photo
      image: pg.photos?.find(photo => photo.category === 'bedroom-single')?.url || 
             pg.photos?.find(photo => photo.category === 'bedroom')?.url || 
             (pg.photos && pg.photos.length > 0 ? pg.photos[0].url : 'https://via.placeholder.com/500x300?text=Single+Room')
    });
  }
  
  // Check for double sharing
  if (pg.twoSharing?.available) {
    availableRoomTypes.push({
      id: 'double',
      name: 'Double Sharing',
      price: pg.twoSharing.price || 0,
      description: 'Balanced option with company and affordability',
      features: [
        'Two single beds with comfortable mattresses',
        'Shared study area with desks',
        'Individual wardrobes',
        pg.wifi ? 'WiFi connectivity' : '',
        'Comfortable living space'
      ].filter(feature => feature !== ''),
      recommended: true,
      // Use the second bedroom photo if available, otherwise use any available photo
      image: pg.photos?.find(photo => photo.category === 'bedroom-double')?.url || 
             pg.photos?.filter(photo => photo.category === 'bedroom')?.[1]?.url || 
             pg.photos?.find(photo => photo.category === 'bedroom')?.url || 
             (pg.photos && pg.photos.length > 0 ? pg.photos[0].url : 'https://via.placeholder.com/500x300?text=Double+Room')
    });
  }
  
  // Check for triple sharing
  if (pg.threeSharing?.available) {
    availableRoomTypes.push({
      id: 'triple',
      name: 'Triple Sharing',
      price: pg.threeSharing.price || 0,
      description: 'Most economical option with a social atmosphere',
      features: [
        'Three single beds with comfortable mattresses',
        'Shared study area',
        'Individual storage spaces',
        pg.wifi ? 'WiFi connectivity' : '',
        'Comfortable living space'
      ].filter(feature => feature !== ''),
      recommended: false,
      // Use the third bedroom photo if available, otherwise use any available photo
      image: pg.photos?.find(photo => photo.category === 'bedroom-triple')?.url || 
             pg.photos?.filter(photo => photo.category === 'bedroom')?.[2]?.url || 
             pg.photos?.find(photo => photo.category === 'bedroom')?.url || 
             (pg.photos && pg.photos.length > 0 ? pg.photos[0].url : 'https://via.placeholder.com/500x300?text=Triple+Room')
    });
  }
  
  // Check for four sharing
  if (pg.fourSharing?.available) {
    availableRoomTypes.push({
      id: 'four',
      name: 'Four Sharing',
      price: pg.fourSharing.price || 0,
      description: 'Economical option with a vibrant social atmosphere',
      features: [
        'Four single beds with comfortable mattresses',
        'Shared study area',
        'Individual storage spaces',
        pg.wifi ? 'WiFi connectivity' : '',
        'Comfortable living space'
      ].filter(feature => feature !== ''),
      recommended: false,
      // Use any bedroom photo if available, otherwise use any available photo
      image: pg.photos?.find(photo => photo.category === 'bedroom-four')?.url || 
             pg.photos?.find(photo => photo.category === 'bedroom')?.url || 
             (pg.photos && pg.photos.length > 0 ? pg.photos[0].url : 'https://via.placeholder.com/500x300?text=Four+Sharing')
    });
  }
  
  // Check for five sharing
  if (pg.fiveSharing?.available) {
    availableRoomTypes.push({
      id: 'five',
      name: 'Five Sharing',
      price: pg.fiveSharing.price || 0,
      description: 'Most economical option with a lively social atmosphere',
      features: [
        'Five single beds with comfortable mattresses',
        'Shared study area',
        'Individual storage spaces',
        pg.wifi ? 'WiFi connectivity' : '',
        'Comfortable living space'
      ].filter(feature => feature !== ''),
      recommended: false,
      // Use any bedroom photo if available, otherwise use any available photo
      image: pg.photos?.find(photo => photo.category === 'bedroom-five')?.url || 
             pg.photos?.find(photo => photo.category === 'bedroom')?.url || 
             (pg.photos && pg.photos.length > 0 ? pg.photos[0].url : 'https://via.placeholder.com/500x300?text=Five+Sharing')
    });
  }
  
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary-800 relative mb-10 mt-10">
          Pricing & Plans
          <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-500 rounded-full"></div>
        </h2>
      </div>
      
      
      
      {/* Room type pricing cards */}
      {availableRoomTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {availableRoomTypes.map((room) => (
          <div 
            key={room.id}
            className={`relative bg-white rounded-[24px] overflow-hidden transition-all hover:shadow-lg ${
              room.recommended ? 'border-2 border-primary-500 shadow-md' : 'border border-gray-100'
            }`}
          >
            {room.recommended && (
              <div className="absolute top-0 right-0 bg-primary-500 text-white py-1 px-4 rounded-bl-lg text-sm font-medium z-10">
                Popular Choice
              </div>
            )}
            
            <div className="h-48 overflow-hidden">
              <img 
                src={room.image} 
                alt={room.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = `https://via.placeholder.com/500x300?text=${encodeURIComponent(room.name)}`;
                }}
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-primary-800 mb-1">{room.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{room.description}</p>
              
              <div className="flex items-end mb-6">
                <span className="text-3xl font-bold text-primary-700">₹{room.price ? room.price.toLocaleString() : 'Not specified'}</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              
              <div className="space-y-2 mb-6">
                {room.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="w-full py-2 text-center">
                <span className={`text-sm font-medium ${room.recommended ? 'text-primary-600' : 'text-gray-500'}`}>
                  {room.recommended ? 'Popular Choice' : 'Available Now'}
                </span>
              </div>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[24px] p-8 text-center mb-12">
          <FiHome className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Room Information Not Available</h3>
          <p className="text-gray-500">No room types have been specified for this PG.</p>
        </div>
      )}
      
    </div>
  );
};

export default PricingCards;
