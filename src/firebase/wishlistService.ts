import { collection, doc, Timestamp, updateDoc, getDoc, setDoc, arrayUnion, arrayRemove, DocumentReference } from 'firebase/firestore';
import { db } from './config';

// Extended PGData interface that includes the fields we need for the wishlist
interface PGData {
  id?: string;
  name: string;
  address: string;
  gender: 'male' | 'female' | 'unisex';
  photos?: { url: string; category: string }[];
  singleRoomPrice?: number | null;
  doubleRoomPrice?: number | null;
  tripleRoomPrice?: number | null;
  rating?: number | null;
  reviews?: number;
  isVerified?: boolean;
  discount?: number;
}

export interface WishlistItem {
  pgId: string;
  pgData: Partial<PGData>;
  addedAt: Timestamp;
}

// No longer using a separate collection for wishlists

// Add a PG to user's wishlist
export const addToWishlist = async (userId: string, pg: PGData): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Extract only the necessary PG data to store in wishlist
    const pgDataToStore = {
      id: pg.id,
      name: pg.name,
      address: pg.address,
      gender: pg.gender,
      photos: pg.photos ? pg.photos.slice(0, 1) : [], // Store only the first photo
      singleRoomPrice: pg.singleRoomPrice || null,
      doubleRoomPrice: pg.doubleRoomPrice || null,
      tripleRoomPrice: pg.tripleRoomPrice || null,
      rating: pg.rating || null,
      reviews: pg.reviews || 0,
      isVerified: pg.isVerified || false,
      discount: pg.discount || 0
    };

    const wishlistItem: WishlistItem = {
      pgId: pg.id || '',
      pgData: pgDataToStore,
      addedAt: Timestamp.now()
    };

    // Get the user document
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user document to add the wishlist item
      await updateDoc(userRef, {
        wishlistItems: arrayUnion(wishlistItem)
      });
    } else {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        wishlistItems: [wishlistItem],
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Remove a PG from user's wishlist
export const removeFromWishlist = async (userId: string, pgId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const wishlistItems = userData.wishlistItems || [];
      
      // Find the item to remove
      const itemToRemove = wishlistItems.find((item: WishlistItem) => item.pgId === pgId);
      
      if (itemToRemove) {
        // Remove the item from the wishlist array
        // Since we can't use arrayRemove with complex objects reliably,
        // we'll filter the array and update the whole field
        const updatedWishlist = wishlistItems.filter((item: WishlistItem) => item.pgId !== pgId);
        
        await updateDoc(userRef, {
          wishlistItems: updatedWishlist
        });
      }
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// Check if a PG is in user's wishlist
export const isInWishlist = async (userId: string, pgId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const wishlistItems = userData.wishlistItems || [];
      
      // Check if the PG is in the wishlist array
      return wishlistItems.some((item: WishlistItem) => item.pgId === pgId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

// Get all items in user's wishlist
export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Return the wishlist items array or an empty array if it doesn't exist
      return userData.wishlistItems || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
};
