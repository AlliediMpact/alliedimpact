import { offlineStorage } from './OfflineStorageService';
import { GameEngine } from './GameEngine';
import { GamificationService } from './GamificationService';

export class OfflineSyncService {
  private userId: string;
  private isSyncing: boolean = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify sync listeners
   */
  private notifySyncListeners(status: SyncStatus): void {
    this.syncListeners.forEach((listener) => listener(status));
  }

  /**
   * Sync all pending items
   */
  async syncPendingItems(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Sync already in progress'],
      };
    }

    if (!this.isOnline()) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    this.notifySyncListeners({ status: 'syncing', progress: 0 });

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const pendingItems = await offlineStorage.getPendingSync();
      const total = pendingItems.length;

      for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        
        this.notifySyncListeners({
          status: 'syncing',
          progress: ((i + 1) / total) * 100,
        });

        try {
          // Validate before syncing
          const isValid = await this.validateSyncItem(item);
          
          if (!isValid) {
            result.failed++;
            result.errors.push(`Invalid data for ${item.type}: ${item.id}`);
            continue;
          }

          // Sync based on type
          switch (item.type) {
            case 'journey_attempt':
              await this.syncJourneyAttempt(item.data);
              break;
            case 'credit_update':
              await this.syncCreditUpdate(item.data);
              break;
            case 'progress_update':
              await this.syncProgressUpdate(item.data);
              break;
          }

          // Mark as synced
          await offlineStorage.markSyncComplete(item.id);
          result.synced++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Sync error for ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Clear old synced items
      await offlineStorage.clearOldSyncedItems(7);

      this.notifySyncListeners({
        status: 'success',
        progress: 100,
      });
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      this.notifySyncListeners({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown sync error',
      });
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Validate sync item for suspicious activity
   */
  private async validateSyncItem(item: any): Promise<boolean> {
    // Check timestamp is not too old (max 7 days)
    const daysSinceCreation = (Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 7) {
      console.warn('Sync item too old:', item.id);
      return false;
    }

    // Type-specific validation
    if (item.type === 'journey_attempt') {
      return this.validateJourneyAttempt(item.data, item.timestamp, item.deviceFingerprint);
    }

    return true;
  }

  /**
   * Validate journey attempt for cheating
   */
  private validateJourneyAttempt(
    data: any,
    timestamp: Date,
    deviceFingerprint: string
  ): boolean {
    const { result } = data;

    // Check duration is reasonable (not too fast)
    const minDurationPerQuestion = 5; // 5 seconds minimum per question
    const minDuration = result.totalQuestions * minDurationPerQuestion;
    
    if (result.duration < minDuration) {
      console.warn('Journey completed too quickly:', result.duration, 'vs min:', minDuration);
      return false;
    }

    // Check score is not impossibly perfect with very short time
    if (result.score === 100 && result.duration < result.totalQuestions * 10) {
      console.warn('Perfect score in suspiciously short time');
      return false;
    }

    // Check timestamp matches within reasonable range
    const timeDiff = Math.abs(Date.now() - timestamp.getTime());
    const maxDiff = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (timeDiff > maxDiff) {
      console.warn('Timestamp too far in past');
      return false;
    }

    return true;
  }

  /**
   * Sync journey attempt to server
   */
  private async syncJourneyAttempt(data: any): Promise<void> {
    const gameEngine = new GameEngine(this.userId);
    
    // Save journey attempt to Firestore
    await gameEngine.saveJourneyAttempt(data.result);
    
    // Update user stats
    await gameEngine.updateUserStats(data.result);
  }

  /**
   * Sync credit update to server
   */
  private async syncCreditUpdate(data: any): Promise<void> {
    const gamificationService = new GamificationService(this.userId);
    
    if (data.amount > 0) {
      await gamificationService.awardCredits(data.amount, data.reason);
    } else {
      await gamificationService.deductCredits(Math.abs(data.amount), data.reason);
    }
  }

  /**
   * Sync progress update to server
   */
  private async syncProgressUpdate(data: any): Promise<void> {
    // Implementation depends on what progress data needs syncing
    // For now, this is a placeholder
    console.log('Syncing progress update:', data);
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    online: boolean;
    pendingItems: number;
    lastSync: Date | null;
  }> {
    const pendingItems = await offlineStorage.getPendingSync();
    
    // You could store lastSync in localStorage or IndexedDB
    const lastSyncStr = localStorage.getItem('lastSyncTime');
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;

    return {
      online: this.isOnline(),
      pendingItems: pendingItems.length,
      lastSync,
    };
  }

  /**
   * Auto-sync when coming online
   */
  startAutoSync(): () => void {
    const handleOnline = async () => {
      console.log('Device came online, syncing...');
      await this.syncPendingItems();
      localStorage.setItem('lastSyncTime', new Date().toISOString());
    };

    window.addEventListener('online', handleOnline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }
}

export interface SyncStatus {
  status: 'syncing' | 'success' | 'error' | 'idle';
  progress?: number;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}
