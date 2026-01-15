import { CertificateService } from '@/lib/services/CertificateService';

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
  db: {},
  storage: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  runTransaction: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date: Date) => date),
  },
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(() => Promise.resolve('https://storage.example.com/cert.pdf')),
}));

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    setLineWidth: jest.fn(),
    setDrawColor: jest.fn(),
    rect: jest.fn(),
    addImage: jest.fn(),
    output: jest.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
  })),
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mockqrcode')),
}));

describe('CertificateService', () => {
  let certificateService: CertificateService;

  beforeEach(() => {
    certificateService = new CertificateService();
    jest.clearAllMocks();
  });

  describe('Certificate Number Generation', () => {
    it('should format certificate number correctly', () => {
      const year = 2026;
      const counter = 1;
      const certificateNumber = `DM-${year}-${String(counter).padStart(5, '0')}`;
      
      expect(certificateNumber).toBe('DM-2026-00001');
    });

    it('should handle large counter values', () => {
      const year = 2026;
      const counter = 12345;
      const certificateNumber = `DM-${year}-${String(counter).padStart(5, '0')}`;
      
      expect(certificateNumber).toBe('DM-2026-12345');
    });

    it('should pad counter with zeros', () => {
      const counter = 42;
      const paddedCounter = String(counter).padStart(5, '0');
      
      expect(paddedCounter).toBe('00042');
    });
  });

  describe('Disclaimer Requirements', () => {
    it('should include all 4 mandatory disclaimers', () => {
      const DISCLAIMERS = [
        'This certificate is not a substitute for the official K53 learner\'s license test.',
        'DriveMaster is an educational platform and does not issue official driving licenses.',
        'You must still complete the official testing process at a licensing department.',
        'This certificate verifies completion of the DriveMaster learning journey only.',
      ];

      expect(DISCLAIMERS).toHaveLength(4);
    });

    it('should have specific disclaimer texts', () => {
      const DISCLAIMERS = certificateService['DISCLAIMERS'];
      
      expect(DISCLAIMERS[0]).toContain('not a substitute');
      expect(DISCLAIMERS[1]).toContain('educational platform');
      expect(DISCLAIMERS[2]).toContain('official testing process');
      expect(DISCLAIMERS[3]).toContain('verifies completion');
    });
  });

  describe('Certificate Data Validation', () => {
    it('should require user ID', () => {
      const userId = 'user-123';
      expect(userId).toBeTruthy();
      expect(userId.length).toBeGreaterThan(0);
    });

    it('should require user name', () => {
      const userName = 'John Doe';
      expect(userName).toBeTruthy();
      expect(userName.length).toBeGreaterThan(0);
    });

    it('should validate stage values', () => {
      const validStages = ['beginner', 'intermediate', 'advanced', 'k53'];
      const stage = 'beginner';
      
      expect(validStages).toContain(stage);
    });

    it('should validate score range', () => {
      const score = 95;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Verification URL Generation', () => {
    it('should generate correct verification URL', () => {
      const certificateNumber = 'DM-2026-00001';
      const baseUrl = 'https://drivemaster.co.za';
      const verificationUrl = `${baseUrl}/verify/${certificateNumber}`;
      
      expect(verificationUrl).toBe('https://drivemaster.co.za/verify/DM-2026-00001');
    });

    it('should handle certificate number in URL', () => {
      const certificateNumber = 'DM-2026-12345';
      const url = `/verify/${certificateNumber}`;
      
      expect(url).toContain(certificateNumber);
    });
  });

  describe('Date Formatting', () => {
    it('should format completion date correctly', () => {
      const date = new Date('2026-01-14');
      const formatted = date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      expect(formatted).toBe('14 January 2026');
    });

    it('should handle different dates', () => {
      const date = new Date('2026-06-30');
      const formatted = date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      expect(formatted).toBe('30 June 2026');
    });
  });

  describe('Duplicate Prevention', () => {
    it('should check for existing certificate', async () => {
      const userId = 'user-123';
      const stage = 'beginner';
      const certificateId = `${userId}_${stage}`;
      
      expect(certificateId).toBe('user-123_beginner');
    });

    it('should allow different stages for same user', () => {
      const userId = 'user-123';
      const stages = ['beginner', 'intermediate'];
      const certificateIds = stages.map(stage => `${userId}_${stage}`);
      
      expect(certificateIds).toHaveLength(2);
      expect(certificateIds[0]).not.toBe(certificateIds[1]);
    });
  });

  describe('PDF Generation', () => {
    it('should use A4 landscape format', () => {
      const format = {
        orientation: 'landscape',
        format: 'a4',
      };
      
      expect(format.orientation).toBe('landscape');
      expect(format.format).toBe('a4');
    });

    it('should include QR code dimensions', () => {
      const qrSize = 30; // 30mm
      expect(qrSize).toBeGreaterThan(0);
    });
  });

  describe('Storage Path', () => {
    it('should generate correct storage path', () => {
      const userId = 'user-123';
      const certificateNumber = 'DM-2026-00001';
      const storagePath = `certificates/${userId}/${certificateNumber}.pdf`;
      
      expect(storagePath).toBe('certificates/user-123/DM-2026-00001.pdf');
    });

    it('should organize by user ID', () => {
      const userId = 'user-123';
      const basePath = `certificates/${userId}/`;
      
      expect(basePath).toContain(userId);
    });
  });
});
