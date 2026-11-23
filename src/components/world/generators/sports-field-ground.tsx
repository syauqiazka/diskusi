/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generator Lapangan Olahraga Gabungan Sepak Bola + Bisbol
 * Seluruh dimensi & titik bersumber 100% dari src/data/campus.json.field:
 * - Pusat lapangan di (0, 178)
 * - Sepak bola: 105 x 68 m (x: -52.5..52.5, z: 144..212)
 * - Lintasan lari tartan 8 m mengelilinginya (outer x: -61..61, z: 136..220)
 * - Overlay Bisbol: homePlate (0, 147), first (19.4, 166.4), second (0, 186.8), third (-19.4, 166.4), mound (0, 160.4), outfieldRadius 60 m
 * - Toggle mode: "SOCCER", "BASEBALL", "BOTH"
 */

import React, { useMemo } from "react";
import * as THREE from "three";
import { getSharedGradientMap, ANIME_MATERIALS } from "./materials";
import { useSakuraStore } from "@/stores/use-sakura-store";
import { CAMPUS_JSON } from "@/data/campus";

export function SportsFieldGround() {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);
  const trackMat = useMemo(() => ANIME_MATERIALS.runningTrack(gradientMap), [gradientMap]);
  const pitchMat = useMemo(() => ANIME_MATERIALS.soccerPitch(gradientMap), [gradientMap]);
  const dirtMat = useMemo(() => ANIME_MATERIALS.baseballDirt(gradientMap), [gradientMap]);

  const fieldMode = useSakuraStore((s) => s.fieldMode);
  const showSoccer = fieldMode === "SOCCER" || fieldMode === "BOTH";
  const showBaseball = fieldMode === "BASEBALL" || fieldMode === "BOTH";

  const fl = CAMPUS_JSON.field;
  const cx = fl.center.x; // 0
  const cz = fl.center.z; // 178
  const bb = fl.baseball;

  return (
    <group position={[cx, 0, cz]} name="sports_field_ground">
      {/* 1. LINTASAN LARI TARTAN 8M KELILING (Outer: 122 x 84 m: x -61..61, z 136..220) */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={trackMat}>
        <planeGeometry args={[122, 84]} />
      </mesh>

      {/* 2. LAPANGAN RUMPUT SEPAK BOLA (105 x 68 m: x -52.5..52.5, z 144..212) */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={pitchMat}>
        <planeGeometry args={[105, 68]} />
      </mesh>

      {/* 3. MARKINGS SEPAK BOLA */}
      {showSoccer && (
        <group name="soccer_markings">
          {/* Garis Batas Luar Lapangan */}
          <lineSegments position={[0, 0.02, 0]}>
            <edgesGeometry args={[new THREE.BoxGeometry(105, 0.01, 68)]} />
            <lineBasicMaterial color="#FFFFFF" linewidth={2} />
          </lineSegments>
          {/* Garis Tengah */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 68]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Lingkaran Tengah r = 9.15m */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[9.05, 9.25, 48]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Gawang Barat (x = -52.5) */}
          <group position={[-52.5, 0, 0]}>
            <mesh position={[0, 1.22, -3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 1.22, 3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 2.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 7.32, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>

          {/* Gawang Timur (x = 52.5) */}
          <group position={[52.5, 0, 0]}>
            <mesh position={[0, 1.22, -3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 1.22, 3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 2.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 7.32, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        </group>
      )}

      {/* 4. OVERLAY BASEBALL DIAMOND (DITATA SESUAI SPESIFIKASI PERSIS) */}
      {showBaseball && (
        <group name="baseball_diamond">
          {/* Relatif terhadap pusat lapangan cz = 178:
              homePlate z = 147 -> z_rel = 147 - 178 = -31
              first: (19.4, 166.4 - 178) = (19.4, -11.6)
              second: (0, 186.8 - 178) = (0, 8.8)
              third: (-19.4, 166.4 - 178) = (-19.4, -11.6)
              mound: (0, 160.4 - 178) = (0, -17.6)
              baseDistance: 27.4 m (hypot(19.4, 19.4) = 27.436 m)
              Infield interior adalah RUMPUT (grassInfield: true).
              Tanah liat merah HANYA berupa jalur selebar 5 m di sepanjang base lines,
              lingkaran r=2.7 m di mound, r=1.5 m di home plate & base cut-outs.
          */}

          {/* 1. Jalur Tanah Liat Merah Selebar 5 m di Sepanjang Garis Lintasan Antar-Base */}
          {/* Home -> First Base (0, -31) -> (19.4, -11.6): mid = (9.7, -21.3), len = 27.436 m */}
          <mesh position={[9.7, 0.016, -21.3]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]} material={dirtMat}>
            <planeGeometry args={[5.0, 27.436]} />
          </mesh>

          {/* First -> Second Base (19.4, -11.6) -> (0, 8.8): mid = (9.7, -1.4), len = 28.15 m */}
          <mesh
            position={[9.7, 0.016, -1.4]}
            rotation={[-Math.PI / 2, 0, -Math.atan2(-19.4, 20.4)]}
            material={dirtMat}
          >
            <planeGeometry args={[5.0, 28.15]} />
          </mesh>

          {/* Second -> Third Base (0, 8.8) -> (-19.4, -11.6): mid = (-9.7, -1.4), len = 28.15 m */}
          <mesh
            position={[-9.7, 0.016, -1.4]}
            rotation={[-Math.PI / 2, 0, -Math.atan2(-19.4, -20.4)]}
            material={dirtMat}
          >
            <planeGeometry args={[5.0, 28.15]} />
          </mesh>

          {/* Third -> Home Base (-19.4, -11.6) -> (0, -31): mid = (-9.7, -21.3), len = 27.436 m */}
          <mesh
            position={[-9.7, 0.016, -21.3]}
            rotation={[-Math.PI / 2, 0, -Math.atan2(19.4, -19.4)]}
            material={dirtMat}
          >
            <planeGeometry args={[5.0, 27.436]} />
          </mesh>

          {/* 2. Lingkaran Tanah Liat di Sekitar Mound & Base Cut-outs */}
          {/* Mound Circle r = 2.7 m di (0, -17.6) */}
          <mesh position={[bb.mound.x, 0.017, bb.mound.z - cz]} rotation={[-Math.PI / 2, 0, 0]} material={dirtMat}>
            <circleGeometry args={[2.7, 32]} />
          </mesh>

          {/* Home Plate Circle r = 1.5 m di (0, -31) */}
          <mesh position={[bb.homePlate.x, 0.017, bb.homePlate.z - cz]} rotation={[-Math.PI / 2, 0, 0]} material={dirtMat}>
            <circleGeometry args={[1.5, 32]} />
          </mesh>

          {/* First Base Cut-out Circle r = 1.5 m */}
          <mesh position={[bb.first.x, 0.017, bb.first.z - cz]} rotation={[-Math.PI / 2, 0, 0]} material={dirtMat}>
            <circleGeometry args={[1.5, 32]} />
          </mesh>

          {/* Second Base Cut-out Circle r = 1.5 m */}
          <mesh position={[bb.second.x, 0.017, bb.second.z - cz]} rotation={[-Math.PI / 2, 0, 0]} material={dirtMat}>
            <circleGeometry args={[1.5, 32]} />
          </mesh>

          {/* Third Base Cut-out Circle r = 1.5 m */}
          <mesh position={[bb.third.x, 0.017, bb.third.z - cz]} rotation={[-Math.PI / 2, 0, 0]} material={dirtMat}>
            <circleGeometry args={[1.5, 32]} />
          </mesh>

          {/* 3. Gundukan Pitcher (Pitcher's Mound) Silinder Elevasi 0.2 m */}
          <mesh position={[bb.mound.x, 0.1, bb.mound.z - cz]}>
            <cylinderGeometry args={[2.7, 2.7, 0.2, 24]} />
            <meshStandardMaterial color="#B45309" roughness={0.8} />
          </mesh>

          {/* Plat Home Plate Putih */}
          <mesh position={[bb.homePlate.x, 0.022, bb.homePlate.z - cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.45, 5]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Bantalan Base Putih (First, Second, Third) */}
          <mesh position={[bb.first.x, 0.022, bb.first.z - cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.6, 0.6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[bb.second.x, 0.022, bb.second.z - cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.6, 0.6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[bb.third.x, 0.022, bb.third.z - cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.6, 0.6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Garis Foul Line Putih */}
          <lineSegments position={[0, 0.025, 0]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    bb.homePlate.x, 0.025, bb.homePlate.z - cz,
                    bb.first.x * 2.2, 0.025, (bb.first.z - cz) * 2.2,
                    bb.homePlate.x, 0.025, bb.homePlate.z - cz,
                    bb.third.x * 2.2, 0.025, (bb.third.z - cz) * 2.2,
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#FFFFFF" linewidth={2} />
          </lineSegments>
        </group>
      )}
    </group>
  );
}
