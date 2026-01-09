import { logger } from '@/lib/logger';

describe('ProductionLogger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should include metadata in info logs', () => {
      const metadata = { userId: '123', action: 'test' };
      logger.info('Test with metadata', { metadata });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should include timestamp in logs', () => {
      logger.info('Test timestamp');
      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('timestamp');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should include metadata in warnings', () => {
      const metadata = { code: 'WARN_001' };
      logger.warn('Warning with metadata', { metadata });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should include level in warning logs', () => {
      logger.warn('Test level');
      const logCall = consoleWarnSpy.mock.calls[0][0];
      expect(logCall).toContain('warn');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', {}, error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include stack trace for errors', () => {
      const error = new Error('Test error');
      logger.error('Error with stack', {}, error);
      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain('stack');
    });

    it('should handle errors without stack traces', () => {
      const error = { message: 'Error without stack' };
      logger.error('Error without stack', {}, error as Error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test debug message');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      logger.debug('Test debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('structured logging', () => {
    it('should include all required fields', () => {
      logger.info('Structured log', {
        action: 'test_action',
        metadata: { key: 'value' },
      });

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('level');
      expect(logCall).toContain('message');
      expect(logCall).toContain('timestamp');
    });

    it('should handle empty metadata', () => {
      logger.info('No metadata');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle complex metadata objects', () => {
      const complexMetadata = {
        user: { id: '123', name: 'Test User' },
        nested: { deep: { value: true } },
        array: [1, 2, 3],
      };

      logger.info('Complex metadata', { metadata: complexMetadata });
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
