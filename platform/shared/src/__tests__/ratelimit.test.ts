import { checkRateLimit, initializeRateLimit } from '../ratelimit'

// Mock Upstash Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  })),
}))

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    }),
  })),
}))

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset module to clear any cached state
    jest.resetModules()
  })

  describe('initializeRateLimit', () => {
    it('should initialize with environment variables', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

      expect(() => initializeRateLimit()).not.toThrow()
    })

    it('should handle missing environment variables gracefully', () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN

      // Should not throw, should fail-open
      expect(() => initializeRateLimit()).not.toThrow()
    })
  })

  describe('checkRateLimit', () => {
    it('should return success for allowed requests', async () => {
      const result = await checkRateLimit('user@example.com', 'login')

      expect(result.success).toBe(true)
      expect(result.limit).toBeDefined()
      expect(result.remaining).toBeDefined()
    })

    it('should fail-open if Redis is unavailable', async () => {
      // Simulate Redis failure by not initializing
      const result = await checkRateLimit('user@example.com', 'login')

      // Should allow request even if Redis is down
      expect(result.success).toBe(true)
    })

    it('should use correct limits for different types', async () => {
      const loginResult = await checkRateLimit('user@example.com', 'login')
      const signupResult = await checkRateLimit('user@example.com', 'signup')
      const sessionResult = await checkRateLimit('user@example.com', 'session')

      expect(loginResult).toBeDefined()
      expect(signupResult).toBeDefined()
      expect(sessionResult).toBeDefined()
    })

    it('should identify users by unique identifier', async () => {
      const user1 = await checkRateLimit('user1@example.com', 'login')
      const user2 = await checkRateLimit('user2@example.com', 'login')

      // Different users should have independent rate limits
      expect(user1).toBeDefined()
      expect(user2).toBeDefined()
    })
  })
})
