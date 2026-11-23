/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAKURA ACADEMY - SINGLE SOURCE OF TRUTH (campus.ts)
 * Seluruh data spasial bersumber 100% dari src/data/campus.json.
 * Skala: 1 unit = 1 meter. Asal (0,0) = Gerbang Utama. +Z = Utara, +X = Timur, Y = Atas.
 */

import campusJson from "./campus.json";

export interface BoxAABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
}

export interface BuildingDoor {
  id: string;
  x: number;
  z: number;
}

export interface BuildingDefinition {
  id: string;
  label: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  floors: number;
  floorHeight: number;
  facing: "south" | "north" | "east" | "west";
  doors: BuildingDoor[];
  seats?: number;
  students?: number;
  bounds: BoxAABB;
  height: number;
  name: string;
}

export interface ZoneDefinition {
  id: string;
  label: string;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  entry: { x: number; z: number } | null;
  bounds: BoxAABB;
}

export interface PathSegment {
  id: string;
  name: string;
  from: [number, number];
  to: [number, number];
  width: number;
}

export interface RoomScheduleItem {
  id: string;
  name: string;
  nameJa?: string;
  floor: 1 | 2 | 3 | 4; // 4 = Atap Okujo
  wing: "west" | "east" | "center";
  row: "S" | "N" | "C";
  span: number;
  bounds: BoxAABB;
  type:
    | "classroom"
    | "lab"
    | "library"
    | "office"
    | "nurse"
    | "cafeteria"
    | "toilet"
    | "music"
    | "recording"
    | "robotics"
    | "genkan"
    | "auditorium"
    | "gym"
    | "dorm"
    | "culture"
    | "terrace"
    | "observatory"
    | "clocktower"
    | "stairs"
    | "special";
  furnitureType: string;
  doorPosition: [number, number, number];
  description?: string;
  capacity?: string;
}

export const CAMPUS_JSON = campusJson;

// 1. BOUNDARY & FENCE (x0: -100, x1: 100, z0: 0, z1: 240)
export const CAMPUS_BOUNDS = {
  minX: campusJson.fence.x0,
  maxX: campusJson.fence.x1,
  minZ: campusJson.fence.z0,
  maxZ: campusJson.fence.z1,
  width: campusJson.fence.x1 - campusJson.fence.x0,
  depth: campusJson.fence.z1 - campusJson.fence.z0,
  wallHeight: 2.4,
  gateWidth: campusJson.gate.width,
};

// 2. BUILDINGS (Derived directly from campus.json)
export const CAMPUS_BUILDINGS: BuildingDefinition[] = campusJson.buildings.map((b) => ({
  ...b,
  facing: b.facing as "south" | "north" | "east" | "west",
  name: b.label,
  bounds: { minX: b.x0, maxX: b.x1, minZ: b.z0, maxZ: b.z1 },
  height: b.floors * b.floorHeight,
}));

// 3. ZONES (Derived directly from campus.json)
export const CAMPUS_ZONES: ZoneDefinition[] = campusJson.zones.map((z) => ({
  ...z,
  bounds: { minX: z.x0, maxX: z.x1, minZ: z.z0, maxZ: z.z1 },
}));

// 4. PATHS (Derived directly from nodes & edges in campus.json)
const nodes = campusJson.nodes as unknown as Record<string, [number, number]>;
export const CAMPUS_PATHS: PathSegment[] = campusJson.edges.map(([fromNode, toNode], idx) => {
  const fromCoord = nodes[fromNode];
  const toCoord = nodes[toNode];
  return {
    id: `path_${idx}_${fromNode}_${toNode}`,
    name: `Jalur ${fromNode} - ${toNode}`,
    from: fromCoord,
    to: toCoord,
    width: 3.0,
  };
});

// 5. AVENUE SAKURA TREES (x = +-9 every 6m along z 6..36)
export const AVENUE_SAKURA_TREES: [number, number, number][] = [];
for (let z = 6; z <= campusJson.avenue.z1; z += campusJson.avenue.sakuraEvery) {
  AVENUE_SAKURA_TREES.push([-campusJson.avenue.sakuraOffsetX, 0, z]);
  AVENUE_SAKURA_TREES.push([campusJson.avenue.sakuraOffsetX, 0, z]);
}

