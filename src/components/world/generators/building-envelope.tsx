/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Selubung Bangunan Sederhana & Fasilitas Terbuka
 * Seluruh gedung (kecuali Gedung Utama) dirender sebagai volume sederhana
 * dengan bukaan pintu (doorway) pada dinding yang ditentukan dalam campus.json:
 * - Aula Teater: x 36..88, z 40..76, h 14m, pintu barat di (36, 58)
 * - Gimnasium + Kolam: x 50..98, z 90..130, h 12m, pintu barat di (50, 111)
 * - Asrama: x -92..-40, z 48..66, h 13.6m (4 lantai), pintu timur di (-40, 57)
 * - Gedung Budaya: x -98..-50, z 92..120, h 8m (2 lantai), pintu timur di (-50, 106)
 * - Dojo Kyudo: x 76..96, z 140..180, h 6m, pintu barat di (76, 160)
 * - Taman Koi: x -98..-66, z 124..146
 * - Lapangan Tenis: x -94..-74, z 150..216
 */

import React, { useMemo } from "react";
import * as THREE from "three";
import { getSharedGradientMap, ANIME_MATERIALS } from "./materials";
import { CAMPUS_JSON } from "@/data/campus";

export function CampusBuildingEnvelopes() {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);
  const wallMat = useMemo(() => ANIME_MATERIALS.wallWhite(gradientMap), [gradientMap]);
  const roofBlueMat = useMemo(() => ANIME_MATERIALS.roofBlue(gradientMap), [gradientMap]);
  const roofDarkMat = useMemo(() => ANIME_MATERIALS.roofDark(gradientMap), [gradientMap]);
  const waterMat = ANIME_MATERIALS.water;

  const buildings = CAMPUS_JSON.buildings;
  const aula = buildings.find((b) => b.id === "aula")!;
  const gym = buildings.find((b) => b.id === "gym")!;
  const asrama = buildings.find((b) => b.id === "asrama")!;
  const budaya = buildings.find((b) => b.id === "budaya")!;
  const kyudo = buildings.find((b) => b.id === "kyudo")!;

  const zones = CAMPUS_JSON.zones;
  const koi = zones.find((z) => z.id === "koi")!;
  const tennis = zones.find((z) => z.id === "tennis")!;

  return (
    <group name="campus_building_envelopes">
      {/* ========================================================= */}
      {/* 1. AULA TEATER: x 36..88, z 40..76 (52 x 36 m, h 14 m)    */}
      {/* Pintu masuk di dinding Barat (x = 36, z = 58)             */}
      {/* ========================================================= */}
      <group position={[(aula.x0 + aula.x1) / 2, 0, (aula.z0 + aula.z1) / 2]} name="building_aula">
        <mesh position={[0, aula.floorHeight / 2, 0]} castShadow receiveShadow material={wallMat}>
          <boxGeometry args={[aula.x1 - aula.x0, aula.floorHeight, aula.z1 - aula.z0]} />
        </mesh>
        {/* Atap Pelat Miring */}
        <mesh position={[0, aula.floorHeight + 0.5, 0]} material={roofDarkMat}>
          <boxGeometry args={[aula.x1 - aula.x0 + 1.2, 1.0, aula.z1 - aula.z0 + 1.2]} />
        </mesh>
        {/* Pintu Barat di x = 36, z = 58 (relatif terhadap center) */}
        <mesh position={[-(aula.x1 - aula.x0) / 2 - 0.05, 2.0, 58 - (aula.z0 + aula.z1) / 2]}>
          <boxGeometry args={[0.2, 4.0, 3.2]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 2. GIMNASIUM + KOLAM: x 50..98, z 90..130 (48 x 40 m, h 12 m) */}
      {/* Pintu masuk di dinding Barat (x = 50, z = 111)           */}
      {/* ========================================================= */}
      <group position={[(gym.x0 + gym.x1) / 2, 0, (gym.z0 + gym.z1) / 2]} name="building_gym">
        <mesh position={[0, gym.floorHeight / 2, 0]} castShadow receiveShadow material={wallMat}>
          <boxGeometry args={[gym.x1 - gym.x0, gym.floorHeight, gym.z1 - gym.z0]} />
        </mesh>
        {/* Atap Gimnasium */}
        <mesh position={[0, gym.floorHeight + 0.5, 0]} material={roofBlueMat}>
          <boxGeometry args={[gym.x1 - gym.x0 + 1.2, 1.0, gym.z1 - gym.z0 + 1.2]} />
        </mesh>
        {/* Pintu Barat di x = 50, z = 111 */}
        <mesh position={[-(gym.x1 - gym.x0) / 2 - 0.05, 2.0, 111 - (gym.z0 + gym.z1) / 2]}>
          <boxGeometry args={[0.2, 4.0, 3.2]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. ASRAMA: x -92..-40, z 48..66 (52 x 18 m, 4 lantai x 3.4m = 13.6m) */}
      {/* Pintu masuk di dinding Timur (x = -40, z = 57)           */}
      {/* ========================================================= */}
      <group position={[(asrama.x0 + asrama.x1) / 2, 0, (asrama.z0 + asrama.z1) / 2]} name="building_asrama">
        <mesh position={[0, (asrama.floors * asrama.floorHeight) / 2, 0]} castShadow receiveShadow material={wallMat}>
          <boxGeometry args={[asrama.x1 - asrama.x0, asrama.floors * asrama.floorHeight, asrama.z1 - asrama.z0]} />
        </mesh>
        {/* Atap Asrama */}
        <mesh position={[0, asrama.floors * asrama.floorHeight + 0.4, 0]} material={roofBlueMat}>
          <boxGeometry args={[asrama.x1 - asrama.x0 + 1.0, 0.8, asrama.z1 - asrama.z0 + 1.0]} />
        </mesh>
        {/* Pintu Timur di x = -40, z = 57 */}
        <mesh position={[(asrama.x1 - asrama.x0) / 2 + 0.05, 1.8, 57 - (asrama.z0 + asrama.z1) / 2]}>
          <boxGeometry args={[0.2, 3.6, 2.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. GEDUNG BUDAYA: x -98..-50, z 92..120 (48 x 28 m, 2 lantai x 4.0m = 8m) */}
      {/* Pintu masuk di dinding Timur (x = -50, z = 106)          */}
      {/* ========================================================= */}
      <group position={[(budaya.x0 + budaya.x1) / 2, 0, (budaya.z0 + budaya.z1) / 2]} name="building_budaya">
        <mesh position={[0, (budaya.floors * budaya.floorHeight) / 2, 0]} castShadow receiveShadow material={wallMat}>
          <boxGeometry args={[budaya.x1 - budaya.x0, budaya.floors * budaya.floorHeight, budaya.z1 - budaya.z0]} />
        </mesh>
        {/* Atap Gedung Budaya */}
        <mesh position={[0, budaya.floors * budaya.floorHeight + 0.4, 0]} material={roofDarkMat}>
          <boxGeometry args={[budaya.x1 - budaya.x0 + 1.0, 0.8, budaya.z1 - budaya.z0 + 1.0]} />
        </mesh>
        {/* Pintu Timur di x = -50, z = 106 */}
        <mesh position={[(budaya.x1 - budaya.x0) / 2 + 0.05, 1.8, 106 - (budaya.z0 + budaya.z1) / 2]}>
          <boxGeometry args={[0.2, 3.6, 2.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 5. DOJO KYUDO: x 76..96, z 140..180 (20 x 40 m, h 6m)    */}
      {/* Pintu masuk di dinding Barat (x = 76, z = 160)           */}
      {/* ========================================================= */}
      <group position={[(kyudo.x0 + kyudo.x1) / 2, 0, (kyudo.z0 + kyudo.z1) / 2]} name="building_kyudo">
        <mesh position={[0, kyudo.floorHeight / 2, 0]} castShadow receiveShadow material={wallMat}>
          <boxGeometry args={[kyudo.x1 - kyudo.x0, kyudo.floorHeight, kyudo.z1 - kyudo.z0]} />
        </mesh>
        {/* Atap Miring Tradisional Dojo */}
        <mesh position={[0, kyudo.floorHeight + 0.4, 0]} material={roofDarkMat}>
          <boxGeometry args={[kyudo.x1 - kyudo.x0 + 1.0, 0.8, kyudo.z1 - kyudo.z0 + 1.0]} />
        </mesh>
        {/* Pintu Barat di x = 76, z = 160 */}
        <mesh position={[-(kyudo.x1 - kyudo.x0) / 2 - 0.05, 1.6, 160 - (kyudo.z0 + kyudo.z1) / 2]}>
          <boxGeometry args={[0.2, 3.2, 2.4]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 6. TAMAN KOI: x -98..-66, z 124..146 (32 x 22 m)          */}
      {/* Entry di (-66, 135)                                       */}
      {/* ========================================================= */}
      <group position={[(koi.x0 + koi.x1) / 2, 0, (koi.z0 + koi.z1) / 2]} name="zone_koi">
        {/* Kolam Air Alami */}
        <mesh position={[0, 0.05, 0]} material={waterMat}>
          <boxGeometry args={[26, 0.1, 16]} />
        </mesh>
        {/* Jembatan Busur Kayu Merah Tradisional (Taiko Bashi) */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.2, 0.2, 8]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>
        {/* Tepian Batu Taman */}
        <mesh position={[0, 0.08, -8.5]}>
          <boxGeometry args={[28, 0.16, 1.2]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
        <mesh position={[0, 0.08, 8.5]}>
          <boxGeometry args={[28, 0.16, 1.2]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 7. LAPANGAN TENIS: x -94..-74, z 150..216 (20 x 66 m, 2 lapangan) */}
      {/* Entry di (-74, 160)                                       */}
      {/* ========================================================= */}
      <group position={[(tennis.x0 + tennis.x1) / 2, 0, (tennis.z0 + tennis.z1) / 2]} name="zone_tennis">
        {/* Lantai Hardcourt Biru-Hijau */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[tennis.x1 - tennis.x0, tennis.z1 - tennis.z0]} />
          <meshStandardMaterial color="#0284C7" roughness={0.7} />
        </mesh>
        {/* Garis Putih Lapangan 1 & 2 */}
        {[-16, 16].map((courtZ) => (
          <group key={`tennis_court_${courtZ}`} position={[0, 0.02, courtZ]}>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(11, 0.01, 23.77)]} />
              <lineBasicMaterial color="#FFFFFF" linewidth={2} />
            </lineSegments>
            {/* Net Tenis */}
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[12, 1.0, 0.06]} />
              <meshStandardMaterial color="#F8FAFC" transparent opacity={0.65} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
