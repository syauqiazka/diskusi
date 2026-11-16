/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CAMPUS_ELEVATIONS } from './campus-elevations';

export type SchoolFacilityCategory =
  | 'lab_komputer'
  | 'ruang_rapat'
  | 'ruang_konsultansi'
  | 'ruang_kelas'
  | 'perpustakaan'
  | 'ruang_musik';

export interface BoxCollider3D {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
  category: 'building' | 'wall' | 'landmark' | 'masjid' | 'interactable' | 'furniture';
  source: 'refs' | 'konseptual';
}

export interface WalkableFloorSlab {
  id: string;
  floorLevel: 1 | 2 | 3;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
  thickness: number;
  source: 'konseptual';
}

export interface InteriorStairRamp {
  id: string;
  fromFloor: 1 | 2;
  toFloor: 2 | 3;
  lane: 'north_up' | 'south_up';
  startX: number;
  endX: number;
  minZ: number;
  maxZ: number;
  startY: number;
  endY: number;
  stepsCount: number;
  source: 'konseptual';
}

export interface SchoolWallSegment {
  id: string;
  floorLevel: 1 | 2 | 3;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
  kind: 'exterior' | 'partition' | 'glass_partition' | 'railing' | 'arch_curb';
  hasWindow?: boolean;
  source: 'konseptual';
}

export interface SchoolRoomDefinition {
  id: string;
  name: string;
  floorLevel: 1 | 2 | 3;
  floorY: number;
  category: SchoolFacilityCategory;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  doorPosition: [number, number, number];
  doorFacing: 'south' | 'west';
  source: 'konseptual';
}

export interface SchoolInteriorInteractable {
  id: string;
  roomId: string;
  category: SchoolFacilityCategory;
  label: string;
  actionLabel: string;
  description: string;
  details: string[];
  position: [number, number, number];
  rotationY: number;
  dimensions: [number, number, number];
  source: 'konseptual';
}

export const SCHOOL_FLOOR_HEIGHT = 3.4;
export const SCHOOL_SLAB_THICKNESS = 0.2;
export const SCHOOL_CLEAR_HEIGHT = SCHOOL_FLOOR_HEIGHT - SCHOOL_SLAB_THICKNESS; // 3.2m
export const SCHOOL_LT1_Y = CAMPUS_ELEVATIONS.schoolGroundY; // -9.0
export const SCHOOL_LT2_Y = SCHOOL_LT1_Y + SCHOOL_FLOOR_HEIGHT; // -5.6
export const SCHOOL_LT3_Y = SCHOOL_LT2_Y + SCHOOL_FLOOR_HEIGHT; // -2.2
export const SCHOOL_ROOF_Y = SCHOOL_LT3_Y + SCHOOL_FLOOR_HEIGHT; // +1.2

export const SCHOOL_WINGS_BOUNDS = {
  north: { minX: 8.0, maxX: 36.0, minZ: -35.5, maxZ: -24.5 },
  east: { minX: 25.0, maxX: 36.0, minZ: -25.5, maxZ: -3.5 },
} as const;

export const SCHOOL_MAIN_ENTRANCE = {
  id: 'school_main_entrance',
  name: 'Pintu Masuk Utama Gedung Sekolah',
  minX: 11.5,
  maxX: 14.5,
  z: -24.5,
  y: SCHOOL_LT1_Y,
  source: 'konseptual' as const,
};

export const SCHOOL_STAIR_CORE = {
  id: 'sekolah_stair_core',
  name: 'Inti Tangga Utama Sekolah (LT 1 - LT 3)',
  minX: 27.5,
  maxX: 36.0,
  voidMinX: 28.0,
  voidMaxX: 35.8,
  minZ: -24.5,
  maxZ: -20.5,
  voidMinZ: -24.3,
  voidMaxZ: -20.7,
  runStartX: 28.0,
  runEndX: 33.0,
  landingMinX: 33.0,
  landingMaxX: 35.8,
  northLaneMinZ: -24.3,
  northLaneMaxZ: -22.6,
  southLaneMinZ: -22.4,
  southLaneMaxZ: -20.7,
  source: 'konseptual' as const,
};

