import { describe, it, expect } from 'vitest';
import {
  contactSchema,
  signInSchema,
  signUpSchema,
  bookingSchema,
  chatRequestSchema,
} from '@/lib/validators';

describe('contactSchema', () => {
  it('accepts a valid contact submission', () => {
    expect(
      contactSchema.safeParse({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Analytical Engines',
        channel: 'telegram',
        service: 'chatbot',
        message: 'I would like to discuss an agent project.',
      }).success,
    ).toBe(true);
  });

  it('accepts when optional company/service are omitted', () => {
    expect(
      contactSchema.safeParse({
        name: 'Ada',
        email: 'ada@example.com',
        channel: 'google-meet',
        message: 'Long enough message here.',
      }).success,
    ).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = contactSchema.safeParse({
      name: 'Ada',
      email: 'not-an-email',
      channel: 'telegram',
      message: 'Long enough message here.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects too-short messages', () => {
    expect(
      contactSchema.safeParse({
        name: 'Ada',
        email: 'ada@example.com',
        channel: 'telegram',
        message: 'short',
      }).success,
    ).toBe(false);
  });

  it('rejects unknown channel values', () => {
    expect(
      contactSchema.safeParse({
        name: 'Ada',
        email: 'ada@example.com',
        channel: 'whatsapp',
        message: 'Long enough message here.',
      }).success,
    ).toBe(false);
  });
});

describe('signInSchema', () => {
  it('accepts a valid sign-in payload', () => {
    expect(
      signInSchema.safeParse({
        email: 'ada@example.com',
        password: 'p',
      }).success,
    ).toBe(true);
  });

  it('rejects empty password', () => {
    expect(
      signInSchema.safeParse({
        email: 'ada@example.com',
        password: '',
      }).success,
    ).toBe(false);
  });
});

describe('signUpSchema', () => {
  const valid = {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'longpass1',
    confirmPassword: 'longpass1',
  };

  it('accepts when passwords match', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects when passwords don't match", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: 'different1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });

  it('rejects passwords shorter than 8', () => {
    expect(
      signUpSchema.safeParse({ ...valid, password: 'short', confirmPassword: 'short' })
        .success,
    ).toBe(false);
  });
});

describe('bookingSchema', () => {
  const valid = {
    serviceType: 'ai',
    bookingDate: '2026-05-12',
    bookingTime: '10:00',
    guestName: 'Ada',
    guestEmail: 'ada@example.com',
    phone: '',
    notes: '',
  };

  it('accepts a valid booking', () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects malformed dates', () => {
    expect(
      bookingSchema.safeParse({ ...valid, bookingDate: '2026/05/12' }).success,
    ).toBe(false);
  });

  it('rejects unknown time slots', () => {
    expect(
      bookingSchema.safeParse({ ...valid, bookingTime: '11:00' }).success,
    ).toBe(false);
  });

  it('allows empty optional fields', () => {
    const result = bookingSchema.safeParse({
      ...valid,
      phone: '',
      notes: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('chatRequestSchema', () => {
  it('accepts up to 40 messages', () => {
    const messages = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : ('assistant' as const),
      content: `m${i}`,
    }));
    expect(chatRequestSchema.safeParse({ messages }).success).toBe(true);
  });

  it('rejects empty message arrays', () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it('rejects message arrays over 40', () => {
    const messages = Array.from({ length: 41 }, () => ({
      role: 'user' as const,
      content: 'hi',
    }));
    expect(chatRequestSchema.safeParse({ messages }).success).toBe(false);
  });
});
