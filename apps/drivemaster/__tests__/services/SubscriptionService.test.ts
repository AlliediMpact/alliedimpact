/**
 * @jest-environment jsdom
 */

import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockTimestamp = Timestamp as jest.Mocked<typeof Timestamp>;

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  const userId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionService(userId);
    
    // Mock Timestamp.fromDate
    mockTimestamp.fromDate = jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })) as any;
  });

  describe('getSubscriptionInfo', () => {
    it('should throw error if user not found', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      await expect(service.getSubscriptionInfo()).rejects.toThrow('User not found');
    });

    it('should return free tier info with default values', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({}),
      } as any);

      const info = await service.getSubscriptionInfo();

      expect(info.tier).toBe('free');
      expect(info.unlockedStages).toEqual(['beginner']);
      expect(info.journeysToday).toBe(0);
      expect(info.maxJourneysPerDay).toBe(3);
      expect(info.canAccessStage('beginner')).toBe(true);
      expect(info.canAccessStage('intermediate')).toBe(false);
    });

    it('should calculate journeys today correctly for same day', async () => {
      const today = new Date();
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'free',
          journeysToday: 2,
          lastJourneyDate: { toDate: () => today },
        }),
      } as any);

      const info = await service.getSubscriptionInfo();

      expect(info.journeysToday).toBe(2);
      expect(info.maxJourneysPerDay).toBe(3);
    });

    it('should reset journeys today for different day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'free',
          journeysToday: 3,
          lastJourneyDate: { toDate: () => yesterday },
        }),
      } as any);

      const info = await service.getSubscriptionInfo();

      expect(info.journeysToday).toBe(0);
    });

    it('should return trial info when tier is trial', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const activatedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'trial',
          emailVerified: true,
          hasUsedTrial: true,
          trialActivatedAt: { toDate: () => activatedAt },
          trialExpiresAt: { toDate: () => expiresAt },
          unlockedStages: ['beginner', 'intermediate', 'advanced', 'k53'],
        }),
      } as any);

      const info = await service.getSubscriptionInfo();

      expect(info.tier).toBe('trial');
      expect(info.trialInfo).toBeDefined();
      expect(info.trialInfo?.isActive).toBe(true);
      expect(info.trialInfo?.daysRemaining).toBe(5);
      expect(info.maxJourneysPerDay).toBe(Infinity);
    });

    it('should return paid tier info correctly', async () => {
      const paidAt = new Date('2024-01-15');
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'paid',
          paidAt: { toDate: () => paidAt },
          unlockedStages: ['beginner', 'intermediate', 'advanced', 'k53'],
        }),
      } as any);

      const info = await service.getSubscriptionInfo();

      expect(info.tier).toBe('paid');
      expect(info.paidAt).toEqual(paidAt);
      expect(info.maxJourneysPerDay).toBe(Infinity);
      expect(info.canAccessStage('k53')).toBe(true);
    });
  });

  describe('checkTrialEligibility', () => {
    it('should return not eligible if user not found', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await service.checkTrialEligibility();

      expect(result.isEligible).toBe(false);
      expect(result.hasUsedTrial).toBe(false);
      expect(result.ineligibilityReason).toBe('User not found');
    });

    it('should return not eligible if trial already used', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          hasUsedTrial: true,
          emailVerified: true,
        }),
      } as any);

      const result = await service.checkTrialEligibility();

      expect(result.isEligible).toBe(false);
      expect(result.hasUsedTrial).toBe(true);
      expect(result.ineligibilityReason).toBe('Trial already used');
    });

    it('should return not eligible if email not verified', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          hasUsedTrial: false,
          emailVerified: false,
        }),
      } as any);

      const result = await service.checkTrialEligibility();

      expect(result.isEligible).toBe(false);
      expect(result.ineligibilityReason).toBe('Email not verified');
    });

    it('should return active trial info if trial is active', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const activatedAt = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'trial',
          emailVerified: true,
          hasUsedTrial: false,
          trialActivatedAt: { toDate: () => activatedAt },
          trialExpiresAt: { toDate: () => expiresAt },
        }),
      } as any);

      const result = await service.checkTrialEligibility();

      expect(result.isActive).toBe(true);
      expect(result.daysRemaining).toBe(3);
      expect(result.activatedAt).toEqual(activatedAt);
      expect(result.expiresAt).toEqual(expiresAt);
    });

    it('should downgrade from expired trial', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({
            subscriptionTier: 'trial',
            emailVerified: true,
            hasUsedTrial: false,
            trialExpiresAt: { toDate: () => expiresAt },
          }),
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({
            subscriptionTier: 'trial',
            unlockedStages: ['beginner', 'intermediate'],
            beginnerMasteryDate: new Date(),
          }),
        } as any);

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await service.checkTrialEligibility();

      expect(result.isActive).toBe(false);
      expect(result.ineligibilityReason).toBe('Trial expired');
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should return eligible if all conditions met', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          hasUsedTrial: false,
          emailVerified: true,
        }),
      } as any);

      const result = await service.checkTrialEligibility();

      expect(result.isEligible).toBe(true);
      expect(result.isActive).toBe(false);
      expect(result.hasUsedTrial).toBe(false);
    });
  });

  describe('activateTrial', () => {
    it('should throw error if not eligible', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          hasUsedTrial: true,
          emailVerified: true,
        }),
      } as any);

      await expect(service.activateTrial()).rejects.toThrow('Trial already used');
    });

    it('should activate trial successfully', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          hasUsedTrial: false,
          emailVerified: true,
        }),
      } as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await service.activateTrial();

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          subscriptionTier: 'trial',
          hasUsedTrial: true,
          unlockedStages: ['beginner', 'intermediate', 'advanced', 'k53'],
        })
      );
    });
  });

  describe('upgradeToPaid', () => {
    it('should upgrade to paid subscription', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const paymentRef = 'PAY-12345';
      const result = await service.upgradeToPaid(paymentRef);

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          subscriptionTier: 'paid',
          paymentReference: paymentRef,
          unlockedStages: ['beginner', 'intermediate', 'advanced', 'k53'],
        })
      );
    });
  });

  describe('canStartJourney', () => {
    it('should allow journey for free tier under daily limit', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'free',
          journeysToday: 2,
          lastJourneyDate: { toDate: () => new Date() },
        }),
      } as any);

      const result = await service.canStartJourney();

      expect(result.allowed).toBe(true);
    });

    it('should deny journey for free tier at daily limit', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'free',
          journeysToday: 3,
          lastJourneyDate: { toDate: () => new Date() },
        }),
      } as any);

      const result = await service.canStartJourney();

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Daily limit reached');
    });

    it('should always allow journey for paid tier', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'paid',
          journeysToday: 100,
        }),
      } as any);

      const result = await service.canStartJourney();

      expect(result.allowed).toBe(true);
    });
  });

  describe('recordJourneyStart', () => {
    it('should increment journey count for same day', async () => {
      const today = new Date();
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          journeysToday: 2,
          lastJourneyDate: { toDate: () => today },
        }),
      } as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await service.recordJourneyStart();

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          journeysToday: 3,
        })
      );
    });

    it('should reset journey count for new day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          journeysToday: 3,
          lastJourneyDate: { toDate: () => yesterday },
        }),
      } as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await service.recordJourneyStart();

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          journeysToday: 1,
        })
      );
    });
  });

  describe('getPayFastPaymentData', () => {
    it('should return correct payment data', () => {
      const returnUrl = 'https://app.com/success';
      const cancelUrl = 'https://app.com/cancel';
      const notifyUrl = 'https://app.com/notify';

      const data = service.getPayFastPaymentData(returnUrl, cancelUrl, notifyUrl);

      expect(data.amount).toBe('99.00');
      expect(data.item_name).toBe('DriveMaster Lifetime Access');
      expect(data.return_url).toBe(returnUrl);
      expect(data.cancel_url).toBe(cancelUrl);
      expect(data.notify_url).toBe(notifyUrl);
      expect(data.m_payment_id).toBe(userId);
      expect(data.custom_str1).toBe(userId);
    });
  });

  describe('isTrialExpiringSoon', () => {
    it('should return true if trial expires within 2 days', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000);

      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'trial',
          emailVerified: true,
          hasUsedTrial: true,
          trialExpiresAt: { toDate: () => expiresAt },
        }),
      } as any);

      const result = await service.isTrialExpiringSoon();

      expect(result).toBe(true);
    });

    it('should return false if trial not expiring soon', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'trial',
          emailVerified: true,
          hasUsedTrial: true,
          trialExpiresAt: { toDate: () => expiresAt },
        }),
      } as any);

      const result = await service.isTrialExpiringSoon();

      expect(result).toBe(false);
    });

    it('should return false for non-trial tiers', async () => {
      mockDoc.mockReturnValue({ id: userId } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          subscriptionTier: 'paid',
        }),
      } as any);

      const result = await service.isTrialExpiringSoon();

      expect(result).toBe(false);
    });
  });

  describe('getTier Benefits', () => {
    it('should return free tier benefits', () => {
      const benefits = service.getTierBenefits('free');

      expect(benefits).toContain('Access to Beginner stage only');
      expect(benefits).toContain('3 journeys per day');
      expect(benefits.length).toBeGreaterThan(0);
    });

    it('should return trial tier benefits', () => {
      const benefits = service.getTierBenefits('trial');

      expect(benefits).toContain('Full access to all stages');
      expect(benefits).toContain('Valid for 7 days');
    });

    it('should return paid tier benefits', () => {
      const benefits = service.getTierBenefits('paid');

      expect(benefits).toContain('Lifetime access to all stages');
      expect(benefits).toContain('Priority support');
    });
  });
});
