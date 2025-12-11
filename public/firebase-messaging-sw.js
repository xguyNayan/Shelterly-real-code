// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDDXE6W73LM9suz3oaSIVUxoG_Q9k6RByk",
  authDomain: "shelterly-a7db0.firebaseapp.com",
  projectId: "shelterly-a7db0",
  storageBucket: "shelterly-a7db0.firebasestorage.app",
  messagingSenderId: "926425114631",
  appId: "1:926425114631:web:e5917d8f0ff1b9007de2a2",
  measurementId: "G-JZVQT3BRY2"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Service worker version for debugging
self.addEventListener('install', (event) => {
  console.log('Service Worker installing - version 1.3');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// Log any errors that occur during service worker operations
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Shelterly Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: 'shelterly-notification-' + Date.now(),
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {},
    // Add mobile-specific options
    renotify: true, // Allow notifications with the same tag to notify the user
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo192.png'
      }
    ]
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  // Close the notification
  event.notification.close();
  
  // Check if a specific action was clicked
  let clickAction = '/';
  if (event.action === 'view' && event.notification.data?.clickAction) {
    clickAction = event.notification.data.clickAction;
  } else if (event.notification.data?.clickAction) {
    clickAction = event.notification.data.clickAction;
  }
  
  console.log(`[firebase-messaging-sw.js] Opening URL: ${clickAction}`);
  
  // This will open the app or focus it if it's already open
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, focus it
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log(`[firebase-messaging-sw.js] Focusing existing client: ${client.url}`);
          return client.focus().then(() => {
            // And navigate it to the new URL if needed
            if (client.url !== self.location.origin + clickAction) {
              console.log(`[firebase-messaging-sw.js] Navigating client to: ${clickAction}`);
              return client.navigate(clickAction);
            }
          });
        }
      }
      
      // If no window is open, open a new one
      console.log(`[firebase-messaging-sw.js] Opening new window to: ${clickAction}`);
      return clients.openWindow(clickAction).then(client => {
        // Wait for the page to load and then focus it
        if (client) {
          return client.focus();
        }
      });
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed', event);
});

// Handle push event directly (for better mobile support)
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
      console.log('[Service Worker] Push data:', notificationData);
    }
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
    // Try to extract data even if JSON parsing fails
    if (event.data) {
      try {
        const text = event.data.text();
        console.log('[Service Worker] Push text data:', text);
        // Try to extract title and body from text
        if (text.includes('title') || text.includes('body')) {
          notificationData = { notification: { title: 'New Notification', body: text } };
        }
      } catch (e) {
        console.error('[Service Worker] Error extracting text data:', e);
      }
    }
  }
  
  // Extract notification details
  const notificationTitle = notificationData.notification?.title || 'Shelterly Notification';
  const notificationOptions = {
    body: notificationData.notification?.body || 'You have a new notification',
    icon: notificationData.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: 'shelterly-notification-' + Date.now(),
    data: {
      url: notificationData.data?.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      }
    ],
    requireInteraction: true
  };
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});
