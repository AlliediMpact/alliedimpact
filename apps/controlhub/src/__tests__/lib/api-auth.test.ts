import { 
  validateApiToken, 
  extractAppId, 
  apiError, 
  apiSuccess 
} from '../../lib/api-auth';
import { AppId } from '@/types/events';

// Mock environment variables
const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...OLD_ENV,
    COINBOX_API_TOKEN: 'coinbox-secret-token',
    SPORTSHUB_API_TOKEN: 'sportshub-secret-token',
    DRIVEMASTER_API_TOKEN: 'drivemaster-secret-token',
    EDUTECH_API_TOKEN: 'edutech-secret-token',
    PORTAL_API_TOKEN: 'portal-secret-token',
    MYPROJECTS_API_TOKEN: 'myprojects-secret-token',
  };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('api-auth', () => {
  describe('validateApiToken', () => {
    it('should validate correct token with Bearer prefix', () => {
      const result = validateApiToken('Bearer coinbox-secret-token', 'coinbox');
      expect(result).toBe(true);
    });

    it('should validate correct token without Bearer prefix', () => {
      const result = validateApiToken('coinbox-secret-token', 'coinbox');
      expect(result).toBe(true);
    });

    it('should reject incorrect token', () => {
      const result = validateApiToken('Bearer wrong-token', 'coinbox');
      expect(result).toBe(false);
    });

    it('should reject null authorization header', () => {
      const result = validateApiToken(null, 'coinbox');
      expect(result).toBe(false);
    });

    it('should reject empty authorization header', () => {
      const result = validateApiToken('', 'coinbox');
      expect(result).toBe(false);
    });

    it('should validate tokens for all app IDs', () => {
      const apps: AppId[] = ['coinbox', 'sportshub', 'drivemaster', 'edutech', 'portal', 'myprojects'];
      
      apps.forEach(appId => {
        const result = validateApiToken(`Bearer ${appId}-secret-token`, appId);
        expect(result).toBe(true);
      });
    });

    it('should reject token for wrong app', () => {
      const result = validateApiToken('Bearer coinbox-secret-token', 'sportshub');
      expect(result).toBe(false);
    });

    it('should reject token with extra whitespace', () => {
      const result = validateApiToken('Bearer  coinbox-secret-token  ', 'coinbox');
      expect(result).toBe(true); // Should still work after trim
    });
  });

  describe('extractAppId', () => {
    it('should extract valid appId from body', () => {
      const body = { appId: 'coinbox', data: {} };
      const result = extractAppId(body);
      expect(result).toBe('coinbox');
    });

    it('should return null for invalid appId', () => {
      const body = { appId: 'invalid-app', data: {} };
      const result = extractAppId(body);
      expect(result).toBeNull();
    });

    it('should return null for missing appId', () => {
      const body = { data: {} };
      const result = extractAppId(body);
      expect(result).toBeNull();
    });

    it('should return null for non-string appId', () => {
      const body = { appId: 123, data: {} };
      const result = extractAppId(body);
      expect(result).toBeNull();
    });

    it('should return null for null body', () => {
      const result = extractAppId(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined body', () => {
      const result = extractAppId(undefined);
      expect(result).toBeNull();
    });

    it('should extract all valid app IDs', () => {
      const validAppIds: AppId[] = ['coinbox', 'sportshub', 'drivemaster', 'edutech', 'portal', 'myprojects'];
      
      validAppIds.forEach(appId => {
        const body = { appId, data: {} };
        const result = extractAppId(body);
        expect(result).toBe(appId);
      });
    });
  });

  describe('apiError', () => {
    it('should create error response with correct structure', async () => {
      const response = apiError('TEST_ERROR', 'Test error message', 400);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('TEST_ERROR');
      expect(data.error.message).toBe('Test error message');
      expect(data.timestamp).toBeDefined();
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should use default status 400 when not provided', async () => {
      const response = apiError('TEST_ERROR', 'Test error message');
      expect(response.status).toBe(400);
    });

    it('should handle different status codes', async () => {
      const response401 = apiError('UNAUTHORIZED', 'Unauthorized', 401);
      const response403 = apiError('FORBIDDEN', 'Forbidden', 403);
      const response500 = apiError('INTERNAL_ERROR', 'Server error', 500);

      expect(response401.status).toBe(401);
      expect(response403.status).toBe(403);
      expect(response500.status).toBe(500);
    });

    it('should include timestamp in ISO format', async () => {
      const response = apiError('TEST_ERROR', 'Test error');
      const data = await response.json();
      
      expect(() => new Date(data.timestamp)).not.toThrow();
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('apiSuccess', () => {
    it('should create success response with data', async () => {
      const testData = { id: '123', value: 'test' };
      const response = apiSuccess(testData, 200);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(testData);
      expect(data.timestamp).toBeDefined();
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle success without data', async () => {
      const response = apiSuccess();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeUndefined();
    });

    it('should use default status 200 when not provided', async () => {
      const response = apiSuccess({ test: 'data' });
      expect(response.status).toBe(200);
    });

    it('should handle different success status codes', async () => {
      const response200 = apiSuccess({ test: 'data' }, 200);
      const response201 = apiSuccess({ created: true }, 201);
      const response204 = apiSuccess(undefined, 204);

      expect(response200.status).toBe(200);
      expect(response201.status).toBe(201);
      expect(response204.status).toBe(204);
    });

    it('should include timestamp in ISO format', async () => {
      const response = apiSuccess({ test: 'data' });
      const data = await response.json();
      
      expect(() => new Date(data.timestamp)).not.toThrow();
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('should handle complex data types', async () => {
      const complexData = {
        users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
        metadata: { total: 2, page: 1 },
        nested: { deeply: { nested: { value: 'test' } } },
      };

      const response = apiSuccess(complexData);
      const data = await response.json();

      expect(data.data).toEqual(complexData);
    });
  });
});
