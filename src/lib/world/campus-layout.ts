/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CAMPUS_ELEVATIONS } from './campus-elevations';
import { GRASS_CONCEPTUAL_PALETTE } from './campus-palette';
import { getTerrainHeight } from './terrain';
import {
  SCHOOL_FURNITURE_COLLIDERS,
  SCHOOL_WALL_COLLIDERS,
} from './school-interior-layout';

export type DataSource = 'refs' | 'konseptual';

export type InteractableType =
  | 'door'
  | 'mading'
  | 'library'
  | 'locker'
  | 'mirror'
  | 'lab_komputer'
  | 'ruang_rapat'
  | 'ruang_konsultansi'
  | 'ruang_kelas'
  | 'perpustakaan'
  | 'ruang_musik';

export interface LayoutMetadata {
  siteName: string;
  scaleStatus: 'SKALA BELUM TERVERIFIKASI';
  groundLevelY: number;   // Datum lobby & LT 1 asrama = 0.0
  gateY: number;          // Elevasi gerbang masuk = +4.0 (konseptual)
  lobbyY: number;         // Elevasi lobby asrama = 0.0 (refs)
  schoolGroundY: number;  // Elevasi tanah sekolah = -9.0 (1 lantai di bawah B2, konseptual)
  courtGroundY: number;   // Elevasi pelataran tengah / lapangan = -2.5m (konseptual)
  turunanDeltaY: number;  // Beda tinggi gerbang ke lobby = 4.0m
  maxWalkableSlope: number; // Batas kemiringan maksimum pemain = 0.45 (~24.2 derajat)
  notes: string;
  source: DataSource;
}

export interface FloorDefinition {
  id: string;
  label: string;
  levelIndex: number;
  height: number;
  floorSlabElevation: number;
  relativeY: number;
  source: DataSource;
}

export interface BuildingWing {
  id: string;
  name: string;
  dimensions: [number, number, number];
  position: [number, number, number];
  rotationY?: number;
  source: DataSource;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  category: 'asrama' | 'sekolah' | 'masjid';
  floorCount: number;
  floorHeight: number;
  basePosition: [number, number, number];
  lowestSlabY: number;
  basementExposure: 'tertanam_sebagian' | 'tertanam_penuh';
  exposedFacesDescription: string;
  floors: FloorDefinition[];
  wings: BuildingWing[];
  circulationPlaceholder: {
    name: string;
    label: string;
    dimensions: [number, number, number];
    position: [number, number, number];
    source: DataSource;
  };
  source: DataSource;
}

export interface FacilityAreaNode {
  id: string;
  name: string;
  label: string;
  dimensions: [number, number, number];
  position: [number, number, number];
  courtType?: 'multisport' | 'ceremony';
  source: DataSource;
}

export interface PathwaySegment {
  id: string;
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  width: number;
  thickness: number;
  isSlope?: boolean;
  source: DataSource;
}

export interface LandmarkNode {
  id: string;
  name: string;
  label: string;
  dimensions: [number, number, number];
  position: [number, number, number];
  source: DataSource;
}

export interface ExclusionZone2D {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  source: DataSource;
}

export interface GrassConfig {
  maxBlades: number;
  radius: number;
  baseColor: string;
  variationColor: string;
  windSpeed: number;
  windStrength: number;
  source: DataSource;
}

export interface RetainingWallDefinition {
  id: string;
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  height: number;
  thickness: number;
  source: DataSource;
}

export interface LandscapeStairsDefinition {
  id: string;
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  width: number;
  stepsCount: number;
  source: DataSource;
}

export interface SportsFixtureDefinition {
  id: string;
  name: string;
  type: 'basketball_hoop' | 'futsal_goal' | 'net_post';
  position: [number, number, number];
  rotationY: number;
  source: DataSource;
}

export interface CampusTreeDefinition {
  id: string;
  type: 'palm' | 'shade';
  position: [number, number, number];
  scale: number;
  source: DataSource;
}

export interface ColliderAABB {
  id: string;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
  category: 'building' | 'wall' | 'landmark' | 'masjid' | 'interactable' | 'furniture';
  source: DataSource;
}

export interface WorldBoundsConfig {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  source: DataSource;
}

export interface PlayerSpawnConfig {
  position: [number, number, number];
  yaw: number;
  pitch: number;
  source: DataSource;
}

export interface InteractableDefinition {
  id: string;
  type: InteractableType;
  label: string;
  actionLabel: string;
  position: [number, number, number];
  rotationY: number;
  dimensions: [number, number, number];
  isLocked?: boolean;
  lockedMessage?: string;
  description: string;
  source: DataSource;
}

export interface PerimeterFenceRun {
  id: string;
  name: string;
  start: [number, number];
  end: [number, number];
  source: DataSource;
}

