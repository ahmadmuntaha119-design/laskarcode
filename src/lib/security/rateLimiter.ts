import 'server-only';

export class RateLimitExceededError extends Error {
  public readonly resetAt: number;

  constructor(message: string, resetAt: number) {
    super(message);
    this.name = 'RateLimitExceededError';
    this.resetAt = resetAt;
  }
}

interface RateLimitEntry {
  count: number;
  firstAttemptAt: number;
  resetAt: number;
}

/**
 * ============================================================================
 * Dev & Test In-Memory Rate Limiter
 * ============================================================================
 * PERINGATAN ARSITEKTUR KEAMANAN:
 * Limiter in-memory ini HANYA digunakan untuk lingkungan lokal (Development & Testing).
 *
 * Pada lingkungan Produksi (Vercel Deployment):
 * Node serverless functions tidak berbagi memori runtime antar instance container.
 * Oleh karena itu, proteksi rate limiting produksi WAJIB diatur pada lapisan Edge
 * melalui Vercel Firewall / WAF Rate Limiting Rule:
 *   - Path: /api/auth/recover*
 *   - Action: Rate Limit (429 Too Many Requests)
 *   - Rate: Maksimal 5 request / 10 menit per IP Address.
 * ============================================================================
 */
export class DevMemoryRateLimiter {
  private static store = new Map<string, RateLimitEntry>();
  private static readonly DEFAULT_MAX_ATTEMPTS = 5;
  private static readonly DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 menit

  /**
   * Memeriksa apakah request dari key tertentu diizinkan.
   */
  public static check(
    key: string,
    maxAttempts: number = this.DEFAULT_MAX_ATTEMPTS,
    windowMs: number = this.DEFAULT_WINDOW_MS
  ): { allowed: boolean; remaining: number; resetAt: number } {
    this.cleanup();

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      return {
        allowed: true,
        remaining: maxAttempts,
        resetAt: now + windowMs,
      };
    }

    if (now >= entry.resetAt) {
      this.store.delete(key);
      return {
        allowed: true,
        remaining: maxAttempts,
        resetAt: now + windowMs,
      };
    }

    const remaining = Math.max(0, maxAttempts - entry.count);
    return {
      allowed: entry.count < maxAttempts,
      remaining,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Mencatat percobaan (terutama percobaan gagal).
   */
  public static record(
    key: string,
    windowMs: number = this.DEFAULT_WINDOW_MS
  ): void {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetAt) {
      this.store.set(key, {
        count: 1,
        firstAttemptAt: now,
        resetAt: now + windowMs,
      });
      return;
    }

    entry.count += 1;
  }

  /**
   * Mereset counter setelah recovery berhasil.
   */
  public static reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Menghapus seluruh store (berguna untuk isolasi pengujian unit).
   */
  public static clearAll(): void {
    this.store.clear();
  }

  private static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
