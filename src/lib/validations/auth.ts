import { z } from "zod";

export const usernameRegex = /^[a-zA-Z0-9_]+$/;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(50, "Nama maksimal 50 karakter")
    .trim(),
  email: z
    .string()
    .email("Format email tidak valid")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(100, "Kata sandi maksimal 100 karakter"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(usernameRegex, "Username hanya boleh berisi huruf, angka, dan underscore")
    .toLowerCase()
    .trim()
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Kata sandi wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