// 6. MAIN BUILDING ROOM SCHEDULE & MAPPING
const mainBldg = campusJson.buildings.find((b) => b.id === "main")!;
const grid = mainBldg.grid!;

function determineRoomType(name: string): RoomScheduleItem["type"] {
  const n = name.toLowerCase();
  if (n.includes("kelas")) return "classroom";
  if (n.includes("lab")) return n.includes("robot") ? "robotics" : "lab";
  if (n.includes("perpustakaan")) return "library";
  if (n.includes("guru") || n.includes("kepala")) return "office";
  if (n.includes("uks")) return "nurse";
  if (n.includes("kafetaria")) return "cafeteria";
  if (n.includes("toilet")) return "toilet";
  if (n.includes("musik")) return "music";
  if (n.includes("rekaman")) return "recording";
  if (n.includes("genkan")) return "genkan";
  return "special";
}

function determineFurnitureType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("kelas")) return "36_desks_6x6_teacher_blackboard_lockers";
  if (n.includes("lab ipa")) return "lab_chemical_islands_sinks_stools";
  if (n.includes("perpustakaan")) return "wooden_bookshelves_study_desks_lamps";
  if (n.includes("ruang guru")) return "teacher_workstations_pcs_books";
  if (n.includes("kepala sekolah")) return "executive_oak_desk_sofa_credenza";
  if (n.includes("uks")) return "infirmary_beds_privacy_screens_cabinets";
  if (n.includes("kafetaria")) return "dining_tables_chairs_bento_counter";
  if (n.includes("toilet")) return "restroom_cubicles_sinks_mirrors";
  if (n.includes("ruang musik")) return "grand_piano_drumkit_music_stands";
  if (n.includes("studio rekaman")) return "soundproof_panels_audio_mixing_desk";
  if (n.includes("lab robotik")) return "electronics_bench_robotic_arms_3dprinters";
  if (n.includes("ruang komputer")) return "pc_computer_terminal_rows";
  return "general_club_meeting_tables";
}

export const MAIN_BUILDING_ROOMS: RoomScheduleItem[] = [];

// Bangun 42 ruangan akademik dari main.rooms
mainBldg.rooms!.forEach((r) => {
  let curX = r.wing === "west" ? -41 : 5;
  r.bays.forEach((bay, idx) => {
    const x0 = curX;
    const x1 = curX + bay.span * grid.bayWidth;
    const z0 = r.row === "S" ? 100.5 : 111.5;
    const z1 = r.row === "S" ? 108.5 : 119.5;
    const doorZ = r.row === "S" ? 108.5 : 111.5;
    const doorX = (x0 + x1) / 2;
    const floorY = (r.floor - 1) * mainBldg.floorHeight;

    const roomId = `room_f${r.floor}_${r.wing}_${r.row}_${idx}_${bay.name.replace(/\s+/g, "_").toLowerCase()}`;

    MAIN_BUILDING_ROOMS.push({
      id: roomId,
      name: bay.name,
      floor: r.floor as 1 | 2 | 3,
      wing: r.wing as "west" | "east",
      row: r.row as "S" | "N",
      span: bay.span,
      bounds: { minX: x0, maxX: x1, minZ: z0, maxZ: z1, minY: floorY, maxY: floorY + 3.8 },
      type: determineRoomType(bay.name),
      furnitureType: determineFurnitureType(bay.name),
      doorPosition: [doorX, floorY + 1.6, doorZ],
      description: `Ruangan ${bay.name} terletak di Lantai ${r.floor} sayap ${r.wing === "west" ? "Barat" : "Timur"} Gedung Utama.`,
      capacity: bay.name.includes("Kelas") ? "36 Siswa" : bay.span > 1 ? "60-80 Orang" : "30-40 Orang",
    });

    curX = x1;
  });
});

// Tambahkan Genkan Atrium di Lantai 1 (x: -5..5, z: 100.5..119.5)
MAIN_BUILDING_ROOMS.push({
  id: "room_f1_genkan_atrium",
  name: "Genkan (Pintu Masuk & Loker Sepatu)",
  nameJa: "玄関",
  floor: 1,
  wing: "center",
  row: "C",
  span: 2,
  bounds: { minX: -5, maxX: 5, minZ: 100.5, maxZ: 119.5, minY: 0, maxY: 7.8 },
  type: "genkan",
  furnitureType: "600_getabako_shoe_lockers_agari_kamachi",
  doorPosition: [0, 1.6, 100.0],
  description: "Genkan atrium dengan 600 kompartemen loker sepatu kayu dan undakan agari-kamachi.",
  capacity: "600 Siswa",
});

