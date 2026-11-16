/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ColliderAABB,
  LandscapeStairsDefinition,
  WorldBoundsConfig,
} from './campus-layout';
import {
  InteriorStairRamp,
  WalkableFloorSlab,
} from './school-interior-layout';

export const MOUSE_SENSITIVITY = 0.0022;
export const MIN_PITCH_RAD = -(85 * Math.PI) / 180;
export const MAX_PITCH_RAD = (85 * Math.PI) / 180;

export const WALK_SPEED = 4.6;
export const RUN_SPEED = 7.4;
export const CROUCH_SPEED = 2.6;

export const ACCEL_RATE = 14.0;
export const DAMPING_RATE = 12.0;

export const PLAYER_RADIUS = 0.42;
export const PLAYER_NEAR_PLANE = 0.05;
export const EYE_SMOOTH_RATE = 12.0;
export const GROUND_SMOOTH_RATE = 22.0;

export const GRAVITY = 18.0;
export const JUMP_VELOCITY = 5.6;
export const STANDING_BODY_HEIGHT = 1.78;
export const CROUCH_BODY_HEIGHT = 1.05;
export const STEP_UP_TOLERANCE = 0.55;

export interface MovementInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export interface WalkableSurfaceResult {
  y: number;
  ceilingY: number | null;
  onStair: boolean;
}

export interface VerticalPhysicsInput {
  footY: number;
  verticalVelocity: number;
  supportY: number;
  ceilingY: number | null;
  onStair?: boolean;
  bodyHeight?: number;
  delta: number;
}

