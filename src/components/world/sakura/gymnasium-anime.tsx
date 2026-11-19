"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";

export function SakuraGymnasium({
  position = [24, 0, -56],
}: {
  position?: [number, number, number];
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  const mats = useMemo(() => {
    return {
      wall: new THREE.MeshToonMaterial({
        color: new THREE.Color("#3730A3"), // Biru indigo khas denah gymnasium
        gradientMap,
      }),
      courtFloor: new THREE.MeshToonMaterial({
        color: new THREE.Color("#E2B887"), // Kayu maple lapangan basket
        gradientMap,
      }),
      courtLine: new THREE.MeshBasicMaterial({ color: "#FFFFFF" }),
      poolWater: new THREE.MeshStandardMaterial({
        color: "#06B6D4",
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.88,
      }),
      poolTile: new THREE.MeshStandardMaterial({ color: "#E0F2FE", roughness: 0.3 }),
      poolLaneMarker: new THREE.MeshBasicMaterial({ color: "#0F172A" }),
      roofDark: new THREE.MeshToonMaterial({
        color: new THREE.Color("#1E1B4B"),
        gradientMap,
      }),
      glass: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.windowGlassDay),
        gradientMap,
        transparent: true,
        opacity: 0.85,
      }),
      stands: new THREE.MeshToonMaterial({
        color: new THREE.Color("#475569"),
        gradientMap,
      }),
    };
  }, [gradientMap]);

  return (
    <group position={position} name="sakura_gymnasium">
      {/* 1. Bangunan Utama Gymnasium (34m x 26m x 11m) */}
      <mesh position={[0, 5.0, 0]} castShadow receiveShadow material={mats.wall}>
        <boxGeometry args={[34, 10, 26]} />
      </mesh>

      {/* Atap Lengkung Busur Gymnasium */}
      <mesh position={[0, 10.4, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.roofDark}>
        <cylinderGeometry args={[13.5, 13.5, 34.2, 32, 1, false, 0, Math.PI]} />
      </mesh>

      {/* Fasad Jendela Kaca Besar Sisi Selatan */}
      <mesh position={[0, 5.5, 13.06]} material={mats.glass}>
        <boxGeometry args={[26, 4.5, 0.1]} />
      </mesh>

      {/* Pintu Masuk Gimnasium & Ruang Fitness di Selatan */}
      <mesh position={[0, 1.4, 13.1]}>
        <boxGeometry args={[4.2, 2.6, 0.12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      {/* 2. Interior Lantai 1: Lapangan Basket Utama di Utara */}
      <mesh position={[0, 0.1, -4.5]} receiveShadow material={mats.courtFloor}>
        <boxGeometry args={[28, 0.1, 14]} />
      </mesh>
      {/* Garis-garis Lapangan Basket & Badminton */}
      <mesh position={[0, 0.16, -4.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.5, 32]} />
        <primitive object={mats.courtLine} attach="material" />
      </mesh>

      {/* Tribun Penonton 400 Kursi (Bertingkat) */}
      <group position={[0, 1.6, 3.8]}>
        {[0, 1, 2, 3].map((step) => (
          <mesh key={`tribun_step_${step}`} position={[0, step * 0.45, step * 0.7]} material={mats.stands}>
            <boxGeometry args={[24, 0.45, 0.8]} />
          </mesh>
        ))}
      </group>

      {/* 3. Sayap Kolam Renang Indoor 25m (6 Lintasan) */}
      <group position={[-9.0, 0.15, -4.5]}>
        {/* Bak Kolam Renang */}
        <mesh position={[0, -0.4, 0]} material={mats.poolTile}>
          <boxGeometry args={[7.5, 0.8, 13.0]} />
        </mesh>
        {/* Air Kolam Renang Jernih */}
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.poolWater}>
          <planeGeometry args={[7.2, 12.8]} />
        </mesh>
        {/* 6 Garis Tali Lintasan (6 Lanes) */}
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((lx, idx) => (
          <mesh key={`lane_${idx}`} position={[lx, 0.01, 0]}>
            <boxGeometry args={[0.06, 0.02, 12.6]} />
            <primitive object={mats.poolLaneMarker} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