// Tambahkan Area Teras Atap (Okujo) di Lantai 4 (y = 12.0m)
MAIN_BUILDING_ROOMS.push(
  {
    id: "roof_terrace_okujo",
    name: "Teras Atap Sekolah (Okujo)",
    nameJa: "屋上",
    floor: 4,
    wing: "center",
    row: "C",
    span: 4,
    bounds: { minX: -46, maxX: 46, minZ: 100.0, maxZ: 120.0, minY: 12.0, maxY: 14.0 },
    type: "terrace",
    furnitureType: "outdoor_picnic_tables",
    doorPosition: [0, 13.6, 110.0],
    description: "Teras atap terbuka dengan pemandangan seluruh kampus, pagar kawat 2m, dan meja piknik.",
    capacity: "100 Siswa",
  },
  {
    id: "roof_clock_tower",
    name: "Menara Jam Sekolah",
    nameJa: "時計塔",
    floor: 4,
    wing: "center",
    row: "C",
    span: 1,
    bounds: { minX: -3, maxX: 3, minZ: 107.0, maxZ: 113.0, minY: 12.0, maxY: 21.0 },
    type: "clocktower",
    furnitureType: "clock_mechanism",
    doorPosition: [0, 13.6, 107.0],
    description: "Menara jam megah dengan 4 sisi dial jam aktif di atas atap Gedung Utama.",
  },
  {
    id: "roof_observatory",
    name: "Kubah Observatorium Astronomi",
    nameJa: "天文台",
    floor: 4,
    wing: "west",
    row: "C",
    span: 1,
    bounds: { minX: -35, maxX: -29, minZ: 107.0, maxZ: 113.0, minY: 12.0, maxY: 18.0 },
    type: "observatory",
    furnitureType: "astronomy_telescope",
    doorPosition: [-32, 13.6, 107.0],
    description: "Kubah observatorium astronomi klub sains dengan teleskop refraktor besar.",
  }
);

// 7. PRESET TITIK TELEPORTASI
export const SAKURA_TELEPORT_POINTS = [
  { id: "gate", name: "Gerbang Utama (0,0)", pos: [0, 1.6, 2] as [number, number, number] },
  { id: "fountain", name: "Bundaran Air Mancur", pos: [0, 1.6, 62] as [number, number, number] },
  { id: "genkan", name: "Genkan (Pintu Masuk)", pos: [0, 1.6, 100.5] as [number, number, number] },
  { id: "corridor_1f", name: "Koridor Utama Lantai 1", pos: [0, 1.6, 111.0] as [number, number, number] },
  { id: "classroom_1a", name: "Ruang Kelas 1-A", pos: [11.0, 1.6, 105.0] as [number, number, number] },
  { id: "classroom_2a", name: "Ruang Kelas 2-A", pos: [-35.0, 5.6, 105.0] as [number, number, number] },
  { id: "classroom_3a", name: "Ruang Kelas 3-A", pos: [-35.0, 9.6, 105.0] as [number, number, number] },
  { id: "library", name: "Perpustakaan", pos: [-31.0, 1.6, 117.0] as [number, number, number] },
  { id: "science_lab", name: "Lab IPA", pos: [-19.0, 1.6, 117.0] as [number, number, number] },
  { id: "cafeteria", name: "Kafetaria Siswa", pos: [15.0, 5.6, 105.0] as [number, number, number] },
  { id: "auditorium", name: "Aula Teater (800 Kursi)", pos: [38.0, 1.6, 58.0] as [number, number, number] },
  { id: "gym", name: "Gimnasium & Kolam Renang", pos: [52.0, 1.6, 111.0] as [number, number, number] },
  { id: "field", name: "Lapangan Olahraga", pos: [0, 1.6, 178.0] as [number, number, number] },
  { id: "rooftop", name: "Teras Atap (Okujo)", pos: [0, 13.6, 111.0] as [number, number, number] },
  { id: "dormitory", name: "Asrama Siswa", pos: [-38.0, 1.6, 57.0] as [number, number, number] },
  { id: "culture_building", name: "Gedung Budaya", pos: [-48.0, 1.6, 106.0] as [number, number, number] },
];
