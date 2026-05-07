/**
 * Lightweight in-memory rate limiter.
 *
 * Single-process / single-region. On multi-instance deployments each
 * instance keeps its own counter, so the effective limit is N × the
 * configured value — acceptable for a portfolio site, but swap in a Redis
 * (or Upstash) backend if you ever need strict global limits.
 */

import { NextResponse, type NextRequest } from 'next/server';

interface Bucket {
  /** Remaining tokens. */
  tokens: number;
  /** Last refill timestamp (ms since epoch). */
  refilled: number;
}

interface Limiter {
  /** Tokens per window. */
  limit: number;
  /** Window length in ms. Tokens fully refill after this much idle time. */
  windowMs: number;
  /** Storage. Keys are typically `${ip}:${routeKey}`. */
  buckets: Map<string, Bucket>;
}

const limiters = new Map<string, Limiter>();

function getLimiter(routeKey: string, limit: number, windowMs: number) {
  const existing = limiters.get(routeKey);
  if (existing) return existing;
  const fresh: Limiter = { limit, windowMs, buckets: new Map() };
  limiters.set(routeKey, fresh);
  return fresh;
}

/**
 * Best-effort client IP extraction. Trusts the first hop in `x-forwarded-for`
 * — appropriate behind Vercel / a single trusted proxy. If you sit behind
 * additional proxies, tighten this.
 */
export function getClientIp(req: NextRequest | Request): string {
  const headers =
    'headers' in req && typeof (req as NextRequest).headers.get === 'function'
      ? (req as NextRequest).headers
      : (req as Request).headers;
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return headers.get('x-real-ip') || 'anonymous';
}

interface CheckResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the next token is available. */
  retryAfter: number;
  /** Total limit for the window. */
  limit: number;
}

export function checkRateLimit(
  key: string,
  routeKey: string,
  limit: number,
  windowMs: number,
): CheckResult {
  if (process.env.RATE_LIMIT_DISABLED === 'true') {
    return { ok: true, remaining: limit, retryAfter: 0, limit };
  }

  const limiter = getLimiter(routeKey, limit, windowMs);
  const now = Date.now();
  const bucket = limiter.buckets.get(key);

  if (!bucket) {
    limiter.buckets.set(key, { tokens: limit - 1, refilled: now });
    return { ok: true, remaining: limit - 1, retryAfter: 0, limit };
  }

  // Linear refill: idle time × (tokens per ms).
  const elapsed = now - bucket.refilled;
  const refill = (elapsed / windowMs) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.refilled = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      ok: true,
      remaining: Math.floor(bucket.tokens),
      retryAfter: 0,
      limit,
    };
  }

  // Time until 1 full token: ((1 - tokens) / limit) * windowMs.
  const waitMs = ((1 - bucket.tokens) / limit) * windowMs;
  return {
    ok: false,
    remaining: 0,
    retryAfter: Math.ceil(waitMs / 1000),
    limit,
  };
}

/** Build a 429 response with standard headers. */
export function tooManyRequestsResponse(
  result: CheckResult,
  message = 'Too many requests',
): NextResponse {
  return NextResponse.json(
    { error: 'rate_limited', retryAfter: result.retryAfter, message },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}

/**
 * Convenience wrapper: gate a route handler with a per-IP rate limit.
 * Returns either a 429 response or null (caller proceeds).
 */
export function rateLimitOr429(
  req: NextRequest | Request,
  routeKey: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const key = `${getClientIp(req)}:${routeKey}`;
  const result = checkRateLimit(key, routeKey, limit, windowMs);
  if (result.ok) return null;
  return tooManyRequestsResponse(result);
}

/** Periodic cleanup so the in-memory map doesn't grow unboundedly. */
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

export function maybeSweepStale(): void {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const limiter of limiters.values()) {
    for (const [key, bucket] of limiter.buckets) {
      if (now - bucket.refilled > limiter.windowMs * 2) {
        limiter.buckets.delete(key);
      }
    }
  }
}
