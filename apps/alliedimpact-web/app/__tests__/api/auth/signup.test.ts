import { POST } from '@/api/auth/signup/route'
import { NextRequest } from 'next/server'
import * as auth from '@allied-impact/auth'
import * as ratelimit from '@allied-impact/shared/ratelimit'

jest.mock('@allied-impact/auth')
jest.mock('@allied-impact/shared/ratelimit')

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 429 if rate limit exceeded', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    mockCheckRateLimit.mockResolvedValue({
      success: false,
      limit: 3,
      remaining: 0,
      reset: Date.now() + 3600000,
    })

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Too many requests. Please try again later.')
  })

  it('should return 400 for missing required fields', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 3600000,
    })

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        // Missing password and displayName
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for weak password', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 3600000,
    })

    const mockCreateUser = jest.spyOn(auth, 'createPlatformUser')
    mockCreateUser.mockRejectedValue(new Error('Password should be at least 6 characters'))

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: '123',
        displayName: 'New User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Password')
  })

  it('should return 200 with user data for successful signup', async () => {
    const mockCheckRateLimit = jest.spyOn(ratelimit, 'checkRateLimit')
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 3600000,
    })

    const mockUser = {
      uid: 'user456',
      email: 'newuser@example.com',
      displayName: 'New User',
    }

    const mockCreateUser = jest.spyOn(auth, 'createPlatformUser')
    mockCreateUser.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toEqual(mockUser)
    expect(mockCreateUser).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      displayName: 'New User',
    })
  })
})
