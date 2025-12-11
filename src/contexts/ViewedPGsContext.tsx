import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ViewedPGsContextType {
  viewedPGCount: number;
  incrementViewedPGCount: (pgId?: string) => void;
  resetViewedPGCount: () => void;
  hasExceededFreeLimit: boolean;
  viewedPGIds: string[];
  hasPGBeenViewed: (pgId: string) => boolean;
}

const ViewedPGsContext = createContext<ViewedPGsContextType>({
  viewedPGCount: 0,
  incrementViewedPGCount: () => {},
  resetViewedPGCount: () => {},
  hasExceededFreeLimit: false,
  viewedPGIds: [],
  hasPGBeenViewed: () => false
});

export const useViewedPGs = () => useContext(ViewedPGsContext);

interface ViewedPGsProviderProps {
  children: ReactNode;
  freeLimit?: number;
}

export const ViewedPGsProvider: React.FC<ViewedPGsProviderProps> = ({ 
  children, 
  freeLimit = 3 // Default free limit is 3 PGs
}) => {
  const { currentUser } = useAuth();
  const [viewedPGCount, setViewedPGCount] = useState<number>(0);
  const [viewedPGIds, setViewedPGIds] = useState<string[]>([]);
  
  // Load the viewed count and IDs from localStorage on initial render
  useEffect(() => {
    if (!currentUser) {
      try {
        // Load viewed count
        const savedCount = localStorage.getItem('viewedPGCount');
        if (savedCount) {
          const parsedCount = parseInt(savedCount, 10);
          // Validate the count is a reasonable number (0-100)
          if (!isNaN(parsedCount) && parsedCount >= 0 && parsedCount <= 100) {
            setViewedPGCount(parsedCount);
          } else {
            console.error('Invalid viewedPGCount in localStorage:', parsedCount);
            resetViewedPGCount();
          }
        }
        
        // Load viewed PG IDs
        const savedIds = localStorage.getItem('viewedPGIds');
        if (savedIds) {
          try {
            const parsedIds = JSON.parse(savedIds);
            if (Array.isArray(parsedIds)) {
              setViewedPGIds(parsedIds);
            } else {
              throw new Error('Stored viewedPGIds is not an array');
            }
          } catch (error) {
            console.error('Error parsing viewedPGIds:', error);
            setViewedPGIds([]);
            localStorage.removeItem('viewedPGIds');
          }
        }
      } catch (error) {
        console.error('Error loading viewed PG data:', error);
        resetViewedPGCount();
      }
    } else {
      // Reset count when user logs in
      resetViewedPGCount();
    }
  }, [currentUser]);
  
  // Save to localStorage whenever count or IDs change
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('viewedPGCount', viewedPGCount.toString());
      localStorage.setItem('viewedPGIds', JSON.stringify(viewedPGIds));
    }
  }, [viewedPGCount, viewedPGIds, currentUser, freeLimit]);
  
  // Check if a specific PG has been viewed
  const hasPGBeenViewed = (pgId: string): boolean => {
    return viewedPGIds.includes(pgId);
  };
  
  // Increment view count only if this PG hasn't been viewed before
  const incrementViewedPGCount = (pgId?: string) => {
    if (!currentUser && pgId) {
      // Only increment if this PG hasn't been viewed before
      if (!viewedPGIds.includes(pgId)) {
         (`Adding new PG to viewed list: ${pgId}`);
        setViewedPGCount(prev => prev + 1);
        setViewedPGIds(prev => [...prev, pgId]);
      } else {
         (`PG already viewed, not incrementing count: ${pgId}`);
      }
    }
  };
  
  const resetViewedPGCount = () => {
    setViewedPGCount(0);
    setViewedPGIds([]);
    localStorage.removeItem('viewedPGCount');
    localStorage.removeItem('viewedPGIds');
  };
  
  const hasExceededFreeLimit = !currentUser && viewedPGCount >= freeLimit;
  
  const value = {
    viewedPGCount,
    incrementViewedPGCount,
    resetViewedPGCount,
    hasExceededFreeLimit,
    viewedPGIds,
    hasPGBeenViewed
  };
  
  return (
    <ViewedPGsContext.Provider value={value}>
      {children}
    </ViewedPGsContext.Provider>
  );
};

export default ViewedPGsContext;
