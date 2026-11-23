/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generator Dinding, Pelat Lantai, Fasad Eksterior, dan Atap Gedung Utama
 * Seluruh dimensi & batas disinkronkan 100% dengan src/data/campus.json:
 * - Gedung utama: x: -46..46 (panjang 92m), z: 100..120 (lebar 20m), 3 lantai x 4.0m
 * - Atrium kaca genkan dua lantai di x: -5..5, z: 100..120
 * - Atap Okujo: pelat beton abu-terang + waterproof layer + teras ubin + kebun hijau + panel surya (Bukan oranye, no z-fighting)
 * - Fasad eksterior solid dengan bukaan jendela nyata (real window openings) dan kaca anime
 * - Setiap ruangan Kelas ("Kelas *") dirender menggunakan komponen modular JapaneseClassroom
 * - Seluruh pintu interior lainnya menggunakan pintu geser Jepang (hikido)
 */

import React, { useMemo } from "react";
import { MAIN_BUILDING_ROOMS } from "@/data/campus";
import { getSharedGradientMap, ANIME_MATERIALS } from "./materials";
import { InteractiveDoor } from "./door-controller";
import { JapaneseClassroom } from "../classroom/japanese-classroom";

interface WallOpeningProps {
  floorCutaway?: 1 | 2 | 3 | 4 | "ALL";
  doorsForceOpen?: boolean;
}

