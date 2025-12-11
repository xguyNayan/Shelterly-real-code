/**
 * Performance utilities for Shelterly
 * This file contains functions to improve website performance
 */

/**
 * Lazy loads images that are not in the viewport
 * @param imageSelector - CSS selector for images to lazy load
 */
export const setupLazyLoading = (imageSelector = 'img[data-src]') => {
  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target as HTMLImageElement;
          if (lazyImage.dataset.src) {
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.removeAttribute('data-src');
            lazyImageObserver.unobserve(lazyImage);
          }
        }
      });
    });

    // Observe all the images with data-src attribute
    const lazyImages = document.querySelectorAll(imageSelector);
    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    const lazyImages = document.querySelectorAll(imageSelector);
    lazyImages.forEach((image) => {
      const img = image as HTMLImageElement;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  }
};

/**
 * Debounce function to limit how often a function can be called
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit how often a function can be called
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Adds resource hints to improve page load performance
 * @param resources - Array of URLs to preconnect/prefetch
 */
export const addResourceHints = (resources: {url: string, type: 'preconnect' | 'prefetch' | 'preload', as?: string}[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = resource.type;
    link.href = resource.url;
    
    if (resource.type === 'preload' && resource.as) {
      link.setAttribute('as', resource.as);
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Implements a simple in-memory cache for expensive operations
 */
export class MemoryCache {
  private cache: Map<string, {value: any, expiry: number | null}> = new Map();
  
  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string): any {
    const item = this.cache.get(key);
    
    // Return undefined if item doesn't exist
    if (!item) return undefined;
    
    // Check if item is expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  set(key: string, value: any, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * Remove a value from cache
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance for global use
export const globalCache = new MemoryCache();
