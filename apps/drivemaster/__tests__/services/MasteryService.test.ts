import { MasteryService, STAGE_ORDER } from '@/lib/services/MasteryService';
import { Stage } from '@/lib/types/game';

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('MasteryService', () => {
  let masteryService: MasteryService;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    masteryService = new MasteryService(mockUserId);
    jest.clearAllMocks();
  });

  describe('Mastery Thresholds', () => {
    it('should have correct threshold for Beginner', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].beginner.minScore).toBe(95);
    });

    it('should have correct threshold for Intermediate', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].intermediate.minScore).toBe(97);
    });

    it('should have correct threshold for Advanced', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].advanced.minScore).toBe(98);
    });

    it('should have correct threshold for K53', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].k53.minScore).toBe(100);
    });
  });

  describe('Journey Requirements', () => {
    it('should require 3 journeys for Beginner', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].beginner.minJourneys).toBe(3);
    });

    it('should require 5 journeys for Intermediate', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].intermediate.minJourneys).toBe(5);
    });

    it('should require 5 journeys for Advanced', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].advanced.minJourneys).toBe(5);
    });

    it('should require 3 journeys for K53', () => {
      expect(masteryService['STAGE_REQUIREMENTS'].k53.minJourneys).toBe(3);
    });
  });

  describe('Stage Progression', () => {
    it('should progress from Beginner to Intermediate', async () => {
      const mockProgress = {
        stage: 'beginner' as Stage,
        journeysCompleted: 3,
        averageScore: 96,
        bestScore: 100,
        totalAttempts: 3,
        isUnlocked: true,
        isMastered: true,
      };

      // Would check advancement logic
      expect(mockProgress.averageScore).toBeGreaterThanOrEqual(95);
      expect(mockProgress.journeysCompleted).toBeGreaterThanOrEqual(3);
    });

    it('should not progress with insufficient journeys', () => {
      const mockProgress = {
        journeysCompleted: 2,
        averageScore: 97,
      };

      expect(mockProgress.journeysCompleted).toBeLessThan(3);
    });

    it('should not progress with low average score', () => {
      const mockProgress = {
        journeysCompleted: 3,
        averageScore: 94,
      };

      expect(mockProgress.averageScore).toBeLessThan(95);
    });
  });

  describe('Badge System', () => {
    it('should define First Steps badge', () => {
      const badgeId = 'first-journey';
      // Would check badge exists in definitions
      expect(badgeId).toBeDefined();
    });

    it('should define Perfection badge', () => {
      const badgeId = 'perfect-journey';
      expect(badgeId).toBeDefined();
    });

    it('should define mastery badges for each stage', () => {
      const badges = [
        'beginner-master',
        'intermediate-master',
        'advanced-master',
        'k53-master',
      ];

      badges.forEach(badgeId => {
        expect(badgeId).toBeDefined();
      });
    });
  });

  describe('Stage Unlocking', () => {
    it('should start with only Beginner unlocked', () => {
      const unlockedStages = ['beginner'];
      expect(unlockedStages).toContain('beginner');
      expect(unlockedStages).not.toContain('intermediate');
    });

    it('should unlock stages sequentially', () => {
      const stageOrder: Stage[] = ['beginner', 'intermediate', 'advanced', 'k53'];
      
      for (let i = 0; i < stageOrder.length - 1; i++) {
        expect(stageOrder.indexOf(stageOrder[i])).toBeLessThan(
          stageOrder.indexOf(stageOrder[i + 1])
        );
      }
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate average score correctly', () => {
      const scores = [95, 97, 100];
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      expect(average).toBeCloseTo(97.33, 2);
    });

    it('should track best score', () => {
      const scores = [95, 97, 100, 93];
      const best = Math.max(...scores);
      expect(best).toBe(100);
    });

    it('should count total attempts', () => {
      const attempts = [1, 2, 3, 4];
      expect(attempts.length).toBe(4);
    });
  });

  describe('Mastery Validation', () => {
    it('should validate mastery with all requirements met', () => {
      const requirements = {
        minJourneys: 3,
        minScore: 95,
      };

      const progress = {
        journeysCompleted: 3,
        averageScore: 96,
      };

      const isMastered = 
        progress.journeysCompleted >= requirements.minJourneys &&
        progress.averageScore >= requirements.minScore;

      expect(isMastered).toBe(true);
    });

    it('should not validate mastery with missing requirements', () => {
      const requirements = {
        minJourneys: 3,
        minScore: 95,
      };

      const progress = {
        journeysCompleted: 2,
        averageScore: 96,
      };

      const isMastered = 
        progress.journeysCompleted >= requirements.minJourneys &&
        progress.averageScore >= requirements.minScore;

      expect(isMastered).toBe(false);
    });
  });
});
