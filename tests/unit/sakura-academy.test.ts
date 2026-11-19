import { describe, it, expect, beforeEach } from "vitest";
import {
  SAKURA_CAMPUS_ZONES,
  SAKURA_MAIN_BUILDING_ROOMS,
  SAKURA_TELEPORT_POINTS,
  CAMPUS_BOUNDS,
} from "@/lib/world/sakura-campus-layout";
import { useSakuraStore } from "@/stores/use-sakura-store";

describe("Sakura Academy Campus Layout & Architecture Specifications", () => {
  it("mendefinisikan batas kampus dan luas ~3 hektar secara proporsional", () => {
    expect(CAMPUS_BOUNDS.width).toBe(240);
    expect(CAMPUS_BOUNDS.depth).toBe(220);
    expect(CAMPUS_BOUNDS.mainGatePosition).toEqual([0, 0, 50]);
  });

  it("memiliki seluruh zona utama sesuai 13 denah gambar master site plan", () => {
    const zoneIds = SAKURA_CAMPUS_ZONES.map((z) => z.id);
    expect(zoneIds).toContain("main_building");
    expect(zoneIds).toContain("auditorium");
    expect(zoneIds).toContain("gymnasium_pool");
    expect(zoneIds).toContain("sports_field");
    expect(zoneIds).toContain("dormitory");
    expect(zoneIds).toContain("culture_building");
    expect(zoneIds).toContain("kyudo_tennis");
    expect(zoneIds).toContain("fountain_plaza");
    expect(zoneIds).toContain("main_gate");
    expect(zoneIds).toContain("bicycle_parking");
  });

  it("memiliki ruangan lengkap di Gedung Utama untuk Lantai 1, 2, 3, dan Okujo", () => {
    const f1Rooms = SAKURA_MAIN_BUILDING_ROOMS.filter((r) => r.floor === 1);
    const f2Rooms = SAKURA_MAIN_BUILDING_ROOMS.filter((r) => r.floor === 2);
    const f3Rooms = SAKURA_MAIN_BUILDING_ROOMS.filter((r) => r.floor === 3);
    const roofAreas = SAKURA_MAIN_BUILDING_ROOMS.filter((r) => r.floor === 4);

    // Lantai 1 (Gambar 5)
    const f1Names = f1Rooms.map((r) => r.name);
    expect(f1Names.some((n) => n.includes("Kelas 1-A"))).toBe(true);
    expect(f1Names.some((n) => n.includes("Kelas 1-B"))).toBe(true);
    expect(f1Names.some((n) => n.includes("Kelas 1-C"))).toBe(true);
    expect(f1Names.some((n) => n.includes("Kelas 1-D"))).toBe(true);
    expect(f1Names).toContain("Lab IPA");
    expect(f1Names).toContain("Ruang Seni");
    expect(f1Names).toContain("Perpustakaan");
    expect(f1Names).toContain("Ruang Guru (Shokuin-shitsu)");
    expect(f1Names).toContain("UKS (Hokenshitsu)");
    expect(f1Names).toContain("Kepala Sekolah");
    expect(f1Names).toContain("Genkan (Loker Sepatu)");

    // Lantai 2 (Gambar 7)
    const f2Names = f2Rooms.map((r) => r.name);
    expect(f2Names).toContain("Kelas 2-A");
    expect(f2Names).toContain("Kelas 2-D");
    expect(f2Names).toContain("Ruang Musik");
    expect(f2Names).toContain("Ruang Komputer");
    expect(f2Names.some((n) => n.includes("Ruang Seminar"))).toBe(true);
    expect(f2Names.some((n) => n.includes("Kafetaria"))).toBe(true);
    expect(f2Names.some((n) => n.includes("Konseling"))).toBe(true);
    expect(f2Names).toContain("Lab Bahasa");
    expect(f2Names.some((n) => n.includes("Void Atrium"))).toBe(true);

    // Lantai 3 (Gambar 8)
    const f3Names = f3Rooms.map((r) => r.name);
    expect(f3Names).toContain("Kelas 3-A");
    expect(f3Names).toContain("Kelas 3-D");
    expect(f3Names.some((n) => n.includes("Karier"))).toBe(true);
    expect(f3Names.some((n) => n.includes("Studio Rekaman"))).toBe(true);
    expect(f3Names.some((n) => n.includes("Ruang Kuliah"))).toBe(true);
    expect(f3Names.some((n) => n.includes("Lab Robotik"))).toBe(true);
    expect(f3Names.some((n) => n.includes("Ruang Klub"))).toBe(true);
    expect(f3Names.some((n) => n.includes("Ruang Sastra"))).toBe(true);

    // Okujo Rooftop (Gambar 10)
    const roofNames = roofAreas.map((r) => r.name);
    expect(roofNames.some((n) => n.includes("Teras Atap"))).toBe(true);
    expect(roofNames.some((n) => n.includes("Observatorium"))).toBe(true);
    expect(roofNames.some((n) => n.includes("Menara Jam"))).toBe(true);
    expect(roofNames.some((n) => n.includes("Kebun"))).toBe(true);
    expect(roofNames.some((n) => n.includes("Panel Surya"))).toBe(true);
  });

  it("memiliki 9 titik teleportasi strategis", () => {
    expect(SAKURA_TELEPORT_POINTS.length).toBeGreaterThanOrEqual(9);
    const pointIds = SAKURA_TELEPORT_POINTS.map((p) => p.id);
    expect(pointIds).toContain("gate");
    expect(pointIds).toContain("fountain");
    expect(pointIds).toContain("genkan");
    expect(pointIds).toContain("classroom");
    expect(pointIds).toContain("auditorium");
    expect(pointIds).toContain("gym");
    expect(pointIds).toContain("field");
    expect(pointIds).toContain("rooftop");
    expect(pointIds).toContain("dormitory");
  });
});

