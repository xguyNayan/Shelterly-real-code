import { PGData } from '../components/PGListing/types';

const PG_CACHE_KEY = 'shelterly-pg-cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: PGData[];
  timestamp: number;
}

// Cache PG data in localStorage with expiry
export const cachePGData = (pgs: PGData[]) => {
  const cacheEntry: CacheEntry = {
    data: pgs,
    timestamp: Date.now(),
  };
  localStorage.setItem(PG_CACHE_KEY, JSON.stringify(cacheEntry));
};

// Get cached PG data if not expired
export const getCachedPGData = (): PGData[] | null => {
  const cached = localStorage.getItem(PG_CACHE_KEY);
  if (!cached) return null;

  const cacheEntry: CacheEntry = JSON.parse(cached);
  if (Date.now() - cacheEntry.timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(PG_CACHE_KEY);
    return null;
  }

  return cacheEntry.data;
};

// Progressive loading batch size
export const INITIAL_BATCH_SIZE = 2;
export const NEXT_BATCH_SIZE = 3;

// Get next batch of PGs
export const getNextBatch = (pgs: PGData[], currentIndex: number, batchSize: number): PGData[] => {
  return pgs.slice(currentIndex, currentIndex + batchSize);
};

// Preload images for given PGs
export const preloadPGImages = async (pgs: PGData[]) => {
  const imageUrls = pgs.flatMap(pg => {
    const urls: string[] = [];
    if (pg.photos?.length) {
      // Extract URLs from the photos array
      urls.push(...pg.photos.map(photo => photo.url));
    }
    return urls;
  });

  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    })
  ).catch(error => console.error('Failed to preload images:', error));
};