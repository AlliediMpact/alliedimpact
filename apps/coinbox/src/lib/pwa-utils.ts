/**
 * PWA Registration Utility
 * Registers service worker and handles updates
 */

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service worker registered:', registration.scope);

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[PWA] New version available');
            
            // Show update notification
            if (confirm('A new version of CoinBox AI is available. Update now?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Controller changed');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker (for development/debugging)
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.log('[PWA] Service worker unregistered:', result);
    return result;
  } catch (error) {
    console.error('[PWA] Service worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if app is running as PWA
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(vapidPublicKey: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[PWA] Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    console.log('[PWA] Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const result = await subscription.unsubscribe();
      console.log('[PWA] Push unsubscribed:', result);
      return result;
    }
    
    return false;
  } catch (error) {
    console.error('[PWA] Push unsubscription failed:', error);
    return false;
  }
}

/**
 * Show notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
) {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options,
    });
  } catch (error) {
    console.error('[PWA] Show notification failed:', error);
    return null;
  }
}

/**
 * Clear cache
 */
export async function clearCache() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      
      // Wait for confirmation
      return new Promise<boolean>((resolve) => {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_CLEARED') {
            resolve(true);
          }
        });
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
      });
    }
    
    return false;
  } catch (error) {
    console.error('[PWA] Clear cache failed:', error);
    return false;
  }
}

/**
 * Get cache storage info
 */
export async function getCacheInfo() {
  if (!('caches' in window)) {
    return null;
  }

  try {
    const cacheNames = await caches.keys();
    const cacheInfo = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return {
          name,
          size: keys.length,
        };
      })
    );

    return cacheInfo;
  } catch (error) {
    console.error('[PWA] Get cache info failed:', error);
    return null;
  }
}

/**
 * Helper: Convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Get network information
 */
export function getNetworkInfo() {
  if (!('connection' in navigator)) {
    return null;
  }

  const connection = (navigator as any).connection;
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}
