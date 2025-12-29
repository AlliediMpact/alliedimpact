'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Trigger sync when back online
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as any).sync.register('sync-transactions');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg
          ${isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
          }
        `}
      >
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <div>
              <p className="font-semibold">Back Online</p>
              <p className="text-xs opacity-90">Syncing data...</p>
            </div>
            <RefreshCw className="w-4 h-4 animate-spin ml-2" />
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <div>
              <p className="font-semibold">You&apos;re Offline</p>
              <p className="text-xs opacity-90">Some features unavailable</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
