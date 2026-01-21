import {
  generatePayFastSignature,
  validatePayFastSignature,
  buildPayFastPaymentData,
  getPayFastUrl,
  isValidPayFastIP,
  formatAmount,
  validateTopUpAmount,
} from '../payfast';

describe('PayFast Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_PAYFAST_MERCHANT_ID: 'test_merchant_id',
      NEXT_PUBLIC_PAYFAST_MERCHANT_KEY: 'test_merchant_key',
      PAYFAST_PASSPHRASE: 'test_passphrase',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3008',
      NODE_ENV: 'test',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generatePayFastSignature', () => {
    it('should generate MD5 signature without passphrase', () => {
      const data = {
        merchant_id: 'test_merchant_id',
        merchant_key: 'test_merchant_key',
        amount: '50.00',
        item_name: 'Wallet Top-up',
      };

      const signature = generatePayFastSignature(data);
      
      expect(signature).toBeDefined();
      expect(signature).toHaveLength(32); // MD5 hash is 32 characters
      expect(typeof signature).toBe('string');
    });

    it('should generate signature with passphrase', () => {
      const data = {
        merchant_id: 'test_merchant_id',
        merchant_key: 'test_merchant_key',
        amount: '50.00',
      };

      const signatureWithoutPass = generatePayFastSignature(data);
      const signatureWithPass = generatePayFastSignature(data, 'test_passphrase');
      
      expect(signatureWithPass).not.toBe(signatureWithoutPass);
      expect(signatureWithPass).toHaveLength(32);
    });

    it('should ignore existing signature field', () => {
      const data = {
        merchant_id: 'test_merchant_id',
        amount: '50.00',
        signature: 'old_signature',
      };

      const signature = generatePayFastSignature(data);
      
      expect(signature).not.toBe('old_signature');
    });

    it('should sort keys alphabetically', () => {
      const data1 = {
        amount: '50.00',
        merchant_id: 'test_merchant_id',
        merchant_key: 'test_merchant_key',
      };

      const data2 = {
        merchant_key: 'test_merchant_key',
        amount: '50.00',
        merchant_id: 'test_merchant_id',
      };

      expect(generatePayFastSignature(data1)).toBe(generatePayFastSignature(data2));
    });
  });

  describe('validatePayFastSignature', () => {
    it('should validate correct signature', () => {
      const data = {
        merchant_id: 'test_merchant_id',
        merchant_key: 'test_merchant_key',
        amount: '50.00',
      };

      const signature = generatePayFastSignature(data);
      const dataWithSignature = { ...data, signature };
      
      expect(validatePayFastSignature(dataWithSignature)).toBe(true);
    });

    it('should reject invalid signature', () => {
      const data = {
        merchant_id: 'test_merchant_id',
        amount: '50.00',
        signature: 'invalid_signature',
      };
      
      expect(validatePayFastSignature(data)).toBe(false);
    });

    it('should reject missing signature', () => {
      const data = {
        merchant_id: 'test_merchant_id',
        amount: '50.00',
      };
      
      expect(validatePayFastSignature(data)).toBe(false);
    });
  });

  describe('buildPayFastPaymentData', () => {
    it('should build payment data correctly', () => {
      const paymentData = buildPayFastPaymentData(
        'user123',
        5000, // 50.00 ZAR
        'test@example.com',
        'Test User'
      );

      expect(paymentData.merchant_id).toBe('test_merchant_id');
      expect(paymentData.merchant_key).toBe('test_merchant_key');
      expect(paymentData.amount).toBe('50.00');
      expect(paymentData.email_address).toBe('test@example.com');
      expect(paymentData.custom_str1).toBe('user123');
      expect(paymentData.custom_int1).toBe('5000');
      expect(paymentData.return_url).toContain('/wallet');
      expect(paymentData.cancel_url).toContain('/wallet');
      expect(paymentData.notify_url).toContain('/api/payfast/notify');
    });

    it('should throw error if credentials not configured', () => {
      delete process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID;
      
      expect(() => {
        buildPayFastPaymentData('user123', 5000, 'test@example.com', 'Test User');
      }).toThrow('PayFast merchant credentials not configured');
    });

    it('should convert cents to rands correctly', () => {
      const paymentData = buildPayFastPaymentData(
        'user123',
        12345, // 123.45 ZAR
        'test@example.com',
        'Test User'
      );

      expect(paymentData.amount).toBe('123.45');
    });
  });

  describe('getPayFastUrl', () => {
    it('should return sandbox URL in development', () => {
      process.env.NODE_ENV = 'development';
      const url = getPayFastUrl();
      expect(url).toContain('sandbox.payfast.co.za');
    });

    it('should return production URL in production', () => {
      process.env.NODE_ENV = 'production';
      const url = getPayFastUrl();
      expect(url).toContain('www.payfast.co.za');
    });
  });

  describe('isValidPayFastIP', () => {
    it('should accept valid PayFast IPs', () => {
      expect(isValidPayFastIP('197.97.145.144')).toBe(true);
      expect(isValidPayFastIP('41.74.179.194')).toBe(true);
    });

    it('should reject invalid IPs', () => {
      expect(isValidPayFastIP('192.168.1.1')).toBe(false);
      expect(isValidPayFastIP('10.0.0.1')).toBe(false);
      expect(isValidPayFastIP('invalid')).toBe(false);
    });

    it('should accept localhost in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isValidPayFastIP('127.0.0.1')).toBe(true);
      expect(isValidPayFastIP('::1')).toBe(true);
    });
  });

  describe('formatAmount', () => {
    it('should format amount correctly', () => {
      expect(formatAmount(5000)).toBe('50.00');
      expect(formatAmount(12345)).toBe('123.45');
      expect(formatAmount(100)).toBe('1.00');
      expect(formatAmount(5)).toBe('0.05');
    });

    it('should handle zero', () => {
      expect(formatAmount(0)).toBe('0.00');
    });
  });

  describe('validateTopUpAmount', () => {
    it('should accept valid amounts', () => {
      expect(validateTopUpAmount(1000).valid).toBe(true); // 10 ZAR
      expect(validateTopUpAmount(5000).valid).toBe(true); // 50 ZAR
      expect(validateTopUpAmount(500000).valid).toBe(true); // 5000 ZAR
    });

    it('should reject amount below minimum', () => {
      const result = validateTopUpAmount(500); // 5 ZAR
      expect(result.valid).toBe(false);
      expect(result.error).toContain('minimum');
    });

    it('should reject amount above maximum', () => {
      const result = validateTopUpAmount(1000001); // 10000.01 ZAR
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum');
    });

    it('should reject zero or negative amounts', () => {
      expect(validateTopUpAmount(0).valid).toBe(false);
      expect(validateTopUpAmount(-100).valid).toBe(false);
    });
  });
});
