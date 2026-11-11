import { describe, expect, it } from "vitest";
import {
  sortUserIds,
  verifyClassMembershipForChat,
  formatConversationListItem,
  type ClassMembershipEntry,
  type RawConversationData,
} from "@/lib/chat/chat-utils";
import { sendMessageSchema } from "@/lib/validations/chat";

describe("Validasi dan Utilitas Private Chat Intra-Kelas (Tahap 6 & 7)", () => {
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

  describe("Format Inbox Percakapan (formatConversationListItem)", () => {
    it("memformat data percakapan mentah dan mengekstrak nomor meja rekan sekelas", () => {
      const raw: RawConversationData = {
        id: "conv-1",
        classId: "cls-sija-10a",
        class: {
          id: "cls-sija-10a",
          name: "SIJA 10A",
          code: "SIJA-10A",
        },
        user1Id: "user-current",
        user1: {
          id: "user-current",
          name: "Saya",
        },
        user2Id: "user-rekan",
        user2: {
          id: "user-rekan",
          name: "Rizky Firmansyah",
          displayName: "Rizky",
          username: "rizky_net",
          memberships: [
            {
              classId: "cls-sija-10a",
              seatIndex: 4,
              role: "STUDENT",
            },
          ],
        },
        messages: [
          {
            id: "msg-99",
            senderId: "user-rekan",
            content: "Sudah selesai konfigurasi OSPF?",
            createdAt: new Date("2026-11-11T12:00:00Z"),
          },
        ],
        updatedAt: new Date("2026-11-11T12:00:00Z"),
      };

      const formatted = formatConversationListItem(raw, "user-current");
      expect(formatted.id).toBe("conv-1");
      expect(formatted.otherUser.displayName).toBe("Rizky");
      expect(formatted.otherUser.seatIndex).toBe(4);
      expect(formatted.otherUser.role).toBe("STUDENT");
      expect(formatted.lastMessage?.content).toBe("Sudah selesai konfigurasi OSPF?");
      expect(formatted.lastMessage?.isSelf).toBe(false);
    });
  });
});
