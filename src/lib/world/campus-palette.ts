/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Token warna anime resmi untuk seluruh kawasan kampus 3D
 * Selaras dengan tema visual Kyoto Animation Daylight
 */
export const ANIME_THEME_TOKENS = {
  canvas: '#F0FDF4',
  surface: '#FFFFFF',
  primary: '#34D399',
  secondary: '#FDBA74',
  accent: '#4F46E5',
  text: '#0F172A',
} as const;

/**
 * Palet rumput & vegetasi cerah anime
 */
export const GRASS_CONCEPTUAL_PALETTE = {
  bladeBase: '#4d9059',
  bladeTip: '#74c69d',
  bladeVariation: '#52b788',
  terrainMeadow: '#5db379',
  terrainSlopeOlive: '#67be84',
  terrainEarthShoulder: '#70c58d',
  terrainConcretePad: '#b8c4d0',
  terrainHorizonBlend: '#8acba2',
  source: 'konseptual' as const,
};

export const CAMPUS_PALETTE = {
  architecture: {
    wallWhite: '#FFFBF0', // Putih gading cerah anime
    wallLightGrey: '#E2E8F0', // Abu-abu terang bersih
    terracottaBrick: '#C97A5E', // Bata terakota anime cerah
    rosterScreen: '#B0654B', // Roster
    windowGlass: '#38BDF8', // Kaca jendela biru cerah anime
    metalRailing: '#2D6A4F', // Railing hijau tua anime
    doorWood: '#8D5B4C', // Pintu kayu hangat
    roofSlate: '#94A3B8', // Semen rooftop cerah
    roofFascia: '#FFFFFF', // List fascia putih
    canopyDark: '#334155', // Kanopi
    foundation: '#64748B', // Pondasi bersih
    masjidWall: '#F8FAFC', // Dinding masjid putih bersih
    masjidRoof: '#10B981', // Kubah masjid hijau emerald anime
    masjidFinial: '#FDBA74', // Puncak kubah emas/peach cerah
    masjidPillars: '#E2E8F0', // Tiang masjid
    gate: '#334155', // Gerbang
  },
  landscape: {
    taludRiverStone: '#7c8896',
    concreteLight: '#CBD5E1',
    concreteCurb: '#E2E8F0',
    stairs: '#D6DEE7',
    stairBase: '#8D99A8',
    pathway: '#8E9BAA',
    turunanSlope: '#788696',
    turfField: '#68BA7F',
    courtLine: '#FFFFFF',
    flagPole: '#E2E8F0',
    flagRed: '#EF4444',
    flagWhite: '#FFFFFF',
    shrubGreen: '#52B788',
    netPostGreen: '#2D6A4F',
    treeTrunk: '#4A3525',
    treeCanopyShade: '#F48FB1',
    treeCanopyPalm: '#52B788',
    conceptualStairs: '#FDBA74',
  },
  labels: {
    bg: 'rgba(255, 255, 255, 0.95)',
    border: '#CBD5E1',
    borderHighlight: '#34D399',
    text: '#0F172A',
    conceptualTag: '#FDBA74',
  },
} as const;