export interface SafetyRailingSegment {
  id: string;
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  height: number;
  source: DataSource;
}

export interface CampusLayoutData {
  metadata: LayoutMetadata;
  showConceptualInteractables: boolean;
  worldBounds: WorldBoundsConfig;
  playerSpawn: PlayerSpawnConfig;
  terrain: {
    dimensions: [number, number];
    resolution: [number, number];
    skirtDepth: number;
    source: DataSource;
  };
  ground: {
    dimensions: [number, number];
    position: [number, number, number];
    source: DataSource;
  };
  grass: GrassConfig;
  exclusionZones: ExclusionZone2D[];
  colliders: ColliderAABB[];
  interactables: InteractableDefinition[];
  landmarks: LandmarkNode[];
  facilityAreas: FacilityAreaNode[];
  pathways: PathwaySegment[];
  retainingWalls: RetainingWallDefinition[];
  safetyRailings: SafetyRailingSegment[];
  perimeterFence: {
    height: number;
    plinthHeight: number;
    gateGapX: [number, number];
    gateZ: number;
    runs: PerimeterFenceRun[];
    source: DataSource;
  };
  landscapeStairs: LandscapeStairsDefinition[];
  sportsFixtures: SportsFixtureDefinition[];
  campusTrees: CampusTreeDefinition[];
  buildings: {
    asrama: BuildingDefinition;
    sekolah: BuildingDefinition;
    masjid: BuildingDefinition;
  };
}

