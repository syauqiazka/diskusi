/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Token warna resmi dari DESIGN.md serta palet material kawasan kampus SMK TI BAZMA.
 * Menjadi satu-satunya sumber kebenaran warna objek 3D, medan, rumput, dan label.
 */
export const DESIGN_TOKENS = {
  night: '#0B0D12',
  fluor: '#E9F2E3',
  caution: '#F2C200',
  neonCyan: '#5CE1FF',
  neonPink: '#FF5C93',
  alert: '#E0412F',
  ok: '#4FD08A',
} as const;

/**
 * Palet rumput & vegetasi konseptual (diselaraskan dengan nuansa liminal namun tetap segar di siang hari).
 */
export const GRASS_CONCEPTUAL_PALETTE = {
  bladeBase: '#4d6f3d',
  bladeTip: '#7ca35a',
  bladeVariation: '#648948',
  terrainMeadow: '#527341',
  terrainSlopeOlive: '#5b7945',
  terrainEarthShoulder: '#657a4c',
  terrainConcretePad: '#9ca4ae',
  terrainHorizonBlend: '#6e8372',
  source: 'konseptual' as const,
};

export const CAMPUS_PALETTE = {
  architecture: {
    wallWhite: '#eceff1',
    wallLightGrey: '#c8d0d8',
    terracottaBrick: '#b85d38',
    rosterScreen: '#a25030',
    windowGlass: '#2a3b4c',
    metalRailing: '#252b34',
    doorWood: '#855336',
    roofSlate: '#58626e',
    roofFascia: '#e2e7ec',
    canopyDark: '#2e3540',
    foundation: '#4a535f',
    masjidWall: '#edf0ed',
    masjidRoof: '#2c7a5b',
    masjidFinial: DESIGN_TOKENS.caution,
    masjidPillars: '#dde3e8',
    gate: '#525d6b',
  },
  landscape: {
    taludRiverStone: '#69727d',
    concreteLight: '#aab3bd',
    concreteCurb: '#cfd6de',
    stairs: '#c7cfd8',
    stairBase: '#78828e',
    pathway: '#79838e',
    turunanSlope: '#67727f',
    turfField: '#5a7d44',
    courtLine: DESIGN_TOKENS.fluor,
    flagPole: '#dce3ea',
    flagRed: '#d93829',
    flagWhite: '#f1f5f9',
    shrubGreen: '#4e733b',
    netPostGreen: '#236e42',
    treeTrunk: '#5e4937',
    treeCanopyShade: '#4c703e',
    treeCanopyPalm: '#5c8248',
    conceptualStairs: '#ea580c',
  },
  labels: {
    bg: 'rgba(11, 13, 18, 0.90)',
    border: DESIGN_TOKENS.fluor,
    borderHighlight: DESIGN_TOKENS.caution,
    text: DESIGN_TOKENS.fluor,
    conceptualTag: DESIGN_TOKENS.caution,
  },
} as const;
