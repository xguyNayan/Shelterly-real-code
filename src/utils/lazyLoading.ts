/**
 * Utility functions for lazy loading components and resources
 * These help improve performance by reducing the initial bundle size
 */

import { lazy } from 'react';

/**
 * Creates a lazy-loaded component with a specified fallback
 * @param importFn - The import function that returns the component
 * @param displayName - Optional name for the component for debugging
 * @returns A lazy-loaded React component
 */
export const lazyWithPreload = (importFn: () => Promise<{ default: React.ComponentType<any> }>, displayName?: string) => {
  const LazyComponent = lazy(importFn);
  
  // Add a preload method to the component
  const ComponentWithPreload = LazyComponent as typeof LazyComponent & {
    preload: () => Promise<void>;
  };
  
  // Add the preload method
  ComponentWithPreload.preload = async () => {
    try {
      await importFn();
    } catch (error) {
      console.error(`Error preloading component ${displayName || 'unknown'}:`, error);
    }
  };
  
  // Set display name for debugging
  if (displayName) {
    // Using Object.defineProperty to avoid TypeScript errors
    Object.defineProperty(ComponentWithPreload, 'displayName', {
      value: displayName,
      writable: false
    });
  }
  
  return ComponentWithPreload;
};

/**
 * Preloads a component when the user hovers over a trigger element
 * @param selector - CSS selector for the trigger element
 * @param component - The component with preload method to preload
 */
export const preloadOnHover = (selector: string, component: { preload: () => Promise<void> }) => {
  if (typeof document === 'undefined') return;
  
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      component.preload();
    });
  });
};

/**
 * Preloads a component when the user is idle
 * @param component - The component with preload method to preload
 * @param timeout - Optional timeout in milliseconds
 */
export const preloadOnIdle = (component: { preload: () => Promise<void> }, timeout = 2000) => {
  if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;
  
  // @ts-ignore - requestIdleCallback is not in the TypeScript types
  window.requestIdleCallback(() => {
    component.preload();
  }, { timeout });
};

/**
 * Preloads a component when it's in the viewport
 * @param selector - CSS selector for the element to observe
 * @param component - The component with preload method to preload
 * @param threshold - Intersection threshold (0-1)
 */
export const preloadInViewport = (selector: string, component: { preload: () => Promise<void> }, threshold = 0.1) => {
  if (typeof IntersectionObserver === 'undefined' || typeof document === 'undefined') return;
  
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          component.preload();
          observer.disconnect();
        }
      });
    },
    { threshold }
  );
  
  elements.forEach(element => {
    observer.observe(element);
  });
};
