/**
 * Service Worker Registration
 * Handles PWA installation and offline support
 */

export function registerServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * Unregister service worker (for development/testing)
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('🗑️ Service Workers unregistered');
  }
}

/**
 * Check if app is installable
 */
export function checkInstallability(): Promise<boolean> {
  return new Promise((resolve) => {
    window.addEventListener('beforeinstallprompt', () => {
      resolve(true);
    });

    // Timeout after 2 seconds
    setTimeout(() => resolve(false), 2000);
  });
}

/**
 * Prompt user to install PWA
 */
let deferredPrompt: any = null;

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📱 PWA install prompt ready');
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed');
    deferredPrompt = null;
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('❌ Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install prompt`);
  
  deferredPrompt = null;
  return outcome === 'accepted';
}

/**
 * Check if app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Listen to online/offline events
 */
export function onConnectionChange(callback: (online: boolean) => void) {
  if (typeof window === 'undefined') return;

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