export interface VerticalPhysicsResult {
  footY: number;
  verticalVelocity: number;
  isGrounded: boolean;
  hitCeiling: boolean;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function clampPitch(pitch: number): number {
  return clamp(pitch, MIN_PITCH_RAD, MAX_PITCH_RAD);
}

/**
 * Menghitung arah gerak horizontal ternormalisasi dari input WASD dan sudut yaw kamera.
 * Gerak diagonal tidak lebih cepat daripada gerak lurus (panjang vektor <= 1.0).
 */
export function computeDesiredDirection(
  input: Pick<MovementInputState, 'forward' | 'backward' | 'left' | 'right'>,
  yaw: number
): { x: number; z: number } {
  const forwardAxis = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
  const strafeAxis = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  if (forwardAxis === 0 && strafeAxis === 0) {
    return { x: 0, z: 0 };
  }

  const fwdX = -Math.sin(yaw);
  const fwdZ = -Math.cos(yaw);
  const rightX = Math.cos(yaw);
  const rightZ = -Math.sin(yaw);

  const rawX = fwdX * forwardAxis + rightX * strafeAxis;
  const rawZ = fwdZ * forwardAxis + rightZ * strafeAxis;
  const len = Math.hypot(rawX, rawZ);

  if (len <= 1e-6) {
    return { x: 0, z: 0 };
  }

  return { x: rawX / len, z: rawZ / len };
}

/**
 * Memperbarui kecepatan secara independen terhadap frame rate dengan percepatan & redaman halus.
 */
export function stepVelocity(
  vx: number,
  vz: number,
  dirX: number,
  dirZ: number,
  targetSpeed: number,
  delta: number
): { vx: number; vz: number } {
  const dt = clamp(delta, 0, 0.1);
  const hasInput = Math.abs(dirX) > 1e-5 || Math.abs(dirZ) > 1e-5;

  if (hasInput) {
    const alpha = 1 - Math.exp(-ACCEL_RATE * dt);
    const goalX = dirX * targetSpeed;
    const goalZ = dirZ * targetSpeed;
    return {
      vx: vx + (goalX - vx) * alpha,
      vz: vz + (goalZ - vz) * alpha,
    };
  }

  const damp = Math.exp(-DAMPING_RATE * dt);
  const nextVx = vx * damp;
  const nextVz = vz * damp;

  return {
    vx: Math.abs(nextVx) < 1e-4 ? 0 : nextVx,
    vz: Math.abs(nextVz) < 1e-4 ? 0 : nextVz,
  };
}

/**
 * Memeriksa apakah posisi (x, z) berada di atas koridor tangga lansekap.
 */
export function sampleStairCorridorHeight(
  x: number,
  z: number,
  stairs: LandscapeStairsDefinition[]
): { onStair: boolean; height: number } {
  for (let i = 0; i < stairs.length; i++) {
    const st = stairs[i];
    const dx = st.end[0] - st.start[0];
    const dz = st.end[2] - st.start[2];
    const lenSq = dx * dx + dz * dz;
    if (lenSq <= 1e-6) continue;

    const len = Math.sqrt(lenSq);
    const ux = dx / len;
    const uz = dz / len;
    const px = -uz;
    const pz = ux;

    const relX = x - st.start[0];
    const relZ = z - st.start[2];

    const along = relX * ux + relZ * uz;
    const across = Math.abs(relX * px + relZ * pz);

    if (along >= -0.35 && along <= len + 0.35 && across <= st.width * 0.5 + 0.1) {
      const t = clamp(along / len, 0, 1);
      const height = st.start[1] + (st.end[1] - st.start[1]) * t;
      return { onStair: true, height };
    }
  }

  return { onStair: false, height: 0 };
}

/**
 * Menghitung ketinggian permukaan pijakan luar ruangan (tangga lansekap atau getTerrainHeight).
 */
export function getSupportHeight(
  x: number,
  z: number,
  stairs: LandscapeStairsDefinition[],
  getTerrainHeightFn: (x: number, z: number) => number
): { y: number; onStair: boolean } {
  const stairHit = sampleStairCorridorHeight(x, z, stairs);
  const terrainY = getTerrainHeightFn(x, z);
  if (stairHit.onStair) {
    return { y: Math.max(terrainY, stairHit.height), onStair: true };
  }
  return { y: terrainY, onStair: false };
}

function sampleInteriorRampY(ramp: InteriorStairRamp, x: number): number {
  const span = ramp.endX - ramp.startX;
  if (Math.abs(span) <= 1e-6) return ramp.startY;
  const t = clamp((x - ramp.startX) / span, 0, 1);
  return ramp.startY + (ramp.endY - ramp.startY) * t;
}

/**
 * Menghitung ketinggian permukaan berjalan (luar + interior bertingkat + tangga U) dan langit-langit terdekat di atas pemain.
 */
export function getWalkableHeight(
  x: number,
  z: number,
  footY: number,
  stairs: LandscapeStairsDefinition[],
  floorSlabs: WalkableFloorSlab[],
  stairRamps: InteriorStairRamp[],
  ceilingSlabs: WalkableFloorSlab[],
  getTerrainHeightFn: (x: number, z: number) => number
): WalkableSurfaceResult {
  const outdoor = getSupportHeight(x, z, stairs, getTerrainHeightFn);

  let bestSupportY = outdoor.y;
  let onStair = outdoor.onStair;
  const maxStepY = footY + STEP_UP_TOLERANCE;
  let ceilingY: number | null = null;

  const registerCeiling = (bottomY: number) => {
    if (bottomY > footY + 0.35) {
      ceilingY = ceilingY === null ? bottomY : Math.min(ceilingY, bottomY);
    }
  };

  for (let i = 0; i < floorSlabs.length; i++) {
    const slab = floorSlabs[i];
    if (x >= slab.minX && x <= slab.maxX && z >= slab.minZ && z <= slab.maxZ) {
      if (slab.y <= maxStepY && slab.y > bestSupportY) {
        bestSupportY = slab.y;
        onStair = false;
      }
      registerCeiling(slab.y - slab.thickness);
    }
  }

  for (let i = 0; i < ceilingSlabs.length; i++) {
    const ceil = ceilingSlabs[i];
    if (x >= ceil.minX && x <= ceil.maxX && z >= ceil.minZ && z <= ceil.maxZ) {
      registerCeiling(ceil.y - ceil.thickness);
    }
  }

  for (let i = 0; i < stairRamps.length; i++) {
    const ramp = stairRamps[i];
    const minX = Math.min(ramp.startX, ramp.endX) - 0.14;
    const maxX = Math.max(ramp.startX, ramp.endX) + 0.14;
    if (x >= minX && x <= maxX && z >= ramp.minZ && z <= ramp.maxZ) {
      const rampY = sampleInteriorRampY(ramp, x);
      if (rampY <= maxStepY && rampY >= bestSupportY - 0.05) {
        bestSupportY = rampY;
        onStair = true;
      }
      registerCeiling(rampY - 0.24);
    }
  }

  return {
    y: bestSupportY,
    ceilingY,
    onStair,
  };
}

/**
 * Memperbarui gerak vertikal lompatan, gravitasi, pendaratan, dan benturan langit-langit.
 */
export function stepVerticalPhysics({
  footY,
  verticalVelocity,
  supportY,
  ceilingY,
  onStair = false,
  bodyHeight = STANDING_BODY_HEIGHT,
  delta,
}: VerticalPhysicsInput): VerticalPhysicsResult {
  const dt = clamp(delta, 0, 0.1);
  const airborne = verticalVelocity > 0 || footY > supportY + 0.04;

  if (airborne) {
    let nextVy = verticalVelocity - GRAVITY * dt;
    let nextY = footY + nextVy * dt;
    let hitCeiling = false;

    if (ceilingY !== null && nextY + bodyHeight > ceilingY) {
      nextY = Math.max(supportY, ceilingY - bodyHeight);
      if (nextVy > 0) nextVy = 0;
      hitCeiling = true;
    }

    if (nextY <= supportY) {
      return {
        footY: supportY,
        verticalVelocity: 0,
        isGrounded: true,
        hitCeiling,
      };
    }

    return {
      footY: nextY,
      verticalVelocity: nextVy,
      isGrounded: false,
      hitCeiling,
    };
  }

  const nextY = onStair ? supportY : smoothValue(footY, supportY, GROUND_SMOOTH_RATE, delta);
  return {
    footY: nextY,
    verticalVelocity: 0,
    isGrounded: true,
    hitCeiling: false,
  };
}

/**
 * Menyelesaikan batas kemiringan yang bisa dilalui (maxWalkableSlope) dengan dukungan lantai & tangga interior.
 */
export function resolveSlopeStep(
  prevX: number,
  prevZ: number,
  targetX: number,
  targetZ: number,
  maxWalkableSlope: number,
  stairs: LandscapeStairsDefinition[],
  getTerrainHeightFn: (x: number, z: number) => number,
  footY?: number,
  floorSlabs: WalkableFloorSlab[] = [],
  stairRamps: InteriorStairRamp[] = [],
  ceilingSlabs: WalkableFloorSlab[] = []
): { x: number; z: number; blocked: boolean } {
  const sampleY = (cx: number, cz: number) =>
    footY !== undefined
      ? getWalkableHeight(cx, cz, footY, stairs, floorSlabs, stairRamps, ceilingSlabs, getTerrainHeightFn)
      : getSupportHeight(cx, cz, stairs, getTerrainHeightFn);

  const prevSupport = sampleY(prevX, prevZ);

  const canStepTo = (cx: number, cz: number): boolean => {
    const dist = Math.hypot(cx - prevX, cz - prevZ);
    if (dist <= 1e-5) return true;
    const nextSupport = sampleY(cx, cz);
    if (nextSupport.onStair) return true;
    const rise = nextSupport.y - prevSupport.y;
    if (rise <= 0) return true;
    const slope = rise / dist;
    return slope <= maxWalkableSlope;
  };

  if (canStepTo(targetX, targetZ)) {
    return { x: targetX, z: targetZ, blocked: false };
  }

  if (canStepTo(targetX, prevZ)) {
    return { x: targetX, z: prevZ, blocked: true };
  }
  if (canStepTo(prevX, targetZ)) {
    return { x: prevX, z: targetZ, blocked: true };
  }

  return { x: prevX, z: prevZ, blocked: true };
}

/**
 * Menyelesaikan tabrakan lingkaran pemain terhadap collider AABB bangunan/dinding (wall slide)
 * serta membatasi posisi di dalam batas luar kawasan. Mendukung batas vertikal minY/maxY per lantai.
 */
export function resolveCircleAABBCollisions(
  x: number,
  z: number,
  radius: number,
  colliders: ColliderAABB[],
  worldBounds: WorldBoundsConfig,
  playerFootY?: number,
  playerBodyHeight: number = STANDING_BODY_HEIGHT
): { x: number; z: number } {
  let px = x;
  let pz = z;

  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < colliders.length; i++) {
      const box = colliders[i];

      // Saring ketinggian apabila collider memiliki batas Y dan tinggi kaki pemain diberikan
      if (
        playerFootY !== undefined &&
        box.minY !== undefined &&
        box.maxY !== undefined
      ) {
        const playerBottomWithStep = playerFootY + 0.24;
        const playerTop = playerFootY + playerBodyHeight;
        if (playerTop <= box.minY || playerBottomWithStep >= box.maxY) {
          continue;
        }
      }

      const closestX = clamp(px, box.minX, box.maxX);
      const closestZ = clamp(pz, box.minZ, box.maxZ);

      const dx = px - closestX;
      const dz = pz - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq >= radius * radius) continue;

      if (distSq > 1e-8) {
        const dist = Math.sqrt(distSq);
        const push = radius - dist;
        px += (dx / dist) * push;
        pz += (dz / dist) * push;
      } else {
        const dLeft = Math.abs(px - box.minX);
        const dRight = Math.abs(box.maxX - px);
        const dTop = Math.abs(pz - box.minZ);
        const dBottom = Math.abs(box.maxZ - pz);
        const minEdge = Math.min(dLeft, dRight, dTop, dBottom);

        if (minEdge === dLeft) px = box.minX - radius;
        else if (minEdge === dRight) px = box.maxX + radius;
        else if (minEdge === dTop) pz = box.minZ - radius;
        else pz = box.maxZ + radius;
      }
    }

    px = clamp(px, worldBounds.minX + radius, worldBounds.maxX - radius);
    pz = clamp(pz, worldBounds.minZ + radius, worldBounds.maxZ - radius);
  }

  return { x: px, z: pz };
}

export function smoothValue(
  current: number,
  target: number,
  rate: number,
  delta: number
): number {
  const dt = clamp(delta, 0, 0.1);
  const alpha = 1 - Math.exp(-rate * dt);
  return current + (target - current) * alpha;
}
