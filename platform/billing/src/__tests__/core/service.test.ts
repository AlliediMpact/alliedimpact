import { BillingService } from '../../core/service'
import { StripeProvider } from '../../providers/stripe'
import { PayFastProvider } from '../../providers/payfast'

// Mock payment providers
jest.mock('../../providers/stripe')
jest.mock('../../providers/payfast')

describe('BillingService', () => {
  let billingService: BillingService

  beforeEach(() => {
    billingService = new BillingService()
    jest.clearAllMocks()
  })

  describe('createSubscription', () => {
    it('should create subscription with Stripe provider', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        customer: 'cus_123',
        planId: 'plan_123',
      }

      const mockStripeProvider = {
        createSubscription: jest.fn().mockResolvedValue(mockSubscription),
      }

      ;(StripeProvider as jest.Mock).mockImplementation(() => mockStripeProvider)

      const result = await billingService.createSubscription({
        userId: 'user123',
        planId: 'plan_123',
        provider: 'stripe',
      })

      expect(result).toEqual(mockSubscription)
      expect(mockStripeProvider.createSubscription).toHaveBeenCalled()
    })

    it('should create subscription with PayFast provider', async () => {
      const mockSubscription = {
        id: 'pf_123',
        status: 'active',
        customer: 'user123',
        planId: 'plan_123',
      }

      const mockPayFastProvider = {
        createSubscription: jest.fn().mockResolvedValue(mockSubscription),
      }

      ;(PayFastProvider as jest.Mock).mockImplementation(() => mockPayFastProvider)

      const result = await billingService.createSubscription({
        userId: 'user123',
        planId: 'plan_123',
        provider: 'payfast',
      })

      expect(result).toEqual(mockSubscription)
      expect(mockPayFastProvider.createSubscription).toHaveBeenCalled()
    })

    it('should throw error for unsupported provider', async () => {
      await expect(
        billingService.createSubscription({
          userId: 'user123',
          planId: 'plan_123',
          provider: 'unsupported' as any,
        })
      ).rejects.toThrow()
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const mockStripeProvider = {
        cancelSubscription: jest.fn().mockResolvedValue({ status: 'canceled' }),
      }

      ;(StripeProvider as jest.Mock).mockImplementation(() => mockStripeProvider)

      await expect(
        billingService.cancelSubscription('sub_123', 'stripe')
      ).resolves.not.toThrow()

      expect(mockStripeProvider.cancelSubscription).toHaveBeenCalledWith('sub_123')
    })

    it('should handle cancellation errors', async () => {
      const mockStripeProvider = {
        cancelSubscription: jest.fn().mockRejectedValue(new Error('Subscription not found')),
      }

      ;(StripeProvider as jest.Mock).mockImplementation(() => mockStripeProvider)

      await expect(
        billingService.cancelSubscription('sub_invalid', 'stripe')
      ).rejects.toThrow()
    })
  })

  describe('processPayment', () => {
    it('should process one-time payment', async () => {
      const mockPayment = {
        id: 'pay_123',
        amount: 5000,
        currency: 'ZAR',
        status: 'succeeded',
      }

      const mockPayFastProvider = {
        processPayment: jest.fn().mockResolvedValue(mockPayment),
      }

      ;(PayFastProvider as jest.Mock).mockImplementation(() => mockPayFastProvider)

      const result = await billingService.processPayment({
        userId: 'user123',
        amount: 5000,
        currency: 'ZAR',
        provider: 'payfast',
      })

      expect(result).toEqual(mockPayment)
      expect(mockPayFastProvider.processPayment).toHaveBeenCalled()
    })
  })
})
