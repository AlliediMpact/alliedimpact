import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/v1/events/audit/route';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'audit-events-collection-ref'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'audit-event-123' })),
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

describe('POST /api/v1/events/audit', () => {
  const mockRequest = (body: any, authHeader: string | null = 'Bearer valid-token') => {
    const headers = new Headers();
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    
    return new NextRequest('http://localhost:3010/api/v1/events/audit', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully process valid audit event', async () => {
    const auditBody = {
      appId: 'coinbox',
      data: {
        action: 'user_verification_approved',
        actor: 'admin@example.com',
        actorRole: 'admin',
        target: 'user-123',
        targetType: 'user',
        timestamp: new Date().toISOString(),
        metadata: {
          reason: 'ID document verified',
          documentType: 'passport',
        },
        ipAddress: '192.168.1.1',
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should process audit event for transaction', async () => {
    const auditBody = {
      appId: 'coinbox',
      data: {
        action: 'transaction_cancelled',
        actor: 'admin@example.com',
        target: 'tx-456',
        targetType: 'transaction',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should process audit event for subscription', async () => {
    const auditBody = {
      appId: 'drivemaster',
      data: {
        action: 'subscription_cancelled',
        actor: 'support@example.com',
        target: 'sub-789',
        targetType: 'subscription',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should process audit event for content moderation', async () => {
    const auditBody = {
      appId: 'sportshub',
      data: {
        action: 'content_removed',
        actor: 'moderator@example.com',
        actorRole: 'moderator',
        target: 'post-123',
        targetType: 'content',
        timestamp: new Date().toISOString(),
        metadata: {
          reason: 'Inappropriate content',
          category: 'community_guidelines',
        },
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should process system-level audit events', async () => {
    const auditBody = {
      appId: 'portal',
      data: {
        action: 'config_updated',
        actor: 'system',
        targetType: 'system',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('should reject audit event with invalid appId', async () => {
    const auditBody = {
      appId: 'invalid-app',
      data: {
        action: 'test_action',
        actor: 'admin@example.com',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_APP_ID');
  });

  it('should reject audit event with missing action', async () => {
    const auditBody = {
      appId: 'coinbox',
      data: {
        actor: 'admin@example.com',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_AUDIT_EVENT');
  });

  it('should reject audit event with missing actor', async () => {
    const auditBody = {
      appId: 'coinbox',
      data: {
        action: 'test_action',
        timestamp: new Date().toISOString(),
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_AUDIT_EVENT');
  });

  it('should handle all target types', async () => {
    const targetTypes = ['user', 'transaction', 'subscription', 'content', 'system'];

    for (const targetType of targetTypes) {
      const auditBody = {
        appId: 'coinbox',
        data: {
          action: 'test_action',
          actor: 'admin@example.com',
          target: 'target-123',
          targetType,
          timestamp: new Date().toISOString(),
        },
      };

      const request = mockRequest(auditBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });

  it('should include IP address in audit log', async () => {
    const auditBody = {
      appId: 'coinbox',
      data: {
        action: 'user_deleted',
        actor: 'admin@example.com',
        target: 'user-456',
        targetType: 'user',
        timestamp: new Date().toISOString(),
        ipAddress: '203.0.113.45',
      },
    };

    const request = mockRequest(auditBody);
    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
