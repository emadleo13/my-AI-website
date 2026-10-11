import { describe, it, expect } from 'vitest';
import {
  contactSchema,
  signInSchema,
  signUpSchema,
  bookingSchema,
  chatRequestSchema,
  discoverySchema,
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
  const turns = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `m${i}`,
    }));

  it('accepts a long conversation that ends with a user turn', () => {
    expect(chatRequestSchema.safeParse({ messages: turns(59) }).success).toBe(true);
  });

  it('rejects empty message arrays', () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it('rejects more than 60 messages', () => {
    expect(chatRequestSchema.safeParse({ messages: turns(61) }).success).toBe(false);
  });

  it('rejects a conversation whose last turn is not from the user', () => {
    expect(chatRequestSchema.safeParse({ messages: turns(2) }).success).toBe(false);
  });

  it('rejects oversized payloads', () => {
    const big = Array.from({ length: 21 }, () => ({ role: 'user' as const, content: 'x'.repeat(3000) }));
    expect(chatRequestSchema.safeParse({ messages: big }).success).toBe(false);
  });

  it('accepts a known locale and rejects others', () => {
    expect(chatRequestSchema.safeParse({ messages: turns(1), locale: 'fa' }).success).toBe(true);
    expect(chatRequestSchema.safeParse({ messages: turns(1), locale: 'xx' }).success).toBe(false);
  });
});

describe('discoverySchema', () => {
  const base = { fullName: 'Ada', email: 'ada@example.com', projectGoal: 'A company website' };

  it('accepts the current service types', () => {
    for (const serviceType of ['chatbot', 'website', 'webapp', 'android', 'other']) {
      expect(discoverySchema.safeParse({ ...base, serviceType }).success).toBe(true);
    }
  });

  it('rejects retired service types', () => {
    for (const serviceType of ['workflow', 'consulting', 'both']) {
      expect(discoverySchema.safeParse({ ...base, serviceType }).success).toBe(false);
    }
  });
});
