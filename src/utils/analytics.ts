import ReactGA from 'react-ga4';

// Initialize Google Analytics with your Measurement ID
export const initGA = (measurementId: string) => {
  // Always initialize in both development and production
  // This helps with testing and debugging
  ReactGA.initialize(measurementId);
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// PG-specific tracking functions
export const trackPGView = (pgId: string, pgName: string) => {
  trackEvent('PG', 'View', pgName, undefined);
  // Also track as a specific PG view for better analytics
  ReactGA.send({
    hitType: 'pageview',
    page: `/pg-details/${pgId}`,
    title: `PG: ${pgName}`,
  });
};

export const trackPGListingFilter = (filterType: string, filterValue: string) => {
  trackEvent('PG Listing', 'Filter Applied', `${filterType}: ${filterValue}`);
};

export const trackWishlistAction = (action: 'add' | 'remove', pgId: string, pgName: string) => {
  trackEvent('Wishlist', action === 'add' ? 'Add to Wishlist' : 'Remove from Wishlist', pgName);
};

export const trackBookingStart = (pgId: string, pgName: string) => {
  trackEvent('Booking', 'Initiate Booking', pgName);
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('Search', 'PG Search', searchTerm, resultsCount);
};

export const trackLocationSearch = (latitude: number, longitude: number, resultsCount: number) => {
  trackEvent('Search', 'Location Search', `${latitude},${longitude}`, resultsCount);
};
