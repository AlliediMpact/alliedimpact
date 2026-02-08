/**
 * Tests for Zod validation schemas
 */

import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  courseLessonSchema,
} from '../../src/lib/validations';

describe('validations', () => {
  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'Jo',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long name', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'A'.repeat(101),
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Different123',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: true,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when terms not accepted', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'John Doe',
        userType: 'student',
        acceptTerms: false,
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid user types', () => {
      const userTypes = ['student', 'facilitator', 'parent', 'business'];

      userTypes.forEach((userType) => {
        const validData = {
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          displayName: 'John Doe',
          userType,
          acceptTerms: true,
        };

        const result = signupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept with rememberMe option', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const validData = {
        email: 'user@example.com',
      };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should accept valid password reset', () => {
      const validData = {
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'NewPassword123',
        confirmPassword: 'Different123',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        password: 'weak',
        confirmPassword: 'weak',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('courseLessonSchema', () => {
    it('should accept valid lesson data', () => {
      const validData = {
        title: 'Introduction to React',
        type: 'video',
        content: 'https://example.com/video.mp4',
        duration: 30,
        order: 1,
      };

      const result = courseLessonSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const invalidData = {
        title: 'AB',
        type: 'video',
        content: 'content',
        duration: 30,
        order: 1,
      };

      const result = courseLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long title', () => {
      const invalidData = {
        title: 'A'.repeat(201),
        type: 'video',
        content: 'content',
        duration: 30,
        order: 1,
      };

      const result = courseLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid lesson types', () => {
      const types = ['video', 'reading', 'quiz', 'coding-challenge'];

      types.forEach((type) => {
        const validData = {
          title: 'Test Lesson',
          type,
          content: 'content',
          duration: 30,
          order: 1,
        };

        const result = courseLessonSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject negative duration', () => {
      const invalidData = {
        title: 'Test Lesson',
        type: 'video',
        content: 'content',
        duration: -10,
        order: 1,
      };

      const result = courseLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject duration over 300', () => {
      const invalidData = {
        title: 'Test Lesson',
        type: 'video',
        content: 'content',
        duration: 400,
        order: 1,
      };

      const result = courseLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const invalidData = {
        title: 'Test Lesson',
        type: 'video',
        content: '',
        duration: 30,
        order: 1,
      };

      const result = courseLessonSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
