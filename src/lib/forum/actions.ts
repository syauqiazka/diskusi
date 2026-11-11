"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { ensureForumAndMaterialsSeeded } from "@/lib/db/seed-forum";
import {
  createThreadSchema,
  createCommentSchema,
  voteThreadSchema,
  type CreateThreadInput,
  type CreateCommentInput,
  type VoteThreadInput,
} from "@/lib/validations/forum";
import {
  calculateCommentDepth,
  buildCommentTree,
  type CommentTreeNode,
} from "./forum-utils";

async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

export interface ThreadListItem {
  id: string;
  title: string;
  content: string;
  category: string;
  votes: number;
  isPinned: boolean;
  hasBestAnswer: boolean;
  classId: string | null;
  commentCount: number;
  author: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
  createdAt: string;
}

export interface ThreadDetail extends ThreadListItem {
  comments: CommentTreeNode[];
}

/**
 * Mengambil daftar thread mading publik (classId null) atau diskusi kelas (classId tertentu)
 */
export async function getThreads(options?: {
  classId?: string | null;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ threads: ThreadListItem[]; total: number }> {
  await ensureForumAndMaterialsSeeded();

  const classId = options?.classId !== undefined ? options.classId : null;
  const category = options?.category;
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    classId: classId,
    ...(category && category !== "SEMUA" ? { category } : {}),
  };

  const [rawThreads, total] = await Promise.all([
    prisma.thread.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.thread.count({ where }),
  ]);

  const threads: ThreadListItem[] = rawThreads.map((t) => ({
    id: t.id,
    title: t.title,
    content: t.content,
    category: t.category,
    votes: t.votes,
    isPinned: t.isPinned,
    hasBestAnswer: t.hasBestAnswer,
    classId: t.classId,
    commentCount: t._count.comments,
    author: {
      id: t.author.id,
      name: t.author.name,
      image: t.author.image,
      role: t.author.role,
    },
    createdAt: t.createdAt.toISOString(),
  }));

  return { threads, total };
}

/**
 * Mengambil detail thread beserta komentar bertingkat (maksimal depth 3)
 */
export async function getThreadDetail(threadId: string): Promise<ThreadDetail | null> {
  await ensureForumAndMaterialsSeeded();

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!thread) return null;

  const rawComments = thread.comments.map((c) => ({
    id: c.id,
    threadId: c.threadId,
    content: c.content,
    authorId: c.authorId,
    authorName: c.author.name,
    authorAvatar: c.author.image,
    depth: c.depth,
    parentId: c.parentId,
    isBestAnswer: c.isBestAnswer,
    createdAt: c.createdAt,
  }));

  const comments = buildCommentTree(rawComments);

  return {
    id: thread.id,
    title: thread.title,
    content: thread.content,
    category: thread.category,
    votes: thread.votes,
    isPinned: thread.isPinned,
    hasBestAnswer: thread.hasBestAnswer,
    classId: thread.classId,
    commentCount: thread.comments.length,
    author: {
      id: thread.author.id,
      name: thread.author.name,
      image: thread.author.image,
      role: thread.author.role,
    },
    createdAt: thread.createdAt.toISOString(),
    comments,
  };
}

/**
 * Membuat thread baru di mading publik atau diskusi kelas
 */
export async function createThread(
  rawInput: CreateThreadInput
): Promise<{ success: boolean; threadId?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu untuk menulis thread." };
  }

  const parsed = createThreadSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid." };
  }

  const { title, content, category, classId } = parsed.data;

  // Jika thread kelas, pastikan pengguna adalah anggota kelas
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

  const newThread = await prisma.thread.create({
    data: {
      title,
      content,
      category,
      classId: classId || null,
      authorId: session.user.id,
    },
  });

  if (classId) {
    revalidatePath(`/dunia/kelas/${classId}`);
  } else {
    revalidatePath("/mading");
  }

  return { success: true, threadId: newThread.id };
}

/**
 * Melakukan upvote/downvote pada thread
 */
export async function voteThread(
  rawInput: VoteThreadInput
): Promise<{ success: boolean; votes?: number; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu untuk memberikan suara." };
  }

  const parsed = voteThreadSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: "Parameter vote tidak valid." };
  }

  const { threadId, direction } = parsed.data;
  const delta = direction === "up" ? 1 : -1;

  const updated = await prisma.thread.update({
    where: { id: threadId },
    data: {
      votes: {
        increment: delta,
      },
    },
    select: { votes: true, classId: true },
  });

  if (updated.classId) {
    revalidatePath(`/dunia/kelas/${updated.classId}`);
  } else {
    revalidatePath("/mading");
  }

  return { success: true, votes: updated.votes };
}

/**
 * Menambahkan komentar bertingkat (maksimal depth 3) pada thread
 */
export async function createComment(
  rawInput: CreateCommentInput
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu untuk berkomentar." };
  }

  const parsed = createCommentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid." };
  }

  const { threadId, content, parentId } = parsed.data;

  // Cek keberadaan thread
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { id: true, classId: true },
  });

  if (!thread) {
    return { success: false, error: "Thread tidak ditemukan." };
  }

  // Jika thread kelas, periksa keanggotaan
  if (thread.classId) {
    const membership = await prisma.classMember.findUnique({
      where: {
        userId_classId: {
          userId: session.user.id,
          classId: thread.classId,
        },
      },
    });
    if (!membership) {
      return { success: false, error: "Anda bukan anggota kelas ini." };
    }
  }

  let depth = 1;
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { depth: true },
    });
    depth = calculateCommentDepth(parentComment?.depth);
  }

  const comment = await prisma.comment.create({
    data: {
      threadId,
      authorId: session.user.id,
      content,
      parentId: parentId || null,
      depth,
    },
  });

  if (thread.classId) {
    revalidatePath(`/dunia/kelas/${thread.classId}`);
  } else {
    revalidatePath("/mading");
  }

  return { success: true, commentId: comment.id };
}

/**
 * Menandai komentar sebagai jawaban terbaik (Best Answer)
 */
export async function markBestAnswer(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      thread: {
        select: { id: true, authorId: true, classId: true },
      },
    },
  });

  if (!comment) {
    return { success: false, error: "Komentar tidak ditemukan." };
  }

  // Hanya pembuat thread atau admin yang berhak menandai jawaban terbaik
  if (comment.thread.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "Hanya pembuat thread yang dapat menandai jawaban terbaik." };
  }

  // Reset jawaban terbaik lama di thread ini (bila ada)
  await prisma.comment.updateMany({
    where: { threadId: comment.thread.id, isBestAnswer: true },
    data: { isBestAnswer: false },
  });

  // Tandai komentar ini
  await prisma.comment.update({
    where: { id: commentId },
    data: { isBestAnswer: true },
  });

  // Update status hasBestAnswer pada thread
  await prisma.thread.update({
    where: { id: comment.thread.id },
    data: { hasBestAnswer: true },
  });

  if (comment.thread.classId) {
    revalidatePath(`/dunia/kelas/${comment.thread.classId}`);
  } else {
    revalidatePath("/mading");
  }

  return { success: true };
}

