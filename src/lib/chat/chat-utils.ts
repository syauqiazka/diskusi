export interface ClassMembershipEntry {
  userId: string;
  classId: string;
}

export interface UserInConversation {
  id: string;
  name: string;
  displayName?: string | null;
  username?: string | null;
  image?: string | null;
  memberships?: {
    classId: string;
    seatIndex: number | null;
    role: string;
  }[];
}

export interface RawConversationData {
  id: string;
  classId: string;
  class: {
    id: string;
    name: string;
    code: string;
  };
  user1Id: string;
  user1: UserInConversation;
  user2Id: string;
  user2: UserInConversation;
  messages: {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
  }[];
  updatedAt: Date;
}

export interface FormattedConversationListItem {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  otherUser: {
    id: string;
    name: string;
    displayName: string;
    username: string;
    image: string | null;
    seatIndex: number | null;
    role: string;
  };
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
    isSelf: boolean;
  } | null;
  updatedAt: string;
}

/**
 * Menjamin urutan leksikografis (alfabetis) dari dua ID pengguna,
 * sehingga relasi percakapan unik @@unique([classId, user1Id, user2Id])
 * tidak bergantung pada siapa yang mengirim pesan pertama kali.
 */
export function sortUserIds(userA: string, userB: string): [string, string] {
  return userA < userB ? [userA, userB] : [userB, userA];
}

/**
 * Memvalidasi apakah dua pengguna berada di kelas yang sama dan berhak melakukan
 * percakapan pribadi (DM intra-kelas).
 */
export function verifyClassMembershipForChat(
  currentUserId: string,
  targetUserId: string,
  classId: string,
  allMemberships: ClassMembershipEntry[]
): { allowed: boolean; reason?: string } {
  if (currentUserId === targetUserId) {
    return {
      allowed: false,
      reason: "Tidak dapat mengirim pesan ke diri sendiri.",
    };
  }

  const currentUserInClass = allMemberships.some(
    (m) => m.userId === currentUserId && m.classId === classId
  );
  const targetUserInClass = allMemberships.some(
    (m) => m.userId === targetUserId && m.classId === classId
  );

  if (!currentUserInClass || !targetUserInClass) {
    return {
      allowed: false,
      reason:
        "Aturan DM: Anda dan pengguna tujuan tidak berada di kelas yang sama. DM hanya diizinkan antar sesama anggota kelas.",
    };
  }

  return { allowed: true };
}

/**
 * Memformat objek percakapan mentah Prisma menjadi item daftar percakapan
 * untuk antarmuka inbox (Mode Cepat 2D).
 */
export function formatConversationListItem(
  raw: RawConversationData,
  currentUserId: string
): FormattedConversationListItem {
  const isUser1 = raw.user1Id === currentUserId;
  const other = isUser1 ? raw.user2 : raw.user1;

  const membershipInClass = other.memberships?.find((m) => m.classId === raw.classId);
  const seatIndex = membershipInClass?.seatIndex ?? null;
  const role = membershipInClass?.role ?? "STUDENT";

  const latestMsg = raw.messages[0] || null;

  return {
    id: raw.id,
    classId: raw.classId,
    className: raw.class.name,
    classCode: raw.class.code,
    otherUser: {
      id: other.id,
      name: other.name,
      displayName: other.displayName || other.name,
      username: other.username || "siswa",
      image: other.image || null,
      seatIndex,
      role,
    },
    lastMessage: latestMsg
      ? {
          content: latestMsg.content,
          senderId: latestMsg.senderId,
          createdAt: latestMsg.createdAt.toISOString(),
          isSelf: latestMsg.senderId === currentUserId,
        }
      : null,
    updatedAt: raw.updatedAt.toISOString(),
  };
}
