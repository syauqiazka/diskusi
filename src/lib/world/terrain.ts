/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CAMPUS_ELEVATIONS } from './campus-elevations';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function boxDistance(
  x: number,
  z: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): number {
  const dx = Math.max(minX - x, 0, x - maxX);
  const dz = Math.max(minZ - z, 0, z - maxZ);
  return Math.sqrt(dx * dx + dz * dz);
}

interface PlateauSpec {
  dist: number;
  elev: number;
  weightScale?: number;
}

/**
 * Fungsi murni getTerrainHeight(x, z)
 * Menghitung elevasi kontur lereng berundak secara kontinu dan mulus (tanpa tebing patah):
 * Gerbang (+4.0m) > Turunan > Asrama Atas & Loby (0.0m) > Lapangan (-2.5m) > B2 Asrama (-6.0m) > Sekolah (-9.0m)
 */
export function getTerrainHeight(x: number, z: number): number {
  const { gateY, lobbyY, schoolGroundY, courtGroundY, b2FloorY } = CAMPUS_ELEVATIONS;

  // Elevasi garis linear sepanjang koridor turunan Z = 38 (+4.0m) -> Z = 10 (0.0m)
  const turunanProgress = clamp((z - 10) / (38 - 10), 0, 1);
  const turunanLineY = lobbyY + turunanProgress * (gateY - lobbyY);

  // Kumpulan peron datar dan koridor acuan (disjoint / tanpa tumpang tindih)
  const plateaus: PlateauSpec[] = [
    // 1. Peron Gerbang Utama (+4.0m)
    {
      dist: boxDistance(x, z, -20, 20, 38, 48),
      elev: gateY,
      weightScale: 1.0,
    },
    // 2. Koridor Jalan Turunan Utama (linear +4.0m -> 0.0m)
    {
      dist: boxDistance(x, z, -2.6, 2.6, 10, 38),
      elev: turunanLineY,
      weightScale: 1.8,
    },
    // 3. Peron Asrama Sisi Atas / Barat (0.0m, mencakup seluruh sampel uji asrama)
    {
      dist: boxDistance(x, z, -39, -17.6, -24.5, 14),
      elev: lobbyY,
      weightScale: 1.2,
    },
    // 4. Peron Loby Asrama (0.0m)
    {
      dist: boxDistance(x, z, -17.6, -2.8, 4.5, 14),
      elev: lobbyY,
      weightScale: 1.2,
    },
    // 5. Simpang Bawah Turunan menuju Loby & Masjid (0.0m)
    {
      dist: boxDistance(x, z, -2.8, 3.0, 4.5, 10.0),
      elev: lobbyY,
      weightScale: 1.3,
    },
    // 6. Peron Masjid (0.0m)
    {
      dist: boxDistance(x, z, 3.5, 16.5, 14, 27),
      elev: lobbyY,
      weightScale: 1.1,
    },
    // 7. Pelataran Ekspos B2 Sisi Timur-Utara Asrama (-6.0m, menampakkan B1 & B2 secara bersih)
    {
      dist: boxDistance(x, z, -16.0, -13.0, -25.0, -3.5),
      elev: b2FloorY,
      weightScale: 1.5,
    },
    // 8. Peron Datar Lapangan Olahraga & Upacara (-2.5m)
    {
      dist: boxDistance(x, z, 3.0, 20.5, -13.0, 4.5),
      elev: courtGroundY,
      weightScale: 1.35,
    },
    // 9. Peron Datar Gedung Sekolah Sayap Utara & Halaman (-9.0m)
    {
      dist: boxDistance(x, z, 6.0, 38.0, -38.0, -21.5),
      elev: schoolGroundY,
      weightScale: 1.4,
    },
    // 10. Peron Datar Gedung Sekolah Sayap Timur (-9.0m)
    {
      dist: boxDistance(x, z, 24.5, 38.0, -21.5, -3.5),
      elev: schoolGroundY,
      weightScale: 1.4,
    },
    // 11. Lereng Bukit Barat (di luar pagar belakang asrama)
    {
      dist: boxDistance(x, z, -180, -48, -180, 180),
      elev: 1.6,
      weightScale: 0.35,
    },
    // 12. Lereng Selatan Luar Gerbang
    {
      dist: boxDistance(x, z, -180, 180, 62, 180),
      elev: 2.2,
      weightScale: 0.35,
    },
    // 13. Lembah Timur & Utara Luar Sekolah (memudar ke kabut)
    {
      dist: boxDistance(x, z, 50, 180, -180, 20),
      elev: schoolGroundY - 1.5,
      weightScale: 0.35,
    },
    {
      dist: boxDistance(x, z, -20, 180, -180, -48),
      elev: schoolGroundY - 1.5,
      weightScale: 0.35,
    },
  ];

  // Jika tepat berada di dalam peron atau koridor datar, kembalikan elevasi eksaknya
  for (let i = 0; i < plateaus.length; i++) {
    if (plateaus[i].dist <= 1e-6) {
      return plateaus[i].elev;
    }
  }

  // Interpolasi IDW mulus antar peron terdekat (C1 kontinu tanpa patahan tebing)
  let weightSum = 0;
  let elevSum = 0;
  const power = 2.6;

  for (let i = 0; i < plateaus.length; i++) {
    const p = plateaus[i];
    const w = (p.weightScale ?? 1.0) / Math.pow(p.dist, power);
    weightSum += w;
    elevSum += w * p.elev;
  }

  return elevSum / weightSum;
}

export function getTerrainSlope(x: number, z: number, delta = 0.5): number {
  const hL = getTerrainHeight(x - delta, z);
  const hR = getTerrainHeight(x + delta, z);
  const hD = getTerrainHeight(x, z - delta);
  const hU = getTerrainHeight(x, z + delta);

  const dx = (hR - hL) / (2 * delta);
  const dz = (hU - hD) / (2 * delta);

  return Math.sqrt(dx * dx + dz * dz);
}
