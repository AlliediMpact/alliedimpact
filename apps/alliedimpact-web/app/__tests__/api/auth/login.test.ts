import { POST } from '@/api/auth/login/route'
import { NextRequest } from 'next/server'
import * as auth from '@allied-impact/auth'
import * as ratelimit from '@allied-impact/shared/ratelimit'

// Mock dependencies
jest.mock('@allied-impact/auth')
jest.mock('@allied-impact/shared/ratelimit')

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 429 if rate limit exceeded', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    mockCheckRateLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Too many requests. Please try again later.')
  })

  it('should return 401 for invalid credentials', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    })

    const mockSignIn = jest.spyOn(auth, 'signIn')
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'))

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBeDefined()
  })

  it('should return 200 with user data for valid credentials', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    })

    const mockUser = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    const mockSignIn = jest.spyOn(auth, 'signIn')
    mockSignIn.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toEqual(mockUser)
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('should enforce rate limiting per email address', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    await POST(request)

    expect(mockCheckRateLimit).toHaveBeenCalledWith('test@example.com', 'login')
  })
})
