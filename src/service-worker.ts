/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'shelterly-cache-v1';
const IMAGE_CACHE = 'shelterly-images-v1';

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)),
      caches.open(IMAGE_CACHE)
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith('shelterly-') &&
              cacheName !== CACHE_NAME &&
              cacheName !== IMAGE_CACHE
            );
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Helper function to cache PG images
export const cachePGImages = async (pgData: any[]) => {
  const cache = await caches.open(IMAGE_CACHE);
  const imageUrls = pgData.flatMap(pg => {
    const urls = [];
    if (pg.images?.length) {
      urls.push(...pg.images);
    }
    if (pg.thumbnail) {
      urls.push(pg.thumbnail);
    }
    return urls;
  });

  return Promise.all(
    imageUrls.map(async (url) => {
      if (!await cache.match(url)) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.error('Failed to cache image:', url, error);
        }
      }
    })
  );
};

// Fetch event - network first for API requests, cache first for images
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle image requests
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          // Cache images that are successfully fetched
          if (fetchResponse.ok) {
            const clonedResponse = fetchResponse.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return fetchResponse;
        });
      })
    );
    return;
  }

  // Network first strategy for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});