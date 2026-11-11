import { describe, expect, it } from "vitest";

// Fungsi utilitas pergerakan & batasan ruang (3.5 & 3.6)
export const HALLWAY_BOUNDS = {
  minX: -3.0,
  maxX: 3.0,
  minZ: -24.0,
  maxZ: 8.0,
};

export function clampPosition(
  x: number,
  z: number,
  bounds = HALLWAY_BOUNDS
): { x: number; z: number } {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, z)),
  };
}

export function calculateMovementSpeed(isRunning: boolean, isCrouching: boolean): number {
  if (isCrouching) return 1.8;
  if (isRunning) return 6.5;
  return 3.5;
}

export function interpolateCameraHeight(
  current: number,
  target: number,
  delta: number,
  speed: number = 10
): number {
  const diff = target - current;
  if (Math.abs(diff) < 0.001) return target;
  return current + diff * Math.min(1, delta * speed);
}

export function isInteractableInRange(
  playerPos: [number, number, number],
  objectPos: [number, number, number],
  maxDist: number = 2.5
): { inRange: boolean; distance: number } {
  const dx = playerPos[0] - objectPos[0];
  const dy = playerPos[1] - objectPos[1];
  const dz = playerPos[2] - objectPos[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return {
    inRange: distance <= maxDist,
    distance,
  };
}

describe("Fisika & Matematika Kontrol Pemain 3D (3.5 & 3.6)", () => {
  it("menentukan batas kecepatan pergerakan (jalan, lari, jongkok) secara proporsional", () => {
    // Normal jalan
    expect(calculateMovementSpeed(false, false)).toBe(3.5);

    // Lari (Shift)
    expect(calculateMovementSpeed(true, false)).toBe(6.5);

    // Jongkok (Ctrl) - prioritas perlambatan
    expect(calculateMovementSpeed(true, true)).toBe(1.8);
    expect(calculateMovementSpeed(false, true)).toBe(1.8);
  });

  it("mencegah pemain menembus dinding batas lorong (collision clamping)", () => {
    // Di dalam lorong
    const inside = clampPosition(1.5, 0);
    expect(inside.x).toBe(1.5);
    expect(inside.z).toBe(0);

    // Menabrak dinding kiri / kanan
    const wallLeft = clampPosition(-5.0, 0);
    expect(wallLeft.x).toBe(-3.0);

    const wallRight = clampPosition(6.2, 0);
    expect(wallRight.x).toBe(3.0);

    // Menabrak ujung lorong
    const endFar = clampPosition(0, -35.0);
    expect(endFar.z).toBe(-24.0);

    const entrance = clampPosition(0, 15.0);
    expect(entrance.z).toBe(8.0);
  });

  it("melakukan interpolasi mulus tinggi kamera saat berdiri (1.6m) dan jongkok (0.9m)", () => {
    const standing = 1.6;
    const crouching = 0.9;
    const delta = 0.016; // ~60 FPS

    // Langkah awal menuju jongkok
    const step1 = interpolateCameraHeight(standing, crouching, delta, 10);
    expect(step1).toBeLessThan(standing);
    expect(step1).toBeGreaterThan(crouching);

    // Banyak langkah sampai target tercapai
    let current = standing;
    for (let i = 0; i < 60; i++) {
      current = interpolateCameraHeight(current, crouching, delta, 10);
    }
    expect(Math.abs(current - crouching)).toBeLessThan(0.01);
  });

  it("memverifikasi deteksi jarak interaksi raycast maksimum 2.5m (3.4)", () => {
    const player: [number, number, number] = [0, 1.6, 2];

    // Objek dalam jangkauan (jarak ~1.5m)
    const nearObject: [number, number, number] = [0, 1.6, 0.5];
    const nearResult = isInteractableInRange(player, nearObject, 2.5);
    expect(nearResult.inRange).toBe(true);
    expect(nearResult.distance).toBeCloseTo(1.5, 1);

    // Objek di luar jangkauan (jarak ~3.5m)
    const farObject: [number, number, number] = [0, 1.6, -1.5];
    const farResult = isInteractableInRange(player, farObject, 2.5);
    expect(farResult.inRange).toBe(false);
    expect(farResult.distance).toBeCloseTo(3.5, 1);
  });
});

