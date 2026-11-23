/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generator Pagar, Gerbang, Jalan, Pohon Sakura Avenue, Parkir, dan Bundaran Air Mancur
 * Seluruh geometri dan koordinat diturunkan 100% dari src/data/campus.json.
 */

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  CAMPUS_BOUNDS,
  CAMPUS_PATHS,
  CAMPUS_JSON,
  AVENUE_SAKURA_TREES,
} from "@/data/campus";
import { getSharedGradientMap, ANIME_MATERIALS } from "./materials";
import { MainGateController } from "./door-controller";

export function RoadsAndFence({ isNight = false }: { isNight?: boolean }) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);
  const grassMat = useMemo(() => ANIME_MATERIALS.grass(gradientMap), [gradientMap]);
  const asphaltMat = useMemo(() => ANIME_MATERIALS.asphalt(gradientMap), [gradientMap]);
  const graniteMat = useMemo(() => ANIME_MATERIALS.granite(gradientMap), [gradientMap]);

  const f = CAMPUS_JSON.fountain;
  const waterJetsRef = useRef<THREE.Points>(null);

  // Partikel 8 Jet Melingkar + 1 Jet Pusat
  const { particlePositions, particleCount } = useMemo(() => {
    const count = 360;
    const pos = new Float32Array(count * 3);
    const jetsCount = f.jets;
    const jetsRadius = 6.0;

    for (let i = 0; i < count; i++) {
      if (i < 280) {
        const jetIndex = i % jetsCount;
        const angle = (jetIndex / jetsCount) * Math.PI * 2;
        const progress = (Math.floor(i / jetsCount) / (count / jetsCount)) * Math.PI;
        const r = jetsRadius + Math.sin(progress) * 0.4;
        const h = Math.sin(progress) * 4.5;
        pos[i * 3] = f.cx + Math.cos(angle) * r;
        pos[i * 3 + 1] = 0.6 + h;
        pos[i * 3 + 2] = f.cz + Math.sin(angle) * r;
      } else {
        const p = ((i - 280) / 80) * Math.PI;
        pos[i * 3] = f.cx + (Math.random() - 0.5) * 0.4;
        pos[i * 3 + 1] = 0.6 + Math.sin(p) * 6.5;
        pos[i * 3 + 2] = f.cz + (Math.random() - 0.5) * 0.4;
      }
    }
    return { particlePositions: pos, particleCount: count };
  }, [f.cx, f.cz, f.jets]);

  useFrame(() => {
    if (!waterJetsRef.current) return;
    const geom = waterJetsRef.current.geometry;
    const posAttr = geom.getAttribute("position");
    if (!posAttr) return;

    const t = performance.now() * 0.004;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const origY = particlePositions[i * 3 + 1];
      arr[i * 3 + 1] = origY + Math.sin(t + i * 0.1) * 0.15;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group name="roads_fence_and_landscape">
      {/* 1. TANAH DASAR RUMPUT KAMPUS (-100..100, 0..240, pusat di (0, 120)) */}
      <mesh position={[0, -0.01, 120]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={grassMat}>
        <planeGeometry args={[CAMPUS_BOUNDS.width, CAMPUS_BOUNDS.depth]} />
      </mesh>

      {/* 2. PAGAR KELILING TEMBOK 2.4M (x: -100..100, z: 0..240) */}
      <group name="campus_fences">
        {/* Dinding Belakang Utara (z = 240) */}
        <mesh position={[0, 1.2, 240]}>
          <boxGeometry args={[200, 2.4, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Dinding Sisi Barat (x = -100) */}
        <mesh position={[-100, 1.2, 120]}>
          <boxGeometry args={[0.4, 2.4, 240]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Dinding Sisi Timur (x = 100) */}
        <mesh position={[100, 1.2, 120]}>
          <boxGeometry args={[0.4, 2.4, 240]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Dinding Depan Selatan (Kiri Gerbang: x -100..-5, Kanan Gerbang: x 5..100) */}
        <mesh position={[-52.5, 1.2, 0]}>
          <boxGeometry args={[95, 2.4, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[52.5, 1.2, 0]}>
          <boxGeometry args={[95, 2.4, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* 3. GERBANG GESER 10M DI (0, 0) */}
      <MainGateController />

      {/* 4. POS SATPAM 4X4M DI (-14, 4), Pintu Timur di (-12, 4) */}
      <group position={[-14, 0, 4]} name="guard_post_building">
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4, 3.0, 4]} />
          <meshStandardMaterial color="#F8FAFC" />
        </mesh>
        {/* Atap Pos Satpam */}
        <mesh position={[0, 3.15, 0]}>
          <boxGeometry args={[4.6, 0.3, 4.6]} />
          <meshStandardMaterial color="#3B82F6" />
        </mesh>
        {/* Pintu & Jendela Menghadap ke Arah Gerbang (Sisi Timur x = -12) */}
        <mesh position={[2.01, 1.0, 0]}>
          <boxGeometry args={[0.05, 2.0, 1.0]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
        <mesh position={[2.01, 1.8, 1.0]}>
          <boxGeometry args={[0.05, 1.0, 1.2]} />
          <meshStandardMaterial color="#BAE6FD" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* 5. JALUR ENTRANCE AVENUE & POHON SAKURA (x: -6..6, z: 0..38) */}
      <mesh position={[0, 0.01, 19]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={asphaltMat}>
        <planeGeometry args={[12, 38]} />
      </mesh>
      {/* Trotoar Sisi Kiri & Kanan Avenue */}
      <mesh position={[-6.5, 0.04, 19]} material={graniteMat}>
        <boxGeometry args={[1.0, 0.08, 38]} />
      </mesh>
      <mesh position={[6.5, 0.04, 19]} material={graniteMat}>
        <boxGeometry args={[1.0, 0.08, 38]} />
      </mesh>

      {/* Pohon Sakura Berderet di x = +-9 every 6m (z = 6, 12, 18, 24, 30, 36) */}
      {AVENUE_SAKURA_TREES.map(([tx, ty, tz], idx) => (
        <group key={`sakura_tree_${idx}`} position={[tx, ty, tz]}>
          {/* Batang Kayu */}
          <mesh position={[0, 2.0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.38, 4.0, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          {/* Tajuk Bunga Sakura Pink Mekar */}
          <mesh position={[0, 4.6, 0]}>
            <sphereGeometry args={[2.3, 16, 16]} />
            <meshStandardMaterial color="#F472B6" roughness={0.6} />
          </mesh>
          <mesh position={[0.4, 5.4, 0.3]}>
            <sphereGeometry args={[1.7, 12, 12]} />
            <meshStandardMaterial color="#FBCFE8" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 6. PARKIR SEPEDA (x: -88..-28, z: 10..30) & PARKIR TAMU (x: 28..88, z: 10..30) */}
      {/* Parkir Sepeda */}
      <group position={[-58, 0, 20]}>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={asphaltMat}>
          <planeGeometry args={[60, 20]} />
        </mesh>
        {/* Kanopi Pelindung Sepeda */}
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[56, 0.1, 8]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
      </group>

      {/* Parkir Tamu */}
      <group position={[58, 0, 20]}>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={asphaltMat}>
          <planeGeometry args={[60, 20]} />
        </mesh>
        {/* Garis Marka Parkir */}
        {[-24, -16, -8, 0, 8, 16, 24].map((mx) => (
          <mesh key={`p_mark_${mx}`} position={[mx, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}
      </group>

      {/* 7. FOUNTAIN ROUNDABOUT DI PUSAT (0, 62) */}
      <group position={[f.cx, 0, f.cz]} name="fountain_roundabout">
        {/* Ring Jalan Drop-Off Aspal (r = 18..24m) */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={asphaltMat}>
          <ringGeometry args={[f.roadInnerR, f.roadOuterR, 48]} />
        </mesh>

        {/* Plaza Granit Pejalan Kaki (r = 0..18m) */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={graniteMat}>
          <circleGeometry args={[f.plazaR, 48]} />
        </mesh>

        {/* Pita Lantai Motif Sakura 8 Arah (r = 11..16m, setiap 45 derajat) */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((dir) => {
          const angle = (dir * Math.PI) / 4;
          return (
            <group key={`petal_${dir}`} rotation={[0, -angle, 0]} position={[0, 0.04, 0]}>
              <mesh position={[0, 0, 13.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.8, 5]} />
                <meshStandardMaterial color="#F472B6" roughness={0.4} />
              </mesh>
            </group>
          );
        })}

        {/* Bak Kolam Air Bundar Granit (r = 8m) */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[f.basinR + 0.3, f.basinR + 0.3, 0.8, 48, 1, true]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.3} />
        </mesh>

        {/* Permukaan Air Kolam */}
        <mesh position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[f.basinR, 48]} />
          <meshPhysicalMaterial
            color="#38BDF8"
            transparent
            opacity={0.8}
            roughness={0.1}
            transmission={0.8}
          />
        </mesh>

        {/* Iluminasi LED Hangat Malam Hari */}
        {isNight && (
          <pointLight position={[0, 1.8, 0]} intensity={5.0} distance={30} color="#FB7185" />
        )}
      </group>

      {/* Partikel Pancuran Air Animasi (8 Jet Melingkar + 1 Jet Pusat) */}
      <points ref={waterJetsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#BAE6FD"
          size={0.2}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>

      {/* 8. JALUR JALAN KAKI SESUAI EDGES & NODES PADA campus.json (width = 3.0m) */}
      <group name="campus_paths">
        {CAMPUS_PATHS.filter((seg) => {
          // Filter jalur interior gedung utama agar tidak menembus lantai ruangan
          if (
            (seg.id.includes("main_S") && seg.id.includes("main_E")) ||
            (seg.id.includes("main_S") && seg.id.includes("main_W")) ||
            (seg.id.includes("main_S") && seg.id.includes("main_N"))
          ) {
            return false;
          }
          return true;
        }).map((seg) => {
          const dx = seg.to[0] - seg.from[0];
          const dz = seg.to[1] - seg.from[1];
          const length = Math.hypot(dx, dz);
          if (length < 0.01) return null;

          const midX = (seg.from[0] + seg.to[0]) / 2;
          const midZ = (seg.from[1] + seg.to[1]) / 2;
          const angle = Math.atan2(dx, dz);

          return (
            <mesh
              key={seg.id}
              position={[midX, 0.02, midZ]}
              rotation={[-Math.PI / 2, 0, -angle]}
              receiveShadow
            >
              <planeGeometry args={[seg.width, length]} />
              <meshStandardMaterial color="#E2E8F0" roughness={0.8} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
