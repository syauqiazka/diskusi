import { describe, expect, it } from "vitest";
import { validateEnv } from "@/lib/env";

describe("Validasi Environment (Zod)", () => {
  it("harus berhasil jika semua variabel wajib valid", () => {
    const validEnv = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/neondb",
      DIRECT_URL: "postgresql://user:pass@localhost:5432/neondb",
      BETTER_AUTH_SECRET: "kunci-rahasia-sangat-panjang-dan-aman-123456",
      BETTER_AUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NODE_ENV: "development",
    };

    const parsed = validateEnv(validEnv);
    expect(parsed.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(parsed.BETTER_AUTH_SECRET).toBe(validEnv.BETTER_AUTH_SECRET);
    expect(parsed.BETTER_AUTH_URL).toBe(validEnv.BETTER_AUTH_URL);
  });

  it("harus melempar error jika DATABASE_URL kosong", () => {
    const invalidEnv = {
      DATABASE_URL: "",
      BETTER_AUTH_SECRET: "kunci-rahasia-sangat-panjang-dan-aman-123456",
      BETTER_AUTH_URL: "http://localhost:3000",
    };

    expect(() => validateEnv(invalidEnv)).toThrowError(/DATABASE_URL wajib diisi/);
  });

  it("harus melempar error jika BETTER_AUTH_SECRET kurang dari 16 karakter", () => {
    const invalidEnv = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/neondb",
      BETTER_AUTH_SECRET: "pendek",
      BETTER_AUTH_URL: "http://localhost:3000",
    };

    expect(() => validateEnv(invalidEnv)).toThrowError(/minimal 16 karakter/);
  });

  it("harus melempar error jika BETTER_AUTH_URL bukan URL valid", () => {
    const invalidEnv = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/neondb",
      BETTER_AUTH_SECRET: "kunci-rahasia-sangat-panjang-dan-aman-123456",
      BETTER_AUTH_URL: "bukan-url-valid",
    };

    expect(() => validateEnv(invalidEnv)).toThrowError(/harus berupa URL valid/);
  });
});

