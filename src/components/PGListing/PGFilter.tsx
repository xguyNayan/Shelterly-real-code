import React, { useState, useCallback } from 'react';
import { FiWifi, FiCoffee, FiTv, FiHome, FiDroplet, FiTruck } from 'react-icons/fi';
import { Range, getTrackBackground } from 'react-range';

interface FilterProps {
  onFilter: (filters: any) => void;
  onReset: () => void;
}

const PGFilter: React.FC<FilterProps> = ({ onFilter, onReset }) => {
  const [filters, setFilters] = useState({
    gender: 'all',
    location: 'all',
    minPrice: 5000,
    maxPrice: 25000,
    amenities: [] as string[],
    roomType: 'all',
  });

  const locations = [
    'Shantinagar',
    'Koramangala',
    'Indiranagar',
    'BTM Layout',
    'HSR Layout',
    'Electronic City',
    'Whitefield',
    'Marathahalli',
    'Bannerghatta Road',
    'Bellandur',
    'Sarjapur Road',
  ];

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      
      return { ...prev, amenities };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const applyFilters = () => {
    onFilter(filters);
  };

  const resetFilters = () => {
    setFilters({
      gender: 'all',
      location: 'all',
      minPrice: 6999,
      maxPrice: 25000,
      amenities: [],
      roomType: 'all',
    });
    onReset();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
        <button 
          onClick={resetFilters}
          className="text-primary-500 hover:text-primary-600 font-medium text-sm"
        >
          Reset All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gender Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Gender</h3>
          <div className="flex space-x-2">
            {['all', 'male', 'female', 'unisex'].map(gender => (
              <button
                key={gender}
                className={`px-4 py-2 rounded-full text-sm ${
                  filters.gender === gender 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilters(prev => ({ ...prev, gender }))}
              >
                {gender === 'all' ? 'All' : 
                 gender === 'male' ? 'Male' : 
                 gender === 'female' ? 'Female' : 'Unisex'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Room Type Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Room Type</h3>
          <div className="flex flex-wrap gap-2">
            {['all', 'oneSharing', 'twoSharing', 'threeSharing', 'fourSharing'].map(type => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full text-sm ${
                  filters.roomType === type 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilters(prev => ({ ...prev, roomType: type }))}
              >
                {type === 'all' ? 'All' : 
                 type === 'oneSharing' ? 'Single' : 
                 type === 'twoSharing' ? 'Double' : 
                 type === 'threeSharing' ? 'Triple' : 'Four Sharing'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Location Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
          <select
            name="location"
            value={filters.location}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        
        {/* Price Range Filter */}
        <div className="md:col-span-2 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Price Range: ₹{filters.minPrice.toLocaleString()} - ₹{filters.maxPrice.toLocaleString()}
          </h3>
          <div className="py-4 px-2 max-w-md ml-0 mr-auto">
            <Range
              step={500}
              min={5000}
              max={25000}
              values={[filters.minPrice, filters.maxPrice]}
              onChange={(values) => {
                setFilters(prev => ({
                  ...prev,
                  minPrice: values[0],
                  maxPrice: values[1]
                }));
              }}
              renderTrack={({ props, children }) => (
                <div
                  className="w-full h-2 rounded-full"
                  style={{
                    ...props.style,
                  }}
                >
                  <div
                    ref={props.ref}
                    className="w-full h-2 rounded-full"
                    style={{
                      background: getTrackBackground({
                        values: [filters.minPrice, filters.maxPrice],
                        colors: ['#ffffff', '#3b82f6', '#e5e7eb'],
                        min: 5000,
                        max: 25000
                      })
                    }}
                  >
                    {children}
                  </div>
                </div>
              )}
              renderThumb={({ props, isDragged, index }) => (
                <div
                  {...props}
                  className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center focus:outline-none"
                  style={{
                    ...props.style,
                    border: isDragged ? '2px solid primary-500' : '1px solid #d1d5db',
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isDragged ? 'bg-primary-500' : 'bg-gray-300'}`}
                  />
                  <div
                    className="absolute bottom-full mb-2 bg-primary-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: isDragged ? 1 : 0,
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                  >
                    ₹{index === 0 ? filters.minPrice.toLocaleString() : filters.maxPrice.toLocaleString()}
                  </div>
                </div>
              )}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-3">
              <span>₹5,000</span>
              <span>₹25,000</span>
            </div>
          </div>
        </div>
        
        {/* Amenities Filter */}
        <div className="md:col-span-2 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <button
              className={`flex items-center justify-center p-3 rounded-lg border ${
                filters.amenities.includes('wifi') 
                  ? 'border-primary-500 bg-primary-50 text-primary-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAmenityToggle('wifi')}
            >
              <div className="flex flex-col items-center">
                <FiWifi className="text-xl mb-1" />
                <span className="text-xs">WiFi</span>
              </div>
            </button>
            
            <button
              className={`flex items-center justify-center p-3 rounded-lg border ${
                filters.amenities.includes('food') 
                  ? 'border-primary-500 bg-primary-50 text-primary-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAmenityToggle('food')}
            >
              <div className="flex flex-col items-center">
                <FiCoffee className="text-xl mb-1" />
                <span className="text-xs">Food</span>
              </div>
            </button>
            
            <button
              className={`flex items-center justify-center p-3 rounded-lg border ${
                filters.amenities.includes('tv') 
                  ? 'border-primary-500 bg-primary-50 text-primary-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAmenityToggle('tv')}
            >
              <div className="flex flex-col items-center">
                <FiTv className="text-xl mb-1" />
                <span className="text-xs">TV</span>
              </div>
            </button>
            
            <button
              className={`flex items-center justify-center p-3 rounded-lg border ${
                filters.amenities.includes('attachedWashroom') 
                  ? 'border-primary-500 bg-primary-50 text-primary-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAmenityToggle('attachedWashroom')}
            >
              <div className="flex flex-col items-center">
                <FiDroplet className="text-xl mb-1" />
                <span className="text-xs">Attached Bathroom</span>
              </div>
            </button>
            
            <button
              className={`flex items-center justify-center p-3 rounded-lg border ${
                filters.amenities.includes('washingMachine') 
                  ? 'border-primary-500 bg-primary-50 text-primary-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAmenityToggle('washingMachine')}
            >
              <div className="flex flex-col items-center">
                <FiHome className="text-xl mb-1" />
                <span className="text-xs">Washing Machine</span>
              </div>
            </button>
            
            <button
              className={`flex items-center justify-center p-3 rounded-lg border ${
                filters.amenities.includes('parking') 
                  ? 'border-primary-500 bg-primary-50 text-primary-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAmenityToggle('parking')}
            >
              <div className="flex flex-col items-center">
                <FiTruck className="text-xl mb-1" />
                <span className="text-xs">Parking</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={resetFilters}
          className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={applyFilters}
          className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default PGFilter;
