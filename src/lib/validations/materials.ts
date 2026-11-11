import { z } from "zod";
import { sanitizeInput } from "./forum";

export const createMaterialSchema = z.object({
  title: z
    .string()
    .min(3, "Judul materi minimal 3 karakter")
    .max(150, "Judul materi maksimal 150 karakter")
    .transform(sanitizeInput),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeInput(val) : null)),
  category: z
    .string()
    .min(2, "Kategori minimal 2 karakter")
    .max(50, "Kategori maksimal 50 karakter")
    .transform(sanitizeInput),
  fileFormat: z.string().default("PDF"),
  fileSize: z.string().default("1.0 MB"),
  fileUrl: z.string().min(1, "URL file wajib diisi"),
  classId: z.string().nullable().optional(),
});

export type CreateMaterialInput = z.input<typeof createMaterialSchema>;

export const createAnnouncementSchema = z.object({
  classId: z.string().min(1, "Class ID wajib diisi"),
  title: z
    .string()
    .min(3, "Judul pengumuman minimal 3 karakter")
    .max(150, "Judul pengumuman maksimal 150 karakter")
    .transform(sanitizeInput),
  content: z
    .string()
    .min(5, "Isi pengumuman minimal 5 karakter")
    .max(3000, "Isi pengumuman maksimal 3.000 karakter")
    .transform(sanitizeInput),
  isPinned: z.boolean().default(true),
});

export type CreateAnnouncementInput = z.input<typeof createAnnouncementSchema>;
