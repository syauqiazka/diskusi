/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Shared Anime Toon Materials & Gradient Maps
 */

import * as THREE from "three";

let sharedGradientMap: THREE.DataTexture | null = null;

export function getSharedGradientMap(): THREE.DataTexture {
  if (!sharedGradientMap) {
    const colors = new Uint8Array([
      140, 140, 160, 255, // Bayangan dingin / soft shadow
      210, 210, 225, 255, // Mid-tone
      255, 255, 255, 255, // Highlight hangat
    ]);
    const texture = new THREE.DataTexture(colors, 3, 1, THREE.RGBAFormat);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    sharedGradientMap = texture;
  }
  return sharedGradientMap;
}

export const ANIME_MATERIALS = {
  // Dinding Bangunan Putih Bersih Anime
  wallWhite: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#F8FAFC",
      gradientMap,
    }),
  // Dinding Interior Lembut
  wallInterior: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#FEFCE8",
      gradientMap,
    }),
  // Lantai Kayu Ruang Kelas & Aula
  woodFloor: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#D97706",
      gradientMap,
    }),
  // Lantai Koridor & Forecourt Terrazzo
  corridorFloor: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#E2E8F0",
      gradientMap,
    }),
  // Kaca Jendela & Genkan Atrium (Ultra-Fast Anime Standard Material)
  glassAnime: new THREE.MeshStandardMaterial({
    color: "#BAE6FD",
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
    metalness: 0.05,
  }),
  // Papan Tulis Hijau
  blackboard: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#064E3B",
      gradientMap,
    }),
  // Aspal Jalan & Parkir
  asphalt: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#334155",
      gradientMap,
    }),
  // Paving Granit & Kerb
  granite: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#CBD5E1",
      gradientMap,
    }),
  // Rumput Hijau Kampus
  grass: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#4ADE80",
      gradientMap,
    }),
  // Lintasan Lari Tartan Merah
  runningTrack: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#DC2626",
      gradientMap,
    }),
  // Lapangan Sepak Bola
  soccerPitch: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#16A34A",
      gradientMap,
    }),
  // Infield Dirt Bisbol
  baseballDirt: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#B45309",
      gradientMap,
    }),
  // Air Kolam Renang & Air Mancur (Ultra-Fast Anime Standard Material)
  water: new THREE.MeshStandardMaterial({
    color: "#38BDF8",
    transparent: true,
    opacity: 0.75,
    roughness: 0.15,
    metalness: 0.15,
  }),
  // Atap Biru Tradisional (Gedung Budaya, Asrama)
  roofBlue: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#3B82F6",
      gradientMap,
    }),
  // Atap Slate Abu Gelap (Gym, Aula)
  roofDark: (gradientMap: THREE.DataTexture) =>
    new THREE.MeshToonMaterial({
      color: "#1E293B",
      gradientMap,
    }),
};
