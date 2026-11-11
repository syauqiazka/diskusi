import { describe, expect, it } from "vitest";

interface Membership {
  userId: string;
  classId: string;
}

export function checkDmEligibility(
  currentUserId: string,
  targetUserId: string,
  allMemberships: Membership[]
): { allowed: boolean; reason?: string } {
  if (currentUserId === targetUserId) {
    return { allowed: false, reason: "Tidak dapat mengirim pesan ke diri sendiri." };
  }

  const myClassIds = new Set(
    allMemberships.filter((m) => m.userId === currentUserId).map((m) => m.classId)
  );

  const sharedClass = allMemberships.find(
    (m) => m.userId === targetUserId && myClassIds.has(m.classId)
  );

  if (!sharedClass) {
    return {
      allowed: false,
      reason:
        "Aturan DM: Anda dan pengguna tujuan tidak berada di kelas yang sama. DM hanya diizinkan antar sesama anggota kelas.",
    };
  }

  return { allowed: true };
}

describe("Aturan Pengiriman Pesan Langsung (DM)", () => {
  const memberships: Membership[] = [
    { userId: "user_a", classId: "class_sija_10a" },
    { userId: "user_b", classId: "class_sija_10a" },
    { userId: "user_c", classId: "class_tkj_10b" },
  ];

  it("mengizinkan DM antar dua pengguna yang berada di kelas yang sama", () => {
    const result = checkDmEligibility("user_a", "user_b", memberships);
    expect(result.allowed).toBe(true);
  });

  it("menolak DM antar pengguna yang berbeda kelas (diskusi global / tidak sekelas)", () => {
    const result = checkDmEligibility("user_a", "user_c", memberships);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/tidak berada di kelas yang sama/);
  });

  it("menolak DM ke diri sendiri", () => {
    const result = checkDmEligibility("user_a", "user_a", memberships);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/ke diri sendiri/);
  });
});

