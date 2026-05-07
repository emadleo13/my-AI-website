import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    delete process.env.RATE_LIMIT_DISABLED;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to `limit` calls in fresh state', () => {
    const route = `t1-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit('ip:127.0.0.1', route, 5, 10_000);
      expect(r.ok).toBe(true);
    }
    const blocked = checkRateLimit('ip:127.0.0.1', route, 5, 10_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('refills proportionally with elapsed time', () => {
    const route = `t2-${Math.random()}`;
    const key = 'ip:1.2.3.4';
    // Burn the bucket.
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, route, 5, 10_000);
    }
    expect(checkRateLimit(key, route, 5, 10_000).ok).toBe(false);

    // Half the window passes — at least 2 tokens should refill.
    vi.advanceTimersByTime(5_000);
    let refilled = 0;
    while (checkRateLimit(key, route, 5, 10_000).ok) refilled += 1;
    expect(refilled).toBeGreaterThanOrEqual(2);
    expect(refilled).toBeLessThanOrEqual(3);
  });

  it('isolates buckets per key', () => {
    const route = `t3-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit('ip:a', route, 5, 10_000);
    }
    expect(checkRateLimit('ip:a', route, 5, 10_000).ok).toBe(false);
    expect(checkRateLimit('ip:b', route, 5, 10_000).ok).toBe(true);
  });

  it('respects RATE_LIMIT_DISABLED env override', () => {
    process.env.RATE_LIMIT_DISABLED = 'true';
    const route = `t4-${Math.random()}`;
    for (let i = 0; i < 1000; i++) {
      expect(checkRateLimit('ip:any', route, 1, 10_000).ok).toBe(true);
    }
  });
});
