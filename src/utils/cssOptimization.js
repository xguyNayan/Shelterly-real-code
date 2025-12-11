/**
 * CSS optimization utilities for Shelterly
 * These functions help optimize CSS loading for better performance
 */

/**
 * Dynamically loads a CSS file with proper attributes
 * @param {string} href - URL of the CSS file to load
 * @param {boolean} isPreload - Whether to preload the CSS file
 * @param {boolean} isAsync - Whether to load the CSS file asynchronously
 */
export const loadCSSFile = (href, isPreload = false, isAsync = true) => {
  // Check if the CSS file is already loaded
  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) {
    return;
  }

  // Create a new link element
  const link = document.createElement('link');
  link.rel = isPreload ? 'preload' : 'stylesheet';
  link.href = href;
  
  if (isPreload) {
    link.as = 'style';
    link.onload = () => {
      link.rel = 'stylesheet';
    };
  }
  
  if (isAsync) {
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
  }
  
  // Add the link element to the head
  document.head.appendChild(link);
};

/**
 * Preloads critical CSS files
 * @param {Array<string>} cssFiles - Array of CSS files to preload
 */
export const preloadCriticalCSS = (cssFiles) => {
  cssFiles.forEach(href => {
    loadCSSFile(href, true, false);
  });
};

/**
 * Loads non-critical CSS files asynchronously
 * @param {Array<string>} cssFiles - Array of CSS files to load asynchronously
 */
export const loadNonCriticalCSS = (cssFiles) => {
  cssFiles.forEach(href => {
    loadCSSFile(href, false, true);
  });
};

/**
 * Inlines critical CSS directly into the page
 * @param {string} css - CSS string to inline
 */
export const inlineCriticalCSS = (css) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};
