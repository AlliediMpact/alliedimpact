'use client';

import { useEffect, useState } from 'react';
import { OfflineSyncService, SyncStatus } from '@/lib/services/OfflineSyncService';
import { offlineStorage } from '@/lib/services/OfflineStorageService';
import { useAuth } from '@/lib/contexts/AuthContext';

export function OfflineIndicator() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initial online status
    setIsOnline(navigator.onLine);

    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending items periodically
    const checkPending = async () => {
      const pending = await offlineStorage.getPendingSync();
      setPendingItems(pending.length);
    };

    checkPending();
    const interval = setInterval(checkPending, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const syncService = new OfflineSyncService(user.uid);
    
    // Listen to sync status
    const unsubscribe = syncService.addSyncListener((status) => {
      setSyncStatus(status);
    });

    // Auto-sync when coming online
    const cleanup = syncService.startAutoSync();

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [user]);

  // Don't show if online with no pending items
  if (isOnline && pendingItems === 0 && syncStatus.status === 'idle') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        onClick={() => setShowDetails(!showDetails)}
        className={`cursor-pointer rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 transition-all ${
          isOnline
            ? syncStatus.status === 'syncing'
              ? 'bg-blue-500 text-white'
              : syncStatus.status === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
            : 'bg-gray-700 text-white'
        }`}
      >
        {/* Status Icon */}
        <div className="text-2xl">
          {isOnline ? (
            syncStatus.status === 'syncing' ? (
              <div className="animate-spin">⟳</div>
            ) : syncStatus.status === 'error' ? (
              '⚠️'
            ) : (
              '✓'
            )
          ) : (
            '📡'
          )}
        </div>

        {/* Status Text */}
        <div>
          <div className="font-semibold text-sm">
            {isOnline ? (
              syncStatus.status === 'syncing' ? (
                'Syncing...'
              ) : syncStatus.status === 'error' ? (
                'Sync Error'
              ) : pendingItems > 0 ? (
                'Online'
              ) : (
                'Synced'
              )
            ) : (
              'Offline Mode'
            )}
          </div>
          {pendingItems > 0 && (
            <div className="text-xs opacity-90">
              {pendingItems} item{pendingItems > 1 ? 's' : ''} pending
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {syncStatus.status === 'syncing' && syncStatus.progress !== undefined && (
          <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${syncStatus.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Details Dropdown */}
      {showDetails && (
        <div className="mt-2 bg-white rounded-lg shadow-xl p-4 text-gray-700 text-sm max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Connection:</span>
              <span className={isOnline ? 'text-green-600' : 'text-gray-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Pending Sync:</span>
              <span>{pendingItems} items</span>
            </div>
            {syncStatus.status === 'error' && syncStatus.error && (
              <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
                {syncStatus.error}
              </div>
            )}
            {!isOnline && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 text-xs">
                Your progress is being saved locally and will sync when you're back online.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
