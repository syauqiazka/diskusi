import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  DIRECT_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET minimal 16 karakter"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL harus berupa URL valid"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ` - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Validasi environment gagal:\n${issues}`);
  }
  return result.data;
}

// In test environment, allow mock values if not provided
const isTest = process.env.NODE_ENV === "test";
export const env = isTest
  ? {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/testdb",
      DIRECT_URL: process.env.DIRECT_URL || "postgresql://test:test@localhost:5432/testdb",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "rahasia-uji-coba-minimal-32-karakter-panjang",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      NODE_ENV: "test" as const,
    }
  : validateEnv(process.env);

