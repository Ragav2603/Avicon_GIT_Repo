import { describe, it, expect } from 'vitest';
import { rfpSchema } from '../CreateRFPForm';

describe('rfpSchema', () => {
  it('validates a correct RFP', () => {
    const validRFP = {
      title: 'Valid RFP Title',
      description: 'This is a valid description that is long enough.',
      budget_max: 5000,
      deadline: new Date('2025-12-31'),
    };
    const result = rfpSchema.safeParse(validRFP);
    expect(result.success).toBe(true);
  });

  it('validates a minimal correct RFP (optional fields missing)', () => {
    const validRFP = {
      title: 'Valid RFP Title',
      description: 'This is a valid description that is long enough.',
    };
    const result = rfpSchema.safeParse(validRFP);
    expect(result.success).toBe(true);
  });

  it('rejects a title that is too short', () => {
    const invalidRFP = {
      title: 'Tiny',
      description: 'This is a valid description that is long enough.',
    };
    const result = rfpSchema.safeParse(invalidRFP);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title must be at least 5 characters');
    }
  });

  it('rejects a description that is too short', () => {
    const invalidRFP = {
      title: 'Valid RFP Title',
      description: 'Short',
    };
    const result = rfpSchema.safeParse(invalidRFP);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Description must be at least 20 characters');
    }
  });

  it('rejects a budget that is too low', () => {
    const invalidRFP = {
      title: 'Valid RFP Title',
      description: 'This is a valid description that is long enough.',
      budget_max: 500,
    };
    const result = rfpSchema.safeParse(invalidRFP);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Budget must be at least $1,000');
    }
  });

  it('rejects invalid data types', () => {
    const invalidRFP = {
      title: 123, // Should be string
      description: 'This is a valid description that is long enough.',
    };
    const result = rfpSchema.safeParse(invalidRFP);
    expect(result.success).toBe(false);
  });
});
