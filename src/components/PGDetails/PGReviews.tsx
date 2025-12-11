import React, { useState } from 'react';
import { FiStar, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import { PGData } from '../PGListing/types';

interface PGReviewsProps {
  pg: PGData;
}

// Mock review data
const mockReviews = [
  {
    id: 1,
    user: 'Arjun Mehta',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    date: '2 months ago',
    content: 'Absolutely loved my stay here! The rooms are spacious and well-maintained. The staff is friendly and always ready to help. The location is perfect with easy access to public transport and nearby amenities.',
    helpful: 12,
    replies: 1
  },
  {
    id: 2,
    user: 'Priya Singh',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4,
    date: '3 months ago',
    content: 'Great PG with good facilities. The food is delicious and rooms are clean. WiFi could be a bit faster during peak hours, but overall a very comfortable place to stay.',
    helpful: 8,
    replies: 0
  },
  {
    id: 3,
    user: 'Rahul Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    rating: 5,
    date: '4 months ago',
    content: 'One of the best PGs I\'ve stayed at. The security is excellent and the management is very professional. The common areas are always clean and well-maintained.',
    helpful: 15,
    replies: 2
  },
  {
    id: 4,
    user: 'Neha Gupta',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    rating: 3,
    date: '5 months ago',
    content: 'Decent place to stay. The rooms are good but sometimes there are issues with hot water. The location is convenient with shops and restaurants nearby.',
    helpful: 5,
    replies: 1
  },
  {
    id: 5,
    user: 'Vikram Patel',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    rating: 4,
    date: '6 months ago',
    content: 'Very good PG with all the necessary amenities. The staff is helpful and the food is tasty. The rooms are spacious and well-ventilated.',
    helpful: 9,
    replies: 0
  }
];

const PGReviews: React.FC<PGReviewsProps> = ({ pg }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  
  // Calculate average rating
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  
  // Count ratings by star
  const ratingCounts = {
    5: mockReviews.filter(review => review.rating === 5).length,
    4: mockReviews.filter(review => review.rating === 4).length,
    3: mockReviews.filter(review => review.rating === 3).length,
    2: mockReviews.filter(review => review.rating === 2).length,
    1: mockReviews.filter(review => review.rating === 1).length,
  };
  
  // Filter reviews based on active filter
  const filteredReviews = activeFilter === 'all' 
    ? mockReviews 
    : mockReviews.filter(review => review.rating === parseInt(activeFilter));

  return (
    <div>
      {/* Reviews header with quirky design */}
      <div className="relative bg-gradient-to-r from-primary-50 to-blue-50 rounded-[30px] p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 opacity-30 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 opacity-30 rounded-tr-full"></div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-primary-800 mb-2">Guest Reviews</h2>
            <p className="text-gray-600">
              See what our residents have to say about their experience at {pg.name}.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="flex items-center mr-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar 
                  key={star}
                  className={`${star <= Math.round(averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div>
              <span className="font-bold text-primary-800">{averageRating.toFixed(1)}</span>
              <span className="text-gray-600 text-sm ml-1">({mockReviews.length} reviews)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[30px] p-6 shadow-sm sticky top-32">
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Rating Summary</h3>
            
            <div className="space-y-3 mb-6">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm font-medium text-gray-700 mr-2">{star} stars</span>
                    <FiStar className="text-yellow-500 fill-yellow-500" />
                  </div>
                  
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(ratingCounts[star as keyof typeof ratingCounts] / mockReviews.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  <span className="ml-3 text-sm text-gray-600 w-8 text-right">
                    {ratingCounts[star as keyof typeof ratingCounts]}
                  </span>
                </div>
              ))}
            </div>
            
            <h4 className="font-medium text-primary-800 mb-3">Filter Reviews</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  activeFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All Reviews
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button 
                  key={star}
                  onClick={() => setActiveFilter(star.toString())}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    activeFilter === star.toString() ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {star} Star
                </button>
              ))}
            </div>
            
            <div className="mt-8">
              <button className="w-full py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all font-medium">
                Write a Review
              </button>
            </div>
          </div>
        </div>
        
        {/* Reviews list */}
        <div className="lg:col-span-2">
          {filteredReviews.length > 0 ? (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-[30px] p-6 shadow-sm relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full opacity-30"></div>
                  
                  <div className="flex items-start mb-4 relative z-10">
                    <img 
                      src={review.avatar} 
                      alt={review.user} 
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="font-semibold text-primary-800">{review.user}</h4>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar 
                            key={star}
                            className={`${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} mr-1`}
                            size={16}
                          />
                        ))}
                      </div>
                      
                      <p className="text-gray-700 mb-4">{review.content}</p>
                      
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                          <FiThumbsUp className="mr-1" size={14} />
                          <span className="text-sm">Helpful ({review.helpful})</span>
                        </button>
                        
                        <button 
                          onClick={() => setShowReplyForm(showReplyForm === review.id ? null : review.id)}
                          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <FiMessageSquare className="mr-1" size={14} />
                          <span className="text-sm">Reply ({review.replies})</span>
                        </button>
                      </div>
                      
                      {showReplyForm === review.id && (
                        <div className="mt-4 bg-gray-50 rounded-2xl p-4">
                          <textarea 
                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Write your reply..."
                            rows={3}
                          ></textarea>
                          <div className="mt-2 flex justify-end">
                            <button 
                              onClick={() => setShowReplyForm(null)}
                              className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button className="px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all">
                              Post Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Sample reply for the first review */}
                  {review.id === 1 && (
                    <div className="ml-16 mt-4 bg-gray-50 rounded-2xl p-4 relative z-10">
                      <div className="flex items-start">
                        <img 
                          src="https://randomuser.me/api/portraits/men/41.jpg" 
                          alt="PG Owner" 
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-primary-800">PG Management</h5>
                            <span className="text-xs text-gray-500">1 month ago</span>
                          </div>
                          
                          <p className="text-sm text-gray-700">
                            Thank you for your kind words, Arjun! We're glad you enjoyed your stay with us. 
                            We strive to provide the best experience for all our residents. 
                            Looking forward to having you with us for a long time!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[30px] p-8 shadow-sm text-center">
              <h3 className="text-xl font-semibold text-primary-800 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-4">There are no reviews matching your selected filter.</p>
              <button 
                onClick={() => setActiveFilter('all')}
                className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all"
              >
                View All Reviews
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PGReviews;
