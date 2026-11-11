export interface ClassMembershipEntry {
  userId: string;
  classId: string;
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

