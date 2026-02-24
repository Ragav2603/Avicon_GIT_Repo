import { describe, it, expect } from 'vitest';
import {
  passwordSchema,
  isCompanyEmail,
  signupSchema,
  resetPasswordSchema
} from './auth-validation';

describe('auth-validation', () => {
  describe('isCompanyEmail', () => {
    it('should return false for personal emails', () => {
      expect(isCompanyEmail('test@gmail.com')).toBe(false);
      expect(isCompanyEmail('user@yahoo.com')).toBe(false);
      expect(isCompanyEmail('someone@outlook.com')).toBe(false);
    });

    it('should return true for company emails', () => {
      expect(isCompanyEmail('employee@company.com')).toBe(true);
      expect(isCompanyEmail('admin@startup.io')).toBe(true);
    });

    it('should handle invalid emails gracefully', () => {
      expect(isCompanyEmail('invalid-email')).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should accept strong passwords', () => {
      const validPassword = 'StrongPassword1!';
      const result = passwordSchema.safeParse(validPassword);
      expect(result.success).toBe(true);
    });

    it('should reject passwords shorter than 8 chars', () => {
      const result = passwordSchema.safeParse('Weak1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without uppercase', () => {
      const result = passwordSchema.safeParse('weakpassword1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      const result = passwordSchema.safeParse('WEAKPASSWORD1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      const result = passwordSchema.safeParse('NoNumberPassword!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      const result = passwordSchema.safeParse('NoSpecialChar1');
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should validate valid signup data', () => {
      const data = {
        email: 'user@company.com',
        password: 'StrongPassword1!'
      };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject personal email', () => {
      const data = {
        email: 'user@gmail.com',
        password: 'StrongPassword1!'
      };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Personal email addresses are not allowed');
      }
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords', () => {
      const data = {
        password: 'StrongPassword1!',
        confirmPassword: 'StrongPassword1!'
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const data = {
        password: 'StrongPassword1!',
        confirmPassword: 'StrongPassword2@'
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });
  });
});
