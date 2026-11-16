/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Elevasi acuan kawasan SMK TI BAZMA.
 * Dipisahkan ke modul khusus agar dapat diimpor oleh modul terrain maupun data tata letak
 * tanpa ketergantungan sirkular.
 */
export const CAMPUS_ELEVATIONS = {
  groundLevelY: 0,
  gateY: 4.0,          // Konseptual: elevasi gerbang masuk
  lobbyY: 0.0,         // Refs: datum lobby & LT 1 asrama = 0.0m
  courtGroundY: -2.5,  // Konseptual: pelataran tengah / lapangan
  b1FloorY: -3.0,      // Refs: lantai B1 asrama (tinggi lantai 3.0m)
  b2FloorY: -6.0,      // Refs: lantai B2 asrama
  schoolGroundY: -9.0, // Konseptual: 1 tinggi lantai di bawah B2 asrama
  turunanDeltaY: 4.0,  // Konseptual: beda tinggi gerbang -> lobby
  maxWalkableSlope: 0.45, // Konstanta batas kemiringan berjalan (~24.2 derajat)
} as const;
