import { describe, expect, it } from "vitest";
import {
  sortUserIds,
  verifyClassMembershipForChat,
  type ClassMembershipEntry,
} from "@/lib/chat/chat-utils";
import { sendMessageSchema } from "@/lib/validations/chat";

describe("Validasi dan Utilitas Private Chat Intra-Kelas (Tahap 6)", () => {
  describe("Konsistensi ID Pengguna (sortUserIds)", () => {
    it("selalu mengurutkan user ID alfabetis agar pasangan conversation unik", () => {
      const [u1, u2] = sortUserIds("user_zebra", "user_alpha");
      expect(u1).toBe("user_alpha");
      expect(u2).toBe("user_zebra");

      const [v1, v2] = sortUserIds("user_alpha", "user_zebra");
      expect(v1).toBe("user_alpha");
      expect(v2).toBe("user_zebra");
    });
  });

  describe("Aturan Chat Intra-Kelas (verifyClassMembershipForChat)", () => {
    const memberships: ClassMembershipEntry[] = [
      { userId: "student_1", classId: "class_sija_10a" },
      { userId: "student_2", classId: "class_sija_10a" },
      { userId: "student_tkj", classId: "class_tkj_10b" },
    ];

    it("mengizinkan chat bila kedua murid terdaftar di kelas target", () => {
      const check = verifyClassMembershipForChat(
        "student_1",
        "student_2",
        "class_sija_10a",
        memberships
      );
      expect(check.allowed).toBe(true);
    });

    it("menolak chat bila salah satu murid bukan anggota kelas target", () => {
      const check = verifyClassMembershipForChat(
        "student_1",
        "student_tkj",
        "class_sija_10a",
        memberships
      );
      expect(check.allowed).toBe(false);
      expect(check.reason).toMatch(/tidak berada di kelas yang sama/);
    });

    it("menolak chat ke diri sendiri", () => {
      const check = verifyClassMembershipForChat(
        "student_1",
        "student_1",
        "class_sija_10a",
        memberships
      );
      expect(check.allowed).toBe(false);
      expect(check.reason).toMatch(/diri sendiri/);
    });
  });

  describe("Validasi sendMessageSchema", () => {
    it("menerima payload pesan yang valid", () => {
      const input = {
        classId: "cls-sija-10a",
        targetUserId: "usr-2",
        content: "Halo, boleh pinjam tang crimping di lab nanti?",
      };
      const parsed = sendMessageSchema.safeParse(input);
      expect(parsed.success).toBe(true);
    });

    it("menolak pesan kosong", () => {
      const input = {
        classId: "cls-sija-10a",
        targetUserId: "usr-2",
        content: "   ",
      };
      const parsed = sendMessageSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });
  });
});

