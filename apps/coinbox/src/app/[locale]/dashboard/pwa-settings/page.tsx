'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Bell, Trash2, RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react';
import {
  isPWA,
  requestNotificationPermission,
  subscribeToPushNotifications,
  clearCache,
  getCacheInfo,
  getNetworkInfo,
  isOnline
} from '@/lib/pwa-utils';

export default function PWASettingsPage() {
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [cacheInfo, setCacheInfo] = useState<any[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [online, setOnline] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    // Check PWA status
    setPwaInstalled(isPWA());
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Get cache info
    loadCacheInfo();
    
    // Get network info
    setNetworkInfo(getNetworkInfo());
    setOnline(isOnline());
    
    // Listen for online/offline events
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheInfo = async () => {
    const info = await getCacheInfo();
    setCacheInfo(info || []);
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      // Subscribe to push notifications
      // You'll need to replace this with your actual VAPID public key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      if (vapidKey) {
        await subscribeToPushNotifications(vapidKey);
      }
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will remove offline content.')) {
      return;
    }
    
    setClearing(true);
    const success = await clearCache();
    
    if (success) {
      await loadCacheInfo();
      alert('Cache cleared successfully!');
    } else {
      alert('Failed to clear cache. Please try again.');
    }
    
    setClearing(false);
  };

  const getTotalCacheSize = () => {
    return cacheInfo.reduce((total, cache) => total + cache.size, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PWA Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your Progressive Web App settings and offline capabilities
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Installation Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Installation
                </h2>
              </div>
              {pwaInstalled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pwaInstalled
                ? 'App is installed and running as PWA'
                : 'App is running in browser mode'}
            </p>
          </div>

          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Info className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Connection
                </h2>
              </div>
              {online ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {online ? 'Online' : 'Offline'}
              {networkInfo && online && (
                <span className="ml-2">
                  ({networkInfo.effectiveType})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Push Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get real-time updates for trades and transactions
                </p>
              </div>
            </div>
            <div>
              {notificationPermission === 'granted' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Enabled
                </span>
              ) : notificationPermission === 'denied' ? (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  Blocked
                </span>
              ) : (
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
          
          {notificationPermission === 'denied' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Notifications are blocked. To enable them, go to your browser settings and allow notifications for this site.
              </p>
            </div>
          )}
        </div>

        {/* Cache Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Offline Storage
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage cached data for offline access
                </p>
              </div>
            </div>
          </div>

          {/* Cache Stats */}
          <div className="space-y-3 mb-4">
            {cacheInfo.map((cache, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {cache.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {cache.size} items cached
                  </p>
                </div>
              </div>
            ))}
            
            {cacheInfo.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                No cached data available
              </p>
            )}
          </div>

          {/* Total */}
          {cacheInfo.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Total Cached Items
                </span>
                <span className="font-bold text-blue-600">
                  {getTotalCacheSize()}
                </span>
              </div>
            </div>
          )}

          {/* Clear Cache Button */}
          <button
            onClick={handleClearCache}
            disabled={clearing || cacheInfo.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
          >
            {clearing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Clearing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Clear All Cache</span>
              </>
            )}
          </button>
        </div>

        {/* Network Info */}
        {networkInfo && online && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Network Information
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Connection Type</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {networkInfo.effectiveType?.toUpperCase() || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Downlink Speed</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Round-Trip Time</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {networkInfo.rtt ? `${networkInfo.rtt} ms` : 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Data Saver</dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {networkInfo.saveData ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
