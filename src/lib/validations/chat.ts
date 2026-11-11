import { z } from "zod";
import { sanitizeInput } from "./forum";

export const sendMessageSchema = z.object({
  classId: z.string().min(1, "Class ID wajib disertakan untuk DM intra-kelas"),
  targetUserId: z.string().min(1, "Target User ID wajib diisi"),
  content: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong")
    .max(2000, "Pesan maksimal 2.000 karakter")
    .transform(sanitizeInput)
    .refine((val) => val.length > 0, "Pesan tidak boleh kosong"),
});

export type SendMessageInput = z.input<typeof sendMessageSchema>;
