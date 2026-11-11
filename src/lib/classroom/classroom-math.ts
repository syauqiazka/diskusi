/**
 * Utilitas Spasial dan Batasan Ruang Kelas 3D (Tahap 5)
 */

export const CLASSROOM_BOUNDS = {
  minX: -6.0,
  maxX: 6.0,
  minZ: -7.0,
  maxZ: 7.0,
};

/**
 * Membatasi posisi pemain agar tidak menembus dinding ruang kelas (boundary clamp)
 */
export function clampClassroomPosition(
  x: number,
  z: number,
  bounds = CLASSROOM_BOUNDS
): { x: number; z: number } {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, z)),
  };
}

/**
 * Menghitung koordinat [x, y, z] untuk 30 meja siswa dalam formasi Standard-30
 * 5 kolom x 6 baris (seatIndex 0 s.d. 29)
 * Menghadap ke arah depan kelas (papan tulis berada di z negatif)
 */
export function calculateDeskGridPosition(seatIndex: number): [number, number, number] {
  const safeIndex = Math.max(0, Math.min(29, seatIndex));
  const col = safeIndex % 5; // 0, 1, 2, 3, 4
  const row = Math.floor(safeIndex / 5); // 0, 1, 2, 3, 4, 5

  // X: dari -4.0 (kiri) ke +4.0 (kanan) dengan interval 2.0
  const x = -4.0 + col * 2.0;

  // Y: Lantai ruangan kelas
  const y = 0;

  // Z: Baris depan di -3.5 menuju baris belakang di +4.0 dengan interval 1.5
  const z = -3.5 + row * 1.5;

  return [x, y, z];
}
