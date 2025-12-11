/**
 * Service worker for caching and offline support
 * This helps improve performance by caching static assets and providing offline functionality
 */

// Cache name - update this when you want to invalidate the cache
const CACHE_NAME = 'shelterly-cache-v1';

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/assets/images/logo.png',
  '/src/assets/images/hero.webp',
];

// Install event - precache critical assets
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
         ('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => (self as any).skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: any) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
    .then(() => (self as any).clients.claim())
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network and cache
self.addEventListener('fetch', (event: any) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to the Firestore API
  if (event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  // For HTML requests - network first, then cache
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For image requests - cache first, then network
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
              return fetchResponse;
            });
        })
    );
    return;
  }

  // For all other requests - stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.match(event.request)
          .then(cachedResponse => {
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            return cachedResponse || fetchPromise;
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event: any) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/src/assets/images/logo.png',
    badge: '/src/assets/images/logo.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    (self as any).registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  
  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window' })
      .then(clientList => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if ((self as any).clients.openWindow) {
          return (self as any).clients.openWindow(event.notification.data.url);
        }
      })
  );
});
