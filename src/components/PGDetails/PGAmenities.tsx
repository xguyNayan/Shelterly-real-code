import React from 'react';
import { 
  FiWifi, FiTv, FiCoffee, FiHome, FiShield, 
  FiDroplet, FiWind, FiMonitor, FiPackage, FiTruck 
} from 'react-icons/fi';
import { PGData } from '../PGListing/types';

interface PGAmenitiesProps {
  pg: PGData;
}

const PGAmenities: React.FC<PGAmenitiesProps> = ({ pg }) => {
  // Define amenities with icons and descriptions
  const amenities = [
    {
      id: 'wifi',
      name: 'WiFi',
      icon: <FiWifi size={24} />,
      available: pg.wifi,
      description: 'High-speed internet access available throughout the property'
    },
    {
      id: 'tv',
      name: 'TV',
      icon: <FiTv size={24} />,
      available: pg.tv,
      description: 'Television with cable/streaming services in common areas'
    },
    {
      id: 'food',
      name: 'Food',
      icon: <FiCoffee size={24} />,
      available: pg.food,
      description: 'Nutritious meals provided according to meal schedule'
    },
    {
      id: 'fridge',
      name: 'Refrigerator',
      icon: <FiHome size={24} />,
      available: pg.fridge,
      description: 'Shared refrigerator for storing personal food items'
    },
    {
      id: 'security',
      name: 'Security',
      icon: <FiShield size={24} />,
      available: pg.security,
      description: '24/7 security with CCTV surveillance for your safety'
    },
    {
      id: 'washingMachine',
      name: 'Washing Machine',
      icon: <FiDroplet size={24} />,
      available: pg.washingMachine,
      description: 'Laundry facilities available for residents'
    },
    {
      id: 'ac',
      name: 'Air Conditioning',
      icon: <FiWind size={24} />,
      available: true, // Assuming AC is available
      description: 'Climate control for comfortable living in all seasons'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      icon: <FiHome size={24} />,
      available: pg.housekeeping,
      description: 'Regular cleaning services to maintain hygiene'
    },
    {
      id: 'parking',
      name: 'Parking',
      icon: <FiTruck size={24} />,
      available: pg.parking,
      description: 'Secure parking space for vehicles'
    },
    {
      id: 'studyArea',
      name: 'Study Area',
      icon: <FiMonitor size={24} />,
      available: true, // Assuming study area is available
      description: 'Dedicated space for studying with proper lighting'
    },
    {
      id: 'storage',
      name: 'Storage',
      icon: <FiPackage size={24} />,
      available: true, // Assuming storage is available
      description: 'Personal storage space for your belongings'
    }
  ];

  // Group amenities by availability
  const availableAmenities = amenities.filter(amenity => amenity.available);
  const unavailableAmenities = amenities.filter(amenity => !amenity.available);

  return (
    <div>
      {/* Amenities header with quirky design */}
      <div className="relative bg-gradient-to-r from-primary-50 to-blue-50 rounded-[30px] p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 opacity-30 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 opacity-30 rounded-tr-full"></div>
        
        <h2 className="text-2xl font-bold text-primary-800 mb-3 relative z-10">Amenities & Facilities</h2>
        <p className="text-gray-600 max-w-3xl relative z-10">
          {pg.name} offers a range of modern amenities to make your stay comfortable and convenient.
          From high-speed WiFi to regular housekeeping, we've got everything you need for a pleasant living experience.
        </p>
      </div>
      
      {/* Available Amenities */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-primary-800 mb-6">Available Amenities</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {availableAmenities.map(amenity => (
            <div 
              key={amenity.id}
              className="bg-white rounded-[16px] p-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-gray-100"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-primary-100 rounded-bl-full opacity-0 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3 p-2 bg-primary-50 text-primary-600 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-sm">{amenity.icon}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-800 text-sm mb-0.5">{amenity.name}</h4>
                  <p className="text-xs text-gray-600">{amenity.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Unavailable Amenities */}
      {unavailableAmenities.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-6">Not Available</h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
            {unavailableAmenities.map(amenity => (
              <div 
                key={amenity.id}
                className="bg-gray-50 rounded-[12px] p-2 flex items-center opacity-70 border border-gray-100"
              >
                <div className="flex-shrink-0 mr-2 text-gray-400 text-sm h-6 w-6 flex items-center justify-center rounded-full bg-gray-100">
                  {amenity.icon}
                </div>
                <span className="text-gray-500 text-xs font-medium">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Additional Services */}
      <div className="mt-16 bg-white rounded-[30px] p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-primary-800 mb-4">Additional Services</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-[20px] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200 opacity-20 rounded-bl-full"></div>
            <h4 className="font-semibold text-primary-800 mb-2">Maintenance Support</h4>
            <p className="text-sm text-gray-700">
              Our maintenance team is available to address any issues with your accommodation promptly.
              Submit a maintenance request through our app or contact the property manager.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-[20px] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 opacity-20 rounded-bl-full"></div>
            <h4 className="font-semibold text-blue-800 mb-2">Community Events</h4>
            <p className="text-sm text-gray-700">
              We regularly organize community events and activities for residents to socialize and network.
              Check the notice board or our app for upcoming events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGAmenities;
