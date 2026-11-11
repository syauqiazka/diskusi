import { describe, expect, it } from "vitest";
import {
  CLASSROOM_BOUNDS,
  clampClassroomPosition,
  calculateDeskGridPosition,
} from "@/lib/classroom/classroom-math";

describe("Matematika Spasial Ruang Kelas 3D (Tahap 5)", () => {
  describe("Boundary Collision Clamp", () => {
    it("membatasi posisi pemain agar tidak keluar dari dinding ruang kelas", () => {
      // Pemain mencoba menembus dinding kiri (x: -15)
      const clampedLeft = clampClassroomPosition(-15, 0);
      expect(clampedLeft.x).toBe(CLASSROOM_BOUNDS.minX);
      expect(clampedLeft.z).toBe(0);

      // Pemain mencoba menembus dinding kanan (x: 20)
      const clampedRight = clampClassroomPosition(20, 0);
      expect(clampedRight.x).toBe(CLASSROOM_BOUNDS.maxX);

      // Pemain mencoba menembus papan tulis depan (z: -12)
      const clampedFront = clampClassroomPosition(0, -12);
      expect(clampedFront.z).toBe(CLASSROOM_BOUNDS.minZ);

      // Pemain mencoba menembus dinding belakang (z: 15)
      const clampedBack = clampClassroomPosition(0, 15);
      expect(clampedBack.z).toBe(CLASSROOM_BOUNDS.maxZ);
    });

    it("mempertahankan koordinat pemain ketika berada di dalam batas ruangan", () => {
      const inside = clampClassroomPosition(1.5, -2.0);
      expect(inside.x).toBe(1.5);
      expect(inside.z).toBe(-2.0);
    });
  });

  describe("Grid 30 Meja Siswa (Standard-30)", () => {
    it("menghitung posisi meja yang valid untuk seatIndex 0 s.d. 29", () => {
      const desk0 = calculateDeskGridPosition(0);
      expect(desk0).toHaveLength(3); // [x, y, z]
      expect(desk0[1]).toBe(0); // Ketinggian lantai y = 0

      const desk29 = calculateDeskGridPosition(29);
      expect(desk29).toHaveLength(3);
      expect(desk29[1]).toBe(0);
    });

    it("memastikan seluruh 30 meja memiliki posisi spasial yang unik tanpa tumpang tindih", () => {
      const positions = new Set<string>();

      for (let i = 0; i < 30; i++) {
        const [x, , z] = calculateDeskGridPosition(i);
        const key = `${x.toFixed(2)},${z.toFixed(2)}`;
        expect(positions.has(key)).toBe(false); // Tidak boleh ada posisi duplikat
        positions.add(key);
      }

      expect(positions.size).toBe(30);
    });

    it("memastikan seluruh meja berada di dalam batas ruangan kelas", () => {
      for (let i = 0; i < 30; i++) {
        const [x, , z] = calculateDeskGridPosition(i);
        expect(x).toBeGreaterThan(CLASSROOM_BOUNDS.minX);
        expect(x).toBeLessThan(CLASSROOM_BOUNDS.maxX);
        expect(z).toBeGreaterThan(CLASSROOM_BOUNDS.minZ);
        expect(z).toBeLessThan(CLASSROOM_BOUNDS.maxZ);
      }
    });
  });
});
