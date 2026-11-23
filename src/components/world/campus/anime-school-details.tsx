"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";
import { SCHOOL_LT1_Y, SCHOOL_LT2_Y, SCHOOL_LT3_Y } from "@/lib/world/school-interior-layout";

// 1. Area Rak Sepeda / Loker Sepatu Siswa (Getabako) di Pintu Masuk LT 1
export function ShoeLockerArea() {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  const materials = useMemo(() => {
    return {
      wood: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.shoeLockerWood),
        gradientMap,
      }),
      woodDark: new THREE.MeshToonMaterial({
        color: new THREE.Color("#8D5B4C"),
        gradientMap,
      }),
      shoeBlue: new THREE.MeshToonMaterial({
        color: new THREE.Color("#3B82F6"),
        gradientMap,
      }),
      shoeWhite: new THREE.MeshToonMaterial({
        color: new THREE.Color("#F8FAFC"),
        gradientMap,
      }),
    };
  }, [gradientMap]);

  return (
    <group position={[23.2, SCHOOL_LT1_Y, -26.5]} name="shoe_locker_area">
      {/* 2 Baris Rak Loker Sepatu Kayu Khas Anime */}
      {[-1.5, 1.5].map((zOffset, rIdx) => (
        <group key={`shoe_row_${rIdx}`} position={[0, 0, zOffset]}>
          {/* Badan Rak Kotak Utama */}
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow material={materials.wood}>
            <boxGeometry args={[4.2, 1.9, 0.7]} />
          </mesh>

          {/* Sekat-sekat Kompartemen Sepatu (6 kolom x 4 baris = 24 loker per rak) */}
          {Array.from({ length: 6 }).map((_, col) => {
            const x = -1.75 + col * 0.7;
            return (
              <React.Fragment key={`locker_col_${col}`}>
                {/* Pembagi Vertikal */}
                <mesh position={[x, 1.0, 0]} material={materials.woodDark}>
                  <boxGeometry args={[0.04, 1.85, 0.68]} />
                </mesh>
                {/* Beberapa Pasang Sandal Sekolah (Uwabaki) di dalam slot */}
                {col % 2 === 0 && (
                  <mesh position={[x + 0.35, 0.45, 0.1]} material={materials.shoeWhite}>
                    <boxGeometry args={[0.22, 0.08, 0.28]} />
                  </mesh>
                )}
                {col % 3 === 0 && (
                  <mesh position={[x + 0.35, 1.35, 0.1]} material={materials.shoeBlue}>
                    <boxGeometry args={[0.22, 0.08, 0.28]} />
                  </mesh>
                )}
              </React.Fragment>
            );
          })}

          {/* Pembagi Horizontal (4 Rak Susun) */}
          {[0.5, 0.95, 1.4].map((y, hIdx) => (
            <mesh key={`shelf_${hIdx}`} position={[0, y, 0]} material={materials.woodDark}>
              <boxGeometry args={[4.15, 0.04, 0.68]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Area Keset / Undakan Masuk Bersih */}
      <mesh position={[0, 0.04, 0]} receiveShadow material={materials.woodDark}>
        <boxGeometry args={[5.0, 0.08, 4.4]} />
      </mesh>
    </group>
  );
}

// 2. Tirai Putih Melayang Jendela Kelas Anime
export function ClassroomCurtains() {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);
  const curtainMaterial = useMemo(() => {
    return new THREE.MeshToonMaterial({
      color: new THREE.Color("#FFFFFF"),
      gradientMap,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
  }, [gradientMap]);

  // Posisi jendela kelas lantai 1, 2, 3
  const floorYs = [SCHOOL_LT1_Y, SCHOOL_LT2_Y, SCHOOL_LT3_Y];

  return (
    <group name="classroom_curtains">
      {floorYs.map((fy, fIdx) => (
        <group key={`curtains_lt_${fIdx}`}>
          {/* Tirai di Sisi Barat Jendela Kelas */}
          {[-32, -26, -20, -14, -8, -2].map((z, wIdx) => (
            <group key={`curtain_${fIdx}_${wIdx}`} position={[16.25, fy + 2.0, z]}>
              {/* Batang Rel Tirai */}
              <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 2.8, 8]} />
                <meshStandardMaterial color="#94A3B8" metalness={0.6} />
              </mesh>
              {/* Kain Tirai Kiri Melipat */}
              <mesh position={[0, 0, -1.0]}>
                <boxGeometry args={[0.05, 1.65, 0.65]} />
                <primitive object={curtainMaterial} attach="material" />
              </mesh>
              {/* Kain Tirai Kanan Melipat */}
              <mesh position={[0, 0, 1.0]}>
                <boxGeometry args={[0.05, 1.65, 0.65]} />
                <primitive object={curtainMaterial} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

// 3. Tanaman Pot Hijau di Sudut Kelas & Lorong
export function PottedPlants() {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  const materials = useMemo(() => {
    return {
      pot: new THREE.MeshToonMaterial({
        color: new THREE.Color("#B08968"),
        gradientMap,
      }),
      leaves: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.hedgeGreen),
        gradientMap,
      }),
    };
  }, [gradientMap]);

  // Lokasi pot di tiap lantai
  const plantPositions: Array<[number, number, number]> = [
    // Lantai 1
    [17.0, SCHOOL_LT1_Y, -35.2],
    [24.5, SCHOOL_LT1_Y, -35.2],
    [24.5, SCHOOL_LT1_Y, -19.5],
    // Lantai 2
    [17.0, SCHOOL_LT2_Y, -35.2],
    [24.5, SCHOOL_LT2_Y, -35.2],
    [24.5, SCHOOL_LT2_Y, -19.5],
    // Lantai 3
    [17.0, SCHOOL_LT3_Y, -35.2],
    [24.5, SCHOOL_LT3_Y, -35.2],
  ];

  return (
    <group name="potted_plants">
      {plantPositions.map(([x, y, z], idx) => (
        <group key={`plant_${idx}`} position={[x, y, z]}>
          {/* Pot Keramik Cokelat Terakota */}
          <mesh position={[0, 0.32, 0]} castShadow material={materials.pot}>
            <cylinderGeometry args={[0.26, 0.18, 0.64, 12]} />
          </mesh>
          {/* Daun Hijau Rimbun Toon Bulat */}
          <mesh position={[0, 0.78, 0]} castShadow material={materials.leaves}>
            <sphereGeometry args={[0.38, 8, 8]} />
          </mesh>
          <mesh position={[0.12, 0.95, 0.08]} castShadow material={materials.leaves}>
            <sphereGeometry args={[0.28, 8, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 4. Papan Pengumuman Kayu di Lorong (Bulletin Board)
export function HallwayBulletinBoards() {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  const materials = useMemo(() => {
    return {
      cork: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.bulletinBoardCork),
        gradientMap,
      }),
      frame: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.bulletinBoardFrame),
        gradientMap,
      }),
      paperWhite: new THREE.MeshBasicMaterial({ color: "#FFFFFF" }),
      paperColor: new THREE.MeshBasicMaterial({ color: "#FDE047" }),
    };
  }, [gradientMap]);

  return (
    <group name="hallway_bulletin_boards">
      {[SCHOOL_LT1_Y, SCHOOL_LT2_Y, SCHOOL_LT3_Y].map((fy, idx) => (
        <group key={`board_${idx}`} position={[24.8, fy + 1.8, -16.0]}>
          {/* Bingkai Kayu */}
          <mesh material={materials.frame}>
            <boxGeometry args={[0.08, 1.3, 2.5]} />
          </mesh>
          {/* Permukaan Gabus Cokelat */}
          <mesh position={[-0.02, 0, 0]} material={materials.cork}>
            <boxGeometry args={[0.06, 1.18, 2.38]} />
          </mesh>
          {/* Kertas-kertas Pengumuman Sekolah Berwarna */}
          <mesh position={[-0.06, 0.2, -0.6]} material={materials.paperWhite}>
            <boxGeometry args={[0.01, 0.45, 0.35]} />
          </mesh>
          <mesh position={[-0.06, -0.2, -0.5]} material={materials.paperColor}>
            <boxGeometry args={[0.01, 0.35, 0.4]} />
          </mesh>
          <mesh position={[-0.06, 0.1, 0.3]} material={materials.paperWhite}>
            <boxGeometry args={[0.01, 0.5, 0.4]} />
          </mesh>
          <mesh position={[-0.06, -0.2, 0.7]} material={materials.paperWhite}>
            <boxGeometry args={[0.01, 0.35, 0.3]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
