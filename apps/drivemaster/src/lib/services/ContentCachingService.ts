import { offlineStorage } from './OfflineStorageService';
import { GameEngine } from './GameEngine';
import type { Journey } from '@/lib/types/game';

export class ContentCachingService {
  /**
   * Cache all Beginner journeys for offline use
   */
  async cacheBeginnerContent(): Promise<CacheResult> {
    const result: CacheResult = {
      success: true,
      cached: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Fetch Beginner journeys from server
      const gameEngine = new GameEngine('system'); // Use system user for fetching
      const journeys = await gameEngine.getJourneysByStage('beginner');

      // Cache each journey
      for (const journey of journeys) {
        try {
          await offlineStorage.cacheJourney(journey);
          
          // Cache questions if available
          if (journey.events) {
            const questions = journey.events
              .filter((event) => event.type === 'question')
              .map((event) => event.question!)
              .filter(Boolean);

            if (questions.length > 0) {
              await offlineStorage.cacheQuestions(journey.journeyId, questions);
            }
          }

          result.cached++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to cache ${journey.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Check if Beginner content is cached
   */
  async isBeginnerCached(): Promise<boolean> {
    const cacheStatus = await offlineStorage.getCacheStatus('beginner');
    return cacheStatus.cached > 0;
  }

  /**
   * Get cache freshness (days since last update)
   */
  async getCacheFreshness(): Promise<number | null> {
    const cacheStatus = await offlineStorage.getCacheStatus('beginner');
    
    if (!cacheStatus.lastUpdated) {
      return null;
    }

    const daysSinceUpdate = (Date.now() - cacheStatus.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(daysSinceUpdate);
  }

  /**
   * Update cache if stale (older than X days)
   */
  async updateCacheIfStale(maxAgeDays: number = 7): Promise<boolean> {
    const freshness = await this.getCacheFreshness();
    
    if (freshness === null || freshness >= maxAgeDays) {
      console.log('Cache is stale, updating...');
      await this.cacheBeginnerContent();
      return true;
    }

    return false;
  }

  /**
   * Get downloadable content size estimate
   */
  async getContentSizeEstimate(): Promise<{
    journeys: number;
    questions: number;
    estimatedMB: number;
  }> {
    try {
      const gameEngine = new GameEngine('system');
      const journeys = await gameEngine.getJourneysByStage('beginner');
      
      let questionCount = 0;
      journeys.forEach((journey) => {
        if (journey.events) {
          questionCount += journey.events.filter((e) => e.type === 'question').length;
        }
      });

      // Rough estimate: 50KB per journey, 5KB per question
      const estimatedBytes = (journeys.length * 50 * 1024) + (questionCount * 5 * 1024);
      const estimatedMB = estimatedBytes / (1024 * 1024);

      return {
        journeys: journeys.length,
        questions: questionCount,
        estimatedMB: Math.round(estimatedMB * 100) / 100,
      };
    } catch (error) {
      return {
        journeys: 0,
        questions: 0,
        estimatedMB: 0,
      };
    }
  }

  /**
   * Clear offline cache
   */
  async clearCache(): Promise<void> {
    await offlineStorage.clearCache();
  }
}

export interface CacheResult {
  success: boolean;
  cached: number;
  failed: number;
  errors: string[];
}
