import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { LoginRateLimiter } from "@/lib/auth/rate-limiter";

describe("Validasi Zod Autentikasi", () => {
  describe("registerSchema", () => {
    it("harus valid ketika data registrasi lengkap dan benar", () => {
      const valid = {
        name: "Budi Santoso",
        email: "budi@sekolah.id",
        password: "rahasia-panjang-123",
        username: "budi_santoso",
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("harus menolak password yang kurang dari 8 karakter", () => {
      const invalid = {
        name: "Budi",
        email: "budi@sekolah.id",
        password: "pendek",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/minimal 8 karakter/);
      }
    });

    it("harus menolak format email yang salah", () => {
      const invalid = {
        name: "Budi",
        email: "bukan-email",
        password: "password12345",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Format email tidak valid/);
      }
    });

    it("harus menolak username dengan karakter terlarang (spasi atau simbol aneh)", () => {
      const invalid = {
        name: "Budi",
        email: "budi@sekolah.id",
        password: "password12345",
        username: "budi santoso!",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Username hanya boleh/);
      }
    });
  });

  describe("loginSchema", () => {
    it("harus valid ketika email dan password terisi", () => {
      const valid = {
        email: "budi@sekolah.id",
        password: "password123",
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("harus menolak jika password kosong", () => {
      const invalid = {
        email: "budi@sekolah.id",
        password: "",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

describe("Pembatasan Percobaan Login (LoginRateLimiter)", () => {
  it("mengizinkan percobaan pertama dan menghitung sisa percobaan", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 3 });
    const key = "user@test.com";

    const res1 = limiter.recordFailure(key);
    expect(res1.allowed).toBe(true);
    expect(res1.remainingAttempts).toBe(2);

    const res2 = limiter.recordFailure(key);
    expect(res2.allowed).toBe(true);
    expect(res2.remainingAttempts).toBe(1);
  });

  it("memblokir setelah mencapai batas maksimum percobaan", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 3, blockDurationMs: 60000 });
    const key = "user@test.com";
    const startTime = 1000000;

    limiter.recordFailure(key, startTime);
    limiter.recordFailure(key, startTime + 1000);
    const blockedRes = limiter.recordFailure(key, startTime + 2000);

    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remainingAttempts).toBe(0);
    expect(blockedRes.retryAfterSeconds).toBe(60);

    // Pengecekan status saat terblokir (1062000 - 1003000 = 59000ms = 59 detik)
    const checkRes = limiter.check(key, startTime + 3000);
    expect(checkRes.allowed).toBe(false);
    expect(checkRes.retryAfterSeconds).toBe(59);
  });

  it("mereset hitungan percobaan jika login berhasil", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 3 });
    const key = "user@test.com";

    limiter.recordFailure(key);
    limiter.recordFailure(key);
    limiter.reset(key);

    const checkRes = limiter.check(key);
    expect(checkRes.allowed).toBe(true);
    expect(checkRes.remainingAttempts).toBe(3);
  });
});
