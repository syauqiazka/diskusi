/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MAX_INTERACT_DISTANCE = 2.5;
export const INTERACTABLE_LAYER = 2;

export interface RaycastTargetHit {
  id: string;
  distance: number;
}

/**
 * Fungsi murni pemilih target interaksi terdekat di depan kamera
 * dalam jarak maksimum (default 2.5m).
 */
export function selectBestInteractionTarget(
  hits: RaycastTargetHit[],
  maxDistance: number = MAX_INTERACT_DISTANCE
): RaycastTargetHit | null {
  let best: RaycastTargetHit | null = null;

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    if (!hit || !hit.id) continue;
    if (hit.distance < 0 || hit.distance > maxDistance) continue;
    if (!best || hit.distance < best.distance) {
      best = hit;
    }
  }

  return best;
}
