import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, FiHeart, FiCalendar, FiSettings, FiUser, 
  FiMapPin, FiTrendingUp, FiSearch, FiClock, FiStar, 
  FiDollarSign, FiAlertCircle, FiEye 
} from 'react-icons/fi';
import Navbar from '../Navbar';
import Footer from '../Footer';
import WishlistSection from './WishlistSection';
import RecentSearchesSection from './RecentSearchesSection';
import BookingsSection from './BookingsSection';
import PriceTrackerSection from './PriceTrackerSection';
import ProfileSection from './ProfileSection';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock user data
  const userData = {
    name: "Nayan Srivastava",
    email: "nayan@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    joinDate: "January 2025",
    wishlistCount: 5,
    viewedCount: 12,
    bookingCount: 2,
  };

  // Tabs for navigation
  const tabs = [
    { id: 'home', label: 'Home', icon: <FiHome /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart /> },
    { id: 'bookings', label: 'Bookings', icon: <FiCalendar /> },
    { id: 'price-tracker', label: 'Price Tracker', icon: <FiTrendingUp /> },
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
  ];

  // Render the active tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'home':
        return <HomeDashboard userData={userData} isMobile={isMobile} />;
      case 'wishlist':
        return <WishlistSection />;
      case 'bookings':
        return <BookingsSection />;
      case 'price-tracker':
        return <PriceTrackerSection />;
      case 'profile':
        return <ProfileSection userData={userData} />;
      default:
        return <HomeDashboard userData={userData} isMobile={isMobile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <Navbar />
      
      {/* Top wave pattern */}
      <div className="absolute top-0 left-0 w-full z-0 overflow-hidden">
        <svg viewBox="0 0 1440 320" className="w-full" preserveAspectRatio="none">
          <path 
            fill="#e6f7f5" 
            fillOpacity="0.4" 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>
      
      <main className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* User welcome section */}
          <div className="w-full md:w-3/4 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500">
                <img 
                  src={userData.profileImage} 
                  alt={userData.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userData.name}!</h1>
                <p className="text-gray-500">What would you like to do today?</p>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-primary-50 rounded-2xl p-4 flex flex-col items-center">
                <div className="bg-primary-100 rounded-full p-2 mb-2">
                  <FiHeart className="text-primary-600 text-xl" />
                </div>
                <p className="text-2xl font-bold text-primary-600">{userData.wishlistCount}</p>
                <p className="text-xs text-gray-600">Wishlisted PGs</p>
              </div>
              
              <div className="bg-teal-50 rounded-2xl p-4 flex flex-col items-center">
                <div className="bg-teal-100 rounded-full p-2 mb-2">
                  <FiEye className="text-teal-600 text-xl" />
                </div>
                <p className="text-2xl font-bold text-teal-600">{userData.viewedCount}</p>
                <p className="text-xs text-gray-600">PGs Viewed</p>
              </div>
              
              <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center">
                <div className="bg-blue-100 rounded-full p-2 mb-2">
                  <FiCalendar className="text-blue-600 text-xl" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{userData.bookingCount}</p>
                <p className="text-xs text-gray-600">Active Bookings</p>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center">
                <div className="bg-purple-100 rounded-full p-2 mb-2">
                  <FiAlertCircle className="text-purple-600 text-xl" />
                </div>
                <p className="text-2xl font-bold text-purple-600">3</p>
                <p className="text-xs text-gray-600">Price Alerts</p>
              </div>
            </div>
          </div>
          
          {/* Navigation tabs - Vertical for desktop, horizontal for mobile */}
          <div className={`${isMobile ? 'w-full' : 'w-1/4'} bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-4`}>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 px-2">Dashboard</h2>
            <nav className={`${isMobile ? 'flex overflow-x-auto pb-2' : 'flex flex-col'} gap-2`}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isMobile ? 'flex-shrink-0' : ''}
                    ${activeTab === tab.id 
                      ? 'bg-primary-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'}
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Home Dashboard Component
const HomeDashboard: React.FC<{ userData: any, isMobile: boolean }> = ({ userData, isMobile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recent searches section */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Searches</h2>
          <Link to="/pg-listing" className="text-primary-500 text-sm hover:underline">View All</Link>
        </div>
        
        <div className="space-y-3">
          {['Koramangala', 'Indiranagar', 'HSR Layout'].map((location, index) => (
            <Link 
              key={index}
              to={`/pg-listing?location=${location}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="bg-primary-100 rounded-full p-2">
                <FiMapPin className="text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{location}</p>
                <p className="text-xs text-gray-500">Searched 2 days ago</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                  12 PGs
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Recommended PGs */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recommended For You</h2>
          <Link to="/pg-listing" className="text-primary-500 text-sm hover:underline">View All</Link>
        </div>
        
        <div className="space-y-4">
          {[
            { name: 'Urban Nest', location: 'Koramangala', price: 15000, rating: 4.5 },
            { name: 'Comfort Zone', location: 'Indiranagar', price: 12000, rating: 4.2 }
          ].map((pg, index) => (
            <Link 
              key={index}
              to={`/pg-details/demo-${index}`}
              className="block p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={`https://source.unsplash.com/random/200x200/?apartment&sig=${index}`} 
                    alt={pg.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{pg.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FiMapPin className="text-primary-500" size={10} />
                    {pg.location}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-primary-600 font-semibold">₹{pg.price.toLocaleString()}/mo</p>
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-500" size={12} />
                      <span className="text-xs text-gray-700">{pg.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Upcoming Viewings */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Viewings</h2>
          <button className="text-primary-500 text-sm hover:underline">Manage</button>
        </div>
        
        <div className="space-y-4">
          {[
            { name: 'Comfort Haven', location: 'HSR Layout', date: '25 Apr, 2:00 PM' }
          ].map((viewing, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl border border-primary-100 bg-primary-50"
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-800">{viewing.name}</h3>
                <div className="flex items-center gap-1">
                  <FiClock className="text-primary-500" size={14} />
                  <span className="text-xs text-gray-700">{viewing.date}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <FiMapPin className="text-primary-500" size={10} />
                {viewing.location}
              </p>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 text-xs bg-primary-500 text-white rounded-full">
                  Get Directions
                </button>
                <button className="px-3 py-1 text-xs border border-gray-300 rounded-full">
                  Reschedule
                </button>
              </div>
            </div>
          ))}
          
          <div className="text-center py-3">
            <p className="text-sm text-gray-500">No more upcoming viewings</p>
            <button className="mt-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-full">
              Schedule a Viewing
            </button>
          </div>
        </div>
      </div>
      
      {/* Price Alerts */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Price Alerts</h2>
          <button className="text-primary-500 text-sm hover:underline">Settings</button>
        </div>
        
        <div className="space-y-4">
          {[
            { name: 'Urban Nest', location: 'Koramangala', oldPrice: 16000, newPrice: 15000 },
            { name: 'Serene Stay', location: 'Indiranagar', oldPrice: 14000, newPrice: 13500 }
          ].map((alert, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl border border-green-100 bg-green-50"
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-800">{alert.name}</h3>
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <FiDollarSign className="text-green-600" size={14} />
                  <span className="text-xs">Price Drop</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <FiMapPin className="text-primary-500" size={10} />
                {alert.location}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs line-through text-gray-500">₹{alert.oldPrice.toLocaleString()}</span>
                <span className="text-sm font-semibold text-green-600">₹{alert.newPrice.toLocaleString()}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {Math.round((1 - alert.newPrice / alert.oldPrice) * 100)}% off
                </span>
              </div>
              <Link 
                to={`/pg-details/demo-${index}`}
                className="mt-2 inline-block px-3 py-1 text-xs bg-primary-500 text-white rounded-full"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
