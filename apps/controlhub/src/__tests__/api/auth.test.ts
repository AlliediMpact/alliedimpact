import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/v1/events/auth/route';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'auth-events-collection-ref'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'auth-event-123' })),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock API auth functions
jest.mock('@/lib/api-auth', () => ({
  validateApiToken: jest.fn((authHeader, appId) => {
    return authHeader === 'Bearer valid-token';
  }),
  extractAppId: jest.fn((body) => body?.appId || null),
  apiError: jest.fn((code, message, status) => 
    new Response(JSON.stringify({ success: false, error: { code, message } }), { status })
  ),
  apiSuccess: jest.fn((data) => 
    new Response(JSON.stringify({ success: true, data }), { status: 200 })
  ),
}));

// Mock app config
jest.mock('@/config/apps', () => ({
  isValidAppId: jest.fn((appId) => ['coinbox', 'sportshub', 'drivemaster', 'edutech', 'portal', 'myprojects'].includes(appId)),
}));

describe('POST /api/v1/events/auth', () => {
  const mockRequest = (body: any, authHeader: string | null = 'Bearer valid-token') => {
    const headers = new Headers();
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    
    return new NextRequest('http://localhost:3010/api/v1/events/auth', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully process login success event', async () => {
    const authBody = {
      appId: 'coinbox',
      data: {
        event: 'login_success',
        userId: 'user-123',
        timestamp: new Date().toISOString(),
        metadata: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          location: 'Cape Town, South Africa',
          deviceType: 'desktop',
        },
      },
    };

    const request = mockRequest(authBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should process login failure event', async () => {
    const authBody = {
      appId: 'sportshub',
      data: {
        event: 'login_failure',
        timestamp: new Date().toISOString(),
        metadata: {
          ip: '192.168.1.1',
          failureReason: 'Invalid password',
        },
      },
    };

    const request = mockRequest(authBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should process logout event', async () => {
    const authBody = {
      appId: 'edutech',
      data: {
        event: 'logout',
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(authBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should process MFA events', async () => {
    const mfaEvents = ['mfa_required', 'mfa_success', 'mfa_failure'];

    for (const event of mfaEvents) {
      const authBody = {
        appId: 'coinbox',
        data: {
          event,
          userId: 'user-123',
          timestamp: new Date().toISOString(),
        },
      };

      const request = mockRequest(authBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });

  it('should handle auth events with anomaly detection', async () => {
    const authBody = {
      appId: 'coinbox',
      data: {
        event: 'login_success',
        userId: 'user-123',
        timestamp: new Date().toISOString(),
        metadata: {
          ip: '192.168.1.1',
          anomalyDetected: true,
        },
      },
    };

    const request = mockRequest(authBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should reject auth event with invalid appId', async () => {
    const authBody = {
      appId: 'invalid-app',
      data: {
        event: 'login_success',
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(authBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_APP_ID');
  });

  it('should reject auth event with missing event type', async () => {
    const authBody = {
      appId: 'coinbox',
      data: {
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(authBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_AUTH_EVENT');
  });

  it('should handle auth events from all device types', async () => {
    const deviceTypes = ['mobile', 'tablet', 'desktop'];

    for (const deviceType of deviceTypes) {
      const authBody = {
        appId: 'coinbox',
        data: {
          event: 'login_success',
          userId: 'user-123',
          timestamp: new Date().toISOString(),
          metadata: { deviceType },
        },
      };

      const request = mockRequest(authBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });
});
