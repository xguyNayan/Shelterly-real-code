import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import QuirkyNewAuthModal from '../Auth/QuirkyNewAuthModal';
import { WishlistItem } from '../../firebase/wishlistService';

const WishlistPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { wishlistItems, isLoading, removeItem } = useWishlist();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser && !isLoading) {
      setShowAuthModal(true);
    }
  }, [currentUser, isLoading]);

  // Handle removing item from wishlist
  const handleRemoveItem = async (pgId: string) => {
    await removeItem(pgId);
  };

  // Handle clicking on a wishlist item
  const handleItemClick = (pgId: string) => {
    navigate(`/pg-details/${pgId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-4 text-primary-800 hover:text-primary-600 transition-all"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-800 flex items-center">
              My Wishlist
              <FaHeart className="ml-3 text-red-500" />
            </h1>
          </div>
        </div>
        
        {/* Wishlist Content */}
        <div className="bg-white rounded-[30px] p-6 shadow-sm mb-8">
          {wishlistItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="text-red-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-primary-800 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Start adding PGs to your wishlist to keep track of your favorite options.</p>
              <Link 
                to="/pg-listing" 
                className="px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all inline-block"
              >
                Browse PGs
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-gray-600 text-sm">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item: WishlistItem) => (
                  <div 
                    key={item.pgId} 
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
                  >
                    {/* PG Image */}
                    <div 
                      className="h-48 bg-gray-200 relative cursor-pointer"
                      onClick={() => handleItemClick(item.pgId)}
                    >
                      {item.pgData.photos && item.pgData.photos.length > 0 ? (
                        <img 
                          src={item.pgData.photos[0].url} 
                          alt={item.pgData.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-300">
                          No image available
                        </div>
                      )}
                      
                      {/* Remove button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.pgId);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                      
                      {/* Gender badge */}
                      <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                        item.pgData.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                        item.pgData.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.pgData.gender === 'male' ? 'Boys' :
                         item.pgData.gender === 'female' ? 'Girls' : 'Unisex'}
                      </div>
                    </div>
                    
                    {/* PG Info */}
                    <div className="p-4">
                      <h3 
                        className="font-semibold text-primary-800 mb-1 cursor-pointer hover:text-primary-600 transition-all"
                        onClick={() => handleItemClick(item.pgId)}
                      >
                        {item.pgData.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-1">{item.pgData.address}</p>
                      
                      {/* Pricing */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.pgData.singleRoomPrice && (
                          <div className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
                            Single: ₹{item.pgData.singleRoomPrice}/mo
                          </div>
                        )}
                        {item.pgData.doubleRoomPrice && (
                          <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                            Double: ₹{item.pgData.doubleRoomPrice}/mo
                          </div>
                        )}
                        {item.pgData.tripleRoomPrice && (
                          <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs">
                            Triple: ₹{item.pgData.tripleRoomPrice}/mo
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <Link 
                        to={`/pg-details/${item.pgId}`}
                        className="w-full mt-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-all flex items-center justify-center text-sm"
                      >
                        <FiExternalLink className="mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Auth Modal */}
      <QuirkyNewAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        redirectPath="/wishlist"
        triggerType="viewLimit"
      />
    </div>
  );
};

export default WishlistPage;
