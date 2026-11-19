"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";

export function SakuraAuditorium({
  position = [-16, 0, -56],
}: {
  position?: [number, number, number];
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  const mats = useMemo(() => {
    return {
      wall: new THREE.MeshToonMaterial({
        color: new THREE.Color("#4338CA"), // Indigo ungu sesuai denah aula
        gradientMap,
      }),
      roof: new THREE.MeshToonMaterial({
        color: new THREE.Color("#1E1B4B"),
        gradientMap,
      }),
      stageWood: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.doorWood),
        gradientMap,
      }),
      curtainRed: new THREE.MeshToonMaterial({
        color: new THREE.Color("#DC2626"),
        gradientMap,
      }),
      seats: new THREE.MeshToonMaterial({
        color: new THREE.Color("#B91C1C"),
        gradientMap,
      }),
      balcony: new THREE.MeshToonMaterial({
        color: new THREE.Color("#312E81"),
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

  return (
    <group position={position} name="sakura_auditorium">
      {/* 1. Bangunan Luar Aula Teater (32m x 24m x 10m) */}
      <mesh position={[0, 5.0, 0]} castShadow receiveShadow material={mats.wall}>
        <boxGeometry args={[32, 10, 24]} />
      </mesh>

      {/* Atap Pelat Datar dengan Mahkota Piramida Teater */}
      <mesh position={[0, 10.4, 0]} material={mats.roof}>
        <boxGeometry args={[32.5, 0.8, 24.5]} />
      </mesh>
      <mesh position={[0, 11.5, -4.0]} rotation={[0, Math.PI / 4, 0]} material={mats.roof}>
        <coneGeometry args={[10, 2.4, 4]} />
      </mesh>

      {/* Lobi Kaca Masuk Utama Sisi Selatan Menghadap Plaza */}
      <group position={[0, 2.0, 12.1]}>
        <mesh material={mats.glass}>
          <boxGeometry args={[18, 4.0, 0.1]} />
        </mesh>
        {/* Pintu Ganda Kaca */}
        <mesh position={[0, -0.6, 0.1]}>
          <boxGeometry args={[4.0, 2.4, 0.1]} />
          <meshStandardMaterial color="#0284C7" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* 2. Panggung Utama 14 x 8 m di Utara */}
      <group position={[0, 1.2, -6.5]}>
        {/* Lantai Panggung Kayu Polished */}
        <mesh position={[0, 0, 0]} receiveShadow material={mats.stageWood}>
          <boxGeometry args={[14, 0.8, 8]} />
        </mesh>
        {/* Tirai Teater Merah Beludru Kiri & Kanan */}
        <mesh position={[-6.8, 2.5, 0]} material={mats.curtainRed}>
          <boxGeometry args={[0.8, 5.0, 1.2]} />
        </mesh>
        <mesh position={[6.8, 2.5, 0]} material={mats.curtainRed}>
          <boxGeometry args={[0.8, 5.0, 1.2]} />
        </mesh>
        {/* Tirai Layar Atas Panggung */}
        <mesh position={[0, 4.6, 0]} material={mats.curtainRed}>
          <boxGeometry args={[14, 1.0, 0.4]} />
        </mesh>
      </group>

      {/* Pit Orkestra di Depan Panggung */}
      <mesh position={[0, 0.4, -1.8]} material={mats.roof}>
        <boxGeometry args={[12, 0.2, 1.4]} />
      </mesh>

      {/* 3. 4 Blok Kursi Penonton Lantai Utama (Blok A, B, C, D) Sesuai Gambar 7 */}
      <group position={[0, 0.4, 3.5]}>
        {/* Blok A (Kiri, 180 Kursi) */}
        <mesh position={[-7.5, 0.2, 0]} material={mats.seats}>
          <boxGeometry args={[5.5, 0.4, 6.0]} />
        </mesh>
        {/* Blok B (Tengah, 180 Kursi) */}
        <mesh position={[0, 0.2, 0]} material={mats.seats}>
          <boxGeometry args={[6.5, 0.4, 6.0]} />
        </mesh>
        {/* Blok C (Kanan, 180 Kursi) */}
        <mesh position={[7.5, 0.2, 0]} material={mats.seats}>
          <boxGeometry args={[5.5, 0.4, 6.0]} />
        </mesh>
        {/* Blok D (Belakang, 80 Kursi) */}
        <mesh position={[0, 0.4, 4.8]} material={mats.seats}>
          <boxGeometry args={[18, 0.4, 2.2]} />
        </mesh>
      </group>

      {/* 4. Balkon Lantai 2 (180 Kursi & Ruang Kontrol) */}
      <group position={[0, 4.8, 6.5]}>
        <mesh material={mats.balcony}>
          <boxGeometry args={[26, 0.5, 5.5]} />
        </mesh>
        {/* Railing Pengaman Balkon */}
        <mesh position={[0, 0.6, -2.7]} material={mats.glass}>
          <boxGeometry args={[26, 0.9, 0.08]} />
        </mesh>
        {/* Kursi Balkon */}
        <mesh position={[0, 0.4, 0]} material={mats.seats}>
          <boxGeometry args={[24, 0.4, 3.8]} />
        </mesh>
      </group>
    </group>
  );
}
