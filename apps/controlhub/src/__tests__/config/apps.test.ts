import { isValidAppId, getAppName, VALID_APP_IDS, APP_NAMES } from '../../config/apps';

describe('apps config', () => {
  describe('isValidAppId', () => {
    it('should return true for valid app IDs', () => {
      const validIds = ['coinbox', 'sportshub', 'drivemaster', 'edutech', 'portal', 'myprojects'];
      
      validIds.forEach(appId => {
        expect(isValidAppId(appId)).toBe(true);
      });
    });

    it('should return false for invalid app IDs', () => {
      const invalidIds = ['invalid-app', 'notanapp', '', 'test', 'admin'];
      
      invalidIds.forEach(appId => {
        expect(isValidAppId(appId)).toBe(false);
      });
    });

    it('should be case-sensitive', () => {
      expect(isValidAppId('CoinBox')).toBe(false);
      expect(isValidAppId('COINBOX')).toBe(false);
      expect(isValidAppId('coinbox')).toBe(true);
    });

    it('should handle null and undefined', () => {
      expect(isValidAppId(null as any)).toBe(false);
      expect(isValidAppId(undefined as any)).toBe(false);
    });

    it('should handle numbers', () => {
      expect(isValidAppId(123 as any)).toBe(false);
    });
  });

  describe('getAppName', () => {
    it('should return correct app names', () => {
      expect(getAppName('coinbox')).toBe('CoinBox');
      expect(getAppName('sportshub')).toBe('SportsHub');
      expect(getAppName('drivemaster')).toBe('DriveMaster');
      expect(getAppName('edutech')).toBe('EduTech');
      expect(getAppName('portal')).toBe('Portal');
      expect(getAppName('myprojects')).toBe('MyProjects');
    });

    it('should return appId as fallback for unknown apps', () => {
      expect(getAppName('unknown-app' as any)).toBe('unknown-app');
    });
  });

  describe('VALID_APP_IDS', () => {
    it('should contain exactly 6 app IDs', () => {
      expect(VALID_APP_IDS).toHaveLength(6);
    });

    it('should contain all expected app IDs', () => {
      expect(VALID_APP_IDS).toContain('coinbox');
      expect(VALID_APP_IDS).toContain('sportshub');
      expect(VALID_APP_IDS).toContain('drivemaster');
      expect(VALID_APP_IDS).toContain('edutech');
      expect(VALID_APP_IDS).toContain('portal');
      expect(VALID_APP_IDS).toContain('myprojects');
    });

    it('should not contain duplicates', () => {
      const uniqueIds = [...new Set(VALID_APP_IDS)];
      expect(uniqueIds).toHaveLength(VALID_APP_IDS.length);
    });
  });

  describe('APP_NAMES', () => {
    it('should have entries for all valid app IDs', () => {
      VALID_APP_IDS.forEach(appId => {
        expect(APP_NAMES[appId]).toBeDefined();
        expect(typeof APP_NAMES[appId]).toBe('string');
      });
    });

    it('should have exactly 6 entries', () => {
      expect(Object.keys(APP_NAMES)).toHaveLength(6);
    });

    it('should have properly capitalized names', () => {
      Object.values(APP_NAMES).forEach(name => {
        expect(name[0]).toBe(name[0].toUpperCase());
      });
    });
  });
});
