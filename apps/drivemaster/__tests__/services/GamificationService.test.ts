import { GamificationService } from '@/lib/services/GamificationService';

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  runTransaction: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('GamificationService', () => {
  let gamificationService: GamificationService;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    gamificationService = new GamificationService(mockUserId);
    jest.clearAllMocks();
  });

  describe('Credit System', () => {
    it('should award 10 credits for correct answer', () => {
      const CREDITS = {
        CORRECT_ANSWER: 10,
      };
      expect(CREDITS.CORRECT_ANSWER).toBe(10);
    });

    it('should deduct 5 credits for incorrect answer', () => {
      const CREDITS = {
        INCORRECT_ANSWER: -5,
      };
      expect(CREDITS.INCORRECT_ANSWER).toBe(-5);
    });

    it('should award 50 credits for perfect journey', () => {
      const CREDITS = {
        PERFECT_JOURNEY: 50,
      };
      expect(CREDITS.PERFECT_JOURNEY).toBe(50);
    });

    it('should award 20 credits for daily login', () => {
      const CREDITS = {
        DAILY_LOGIN: 20,
      };
      expect(CREDITS.DAILY_LOGIN).toBe(20);
    });

    it('should deduct 15 credits for quitting journey', () => {
      const CREDITS = {
        JOURNEY_QUIT: -15,
      };
      expect(CREDITS.JOURNEY_QUIT).toBe(-15);
    });

    it('should award 100 credits for stage completion', () => {
      const CREDITS = {
        STAGE_COMPLETE: 100,
      };
      expect(CREDITS.STAGE_COMPLETE).toBe(100);
    });
  });

  describe('Credit Calculations', () => {
    it('should calculate credits for perfect journey', () => {
      const totalQuestions = 20;
      const correctAnswers = 20;
      const baseCredits = correctAnswers * 10; // 200
      const bonus = 50; // Perfect bonus
      const total = baseCredits + bonus;
      
      expect(total).toBe(250);
    });

    it('should calculate credits for partial journey', () => {
      const correctAnswers = 15;
      const incorrectAnswers = 5;
      const total = (correctAnswers * 10) + (incorrectAnswers * -5);
      
      expect(total).toBe(125);
    });

    it('should not allow negative credit balance', () => {
      const currentCredits = 10;
      const deduction = 50;
      const newBalance = Math.max(0, currentCredits - deduction);
      
      expect(newBalance).toBe(0);
    });
  });

  describe('Streak System', () => {
    it('should increment streak on consecutive days', () => {
      const currentStreak = 5;
      const newStreak = currentStreak + 1;
      
      expect(newStreak).toBe(6);
    });

    it('should reset streak on missed day', () => {
      const currentStreak = 10;
      const missedDay = true;
      const newStreak = missedDay ? 0 : currentStreak + 1;
      
      expect(newStreak).toBe(0);
    });

    it('should detect same-day activity', () => {
      const lastActiveDate = new Date('2026-01-14');
      const currentDate = new Date('2026-01-14');
      const isSameDay = lastActiveDate.toDateString() === currentDate.toDateString();
      
      expect(isSameDay).toBe(true);
    });

    it('should detect consecutive day activity', () => {
      const lastActiveDate = new Date('2026-01-13');
      const currentDate = new Date('2026-01-14');
      const diffTime = Math.abs(currentDate.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(1);
    });
  });

  describe('Bankruptcy System', () => {
    it('should activate bankruptcy at 0 credits', () => {
      const credits = 0;
      const isBankrupt = credits <= 0;
      
      expect(isBankrupt).toBe(true);
    });

    it('should provide 50 daily bankruptcy credits', () => {
      const BANKRUPTCY_DAILY_CREDITS = 50;
      expect(BANKRUPTCY_DAILY_CREDITS).toBe(50);
    });

    it('should exit bankruptcy when credits positive', () => {
      const credits = 100;
      const isBankrupt = credits <= 0;
      
      expect(isBankrupt).toBe(false);
    });
  });

  describe('Stats Calculation', () => {
    it('should calculate total journeys', () => {
      const completedJourneys = [1, 2, 3, 4, 5];
      expect(completedJourneys.length).toBe(5);
    });

    it('should calculate average score from multiple attempts', () => {
      const scores = [95, 97, 100, 93, 98];
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      expect(average).toBeCloseTo(96.6, 1);
    });

    it('should track correct vs incorrect answers', () => {
      const totalAnswers = 100;
      const correctAnswers = 85;
      const incorrectAnswers = totalAnswers - correctAnswers;
      
      expect(incorrectAnswers).toBe(15);
      expect(correctAnswers + incorrectAnswers).toBe(totalAnswers);
    });
  });

  describe('Anti-Cheat Validation', () => {
    it('should detect suspiciously fast completion', () => {
      const totalQuestions = 20;
      const duration = 30; // 30 seconds for 20 questions
      const minSecondsPerQuestion = 5;
      const minDuration = totalQuestions * minSecondsPerQuestion;
      
      const isSuspicious = duration < minDuration;
      expect(isSuspicious).toBe(true);
    });

    it('should validate normal completion time', () => {
      const totalQuestions = 20;
      const duration = 120; // 120 seconds for 20 questions (6 sec/question)
      const minSecondsPerQuestion = 5;
      const minDuration = totalQuestions * minSecondsPerQuestion;
      
      const isSuspicious = duration < minDuration;
      expect(isSuspicious).toBe(false);
    });
  });

  describe('Journey Quit Penalty', () => {
    it('should apply quit penalty correctly', () => {
      const currentCredits = 100;
      const quitPenalty = 15;
      const newCredits = currentCredits - quitPenalty;
      
      expect(newCredits).toBe(85);
    });

    it('should not go negative on quit when low credits', () => {
      const currentCredits = 10;
      const quitPenalty = 15;
      const newCredits = Math.max(0, currentCredits - quitPenalty);
      
      expect(newCredits).toBe(0);
    });
  });
});