export function MainBuildingSlabsAndWalls({
  floorCutaway = "ALL",
  doorsForceOpen = false,
}: WallOpeningProps) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);
  const wallMat = useMemo(() => ANIME_MATERIALS.wallWhite(gradientMap), [gradientMap]);
  const interiorWallMat = useMemo(() => ANIME_MATERIALS.wallInterior(gradientMap), [gradientMap]);
  const corridorFloorMat = useMemo(() => ANIME_MATERIALS.corridorFloor(gradientMap), [gradientMap]);
  const woodFloorMat = useMemo(() => ANIME_MATERIALS.woodFloor(gradientMap), [gradientMap]);
  const glassMat = ANIME_MATERIALS.glassAnime;

  const floorHeight = 4.0; // 4.0m per lantai

  const shouldRenderFloor = (fl: number) => {
    if (floorCutaway === "ALL") return true;
    return floorCutaway === fl;
  };

  const classrooms = MAIN_BUILDING_ROOMS.filter(
    (rm) => rm.name.startsWith("Kelas") && rm.floor <= 3 && shouldRenderFloor(rm.floor)
  );

  const nonClassrooms = MAIN_BUILDING_ROOMS.filter(
    (rm) => !rm.name.startsWith("Kelas") && rm.floor <= 3 && shouldRenderFloor(rm.floor)
  );

  return (
    <group name="main_building_structure">
      {/* ========================================================= */}
      {/* 1. PELAT LANTAI (SLABS) DENGAN KETINGGIAN TERPISAH (NO Z-FIGHTING) */}
      {/* ========================================================= */}
      {/* Lantai 1F (y = 0.0m) */}
      {shouldRenderFloor(1) && (
        <group name="floor_slab_1f">
          <mesh position={[0, -0.2, 110]} receiveShadow material={corridorFloorMat}>
            <boxGeometry args={[92, 0.4, 20]} />
          </mesh>
        </group>
      )}

      {/* Lantai 2F (y = 4.0m, dengan Void Atrium di x: -5..5 dan tangga di ujung) */}
      {shouldRenderFloor(2) && (
        <group name="floor_slab_2f">
          {/* Sayap Barat (x: -41..-5) */}
          <mesh position={[-23, 3.8, 110]} receiveShadow material={corridorFloorMat}>
            <boxGeometry args={[36, 0.4, 20]} />
          </mesh>
          {/* Jembatan Koridor Atrium (x: -5..5, z: 108.5..111.5) */}
          <mesh position={[0, 3.8, 110]} receiveShadow material={corridorFloorMat}>
            <boxGeometry args={[10, 0.4, 3.0]} />
          </mesh>
          {/* Sayap Timur (x: 5..41) */}
          <mesh position={[23, 3.8, 110]} receiveShadow material={corridorFloorMat}>
            <boxGeometry args={[36, 0.4, 20]} />
          </mesh>
        </group>
      )}

      {/* Lantai 3F (y = 8.0m) */}
      {shouldRenderFloor(3) && (
        <group name="floor_slab_3f">
          <mesh position={[-23, 7.8, 110]} receiveShadow material={corridorFloorMat}>
            <boxGeometry args={[36, 0.4, 20]} />
          </mesh>
          <mesh position={[0, 7.8, 110]} receiveShadow material={corridorFloorMat}>
            <boxGeometry args={[10, 0.4, 3.0]} />
          </mesh>
          <mesh position={[23, 7.8, 110]} receiveShadow material={corridorFloorMat}>
            <boxGeometry args={[36, 0.4, 20]} />
          </mesh>
        </group>
      )}

      {/* Teras Atap Okujo (y = 12.0m) - Light Concrete, Terrace Tiles, Garden, Solar */}
      {(floorCutaway === "ALL" || floorCutaway === 4) && (
        <group name="floor_slab_okujo">
          {/* 1. Pelat Beton Struktural Atap (Top Face di y = 12.0m) */}
          <mesh position={[0, 11.8, 110]} receiveShadow>
            <boxGeometry args={[92, 0.4, 20]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
          </mesh>

          {/* 2. Lapisan Waterproofing Abu-Gelap di y = 12.02m */}
          <mesh position={[0, 12.02, 110]} receiveShadow>
            <boxGeometry args={[91.6, 0.02, 19.6]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>

          {/* 3. Teras Ubin Dek Pejalan Kaki (x: -16..16, z: 102..118) di y = 12.04m */}
          <mesh position={[0, 12.04, 110]} receiveShadow>
            <boxGeometry args={[32, 0.02, 16]} />
            <meshStandardMaterial color="#F1F5F9" roughness={0.4} />
          </mesh>

          {/* 4. Kebun Hijau Atap (Rooftop Garden) di Sayap Timur (x: 18..40) di y = 12.06m */}
          <group position={[29, 12.06, 110]}>
            <mesh receiveShadow>
              <boxGeometry args={[22, 0.04, 16]} />
              <meshStandardMaterial color="#22C55E" roughness={0.6} />
            </mesh>
            {/* Tanaman & Semak Bunga Hijau di Kebun Atap */}
            {[-8, -4, 0, 4, 8].map((gx) => (
              <mesh key={`garden_bush_${gx}`} position={[gx, 0.35, (gx % 2 === 0 ? 3 : -3)]}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial color="#16A34A" roughness={0.5} />
              </mesh>
            ))}
          </group>

          {/* 5. Larik Panel Surya di Sayap Barat (x: -40..-18) di y = 12.4m */}
          <group position={[-29, 12.0, 110]} name="roof_solar">
            {[-8, -4, 0, 4, 8].map((sx) => (
              <group key={`solar_${sx}`} position={[sx, 0, 0]}>
                {/* Rangka Penyangga Baja */}
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.1, 0.7, 12]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                {/* Modul Panel Fotovoltaik */}
                <mesh position={[0, 0.65, 0]} rotation={[0.3, 0, 0]}>
                  <boxGeometry args={[3.2, 0.06, 12]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.9} />
                </mesh>
              </group>
            ))}
          </group>

          {/* 6. Pagar Pengaman Kawat 2.2m Keliling Atap (x: -45.8..45.8, z: 100.2..119.8) */}
          <group position={[0, 13.1, 110]}>
            {/* Selatan */}
            <mesh position={[0, 0, -9.8]}>
              <boxGeometry args={[91.6, 2.2, 0.04]} />
              <meshStandardMaterial color="#64748B" wireframe />
            </mesh>
            {/* Utara */}
            <mesh position={[0, 0, 9.8]}>
              <boxGeometry args={[91.6, 2.2, 0.04]} />
              <meshStandardMaterial color="#64748B" wireframe />
            </mesh>
            {/* Barat */}
            <mesh position={[-45.8, 0, 0]}>
              <boxGeometry args={[0.04, 2.2, 19.6]} />
              <meshStandardMaterial color="#64748B" wireframe />
            </mesh>
            {/* Timur */}
            <mesh position={[45.8, 0, 0]}>
              <boxGeometry args={[0.04, 2.2, 19.6]} />
              <meshStandardMaterial color="#64748B" wireframe />
            </mesh>
          </group>

          {/* 7. Menara Jam Sekolah (x: 0, z: 110, size 6x6, tinggi 9m s/d y = 21.0m) */}
          <group position={[0, 12.0, 110]} name="roof_clock_tower">
            <mesh position={[0, 4.5, 0]} material={wallMat} castShadow>
              <boxGeometry args={[6, 9, 6]} />
            </mesh>
            {/* Dial Jam 4 Sisi */}
            {[0, 1, 2, 3].map((r) => (
              <group key={`clock_face_${r}`} rotation={[0, (r * Math.PI) / 2, 0]}>
                <mesh position={[0, 6.0, 3.02]}>
                  <circleGeometry args={[1.6, 32]} />
                  <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
                </mesh>
                <mesh position={[0, 6.0, 3.04]}>
                  <cylinderGeometry args={[0.06, 0.06, 0.9, 8]} />
                  <meshBasicMaterial color="#0F172A" />
                </mesh>
              </group>
            ))}
            {/* Puncak Menara Piramida Gelap */}
            <mesh position={[0, 10.5, 0]}>
              <coneGeometry args={[4.5, 3.0, 4]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
          </group>

          {/* 8. Kubah Observatorium Astronomi di x: -32, z: 110 (diameter 6m) */}
          <group position={[-32, 12.0, 110]} name="roof_observatory">
            <mesh position={[0, 1.5, 0]} material={wallMat} castShadow>
              <cylinderGeometry args={[3, 3, 3, 32]} />
            </mesh>
            <mesh position={[0, 3.0, 0]} castShadow>
              <sphereGeometry args={[3.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )}

      {/* ========================================================= */}
      {/* 2. FASAD EKSTERIOR SOLID DENGAN BUKAAN JENDELA NYATA      */}
      {/* ========================================================= */}
      {[1, 2, 3].filter((fl) => shouldRenderFloor(fl)).map((fl) => {
        const floorY = (fl - 1) * floorHeight;
        return (
          <group key={`exterior_facades_f${fl}`}>
            {/* FASAD SELATAN (z = 100): Kiri x: -46..-5, Kanan x: 5..46 */}
            {/* Sayap Barat Selatan */}
            <mesh position={[-25.5, floorY + 0.5, 100.1]} material={wallMat}>
              <boxGeometry args={[41, 1.0, 0.3]} />
            </mesh>
            <mesh position={[-25.5, floorY + 1.9, 100.1]} material={glassMat}>
              <boxGeometry args={[40.6, 1.8, 0.05]} />
            </mesh>
            <mesh position={[-25.5, floorY + 3.4, 100.1]} material={wallMat}>
              <boxGeometry args={[41, 1.2, 0.3]} />
            </mesh>

            {/* Sayap Timur Selatan */}
            <mesh position={[25.5, floorY + 0.5, 100.1]} material={wallMat}>
              <boxGeometry args={[41, 1.0, 0.3]} />
            </mesh>
            <mesh position={[25.5, floorY + 1.9, 100.1]} material={glassMat}>
              <boxGeometry args={[40.6, 1.8, 0.05]} />
            </mesh>
            <mesh position={[25.5, floorY + 3.4, 100.1]} material={wallMat}>
              <boxGeometry args={[41, 1.2, 0.3]} />
            </mesh>

            {/* FASAD UTARA (z = 120): Menghadap Lapangan Olahraga */}
            {/* Sayap Barat Utara: Non-classroom pada 1F (Perpus, Lab, Seni). Pada 2F & 3F diisi oleh Kelas (dirender oleh JapaneseClassroom) */}
            {fl === 1 && (
              <group position={[-23, 0, 119.9]}>
                <mesh position={[0, floorY + 0.5, 0]} material={wallMat}>
                  <boxGeometry args={[36, 1.0, 0.3]} />
                </mesh>
                <mesh position={[0, floorY + 1.9, 0]} material={glassMat}>
                  <boxGeometry args={[35.6, 1.8, 0.05]} />
                </mesh>
                <mesh position={[0, floorY + 3.4, 0]} material={wallMat}>
                  <boxGeometry args={[36, 1.2, 0.3]} />
                </mesh>
              </group>
            )}

            {/* Sayap Timur Utara: Non-classroom pada 2F & 3F (Kafetaria, Lab robotik, dll). Pada 1F diisi oleh Kelas 1-A..1-D (dirender oleh JapaneseClassroom) */}
            {fl !== 1 && (
              <group position={[23, 0, 119.9]}>
                <mesh position={[0, floorY + 0.5, 0]} material={wallMat}>
                  <boxGeometry args={[36, 1.0, 0.3]} />
                </mesh>
                <mesh position={[0, floorY + 1.9, 0]} material={glassMat}>
                  <boxGeometry args={[35.6, 1.8, 0.05]} />
                </mesh>
                <mesh position={[0, floorY + 3.4, 0]} material={wallMat}>
                  <boxGeometry args={[36, 1.2, 0.3]} />
                </mesh>
              </group>
            )}

            {/* End Stair Blocks di Ujung Barat (-46..-41) & Ujung Timur (41..46) Sisi Utara */}
            <mesh position={[-43.5, floorY + 2.0, 119.9]} material={wallMat}>
              <boxGeometry args={[5.0, floorHeight, 0.3]} />
            </mesh>
            <mesh position={[43.5, floorY + 2.0, 119.9]} material={wallMat}>
              <boxGeometry args={[5.0, floorHeight, 0.3]} />
            </mesh>

            {/* FASAD UJUNG BARAT (x = -46, z: 100..120) */}
            <mesh position={[-45.9, floorY + 2.0, 110]} material={wallMat}>
              <boxGeometry args={[0.3, floorHeight, 20]} />
            </mesh>
            {/* FASAD UJUNG TIMUR (x = 46, z: 100..120) */}
            <mesh position={[45.9, floorY + 2.0, 110]} material={wallMat}>
              <boxGeometry args={[0.3, floorHeight, 20]} />
            </mesh>
          </group>
        );
      })}

      {/* ========================================================= */}
      {/* 3. ATRIUM GENKAN DUA LANTAI (-5..5, 100..120, h = 8.0m)   */}
      {/* ========================================================= */}
      {shouldRenderFloor(1) && (
        <group name="main_atrium_genkan">
          {/* Pintu Masuk Kaca Fasad Selatan (0, 100) */}
          <group position={[0, 0, 100.1]}>
            <mesh position={[0, 5.0, 0]} material={wallMat}>
              <boxGeometry args={[10.0, 2.0, 0.3]} />
            </mesh>
            {/* Kaca Penuh Atrium */}
            <mesh position={[0, 3.6, 0]} material={glassMat}>
              <boxGeometry args={[9.8, 7.2, 0.05]} />
            </mesh>
            {/* Pintu Otomatis Geser Kaca Genkan */}
            <InteractiveDoor position={[0, 0, 100.1]} width={3.2} height={2.8} isSliding={true} />
          </group>

          {/* Undakan Agari-Kamachi Tradisional di z = 104 */}
          <mesh position={[0, 0.1, 104]} material={woodFloorMat}>
            <boxGeometry args={[9.8, 0.2, 0.4]} />
          </mesh>

          {/* Pintu Keluar Belakang Fasad Utara main_N di (0, 120) */}
          <group position={[0, 0, 119.9]}>
            <mesh position={[0, 3.0, 0]} material={wallMat}>
              <boxGeometry args={[10.0, 2.0, 0.3]} />
            </mesh>
            <InteractiveDoor position={[0, 0, 119.9]} width={2.4} height={2.4} isSliding={true} />
          </group>
        </group>
      )}

      {/* ========================================================= */}
      {/* 4. INSTANSI SELURUH RUANG KELAS MENGGUNAKAN JAPANESECLASSROOM */}
      {/* ========================================================= */}
      {classrooms.map((room) => {
        const floorY = (room.floor - 1) * floorHeight;
        return (
          <JapaneseClassroom
            key={room.id}
            id={room.id}
            name={room.name}
            x0={room.bounds.minX}
            x1={room.bounds.maxX}
            z0={room.bounds.minZ}
            z1={room.bounds.maxZ}
            floorY={floorY}
            doorsForceOpen={doorsForceOpen}
          />
        );
      })}

      {/* ========================================================= */}
      {/* 5. RUANGAN NON-KELAS (Perpustakaan, Lab, Kantor, UKS, Toilet, dll.) */}
      {/* ========================================================= */}
      {nonClassrooms.map((room) => {
        const floorY = (room.floor - 1) * floorHeight;
        const b = room.bounds;
        const width = b.maxX - b.minX;
        const depth = b.maxZ - b.minZ;
        const isSouthRow = room.row === "S";
        const corridorZ = isSouthRow ? 108.5 : 111.5;
        const doorX = (b.minX + b.maxX) / 2;

        return (
          <group key={room.id} name={`non_classroom_${room.id}`}>
            {/* Lantai Ruangan */}
            <mesh
              position={[(b.minX + b.maxX) / 2, floorY + 0.02, (b.minZ + b.maxZ) / 2]}
              rotation={[-Math.PI / 2, 0, 0]}
              material={room.type === "lab" ? corridorFloorMat : woodFloorMat}
            >
              <planeGeometry args={[width, depth]} />
            </mesh>

            {/* Dinding Koridor: Kiri & Kanan Bukaan Pintu */}
            <mesh position={[(b.minX + doorX - 0.9) / 2, floorY + 1.8, corridorZ]} material={interiorWallMat}>
              <boxGeometry args={[Math.max(0.2, doorX - 0.9 - b.minX), floorHeight - 0.4, 0.25]} />
            </mesh>
            <mesh position={[(doorX + 0.9 + b.maxX) / 2, floorY + 1.8, corridorZ]} material={interiorWallMat}>
              <boxGeometry args={[Math.max(0.2, b.maxX - (doorX + 0.9)), floorHeight - 0.4, 0.25]} />
            </mesh>
            {/* Header Lintel Pintu */}
            <mesh position={[doorX, floorY + 2.8, corridorZ]} material={interiorWallMat}>
              <boxGeometry args={[1.8, 1.6, 0.25]} />
            </mesh>

            {/* Pintu Geser Jepang Hikido (1.8m) */}
            <InteractiveDoor
              position={[doorX, floorY, corridorZ]}
              width={1.6}
              height={2.0}
              isSliding={true}
            />

            {/* Door Sign Akrilik */}
            <group position={[doorX, floorY + 2.2, isSouthRow ? corridorZ - 0.15 : corridorZ + 0.15]}>
              <mesh>
                <boxGeometry args={[1.1, 0.28, 0.04]} />
                <meshStandardMaterial color="#0F172A" roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, isSouthRow ? -0.025 : 0.025]}>
                <boxGeometry args={[1.0, 0.22, 0.02]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            </group>

            {/* Dinding Penyekat Antar Ruangan */}
            <mesh position={[b.minX, floorY + 1.8, (b.minZ + b.maxZ) / 2]} material={interiorWallMat}>
              <boxGeometry args={[0.25, floorHeight - 0.4, depth]} />
            </mesh>
            <mesh position={[b.maxX, floorY + 1.8, (b.minZ + b.maxZ) / 2]} material={interiorWallMat}>
              <boxGeometry args={[0.25, floorHeight - 0.4, depth]} />
            </mesh>

            {/* Lampu Plafon LED Strip Hangat */}
            <mesh position={[(b.minX + b.maxX) / 2, floorY + 3.4, (b.minZ + b.maxZ) / 2]}>
              <boxGeometry args={[width * 0.7, 0.05, 1.2]} />
              <meshStandardMaterial emissive="#FEF08A" emissiveIntensity={1.2} color="#FEF3C7" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
