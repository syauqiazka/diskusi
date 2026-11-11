import * as THREE from "three";

// Token Warna Resmi dari DESIGN.md
export const COLORS = {
  night: "#0B0D12",
  nightMuted: "#121620",
  fluor: "#E9F2E3",
  caution: "#F2C200",
  neonCyan: "#5CE1FF",
  neonPink: "#FF5C93",
  alert: "#E0412F",
  ok: "#4FD08A",
  wallGray: "#1E222D",
  woodDoor: "#3B2616",
  lockerGreen: "#1B2B23",
  chalkboard: "#162B20",
};

// Material Ubin Lantai
export const floorMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.nightMuted),
  roughness: 0.4,
  metalness: 0.1,
});

// Material Dinding Lorong Beton Liminal
export const wallMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.wallGray),
  roughness: 0.8,
  metalness: 0.05,
});

// Material Plafon
export const ceilingMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#0E1118"),
  roughness: 0.9,
  metalness: 0.0,
});

// Material Lampu Neon Tabung (Emissive Fluor)
export const neonTubeMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.fluor),
  emissive: new THREE.Color(COLORS.fluor),
  emissiveIntensity: 0.85,
  roughness: 0.2,
});

// Material Pintu Kayu Ruang Kelas
export const doorWoodMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.woodDoor),
  roughness: 0.6,
  metalness: 0.1,
});

// Material Kusen & Gagang Kuningan
export const brassHandleMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.caution),
  roughness: 0.3,
  metalness: 0.8,
});

// Material Loker Besi Siswa
export const lockerMetalMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.lockerGreen),
  roughness: 0.5,
  metalness: 0.6,
});

// Material Cermin (Krom Reflektif)
export const mirrorFrameMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#8892B0"),
  roughness: 0.1,
  metalness: 0.95,
});

export const mirrorGlassMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#D1E8E2"),
  roughness: 0.05,
  metalness: 0.9,
});

// Material Papan Mading Kayu & Kaca
export const madingBoardMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#4A3728"),
  roughness: 0.7,
  metalness: 0.1,
});

export const paperMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.fluor),
  roughness: 0.9,
  metalness: 0.0,
});

// Material Rambu Awas Lantai Basah
export const cautionSignMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(COLORS.caution),
  roughness: 0.3,
  metalness: 0.2,
});

