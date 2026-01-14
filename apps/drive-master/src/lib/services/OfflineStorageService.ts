import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Journey, Question, GameState } from '@/lib/types/game';

interface OfflineDBSchema extends DBSchema {
  journeys: {
    key: string;
    value: Journey & { cachedAt: Date };
    indexes: { 'by-stage': string };
  };
  questions: {
    key: string;
    value: Question & { cachedAt: Date };
    indexes: { 'by-journey': string };
  };
  pendingSync: {
    key: string;
    value: {
      id: string;
      type: 'journey_attempt' | 'credit_update' | 'progress_update';
      data: any;
      timestamp: Date;
      deviceFingerprint: string;
      synced: boolean;
    };
    indexes: { 'by-synced': boolean };
  };
  gameStates: {
    key: string;
    value: GameState & { savedAt: Date };
  };
}

const DB_NAME = 'drivemaster-offline';
const DB_VERSION = 1;

class OfflineStorageService {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;

  /**
   * Initialize IndexedDB
   */
  async initDB(): Promise<IDBPDatabase<OfflineDBSchema>> {
    if (this.db) {
      return this.db;
    }

    this.db = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Journeys store
        if (!db.objectStoreNames.contains('journeys')) {
          const journeyStore = db.createObjectStore('journeys', { keyPath: 'journeyId' });
          journeyStore.createIndex('by-stage', 'stage');
        }

        // Questions store
        if (!db.objectStoreNames.contains('questions')) {
          const questionStore = db.createObjectStore('questions', { keyPath: 'questionId' });
          questionStore.createIndex('by-journey', 'journeyId');
        }

        // Pending sync queue
        if (!db.objectStoreNames.contains('pendingSync')) {
          const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id' });
          syncStore.createIndex('by-synced', 'synced');
        }

        // Game states
        if (!db.objectStoreNames.contains('gameStates')) {
          db.createObjectStore('gameStates', { keyPath: 'journeyId' });
        }
      },
    });

    return this.db;
  }

  /**
   * Cache journey content offline
   */
  async cacheJourney(journey: Journey): Promise<void> {
    const db = await this.initDB();
    await db.put('journeys', {
      ...journey,
      cachedAt: new Date(),
    });
  }

  /**
   * Cache multiple journeys
   */
  async cacheJourneys(journeys: Journey[]): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('journeys', 'readwrite');
    
    await Promise.all([
      ...journeys.map((journey) =>
        tx.store.put({
          ...journey,
          cachedAt: new Date(),
        })
      ),
      tx.done,
    ]);
  }

  /**
   * Get cached journey
   */
  async getCachedJourney(journeyId: string): Promise<Journey | null> {
    const db = await this.initDB();
    const cached = await db.get('journeys', journeyId);
    
    if (!cached) {
      return null;
    }

    // Remove cachedAt before returning
    const { cachedAt, ...journey } = cached;
    return journey as Journey;
  }

  /**
   * Get all cached journeys for a stage
   */
  async getCachedJourneysByStage(stage: string): Promise<Journey[]> {
    const db = await this.initDB();
    const cached = await db.getAllFromIndex('journeys', 'by-stage', stage);
    
    return cached.map(({ cachedAt, ...journey }) => journey as Journey);
  }

  /**
   * Cache questions for a journey
   */
  async cacheQuestions(journeyId: string, questions: Question[]): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('questions', 'readwrite');
    
    await Promise.all([
      ...questions.map((question) =>
        tx.store.put({
          ...question,
          journeyId,
          cachedAt: new Date(),
        })
      ),
      tx.done,
    ]);
  }

  /**
   * Get cached questions for a journey
   */
  async getCachedQuestions(journeyId: string): Promise<Question[]> {
    const db = await this.initDB();
    const cached = await db.getAllFromIndex('questions', 'by-journey', journeyId);
    
    return cached.map(({ cachedAt, journeyId: _, ...question }) => question as Question);
  }

  /**
   * Save game state checkpoint
   */
  async saveGameState(state: GameState): Promise<void> {
    const db = await this.initDB();
    await db.put('gameStates', {
      ...state,
      savedAt: new Date(),
    });
  }

  /**
   * Load saved game state
   */
  async loadGameState(journeyId: string): Promise<GameState | null> {
    const db = await this.initDB();
    const saved = await db.get('gameStates', journeyId);
    
    if (!saved) {
      return null;
    }

    const { savedAt, ...state } = saved;
    return state as GameState;
  }

  /**
   * Clear saved game state
   */
  async clearGameState(journeyId: string): Promise<void> {
    const db = await this.initDB();
    await db.delete('gameStates', journeyId);
  }

  /**
   * Add item to sync queue
   */
  async queueForSync(
    type: 'journey_attempt' | 'credit_update' | 'progress_update',
    data: any,
    deviceFingerprint: string
  ): Promise<string> {
    const db = await this.initDB();
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.put('pendingSync', {
      id,
      type,
      data,
      timestamp: new Date(),
      deviceFingerprint,
      synced: false,
    });

    return id;
  }

  /**
   * Get pending sync items
   */
  async getPendingSync(): Promise<Array<any>> {
    const db = await this.initDB();
    return await db.getAllFromIndex('pendingSync', 'by-synced', false);
  }

  /**
   * Mark sync item as completed
   */
  async markSyncComplete(id: string): Promise<void> {
    const db = await this.initDB();
    const item = await db.get('pendingSync', id);
    
    if (item) {
      await db.put('pendingSync', {
        ...item,
        synced: true,
      });
    }
  }

  /**
   * Clear synced items older than X days
   */
  async clearOldSyncedItems(daysOld: number = 7): Promise<void> {
    const db = await this.initDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const allItems = await db.getAll('pendingSync');
    const tx = db.transaction('pendingSync', 'readwrite');

    await Promise.all([
      ...allItems
        .filter((item) => item.synced && item.timestamp < cutoffDate)
        .map((item) => tx.store.delete(item.id)),
      tx.done,
    ]);
  }

  /**
   * Check if journey is cached
   */
  async isJourneyCached(journeyId: string): Promise<boolean> {
    const db = await this.initDB();
    const journey = await db.get('journeys', journeyId);
    return journey !== undefined;
  }

  /**
   * Get cache status for stage
   */
  async getCacheStatus(stage: string): Promise<{
    cached: number;
    total: number;
    lastUpdated: Date | null;
  }> {
    const db = await this.initDB();
    const cached = await db.getAllFromIndex('journeys', 'by-stage', stage);
    
    const lastUpdated =
      cached.length > 0
        ? cached.reduce((latest, journey) =>
            journey.cachedAt > latest ? journey.cachedAt : latest
          , cached[0].cachedAt)
        : null;

    return {
      cached: cached.length,
      total: cached.length, // Would need to fetch from server to know actual total
      lastUpdated,
    };
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    const db = await this.initDB();
    
    await Promise.all([
      db.clear('journeys'),
      db.clear('questions'),
      db.clear('gameStates'),
    ]);
  }

  /**
   * Get storage usage estimate
   */
  async getStorageEstimate(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return { usage, quota, percentage };
    }

    return { usage: 0, quota: 0, percentage: 0 };
  }
}

export const offlineStorage = new OfflineStorageService();