describe("useSakuraStore State Management", () => {
  beforeEach(() => {
    useSakuraStore.setState({
      cameraMode: "orbit",
      selectedFloor: "ALL",
      fieldMode: "BOTH",
      timePreset: "noon",
      timeHour: 12,
      teleportPosition: null,
      hoveredRoom: null,
      activeRoomDetail: null,
      showMinimap: true,
    });
  });

  it("dapat mengubah mode kamera antara orbit dan walk FPS", () => {
    expect(useSakuraStore.getState().cameraMode).toBe("orbit");
    useSakuraStore.getState().setCameraMode("walk");
    expect(useSakuraStore.getState().cameraMode).toBe("walk");
  });

  it("dapat mengatur pemotong lantai (cutaway mode)", () => {
    expect(useSakuraStore.getState().selectedFloor).toBe("ALL");
    useSakuraStore.getState().setSelectedFloor("2F");
    expect(useSakuraStore.getState().selectedFloor).toBe("2F");
    useSakuraStore.getState().setSelectedFloor("ROOF");
    expect(useSakuraStore.getState().selectedFloor).toBe("ROOF");
  });

  it("dapat mengubah mode markings lapangan olahraga (soccer, baseball, both)", () => {
    expect(useSakuraStore.getState().fieldMode).toBe("BOTH");
    useSakuraStore.getState().setFieldMode("SOCCER");
    expect(useSakuraStore.getState().fieldMode).toBe("SOCCER");
    useSakuraStore.getState().setFieldMode("BASEBALL");
    expect(useSakuraStore.getState().fieldMode).toBe("BASEBALL");
  });

  it("dapat memicu teleportasi ke posisi tertentu", () => {
    expect(useSakuraStore.getState().teleportPosition).toBeNull();
    useSakuraStore.getState().teleportTo([10, 2, 20]);
    expect(useSakuraStore.getState().teleportPosition).toEqual([10, 2, 20]);
    useSakuraStore.getState().clearTeleport();
    expect(useSakuraStore.getState().teleportPosition).toBeNull();
  });

  it("dapat mengatur preset waktu dan jam otomatis", () => {
    useSakuraStore.getState().setTimePreset("sunset");
    expect(useSakuraStore.getState().timePreset).toBe("sunset");
    expect(useSakuraStore.getState().timeHour).toBe(17.5);

    useSakuraStore.getState().setTimePreset("night");
    expect(useSakuraStore.getState().timePreset).toBe("night");
    expect(useSakuraStore.getState().timeHour).toBe(21.0);
  });
});
