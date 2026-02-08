import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  courseLessonSchema,
} from '../../lib/validations';

describe('validations', () => {
  describe('signupSchema', () => {
    const validSignup = {
      displayName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      userType: 'learner' as const,
      languagePreference: 'en' as const,
      termsAccepted: true,
    };

    it('should accept valid signup data', () => {
      const result = signupSchema.safeParse(validSignup);
      expect(result.success).toBe(true);
    });

    it('should reject name with less than 2 characters', () => {
      const result = signupSchema.safeParse({ ...validSignup, displayName: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject name with special characters', () => {
      const result = signupSchema.safeParse({ ...validSignup, displayName: 'John@Doe' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = signupSchema.safeParse({ ...validSignup, email: 'invalid-email' });
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        password: 'Pass1',
        confirmPassword: 'Pass1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        password: 'Password123',
        confirmPassword: 'Password456',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("don't match");
      }
    });

    it('should reject without terms acceptance', () => {
      const result = signupSchema.safeParse({ ...validSignup, termsAccepted: false });
      expect(result.success).toBe(false);
    });

    it('should accept all valid user types', () => {
      const userTypes = ['learner', 'facilitator', 'content_admin', 'system_admin'] as const;
      
      userTypes.forEach(type => {
        const result = signupSchema.safeParse({ ...validSignup, userType: type });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('loginSchema', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should accept valid login data', () => {
      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({ ...validLogin, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({ ...validLogin, password: '' });
      expect(result.success).toBe(false);
    });

    it('should accept with rememberMe option', () => {
      const result = loginSchema.safeParse({ ...validLogin, rememberMe: true });
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = forgotPasswordSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    const validReset = {
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    };

    it('should accept valid reset data', () => {
      const result = resetPasswordSchema.safeParse(validReset);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('courseLessonSchema', () => {
    const validLesson = {
      title: 'Introduction to Variables',
      type: 'video' as const,
      content: 'This lesson covers the basics of variables in programming...',
      durationMinutes: 30,
      order: 1,
    };

    it('should accept valid lesson data', () => {
      const result = courseLessonSchema.safeParse(validLesson);
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const result = courseLessonSchema.safeParse({ ...validLesson, title: 'Hi' });
      expect(result.success).toBe(false);
    });

    it('should reject long title', () => {
      const result = courseLessonSchema.safeParse({
        ...validLesson,
        title: 'A'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid lesson types', () => {
      const types = ['video', 'reading', 'quiz', 'coding-exercise'] as const;
      
      types.forEach(type => {
        const result = courseLessonSchema.safeParse({ ...validLesson, type });
        expect(result.success).toBe(true);
      });
    });

    it('should reject zero duration', () => {
      const result = courseLessonSchema.safeParse({ ...validLesson, durationMinutes: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject excessive duration', () => {
      const result = courseLessonSchema.safeParse({ ...validLesson, durationMinutes: 200 });
      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const result = courseLessonSchema.safeParse({ ...validLesson, content: '' });
      expect(result.success).toBe(false);
    });
  });
});
