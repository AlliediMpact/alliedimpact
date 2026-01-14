// Enhanced Service Worker with Workbox strategies
const CACHE_NAME = 'edutech-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Firebase and external API requests
  if (
    url.origin.includes('firebaseio.com') ||
    url.origin.includes('googleapis.com') ||
    url.origin.includes('google.com')
  ) {
    return;
  }

  // Network-first strategy for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Cache images for future use
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for HTML pages
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept').includes('text/html')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            // Update cache with new version
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // If offline and no cache, show offline page
            return caches.match(OFFLINE_URL);
          });

        // Return cached version immediately, or wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendanceRecords());
  }
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressRecords());
  }
});

// Sync attendance records when back online
async function syncAttendanceRecords() {
  try {
    const cache = await caches.open('offline-data');
    const keys = await cache.keys();
    const attendanceKeys = keys.filter((key) => key.url.includes('attendance-pending'));
    
    for (const request of attendanceKeys) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Send to server
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      // Remove from cache
      await cache.delete(request);
    }
    
    console.log('[Service Worker] Attendance records synced');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Sync progress records when back online
async function syncProgressRecords() {
  try {
    const cache = await caches.open('offline-data');
    const keys = await cache.keys();
    const progressKeys = keys.filter((key) => key.url.includes('progress-pending'));
    
    for (const request of progressKeys) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Send to server
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      // Remove from cache
      await cache.delete(request);
    }
    
    console.log('[Service Worker] Progress records synced');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'EduTech', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    const urlToOpen = event.notification.data || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});
