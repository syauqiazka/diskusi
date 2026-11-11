"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { ensureForumAndMaterialsSeeded } from "@/lib/db/seed-forum";
import {
  createMaterialSchema,
  type CreateMaterialInput,
} from "@/lib/validations/materials";

async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

export interface MaterialListItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileFormat: string;
  fileSize: string;
  fileUrl: string;
  classId: string | null;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
}

/**
 * Mengambil daftar materi pembelajaran (Perpustakaan umum jika classId null, atau Rak Materi jika classId ada)
 */
export async function getMaterials(options?: {
  classId?: string | null;
  category?: string;
  search?: string;
}): Promise<MaterialListItem[]> {
  await ensureForumAndMaterialsSeeded();

  const classId = options?.classId !== undefined ? options.classId : null;
  const category = options?.category;
  const search = options?.search?.trim();

  const where = {
    classId: classId,
    ...(category && category !== "SEMUA" ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const raw = await prisma.learningMaterial.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return raw.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category,
    fileFormat: m.fileFormat,
    fileSize: m.fileSize,
    fileUrl: m.fileUrl,
    classId: m.classId,
    author: {
      id: m.author.id,
      name: m.author.name,
    },
    createdAt: m.createdAt.toISOString(),
  }));
}

/**
 * Menambahkan materi baru (Perpustakaan terbuka atau Rak Materi Kelas)
 */
export async function createMaterial(
  rawInput: CreateMaterialInput
): Promise<{ success: boolean; materialId?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu untuk mengunggah materi." };
  }

  const parsed = createMaterialSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid." };
  }

  const { title, description, category, fileFormat, fileSize, fileUrl, classId } = parsed.data;

  // Jika materi kelas, pastikan pengguna adalah pengajar/asisten/anggota kelas
  if (classId) {
    const membership = await prisma.classMember.findUnique({
      where: {
        userId_classId: {
          userId: session.user.id,
          classId: classId,
        },
      },
    });
    if (!membership) {
      return { success: false, error: "Anda bukan anggota kelas ini." };
    }
  }

  const material = await prisma.learningMaterial.create({
    data: {
      title,
      description,
      category,
      fileFormat,
      fileSize,
      fileUrl,
      classId: classId || null,
      authorId: session.user.id,
    },
  });

  if (classId) {
    revalidatePath(`/dunia/kelas/${classId}`);
  } else {
    revalidatePath("/perpustakaan");
  }

  return { success: true, materialId: material.id };
}

