/**
 * In-Memory Rate Limiter for Kawan Kod AI Requests
 *
 * BATASAN & DOKUMENTASI PRODUCTION:
 * Limiter in-memory ini dirancang untuk prototipe, pengujian, dan single-instance Next.js server.
 * Pada deployment multi-instance / serverless (seperti Vercel multi-region atau autoscaling container),
 * rate limiter ini harus digantikan dengan distributed store seperti Redis (misalnya Upstash Redis)
 * agar kuota request antar instance tersinkronisasi secara global.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_REQUESTS = 10; // 10 request per window

const memoryStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function checkRateLimit(
  profileId: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(profileId);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    memoryStore.set(profileId, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    const resetInMs = Math.max(0, entry.windowStart + windowMs - now);
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
    };
  }

  entry.count += 1;
  const resetInMs = Math.max(0, entry.windowStart + windowMs - now);
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInMs,
  };
}

export function getRateLimitStatus(
  profileId: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): { count: number; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(profileId);
  if (!entry || now - entry.windowStart > windowMs) {
    return { count: 0, remaining: maxRequests };
  }
  return {
    count: entry.count,
    remaining: Math.max(0, maxRequests - entry.count),
  };
}

export function resetRateLimit(profileId?: string): void {
  if (profileId) {
    memoryStore.delete(profileId);
  } else {
    memoryStore.clear();
  }
}

export function clearAllRateLimits(): void {
  memoryStore.clear();
}

