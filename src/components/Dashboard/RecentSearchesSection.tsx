import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiSearch, FiFilter } from 'react-icons/fi';

// Mock recent searches data
const mockRecentSearches = [
  {
    id: 'search-1',
    location: 'Koramangala',
    timestamp: '2 days ago',
    filters: { gender: 'male', minPrice: 10000, maxPrice: 18000 },
    resultsCount: 12
  },
  {
    id: 'search-2',
    location: 'Indiranagar',
    timestamp: '3 days ago',
    filters: { gender: 'female', minPrice: 12000, maxPrice: 20000 },
    resultsCount: 8
  },
  {
    id: 'search-3',
    location: 'HSR Layout',
    timestamp: '1 week ago',
    filters: { gender: 'unisex', minPrice: 8000, maxPrice: 15000 },
    resultsCount: 15
  },
  {
    id: 'search-4',
    location: 'Whitefield',
    timestamp: '2 weeks ago',
    filters: { gender: 'male', minPrice: 9000, maxPrice: 16000 },
    resultsCount: 10
  },
  {
    id: 'search-5',
    location: 'Electronic City',
    timestamp: '3 weeks ago',
    filters: { gender: 'unisex', minPrice: 7000, maxPrice: 14000 },
    resultsCount: 9
  }
];

const RecentSearchesSection: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Searches</h2>
        <button className="text-primary-500 text-sm hover:underline">Clear All</button>
      </div>
      
      {mockRecentSearches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiSearch className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No recent searches</h3>
          <p className="text-gray-500 mb-6">Start exploring PGs to see your search history</p>
          <Link 
            to="/pg-listing" 
            className="px-6 py-3 bg-primary-500 text-white rounded-full inline-block"
          >
            Explore PGs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockRecentSearches.map(search => (
            <div 
              key={search.id}
              className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 rounded-full p-2 mt-1">
                    <FiMapPin className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{search.location}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <FiClock size={12} />
                      <span>{search.timestamp}</span>
                    </div>
                    
                    {/* Applied filters */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                        <span className="font-medium">Gender:</span>
                        <span className="capitalize">{search.filters.gender}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                        <span className="font-medium">Price:</span>
                        <span>₹{search.filters.minPrice.toLocaleString()} - ₹{search.filters.maxPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                  {search.resultsCount} PGs
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-3">
                <Link 
                  to={`/pg-listing?location=${search.location}`}
                  className="px-3 py-1.5 text-xs bg-primary-500 text-white rounded-full flex items-center gap-1"
                >
                  <FiSearch size={12} />
                  Search Again
                </Link>
                <Link 
                  to={`/pg-listing?location=${search.location}&gender=${search.filters.gender}&minPrice=${search.filters.minPrice}&maxPrice=${search.filters.maxPrice}`}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-full flex items-center gap-1"
                >
                  <FiFilter size={12} />
                  With Filters
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSearchesSection;
