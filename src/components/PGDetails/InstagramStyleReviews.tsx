import React, { useState, useEffect } from 'react';
import { FiStar, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Review, getPGReviews, getUserReviewForPG, addReview, updateReview, deleteReview } from '../../firebase/reviewsService';

// Using the Review interface from reviewsService

interface PGData {
  id: string;
  name: string;
  [key: string]: any;
}

interface InstagramStyleReviewsProps {
  pg: PGData;
}

const StarRating: React.FC<{
  rating: number;
  setRating: (rating: number) => void;
  readOnly?: boolean;
}> = ({ rating, setRating, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const starEmojis = ['😶', '😕', '😐', '🙂', '😄', '🤩'];

  const handleStarClick = (index: number) => {
    if (readOnly) return;
    setRating(index);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((index) => (
          <motion.button
            key={index}
            whileHover={{ scale: readOnly ? 1 : 1.2 }}
            whileTap={{ scale: readOnly ? 1 : 0.9 }}
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => !readOnly && setHoverRating(index)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`mx-1 focus:outline-none transition-colors ${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            }`}
            disabled={readOnly}
          >
            <FiStar
              size={24}
              className={`transition-all ${
                index <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </motion.button>
        ))}
      </div>
      <motion.div
        animate={isAnimating ? { scale: [1, 1.5, 1] } : {}}
        className="text-2xl mt-1"
      >
        {starEmojis[rating] || '😶'}
      </motion.div>
    </div>
  );
};

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm border border-primary-200/20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 backdrop-filter backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-xl border border-white/20"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InstagramStyleReviews: React.FC<InstagramStyleReviewsProps> = ({ pg }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'edit' | 'delete'>('edit');

  useEffect(() => {
    fetchReviews();
  }, [pg.id, currentUser]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Get all reviews for this PG
      const fetchedReviews = await getPGReviews(pg.id);
      setReviews(fetchedReviews);
      
      // Check if current user has a review
      if (currentUser) {
        const userReviewDoc = await getUserReviewForPG(currentUser.uid, pg.id);
        if (userReviewDoc) {
          setUserReview(userReviewDoc);
          setNewComment(userReviewDoc.comment);
          setNewRating(userReviewDoc.rating);
        } else {
          setUserReview(null);
          setNewComment('');
          setNewRating(0);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUser) return;
    if (newRating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      if (userReview) {
        // User already has a review, show edit confirmation
        setModalAction('edit');
        setShowModal(true);
      } else {
        // Create new review
        await addReview({
          userId: currentUser.uid,
          pgId: pg.id,
          rating: newRating,
          comment: newComment,
          userName: currentUser.displayName || 'Anonymous',
          userPhotoURL: currentUser.photoURL || '',
        });
        
        setNewComment('');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleEditReview = async () => {
    if (!currentUser || !userReview) return;

    try {
      await updateReview(userReview.id, {
        rating: newRating,
        comment: newComment,
      });
      
      setIsEditing(false);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDeleteReview = async () => {
    if (!currentUser || !userReview) return;

    try {
      await deleteReview(userReview.id);
      
      setUserReview(null);
      setNewComment('');
      setNewRating(0);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const startEditingReview = () => {
    setIsEditing(true);
  };

  const cancelEditingReview = () => {
    setIsEditing(false);
    if (userReview) {
      setNewComment(userReview.comment);
      setNewRating(userReview.rating);
    }
  };

  const confirmDeleteReview = () => {
    setModalAction('delete');
    setShowModal(true);
  };

  const getRandomPlaceholder = () => {
    const placeholders = [
      "This PG is lit! 🔥 Share your thoughts...",
      "Rate your experience (be honest, we can take it)",
      "Tell us how this PG made you feel...",
      "Spill the tea about your stay ☕",
      "How was your experience? Don't hold back!",
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  return (
    <div className="mb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-md sm:text-2xl font-bold text-primary-800 relative mb-2 sm:mb-0">
          Reviews & Ratings
          <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary-500 rounded-full"></div>
        </h2>
        <div className="text-sm text-gray-500">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      <div className="bg-white rounded-[16px] sm:rounded-[24px] p-4 sm:p-6 shadow-sm">
        {/* Review Form */}
        {currentUser ? (
          <div className="mb-8 border-b border-gray-100 pb-6">
            <div className="flex flex-col items-center max-w-xl mx-auto">
              <div className="mb-4">
                <img
                  src={currentUser.photoURL || 'https://via.placeholder.com/40'}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-primary-100"
                />
              </div>
              <div className="w-full">
                <div className="mb-4 flex flex-col items-center">
                  <div className="mb-2">
                    <span className="font-medium text-sm sm:text-base">{currentUser.displayName || 'You'}</span>
                  </div>
                  <StarRating
                    rating={newRating}
                    setRating={setNewRating}
                    readOnly={userReview !== null && !isEditing}
                  />
                </div>
                {userReview && !isEditing ? (
                  <div className="text-center">
                    <p className="text-gray-700 mb-4 text-sm sm:text-base bg-gray-50 p-4 rounded-xl">{userReview.comment}</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={startEditingReview}
                        className="text-primary-500 text-xs sm:text-sm flex items-center gap-1 hover:text-primary-600 px-4 py-2 bg-primary-50 rounded-full"
                      >
                        <FiEdit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={confirmDeleteReview}
                        className="text-red-500 text-xs sm:text-sm flex items-center gap-1 hover:text-red-600 px-4 py-2 bg-red-50 rounded-full"
                      >
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={getRandomPlaceholder()}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-sm sm:text-base"
                      rows={4}
                    />
                    <div className="flex justify-center gap-3 mt-4">
                      {isEditing && (
                        <button
                          onClick={cancelEditingReview}
                          className="px-5 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleSubmitReview}
                        disabled={newRating === 0}
                        className={`px-5 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-full bg-primary-500 text-white transition-colors ${
                          newRating === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-primary-600'
                        }`}
                      >
                        {userReview ? 'Update Review' : 'Post Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {userReview && !isEditing && (
              <div className="mt-2 text-xs text-gray-400 italic">
                You've already shared your thoughts! But feel free to update if your opinion has evolved.
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 text-center py-6 bg-gray-50 rounded-xl">
            <p className="text-gray-600 mb-2">Sign in to leave a review</p>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm hover:bg-primary-600 transition-colors">
              Sign In
            </button>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                <div className="mb-3">
                  <img
                    src={review.userPhotoURL || 'https://via.placeholder.com/40'}
                    alt={review.userName}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-100"
                  />
                </div>
                <div className="w-full text-center">
                  <div className="flex flex-col items-center gap-1 mb-3">
                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                      {review.userName}
                    </span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FiStar
                          key={index}
                          size={16}
                          className={`${
                            index < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base bg-gray-50 p-3 rounded-lg mb-2">{review.comment}</p>
                  <div className="text-xs text-gray-400">
                    {review.updatedAt
                      ? `Updated ${review.updatedAt.toLocaleDateString()}`
                      : review.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-12 max-w-md mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <FiStar className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-sm sm:text-base">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={modalAction === 'edit' ? handleEditReview : handleDeleteReview}
        title={
          modalAction === 'edit'
            ? "Update your review?"
            : "Delete your review?"
        }
        message={
          modalAction === 'edit'
            ? "Had a change of heart? Your updated review will replace your previous one."
            : "Are you sure you want to delete your review? This action cannot be undone."
        }
      />
    </div>
  );
};

export default InstagramStyleReviews;
