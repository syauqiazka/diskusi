import { describe, expect, it } from "vitest";
import {
  calculateCommentDepth,
  buildCommentTree,
  type RawComment,
} from "@/lib/forum/forum-utils";
import {
  createThreadSchema,
  sanitizeInput,
} from "@/lib/validations/forum";

describe("Validasi dan Utilitas Forum (Tahap 6)", () => {
  describe("Sanitasi Input XSS", () => {
    it("menghapus tag <script> berbahaya dari konten", () => {
      const malicious = "Halo dunia <script>alert('hack')</script> selamat pagi!";
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert('hack')");
      expect(clean).toContain("Halo dunia");
      expect(clean).toContain("selamat pagi!");
    });

    it("menghapus tag <iframe> dan event listener berbahaya", () => {
      const malicious = 'Test <iframe src="evil.com"></iframe> onload=alert(1)';
      const clean = sanitizeInput(malicious);
      expect(clean).not.toContain("<iframe");
      expect(clean).not.toContain("onload=");
    });
  });

  describe("createThreadSchema", () => {
    it("menerima data thread valid untuk Mading Global (classId null)", () => {
      const valid = {
        title: "Konfigurasi MikroTik RouterOS v7 Bridge VLAN",
        content: "Bagaimana cara terbaik mengonfigurasi VLAN filtering di routerboard?",
        category: "JARINGAN & SERVER",
        classId: null,
      };
      const parsed = createThreadSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.classId).toBeNull();
      }
    });

    it("menerima data thread valid untuk Papan Diskusi Kelas (classId diisi)", () => {
      const valid = {
        title: "Tanya Tugas 01 Jaringan Dasar",
        content: "Ada yang tahu cara menghitung subnet mask /28 untuk lab 3?",
        category: "TUGAS",
        classId: "cls-sija-10a",
      };
      const parsed = createThreadSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.classId).toBe("cls-sija-10a");
      }
    });

    it("menolak thread dengan judul terlalu pendek (< 5 karakter)", () => {
      const invalid = {
        title: "Test",
        content: "Isi konten yang panjang dan mendalam di forum sekolah.",
        category: "UMUM",
      };
      const parsed = createThreadSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Komentar Bertingkat (calculateCommentDepth)", () => {
    it("menetapkan depth = 1 untuk komentar tingkat utama (tanpa parent)", () => {
      expect(calculateCommentDepth(null)).toBe(1);
      expect(calculateCommentDepth(undefined)).toBe(1);
    });

    it("menetapkan depth = 2 untuk balasan dari komentar tingkat utama", () => {
      expect(calculateCommentDepth(1)).toBe(2);
    });

    it("menetapkan depth = 3 untuk balasan tingkat kedua", () => {
      expect(calculateCommentDepth(2)).toBe(3);
    });

    it("mengunci batas maksimal nesting pada depth = 3 (clamp)", () => {
      expect(calculateCommentDepth(3)).toBe(3);
      expect(calculateCommentDepth(4)).toBe(3);
    });
  });

  describe("Hierarki Komentar (buildCommentTree)", () => {
    const rawComments: RawComment[] = [
      {
        id: "c1",
        threadId: "t1",
        content: "Komentar utama 1",
        authorId: "u1",
        authorName: "Syauqi",
        depth: 1,
        parentId: null,
        isBestAnswer: false,
        createdAt: new Date("2026-11-11T10:00:00Z"),
      },
      {
        id: "c2",
        threadId: "t1",
        content: "Balasan untuk komentar utama 1",
        authorId: "u2",
        authorName: "Ahmad",
        depth: 2,
        parentId: "c1",
        isBestAnswer: false,
        createdAt: new Date("2026-11-11T10:05:00Z"),
      },
      {
        id: "c3",
        threadId: "t1",
        content: "Balasan level 3",
        authorId: "u1",
        authorName: "Syauqi",
        depth: 3,
        parentId: "c2",
        isBestAnswer: false,
        createdAt: new Date("2026-11-11T10:10:00Z"),
      },
      {
        id: "c4",
        threadId: "t1",
        content: "Komentar utama 2 Jawaban Terbaik",
        authorId: "u3",
        authorName: "Guru Lab",
        depth: 1,
        parentId: null,
        isBestAnswer: true,
        createdAt: new Date("2026-11-11T10:15:00Z"),
      },
    ];

    it("menyusun balasan bersarang ke dalam node replies", () => {
      const tree = buildCommentTree(rawComments);
      expect(tree).toHaveLength(2); // Dua komentar utama (c1 dan c4)
      
      const root1 = tree.find((c) => c.id === "c1");
      expect(root1).toBeDefined();
      expect(root1?.replies).toHaveLength(1);
      expect(root1?.replies[0].id).toBe("c2");
      expect(root1?.replies[0].replies).toHaveLength(1);
      expect(root1?.replies[0].replies[0].id).toBe("c3");
    });
  });
});
