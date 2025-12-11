import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getUserWishlist, 
  WishlistItem 
} from '../firebase/wishlistService';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addItem: (pg: any) => Promise<void>;
  removeItem: (pgId: string) => Promise<void>;
  isItemInWishlist: (pgId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch wishlist items when user changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          const items = await getUserWishlist(currentUser.uid);
          setWishlistItems(items);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear wishlist when user logs out
        setWishlistItems([]);
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser]);

  // Add item to wishlist
  const addItem = async (pg: any) => {
    if (!currentUser) return;
    
    try {
      await addToWishlist(currentUser.uid, pg);
      // Refresh wishlist after adding
      await refreshWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  // Remove item from wishlist
  const removeItem = async (pgId: string) => {
    if (!currentUser) return;
    
    try {
      await removeFromWishlist(currentUser.uid, pgId);
      // Update local state
      setWishlistItems(prev => prev.filter(item => item.pgId !== pgId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Check if item is in wishlist
  const isItemInWishlist = (pgId: string): boolean => {
    return wishlistItems.some(item => item.pgId === pgId);
  };

  // Refresh wishlist data
  const refreshWishlist = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const items = await getUserWishlist(currentUser.uid);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    wishlistItems,
    isLoading,
    addItem,
    removeItem,
    isItemInWishlist,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
