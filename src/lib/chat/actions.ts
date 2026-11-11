"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import {
  sortUserIds,
  verifyClassMembershipForChat,
} from "./chat-utils";
import {
  sendMessageSchema,
  type SendMessageInput,
} from "@/lib/validations/chat";

async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isSelf: boolean;
}

export interface ConversationDetail {
  id: string;
  classId: string;
  otherUser: {
    id: string;
    name: string;
    image: string | null;
  };
  messages: ChatMessageItem[];
}

/**
 * Mengambil atau membuat percakapan DM intra-kelas antara pengguna aktif dan target murid
 */
export async function getOrCreateConversation(
  classId: string,
  targetUserId: string
): Promise<{ success: boolean; conversation?: ConversationDetail; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  const currentUserId = session.user.id;

  // Verifikasi keanggotaan kelas kedua pihak
  const memberships = await prisma.classMember.findMany({
    where: {
      classId,
      userId: { in: [currentUserId, targetUserId] },
    },
    select: { userId: true, classId: true },
  });

  const check = verifyClassMembershipForChat(
    currentUserId,
    targetUserId,
    classId,
    memberships
  );

  if (!check.allowed) {
    return { success: false, error: check.reason };
  }

  const [user1Id, user2Id] = sortUserIds(currentUserId, targetUserId);

  let conversation = await prisma.conversation.findUnique({
    where: {
      classId_user1Id_user2Id: {
        classId,
        user1Id,
        user2Id,
      },
    },
    include: {
      user1: { select: { id: true, name: true, image: true } },
      user2: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        classId,
        user1Id,
        user2Id,
      },
      include: {
        user1: { select: { id: true, name: true, image: true } },
        user2: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  const otherUser =
    conversation.user1Id === currentUserId ? conversation.user2 : conversation.user1;

  const messages: ChatMessageItem[] = conversation.messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    senderName: m.sender.name,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    isSelf: m.senderId === currentUserId,
  }));

  return {
    success: true,
    conversation: {
      id: conversation.id,
      classId: conversation.classId,
      otherUser,
      messages,
    },
  };
}

/**
 * Mengirim pesan DM intra-kelas ke sesama anggota kelas
 */
export async function sendMessage(
  rawInput: SendMessageInput
): Promise<{ success: boolean; message?: ChatMessageItem; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  const parsed = sendMessageSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Input pesan tidak valid." };
  }

  const { classId, targetUserId, content } = parsed.data;
  const currentUserId = session.user.id;

  // Verifikasi keanggotaan kelas
  const memberships = await prisma.classMember.findMany({
    where: {
      classId,
      userId: { in: [currentUserId, targetUserId] },
    },
    select: { userId: true, classId: true },
  });

  const check = verifyClassMembershipForChat(
    currentUserId,
    targetUserId,
    classId,
    memberships
  );

  if (!check.allowed) {
    return { success: false, error: check.reason };
  }

  const [user1Id, user2Id] = sortUserIds(currentUserId, targetUserId);

  // Ambil atau buat percakapan
  const conversation = await prisma.conversation.upsert({
    where: {
      classId_user1Id_user2Id: {
        classId,
        user1Id,
        user2Id,
      },
    },
    update: {
      updatedAt: new Date(),
    },
    create: {
      classId,
      user1Id,
      user2Id,
    },
  });

  const newMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: currentUserId,
      content,
    },
    include: {
      sender: { select: { name: true } },
    },
  });

  return {
    success: true,
    message: {
      id: newMessage.id,
      senderId: newMessage.senderId,
      senderName: newMessage.sender.name,
      content: newMessage.content,
      createdAt: newMessage.createdAt.toISOString(),
      isSelf: true,
    },
  };
}

/**
 * Mengambil riwayat pesan dari ID percakapan
 */
export async function getConversationMessages(
  conversationId: string
): Promise<{ success: boolean; messages?: ChatMessageItem[]; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!conversation) {
    return { success: false, error: "Percakapan tidak ditemukan." };
  }

  // Pastikan user adalah salah satu pihak
  if (
    conversation.user1Id !== session.user.id &&
    conversation.user2Id !== session.user.id
  ) {
    return { success: false, error: "Akses percakapan ditolak." };
  }

  const messages: ChatMessageItem[] = conversation.messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    senderName: m.sender.name,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    isSelf: m.senderId === session.user.id,
  }));

  return { success: true, messages };
}

