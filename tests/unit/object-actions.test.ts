import { describe, expect, it } from "vitest";
import {
  parseDoorStatus,
  formatLokerProfile,
  validateBioInput,
  type RawClassData,
  type RawUserData,
} from "@/lib/classroom/object-utils";

describe("Logika Integrasi Objek Interaktif (Tahap 4)", () => {
  describe("Pintu Kelas - parseDoorStatus", () => {
    it("mengembalikan status terkunci jika pengguna belum login", () => {
      const rawClass: RawClassData = {
        id: "cls-1",
        name: "SIJA 10A",
        code: "SIJA-10A",
        description: "Kelas SIJA",
        roomLayout: "standard-30",
        members: [],
      };

      const result = parseDoorStatus(null, rawClass);
      expect(result.isMember).toBe(false);
      expect(result.isLocked).toBe(true);
      expect(result.classCode).toBe("SIJA-10A");
    });

    it("mengembalikan status terkunci jika pengguna login tetapi bukan anggota", () => {
      const rawClass: RawClassData = {
        id: "cls-1",
        name: "SIJA 10A",
        code: "SIJA-10A",
        description: "Kelas SIJA",
        roomLayout: "standard-30",
        members: [
          { userId: "other-user", role: "STUDENT", seatIndex: 0 },
        ],
      };

      const result = parseDoorStatus("user-123", rawClass);
      expect(result.isMember).toBe(false);
      expect(result.isLocked).toBe(true);
      expect(result.classId).toBe("cls-1");
    });

    it("mengembalikan status terbuka jika pengguna adalah anggota kelas", () => {
      const rawClass: RawClassData = {
        id: "cls-1",
        name: "SIJA 10A",
        code: "SIJA-10A",
        description: "Kelas SIJA",
        roomLayout: "standard-30",
        members: [
          { userId: "user-123", role: "STUDENT", seatIndex: 4 },
        ],
      };

      const result = parseDoorStatus("user-123", rawClass);
      expect(result.isMember).toBe(true);
      expect(result.isLocked).toBe(false);
      expect(result.role).toBe("STUDENT");
      expect(result.seatIndex).toBe(4);
    });
  });

  describe("Loker Siswa - formatLokerProfile & validateBioInput", () => {
    it("mengembalikan status tamu ketika tidak ada sesi", () => {
      const result = formatLokerProfile(null);
      expect(result.isLoggedIn).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.classes).toEqual([]);
    });

    it("memformat data pengguna aktif dan daftar kelas dengan benar", () => {
      const rawUser: RawUserData = {
        id: "usr-1",
        name: "Syauqi",
        username: "syauqi_dev",
        displayName: "Syauqi",
        bio: "Siswa SIJA",
        role: "MEMBER",
        email: "syauqi@example.com",
        activeFrameId: "frame-caution",
        activeEffectId: null,
        memberships: [
          {
            seatIndex: 2,
            role: "STUDENT",
            class: {
              id: "cls-1",
              name: "SIJA 10A",
              code: "SIJA-10A",
            },
          },
        ],
      };

      const result = formatLokerProfile(rawUser);
      expect(result.isLoggedIn).toBe(true);
      expect(result.user?.username).toBe("syauqi_dev");
      expect(result.classes.length).toBe(1);
      expect(result.classes[0].classCode).toBe("SIJA-10A");
      expect(result.classes[0].seatIndex).toBe(2);
    });

    it("memvalidasi dan menolak bio yang terlalu panjang (>200 karakter)", () => {
      const longBio = "A".repeat(201);
      const res = validateBioInput(longBio);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("maksimal 200");
    });

    it("memvalidasi dan membersihkan whitespace bio yang valid", () => {
      const bio = "   Siswa SIJA SMK TI BAZMA   ";
      const res = validateBioInput(bio);
      expect(res.valid).toBe(true);
      expect(res.cleaned).toBe("Siswa SIJA SMK TI BAZMA");
    });
  });

  describe("Katalog Kosmetik Cermin - Default Catalog", () => {
    it("memiliki katalog bingkai dan efek bawaan sesuai tema retro-liminal", async () => {
      const { DEFAULT_AVATAR_FRAMES, DEFAULT_PROFILE_EFFECTS } = await import(
        "@/lib/db/seed-cosmetics"
      );
      expect(DEFAULT_AVATAR_FRAMES.length).toBeGreaterThanOrEqual(4);
      expect(DEFAULT_AVATAR_FRAMES.some((f) => f.slug === "frame-caution")).toBe(true);
      expect(DEFAULT_AVATAR_FRAMES.some((f) => f.slug === "frame-cyan")).toBe(true);
      expect(DEFAULT_PROFILE_EFFECTS.some((e) => e.slug === "effect-glow")).toBe(true);
    }, 15000);
  });
});

