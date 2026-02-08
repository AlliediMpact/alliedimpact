/**
 * @jest-environment jsdom
 */

import { POST } from '@/app/api/log-error/route';
import { NextRequest } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('POST /api/log-error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue({} as any);
    mockServerTimestamp.mockReturnValue({} as any);
  });

  const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      headers: {
        get: jest.fn((key: string) => headers[key] || null),
      },
    } as unknown as NextRequest;
  };

  it('should log error successfully with all fields', async () => {
    const errorData = {
      message: 'Test error message',
      stack: 'Error stack trace here',
      digest: 'abc123',
      timestamp: '2024-02-09T10:00:00Z',
      userId: 'user-123',
      page: '/dashboard',
    };

    const request = createMockRequest(errorData, {
      'user-agent': 'Mozilla/5.0 Test Browser',
    });

    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Error logged successfully');

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Test error message',
        stack: 'Error stack trace here',
        digest: 'abc123',
        timestamp: '2024-02-09T10:00:00Z',
        userId: 'user-123',
        page: '/dashboard',
        userAgent: 'Mozilla/5.0 Test Browser',
      })
    );
  });

  it('should handle missing optional fields', async () => {
    const errorData = {
      message: 'Minimal error',
      stack: 'Stack trace',
    };

    const request = createMockRequest(errorData);
    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Minimal error',
        stack: 'Stack trace',
        userId: null,
        page: null,
      })
    );
  });

  it('should generate timestamp if not provided', async () => {
    const errorData = {
      message: 'Error without timestamp',
      stack: 'Stack',
    };

    const request = createMockRequest(errorData);
    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    const before = new Date().toISOString();
    const response = await POST(request);
    const after = new Date().toISOString();

    expect(response.status).toBe(200);

    const callArgs = mockAddDoc.mock.calls[0][1];
    const timestamp = (callArgs as any).timestamp;

    expect(timestamp).toBeDefined();
    expect(timestamp >= before).toBe(true);
    expect(timestamp <= after).toBe(true);
  });

  it('should capture user agent from headers', async () => {
    const errorData = {
      message: 'Test error',
      stack: 'Stack trace',
    };

    const request = createMockRequest(errorData, {
      'user-agent': 'Custom User Agent String/1.0',
    });

    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    await POST(request);

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userAgent: 'Custom User Agent String/1.0',
      })
    );
  });

  it('should handle null user agent', async () => {
    const errorData = {
      message: 'Test error',
      stack: 'Stack trace',
    };

    const request = createMockRequest(errorData, {});

    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    await POST(request);

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userAgent: null,
      })
    );
  });

  it('should return 500 on Firestore error but not throw', async () => {
    const errorData = {
      message: 'Test error',
      stack: 'Stack trace',
    };

    const request = createMockRequest(errorData);

    mockAddDoc.mockRejectedValue(new Error('Firestore error'));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to log error');
  });

  it('should handle malformed JSON gracefully', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it('should log errors with digest for React error boundary', async () => {
    const errorData = {
      message: 'Unhandled error in component',
      stack: 'Component stack trace',
      digest: 'react-error-digest-123',
      page: '/app/page',
    };

    const request = createMockRequest(errorData);
    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        digest: 'react-error-digest-123',
      })
    );
  });

  it('should create document in correct collection', async () => {
    const errorData = {
      message: 'Test error',
      stack: 'Stack',
    };

    const request = createMockRequest(errorData);
    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    await POST(request);

    expect(mockCollection).toHaveBeenCalledWith(db, 'drivemaster_error_logs');
  });

  it('should include serverTimestamp in logged document', async () => {
    const errorData = {
      message: 'Test error',
      stack: 'Stack',
    };

    const request = createMockRequest(errorData);
    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    await POST(request);

    expect(mockServerTimestamp).toHaveBeenCalled();
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        createdAt: expect.anything(),
      })
    );
  });

  it('should handle very long error messages', async () => {
    const longMessage = 'Error: '.repeat(1000);
    const errorData = {
      message: longMessage,
      stack: 'Stack trace',
    };

    const request = createMockRequest(errorData);
    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: longMessage,
      })
    );
  });

  it('should handle special characters in error data', async () => {
    const errorData = {
      message: 'Error with special chars: <script>alert("xss")</script>',
      stack: 'Stack with "quotes" and \'apostrophes\'',
      page: '/page?param=value&other=<test>',
    };

    const request = createMockRequest(errorData);
    mockAddDoc.mockResolvedValue({ id: 'log-123' } as any);

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Error with special chars: <script>alert("xss")</script>',
        page: '/page?param=value&other=<test>',
      })
    );
  });
});
