'use client';

import { useEffect, useState } from 'react';
import { ContentCachingService } from '@/lib/services/ContentCachingService';
import { offlineStorage } from '@/lib/services/OfflineStorageService';
import { Button } from '@allied-impact/ui';

export function OfflineContentManager() {
  const [isCached, setIsCached] = useState(false);
  const [caching, setCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [storageEstimate, setStorageEstimate] = useState<any>(null);
  const [contentEstimate, setContentEstimate] = useState<any>(null);

  useEffect(() => {
    checkCacheStatus();
    getStorageInfo();
    getContentInfo();
  }, []);

  const checkCacheStatus = async () => {
    const cachingService = new ContentCachingService();
    const cached = await cachingService.isBeginnerCached();
    setIsCached(cached);

    const status = await offlineStorage.getCacheStatus('beginner');
    setCacheStatus(status);
  };

  const getStorageInfo = async () => {
    const estimate = await offlineStorage.getStorageEstimate();
    setStorageEstimate(estimate);
  };

  const getContentInfo = async () => {
    const cachingService = new ContentCachingService();
    const estimate = await cachingService.getContentSizeEstimate();
    setContentEstimate(estimate);
  };

  const handleCacheContent = async () => {
    setCaching(true);
    try {
      const cachingService = new ContentCachingService();
      const result = await cachingService.cacheBeginnerContent();
      
      if (result.success) {
        alert(`Successfully cached ${result.cached} journeys for offline use!`);
        checkCacheStatus();
      } else {
        alert(`Caching completed with errors: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      alert('Failed to cache content. Please try again.');
    } finally {
      setCaching(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all offline content? You will need to re-download to use offline mode.')) {
      return;
    }

    try {
      const cachingService = new ContentCachingService();
      await cachingService.clearCache();
      alert('Offline cache cleared!');
      checkCacheStatus();
      getStorageInfo();
    } catch (error) {
      alert('Failed to clear cache.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>📡</span>
        Offline Content
      </h3>

      {/* Cache Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isCached ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {isCached ? '✓ Cached' : 'Not Cached'}
          </span>
        </div>

        {cacheStatus && isCached && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cached Journeys:</span>
              <span className="font-semibold">{cacheStatus.cached}</span>
            </div>
            {cacheStatus.lastUpdated && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm">{new Date(cacheStatus.lastUpdated).toLocaleDateString()}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Storage Info */}
      {storageEstimate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold mb-2">Storage Usage</div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(storageEstimate.percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-600">
            {(storageEstimate.usage / (1024 * 1024)).toFixed(2)} MB / {(storageEstimate.quota / (1024 * 1024)).toFixed(0)} MB
            ({storageEstimate.percentage.toFixed(1)}%)
          </div>
        </div>
      )}

      {/* Content Estimate */}
      {contentEstimate && !isCached && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm font-semibold mb-2">Download Size</div>
          <div className="space-y-1 text-sm text-gray-700">
            <div>• {contentEstimate.journeys} journeys</div>
            <div>• {contentEstimate.questions} questions</div>
            <div>• ~{contentEstimate.estimatedMB} MB download</div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <div className="text-sm text-gray-700">
          {isCached ? (
            <>
              <strong>✓ Offline Mode Enabled</strong>
              <br />
              You can complete Beginner journeys without internet. Your progress will sync when you're back online.
            </>
          ) : (
            <>
              <strong>Download for Offline Use</strong>
              <br />
              Cache Beginner content to practice without internet connection. Requires stable connection to download.
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!isCached ? (
          <Button onClick={handleCacheContent} disabled={caching} className="w-full">
            {caching ? 'Downloading...' : '⬇️ Download Beginner Content'}
          </Button>
        ) : (
          <>
            <Button onClick={handleCacheContent} disabled={caching} variant="secondary" className="w-full">
              {caching ? 'Updating...' : '🔄 Update Content'}
            </Button>
            <Button onClick={handleClearCache} variant="outline" className="w-full">
              🗑️ Clear Offline Cache
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
