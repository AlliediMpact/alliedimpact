import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/v1/events/health/route';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'health-collection-ref'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'health-123' })),
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

describe('POST /api/v1/events/health', () => {
  const mockRequest = (body: any, authHeader: string | null = 'Bearer valid-token') => {
    const headers = new Headers();
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    
    return new NextRequest('http://localhost:3010/api/v1/events/health', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully process valid health event', async () => {
    const healthBody = {
      appId: 'coinbox',
      data: {
        status: 'healthy',
        environment: 'production',
        timestamp: new Date().toISOString(),
        metrics: {
          errorRate: 0.01,
          responseTime: 120,
          activeUsers: 1500,
          requestsPerMinute: 300,
        },
        version: '2.1.0',
      },
    };

    const request = mockRequest(healthBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle app with degraded status', async () => {
    const healthBody = {
      appId: 'sportshub',
      data: {
        status: 'degraded',
        environment: 'production',
        timestamp: new Date().toISOString(),
        metrics: {
          errorRate: 0.05,
          responseTime: 500,
        },
      },
    };

    const request = mockRequest(healthBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should handle app with offline status', async () => {
    const healthBody = {
      appId: 'drivemaster',
      data: {
        status: 'offline',
        environment: 'production',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(healthBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should reject health event with invalid appId', async () => {
    const healthBody = {
      appId: 'invalid-app',
      data: {
        status: 'healthy',
        environment: 'production',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(healthBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_APP_ID');
  });

  it('should reject health event with missing status', async () => {
    const healthBody = {
      appId: 'coinbox',
      data: {
        environment: 'production',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(healthBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_HEALTH_EVENT');
  });

  it('should handle health events from all environments', async () => {
    const environments = ['production', 'staging', 'development'];

    for (const environment of environments) {
      const healthBody = {
        appId: 'coinbox',
        data: {
          status: 'healthy',
          environment,
          timestamp: new Date().toISOString(),
        },
      };

      const request = mockRequest(healthBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });

  it('should accept health events with optional metrics', async () => {
    const healthBody = {
      appId: 'coinbox',
      data: {
        status: 'healthy',
        environment: 'production',
        timestamp: new Date().toISOString(),
        // No metrics provided
      },
    };

    const request = mockRequest(healthBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should accept health events with version', async () => {
    const healthBody = {
      appId: 'coinbox',
      data: {
        status: 'healthy',
        environment: 'production',
        timestamp: new Date().toISOString(),
        version: '2.1.0',
      },
    };

    const request = mockRequest(healthBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
