import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiStar, FiTrash2, FiShare2, FiEye } from 'react-icons/fi';

// Mock wishlist data
const mockWishlistItems = [
  {
    id: 'pg-1',
    name: 'Urban Nest',
    location: 'Koramangala',
    price: 15000,
    rating: 4.5,
    gender: 'male',
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=1',
    amenities: ['WiFi', 'AC', 'Food', 'Washing Machine']
  },
  {
    id: 'pg-2',
    name: 'Comfort Zone',
    location: 'Indiranagar',
    price: 12000,
    rating: 4.2,
    gender: 'female',
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=2',
    amenities: ['WiFi', 'AC', 'Attached Bathroom']
  },
  {
    id: 'pg-3',
    name: 'Serene Stay',
    location: 'HSR Layout',
    price: 14000,
    rating: 4.3,
    gender: 'unisex',
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=3',
    amenities: ['WiFi', 'Food', 'TV', 'Parking']
  },
  {
    id: 'pg-4',
    name: 'Cozy Corner',
    location: 'Whitefield',
    price: 13000,
    rating: 4.1,
    gender: 'male',
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=4',
    amenities: ['WiFi', 'AC', 'Food', 'Gym']
  },
  {
    id: 'pg-5',
    name: 'Modern Living',
    location: 'Electronic City',
    price: 11000,
    rating: 4.0,
    gender: 'unisex',
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=5',
    amenities: ['WiFi', 'TV', 'Washing Machine']
  }
];

const WishlistSection: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Remove item from wishlist
  const removeFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };
  
  // Toggle item selection for comparison
  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      if (selectedItems.length < 3) {
        setSelectedItems([...selectedItems, id]);
      } else {
        // Could show a toast notification here
         ('You can only compare up to 3 PGs at once');
      }
    }
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedItems([]);
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
        
        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              className={`px-3 py-1 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Compare button - only show when items are selected */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm"
                onClick={() =>  (selectedItems)}
              >
                Compare ({selectedItems.length})
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={clearSelections}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiHeart className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Start exploring PGs and add them to your wishlist</p>
          <Link 
            to="/pg-listing" 
            className="px-6 py-3 bg-primary-500 text-white rounded-full inline-block"
          >
            Explore PGs
          </Link>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-transform hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                      <button 
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-primary-500"
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(item.id)}
                          readOnly
                          className="h-4 w-4 accent-primary-500"
                        />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${item.gender === 'male' ? 'bg-blue-100 text-blue-700' : 
                          item.gender === 'female' ? 'bg-pink-100 text-pink-700' : 
                          'bg-purple-100 text-purple-700'}
                      `}>
                        {item.gender === 'male' ? 'Male' : 
                         item.gender === 'female' ? 'Female' : 'Unisex'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                        <FiStar className="text-yellow-500" size={12} />
                        <span className="text-xs font-medium text-gray-700">{item.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <FiMapPin size={10} className="text-primary-500" />
                      {item.location}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {amenity}
                        </span>
                      ))}
                      {item.amenities.length > 3 && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          +{item.amenities.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <p className="font-semibold text-primary-600">₹{item.price.toLocaleString()}/mo</p>
                      <Link 
                        to={`/pg-details/${item.id}`}
                        className="px-3 py-1 bg-primary-500 text-white text-xs rounded-full"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {wishlistItems.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-48 relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${item.gender === 'male' ? 'bg-blue-100 text-blue-700' : 
                            item.gender === 'female' ? 'bg-pink-100 text-pink-700' : 
                            'bg-purple-100 text-purple-700'}
                        `}>
                          {item.gender === 'male' ? 'Male' : 
                           item.gender === 'female' ? 'Female' : 'Unisex'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <FiMapPin size={10} className="text-primary-500" />
                            {item.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                          <FiStar className="text-yellow-500" size={12} />
                          <span className="text-xs font-medium text-gray-700">{item.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.amenities.map((amenity, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <p className="font-semibold text-primary-600">₹{item.price.toLocaleString()}/mo</p>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 text-gray-500 hover:text-red-500"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                          <button 
                            className="p-2 text-gray-500 hover:text-primary-500"
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedItems.includes(item.id)}
                              readOnly
                              className="h-4 w-4 accent-primary-500"
                            />
                          </button>
                          <Link 
                            to={`/pg-details/${item.id}`}
                            className="px-3 py-1 bg-primary-500 text-white text-xs rounded-full flex items-center gap-1"
                          >
                            <FiEye size={12} />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WishlistSection;
