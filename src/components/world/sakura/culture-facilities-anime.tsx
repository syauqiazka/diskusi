"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { getSharedGradientMap } from "@/lib/world/anime-materials";

export function SakuraCultureFacilities() {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  const mats = useMemo(() => {
    return {
      cultureWall: new THREE.MeshToonMaterial({
        color: new THREE.Color("#4338CA"),
        gradientMap,
      }),
      cultureRoof: new THREE.MeshToonMaterial({
        color: new THREE.Color("#1E1B4B"),
        gradientMap,
      }),
      woodBridge: new THREE.MeshToonMaterial({
        color: new THREE.Color("#DC2626"), // Jembatan merah melengkung tradisional Jepang
        gradientMap,
      }),
      koiWater: new THREE.MeshStandardMaterial({
        color: "#0284C7",
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.82,
      }),
      rock: new THREE.MeshToonMaterial({
        color: new THREE.Color("#64748B"),
        gradientMap,
      }),
      tennisCourt: new THREE.MeshStandardMaterial({
        color: "#059669", // Hijau lapangan tenis
        roughness: 0.8,
      }),
      tennisLine: new THREE.MeshBasicMaterial({ color: "#FFFFFF" }),
      kyudoDojoWall: new THREE.MeshToonMaterial({
        color: new THREE.Color("#8D5B4C"), // Kayu dojo tradisional
        gradientMap,
      }),
      tatami: new THREE.MeshToonMaterial({
        color: new THREE.Color("#D9F99D"),
        gradientMap,
      }),
      targetWhite: new THREE.MeshBasicMaterial({ color: "#FFFFFF" }),
      targetBlack: new THREE.MeshBasicMaterial({ color: "#0F172A" }),
    };
  }, [gradientMap]);

  return (
    <group name="sakura_culture_facilities">
      {/* 1. GEDUNG BUDAYA (Seni & Ruang Teh) - Posisi [22, 0, 22] */}
      <group position={[22, 0, 22]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow material={mats.cultureWall}>
          <boxGeometry args={[18, 7.0, 14]} />
        </mesh>
        {/* Atap Tradisional Miring Jepang */}
        <mesh position={[0, 7.6, 0]} material={mats.cultureRoof}>
          <boxGeometry args={[19.2, 0.8, 15.2]} />
        </mesh>
        <mesh position={[0, 8.8, 0]} rotation={[0, Math.PI / 4, 0]} material={mats.cultureRoof}>
          <coneGeometry args={[7.5, 1.8, 4]} />
        </mesh>
      </group>

      {/* 2. TAMAN KOI DENGAN KOLAM & JEMBATAN MERAH MELENGKUNG - Posisi [10, 0, 22] */}
      <group position={[10, 0, 22]}>
        {/* Kolam Air Dangkal Berbatu (Bentuk Elips Alami) */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5.5, 24]} />
          <primitive object={mats.koiWater} attach="material" />
        </mesh>
        {/* Bebatuan Tepi Kolam */}
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const r = 5.2 + (i % 2 === 0 ? 0.3 : -0.2);
          return (
            <mesh key={`rock_${i}`} position={[Math.cos(angle) * r, 0.18, Math.sin(angle) * r]} material={mats.rock}>
              <dodecahedronGeometry args={[0.45, 0]} />
            </mesh>
          );
        })}
        {/* Jembatan Tradisional Melengkung Merah (Taiko Bashi) Menyeberangi Kolam */}
        <group position={[0, 0.6, 0]}>
          {/* Lengkung Jembatan */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[2.8, 2.8, 1.4, 24, 1, false, 0, Math.PI / 3]} />
            <primitive object={mats.woodBridge} attach="material" />
          </mesh>
          {/* Railing Kayu Merah */}
          <mesh position={[-0.65, 0.5, 0]}>
            <boxGeometry args={[0.08, 0.45, 3.2]} />
            <primitive object={mats.woodBridge} attach="material" />
          </mesh>
          <mesh position={[0.65, 0.5, 0]}>
            <boxGeometry args={[0.08, 0.45, 3.2]} />
            <primitive object={mats.woodBridge} attach="material" />
          </mesh>
        </group>
      </group>

      {/* 3. DUA LAPANGAN TENIS OUTDOOR - Posisi [38, 0, 14] */}
      <group position={[38, 0, 14]}>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mats.tennisCourt}>
          <planeGeometry args={[14, 22]} />
        </mesh>
        {/* Garis-garis Putih Lapangan Tenis */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[12, 0.01, 20]} />
          <primitive object={mats.tennisLine} attach="material" wireframe />
        </mesh>
        {/* Jaring Net Tengah Lapangan */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[13.5, 0.9, 0.04]} />
          <meshStandardMaterial color="#FFFFFF" wireframe />
        </mesh>
      </group>

      {/* 4. DOJO KYUDO (PANAHAN TRADISIONAL JEPANG) - Posisi [38, 0, 28] */}
      <group position={[38, 0, 28]}>
        {/* Bangunan Aula Panahan (Shajo) */}
        <mesh position={[0, 2.4, 4.0]} castShadow material={mats.kyudoDojoWall}>
          <boxGeometry args={[12, 4.8, 6.0]} />
        </mesh>
        {/* Atap Miring Kayu Dojo */}
        <mesh position={[0, 5.0, 4.0]} material={mats.cultureRoof}>
          <boxGeometry args={[13, 0.6, 7.0]} />
        </mesh>
        {/* Area Lapangan Tembak Panahan Berumput Menuju Sasaran */}
        <mesh position={[0, 0.02, -5.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 12]} />
          <meshStandardMaterial color="#15803D" roughness={0.8} />
        </mesh>
        {/* Rumah Sasaran Panahan (Azuchi) & Papan Target (Matoi) */}
        <group position={[0, 0.8, -10.5]}>
          <mesh material={mats.kyudoDojoWall}>
            <boxGeometry args={[8, 1.8, 1.2]} />
          </mesh>
          {/* 3 Lingkaran Sasaran Target Panah Hitam-Putih */}
          {[-2.2, 0, 2.2].map((tx, idx) => (
            <group key={`matoi_${idx}`} position={[tx, 0.4, 0.62]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.04, 24]} />
                <primitive object={mats.targetWhite} attach="material" />
              </mesh>
              <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.05, 24]} />
                <primitive object={mats.targetBlack} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 5. POS SATPAM DI SEBELAH TIMUR GERBANG UTAMA - Posisi [9, 0, 46] */}
      <group position={[9, 0, 46]}>
        <mesh position={[0, 1.6, 0]} castShadow material={mats.cultureWall}>
          <boxGeometry args={[4.2, 3.2, 3.8]} />
        </mesh>
        <mesh position={[0, 3.4, 0]} material={mats.cultureRoof}>
          <boxGeometry args={[4.8, 0.4, 4.4]} />
        </mesh>
        {/* Kaca Pengawas */}
        <mesh position={[-1.2, 1.6, 1.92]}>
          <boxGeometry args={[1.6, 1.2, 0.04]} />
          <meshStandardMaterial color="#BAE6FD" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
}
