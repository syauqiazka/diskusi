/**
 * Pembatasan percobaan login sederhana (Rate Limiter in-memory)
 * Digunakan untuk mencegah brute-force login pada endpoint kredensial.
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil: number | null;
}

export interface RateLimiterOptions {
  maxAttempts?: number;
  windowMs?: number; // Jendela waktu pelacakan (misal 15 menit)
  blockDurationMs?: number; // Durasi blokir jika melanggar (misal 15 menit)
}

export class LoginRateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(options: RateLimiterOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? 5;
    this.windowMs = options.windowMs ?? 15 * 60 * 1000;
    this.blockDurationMs = options.blockDurationMs ?? 15 * 60 * 1000;
  }

  public check(key: string, now: number = Date.now()): {
    allowed: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number;
  } {
    const record = this.records.get(key);

    if (!record) {
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts,
        retryAfterSeconds: 0,
      };
    }

    // Jika sedang dalam masa blokir
    if (record.blockedUntil && now < record.blockedUntil) {
      const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    // Jika jendela waktu sudah kedaluwarsa, bersihkan riwayat
    if (now - record.firstAttemptAt > this.windowMs) {
      this.records.delete(key);
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts,
        retryAfterSeconds: 0,
      };
    }

    const remaining = Math.max(0, this.maxAttempts - record.attempts);
    return {
      allowed: remaining > 0,
      remainingAttempts: remaining,
      retryAfterSeconds: 0,
    };
  }

  public recordFailure(key: string, now: number = Date.now()): {
    allowed: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number;
  } {
    let record = this.records.get(key);

    if (!record || now - record.firstAttemptAt > this.windowMs) {
      record = {
        attempts: 1,
        firstAttemptAt: now,
        blockedUntil: null,
      };
      this.records.set(key, record);
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts - 1,
        retryAfterSeconds: 0,
      };
    }

    record.attempts++;

    if (record.attempts >= this.maxAttempts) {
      record.blockedUntil = now + this.blockDurationMs;
      const retryAfterSeconds = Math.ceil(this.blockDurationMs / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - record.attempts,
      retryAfterSeconds: 0,
    };
  }

  public reset(key: string): void {
    this.records.delete(key);
  }

  public clearAll(): void {
    this.records.clear();
  }
}

export const loginRateLimiter = new LoginRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
});

