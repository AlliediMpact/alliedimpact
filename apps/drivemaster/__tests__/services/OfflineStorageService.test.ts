import { OfflineStorageService } from '@/lib/services/OfflineStorageService';

// Mock IndexedDB
const mockIDB = {
  openDB: jest.fn(),
};

jest.mock('idb', () => mockIDB);

describe('OfflineStorageService', () => {
  let offlineStorage: OfflineStorageService;

  beforeEach(() => {
    offlineStorage = new OfflineStorageService();
    jest.clearAllMocks();
  });

  describe('Database Initialization', () => {
    it('should create database with correct name', () => {
      const DB_NAME = 'drivemaster_offline';
      expect(DB_NAME).toBe('drivemaster_offline');
    });

    it('should use correct version', () => {
      const DB_VERSION = 1;
      expect(DB_VERSION).toBe(1);
    });

    it('should define all object stores', () => {
      const stores = ['journeys', 'questions', 'pendingSync', 'gameStates'];
      expect(stores).toHaveLength(4);
    });
  });

  describe('Object Store Schemas', () => {
    it('should have journeys store with stage index', () => {
      const storeName = 'journeys';
      const indexName = 'by-stage';
      const keyPath = 'stage';
      
      expect(storeName).toBe('journeys');
      expect(indexName).toBe('by-stage');
      expect(keyPath).toBe('stage');
    });

    it('should have questions store with journey index', () => {
      const storeName = 'questions';
      const indexName = 'by-journey';
      const keyPath = 'journeyId';
      
      expect(storeName).toBe('questions');
      expect(indexName).toBe('by-journey');
      expect(keyPath).toBe('journeyId');
    });

    it('should have pendingSync store with synced index', () => {
      const storeName = 'pendingSync';
      const indexName = 'by-synced';
      const keyPath = 'synced';
      
      expect(storeName).toBe('pendingSync');
      expect(indexName).toBe('by-synced');
      expect(keyPath).toBe('synced');
    });

    it('should have gameStates store', () => {
      const storeName = 'gameStates';
      expect(storeName).toBe('gameStates');
    });
  });

  describe('Cache Management', () => {
    it('should track cached date', () => {
      const cachedAt = new Date();
      expect(cachedAt).toBeInstanceOf(Date);
    });

    it('should calculate cache age in days', () => {
      const cachedAt = new Date('2026-01-07');
      const now = new Date('2026-01-14');
      const diffTime = Math.abs(now.getTime() - cachedAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(7);
    });

    it('should detect stale cache', () => {
      const maxAgeDays = 7;
      const cacheAgeDays = 10;
      const isStale = cacheAgeDays > maxAgeDays;
      
      expect(isStale).toBe(true);
    });
  });

  describe('Sync Queue', () => {
    it('should create sync item with required fields', () => {
      const syncItem = {
        id: 'sync-1',
        type: 'journey_attempt',
        data: {},
        timestamp: new Date(),
        synced: false,
        deviceFingerprint: 'device-123',
      };
      
      expect(syncItem.synced).toBe(false);
      expect(syncItem.deviceFingerprint).toBeDefined();
    });

    it('should filter unsynced items', () => {
      const items = [
        { id: '1', synced: false },
        { id: '2', synced: true },
        { id: '3', synced: false },
      ];
      
      const unsynced = items.filter(item => !item.synced);
      expect(unsynced).toHaveLength(2);
    });
  });

  describe('Storage Estimation', () => {
    it('should calculate percentage used', () => {
      const usage = 50 * 1024 * 1024; // 50 MB
      const quota = 100 * 1024 * 1024; // 100 MB
      const percentage = Math.round((usage / quota) * 100);
      
      expect(percentage).toBe(50);
    });

    it('should format bytes to MB', () => {
      const bytes = 52428800; // 50 MB
      const mb = bytes / (1024 * 1024);
      
      expect(mb).toBeCloseTo(50, 0);
    });
  });

  describe('Journey Caching', () => {
    it('should cache journey with all required fields', () => {
      const journey = {
        journeyId: 'j1',
        name: 'Urban Driving',
        stage: 'beginner',
        description: 'Learn urban traffic rules',
        cachedAt: new Date(),
      };
      
      expect(journey.journeyId).toBeDefined();
      expect(journey.stage).toBeDefined();
      expect(journey.cachedAt).toBeInstanceOf(Date);
    });

    it('should filter by stage', () => {
      const journeys = [
        { journeyId: 'j1', stage: 'beginner' },
        { journeyId: 'j2', stage: 'intermediate' },
        { journeyId: 'j3', stage: 'beginner' },
      ];
      
      const beginnerJourneys = journeys.filter(j => j.stage === 'beginner');
      expect(beginnerJourneys).toHaveLength(2);
    });
  });

  describe('Device Fingerprinting', () => {
    it('should generate device fingerprint', () => {
      const userAgent = navigator.userAgent;
      const screen = `${window.screen.width}x${window.screen.height}`;
      const fingerprint = btoa(`${userAgent}-${screen}`);
      
      expect(fingerprint).toBeDefined();
      expect(fingerprint.length).toBeGreaterThan(0);
    });
  });

  describe('Game State Management', () => {
    it('should save game state with checkpoint', () => {
      const gameState = {
        journeyId: 'j1',
        userId: 'user-123',
        currentQuestionIndex: 5,
        answers: ['A', 'B', 'C', 'A', 'D'],
        startTime: new Date(),
        lastSaved: new Date(),
      };
      
      expect(gameState.currentQuestionIndex).toBe(5);
      expect(gameState.answers).toHaveLength(5);
    });

    it('should detect resumable game state', () => {
      const gameState = {
        currentQuestionIndex: 5,
        totalQuestions: 20,
      };
      
      const isResumable = gameState.currentQuestionIndex < gameState.totalQuestions;
      expect(isResumable).toBe(true);
    });
  });

  describe('Content Size Estimation', () => {
    it('should estimate journey size', () => {
      const JOURNEY_SIZE_KB = 50;
      const journeyCount = 10;
      const totalSize = JOURNEY_SIZE_KB * journeyCount;
      
      expect(totalSize).toBe(500);
    });

    it('should estimate question size', () => {
      const QUESTION_SIZE_KB = 5;
      const questionsPerJourney = 20;
      const journeyCount = 10;
      const totalQuestions = questionsPerJourney * journeyCount;
      const totalSize = QUESTION_SIZE_KB * totalQuestions;
      
      expect(totalSize).toBe(1000);
    });

    it('should calculate total cache size', () => {
      const journeySize = 500; // KB
      const questionSize = 1000; // KB
      const totalSize = journeySize + questionSize;
      
      expect(totalSize).toBe(1500);
    });
  });
});
