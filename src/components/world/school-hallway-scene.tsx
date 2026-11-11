"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useWorldStore } from "@/stores/use-world-store";
import {
  COLORS,
  floorMaterial,
  wallMaterial,
  ceilingMaterial,
  neonTubeMaterial,
} from "./hallway-materials";
import {
  ClassroomDoorObject,
  MadingBoardObject,
  LibraryDoorObject,
  StudentLockersObject,
  MirrorWallObject,
  CautionWetFloorSign,
} from "./interactive-objects";

export function SchoolHallwayScene() {
  const nightMode = useWorldStore((s) => s.worldSettings.nightMode);
  const lightsRef = React.useRef<(THREE.PointLight | null)[]>([]);

  // Posisi lampu-lampu neon sepanjang lorong
  const neonPositions: [number, number, number][] = [
    [0, 3.1, 4],
    [0, 3.1, 0],
    [0, 3.1, -4],
    [0, 3.1, -8],
    [0, 3.1, -12],
    [0, 3.1, -16],
    [0, 3.1, -20],
  ];

  // Efek flicker halus lampu neon (sesuai aturan aksesibilitas: tidak lebih dari 2Hz)
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    lightsRef.current.forEach((light, i) => {
      if (light) {
        // Variasi intensitas lembut (0.6 - 0.9)
        const flicker = Math.sin(time * 1.5 + i * 2.0) * 0.12;
        light.intensity = (nightMode ? 0.75 : 1.1) + flicker;
      }
    });
  });

  return (
    <>
      {/* Warna Latar & Kabut Suasana Sekolah Tengah Malam */}
      <color attach="background" args={[nightMode ? COLORS.night : "#1E2530"]} />
      <fog attach="fog" args={[nightMode ? COLORS.night : "#1E2530", 5, 26]} />

      {/* Pencahayaan Ambient & Directional Halus */}
      <ambientLight intensity={nightMode ? 0.25 : 0.65} color={COLORS.fluor} />
      <directionalLight
        position={[0, 4, 2]}
        intensity={nightMode ? 0.2 : 0.5}
        color={COLORS.fluor}
      />

      {/* === ARSITEKTUR FISIK LORONG (Low-poly Liminal) === */}
      {/* 1. Lantai Lorong (Panjang 32m, Lebar 6m) */}
      <mesh position={[0, 0, -8]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[6.2, 34]} />
      </mesh>

      {/* Grid Lis Lantai Ubin */}
      {Array.from({ length: 16 }).map((_, idx) => (
        <mesh
          key={`tile-line-${idx}`}
          position={[0, 0.005, 8 - idx * 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[6.0, 0.02]} />
          <meshBasicMaterial color="#222834" />
        </mesh>
      ))}

      {/* 2. Plafon Lorong */}
      <mesh position={[0, 3.2, -8]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMaterial}>
        <planeGeometry args={[6.2, 34]} />
      </mesh>

      {/* 3. Dinding Kiri (X = -3.05) */}
      <mesh position={[-3.05, 1.6, -8]} rotation={[0, Math.PI / 2, 0]} material={wallMaterial}>
        <planeGeometry args={[34, 3.2]} />
      </mesh>
      {/* Lis Bawah Dinding Kiri */}
      <mesh position={[-3.0, 0.1, -8]}>
        <boxGeometry args={[0.08, 0.2, 34]} />
        <meshStandardMaterial color="#0E121A" />
      </mesh>

      {/* 4. Dinding Kanan (X = +3.05) */}
      <mesh position={[3.05, 1.6, -8]} rotation={[0, -Math.PI / 2, 0]} material={wallMaterial}>
        <planeGeometry args={[34, 3.2]} />
      </mesh>
      {/* Lis Bawah Dinding Kanan */}
      <mesh position={[3.0, 0.1, -8]}>
        <boxGeometry args={[0.08, 0.2, 34]} />
        <meshStandardMaterial color="#0E121A" />
      </mesh>

      {/* 5. Dinding Ujung Belakang (Z = -24.05) */}
      <mesh position={[0, 1.6, -24.05]} material={wallMaterial}>
        <planeGeometry args={[6.2, 3.2]} />
      </mesh>
      {/* Rambu Pintu Keluar / Evakuasi di Ujung */}
      <mesh position={[0, 2.7, -24.0]}>
        <boxGeometry args={[1.2, 0.35, 0.04]} />
        <meshStandardMaterial color={COLORS.ok} emissive={COLORS.ok} emissiveIntensity={0.6} />
      </mesh>
      <Text
        position={[0, 2.7, -23.97]}
        fontSize={0.16}
        color={COLORS.night}
        anchorX="center"
        anchorY="middle"
      >
        KELUAR / EXIT
      </Text>

      {/* 6. Dinding Pintu Masuk / Lobby Depan (Z = +8.05) */}
      <mesh position={[0, 1.6, 8.05]} rotation={[0, Math.PI, 0]} material={wallMaterial}>
        <planeGeometry args={[6.2, 3.2]} />
      </mesh>
      <Text
        position={[0, 2.7, 7.95]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.15}
        color={COLORS.caution}
        anchorX="center"
        anchorY="middle"
      >
        GEDUNG SEKOLAH — LT 1
      </Text>

      {/* === LAMPU NEON SEPANJANG LORONG === */}
      {neonPositions.map((pos, idx) => (
        <group key={`neon-${idx}`} position={pos}>
          {/* Dudukan Tabung Neon */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[2.2, 0.08, 0.22]} />
            <meshStandardMaterial color="#1A1F2B" roughness={0.7} />
          </mesh>
          {/* Tabung Neon Menyala */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={neonTubeMaterial}>
            <cylinderGeometry args={[0.04, 0.04, 1.9, 8]} />
          </mesh>
          {/* Point Light Pencahayaan Ruang */}
          <pointLight
            ref={(el) => {
              lightsRef.current[idx] = el;
            }}
            color={COLORS.fluor}
            intensity={0.8}
            distance={7.5}
            decay={2}
            position={[0, -0.3, 0]}
          />
        </group>
      ))}

      {/* === OBJEK-OBJEK INTERAKTIF 3.2 === */}
      {/* 1. Pintu Ruang Kelas SIJA */}
      <ClassroomDoorObject />

      {/* 2. Mading Sekolah Global */}
      <MadingBoardObject />

      {/* 3. Perpustakaan Terbuka */}
      <LibraryDoorObject />

      {/* 4. Loker Siswa */}
      <StudentLockersObject />

      {/* 5. Cermin Kosmetik Lorong */}
      <MirrorWallObject />

      {/* 6. Rambu Awas Lantai Basah */}
      <CautionWetFloorSign position={[0.8, 0, -4]} />
      <CautionWetFloorSign position={[-0.8, 0, -16]} />
    </>
  );
}
