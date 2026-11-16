/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pengatur anggaran label 3D agar hanya label terdekat dalam jarak pandang yang tampil serentak.
 * Mencegah penumpukan teks saat mode inspeksi aktif.
 */
export const MAX_VISIBLE_LABELS = 6;
export const MAX_LABEL_DISTANCE = 135;

interface LabelCandidate {
  id: string;
  distSq: number;
}

const candidates = new Map<string, number>();
const allowedSet = new Set<string>();
let lastSortedFrame = -1;

export function updateLabelCandidate(id: string, distSq: number, frameNumber: number): boolean {
  if (distSq > MAX_LABEL_DISTANCE * MAX_LABEL_DISTANCE) {
    candidates.delete(id);
    allowedSet.delete(id);
    return false;
  }

  candidates.set(id, distSq);

  if (frameNumber !== lastSortedFrame) {
    lastSortedFrame = frameNumber;
    allowedSet.clear();
    const sorted: LabelCandidate[] = [];
    candidates.forEach((d, key) => {
      sorted.push({ id: key, distSq: d });
    });
    sorted.sort((a, b) => a.distSq - b.distSq);
    const limit = Math.min(MAX_VISIBLE_LABELS, sorted.length);
    for (let i = 0; i < limit; i++) {
      allowedSet.add(sorted[i].id);
    }
  }

  return allowedSet.has(id);
}

export function removeLabelCandidate(id: string): void {
  candidates.delete(id);
  allowedSet.delete(id);
}
