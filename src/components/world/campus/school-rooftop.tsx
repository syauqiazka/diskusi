"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";

interface SchoolRooftopProps {
  width: number;
  depth: number;
  elevation: number;
}

export function SchoolRooftop({
  width = 62,
  depth = 24,
  elevation = 10.2,
}: SchoolRooftopProps) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  // Material Toon Rooftop
  const materials = useMemo(() => {
    return {
      roofFloor: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.roofConcrete),
        gradientMap,
      }),
      fencePost: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.roofFencePost),
        gradientMap,
      }),
      fenceWire: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.roofFenceWire),
        gradientMap,
        transparent: true,
        opacity: 0.7,
      }),
      stairWall: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.stairShackWall),
        gradientMap,
      }),
      stairDoor: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.stairShackDoor),
        gradientMap,
      }),
      waterTankBody: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.waterTankSilver),
        gradientMap,
      }),
      waterTankLegs: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.waterTankLegs),
        gradientMap,
      }),
    };
  }, [gradientMap]);

  const hw = width / 2;
  const hd = depth / 2;
  const fenceHeight = 1.8;

  return (
    <group position={[0, elevation, 0]} name="school_anime_rooftop">
      {/* 1. Pelat Lantai Beton Rooftop */}
      <mesh position={[0, 0, 0]} receiveShadow material={materials.roofFloor}>
        <boxGeometry args={[width, 0.35, depth]} />
      </mesh>

      {/* 2. Parapet Tepi Beton Rendah (0.4m) Mengelilingi Atap */}
      {/* Utara */}
      <mesh position={[0, 0.35, -hd + 0.15]} receiveShadow material={materials.roofFloor}>
        <boxGeometry args={[width, 0.4, 0.3]} />
      </mesh>
      {/* Selatan */}
      <mesh position={[0, 0.35, hd - 0.15]} receiveShadow material={materials.roofFloor}>
        <boxGeometry args={[width, 0.4, 0.3]} />
      </mesh>
      {/* Barat */}
      <mesh position={[-hw + 0.15, 0.35, 0]} receiveShadow material={materials.roofFloor}>
        <boxGeometry args={[0.3, 0.4, depth]} />
      </mesh>
      {/* Timur */}
      <mesh position={[hw - 0.15, 0.35, 0]} receiveShadow material={materials.roofFloor}>
        <boxGeometry args={[0.3, 0.4, depth]} />
      </mesh>

      {/* 3. Pagar Kawat Pengaman Rooftop Khas Anime (Tinggi 1.8m di atas parapet) */}
      {/* Panel Pagar Utara */}
      <mesh position={[0, 0.55 + fenceHeight / 2, -hd + 0.15]} material={materials.fenceWire}>
        <boxGeometry args={[width - 0.6, fenceHeight, 0.05]} />
      </mesh>
      {/* Panel Pagar Selatan */}
      <mesh position={[0, 0.55 + fenceHeight / 2, hd - 0.15]} material={materials.fenceWire}>
        <boxGeometry args={[width - 0.6, fenceHeight, 0.05]} />
      </mesh>
      {/* Panel Pagar Barat */}
      <mesh position={[-hw + 0.15, 0.55 + fenceHeight / 2, 0]} material={materials.fenceWire}>
        <boxGeometry args={[0.05, fenceHeight, depth - 0.6]} />
      </mesh>
      {/* Panel Pagar Timur */}
      <mesh position={[hw - 0.15, 0.55 + fenceHeight / 2, 0]} material={materials.fenceWire}>
        <boxGeometry args={[0.05, fenceHeight, depth - 0.6]} />
      </mesh>

      {/* Tiang Pagar Vertikal Hijau Tua Berulang (Instanced / Loop Setiap 4 Meter) */}
      {Array.from({ length: Math.floor(width / 4) + 1 }).map((_, i) => {
        const x = -hw + 0.3 + i * 4;
        if (x > hw - 0.3) return null;
        return (
          <React.Fragment key={`roof_post_ns_${i}`}>
            {/* Sisi Utara */}
            <mesh position={[x, 0.55 + fenceHeight / 2, -hd + 0.15]} material={materials.fencePost}>
              <boxGeometry args={[0.08, fenceHeight + 0.1, 0.08]} />
            </mesh>
            {/* Sisi Selatan */}
            <mesh position={[x, 0.55 + fenceHeight / 2, hd - 0.15]} material={materials.fencePost}>
              <boxGeometry args={[0.08, fenceHeight + 0.1, 0.08]} />
            </mesh>
          </React.Fragment>
        );
      })}

      {/* 4. Bilik Penutup Tangga Rooftop (Staircase Penthouse Shack) */}
      <group position={[-hw + 14, 1.4, -hd + 7]}>
        {/* Dinding Bilik */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow material={materials.stairWall}>
          <boxGeometry args={[6.5, 2.8, 5.2]} />
        </mesh>
        {/* Atap Datar Bilik dengan List Trim */}
        <mesh position={[0, 1.45, 0]} material={materials.roofFloor}>
          <boxGeometry args={[6.8, 0.15, 5.5]} />
        </mesh>
        {/* Pintu Besi Akses Rooftop */}
        <mesh position={[2.2, -0.2, 2.62]} material={materials.stairDoor}>
          <boxGeometry args={[1.2, 2.2, 0.08]} />
        </mesh>
        {/* Gagang Pintu */}
        <mesh position={[2.65, -0.2, 2.68]} material={materials.waterTankBody}>
          <boxGeometry args={[0.04, 0.18, 0.04]} />
        </mesh>
        {/* Kanopi Kecil di Atas Pintu */}
        <mesh position={[2.2, 1.0, 2.9]} material={materials.roofFloor}>
          <boxGeometry args={[1.6, 0.08, 0.6]} />
        </mesh>
      </group>

      {/* 5. Tangki Air Stainless Steel Rooftop Khas Anime (Water Tower Tank) */}
      <group position={[hw - 12, 0, -hd + 8]}>
        {/* Kaki Rangka Besi (4 Tiang) */}
        {[
          [-1.4, -1.4],
          [1.4, -1.4],
          [-1.4, 1.4],
          [1.4, 1.4],
        ].map(([lx, lz], idx) => (
          <mesh
            key={`tank_leg_${idx}`}
            position={[lx, 1.25, lz]}
            material={materials.waterTankLegs}
          >
            <boxGeometry args={[0.12, 2.5, 0.12]} />
          </mesh>
        ))}

        {/* Silang Palang Penguat Kaki */}
        <mesh position={[0, 1.25, 0]} material={materials.waterTankLegs}>
          <boxGeometry args={[2.8, 0.08, 2.8]} />
        </mesh>

        {/* Pelat Dudukan Tangki */}
        <mesh position={[0, 2.55, 0]} material={materials.waterTankLegs}>
          <boxGeometry args={[3.2, 0.12, 3.2]} />
        </mesh>

        {/* Tangki Air Silinder Utama */}
        <mesh position={[0, 4.1, 0]} castShadow material={materials.waterTankBody}>
          <cylinderGeometry args={[1.5, 1.5, 3.0, 24]} />
        </mesh>

        {/* Tutup Atas Melengkung Tangki */}
        <mesh position={[0, 5.7, 0]} material={materials.waterTankBody}>
          <sphereGeometry args={[1.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3]} />
        </mesh>

        {/* Pipa Distribusi Air Menuju Bawah */}
        <mesh position={[1.2, 2.0, 0]} material={materials.waterTankLegs}>
          <cylinderGeometry args={[0.08, 0.08, 4.0, 12]} />
        </mesh>
      </group>

      {/* 6. Bangku Kayu Rooftop Tempat Bersantai Karakter Anime */}
      <group position={[-hw + 24, 0.45, hd - 4]}>
        {/* Dudukan Bangku */}
        <mesh material={materials.stairDoor}>
          <boxGeometry args={[2.4, 0.1, 0.6]} />
        </mesh>
        {/* Sandaran Bangku */}
        <mesh position={[0, 0.4, 0.25]} material={materials.stairDoor}>
          <boxGeometry args={[2.4, 0.5, 0.08]} />
        </mesh>
        {/* Kaki Bangku Besi */}
        <mesh position={[-1.0, -0.22, 0]} material={materials.waterTankLegs}>
          <boxGeometry args={[0.1, 0.35, 0.5]} />
        </mesh>
        <mesh position={[1.0, -0.22, 0]} material={materials.waterTankLegs}>
          <boxGeometry args={[0.1, 0.35, 0.5]} />
        </mesh>
      </group>
    </group>
  );
}
