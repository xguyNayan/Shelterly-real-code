/**
 * Utility to preload the Largest Contentful Paint (LCP) image
 * This helps improve the LCP metric by loading the hero image as early as possible
 */

/**
 * Preloads the hero image to improve LCP
 * @param {string} imageUrl - URL of the hero image
 */
export const preloadHeroImage = (imageUrl) => {
  // Create a link element for preloading
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  link.type = 'image/webp'; // Using WebP format for better performance
  
  // Add the link element to the head
  document.head.appendChild(link);
};

/**
 * Initializes preloading of critical resources
 * This should be called as early as possible in the application lifecycle
 */
export const initPreloading = () => {
  // Preload the hero image
  preloadHeroImage('/src/assets/images/hero.webp');
  
  // Preload other critical resources if needed
  // Add more preloading logic here as needed
};

// Call initPreloading immediately when this module is imported
if (typeof document !== 'undefined') {
  initPreloading();
}
