"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { ensureForumAndMaterialsSeeded } from "@/lib/db/seed-forum";
import {
  createAnnouncementSchema,
  type CreateAnnouncementInput,
} from "@/lib/validations/materials";

async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

export interface AnnouncementListItem {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  classId: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
}

/**
 * Mengambil daftar pengumuman untuk kelas tertentu
 */
export async function getAnnouncements(classId: string): Promise<AnnouncementListItem[]> {
  await ensureForumAndMaterialsSeeded();

  const raw = await prisma.announcement.findMany({
    where: { classId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return raw.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    isPinned: a.isPinned,
    classId: a.classId,
    author: {
      id: a.author.id,
      name: a.author.name,
    },
    createdAt: a.createdAt.toISOString(),
  }));
}

/**
 * Membuat pengumuman baru untuk kelas (khusus pengajar atau asisten atau admin)
 */
export async function createAnnouncement(
  rawInput: CreateAnnouncementInput
): Promise<{ success: boolean; announcementId?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  const parsed = createAnnouncementSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid." };
  }

  const { classId, title, content, isPinned } = parsed.data;

  // Cek peran di kelas
  const membership = await prisma.classMember.findUnique({
    where: {
      userId_classId: {
        userId: session.user.id,
        classId,
      },
    },
  });

  if (!membership && session.user.role !== "ADMIN") {
    return { success: false, error: "Anda bukan anggota kelas ini." };
  }

  const announcement = await prisma.announcement.create({
    data: {
      classId,
      title,
      content,
      isPinned,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/dunia/kelas/${classId}`);

  return { success: true, announcementId: announcement.id };
}

