import { z } from "zod";

/**
 * Sanitasi string sederhana untuk mencegah XSS script injection dasar.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "")
    .trim();
}

export const createThreadSchema = z.object({
  title: z
    .string()
    .min(5, "Judul thread minimal 5 karakter")
    .max(150, "Judul thread maksimal 150 karakter")
    .transform(sanitizeInput),
  content: z
    .string()
    .min(10, "Isi thread minimal 10 karakter")
    .max(10000, "Isi thread maksimal 10.000 karakter")
    .transform(sanitizeInput),
  category: z
    .string()
    .min(2, "Kategori minimal 2 karakter")
    .max(50, "Kategori maksimal 50 karakter")
    .transform(sanitizeInput),
  classId: z.string().nullable().optional(),
});

export type CreateThreadInput = z.input<typeof createThreadSchema>;

export const createCommentSchema = z.object({
  threadId: z.string().min(1, "Thread ID wajib diisi"),
  content: z
    .string()
    .min(2, "Komentar minimal 2 karakter")
    .max(2000, "Komentar maksimal 2.000 karakter")
    .transform(sanitizeInput),
  parentId: z.string().nullable().optional(),
});

export type CreateCommentInput = z.input<typeof createCommentSchema>;

export const voteThreadSchema = z.object({
  threadId: z.string().min(1, "Thread ID wajib diisi"),
  direction: z.enum(["up", "down"]),
});

export type VoteThreadInput = z.input<typeof voteThreadSchema>;
