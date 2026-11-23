/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generator Tangga Berjalan (Walkable Staircases)
 * Menghubungkan setiap lantai Gedung Utama: 1F -> 2F -> 3F -> Atap Okujo
 * Sesuai grid campus.json: tinggi lantai 4.0m, stair blocks di x: -45..-39 dan 39..45, serta Grand Atrium di x: -7..7.
 * Setiap anak tangga memiliki riser 0.20m dan tread 0.30m (20 langkah x 0.20m = 4.0m) untuk navigasi mulus.
 */

import React, { useMemo } from "react";
import { getSharedGradientMap, ANIME_MATERIALS } from "./materials";

interface StairProps {
  floorCutaway?: 1 | 2 | 3 | 4 | "ALL";
}

function StairFlight({
  startPos,
  stepCount = 20,
  stepWidth = 2.4,
  stepDepth = 0.30,
  stepHeight = 0.20,
  direction = 1, // 1 = +Z, -1 = -Z
}: {
  startPos: [number, number, number];
  stepCount?: number;
  stepWidth?: number;
  stepDepth?: number;
  stepHeight?: number;
  direction?: number;
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);
  const stepMat = useMemo(() => ANIME_MATERIALS.corridorFloor(gradientMap), [gradientMap]);

  const steps = useMemo(() => {
    const list = [];
    for (let i = 0; i < stepCount; i++) {
      const y = startPos[1] + i * stepHeight + stepHeight / 2;
      const z = startPos[2] + i * stepDepth * direction;
      list.push({ y, z, key: `step_${i}` });
    }
    return list;
  }, [startPos, stepCount, stepHeight, stepDepth, direction]);

  return (
    <group position={[startPos[0], 0, 0]}>
      {steps.map((st) => (
        <mesh key={st.key} position={[0, st.y, st.z]} receiveShadow material={stepMat}>
          <boxGeometry args={[stepWidth, stepHeight, stepDepth]} />
        </mesh>
      ))}
      {/* Railing Pegangan Tangan Kiri & Kanan */}
      <mesh
        position={[
          stepWidth / 2,
          startPos[1] + (stepCount * stepHeight) / 2 + 0.5,
          startPos[2] + (stepCount * stepDepth * direction) / 2,
        ]}
      >
        <boxGeometry args={[0.08, 1.0, stepCount * stepDepth]} />
        <meshStandardMaterial color="#64748B" />
      </mesh>
      <mesh
        position={[
          -stepWidth / 2,
          startPos[1] + (stepCount * stepHeight) / 2 + 0.5,
          startPos[2] + (stepCount * stepDepth * direction) / 2,
        ]}
      >
        <boxGeometry args={[0.08, 1.0, stepCount * stepDepth]} />
        <meshStandardMaterial color="#64748B" />
      </mesh>
    </group>
  );
}

export function WalkableStairs({ floorCutaway = "ALL" }: StairProps) {
  const shouldRenderFloor = (fl: number) => {
    if (floorCutaway === "ALL") return true;
    if (fl <= (floorCutaway as number)) return true;
    return false;
  };

  return (
    <group name="walkable_staircases">
      {/* 1. GRAND ATRIUM STAIR (1F -> 2F: y 0 s/d 4.0m) di Pusat Atrium x = 0, z = 105 s/d 111 */}
      {shouldRenderFloor(2) && (
        <StairFlight
          startPos={[0, 0, 105]}
          stepCount={20}
          stepWidth={3.6}
          stepDepth={0.30}
          stepHeight={0.20}
          direction={1}
        />
      )}

      {/* 2. TANGGA SAYAP TIMUR (x = 42, z = 106 s/d 116) */}
      {/* 1F -> 2F */}
      {shouldRenderFloor(2) && (
        <StairFlight
          startPos={[42, 0, 106]}
          stepCount={20}
          stepWidth={2.4}
          stepDepth={0.28}
          stepHeight={0.20}
          direction={1}
        />
      )}
      {/* 2F -> 3F (Arah Balik) */}
      {shouldRenderFloor(3) && (
        <StairFlight
          startPos={[42, 4.0, 116]}
          stepCount={20}
          stepWidth={2.4}
          stepDepth={0.28}
          stepHeight={0.20}
          direction={-1}
        />
      )}
      {/* 3F -> Atap Okujo */}
      {(floorCutaway === "ALL" || floorCutaway === 4) && (
        <StairFlight
          startPos={[42, 8.0, 106]}
          stepCount={20}
          stepWidth={2.4}
          stepDepth={0.28}
          stepHeight={0.20}
          direction={1}
        />
      )}

      {/* 3. TANGGA SAYAP BARAT (x = -42, z = 106 s/d 116) */}
      {/* 1F -> 2F */}
      {shouldRenderFloor(2) && (
        <StairFlight
          startPos={[-42, 0, 106]}
          stepCount={20}
          stepWidth={2.4}
          stepDepth={0.28}
          stepHeight={0.20}
          direction={1}
        />
      )}
      {/* 2F -> 3F (Arah Balik) */}
      {shouldRenderFloor(3) && (
        <StairFlight
          startPos={[-42, 4.0, 116]}
          stepCount={20}
          stepWidth={2.4}
          stepDepth={0.28}
          stepHeight={0.20}
          direction={-1}
        />
      )}
      {/* 3F -> Atap Okujo */}
      {(floorCutaway === "ALL" || floorCutaway === 4) && (
        <StairFlight
          startPos={[-42, 8.0, 106]}
          stepCount={20}
          stepWidth={2.4}
          stepDepth={0.28}
          stepHeight={0.20}
          direction={1}
        />
      )}
    </group>
  );
}
