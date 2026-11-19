"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";

interface ClassroomInteriorViewProps {
  position?: [number, number, number];
  rotationY?: number;
}

export function SakuraClassroomInterior({
  position = [-36, 0, -34],
  rotationY = 0,
}: ClassroomInteriorViewProps) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  // Material Toon Interior Kelas
  const mats = useMemo(() => {
    return {
      floor: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.floorParquet),
        gradientMap,
      }),
      wall: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.wallIvory),
        gradientMap,
      }),
      blackboard: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.blackboardGreen),
        gradientMap,
      }),
      woodDesk: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.deskWood),
        gradientMap,
      }),
      metalLegs: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.deskLegs),
        gradientMap,
      }),
      curtain: new THREE.MeshToonMaterial({
        color: new THREE.Color("#FFFFFF"),
        gradientMap,
        transparent: true,
        opacity: 0.75,
      }),
      locker: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.shoeLockerWood),
        gradientMap,
      }),
      glass: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.windowGlassDay),
        gradientMap,
        transparent: true,
        opacity: 0.85,
      }),
    };
  }, [gradientMap]);

  // Formasi 36 Meja Siswa (6 Baris x 6 Kolom) Sesuai Gambar 9
  const desksGrid = useMemo(() => {
    const list = [];
    const rows = 6;
    const cols = 6;
    const startX = -2.5;
    const startZ = -1.8;
    const spacingX = 1.0;
    const spacingZ = 0.95;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          id: `desk_${r}_${c}`,
          x: startX + c * spacingX,
          z: startZ + r * spacingZ,
        });
      }
    }
    return list;
  }, []);

  return (
    <group position={position} rotation={[0, rotationY, 0]} name="sakura_classroom_interior">
      {/* 1. Lantai Kayu Parket Ruang Kelas (7 x 8 m) */}
      <mesh position={[0, 0.05, 0]} receiveShadow material={mats.floor}>
        <boxGeometry args={[7.0, 0.1, 8.0]} />
      </mesh>

      {/* 2. Dinding Depan dengan Papan Tulis Kapur Hijau Besar */}
      <group position={[0, 1.8, -3.95]}>
        <mesh receiveShadow material={mats.wall}>
          <boxGeometry args={[7.0, 3.6, 0.1]} />
        </mesh>
        {/* Papan Tulis Kapur Hijau */}
        <mesh position={[0, 0.15, 0.06]} castShadow material={mats.blackboard}>
          <boxGeometry args={[5.2, 1.35, 0.04]} />
        </mesh>
        {/* Bingkai Papan Tulis */}
        <mesh position={[0, 0.15, 0.05]} material={mats.woodDesk}>
          <boxGeometry args={[5.3, 1.45, 0.02]} />
        </mesh>
        {/* Tatakan Kapur & Penghapus di bawah papan */}
        <mesh position={[0, -0.55, 0.1]} material={mats.woodDesk}>
          <boxGeometry args={[5.0, 0.04, 0.12]} />
        </mesh>
      </group>

      {/* 3. Meja Guru di Depan */}
      <group position={[0, 0.45, -2.8]}>
        {/* Daun Meja Guru */}
        <mesh position={[0, 0.35, 0]} castShadow material={mats.woodDesk}>
          <boxGeometry args={[1.5, 0.06, 0.8]} />
        </mesh>
        {/* Kaki Meja Guru */}
        <mesh position={[-0.65, 0, 0]} material={mats.metalLegs}>
          <boxGeometry args={[0.06, 0.7, 0.7]} />
        </mesh>
        <mesh position={[0.65, 0, 0]} material={mats.metalLegs}>
          <boxGeometry args={[0.06, 0.7, 0.7]} />
        </mesh>
        {/* Kursi Guru */}
        <mesh position={[0, 0.1, -0.6]} castShadow material={mats.woodDesk}>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
        </mesh>
      </group>

      {/* 4. Formasi 36 Meja & Kursi Siswa (6 x 6) */}
      {desksGrid.map((d) => (
        <group key={d.id} position={[d.x, 0.38, d.z]}>
          {/* Daun Meja Siswa */}
          <mesh castShadow receiveShadow material={mats.woodDesk}>
            <boxGeometry args={[0.65, 0.04, 0.45]} />
          </mesh>
          {/* Laci Bawah Meja */}
          <mesh position={[0, -0.08, 0]} material={mats.metalLegs}>
            <boxGeometry args={[0.58, 0.1, 0.4]} />
          </mesh>
          {/* Kaki Meja Besi Abu-abu */}
          <mesh position={[-0.28, -0.2, -0.18]} material={mats.metalLegs}>
            <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
          </mesh>
          <mesh position={[0.28, -0.2, -0.18]} material={mats.metalLegs}>
            <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
          </mesh>
          <mesh position={[-0.28, -0.2, 0.18]} material={mats.metalLegs}>
            <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
          </mesh>
          <mesh position={[0.28, -0.2, 0.18]} material={mats.metalLegs}>
            <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
          </mesh>

          {/* Kursi Siswa */}
          <group position={[0, -0.05, 0.35]}>
            {/* Dudukan Kursi */}
            <mesh material={mats.woodDesk}>
              <boxGeometry args={[0.42, 0.03, 0.4]} />
            </mesh>
            {/* Sandaran Kursi */}
            <mesh position={[0, 0.32, 0.18]} material={mats.woodDesk}>
              <boxGeometry args={[0.4, 0.22, 0.03]} />
            </mesh>
            {/* Rangka Besi Kursi */}
            <mesh position={[-0.18, -0.14, 0]} material={mats.metalLegs}>
              <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
            </mesh>
            <mesh position={[0.18, -0.14, 0]} material={mats.metalLegs}>
              <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* 5. Dinding Kiri dengan 3 Jendela Besar (Cahaya Masuk) */}
      <group position={[-3.45, 1.8, 0]}>
        {/* Dinding Utama */}
        <mesh receiveShadow material={mats.wall}>
          <boxGeometry args={[0.1, 3.6, 8.0]} />
        </mesh>
        {/* 3 Jendela Kaca Besar */}
        {[-2.2, 0, 2.2].map((wz, idx) => (
          <group key={`win_${idx}`} position={[0.06, 0.2, wz]}>
            <mesh material={mats.glass}>
              <boxGeometry args={[0.02, 1.9, 1.8]} />
            </mesh>
            {/* Tirai Putih Melayang di sisi jendela */}
            <mesh position={[0.04, 0, -0.7]} material={mats.curtain}>
              <boxGeometry args={[0.02, 2.0, 0.4]} />
            </mesh>
            <mesh position={[0.04, 0, 0.7]} material={mats.curtain}>
              <boxGeometry args={[0.02, 2.0, 0.4]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Dinding Kanan (Sisi Koridor) dengan Pintu Geser Kayu & Kaca */}
      <group position={[3.45, 1.8, 0]}>
        <mesh receiveShadow material={mats.wall}>
          <boxGeometry args={[0.1, 3.6, 8.0]} />
        </mesh>
        {/* Daun Pintu Geser Depan */}
        <group position={[-0.06, -0.4, -2.6]}>
          <mesh material={mats.woodDesk}>
            <boxGeometry args={[0.04, 2.2, 1.1]} />
          </mesh>
          {/* Panel Kaca Pintu */}
          <mesh position={[0, 0.3, 0]} material={mats.glass}>
            <boxGeometry args={[0.05, 1.0, 0.8]} />
          </mesh>
        </group>
        {/* Daun Pintu Geser Belakang */}
        <group position={[-0.06, -0.4, 2.6]}>
          <mesh material={mats.woodDesk}>
            <boxGeometry args={[0.04, 2.2, 1.1]} />
          </mesh>
          <mesh position={[0, 0.3, 0]} material={mats.glass}>
            <boxGeometry args={[0.05, 1.0, 0.8]} />
          </mesh>
        </group>
      </group>

      {/* 7. Dinding Belakang dengan Deretan Loker Siswa */}
      <group position={[0, 1.8, 3.95]}>
        <mesh receiveShadow material={mats.wall}>
          <boxGeometry args={[7.0, 3.6, 0.1]} />
        </mesh>
        {/* Loker Siswa Kayu di sepanjang dinding belakang */}
        <mesh position={[0, -0.6, -0.25]} castShadow material={mats.locker}>
          <boxGeometry args={[6.2, 1.3, 0.45]} />
        </mesh>
        {/* Garis-garis Pintu Loker */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={`locker_div_${i}`} position={[-2.75 + i * 0.5, -0.6, -0.02]} material={mats.metalLegs}>
            <boxGeometry args={[0.02, 1.25, 0.02]} />
          </mesh>
        ))}
      </group>

      {/* 8. Sinar Matahari Hangat Masuk Menembus Jendela (Afternoon Light Shaft) */}
      <pointLight
        position={[-3.2, 2.4, 0]}
        color="#FDBA74"
        intensity={3.5}
        distance={8}
        decay={2}
      />
    </group>
  );
}

