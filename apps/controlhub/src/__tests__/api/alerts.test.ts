import { NextRequest } from 'next/server';
import { POST } from '../../../app/api/v1/alerts/route';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'alerts-collection-ref'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'alert-123' })),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock API auth functions
jest.mock('@/lib/api-auth', () => ({
  validateApiToken: jest.fn((authHeader, appId) => {
    return authHeader === 'Bearer valid-token' && appId === 'coinbox';
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

describe('POST /api/v1/alerts', () => {
  const mockRequest = (body: any, authHeader: string | null = 'Bearer valid-token') => {
    const headers = new Headers();
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    
    return new NextRequest('http://localhost:3010/api/v1/alerts', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully process valid alert', async () => {
    const alertBody = {
      appId: 'coinbox',
      data: {
        severity: 'high',
        title: 'Suspicious login',
        category: 'security',
        message: 'Multiple failed login attempts detected',
      },
    };

    const request = mockRequest(alertBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.received).toBe(true);
    expect(data.data.alertId).toBe('alert-123');
  });

  it('should reject request with invalid appId', async () => {
    const alertBody = {
      appId: 'invalid-app',
      data: {
        severity: 'high',
        title: 'Test alert',
        category: 'security',
      },
    };

    const request = mockRequest(alertBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_APP_ID');
  });

  it('should reject request with missing appId', async () => {
    const alertBody = {
      data: {
        severity: 'high',
        title: 'Test alert',
        category: 'security',
      },
    };

    const request = mockRequest(alertBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_APP_ID');
  });

  it('should reject request with invalid API token', async () => {
    const alertBody = {
      appId: 'coinbox',
      data: {
        severity: 'high',
        title: 'Test alert',
        category: 'security',
      },
    };

    const request = mockRequest(alertBody, 'Bearer invalid-token');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject request with missing Authorization header', async () => {
    const alertBody = {
      appId: 'coinbox',
      data: {
        severity: 'high',
        title: 'Test alert',
        category: 'security',
      },
    };

    const request = mockRequest(alertBody, null);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject alert with missing severity', async () => {
    const alertBody = {
      appId: 'coinbox',
      data: {
        title: 'Test alert',
        category: 'security',
      },
    };

    const request = mockRequest(alertBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_ALERT');
  });

  it('should reject alert with missing title', async () => {
    const alertBody = {
      appId: 'coinbox',
      data: {
        severity: 'high',
        category: 'security',
      },
    };

    const request = mockRequest(alertBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_ALERT');
  });

  it('should reject alert with missing category', async () => {
    const alertBody = {
      appId: 'coinbox',
      data: {
        severity: 'high',
        title: 'Test alert',
      },
    };

    const request = mockRequest(alertBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_ALERT');
  });

  it('should handle critical alerts', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const alertBody = {
      appId: 'coinbox',
      data: {
        severity: 'critical',
        title: 'Database connection lost',
        category: 'system',
        message: 'Cannot connect to database',
      },
    };

    const request = mockRequest(alertBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('🚨 CRITICAL ALERT'));

    consoleSpy.mockRestore();
  });

  it('should handle different alert severities', async () => {
    const severities = ['low', 'medium', 'high', 'critical'];

    for (const severity of severities) {
      const alertBody = {
        appId: 'coinbox',
        data: {
          severity,
          title: `${severity} alert`,
          category: 'security',
        },
      };

      const request = mockRequest(alertBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });

  it('should handle different alert categories', async () => {
    const categories = ['security', 'system', 'compliance', 'performance'];

    for (const category of categories) {
      const alertBody = {
        appId: 'coinbox',
        data: {
          severity: 'medium',
          title: `${category} alert`,
          category,
        },
      };

      const request = mockRequest(alertBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });
});
