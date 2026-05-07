import { describe, it, expect } from 'vitest';
import {
  BOOKING_TIMES,
  formatDateISO,
  nextBusinessDays,
} from '@/lib/utils';

describe('formatDateISO', () => {
  it('zero-pads month and day', () => {
    expect(formatDateISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('uses local fields, not UTC', () => {
    // 2026-12-31 23:00 local should still be Dec 31 in ISO regardless of TZ.
    const d = new Date(2026, 11, 31, 23, 0, 0);
    expect(formatDateISO(d)).toBe('2026-12-31');
  });
});

describe('nextBusinessDays', () => {
  it('skips weekends', () => {
    // 2026-05-01 is a Friday.
    const days = nextBusinessDays(new Date(2026, 4, 1), 5);
    const isos = days.map(formatDateISO);
    expect(isos).toEqual([
      '2026-05-01', // Fri
      '2026-05-04', // Mon
      '2026-05-05',
      '2026-05-06',
      '2026-05-07',
    ]);
  });

  it('returns the requested count', () => {
    const days = nextBusinessDays(new Date(2026, 4, 4), 10);
    expect(days).toHaveLength(10);
    for (const d of days) {
      expect(d.getDay()).not.toBe(0);
      expect(d.getDay()).not.toBe(6);
    }
  });

  it('starts at the input date when it is a weekday', () => {
    const start = new Date(2026, 4, 4); // Mon
    const [first] = nextBusinessDays(start, 1);
    expect(formatDateISO(first)).toBe('2026-05-04');
  });

  it('skips a weekend input', () => {
    const start = new Date(2026, 4, 2); // Sat
    const [first] = nextBusinessDays(start, 1);
    expect(formatDateISO(first)).toBe('2026-05-04');
  });
});

describe('BOOKING_TIMES', () => {
  it('exposes 4 fixed hourly slots', () => {
    expect([...BOOKING_TIMES]).toEqual(['10:00', '12:00', '14:00', '16:00']);
  });
});
