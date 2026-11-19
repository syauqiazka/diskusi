"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useSakuraStore } from "@/stores/use-sakura-store";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";
import { SAKURA_MAIN_BUILDING_ROOMS } from "@/lib/world/sakura-campus-layout";
import { SakuraClassroomInterior } from "./classroom-interior-view";

export function SakuraMainBuilding({
  position = [-32, 0, -10],
}: {
  position?: [number, number, number];
}) {
  const selectedFloor = useSakuraStore((s) => s.selectedFloor);
  const setHoveredRoom = useSakuraStore((s) => s.setHoveredRoom);
  const setActiveRoomDetail = useSakuraStore((s) => s.setActiveRoomDetail);

  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  // Filter visibilitas berdasarkan seleksi lantai cutaway
  const showFloor1 = true;
  const showFloor2 = selectedFloor === "ALL" || selectedFloor === "2F" || selectedFloor === "3F" || selectedFloor === "ROOF";
  const showFloor3 = selectedFloor === "ALL" || selectedFloor === "3F" || selectedFloor === "ROOF";
  const showRoof = selectedFloor === "ALL" || selectedFloor === "ROOF";

  // Material Toon Fasad & Struktur
  const mats = useMemo(() => {
    return {
      wall: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.wallIvory),
        gradientMap,
      }),
      pillar: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.pillarWhite),
        gradientMap,
      }),
      slabTrim: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.slabTrim),
        gradientMap,
      }),
      windowGlass: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.windowGlassDay),
        gradientMap,
        transparent: true,
        opacity: 0.85,
      }),
      atriumGlass: new THREE.MeshToonMaterial({
        color: new THREE.Color("#BAE6FD"),
        gradientMap,
        transparent: true,
        opacity: 0.75,
      }),
      roofFloor: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.roofConcrete),
        gradientMap,
      }),
      roofFence: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.roofFencePost),
        gradientMap,
      }),
      observatoryDome: new THREE.MeshStandardMaterial({
        color: "#E2E8F0",
        metalness: 0.85,
        roughness: 0.2,
      }),
      solarPanel: new THREE.MeshStandardMaterial({
        color: "#1E3A8A",
        metalness: 0.9,
        roughness: 0.15,
      }),
      clockTowerWall: new THREE.MeshToonMaterial({
        color: new THREE.Color("#3730A3"),
        gradientMap,
      }),
      corridorFloor: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.floorParquet),
        gradientMap,
      }),
    };
  }, [gradientMap]);

  const buildingWidth = 22;
  const buildingLength = 64;

  return (
    <group position={position} name="sakura_main_building">
      {/* 1. Pondasi & Pelat Dasar Gedung */}
      <mesh position={[0, -0.4, 0]} receiveShadow material={mats.slabTrim}>
        <boxGeometry args={[buildingWidth + 1.2, 0.8, buildingLength + 1.2]} />
      </mesh>

      {/* ============================================================== */}
      {/* LANTAI 1 (1F, y = 0 s.d. 3.6m) */}
      {/* ============================================================== */}
      {showFloor1 && (
        <group position={[0, 0, 0]} name="floor_1F">
          {/* Pelat Lantai 1 */}
          <mesh position={[0, 0.1, 0]} receiveShadow material={mats.corridorFloor}>
            <boxGeometry args={[buildingWidth, 0.2, buildingLength]} />
          </mesh>

          {/* Dinding Luar Barat & Timur Lantai 1 */}
          <mesh position={[-buildingWidth / 2 + 0.15, 1.8, 0]} castShadow material={mats.wall}>
            <boxGeometry args={[0.3, 3.4, buildingLength]} />
          </mesh>
          <mesh position={[buildingWidth / 2 - 0.15, 1.8, 0]} castShadow material={mats.wall}>
            <boxGeometry args={[0.3, 3.4, buildingLength]} />
          </mesh>

          {/* Dinding Utara Lantai 1 */}
          <mesh position={[0, 1.8, -buildingLength / 2 + 0.15]} material={mats.wall}>
            <boxGeometry args={[buildingWidth, 3.4, 0.3]} />
          </mesh>

          {/* Koridor Tengah Memanjang (Lebar 2.4m di X = 0) */}
          {/* Dinding Pembatas Koridor Kiri */}
          <mesh position={[-1.35, 1.8, 0]} material={mats.wall}>
            <boxGeometry args={[0.2, 3.4, buildingLength - 12]} />
          </mesh>
          {/* Dinding Pembatas Koridor Kanan */}
          <mesh position={[1.35, 1.8, 0]} material={mats.wall}>
            <boxGeometry args={[0.2, 3.4, buildingLength - 12]} />
          </mesh>

          {/* Genkan Atrium Masuk Selatan (Double-Height Kaca 7.2m Menghadap Plaza) */}
          <group position={[5.0, 3.6, buildingLength / 2]}>
            {/* Kaca Atrium 2 Lantai */}
            <mesh material={mats.atriumGlass}>
              <boxGeometry args={[9.0, 7.2, 0.15]} />
            </mesh>
            {/* Tiang Rangka Atrium Vertikal */}
            {[-4.0, 0, 4.0].map((ax, idx) => (
              <mesh key={`atrium_col_${idx}`} position={[ax, 0, 0.1]}>
                <boxGeometry args={[0.25, 7.2, 0.25]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
            ))}
            {/* Pintu Kaca Geser Masuk Utama */}
            <mesh position={[0, -2.4, 0.2]}>
              <boxGeometry args={[3.2, 2.4, 0.08]} />
              <meshStandardMaterial color="#0284C7" transparent opacity={0.6} />
            </mesh>
          </group>

          {/* Ruang Kelas 1-A Enterable Sesuai Gambar 9 */}
          <SakuraClassroomInterior position={[-5.5, 0, -24]} />

          {/* Ruangan-ruangan Lantai 1 Interaktif (Hitbox & Label Hover) */}
          {SAKURA_MAIN_BUILDING_ROOMS.filter((r) => r.floor === 1).map((room) => (
            <mesh
              key={room.id}
              position={room.position}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredRoom(room);
              }}
              onPointerOut={() => setHoveredRoom(null)}
              onClick={(e) => {
                e.stopPropagation();
                setActiveRoomDetail(room);
              }}
              visible={false}
            >
              <boxGeometry args={room.dimensions} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          ))}
        </group>
      )}

      {/* ============================================================== */}
      {/* LANTAI 2 (2F, y = 3.6 s.d. 7.2m) */}
      {/* ============================================================== */}
      {showFloor2 && (
        <group position={[0, 3.6, 0]} name="floor_2F">
          {/* Pelat Lantai 2 dengan Bukaan Void Atrium */}
          <mesh position={[-3.5, 0.1, 0]} receiveShadow material={mats.corridorFloor}>
            <boxGeometry args={[15, 0.2, buildingLength]} />
          </mesh>
          <mesh position={[7.5, 0.1, -8]} receiveShadow material={mats.corridorFloor}>
            <boxGeometry args={[7, 0.2, buildingLength - 16]} />
          </mesh>

          {/* Dinding Luar & Jendela Ribbon Lantai 2 */}
          <mesh position={[-buildingWidth / 2 + 0.15, 1.8, 0]} castShadow material={mats.wall}>
            <boxGeometry args={[0.3, 3.4, buildingLength]} />
          </mesh>
          <mesh position={[buildingWidth / 2 - 0.15, 1.8, 0]} castShadow material={mats.wall}>
            <boxGeometry args={[0.3, 3.4, buildingLength]} />
          </mesh>
          <mesh position={[0, 1.8, -buildingLength / 2 + 0.15]} material={mats.wall}>
            <boxGeometry args={[buildingWidth, 3.4, 0.3]} />
          </mesh>

          {/* Railing Void Atrium Kaca */}
          <mesh position={[4.0, 0.6, 22.0]} material={mats.atriumGlass}>
            <boxGeometry args={[0.08, 1.1, 8.5]} />
          </mesh>
          <mesh position={[8.5, 0.6, 17.5]} material={mats.atriumGlass}>
            <boxGeometry args={[8.5, 1.1, 0.08]} />
          </mesh>

          {/* Hitbox & Ruangan Lantai 2 */}
          {SAKURA_MAIN_BUILDING_ROOMS.filter((r) => r.floor === 2).map((room) => (
            <mesh
              key={room.id}
              position={[room.position[0], room.position[1] - 3.6, room.position[2]]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredRoom(room);
              }}
              onPointerOut={() => setHoveredRoom(null)}
              onClick={(e) => {
                e.stopPropagation();
                setActiveRoomDetail(room);
              }}
              visible={false}
            >
              <boxGeometry args={room.dimensions} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          ))}
        </group>
      )}

      {/* ============================================================== */}
      {/* LANTAI 3 (3F, y = 7.2 s.d. 10.8m) */}
      {/* ============================================================== */}
      {showFloor3 && (
        <group position={[0, 7.2, 0]} name="floor_3F">
          {/* Pelat Lantai 3 */}
          <mesh position={[0, 0.1, 0]} receiveShadow material={mats.corridorFloor}>
            <boxGeometry args={[buildingWidth, 0.2, buildingLength]} />
          </mesh>

          {/* Dinding Luar Lantai 3 */}
          <mesh position={[-buildingWidth / 2 + 0.15, 1.8, 0]} castShadow material={mats.wall}>
            <boxGeometry args={[0.3, 3.4, buildingLength]} />
          </mesh>
          <mesh position={[buildingWidth / 2 - 0.15, 1.8, 0]} castShadow material={mats.wall}>
            <boxGeometry args={[0.3, 3.4, buildingLength]} />
          </mesh>
          <mesh position={[0, 1.8, -buildingLength / 2 + 0.15]} material={mats.wall}>
            <boxGeometry args={[buildingWidth, 3.4, 0.3]} />
          </mesh>
          <mesh position={[0, 1.8, buildingLength / 2 - 0.15]} material={mats.wall}>
            <boxGeometry args={[buildingWidth, 3.4, 0.3]} />
          </mesh>

          {/* Ruangan Lantai 3 */}
          {SAKURA_MAIN_BUILDING_ROOMS.filter((r) => r.floor === 3).map((room) => (
            <mesh
              key={room.id}
              position={[room.position[0], room.position[1] - 7.2, room.position[2]]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredRoom(room);
              }}
              onPointerOut={() => setHoveredRoom(null)}
              onClick={(e) => {
                e.stopPropagation();
                setActiveRoomDetail(room);
              }}
              visible={false}
            >
              <boxGeometry args={room.dimensions} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          ))}
        </group>
      )}

      {/* ============================================================== */}
      {/* ATAP (OKUJO / ROOFTOP, y = 10.8m) */}
      {/* Sesuai Denah Gambar 6 & Fasad Gambar 10 */}
      {/* ============================================================== */}
      {showRoof && (
        <group position={[0, 10.8, 0]} name="floor_OKUJO">
          {/* Pelat Semen Atap Datar */}
          <mesh position={[0, 0.1, 0]} receiveShadow material={mats.roofFloor}>
            <boxGeometry args={[buildingWidth + 0.4, 0.3, buildingLength + 0.4]} />
          </mesh>

          {/* Parapet Rendah Beton & Pagar Kawat Ram Pengaman Rooftop (2.2m) */}
          <mesh position={[0, 1.3, -buildingLength / 2 + 0.2]}>
            <boxGeometry args={[buildingWidth, 2.2, 0.08]} />
            <meshToonMaterial color="#2D6A4F" transparent opacity={0.65} wireframe />
          </mesh>
          <mesh position={[0, 1.3, buildingLength / 2 - 0.2]}>
            <boxGeometry args={[buildingWidth, 2.2, 0.08]} />
            <meshToonMaterial color="#2D6A4F" transparent opacity={0.65} wireframe />
          </mesh>
          <mesh position={[-buildingWidth / 2 + 0.2, 1.3, 0]}>
            <boxGeometry args={[0.08, 2.2, buildingLength]} />
            <meshToonMaterial color="#2D6A4F" transparent opacity={0.65} wireframe />
          </mesh>
          <mesh position={[buildingWidth / 2 - 0.2, 1.3, 0]}>
            <boxGeometry args={[0.08, 2.2, buildingLength]} />
            <meshToonMaterial color="#2D6A4F" transparent opacity={0.65} wireframe />
          </mesh>

          {/* 1. Menara Jam Sekolah (Clock Tower) di Sudut Tenggara */}
          {/* Sesuai Gambar 10: Atap Limas Biru & Muka Jam Analog */}
          <group position={[5.0, 3.2, 18.0]}>
            {/* Badan Menara Jam */}
            <mesh castShadow material={mats.clockTowerWall}>
              <boxGeometry args={[5.2, 6.4, 5.2]} />
            </mesh>
            {/* Atap Limas Segitiga Menara Jam */}
            <mesh position={[0, 4.4, 0]} rotation={[0, Math.PI / 4, 0]} material={mats.clockTowerWall}>
              <coneGeometry args={[3.8, 2.6, 4]} />
            </mesh>
            {/* Piringan Jam Analog Muka Depan */}
            <mesh position={[0, 0.5, 2.62]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.08, 32]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 0.5, 2.67]}>
              <boxGeometry args={[0.1, 0.7, 0.02]} />
              <meshBasicMaterial color="#0F172A" />
            </mesh>
            <mesh position={[0, 0.5, 2.67]} rotation={[0, 0, -Math.PI / 3]}>
              <boxGeometry args={[0.06, 1.1, 0.02]} />
              <meshBasicMaterial color="#0F172A" />
            </mesh>
          </group>

          {/* 2. Observatorium Kubah Teleskop di Sudut Barat Laut */}
          <group position={[-5.0, 1.8, -22.0]}>
            {/* Silinder Dinding Observatorium */}
            <mesh castShadow material={mats.wall}>
              <cylinderGeometry args={[3.2, 3.2, 3.4, 24]} />
            </mesh>
            {/* Kubah Setengah Bola Perak Teleskop */}
            <mesh position={[0, 2.2, 0]} material={mats.observatoryDome}>
              <sphereGeometry args={[3.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            {/* Celah Bukaan Lensa Teleskop */}
            <mesh position={[0, 2.4, 1.6]}>
              <boxGeometry args={[0.7, 2.4, 3.3]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          </group>

          {/* 3. Teras Atap (Okujo Dining) dengan Meja & Bangku Siswa di Tengah */}
          <group position={[0, 0.35, -2.0]}>
            {[-8, -4, 0, 4, 8].map((tz, idx) => (
              <group key={`okujo_table_${idx}`} position={[0, 0, tz]}>
                {/* Meja Kayu Makan Siang */}
                <mesh position={[0, 0.38, 0]} castShadow material={mats.corridorFloor}>
                  <boxGeometry args={[2.4, 0.06, 0.9]} />
                </mesh>
                {/* Bangku Kiri & Kanan */}
                <mesh position={[-1.0, 0.2, 0]} material={mats.corridorFloor}>
                  <boxGeometry args={[0.4, 0.05, 0.9]} />
                </mesh>
                <mesh position={[1.0, 0.2, 0]} material={mats.corridorFloor}>
                  <boxGeometry args={[0.4, 0.05, 0.9]} />
                </mesh>
              </group>
            ))}
          </group>

          {/* 4. Kebun Hijau Hidroponik di Barat Daya */}
          <group position={[-5.0, 0.3, 14.0]}>
            {[-2.5, 0, 2.5].map((gx, gIdx) => (
              <mesh key={`garden_bed_${gIdx}`} position={[gx, 0, 0]} receiveShadow>
                <boxGeometry args={[1.8, 0.4, 7.0]} />
                <meshStandardMaterial color="#15803D" roughness={0.8} />
              </mesh>
            ))}
          </group>

          {/* 5. Larik Panel Surya Ramah Lingkungan di Timur Laut */}
          <group position={[5.0, 0.4, -18.0]}>
            {[-6, -2, 2, 6].map((pz, pIdx) => (
              <mesh
                key={`solar_row_${pIdx}`}
                position={[0, 0.5, pz]}
                rotation={[Math.PI / 6, 0, 0]}
                material={mats.solarPanel}
              >
                <boxGeometry args={[6.4, 0.08, 1.6]} />
              </mesh>
            ))}
          </group>

          {/* 6. Pintu Keluar Tangga Akses Atap di Selatan */}
          <group position={[5.0, 1.4, 25.0]}>
            <mesh castShadow material={mats.wall}>
              <boxGeometry args={[4.2, 2.8, 4.5]} />
            </mesh>
            <mesh position={[0, -0.2, -2.26]}>
              <boxGeometry args={[1.2, 2.2, 0.06]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        </group>
      )}

      {/* ============================================================== */}
      {/* FASAD JENDELA RIBBON & TIANG VERTIKAL LUAR (3 Lantai) */}
      {/* ============================================================== */}
      <group name="facade_exterior">
        {/* Jendela Berderet Barat & Timur (Lantai 1, 2, 3) */}
        {[1.8, 5.4, 9.0].map((flY, flIdx) => {
          // Hanya tampilkan fasad lantai jika lantainya aktif
          if (flIdx === 1 && !showFloor2) return null;
          if (flIdx === 2 && !showFloor3) return null;

          return (
            <group key={`facade_strip_${flIdx}`}>
              {/* Garis Jendela Ribbon Barat */}
              <mesh position={[-buildingWidth / 2 - 0.02, flY + 0.3, 0]}>
                <boxGeometry args={[0.08, 1.7, buildingLength - 4]} />
                <primitive object={mats.windowGlass} attach="material" />
              </mesh>

              {/* Garis Jendela Ribbon Timur */}
              <mesh position={[buildingWidth / 2 + 0.02, flY + 0.3, -4]}>
                <boxGeometry args={[0.08, 1.7, buildingLength - 16]} />
                <primitive object={mats.windowGlass} attach="material" />
              </mesh>

              {/* Kolom Vertikal Putih Bersih di sepanjang fasad barat */}
              {Array.from({ length: 9 }).map((_, colIdx) => {
                const cz = -buildingLength / 2 + 4 + colIdx * 7.0;
                return (
                  <mesh
                    key={`col_w_${flIdx}_${colIdx}`}
                    position={[-buildingWidth / 2 - 0.08, flY, cz]}
                    castShadow
                    material={mats.pillar}
                  >
                    <boxGeometry args={[0.45, 3.6, 0.45]} />
                  </mesh>
                );
              })}

              {/* Garis Pelat Lantai Putih Horizontal di antara lantai */}
              <mesh position={[0, flY + 1.8, 0]} material={mats.slabTrim}>
                <boxGeometry args={[buildingWidth + 0.6, 0.22, buildingLength + 0.6]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
