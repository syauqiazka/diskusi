"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";

export function SakuraDormitory({
  position = [24, 0, 38],
}: {
  position?: [number, number, number];
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  const mats = useMemo(() => {
    return {
      wall: new THREE.MeshToonMaterial({
        color: new THREE.Color("#4338CA"), // Sesuai warna denah asrama ungu/indigo
        gradientMap,
      }),
      wallClean: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.asramaWall),
        gradientMap,
      }),
      roof: new THREE.MeshToonMaterial({
        color: new THREE.Color("#1E1B4B"),
        gradientMap,
      }),
      balconyRail: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.asramaBalconyRail),
        gradientMap,
      }),
      windowGlass: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.windowGlassDay),
        gradientMap,
        transparent: true,
        opacity: 0.85,
      }),
      doorWood: new THREE.MeshToonMaterial({
        color: new THREE.Color(ANIME_PALETTE.doorWood),
        gradientMap,
      }),
    };
  }, [gradientMap]);

  return (
    <group position={position} name="sakura_dormitory">
      {/* 1. Bangunan Asrama 4 Lantai (24m x 18m x 13.5m) */}
      <mesh position={[0, 6.75, 0]} castShadow receiveShadow material={mats.wallClean}>
        <boxGeometry args={[24, 13.5, 18]} />
      </mesh>

      {/* Atap Miring Pelindung Tropis */}
      <mesh position={[0, 14.1, 0]} material={mats.roof}>
        <boxGeometry args={[24.8, 0.8, 18.8]} />
      </mesh>

      {/* Lobi Masuk & Resepsi di Lantai 1 (Sisi Selatan Menghadap Jalan) */}
      <group position={[3.5, 1.4, 9.1]}>
        <mesh material={mats.doorWood}>
          <boxGeometry args={[3.6, 2.6, 0.1]} />
        </mesh>
        <mesh position={[0, 1.6, 0.4]} material={mats.roof}>
          <boxGeometry args={[4.4, 0.12, 1.2]} />
        </mesh>
      </group>

      {/* Jendela Berderet Kamar Siswa & Balkon di 4 Lantai */}
      {[1.6, 5.0, 8.4, 11.8].map((yElev, flIdx) => (
        <group key={`dorm_floor_${flIdx}`} position={[0, yElev, 0]}>
          {/* Balkon Kamar Sisi Utara & Selatan */}
          {[-7.5, -2.5, 2.5, 7.5].map((bx, bIdx) => (
            <React.Fragment key={`dorm_balcony_${flIdx}_${bIdx}`}>
              {/* Balkon Depan (Selatan) */}
              <group position={[bx, 0, 9.2]}>
                {/* Jendela Kamar Kaca Biru */}
                <mesh position={[0, 0.3, -0.1]} material={mats.windowGlass}>
                  <boxGeometry args={[1.8, 1.6, 0.05]} />
                </mesh>
                {/* Railing Balkon Biru Pastel */}
                <mesh position={[0, -0.2, 0.6]} material={mats.balconyRail}>
                  <boxGeometry args={[2.2, 0.85, 0.05]} />
                </mesh>
              </group>

              {/* Balkon Belakang (Utara) */}
              <group position={[bx, 0, -9.2]}>
                <mesh position={[0, 0.3, 0.1]} material={mats.windowGlass}>
                  <boxGeometry args={[1.8, 1.6, 0.05]} />
                </mesh>
                <mesh position={[0, -0.2, -0.6]} material={mats.balconyRail}>
                  <boxGeometry args={[2.2, 0.85, 0.05]} />
                </mesh>
              </group>
            </React.Fragment>
          ))}

          {/* Garis Lis Horizontal Pembatas Lantai */}
          <mesh position={[0, -1.6, 0]} material={mats.balconyRail}>
            <boxGeometry args={[24.4, 0.14, 18.4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

