import { describe, expect, it } from "vitest";
import {
  createMaterialSchema,
  createAnnouncementSchema,
} from "@/lib/validations/materials";

describe("Validasi Materi dan Pengumuman (Tahap 6)", () => {
  describe("createMaterialSchema", () => {
    it("menerima materi perpustakaan terbuka valid (classId null)", () => {
      const valid = {
        title: "Modul Praktikum Jaringan Komputer Dasar",
        description: "Panduan konfigurasi routing statis dan DHCP server",
        category: "JARINGAN & SERVER",
        fileFormat: "PDF",
        fileSize: "4.2 MB",
        fileUrl: "/materials/modul-jarkom-dasar.pdf",
        classId: null,
      };
      const parsed = createMaterialSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.classId).toBeNull();
      }
    });

    it("menerima materi rak privat kelas valid (classId ada)", () => {
      const valid = {
        title: "Slide Kuliah 04: Pengalamatan IPv6",
        description: "Materi struktur pengalamatan IPv6",
        category: "MATERI KELAS",
        fileFormat: "PDF",
        fileSize: "3.1 MB",
        fileUrl: "/materials/slide-ipv6.pdf",
        classId: "cls-sija-10a",
      };
      const parsed = createMaterialSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.classId).toBe("cls-sija-10a");
      }
    });

    it("menolak materi dengan judul terlalu pendek (< 3 karakter)", () => {
      const invalid = {
        title: "AB",
        category: "UMUM",
        fileUrl: "/materials/doc.pdf",
      };
      const parsed = createMaterialSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe("createAnnouncementSchema", () => {
    it("menerima pengumuman kelas yang valid", () => {
      const valid = {
        classId: "cls-sija-10a",
        title: "Praktikum Jaringan Dasar Pekan Depan",
        content: "Harap membawa kabel UTP Cat5e/6 masing-masing minimal 2 meter.",
        isPinned: true,
      };
      const parsed = createAnnouncementSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("menolak pengumuman tanpa classId", () => {
      const invalid = {
        classId: "",
        title: "Pengumuman Penting",
        content: "Isi pengumuman lengkap untuk kelas.",
      };
      const parsed = createAnnouncementSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });
});