export const SCHOOL_ROOMS: SchoolRoomDefinition[] = [
  // ======================== LT 1 (-9.0m) ========================
  {
    id: 'lt1_rapat',
    name: 'Ruang Rapat',
    floorLevel: 1,
    floorY: SCHOOL_LT1_Y,
    category: 'ruang_rapat',
    minX: 8.0,
    maxX: 17.5,
    minZ: -35.5,
    maxZ: -27.0,
    doorPosition: [13.0, SCHOOL_LT1_Y, -27.0],
    doorFacing: 'south',
    source: 'konseptual',
  },
  {
    id: 'lt1_konsultansi',
    name: 'Ruang Konsultansi',
    floorLevel: 1,
    floorY: SCHOOL_LT1_Y,
    category: 'ruang_konsultansi',
    minX: 17.5,
    maxX: 22.5,
    minZ: -35.5,
    maxZ: -27.0,
    doorPosition: [20.0, SCHOOL_LT1_Y, -27.0],
    doorFacing: 'south',
    source: 'konseptual',
  },
  {
    id: 'lt1_musik',
    name: 'Ruang Musik',
    floorLevel: 1,
    floorY: SCHOOL_LT1_Y,
    category: 'ruang_musik',
    minX: 22.5,
    maxX: 27.5,
    minZ: -35.5,
    maxZ: -27.0,
    doorPosition: [25.0, SCHOOL_LT1_Y, -27.0],
    doorFacing: 'south',
    source: 'konseptual',
  },
  {
    id: 'lt1_perpustakaan',
    name: 'Perpustakaan',
    floorLevel: 1,
    floorY: SCHOOL_LT1_Y,
    category: 'perpustakaan',
    minX: 27.5,
    maxX: 36.0,
    minZ: -35.5,
    maxZ: -24.5,
    doorPosition: [27.5, SCHOOL_LT1_Y, -25.75],
    doorFacing: 'west',
    source: 'konseptual',
  },
  {
    id: 'lt1_kelas_1',
    name: 'Ruang Kelas 1',
    floorLevel: 1,
    floorY: SCHOOL_LT1_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -20.5,
    maxZ: -12.0,
    doorPosition: [27.5, SCHOOL_LT1_Y, -16.25],
    doorFacing: 'west',
    source: 'konseptual',
  },
  {
    id: 'lt1_kelas_2',
    name: 'Ruang Kelas 2',
    floorLevel: 1,
    floorY: SCHOOL_LT1_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -12.0,
    maxZ: -3.5,
    doorPosition: [27.5, SCHOOL_LT1_Y, -7.75],
    doorFacing: 'west',
    source: 'konseptual',
  },

  // ======================== LT 2 (-5.6m) ========================
  {
    id: 'lt2_lab_komputer',
    name: 'Lab Komputer',
    floorLevel: 2,
    floorY: SCHOOL_LT2_Y,
    category: 'lab_komputer',
    minX: 8.0,
    maxX: 27.5,
    minZ: -35.5,
    maxZ: -27.0,
    doorPosition: [13.0, SCHOOL_LT2_Y, -27.0],
    doorFacing: 'south',
    source: 'konseptual',
  },
  {
    id: 'lt2_kelas_3',
    name: 'Ruang Kelas 3',
    floorLevel: 2,
    floorY: SCHOOL_LT2_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -35.5,
    maxZ: -24.5,
    doorPosition: [27.5, SCHOOL_LT2_Y, -25.75],
    doorFacing: 'west',
    source: 'konseptual',
  },
  {
    id: 'lt2_kelas_4',
    name: 'Ruang Kelas 4',
    floorLevel: 2,
    floorY: SCHOOL_LT2_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -20.5,
    maxZ: -12.0,
    doorPosition: [27.5, SCHOOL_LT2_Y, -16.25],
    doorFacing: 'west',
    source: 'konseptual',
  },
  {
    id: 'lt2_kelas_5',
    name: 'Ruang Kelas 5',
    floorLevel: 2,
    floorY: SCHOOL_LT2_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -12.0,
    maxZ: -3.5,
    doorPosition: [27.5, SCHOOL_LT2_Y, -7.75],
    doorFacing: 'west',
    source: 'konseptual',
  },

  // ======================== LT 3 (-2.2m) ========================
  {
    id: 'lt3_kelas_6',
    name: 'Ruang Kelas 6',
    floorLevel: 3,
    floorY: SCHOOL_LT3_Y,
    category: 'ruang_kelas',
    minX: 8.0,
    maxX: 18.0,
    minZ: -35.5,
    maxZ: -27.0,
    doorPosition: [13.0, SCHOOL_LT3_Y, -27.0],
    doorFacing: 'south',
    source: 'konseptual',
  },
  {
    id: 'lt3_kelas_7',
    name: 'Ruang Kelas 7',
    floorLevel: 3,
    floorY: SCHOOL_LT3_Y,
    category: 'ruang_kelas',
    minX: 18.0,
    maxX: 27.5,
    minZ: -35.5,
    maxZ: -27.0,
    doorPosition: [22.75, SCHOOL_LT3_Y, -27.0],
    doorFacing: 'south',
    source: 'konseptual',
  },
  {
    id: 'lt3_kelas_8',
    name: 'Ruang Kelas 8',
    floorLevel: 3,
    floorY: SCHOOL_LT3_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -35.5,
    maxZ: -24.5,
    doorPosition: [27.5, SCHOOL_LT3_Y, -25.75],
    doorFacing: 'west',
    source: 'konseptual',
  },
  {
    id: 'lt3_kelas_9',
    name: 'Ruang Kelas 9',
    floorLevel: 3,
    floorY: SCHOOL_LT3_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -20.5,
    maxZ: -12.0,
    doorPosition: [27.5, SCHOOL_LT3_Y, -16.25],
    doorFacing: 'west',
    source: 'konseptual',
  },
  {
    id: 'lt3_kelas_10',
    name: 'Ruang Kelas 10',
    floorLevel: 3,
    floorY: SCHOOL_LT3_Y,
    category: 'ruang_kelas',
    minX: 27.5,
    maxX: 36.0,
    minZ: -12.0,
    maxZ: -3.5,
    doorPosition: [27.5, SCHOOL_LT3_Y, -7.75],
    doorFacing: 'west',
    source: 'konseptual',
  },
];