export const CAMPUS_LAYOUT: CampusLayoutData = {
  metadata: {
    siteName: 'SMK TI BAZMA',
    scaleStatus: 'SKALA BELUM TERVERIFIKASI',
    groundLevelY: CAMPUS_ELEVATIONS.groundLevelY,
    gateY: CAMPUS_ELEVATIONS.gateY,
    lobbyY: CAMPUS_ELEVATIONS.lobbyY,
    schoolGroundY: CAMPUS_ELEVATIONS.schoolGroundY,
    courtGroundY: CAMPUS_ELEVATIONS.courtGroundY,
    turunanDeltaY: CAMPUS_ELEVATIONS.turunanDeltaY,
    maxWalkableSlope: CAMPUS_ELEVATIONS.maxWalkableSlope,
    notes:
      'Kawasan lereng berundak: Gerbang (+4.0) > Turunan > Asrama & Loby (0.0) > Lapangan Tengah (-2.5, konseptual) > B1 (-3.0) > B2 (-6.0) > Gedung Sekolah (-9.0).',
    source: 'konseptual',
  },

  showConceptualInteractables: true,

  worldBounds: {
    minX: -48,
    maxX: 44,
    minZ: -44,
    maxZ: 46,
    source: 'konseptual',
  },

  playerSpawn: {
    position: [0, getTerrainHeight(0, 38), 38],
    yaw: 0,
    pitch: -0.06,
    source: 'konseptual',
  },

  terrain: {
    dimensions: [360, 360],
    resolution: [256, 256],
    skirtDepth: -25.0,
    source: 'konseptual',
  },

  ground: {
    dimensions: [360, 360],
    position: [0, 0, 0],
    source: 'konseptual',
  },

  grass: {
    maxBlades: 20000,
    radius: 46,
    baseColor: GRASS_CONCEPTUAL_PALETTE.bladeBase,
    variationColor: GRASS_CONCEPTUAL_PALETTE.bladeTip,
    windSpeed: 1.2,
    windStrength: 0.055,
    source: 'konseptual',
  },

  exclusionZones: [
    {
      id: 'ex_asrama_main',
      name: 'Footprint Asrama Utama',
      minX: -29.5,
      maxX: -14.5,
      minZ: -25.0,
      maxZ: 13.0,
      source: 'refs',
    },
    {
      id: 'ex_asrama_west',
      name: 'Footprint Asrama Sayap Barat',
      minX: -39.5,
      maxX: -28.0,
      minZ: -1.0,
      maxZ: 15.0,
      source: 'refs',
    },
    {
      id: 'ex_lobby',
      name: 'Footprint Loby Asrama',
      minX: -15.5,
      maxX: -4.5,
      minZ: 4.0,
      maxZ: 12.5,
      source: 'refs',
    },
    {
      id: 'ex_masjid',
      name: 'Footprint Masjid Konseptual',
      minX: 3.5,
      maxX: 16.5,
      minZ: 14.0,
      maxZ: 27.0,
      source: 'konseptual',
    },
    {
      id: 'ex_lapangan',
      name: 'Footprint Lapangan Serbaguna',
      minX: 2.0,
      maxX: 24.0,
      minZ: -14.0,
      maxZ: 6.0,
      source: 'konseptual',
    },
    {
      id: 'ex_sekolah_north',
      name: 'Footprint Sekolah Sayap Utara',
      minX: 7.0,
      maxX: 37.0,
      minZ: -36.5,
      maxZ: -23.5,
      source: 'refs',
    },
    {
      id: 'ex_sekolah_east',
      name: 'Footprint Sekolah Sayap Timur',
      minX: 24.0,
      maxX: 37.0,
      minZ: -24.5,
      maxZ: -5.0,
      source: 'refs',
    },
    {
      id: 'ex_turunan',
      name: 'Koridor Turunan & Gerbang',
      minX: -3.2,
      maxX: 3.2,
      minZ: 9.5,
      maxZ: 40.0,
      source: 'refs',
    },
    {
      id: 'ex_path_school',
      name: 'Koridor Jalur & Tangga Sekolah',
      minX: 10.2,
      maxX: 16.0,
      minZ: -25.0,
      maxZ: -12.5,
      source: 'refs',
    },
    {
      id: 'ex_asrama_terrace_stairs',
      name: 'Koridor Tangga Terasering Asrama',
      minX: -15.5,
      maxX: -9.2,
      minZ: -24.5,
      maxZ: 5.0,
      source: 'konseptual',
    },
    {
      id: 'ex_path_lobby',
      name: 'Koridor Jalur Loby & Simpang Turunan',
      minX: -8.0,
      maxX: 11.5,
      minZ: 6.0,
      maxZ: 15.5,
      source: 'refs',
    },
    {
      id: 'ex_path_court',
      name: 'Koridor Akses Turunan ke Lapangan',
      minX: -1.5,
      maxX: 5.5,
      minZ: 1.5,
      maxZ: 10.5,
      source: 'konseptual',
    },
    {
      id: 'ex_b2_plaza',
      name: 'Pelataran Timur B2 Asrama',
      minX: -16.0,
      maxX: -12.0,
      minZ: -26.0,
      maxZ: 8.5,
      source: 'konseptual',
    },
    {
      id: 'ex_school_plaza',
      name: 'Pelataran & Tangga Masuk Sekolah',
      minX: 8.5,
      maxX: 25.0,
      minZ: -25.0,
      maxZ: -20.5,
      source: 'konseptual',
    },
  ],

  colliders: [
    // Gedung Asrama & Sayap Barat (refs)
    {
      id: 'col_asrama_main',
      name: 'Gedung Asrama Utama',
      minX: -28.5,
      maxX: -15.5,
      minZ: -24.0,
      maxZ: 12.0,
      category: 'building',
      source: 'refs',
    },
    {
      id: 'col_asrama_west',
      name: 'Gedung Asrama Sayap Barat',
      minX: -38.5,
      maxX: -26.5,
      minZ: -6.0,
      maxZ: 8.0,
      category: 'building',
      source: 'refs',
    },
    {
      id: 'col_asrama_stair_tower',
      name: 'Menara Tangga Utara Asrama',
      minX: -25.6,
      maxX: -18.4,
      minZ: -27.8,
      maxZ: -24.0,
      category: 'building',
      source: 'konseptual',
    },
    {
      id: 'col_lobby_asrama',
      name: 'Loby Asrama',
      minX: -14.5,
      maxX: -5.5,
      minZ: 4.5,
      maxZ: 11.5,
      category: 'building',
      source: 'refs',
    },
    // Dinding, pagar, & furnitur interior Gedung Sekolah 3 lantai (konseptual)
    ...SCHOOL_WALL_COLLIDERS,
    ...SCHOOL_FURNITURE_COLLIDERS,
    // Pilar Gerbang (refs) - jalur tengah tetap terbuka untuk dilewati
    {
      id: 'col_gate_pillar_west',
      name: 'Pilar Gerbang Barat',
      minX: -3.15,
      maxX: -2.25,
      minZ: 37.45,
      maxZ: 38.55,
      category: 'landmark',
      source: 'refs',
    },
    {
      id: 'col_gate_pillar_east',
      name: 'Pilar Gerbang Timur',
      minX: 2.25,
      maxX: 3.15,
      minZ: 37.45,
      maxZ: 38.55,
      category: 'landmark',
      source: 'refs',
    },
    // Elemen konseptual padat
    {
      id: 'col_pos_satpam',
      name: 'Pos Keamanan Konseptual',
      minX: 3.6,
      maxX: 6.8,
      minZ: 36.4,
      maxZ: 39.6,
      category: 'landmark',
      source: 'konseptual',
    },
    {
      id: 'col_masjid',
      name: 'Bangunan Masjid Konseptual',
      minX: 4.0,
      maxX: 16.0,
      minZ: 11.5,
      maxZ: 26.0,
      category: 'masjid',
      source: 'konseptual',
    },
    {
      id: 'col_tiang_bendera',
      name: 'Umpak Tiang Bendera',
      minX: 11.55,
      maxX: 12.45,
      minZ: 2.75,
      maxZ: 3.65,
      category: 'landmark',
      source: 'konseptual',
    },
    {
      id: 'col_wall_asrama_court',
      name: 'Talud & Dinding Planter Asrama',
      minX: -13.9,
      maxX: -12.15,
      minZ: -23.0,
      maxZ: 3.7,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_wall_court_west',
      name: 'Pagar Pembatas Barat Lapangan',
      minX: 3.0,
      maxX: 3.4,
      minZ: -12.45,
      maxZ: 4.05,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_wall_court_school_west',
      name: 'Talud Lapangan ke Sekolah (Kiri)',
      minX: 3.2,
      maxX: 10.4,
      minZ: -13.6,
      maxZ: -12.8,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_wall_court_school_east',
      name: 'Talud Lapangan ke Sekolah (Kanan)',
      minX: 15.6,
      maxX: 20.5,
      minZ: -13.6,
      maxZ: -12.8,
      category: 'wall',
      source: 'konseptual',
    },
    // Pagar pembatas keliling kawasan (hanya terbuka di Gerbang Utama X: [-2.25, +2.25], Z: 38.0)
    {
      id: 'col_fence_west',
      name: 'Pagar Pembatas Kawasan Barat',
      minX: -40.8,
      maxX: -40.2,
      minZ: -39.8,
      maxZ: 38.3,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_fence_north',
      name: 'Pagar Pembatas Kawasan Utara',
      minX: -40.8,
      maxX: 40.3,
      minZ: -39.8,
      maxZ: -39.2,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_fence_east',
      name: 'Pagar Pembatas Kawasan Timur',
      minX: 39.7,
      maxX: 40.3,
      minZ: -39.8,
      maxZ: 38.3,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_fence_south_west',
      name: 'Pagar Pembatas Kawasan Selatan Kiri',
      minX: -40.8,
      maxX: -3.05,
      minZ: 37.7,
      maxZ: 38.3,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_fence_south_gate_gap',
      name: 'Pagar Penyambung Pilar Timur ke Pos Satpam',
      minX: 3.05,
      maxX: 3.7,
      minZ: 37.7,
      maxZ: 38.3,
      category: 'wall',
      source: 'konseptual',
    },
    {
      id: 'col_fence_south_east',
      name: 'Pagar Pembatas Kawasan Selatan Kanan',
      minX: 6.7,
      maxX: 40.3,
      minZ: 37.7,
      maxZ: 38.3,
      category: 'wall',
      source: 'konseptual',
    },
    // Collider untuk objek interaktif berdiri bebas
    {
      id: 'col_mading_utama',
      name: 'Papan Mading Konseptual',
      minX: -3.65,
      maxX: -1.95,
      minZ: 12.7,
      maxZ: 13.3,
      category: 'interactable',
      source: 'konseptual',
    },
    {
      id: 'col_library_kiosk',
      name: 'Kios Perpustakaan Terbuka Konseptual',
      minX: 2.05,
      maxX: 3.55,
      minZ: 10.55,
      maxZ: 11.85,
      category: 'interactable',
      source: 'konseptual',
    },
    {
      id: 'col_locker_asrama',
      name: 'Loker Luar Loby Asrama Konseptual',
      minX: -5.45,
      maxX: -4.95,
      minZ: 9.7,
      maxZ: 11.3,
      category: 'interactable',
      source: 'konseptual',
    },
    {
      id: 'col_mirror_selasar',
      name: 'Cermin Profil Selasar Konseptual',
      minX: -9.75,
      maxX: -8.65,
      minZ: 11.45,
      maxZ: 11.85,
      category: 'interactable',
      source: 'konseptual',
    },
  ],

  interactables: [
    {
      id: 'door_lobby_asrama',
      type: 'door',
      label: 'PINTU LUAR LOBY ASRAMA (DESAIN KONSEPTUAL)',
      actionLabel: 'Periksa Pintu Loby',
      position: [-5.42, getTerrainHeight(-5.42, 8.0), 8.0],
      rotationY: Math.PI / 2,
      dimensions: [0.22, 2.3, 1.4],
      isLocked: false,
      description:
        'Akses luar menuju bangunan Loby Asrama. Ruang interior belum tersedia pada tahap prototipe kawasan ini.',
      source: 'konseptual',
    },
    {
      id: 'door_kelas_konseptual',
      type: 'door',
      label: 'PINTU AKSES TERKUNCI (DESAIN KONSEPTUAL)',
      actionLabel: 'Coba Buka Pintu',
      position: [-7.2, getTerrainHeight(-7.2, 4.45), 4.45],
      rotationY: Math.PI,
      dimensions: [1.4, 2.3, 0.22],
      isLocked: true,
      lockedMessage: 'TERKUNCI — Interior belum dibuka pada prototipe ini',
      description:
        'Pintu eksterior konseptual dalam status terkunci. Akses interior bangunan sekolah dan asrama akan ditambahkan setelah denah ruang terverifikasi.',
      source: 'konseptual',
    },
    {
      id: 'mading_utama',
      type: 'mading',
      label: 'MADING KAMPUS (DESAIN KONSEPTUAL)',
      actionLabel: 'Baca Mading',
      position: [-2.8, getTerrainHeight(-2.8, 13.0), 13.0],
      rotationY: 0.35,
      dimensions: [1.6, 2.0, 0.45],
      description:
        'Papan informasi dan pengumuman sementara di kaki jalur turunan.',
      source: 'konseptual',
    },
    {
      id: 'library_kiosk',
      type: 'library',
      label: 'KIOS PERPUSTAKAAN TERBUKA (DESAIN KONSEPTUAL)',
      actionLabel: 'Buka Info Fasilitas',
      position: [2.8, getTerrainHeight(2.8, 11.2), 11.2],
      rotationY: -0.45,
      dimensions: [1.4, 1.85, 1.1],
      description:
        'Penanda informasi fasilitas sekolah di sisi timur simpang turunan (belum terikat lantai gedung).',
      source: 'konseptual',
    },
    {
      id: 'locker_asrama',
      type: 'locker',
      label: 'LOKER LUAR SELASAR (DESAIN KONSEPTUAL)',
      actionLabel: 'Buka Loker',
      position: [-5.2, getTerrainHeight(-5.2, 10.5), 10.5],
      rotationY: Math.PI / 2,
      dimensions: [1.5, 1.9, 0.5],
      description:
        'Lemari loker siswa konseptual di tepi luar loby asrama.',
      source: 'konseptual',
    },
    {
      id: 'mirror_selasar',
      type: 'mirror',
      label: 'CERMIN PROFIL SELASAR (DESAIN KONSEPTUAL)',
      actionLabel: 'Lihat Kartu Profil',
      position: [-9.2, getTerrainHeight(-9.2, 11.65), 11.65],
      rotationY: 0,
      dimensions: [1.05, 1.95, 0.25],
      description:
        'Cermin selasar konseptual untuk pratinjau kartu profil siswa.',
      source: 'konseptual',
    },
  ],

  landmarks: [
    {
      id: 'gerbang',
      name: 'Gerbang Utama & Pos Keamanan',
      label: 'Gerbang Utama (+4.0m)',
      dimensions: [6.0, 3.8, 1.2],
      position: [0, getTerrainHeight(0, 38), 38],
      source: 'refs',
    },
    {
      id: 'lobby_asrama',
      name: 'Loby Asrama',
      label: 'Loby Asrama (0.0m)',
      dimensions: [9.0, 3.2, 7.0],
      position: [-10, getTerrainHeight(-10, 8), 8],
      source: 'refs',
    },
    {
      id: 'turunan_marker',
      name: 'Area Turunan',
      label: 'Turunan (Slope Masuk +4m -> 0m)',
      dimensions: [5.0, 0.4, 28.0],
      position: [0, getTerrainHeight(0, 24), 24],
      source: 'refs',
    },
    {
      id: 'tiang_bendera',
      name: 'Tiang Bendera Upacara Merah Putih',
      label: 'Tiang Bendera Merah Putih (DESAIN KONSEPTUAL)',
      dimensions: [0.3, 8.0, 0.3],
      position: [12.0, getTerrainHeight(12.0, 3.2), 3.2],
      source: 'konseptual',
    },
    {
      id: 'pos_satpam',
      name: 'Pos Keamanan & Penjagaan',
      label: 'Pos Satpam (+4.0m)',
      dimensions: [3.2, 2.8, 3.2],
      position: [5.2, getTerrainHeight(5.2, 38.0), 38.0],
      source: 'konseptual',
    },
  ],

  facilityAreas: [
    {
      id: 'lapangan_serbaguna',
      name: 'Lapangan Rumput & Upacara',
      label: 'Lapangan Upacara & Rumput (-2.5m)',
      dimensions: [17.0, 0.12, 16.5],
      position: [11.8, getTerrainHeight(11.8, -4.2), -4.2],
      courtType: 'ceremony',
      source: 'konseptual',
    },
  ],

  pathways: [
    {
      id: 'path_gerbang_turunan',
      name: 'Jalur Turunan Masuk',
      start: [0, getTerrainHeight(0, 38), 38],
      end: [0, getTerrainHeight(0, 10), 10],
      width: 4.8,
      thickness: 0.15,
      isSlope: true,
      source: 'refs',
    },
    {
      id: 'path_to_lobby',
      name: 'Jalur Akses Loby Asrama',
      start: [0, getTerrainHeight(0, 10), 10],
      end: [-7, getTerrainHeight(-7, 8), 8],
      width: 4.2,
      thickness: 0.12,
      source: 'refs',
    },
    {
      id: 'path_to_masjid',
      name: 'Jalur Akses Area Timur Bawah Turunan',
      start: [0, getTerrainHeight(0, 12), 12],
      end: [10.0, getTerrainHeight(10.0, 13.3), 13.3],
      width: 3.4,
      thickness: 0.12,
      source: 'konseptual',
    },
    {
      id: 'path_to_court',
      name: 'Jalur Turunan Lereng Lapangan',
      start: [1.0, getTerrainHeight(1.0, 8.8), 8.8],
      end: [3.8, getTerrainHeight(3.8, 3.2), 3.2],
      width: 2.8,
      thickness: 0.1,
      isSlope: true,
      source: 'konseptual',
    },
    {
      id: 'path_to_school',
      name: 'Plaza Penghubung Kaki Tangga ke Pintu Sekolah',
      start: [13.0, getTerrainHeight(13.0, -21.5), -21.5],
      end: [13.0, getTerrainHeight(13.0, -24.5), -24.5],
      width: 4.6,
      thickness: 0.12,
      isSlope: false,
      source: 'refs',
    },
  ],

  retainingWalls: [
    {
      id: 'wall_asrama_court',
      name: 'Talud Terasering Batu Kali Asrama',
      start: [-12.5, -3.5, -23.0],
      end: [-12.5, -3.5, 2.0],
      height: 5.2,
      thickness: 0.7,
      source: 'konseptual',
    },
    {
      id: 'wall_court_school_west',
      name: 'Talud Terasering Lapangan ke Sekolah (Kiri)',
      start: [3.2, -5.75, -13.2],
      end: [10.4, -5.75, -13.2],
      height: 6.7,
      thickness: 0.75,
      source: 'konseptual',
    },
    {
      id: 'wall_court_school_east',
      name: 'Talud Terasering Lapangan ke Sekolah (Kanan)',
      start: [15.6, -5.75, -13.2],
      end: [20.5, -5.75, -13.2],
      height: 6.7,
      thickness: 0.75,
      source: 'konseptual',
    },
  ],

  safetyRailings: [
    {
      id: 'rail_court_west',
      name: 'Pagar Pengaman Tepi Barat Lapangan',
      start: [3.2, -2.5, -12.45],
      end: [3.2, -2.5, 4.05],
      height: 1.0,
      source: 'konseptual',
    },
    {
      id: 'rail_court_north_west',
      name: 'Pagar Pengaman Atas Talud Lapangan Barat',
      start: [3.2, -2.5, -13.15],
      end: [10.4, -2.5, -13.15],
      height: 1.0,
      source: 'konseptual',
    },
    {
      id: 'rail_court_north_east',
      name: 'Pagar Pengaman Atas Talud Lapangan Timur',
      start: [15.6, -2.5, -13.15],
      end: [20.5, -2.5, -13.15],
      height: 1.0,
      source: 'konseptual',
    },
  ],

  perimeterFence: {
    height: 1.75,
    plinthHeight: 0.28,
    gateGapX: [-2.25, 2.25],
    gateZ: 38.0,
    source: 'konseptual',
    runs: [
      {
        id: 'fence_west',
        name: 'Pagar Pembatas Kawasan Barat',
        start: [-40.5, -39.5],
        end: [-40.5, 38.0],
        source: 'konseptual',
      },
      {
        id: 'fence_north',
        name: 'Pagar Pembatas Kawasan Utara',
        start: [-40.5, -39.5],
        end: [40.0, -39.5],
        source: 'konseptual',
      },
      {
        id: 'fence_east',
        name: 'Pagar Pembatas Kawasan Timur',
        start: [40.0, -39.5],
        end: [40.0, 38.0],
        source: 'konseptual',
      },
      {
        id: 'fence_south_west',
        name: 'Pagar Pembatas Kawasan Selatan Kiri Gerbang',
        start: [-40.5, 38.0],
        end: [-3.1, 38.0],
        source: 'konseptual',
      },
      {
        id: 'fence_south_gate_gap',
        name: 'Pagar Penyambung Pilar Timur ke Pos Satpam',
        start: [3.1, 38.0],
        end: [3.65, 38.0],
        source: 'konseptual',
      },
      {
        id: 'fence_south_east',
        name: 'Pagar Pembatas Kawasan Selatan Kanan Pos Satpam',
        start: [6.75, 38.0],
        end: [40.0, 38.0],
        source: 'konseptual',
      },
    ],
  },

  landscapeStairs: [
    {
      id: 'stairs_asrama_terrace',
      name: 'Tangga Terasering Lereng Asrama',
      start: [-11.2, 0.0, 4.0],
      end: [-11.2, -5.5, -14.0],
      width: 2.6,
      stepsCount: 18,
      source: 'konseptual',
    },
    {
      id: 'stairs_court_to_school',
      name: 'Tangga Teras Lapangan ke Plaza Sekolah',
      start: [13.0, -2.5, -13.0],
      end: [13.0, -9.0, -21.5],
      width: 4.4,
      stepsCount: 20,
      source: 'konseptual',
    },
  ],

  sportsFixtures: [
    {
      id: 'net_post_center',
      name: 'Tiang Net Lapangan',
      type: 'net_post',
      position: [15.5, getTerrainHeight(15.5, -6.0), -6.0],
      rotationY: 0,
      source: 'konseptual',
    },
  ],

  campusTrees: [
    // Tepi barat belakang asrama
    { id: 'tree_w1', type: 'shade', position: [-42, getTerrainHeight(-42, 12), 12], scale: 1.05, source: 'konseptual' },
    { id: 'tree_w2', type: 'palm', position: [-42, getTerrainHeight(-42, -8), -8], scale: 1.1, source: 'konseptual' },
    { id: 'tree_w3', type: 'shade', position: [-42, getTerrainHeight(-42, -24), -24], scale: 1.15, source: 'konseptual' },
    // Sekitar gerbang selatan (tidak menghalangi jarak pandang)
    { id: 'tree_s1', type: 'shade', position: [-14, getTerrainHeight(-14, 42), 42], scale: 1.05, source: 'konseptual' },
    { id: 'tree_s2', type: 'palm', position: [14, getTerrainHeight(14, 42), 42], scale: 1.1, source: 'konseptual' },
    { id: 'tree_s3', type: 'shade', position: [-18, getTerrainHeight(-18, 30), 30], scale: 1.05, source: 'konseptual' },
    { id: 'tree_s4', type: 'shade', position: [22, getTerrainHeight(22, 30), 30], scale: 1.1, source: 'konseptual' },
    // Tepi timur area masjid & lapangan (rapi di luar trotoar)
    { id: 'tree_m1', type: 'palm', position: [21, getTerrainHeight(21, 18), 18], scale: 1.05, source: 'konseptual' },
    { id: 'tree_m2', type: 'shade', position: [28, getTerrainHeight(28, 12), 12], scale: 1.1, source: 'konseptual' },
    // Tepi utara belakang gedung sekolah
    { id: 'tree_n1', type: 'shade', position: [10, getTerrainHeight(10, -44), -44], scale: 1.1, source: 'konseptual' },
    { id: 'tree_n2', type: 'palm', position: [22, getTerrainHeight(22, -45), -45], scale: 1.1, source: 'konseptual' },
    { id: 'tree_n3', type: 'shade', position: [34, getTerrainHeight(34, -44), -44], scale: 1.15, source: 'konseptual' },
    // Tepi timur gedung sekolah
    { id: 'tree_e1', type: 'shade', position: [43, getTerrainHeight(43, -28), -28], scale: 1.1, source: 'konseptual' },
    { id: 'tree_e2', type: 'palm', position: [43, getTerrainHeight(43, -16), -16], scale: 1.1, source: 'konseptual' },
    { id: 'tree_e3', type: 'shade', position: [42, getTerrainHeight(42, -4), -4], scale: 1.15, source: 'konseptual' },
    { id: 'tree_e4', type: 'palm', position: [38, getTerrainHeight(38, 6), 6], scale: 1.05, source: 'konseptual' },
  ],

  buildings: {
    asrama: {
      id: 'gedung_asrama',
      name: 'Gedung Asrama',
      category: 'asrama',
      floorCount: 5,
      floorHeight: 3.0,
      basePosition: [-22, 0, -6],
      lowestSlabY: -6.0,
      basementExposure: 'tertanam_sebagian',
      exposedFacesDescription:
        'Sisi timur dan utara B1/B2 terekspos karena lereng tanah menurun ke sekolah di timur laut',
      source: 'refs',
      floors: [
        {
          id: 'asrama_b2',
          label: 'B2',
          levelIndex: 0,
          height: 3.0,
          floorSlabElevation: -6.0,
          relativeY: -4.5,
          source: 'refs',
        },
        {
          id: 'asrama_b1',
          label: 'B1',
          levelIndex: 1,
          height: 3.0,
          floorSlabElevation: -3.0,
          relativeY: -1.5,
          source: 'refs',
        },
        {
          id: 'asrama_lt1',
          label: 'LT 1',
          levelIndex: 2,
          height: 3.0,
          floorSlabElevation: 0.0,
          relativeY: 1.5,
          source: 'refs',
        },
        {
          id: 'asrama_lt2',
          label: 'LT 2',
          levelIndex: 3,
          height: 3.0,
          floorSlabElevation: 3.0,
          relativeY: 4.5,
          source: 'refs',
        },
        {
          id: 'asrama_lt3',
          label: 'LT 3',
          levelIndex: 4,
          height: 3.0,
          floorSlabElevation: 6.0,
          relativeY: 7.5,
          source: 'refs',
        },
      ],
      wings: [
        {
          id: 'asrama_wing_main',
          name: 'Sayap Utama Asrama (Utara-Selatan)',
          dimensions: [13.0, 3.0, 36.0],
          position: [0, 0, 0],
          source: 'refs',
        },
        {
          id: 'asrama_wing_west',
          name: 'Sayap Barat Asrama',
          dimensions: [12.0, 3.0, 14.0],
          position: [-10.5, 0, 7.0],
          source: 'refs',
        },
      ],
      circulationPlaceholder: {
        name: 'Tangga / Sirkulasi Vertikal Asrama (Ujung Utara)',
        label: 'Tangga / Lift Asrama (DESAIN KONSEPTUAL)',
        dimensions: [3.8, 15.0, 3.6],
        position: [0, 1.5, -19.8],
        source: 'konseptual',
      },
    },

    sekolah: {
      id: 'gedung_sekolah',
      name: 'Gedung Sekolah',
      category: 'sekolah',
      floorCount: 3,
      floorHeight: 3.4,
      basePosition: [22, -9.0, -22],
      lowestSlabY: -9.0,
      basementExposure: 'tertanam_penuh',
      exposedFacesDescription: 'LT 1 sekolah duduk di atas peron y = -9.0m',
      source: 'refs',
      floors: [
        {
          id: 'sekolah_lt1',
          label: 'LT 1',
          levelIndex: 0,
          height: 3.4,
          floorSlabElevation: -9.0,
          relativeY: 1.7,
          source: 'konseptual',
        },
        {
          id: 'sekolah_lt2',
          label: 'LT 2',
          levelIndex: 1,
          height: 3.4,
          floorSlabElevation: -5.6,
          relativeY: 5.1,
          source: 'konseptual',
        },
        {
          id: 'sekolah_lt3',
          label: 'LT 3',
          levelIndex: 2,
          height: 3.4,
          floorSlabElevation: -2.2,
          relativeY: 8.5,
          source: 'konseptual',
        },
      ],
      wings: [
        {
          id: 'sekolah_wing_north',
          name: 'Sayap Utara Sekolah (Barat-Timur)',
          dimensions: [28.0, 3.4, 11.0],
          position: [0, 0, -8.0],
          source: 'refs',
        },
        {
          id: 'sekolah_wing_east',
          name: 'Sayap Timur Sekolah (Utara-Selatan)',
          dimensions: [11.0, 3.4, 22.0],
          position: [8.5, 0, 7.5],
          source: 'refs',
        },
      ],
      circulationPlaceholder: {
        name: 'Tangga / Sirkulasi Vertikal Sekolah',
        label: 'Tangga / Sirkulasi (DESAIN KONSEPTUAL)',
        dimensions: [4.0, 10.2, 4.0],
        position: [2.0, 5.1, -3.0],
        source: 'konseptual',
      },
    },

    masjid: {
      id: 'gedung_masjid',
      name: 'Masjid (DESAIN KONSEPTUAL)',
      category: 'masjid',
      floorCount: 1,
      floorHeight: 4.8,
      basePosition: [10.0, getTerrainHeight(10.0, 20.5), 20.5],
      lowestSlabY: 0.0,
      basementExposure: 'tertanam_penuh',
      exposedFacesDescription: 'Bangunan ibadah konseptual di peron y = 0.0m (tidak berasal dari design/refs/)',
      source: 'konseptual',
      floors: [
        {
          id: 'masjid_main',
          label: 'RUANG UTAMA',
          levelIndex: 0,
          height: 4.8,
          floorSlabElevation: 0.0,
          relativeY: 2.4,
          source: 'konseptual',
        },
      ],
      wings: [
        {
          id: 'masjid_body',
          name: 'Ruang Sholat Utama',
          dimensions: [12.0, 4.8, 11.0],
          position: [0, 0, 0],
          source: 'konseptual',
        },
        {
          id: 'masjid_terrace',
          name: 'Serambi Masjid',
          dimensions: [12.0, 3.2, 3.5],
          position: [0, -0.8, -7.2],
          source: 'konseptual',
        },
      ],
      circulationPlaceholder: {
        name: 'Akses Mihrab & Selasar',
        label: 'Masjid (DESAIN KONSEPTUAL)',
        dimensions: [3.2, 4.8, 2.5],
        position: [0, 2.4, 6.2],
        source: 'konseptual',
      },
    },
  },
};
