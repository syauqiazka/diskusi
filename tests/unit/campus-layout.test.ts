import { describe, it, expect } from "vitest";
import { CAMPUS_LAYOUT } from "@/lib/world/campus-layout";
import {
  SCHOOL_ROOMS,
  SCHOOL_STAIR_RAMPS,
  SCHOOL_FURNITURE_COLLIDERS,
  SCHOOL_INTERIOR_INTERACTABLES,
  isRoomInsideSchoolFootprint,
} from "@/lib/world/school-interior-layout";
import { getTerrainHeight } from "@/lib/world/terrain";

describe("SMK TI BAZMA - Campus Layout Data Verification", () => {
  it("harus memiliki konfigurasi lantai asrama tepat 5 lantai (B2, B1, LT 1, LT 2, LT 3)", () => {
    const asrama = CAMPUS_LAYOUT.buildings.asrama;
    expect(asrama.floorCount).toBe(5);
    expect(asrama.floors.length).toBe(5);

    const expectedLabels = ["B2", "B1", "LT 1", "LT 2", "LT 3"];
    const actualLabels = asrama.floors.map((f) => f.label);
    expect(actualLabels).toEqual(expectedLabels);

    // Pastikan elevasi menumpuk secara berurutan
    for (let i = 1; i < asrama.floors.length; i++) {
      expect(asrama.floors[i].relativeY).toBeGreaterThan(asrama.floors[i - 1].relativeY);
    }
  });

  it("harus memiliki konfigurasi lantai sekolah tepat 3 lantai (LT 1, LT 2, LT 3)", () => {
    const sekolah = CAMPUS_LAYOUT.buildings.sekolah;
    expect(sekolah.floorCount).toBe(3);
    expect(sekolah.floors.length).toBe(3);

    const expectedLabels = ["LT 1", "LT 2", "LT 3"];
    const actualLabels = sekolah.floors.map((f) => f.label);
    expect(actualLabels).toEqual(expectedLabels);

    for (let i = 1; i < sekolah.floors.length; i++) {
      expect(sekolah.floors[i].relativeY).toBeGreaterThan(sekolah.floors[i - 1].relativeY);
    }
  });

  it("harus menjaga hubungan spasial: Gerbang -> Turunan -> Asrama (Barat) -> Sekolah (Timur Laut)", () => {
    const gerbang = CAMPUS_LAYOUT.landmarks.find((l) => l.id === "gerbang");
    const turunan = CAMPUS_LAYOUT.landmarks.find((l) => l.id === "turunan_marker");
    const lobby = CAMPUS_LAYOUT.landmarks.find((l) => l.id === "lobby_asrama");
    const asrama = CAMPUS_LAYOUT.buildings.asrama;
    const sekolah = CAMPUS_LAYOUT.buildings.sekolah;

    expect(gerbang).toBeDefined();
    expect(turunan).toBeDefined();
    expect(lobby).toBeDefined();

    // Gerbang di sisi selatan (Z positif terjauh dari pusat)
    expect(gerbang!.position[2]).toBeGreaterThan(turunan!.position[2]);

    // Turunan menghubungkan gerbang menuju lobby
    expect(turunan!.position[2]).toBeGreaterThan(lobby!.position[2]);

    // Asrama dan Lobby berada di sisi barat (X negatif)
    expect(asrama.basePosition[0]).toBeLessThan(0);
    expect(lobby!.position[0]).toBeLessThan(0);

    // Sekolah berada di sektor timur laut (X positif dan Z lebih ke utara / negatif)
    expect(sekolah.basePosition[0]).toBeGreaterThan(0);
    expect(sekolah.basePosition[2]).toBeLessThan(0);
  });

  it("harus memuat properti source (refs | konseptual) pada setiap entitas kawasan", () => {
    const validSources = new Set(["refs", "konseptual"]);

    // Metadata & Ground
    expect(validSources.has(CAMPUS_LAYOUT.metadata.source)).toBe(true);
    expect(validSources.has(CAMPUS_LAYOUT.ground.source)).toBe(true);

    // Landmarks
    CAMPUS_LAYOUT.landmarks.forEach((landmark) => {
      expect(validSources.has(landmark.source)).toBe(true);
    });

    // Pathways
    CAMPUS_LAYOUT.pathways.forEach((path) => {
      expect(validSources.has(path.source)).toBe(true);
    });

    // Buildings (Asrama, Sekolah, Masjid)
    const buildings = [
      CAMPUS_LAYOUT.buildings.asrama,
      CAMPUS_LAYOUT.buildings.sekolah,
      CAMPUS_LAYOUT.buildings.masjid,
    ];
    buildings.forEach((b) => {
      expect(validSources.has(b.source)).toBe(true);

      // Tangga/sirkulasi vertikal WAJIB konseptual
      expect(b.circulationPlaceholder.source).toBe("konseptual");

      // Floors
      b.floors.forEach((f) => {
        expect(validSources.has(f.source)).toBe(true);
      });

      // Wings
      b.wings.forEach((w) => {
        expect(validSources.has(w.source)).toBe(true);
      });
    });

    // Facility Areas (Lapangan)
    CAMPUS_LAYOUT.facilityAreas.forEach((fac) => {
      expect(validSources.has(fac.source)).toBe(true);
    });

    // Retaining Walls
    CAMPUS_LAYOUT.retainingWalls.forEach((wall) => {
      expect(validSources.has(wall.source)).toBe(true);
    });

    // Landscape Stairs
    CAMPUS_LAYOUT.landscapeStairs.forEach((stairs) => {
      expect(validSources.has(stairs.source)).toBe(true);
    });

    // Sports Fixtures
    CAMPUS_LAYOUT.sportsFixtures.forEach((fixture) => {
      expect(validSources.has(fixture.source)).toBe(true);
    });

    // Campus Trees
    CAMPUS_LAYOUT.campusTrees.forEach((tree) => {
      expect(validSources.has(tree.source)).toBe(true);
    });
  });

  it("harus mematuhi hubungan elevasi lantai asrama: B2 < B1 < LT 1 = 0 < LT 2 < LT 3", () => {
    const asramaFloors = CAMPUS_LAYOUT.buildings.asrama.floors;
    const b2 = asramaFloors.find((f) => f.label === "B2");
    const b1 = asramaFloors.find((f) => f.label === "B1");
    const lt1 = asramaFloors.find((f) => f.label === "LT 1");
    const lt2 = asramaFloors.find((f) => f.label === "LT 2");
    const lt3 = asramaFloors.find((f) => f.label === "LT 3");

    expect(b2).toBeDefined();
    expect(b1).toBeDefined();
    expect(lt1).toBeDefined();
    expect(lt2).toBeDefined();
    expect(lt3).toBeDefined();

    // LT 1 sejajar permukaan datum tanah = 0
    expect(lt1!.floorSlabElevation).toBe(0);

    // B1 dan B2 berada di bawah tanah (nilai negatif)
    expect(b2!.floorSlabElevation).toBeLessThan(0);
    expect(b1!.floorSlabElevation).toBeLessThan(0);

    // Hubungan B2 < B1 < LT 1 < LT 2 < LT 3
    expect(b2!.floorSlabElevation).toBeLessThan(b1!.floorSlabElevation);
    expect(b1!.floorSlabElevation).toBeLessThan(lt1!.floorSlabElevation);
    expect(lt1!.floorSlabElevation).toBeLessThan(lt2!.floorSlabElevation);
    expect(lt2!.floorSlabElevation).toBeLessThan(lt3!.floorSlabElevation);

    // Ketinggian relatif loby asrama harus sejajar y = 0
    const lobby = CAMPUS_LAYOUT.landmarks.find((l) => l.id === "lobby_asrama");
    expect(lobby).toBeDefined();
    expect(lobby!.position[1]).toBe(0);
  });

  it("harus memuat zona pengecualian rumput untuk setiap bangunan, loby, turunan, dan jalur", () => {
    const zones = CAMPUS_LAYOUT.exclusionZones;
    expect(Array.isArray(zones)).toBe(true);
    expect(zones.length).toBeGreaterThanOrEqual(6);

    const expectedZoneIds = [
      "ex_asrama_main",
      "ex_asrama_west",
      "ex_lobby",
      "ex_masjid",
      "ex_lapangan",
      "ex_sekolah_north",
      "ex_sekolah_east",
      "ex_turunan",
      "ex_path_school",
    ];

    expectedZoneIds.forEach((id) => {
      const zone = zones.find((z) => z.id === id);
      expect(zone).toBeDefined();
      expect(zone!.maxX).toBeGreaterThan(zone!.minX);
      expect(zone!.maxZ).toBeGreaterThan(zone!.minZ);
      expect(["refs", "konseptual"].includes(zone!.source)).toBe(true);
    });

    // Anggaran bilah rumput maksimal 20.000
    expect(CAMPUS_LAYOUT.grass.maxBlades).toBeLessThanOrEqual(20000);
    expect(CAMPUS_LAYOUT.grass.baseColor).toBeDefined();
  });

  it("harus memvalidasi relasi elevasi medan: gateY > lobbyY = 0 > schoolGroundY dan schoolGroundY < lantai B2 asrama", () => {
    const meta = CAMPUS_LAYOUT.metadata;
    const asrama = CAMPUS_LAYOUT.buildings.asrama;
    const b2Floor = asrama.floors.find((f) => f.label === "B2");

    expect(b2Floor).toBeDefined();

    // 1. Relasi gateY (+4m) > lobbyY (0m) > courtGroundY (-2.5m) > schoolGroundY (-9m)
    expect(meta.gateY).toBeGreaterThan(meta.lobbyY);
    expect(meta.lobbyY).toBe(0);
    expect(meta.lobbyY).toBeGreaterThan(meta.courtGroundY);
    expect(meta.courtGroundY).toBeGreaterThan(meta.schoolGroundY);

    // 2. schoolGroundY (-9m) < lantai B2 asrama (-6m)
    expect(meta.schoolGroundY).toBeLessThan(b2Floor!.floorSlabElevation);

    // 3. Elevasi peron di koordinat gerbang, lobby, masjid, dan sekolah sesuai dengan konstanta
    const heightAtGate = getTerrainHeight(0, 38);
    expect(Math.round(heightAtGate * 10) / 10).toBe(meta.gateY);

    const heightAtLobby = getTerrainHeight(-10, 8);
    expect(Math.round(heightAtLobby * 10) / 10).toBe(meta.lobbyY);

    const heightAtMasjid = getTerrainHeight(10.0, 20.5);
    expect(Math.round(heightAtMasjid * 10) / 10).toBe(meta.lobbyY);

    const heightAtSchool = getTerrainHeight(22, -22);
    expect(Math.round(heightAtSchool * 10) / 10).toBe(meta.schoolGroundY);
  });

  it("harus memastikan ketinggian tanah di sepanjang jalur turunan menurun secara monoton", () => {
    // Turunan berjalan dari Z = 38 ke Z = 10 pada X = 0
    let prevHeight = getTerrainHeight(0, 38);
    for (let z = 37; z >= 10; z -= 1) {
      const currentHeight = getTerrainHeight(0, z);
      expect(currentHeight).toBeLessThanOrEqual(prevHeight);
      prevHeight = currentHeight;
    }

    // Titik ujung turunan Z=10 harus mencapai elevasi lobbyY (0.0m)
    const endHeight = getTerrainHeight(0, 10);
    expect(Math.abs(endHeight)).toBe(0);
  });

  it("harus memastikan tanah di bawah footprint asrama, masjid, lapangan, dan sekolah datar (peron)", () => {
    // Footprint asrama: titik-titik sampel di dalam sayap asrama harus memiliki ketinggian seragam 0.0m
    const asramaSamples = [
      [-22, 0],
      [-22, -10],
      [-22, 6],
      [-28, 7],
      [-18, -15],
    ];
    asramaSamples.forEach(([x, z]) => {
      const h = getTerrainHeight(x, z);
      expect(Math.abs(h)).toBe(0);
    });

    // Footprint masjid: titik sampel di masjid harus 0.0m
    expect(Math.abs(getTerrainHeight(10.0, 20.5))).toBe(0);

    // Footprint lapangan: titik sampel di lapangan tengah harus -2.5m
    expect(getTerrainHeight(13, -4)).toBe(-2.5);

    // Footprint sekolah: titik-titik sampel di dalam gedung sekolah harus memiliki ketinggian seragam -9.0m
    const schoolSamples = [
      [22, -22],
      [15, -30],
      [28, -30],
      [30, -15],
    ];
    schoolSamples.forEach(([x, z]) => {
      const h = getTerrainHeight(x, z);
      expect(h).toBe(-9.0);
    });
  });

  it("interior konseptual sekolah memuat 6 jenis fasilitas wajib, 10 ruang kelas, bertanda konseptual, dan muat di footprint", () => {
    const categories = new Set<string>();
    let kelasCount = 0;

    SCHOOL_ROOMS.forEach((room) => {
      categories.add(room.category);
      if (room.category === "ruang_kelas") kelasCount += 1;
      expect(room.source).toBe("konseptual");
      expect(isRoomInsideSchoolFootprint(room)).toBe(true);
    });

    expect(Array.from(categories).sort()).toEqual([
      "lab_komputer",
      "perpustakaan",
      "ruang_kelas",
      "ruang_konsultansi",
      "ruang_musik",
      "ruang_rapat",
    ]);
    expect(kelasCount).toBe(10);

    SCHOOL_STAIR_RAMPS.forEach((ramp) => {
      expect(ramp.source).toBe("konseptual");
      const run = Math.abs(ramp.endX - ramp.startX);
      if (run > 0.1) {
        const slope = Math.abs(ramp.endY - ramp.startY) / run;
        expect(slope).toBeLessThanOrEqual(CAMPUS_LAYOUT.metadata.maxWalkableSlope);
      }
    });
  });

  it("furnitur & objek interaktif interior Tahap B mencakup seluruh 16 ruangan dan bertanda konseptual", () => {
    expect(SCHOOL_FURNITURE_COLLIDERS.length).toBeGreaterThanOrEqual(25);
    SCHOOL_FURNITURE_COLLIDERS.forEach((col) => {
      expect(col.category).toBe("furniture");
      expect(col.source).toBe("konseptual");
      expect(col.maxX).toBeGreaterThan(col.minX);
      expect(col.maxZ).toBeGreaterThan(col.minZ);
      expect(col.minY).toBeDefined();
      expect(col.maxY).toBeDefined();
      expect(col.maxY!).toBeGreaterThan(col.minY!);
    });

    SCHOOL_ROOMS.forEach((room) => {
      const hasInteractive = SCHOOL_INTERIOR_INTERACTABLES.some((i) => i.roomId === room.id);
      expect(hasInteractive).toBe(true);
    });

    SCHOOL_INTERIOR_INTERACTABLES.forEach((item) => {
      expect(item.source).toBe("konseptual");
      expect(item.details.length).toBeGreaterThanOrEqual(2);
      expect(
        isRoomInsideSchoolFootprint({
          minX: item.position[0] - 0.1,
          maxX: item.position[0] + 0.1,
          minZ: item.position[2] - 0.1,
          maxZ: item.position[2] + 0.1,
        })
      ).toBe(true);
    });
  });
});