// Pelat lantai berjalan (dengan bukaan void tepat di atas sekolah_stair_core untuk LT 2 & LT 3)
export const SCHOOL_FLOOR_SLABS: WalkableFloorSlab[] = [
  // LT 1 (-9.0m): pelat dasar penuh
  {
    id: 'slab_lt1_north',
    floorLevel: 1,
    minX: 8.0,
    maxX: 36.0,
    minZ: -35.5,
    maxZ: -24.5,
    y: SCHOOL_LT1_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
  {
    id: 'slab_lt1_east',
    floorLevel: 1,
    minX: 25.0,
    maxX: 36.0,
    minZ: -24.5,
    maxZ: -3.5,
    y: SCHOOL_LT1_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },

  // LT 2 (-5.6m): terpotong rapi di void tangga X:[28.0, 35.8], Z:[-24.3, -20.7]
  {
    id: 'slab_lt2_north',
    floorLevel: 2,
    minX: 8.0,
    maxX: 36.0,
    minZ: -35.5,
    maxZ: -24.5,
    y: SCHOOL_LT2_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
  {
    id: 'slab_lt2_stair_vestibule',
    floorLevel: 2,
    minX: 25.0,
    maxX: 28.0,
    minZ: -24.5,
    maxZ: -20.5,
    y: SCHOOL_LT2_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
  {
    id: 'slab_lt2_east_south',
    floorLevel: 2,
    minX: 25.0,
    maxX: 36.0,
    minZ: -20.5,
    maxZ: -3.5,
    y: SCHOOL_LT2_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },

  // LT 3 (-2.2m): terpotong rapi di void tangga X:[28.0, 35.8], Z:[-24.3, -20.7]
  {
    id: 'slab_lt3_north',
    floorLevel: 3,
    minX: 8.0,
    maxX: 36.0,
    minZ: -35.5,
    maxZ: -24.5,
    y: SCHOOL_LT3_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
  {
    id: 'slab_lt3_stair_vestibule',
    floorLevel: 3,
    minX: 25.0,
    maxX: 28.0,
    minZ: -24.5,
    maxZ: -20.5,
    y: SCHOOL_LT3_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
  {
    id: 'slab_lt3_east_south',
    floorLevel: 3,
    minX: 25.0,
    maxX: 36.0,
    minZ: -20.5,
    maxZ: -3.5,
    y: SCHOOL_LT3_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
];

// Langit-langit atap di atas LT 3 (penahan benturan kepala saat lompat)
export const SCHOOL_ROOF_CEILING_SLABS: WalkableFloorSlab[] = [
  {
    id: 'roof_north_ceiling',
    floorLevel: 3,
    minX: 8.0,
    maxX: 36.0,
    minZ: -35.5,
    maxZ: -24.5,
    y: SCHOOL_ROOF_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
  {
    id: 'roof_east_ceiling',
    floorLevel: 3,
    minX: 25.0,
    maxX: 36.0,
    minZ: -24.5,
    maxZ: -3.5,
    y: SCHOOL_ROOF_Y,
    thickness: SCHOOL_SLAB_THICKNESS,
    source: 'konseptual',
  },
];

// Segmen tangga U konsisten di dalam sekolah_stair_core (kemiringan 1.7 / 5.0 = 0.34 <= 0.45)
export const SCHOOL_STAIR_RAMPS: InteriorStairRamp[] = [
  // LT 1 -> LT 2
  {
    id: 'stair_lt1_lt2_north',
    fromFloor: 1,
    toFloor: 2,
    lane: 'north_up',
    startX: SCHOOL_STAIR_CORE.runStartX,
    endX: SCHOOL_STAIR_CORE.runEndX,
    minZ: SCHOOL_STAIR_CORE.northLaneMinZ,
    maxZ: SCHOOL_STAIR_CORE.northLaneMaxZ,
    startY: SCHOOL_LT1_Y,
    endY: SCHOOL_LT1_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    stepsCount: 10,
    source: 'konseptual',
  },
  {
    id: 'stair_lt1_lt2_landing',
    fromFloor: 1,
    toFloor: 2,
    lane: 'north_up',
    startX: SCHOOL_STAIR_CORE.landingMinX,
    endX: SCHOOL_STAIR_CORE.landingMaxX,
    minZ: SCHOOL_STAIR_CORE.voidMinZ,
    maxZ: SCHOOL_STAIR_CORE.voidMaxZ,
    startY: SCHOOL_LT1_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    endY: SCHOOL_LT1_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    stepsCount: 1,
    source: 'konseptual',
  },
  {
    id: 'stair_lt1_lt2_south',
    fromFloor: 1,
    toFloor: 2,
    lane: 'south_up',
    startX: SCHOOL_STAIR_CORE.runEndX,
    endX: SCHOOL_STAIR_CORE.runStartX,
    minZ: SCHOOL_STAIR_CORE.southLaneMinZ,
    maxZ: SCHOOL_STAIR_CORE.southLaneMaxZ,
    startY: SCHOOL_LT1_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    endY: SCHOOL_LT2_Y,
    stepsCount: 10,
    source: 'konseptual',
  },

  // LT 2 -> LT 3
  {
    id: 'stair_lt2_lt3_north',
    fromFloor: 2,
    toFloor: 3,
    lane: 'north_up',
    startX: SCHOOL_STAIR_CORE.runStartX,
    endX: SCHOOL_STAIR_CORE.runEndX,
    minZ: SCHOOL_STAIR_CORE.northLaneMinZ,
    maxZ: SCHOOL_STAIR_CORE.northLaneMaxZ,
    startY: SCHOOL_LT2_Y,
    endY: SCHOOL_LT2_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    stepsCount: 10,
    source: 'konseptual',
  },
  {
    id: 'stair_lt2_lt3_landing',
    fromFloor: 2,
    toFloor: 3,
    lane: 'north_up',
    startX: SCHOOL_STAIR_CORE.landingMinX,
    endX: SCHOOL_STAIR_CORE.landingMaxX,
    minZ: SCHOOL_STAIR_CORE.voidMinZ,
    maxZ: SCHOOL_STAIR_CORE.voidMaxZ,
    startY: SCHOOL_LT2_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    endY: SCHOOL_LT2_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    stepsCount: 1,
    source: 'konseptual',
  },
  {
    id: 'stair_lt2_lt3_south',
    fromFloor: 2,
    toFloor: 3,
    lane: 'south_up',
    startX: SCHOOL_STAIR_CORE.runEndX,
    endX: SCHOOL_STAIR_CORE.runStartX,
    minZ: SCHOOL_STAIR_CORE.southLaneMinZ,
    maxZ: SCHOOL_STAIR_CORE.southLaneMaxZ,
    startY: SCHOOL_LT2_Y + SCHOOL_FLOOR_HEIGHT * 0.5,
    endY: SCHOOL_LT3_Y,
    stepsCount: 10,
    source: 'konseptual',
  },
];

// Generator dinding partisi + bukaan pintu yang konsisten antara visual 3D & collider fisik
const WALL_T = 0.18;
const DOOR_W = 1.8;

function pushSegmentedHorizontalWall(
  out: SchoolWallSegment[],
  idPrefix: string,
  floorLevel: 1 | 2 | 3,
  minY: number,
  maxY: number,
  z: number,
  startX: number,
  endX: number,
  doorCenters: number[],
  kind: SchoolWallSegment['kind'],
  doorWidth = DOOR_W
) {
  const halfDoor = doorWidth * 0.5;
  const sorted = [...doorCenters].sort((a, b) => a - b);
  let cursor = startX;
  sorted.forEach((cx, idx) => {
    const gapStart = Math.max(startX, cx - halfDoor);
    const gapEnd = Math.min(endX, cx + halfDoor);
    if (gapStart - cursor > 0.05) {
      out.push({
        id: `${idPrefix}_h_${idx}`,
        floorLevel,
        minX: cursor,
        maxX: gapStart,
        minZ: z - WALL_T * 0.5,
        maxZ: z + WALL_T * 0.5,
        minY,
        maxY,
        kind,
        source: 'konseptual',
      });
    }
    cursor = Math.max(cursor, gapEnd);
  });
  if (endX - cursor > 0.05) {
    out.push({
      id: `${idPrefix}_h_tail`,
      floorLevel,
      minX: cursor,
      maxX: endX,
      minZ: z - WALL_T * 0.5,
      maxZ: z + WALL_T * 0.5,
      minY,
      maxY,
      kind,
      source: 'konseptual',
    });
  }
}

function pushSegmentedVerticalWall(
  out: SchoolWallSegment[],
  idPrefix: string,
  floorLevel: 1 | 2 | 3,
  minY: number,
  maxY: number,
  x: number,
  startZ: number,
  endZ: number,
  doorCenters: number[],
  kind: SchoolWallSegment['kind'],
  doorWidth = DOOR_W
) {
  const halfDoor = doorWidth * 0.5;
  const sorted = [...doorCenters].sort((a, b) => a - b);
  let cursor = startZ;
  sorted.forEach((cz, idx) => {
    const gapStart = Math.max(startZ, cz - halfDoor);
    const gapEnd = Math.min(endZ, cz + halfDoor);
    if (gapStart - cursor > 0.05) {
      out.push({
        id: `${idPrefix}_v_${idx}`,
        floorLevel,
        minX: x - WALL_T * 0.5,
        maxX: x + WALL_T * 0.5,
        minZ: cursor,
        maxZ: gapStart,
        minY,
        maxY,
        kind,
        source: 'konseptual',
      });
    }
    cursor = Math.max(cursor, gapEnd);
  });
  if (endZ - cursor > 0.05) {
    out.push({
      id: `${idPrefix}_v_tail`,
      floorLevel,
      minX: x - WALL_T * 0.5,
      maxX: x + WALL_T * 0.5,
      minZ: cursor,
      maxZ: endZ,
      minY,
      maxY,
      kind,
      source: 'konseptual',
    });
  }
}

function buildSchoolWalls(): SchoolWallSegment[] {
  const walls: SchoolWallSegment[] = [];
  const levels: Array<{ floorLevel: 1 | 2 | 3; baseY: number }> = [
    { floorLevel: 1, baseY: SCHOOL_LT1_Y },
    { floorLevel: 2, baseY: SCHOOL_LT2_Y },
    { floorLevel: 3, baseY: SCHOOL_LT3_Y },
  ];

  levels.forEach(({ floorLevel, baseY }) => {
    const topY = baseY + SCHOOL_CLEAR_HEIGHT;

    // 1. Dinding luar keliling belakang & samping gedung
    // Belakang utara (X: 8..36, Z: -35.5) dengan modul jendela luar
    walls.push({
      id: `ext_north_f${floorLevel}`,
      floorLevel,
      minX: 8.0,
      maxX: 36.0,
      minZ: -35.5,
      maxZ: -35.5 + WALL_T,
      minY: baseY,
      maxY: topY,
      kind: 'exterior',
      hasWindow: true,
      source: 'konseptual',
    });
    // Tepi timur penuh (X: 36.0, Z: -35.5..-3.5)
    walls.push({
      id: `ext_east_f${floorLevel}`,
      floorLevel,
      minX: 36.0 - WALL_T,
      maxX: 36.0,
      minZ: -35.5,
      maxZ: -3.5,
      minY: baseY,
      maxY: topY,
      kind: 'exterior',
      hasWindow: true,
      source: 'konseptual',
    });
    // Ujung barat sayap utara (X: 8.0, Z: -35.5..-24.5)
    walls.push({
      id: `ext_west_f${floorLevel}`,
      floorLevel,
      minX: 8.0,
      maxX: 8.0 + WALL_T,
      minZ: -35.5,
      maxZ: -24.5,
      minY: baseY,
      maxY: topY,
      kind: 'exterior',
      source: 'konseptual',
    });
    // Ujung selatan ruangan sayap timur (X: 27.5..36.0, Z: -3.5)
    walls.push({
      id: `ext_south_room_f${floorLevel}`,
      floorLevel,
      minX: 27.5,
      maxX: 36.0,
      minZ: -3.5 - WALL_T,
      maxZ: -3.5,
      minY: baseY,
      maxY: topY,
      kind: 'exterior',
      source: 'konseptual',
    });

    // 2. Pagar / lengkungan tepi selasar menghadap lapangan
    if (floorLevel === 1) {
      // LT 1: Pintu Masuk Utama terbuka di X:[11.5, 14.5], sisi kiri & kanan memiliki turap rendah / arcade bata
      walls.push({
        id: 'lt1_front_arch_curb_left',
        floorLevel: 1,
        minX: 8.0,
        maxX: 11.5,
        minZ: -24.6,
        maxZ: -24.42,
        minY: baseY,
        maxY: baseY + 0.95,
        kind: 'arch_curb',
        source: 'konseptual',
      });
      walls.push({
        id: 'lt1_front_arch_curb_right',
        floorLevel: 1,
        minX: 14.5,
        maxX: 25.0,
        minZ: -24.6,
        maxZ: -24.42,
        minY: baseY,
        maxY: baseY + 0.95,
        kind: 'arch_curb',
        source: 'konseptual',
      });
      walls.push({
        id: 'lt1_east_arch_curb',
        floorLevel: 1,
        minX: 24.92,
        maxX: 25.1,
        minZ: -24.5,
        maxZ: -3.5,
        minY: baseY,
        maxY: baseY + 0.95,
        kind: 'arch_curb',
        source: 'konseptual',
      });
      walls.push({
        id: 'lt1_corridor_south_cap',
        floorLevel: 1,
        minX: 25.0,
        maxX: 27.5,
        minZ: -3.68,
        maxZ: -3.5,
        minY: baseY,
        maxY: baseY + 0.95,
        kind: 'arch_curb',
        source: 'konseptual',
      });
    } else {
      // LT 2 & LT 3: Railing pengaman selasar balkon (tinggi 1.0m) agar pemain tidak terjatuh dari balkon
      walls.push({
        id: `balcony_north_rail_f${floorLevel}`,
        floorLevel,
        minX: 8.0,
        maxX: 25.0,
        minZ: -24.6,
        maxZ: -24.42,
        minY: baseY,
        maxY: baseY + 1.05,
        kind: 'railing',
        source: 'konseptual',
      });
      walls.push({
        id: `balcony_east_rail_f${floorLevel}`,
        floorLevel,
        minX: 24.92,
        maxX: 25.1,
        minZ: -24.5,
        maxZ: -3.5,
        minY: baseY,
        maxY: baseY + 1.05,
        kind: 'railing',
        source: 'konseptual',
      });
      walls.push({
        id: `balcony_south_cap_f${floorLevel}`,
        floorLevel,
        minX: 25.0,
        maxX: 27.5,
        minZ: -3.65,
        maxZ: -3.5,
        minY: baseY,
        maxY: baseY + 1.05,
        kind: 'railing',
        source: 'konseptual',
      });
    }

    // 3. Dinding koridor & sekat antar ruangan per lantai
    if (floorLevel === 1) {
      // Ruang Rapat (dinding kaca buram ke selasar) + Ruang Konsultansi + Ruang Musik
      pushSegmentedHorizontalWall(walls, 'lt1_rapat_south', 1, baseY, topY, -27.0, 8.0, 17.5, [13.0], 'glass_partition');
      pushSegmentedHorizontalWall(walls, 'lt1_konsul_musik_south', 1, baseY, topY, -27.0, 17.5, 27.5, [20.0, 25.0], 'partition');
      // Sekat antar ruangan Sayap Utara
      walls.push(
        {
          id: 'lt1_div_175',
          floorLevel: 1,
          minX: 17.5 - WALL_T * 0.5,
          maxX: 17.5 + WALL_T * 0.5,
          minZ: -35.5,
          maxZ: -27.0,
          minY: baseY,
          maxY: topY,
          kind: 'partition',
          source: 'konseptual',
        },
        {
          id: 'lt1_div_225',
          floorLevel: 1,
          minX: 22.5 - WALL_T * 0.5,
          maxX: 22.5 + WALL_T * 0.5,
          minZ: -35.5,
          maxZ: -27.0,
          minY: baseY,
          maxY: topY,
          kind: 'partition',
          source: 'konseptual',
        }
      );
      // Dinding Perpustakaan sisi barat (X=27.5) dengan pintu di Z=-25.75
      pushSegmentedVerticalWall(walls, 'lt1_perpus_west', 1, baseY, topY, 27.5, -35.5, -24.5, [-25.75], 'partition');
      // Sekat antara Perpustakaan & Ruang Tangga (Z=-24.5)
      walls.push({
        id: 'lt1_div_stair_north',
        floorLevel: 1,
        minX: 27.5,
        maxX: 36.0,
        minZ: -24.5 - WALL_T * 0.5,
        maxZ: -24.5 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
      // Tutup ruang mati di bawah segmen tangga atas pada LT 1 agar tidak terjebak di ketinggian sempit
      walls.push({
        id: 'lt1_understair_south_blocker',
        floorLevel: 1,
        minX: 28.0,
        maxX: 33.2,
        minZ: -22.5,
        maxZ: -20.6,
        minY: baseY,
        maxY: baseY + 1.9,
        kind: 'partition',
        source: 'konseptual',
      });
      // Sekat selatan tangga (Z=-20.5) + Kelas 1 & Kelas 2
      walls.push({
        id: 'lt1_div_stair_south',
        floorLevel: 1,
        minX: 27.5,
        maxX: 36.0,
        minZ: -20.5 - WALL_T * 0.5,
        maxZ: -20.5 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
      pushSegmentedVerticalWall(walls, 'lt1_east_rooms_west', 1, baseY, topY, 27.5, -20.5, -3.5, [-16.25, -7.75], 'partition');
      walls.push({
        id: 'lt1_div_k1_k2',
        floorLevel: 1,
        minX: 27.5,
        maxX: 36.0,
        minZ: -12.0 - WALL_T * 0.5,
        maxZ: -12.0 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
    } else if (floorLevel === 2) {
      // Lab Komputer (2 pintu di X=13 dan X=22.5)
      pushSegmentedHorizontalWall(walls, 'lt2_lab_south', 2, baseY, topY, -27.0, 8.0, 27.5, [13.0, 22.5], 'partition');
      // Kelas 3
      pushSegmentedVerticalWall(walls, 'lt2_k3_west', 2, baseY, topY, 27.5, -35.5, -24.5, [-25.75], 'partition');
      walls.push({
        id: 'lt2_div_stair_north',
        floorLevel: 2,
        minX: 27.5,
        maxX: 36.0,
        minZ: -24.5 - WALL_T * 0.5,
        maxZ: -24.5 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
      walls.push({
        id: 'lt2_div_stair_south',
        floorLevel: 2,
        minX: 27.5,
        maxX: 36.0,
        minZ: -20.5 - WALL_T * 0.5,
        maxZ: -20.5 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
      pushSegmentedVerticalWall(walls, 'lt2_east_rooms_west', 2, baseY, topY, 27.5, -20.5, -3.5, [-16.25, -7.75], 'partition');
      walls.push({
        id: 'lt2_div_k4_k5',
        floorLevel: 2,
        minX: 27.5,
        maxX: 36.0,
        minZ: -12.0 - WALL_T * 0.5,
        maxZ: -12.0 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
    } else {
      // LT 3: Kelas 6, 7, 8, 9, 10
      pushSegmentedHorizontalWall(walls, 'lt3_k6_k7_south', 3, baseY, topY, -27.0, 8.0, 27.5, [13.0, 22.75], 'partition');
      walls.push({
        id: 'lt3_div_k6_k7',
        floorLevel: 3,
        minX: 18.0 - WALL_T * 0.5,
        maxX: 18.0 + WALL_T * 0.5,
        minZ: -35.5,
        maxZ: -27.0,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
      pushSegmentedVerticalWall(walls, 'lt3_k8_west', 3, baseY, topY, 27.5, -35.5, -24.5, [-25.75], 'partition');
      walls.push({
        id: 'lt3_div_stair_north',
        floorLevel: 3,
        minX: 27.5,
        maxX: 36.0,
        minZ: -24.5 - WALL_T * 0.5,
        maxZ: -24.5 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
      // Railing pengaman di tepi atas void tangga LT 3 (agar tidak jatuh ke jalur utara bawah; jalur selatan tetap terbuka turun ke LT 2)
      walls.push({
        id: 'lt3_stair_top_guard_west',
        floorLevel: 3,
        minX: 27.85,
        maxX: 28.05,
        minZ: -24.5,
        maxZ: -22.5,
        minY: baseY,
        maxY: baseY + 1.05,
        kind: 'railing',
        source: 'konseptual',
      });
      walls.push({
        id: 'lt3_div_stair_south',
        floorLevel: 3,
        minX: 27.5,
        maxX: 36.0,
        minZ: -20.5 - WALL_T * 0.5,
        maxZ: -20.5 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
      pushSegmentedVerticalWall(walls, 'lt3_east_rooms_west', 3, baseY, topY, 27.5, -20.5, -3.5, [-16.25, -7.75], 'partition');
      walls.push({
        id: 'lt3_div_k9_k10',
        floorLevel: 3,
        minX: 27.5,
        maxX: 36.0,
        minZ: -12.0 - WALL_T * 0.5,
        maxZ: -12.0 + WALL_T * 0.5,
        minY: baseY,
        maxY: topY,
        kind: 'partition',
        source: 'konseptual',
      });
    }
  });

  // Pembatas tengah U-stair di antara jalur utara dan jalur selatan pada lantai 1->2 dan 2->3
  walls.push(
    {
      id: 'stair_mid_divider_lt1_lt2',
      floorLevel: 1,
      minX: SCHOOL_STAIR_CORE.runStartX,
      maxX: SCHOOL_STAIR_CORE.runEndX,
      minZ: -22.58,
      maxZ: -22.42,
      minY: SCHOOL_LT1_Y,
      maxY: SCHOOL_LT2_Y + 0.9,
      kind: 'railing',
      source: 'konseptual',
    },
    {
      id: 'stair_mid_divider_lt2_lt3',
      floorLevel: 2,
      minX: SCHOOL_STAIR_CORE.runStartX,
      maxX: SCHOOL_STAIR_CORE.runEndX,
      minZ: -22.58,
      maxZ: -22.42,
      minY: SCHOOL_LT2_Y,
      maxY: SCHOOL_LT3_Y + 0.9,
      kind: 'railing',
      source: 'konseptual',
    }
  );

  return walls;
}

export const SCHOOL_WALL_SEGMENTS: SchoolWallSegment[] = buildSchoolWalls();

export const SCHOOL_WALL_COLLIDERS: BoxCollider3D[] = SCHOOL_WALL_SEGMENTS.map((seg) => ({
  id: `col_school_${seg.id}`,
  name: `Dinding Sekolah ${seg.id}`,
  minX: seg.minX,
  maxX: seg.maxX,
  minZ: seg.minZ,
  maxZ: seg.maxZ,
  minY: seg.minY,
  maxY: seg.kind === 'railing' ? Math.max(seg.maxY, seg.minY + 2.6) : seg.maxY,
  category: 'wall',
  source: 'konseptual',
}));

export function isRoomInsideSchoolFootprint(room: Pick<SchoolRoomDefinition, 'minX' | 'maxX' | 'minZ' | 'maxZ'>): boolean {
  const inNorth =
    room.minX >= SCHOOL_WINGS_BOUNDS.north.minX - 1e-6 &&
    room.maxX <= SCHOOL_WINGS_BOUNDS.north.maxX + 1e-6 &&
    room.minZ >= SCHOOL_WINGS_BOUNDS.north.minZ - 1e-6 &&
    room.maxZ <= SCHOOL_WINGS_BOUNDS.north.maxZ + 1e-6;
  const inEast =
    room.minX >= SCHOOL_WINGS_BOUNDS.east.minX - 1e-6 &&
    room.maxX <= SCHOOL_WINGS_BOUNDS.east.maxX + 1e-6 &&
    room.minZ >= SCHOOL_WINGS_BOUNDS.east.minZ - 1e-6 &&
    room.maxZ <= SCHOOL_WINGS_BOUNDS.east.maxZ + 1e-6;
  return inNorth || inEast;
}

export interface ClassroomDeskInstance {
  id: string;
  roomId: string;
  position: [number, number, number]; // bottom-center flush at floorY
  rotationY: number;
  source: 'konseptual';
}

export interface ClassroomFrontSetup {
  roomId: string;
  floorY: number;
  teacherDeskPos: [number, number, number];
  teacherDeskRotY: number;
  whiteboardPos: [number, number, number];
  whiteboardRotY: number;
  ceilingFans: Array<[number, number, number]>;
  source: 'konseptual';
}

export interface ComputerLabBenchSpec {
  id: string;
  centerX: number;
  centerZ: number;
  floorY: number;
  stationXs: number[];
  facingSignZ: 1 | -1; // arah hadap siswa (1 = menghadap +Z/selatan, -1 = menghadap -Z/utara)
  source: 'konseptual';
}

function buildClassroomSetups(): {
  studentDesks: ClassroomDeskInstance[];
  frontSetups: ClassroomFrontSetup[];
  colliders: BoxCollider3D[];
} {
  const studentDesks: ClassroomDeskInstance[] = [];
  const frontSetups: ClassroomFrontSetup[] = [];
  const colliders: BoxCollider3D[] = [];

  SCHOOL_ROOMS.filter((r) => r.category === 'ruang_kelas').forEach((room) => {
    const y = room.floorY;
    const fanY = y + SCHOOL_CLEAR_HEIGHT - 0.32;

    if (room.doorFacing === 'west') {
      // Ruang kelas sayap timur: pintu di barat, jendela di timur, papan tulis di dinding utara (minZ)
      const teacherPos: [number, number, number] = [29.55, y, room.minZ + 1.45];
      frontSetups.push({
        roomId: room.id,
        floorY: y,
        teacherDeskPos: teacherPos,
        teacherDeskRotY: 0,
        whiteboardPos: [31.95, y + 1.65, room.minZ + 0.16],
        whiteboardRotY: 0,
        ceilingFans: [
          [30.2, fanY, (room.minZ + room.maxZ) * 0.5 - 1.2],
          [33.8, fanY, (room.minZ + room.maxZ) * 0.5 + 1.2],
        ],
        source: 'konseptual',
      });

      colliders.push({
        id: `col_furn_${room.id}_teacher`,
        name: `Meja Guru ${room.name}`,
        minX: teacherPos[0] - 0.68,
        maxX: teacherPos[0] + 0.68,
        minZ: teacherPos[2] - 0.36,
        maxZ: teacherPos[2] + 0.36,
        minY: y,
        maxY: y + 0.85,
        category: 'furniture',
        source: 'konseptual',
      });

      const colXs = [30.7, 33.4];
      const startRowZ = room.minZ + 3.25;
      const rowStepZ = 1.65;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const dx = colXs[col];
          const dz = startRowZ + row * rowStepZ;
          const deskId = `${room.id}_desk_r${row}_c${col}`;
          studentDesks.push({
            id: deskId,
            roomId: room.id,
            position: [dx, y, dz],
            rotationY: Math.PI, // siswa menghadap -Z (ke papan tulis di minZ)
            source: 'konseptual',
          });
          colliders.push({
            id: `col_furn_${deskId}`,
            name: `Meja Siswa ${room.name}`,
            minX: dx - 0.42,
            maxX: dx + 0.42,
            minZ: dz - 0.28,
            maxZ: dz + 0.42,
            minY: y,
            maxY: y + 0.8,
            category: 'furniture',
            source: 'konseptual',
          });
        }
      }
    } else {
      // Ruang kelas sayap utara (LT 3: Kelas 6 & Kelas 7)
      const isKelas6 = room.id === 'lt3_kelas_6';
      const wbX = isKelas6 ? room.maxX - 0.16 : room.minX + 0.16;
      const wbRotY = isKelas6 ? -Math.PI / 2 : Math.PI / 2;
      const teacherX = isKelas6 ? room.maxX - 1.55 : room.minX + 1.55;
      const deskRotY = isKelas6 ? -Math.PI / 2 : Math.PI / 2;

      frontSetups.push({
        roomId: room.id,
        floorY: y,
        teacherDeskPos: [teacherX, y, -29.2],
        teacherDeskRotY: isKelas6 ? Math.PI / 2 : -Math.PI / 2,
        whiteboardPos: [wbX, y + 1.65, -31.25],
        whiteboardRotY: wbRotY,
        ceilingFans: [
          [(room.minX + room.maxX) * 0.5 - 1.5, fanY, -31.25],
          [(room.minX + room.maxX) * 0.5 + 1.5, fanY, -31.25],
        ],
        source: 'konseptual',
      });

      colliders.push({
        id: `col_furn_${room.id}_teacher`,
        name: `Meja Guru ${room.name}`,
        minX: teacherX - 0.36,
        maxX: teacherX + 0.36,
        minZ: -29.2 - 0.68,
        maxZ: -29.2 + 0.68,
        minY: y,
        maxY: y + 0.85,
        category: 'furniture',
        source: 'konseptual',
      });

      const colZs = [-33.3, -30.5];
      const baseRowX = isKelas6 ? room.maxX - 3.6 : room.minX + 3.6;
      const dirX = isKelas6 ? -1 : 1;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const dx = baseRowX + dirX * row * 1.75;
          const dz = colZs[col];
          const deskId = `${room.id}_desk_r${row}_c${col}`;
          studentDesks.push({
            id: deskId,
            roomId: room.id,
            position: [dx, y, dz],
            rotationY: deskRotY,
            source: 'konseptual',
          });
          colliders.push({
            id: `col_furn_${deskId}`,
            name: `Meja Siswa ${room.name}`,
            minX: dx - 0.38,
            maxX: dx + 0.38,
            minZ: dz - 0.42,
            maxZ: dz + 0.42,
            minY: y,
            maxY: y + 0.8,
            category: 'furniture',
            source: 'konseptual',
          });
        }
      }
    }
  });

  return { studentDesks, frontSetups, colliders };
}

const classroomData = buildClassroomSetups();
export const SCHOOL_CLASSROOM_DESKS = classroomData.studentDesks;
export const SCHOOL_CLASSROOM_FRONTS = classroomData.frontSetups;

export const SCHOOL_LAB_BENCHES: ComputerLabBenchSpec[] = [
  {
    id: 'lab_bench_nw',
    centerX: 13.8,
    centerZ: -33.2,
    floorY: SCHOOL_LT2_Y,
    stationXs: [11.85, 13.15, 14.45, 15.75],
    facingSignZ: -1,
    source: 'konseptual',
  },
  {
    id: 'lab_bench_ne',
    centerX: 21.8,
    centerZ: -33.2,
    floorY: SCHOOL_LT2_Y,
    stationXs: [19.85, 21.15, 22.45, 23.75],
    facingSignZ: -1,
    source: 'konseptual',
  },
  {
    id: 'lab_bench_sw',
    centerX: 13.8,
    centerZ: -30.2,
    floorY: SCHOOL_LT2_Y,
    stationXs: [11.85, 13.15, 14.45, 15.75],
    facingSignZ: -1,
    source: 'konseptual',
  },
  {
    id: 'lab_bench_se',
    centerX: 21.8,
    centerZ: -30.2,
    floorY: SCHOOL_LT2_Y,
    stationXs: [19.85, 21.15, 22.45, 23.75],
    facingSignZ: -1,
    source: 'konseptual',
  },
];

export const SCHOOL_FURNITURE_COLLIDERS: BoxCollider3D[] = [
  // Ruang Rapat LT 1
  {
    id: 'col_furn_lt1_rapat_table',
    name: 'Meja Rapat Utama',
    minX: 10.2,
    maxX: 15.3,
    minZ: -32.85,
    maxZ: -30.55,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 0.95,
    category: 'furniture',
    source: 'konseptual',
  },
  // Ruang Konsultansi LT 1
  {
    id: 'col_furn_lt1_konsultansi_desk',
    name: 'Meja Konsultansi',
    minX: 19.45,
    maxX: 21.15,
    minZ: -33.05,
    maxZ: -31.25,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 0.9,
    category: 'furniture',
    source: 'konseptual',
  },
  {
    id: 'col_furn_lt1_konsultansi_cabinet',
    name: 'Lemari Arsip Konsultansi',
    minX: 17.7,
    maxX: 18.8,
    minZ: -35.1,
    maxZ: -34.2,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 1.95,
    category: 'furniture',
    source: 'konseptual',
  },
  // Ruang Musik LT 1
  {
    id: 'col_furn_lt1_musik_rack',
    name: 'Rak Gitar, Kajon & Amp Ruang Musik',
    minX: 23.5,
    maxX: 26.5,
    minZ: -35.1,
    maxZ: -33.7,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 1.2,
    category: 'furniture',
    source: 'konseptual',
  },
  {
    id: 'col_furn_lt1_musik_keyboard',
    name: 'Dudukan Keyboard Ruang Musik',
    minX: 26.2,
    maxX: 27.0,
    minZ: -31.8,
    maxZ: -30.2,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 0.95,
    category: 'furniture',
    source: 'konseptual',
  },
  // Perpustakaan LT 1
  {
    id: 'col_furn_lt1_perpus_shelf_north',
    name: 'Rak Buku Utara Perpustakaan',
    minX: 28.3,
    maxX: 35.2,
    minZ: -35.3,
    maxZ: -34.45,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 2.2,
    category: 'furniture',
    source: 'konseptual',
  },
  {
    id: 'col_furn_lt1_perpus_shelf_east',
    name: 'Rak Buku Timur Perpustakaan',
    minX: 34.95,
    maxX: 35.85,
    minZ: -34.1,
    maxZ: -25.3,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 2.2,
    category: 'furniture',
    source: 'konseptual',
  },
  {
    id: 'col_furn_lt1_perpus_table_n',
    name: 'Meja Baca Lesehan Utara',
    minX: 30.05,
    maxX: 32.35,
    minZ: -32.35,
    maxZ: -30.85,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 0.5,
    category: 'furniture',
    source: 'konseptual',
  },
  {
    id: 'col_furn_lt1_perpus_table_s',
    name: 'Meja Baca Lesehan Selatan',
    minX: 30.05,
    maxX: 32.35,
    minZ: -29.15,
    maxZ: -27.65,
    minY: SCHOOL_LT1_Y,
    maxY: SCHOOL_LT1_Y + 0.5,
    category: 'furniture',
    source: 'konseptual',
  },
  // Lab Komputer LT 2
  {
    id: 'col_furn_lt2_lab_teacher',
    name: 'Meja Instruktur Lab Komputer',
    minX: 8.85,
    maxX: 10.35,
    minZ: -29.8,
    maxZ: -28.8,
    minY: SCHOOL_LT2_Y,
    maxY: SCHOOL_LT2_Y + 0.85,
    category: 'furniture',
    source: 'konseptual',
  },
  ...SCHOOL_LAB_BENCHES.map((bench) => ({
    id: `col_furn_${bench.id}`,
    name: `Barisan Meja PC ${bench.id}`,
    minX: bench.centerX - 2.65,
    maxX: bench.centerX + 2.65,
    minZ: bench.centerZ - 0.45,
    maxZ: bench.centerZ + 0.85,
    minY: bench.floorY,
    maxY: bench.floorY + 1.15,
    category: 'furniture' as const,
    source: 'konseptual' as const,
  })),
  // Meja Guru & Meja Siswa Ruang Kelas 1-10
  ...classroomData.colliders,
];

export const SCHOOL_INTERIOR_INTERACTABLES: SchoolInteriorInteractable[] = [
  {
    id: 'interact_lt1_rapat',
    roomId: 'lt1_rapat',
    category: 'ruang_rapat',
    label: 'RUANG RAPAT SEKOLAH · LT 1 (DENAH KONSEPTUAL)',
    actionLabel: 'Periksa Ruang Rapat',
    description:
      'Ruang pertemuan pengurus, dewan guru, dan koordinasi program kejuruan SMK TI BAZMA dengan partisi kaca buram menuju selasar LT 1.',
    details: [
      'Kapasitas konseptual: meja rapat panjang dengan 6 kursi putar dan papan tulis presentasi.',
      'Lokasi di denah konseptual: Sayap Utara LT 1 (-9.0m), berdampingan dengan Pintu Masuk Utama.',
      'Status: Ruangan dan tata letak furnitur disusun sebagai DENAH KONSEPTUAL (non-refs).',
    ],
    position: [12.75, SCHOOL_LT1_Y + 0.85, -31.7],
    rotationY: 0,
    dimensions: [4.6, 1.0, 1.6],
    source: 'konseptual',
  },
  {
    id: 'interact_lt1_konsultansi',
    roomId: 'lt1_konsultansi',
    category: 'ruang_konsultansi',
    label: 'RUANG KONSULTANSI · LT 1 (DENAH KONSEPTUAL)',
    actionLabel: 'Periksa Meja Konsultansi',
    description:
      'Ruang bimbingan konseling siswa, konsultasi akademik SIJA, serta diskusi pembinaan asrama secara privat.',
    details: [
      'Furnitur konseptual: meja bimbingan kayu terang, 2 kursi siswa, 1 kursi pembimbing, dan lemari arsip tinggi.',
      'Lokasi di denah konseptual: Sayap Utara LT 1 (-9.0m) di antara Ruang Rapat dan Ruang Musik.',
      'Status: Penempatan ruang dan detail jadwal bersifat DENAH KONSEPTUAL.',
    ],
    position: [20.3, SCHOOL_LT1_Y + 0.82, -32.2],
    rotationY: 0,
    dimensions: [1.65, 1.0, 1.1],
    source: 'konseptual',
  },
  {
    id: 'interact_lt1_musik',
    roomId: 'lt1_musik',
    category: 'ruang_musik',
    label: 'RUANG MUSIK EKSTRAKURIKULER · LT 1 (DENAH KONSEPTUAL)',
    actionLabel: 'Periksa Perlengkapan Musik',
    description:
      'Ruang latihan seni musik dan hadroh/akustik siswa dengan koleksi gitar akustik berwarna, kajon kayu, amplifier latihan, dan keyboard digital.',
    details: [
      'Perlengkapan konseptual: 4 gitar akustik, 1 kotak kajon, 1 amplifier latihan, tas keyboard, dan keyboard stand.',
      'Lokasi di denah konseptual: Sayap Utara LT 1 (-9.0m) sebelum tikungan Perpustakaan.',
      'Status: Penempatan ruang dan inventaris alat bersifat DENAH KONSEPTUAL.',
    ],
    position: [25.0, SCHOOL_LT1_Y + 0.72, -34.2],
    rotationY: 0,
    dimensions: [2.8, 1.3, 1.2],
    source: 'konseptual',
  },
  {
    id: 'interact_lt1_perpustakaan',
    roomId: 'lt1_perpustakaan',
    category: 'perpustakaan',
    label: 'PERPUSTAKAAN SEKOLAH · LT 1 (DENAH KONSEPTUAL)',
    actionLabel: 'Buka Katalog Perpustakaan',
    description:
      'Area literasi dan baca bersama siswa dilengkapi rak buku dinding keliling serta dua meja belajar lesehan beralas bantal duduk.',
    details: [
      'Koleksi konseptual: referensi SIJA, jaringan komputer, literatur keislaman, dan buku bacaan umum.',
      'Lokasi di denah konseptual: Sudut Timur Laut LT 1 (-9.0m), tepat di utara Inti Tangga Utama.',
      'Status: Penempatan ruangan di LT 1 dan katalog rak bersifat DENAH KONSEPTUAL.',
    ],
    position: [31.2, SCHOOL_LT1_Y + 0.5, -28.4],
    rotationY: 0,
    dimensions: [2.2, 0.9, 1.4],
    source: 'konseptual',
  },
  {
    id: 'interact_lt2_lab_komputer_w',
    roomId: 'lt2_lab_komputer',
    category: 'lab_komputer',
    label: 'LAB KOMPUTER SIJA · LT 2 (DENAH KONSEPTUAL)',
    actionLabel: 'Periksa Lab Komputer (Barat)',
    description:
      'Laboratorium praktik komputer utama SMK TI BAZMA dengan 16 stasiun PC desktop, papan tulis instruktur, dan lorong kerja terbuka.',
    details: [
      'Fokus praktik SIJA (konseptual): Administrasi Infrastruktur Jaringan, Cloud Computing, dan Pemrograman Web.',
      'Lokasi di denah konseptual: Sayap Utara LT 2 (-5.6m) menghadap selasar balkon lapangan.',
      'Status: Jumlah unit dan denah lantai 2 merupakan DENAH KONSEPTUAL.',
    ],
    position: [13.8, SCHOOL_LT2_Y + 0.88, -30.2],
    rotationY: 0,
    dimensions: [4.8, 1.0, 1.3],
    source: 'konseptual',
  },
  {
    id: 'interact_lt2_lab_komputer_e',
    roomId: 'lt2_lab_komputer',
    category: 'lab_komputer',
    label: 'LAB KOMPUTER SIJA · LT 2 (DENAH KONSEPTUAL)',
    actionLabel: 'Periksa Lab Komputer (Timur)',
    description:
      'Sisi timur Laboratorium Komputer LT 2 untuk kelompok praktikum jaringan, server linux, dan simulasi proyek kejuruan.',
    details: [
      'Terdiri atas 8 stasiun kerja PC berhadap-hadapan dengan akses cepat ke pintu timur lab.',
      'Lokasi di denah konseptual: Sayap Utara LT 2 (-5.6m).',
      'Status: Tata letak stasiun kerja dan jadwal praktik bersifat DENAH KONSEPTUAL.',
    ],
    position: [21.8, SCHOOL_LT2_Y + 0.88, -30.2],
    rotationY: 0,
    dimensions: [4.8, 1.0, 1.3],
    source: 'konseptual',
  },
  // 10 Ruang Kelas Konseptual (LT 1..3)
  ...classroomData.frontSetups.map((front) => {
    const room = SCHOOL_ROOMS.find((r) => r.id === front.roomId)!;
    return {
      id: `interact_${room.id}`,
      roomId: room.id,
      category: 'ruang_kelas' as const,
      label: `${room.name.toUpperCase()} · LT ${room.floorLevel} (DENAH KONSEPTUAL)`,
      actionLabel: `Lihat Info ${room.name}`,
      description: `${room.name} konseptual berkapasitas meja belajar individu siswa, meja guru di depan papan tulis, jendela samping terang, dan kipas plafon.`,
      details: [
        `Lokasi lantai konseptual: Lantai ${room.floorLevel} (${room.floorY.toFixed(1)}m).`,
        'Tata letak: 6 meja & kursi siswa tersusun rapi menghadap papan tulis putih dengan lorong jalan leluasa.',
        'Status: Jumlah 10 Ruang Kelas serta penempatan per lantai adalah DENAH KONSEPTUAL.',
      ],
      position: [front.teacherDeskPos[0], room.floorY + 0.72, front.teacherDeskPos[2]] as [
        number,
        number,
        number,
      ],
      rotationY: front.teacherDeskRotY,
      dimensions: [1.45, 0.95, 0.9] as [number, number, number],
      source: 'konseptual' as const,
    };
  }),
];
