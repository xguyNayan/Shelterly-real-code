import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

export interface Review {
  id: string;
  userId: string;
  pgId: string;
  rating: number;
  comment: string;
  userName: string;
  userPhotoURL: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Get all reviews for a specific PG
export const getPGReviews = async (pgId: string): Promise<Review[]> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('pgId', '==', pgId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        userId: data.userId,
        pgId: data.pgId,
        rating: data.rating,
        comment: data.comment,
        userName: data.userName,
        userPhotoURL: data.userPhotoURL,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined,
      });
    });
    
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Get a user's review for a specific PG
export const getUserReviewForPG = async (userId: string, pgId: string): Promise<Review | null> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      where('pgId', '==', pgId)
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId,
      pgId: data.pgId,
      rating: data.rating,
      comment: data.comment,
      userName: data.userName,
      userPhotoURL: data.userPhotoURL,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined,
    };
  } catch (error) {
    console.error('Error fetching user review:', error);
    throw error;
  }
};

// Add a new review
export const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId: string, updates: { rating?: number; comment?: string }): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Calculate average rating for a PG
export const calculateAverageRating = async (pgId: string): Promise<number> => {
  try {
    const reviews = await getPGReviews(pgId);
    
    if (reviews.length === 0) {
      return 0;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
};
