// Import preloading utility first to ensure it runs as early as possible
import './utils/preloadLCP.js'

import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useLocation, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initGA, trackPageView } from './utils/analytics'

// Initialize Google Analytics with your Firebase Measurement ID
initGA('G-JZVQT3BRY2')

// Register service worker for caching and offline support
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Fix the path to use the correct location and file extension (.js not .ts)
      // In production, service worker should be at the root
      const swPath = process.env.NODE_ENV === 'production' 
        ? '/serviceWorker.js' 
        : '/serviceWorker.js';
        
      navigator.serviceWorker.register(swPath)
        .then(registration => {
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
};

// Register service worker
registerServiceWorker();

// Render the app directly since App.tsx already has Router, AuthProvider, etc.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500"></div>
    </div>}>
      <App />
    </Suspense>
  </StrictMode>,
)
