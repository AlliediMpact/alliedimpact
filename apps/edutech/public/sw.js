// Service Worker for EduTech PWA
const CACHE_NAME = 'edutech-v1.0.0';
const STATIC_CACHE = 'edutech-static-v1';
const DYNAMIC_CACHE = 'edutech-dynamic-v1';
const COURSE_CACHE = 'edutech-courses-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth',
  '/offline.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] EduTech: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] EduTech: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => console.error('[SW] Error caching static assets:', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] EduTech: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== COURSE_CACHE) {
              console.log('[SW] EduTech: Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - cache first for courses, network first for everything else
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  if (request.method === 'GET') {
    // Course content - cache first for offline access
    if (url.pathname.includes('/courses/')) {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          return cachedResponse || fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(COURSE_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        }).catch(() => caches.match('/offline.html'))
      );
    } else {
      // Other content - network first
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request).then((cachedResponse) => {
              return cachedResponse || caches.match('/offline.html');
            });
          })
      );
    }
  }
});

// Background sync for course progress (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncCourseProgress());
  }
});

async function syncCourseProgress() {
  console.log('[SW] EduTech: Syncing course progress...');
  // Sync logic will be implemented when needed
}
