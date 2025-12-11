import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiMapPin, FiTrendingDown, FiTrendingUp, FiBell, FiBellOff, FiInfo } from 'react-icons/fi';

// Mock price tracker data
const mockTrackedPGs = [
  {
    id: 'pg-1',
    name: 'Urban Nest',
    location: 'Koramangala',
    currentPrice: 15000,
    priceHistory: [16000, 15500, 15000],
    priceChange: -1000,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=1',
    alertEnabled: true,
    alertThreshold: 14500
  },
  {
    id: 'pg-2',
    name: 'Comfort Zone',
    location: 'Indiranagar',
    currentPrice: 12000,
    priceHistory: [11000, 11500, 12000],
    priceChange: 1000,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=2',
    alertEnabled: false,
    alertThreshold: null
  },
  {
    id: 'pg-3',
    name: 'Serene Stay',
    location: 'HSR Layout',
    currentPrice: 14000,
    priceHistory: [14000, 14000, 14000],
    priceChange: 0,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=3',
    alertEnabled: true,
    alertThreshold: 13500
  },
  {
    id: 'pg-4',
    name: 'Cozy Corner',
    location: 'Whitefield',
    currentPrice: 13000,
    priceHistory: [13500, 13200, 13000],
    priceChange: -500,
    image: 'https://source.unsplash.com/random/300x200/?apartment&sig=4',
    alertEnabled: true,
    alertThreshold: 12500
  }
];

const PriceTrackerSection: React.FC = () => {
  const [trackedPGs, setTrackedPGs] = useState(mockTrackedPGs);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Filter PGs based on price trend
  const filteredPGs = activeFilter === 'all' 
    ? trackedPGs 
    : activeFilter === 'increased' 
      ? trackedPGs.filter(pg => pg.priceChange > 0)
      : activeFilter === 'decreased' 
        ? trackedPGs.filter(pg => pg.priceChange < 0)
        : trackedPGs.filter(pg => pg.priceChange === 0);
  
  // Toggle price alert for a PG
  const toggleAlert = (id: string) => {
    setTrackedPGs(trackedPGs.map(pg => 
      pg.id === id 
        ? { ...pg, alertEnabled: !pg.alertEnabled, alertThreshold: !pg.alertEnabled ? pg.currentPrice - 500 : null } 
        : pg
    ));
  };
  
  // Remove PG from tracking
  const removeFromTracking = (id: string) => {
    setTrackedPGs(trackedPGs.filter(pg => pg.id !== id));
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Price Tracker</h2>
        
        {/* Filter tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['all', 'increased', 'decreased', 'stable'].map(filter => (
            <button 
              key={filter}
              className={`px-3 py-1 rounded-md text-sm capitalize ${
                activeFilter === filter ? 'bg-white shadow-sm' : ''
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {filteredPGs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiDollarSign className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No tracked PGs found</h3>
          <p className="text-gray-500 mb-6">
            {activeFilter === 'all' 
              ? "You're not tracking any PG prices yet" 
              : `No PGs with ${activeFilter} prices`}
          </p>
          <Link 
            to="/pg-listing" 
            className="px-6 py-3 bg-primary-500 text-white rounded-full inline-block"
          >
            Explore PGs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPGs.map(pg => (
            <div 
              key={pg.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-48 relative">
                  <img 
                    src={pg.image} 
                    alt={pg.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {pg.priceChange !== 0 && (
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
                        ${pg.priceChange < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      `}>
                        {pg.priceChange < 0 ? (
                          <>
                            <FiTrendingDown size={12} />
                            ₹{Math.abs(pg.priceChange).toLocaleString()}
                          </>
                        ) : (
                          <>
                            <FiTrendingUp size={12} />
                            ₹{pg.priceChange.toLocaleString()}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{pg.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FiMapPin size={10} className="text-primary-500" />
                        {pg.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">₹{pg.currentPrice.toLocaleString()}/mo</p>
                      {pg.priceChange !== 0 && (
                        <p className={`text-xs mt-1 ${pg.priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pg.priceChange < 0 ? 'Decreased' : 'Increased'} {Math.abs(pg.priceChange) / pg.currentPrice * 100}%
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Price history visualization */}
                  <div className="mt-4 h-12 bg-gray-50 rounded-lg p-2 flex items-end">
                    {pg.priceHistory.map((price, index) => {
                      const maxPrice = Math.max(...pg.priceHistory);
                      const height = (price / maxPrice) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className={`w-6 rounded-t-sm ${
                              price > pg.priceHistory[index - 1] || index === 0 
                                ? 'bg-red-400' 
                                : price < pg.priceHistory[index - 1] 
                                  ? 'bg-green-400' 
                                  : 'bg-gray-400'
                            }`}
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs mt-1">
                            {index === 0 ? '3m ago' : index === 1 ? '2m ago' : '1m ago'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Alert settings */}
                  <div className="flex items-center justify-between mt-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {pg.alertEnabled ? (
                        <FiBell className="text-primary-500" />
                      ) : (
                        <FiBellOff className="text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium">Price Alert</p>
                        {pg.alertEnabled && pg.alertThreshold && (
                          <p className="text-xs text-gray-500">
                            Alert when price drops below ₹{pg.alertThreshold.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className={`px-3 py-1 text-xs rounded-full ${
                          pg.alertEnabled 
                            ? 'bg-primary-500 text-white' 
                            : 'border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => toggleAlert(pg.id)}
                      >
                        {pg.alertEnabled ? 'Disable' : 'Enable'} Alert
                      </button>
                      <button 
                        className="px-3 py-1 text-xs border border-gray-300 rounded-full"
                        onClick={() => removeFromTracking(pg.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Link 
                      to={`/pg-details/${pg.id}`}
                      className="px-3 py-1.5 text-xs bg-primary-500 text-white rounded-full"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Info section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2 mt-1">
            <FiInfo className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">How Price Tracking Works</h3>
            <p className="text-sm text-gray-600 mt-1">
              We monitor PG prices daily and notify you when prices change. Set alerts to be notified when prices drop below your threshold.
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Track prices for PGs you're interested in</li>
              <li>Set custom price alerts for each PG</li>
              <li>Get notified when prices drop</li>
              <li>View price history to make informed decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTrackerSection;
