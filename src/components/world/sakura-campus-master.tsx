/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sakura Academy Master 3D Campus Scene
 * Seluruh penempatan objek di-generate 100% dari data resmi src/data/campus.ts:
 * - Tidak ada objek yang diposisikan secara kira-kira / by eye
 * - Walk mode adalah default: capsule first-person controller dari Gerbang (0, 1.6, 2)
 * - Orbit mode mendukung cutaway lantai (1F, 2F, 3F, Okujo)
 * - Langit anime, pencahayaan realtime, kelopak sakura melayang
 */

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { useSakuraStore } from "@/stores/use-sakura-store";
import { RoadsAndFence } from "./generators/roads-and-fence";
import { SportsFieldGround } from "./generators/sports-field-ground";
import { MainBuildingSlabsAndWalls } from "./generators/wall-opening-generator";
import { WalkableStairs } from "./generators/stair-generator";
import { AllCampusFurniture } from "./generators/furniture-instancer";
import { CampusBuildingEnvelopes } from "./generators/building-envelope";
import { FirstPersonWalkController } from "./generators/first-person-walk-controller";

// Generator Partikel Kelopak Bunga Sakura Melayang (Instanced Petals)
function FallingSakuraPetals({ count = 160 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 120,
      y: Math.random() * 16 + 1.0,
      z: Math.random() * 150 + 10,
      speedY: Math.random() * 0.6 + 0.3,
      speedX: Math.random() * 0.4 - 0.2,
      rotationSpeed: Math.random() * 1.5,
    }))
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const d = dummy.current;
    const parts = particles.current;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y -= p.speedY * delta;
      p.x += p.speedX * delta;
      if (p.y < 0.2) p.y = 16.0;

      d.position.set(p.x, p.y, p.z);
      d.rotation.x += p.rotationSpeed * delta;
      d.rotation.y += p.rotationSpeed * 0.5 * delta;
      d.scale.set(0.12, 0.04, 0.12);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#F472B6" side={THREE.DoubleSide} transparent opacity={0.8} />
    </instancedMesh>
  );
}

export function SakuraCampusMaster() {
  const cameraMode = useSakuraStore((s) => s.cameraMode);
  const selectedFloor = useSakuraStore((s) => s.selectedFloor);
  const timePreset = useSakuraStore((s) => s.timePreset);
  const teleportPosition = useSakuraStore((s) => s.teleportPosition);
  const clearTeleport = useSakuraStore((s) => s.clearTeleport);

  const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  // Tangani teleportasi saat di mode orbit
  useEffect(() => {
    if (teleportPosition && orbitRef.current) {
      orbitRef.current.target.set(teleportPosition[0], teleportPosition[1], teleportPosition[2]);
      clearTeleport();
    }
  }, [teleportPosition, clearTeleport]);

  // Pengaturan warna langit & pencahayaan sesuai preset waktu
  const isNight = timePreset === "night";
  const isSunset = timePreset === "sunset";
  const isMorning = timePreset === "morning";

  const doorsForceOpen =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("doors") === "open";

  const skyColor = isNight
    ? "#0F172A"
    : isSunset
    ? "#FDBA74"
    : isMorning
    ? "#BAE6FD"
    : "#60A5FA";

  const sunColor = isNight
    ? "#818CF8"
    : isSunset
    ? "#FB923C"
    : isMorning
    ? "#FED7AA"
    : "#FFFFFF";

  const sunIntensity = isNight ? 0.35 : isSunset ? 1.6 : isMorning ? 1.4 : 1.9;

  // Nilai cutaway untuk generator dinding (walk mode selalu menampilkan ALL)
  const effectiveCutaway =
    cameraMode === "walk"
      ? "ALL"
      : selectedFloor === "1F"
      ? 1
      : selectedFloor === "2F"
      ? 2
      : selectedFloor === "3F"
      ? 3
      : selectedFloor === "ROOF"
      ? 4
      : "ALL";

  return (
    <>
      {/* Warna Latar Langit & Kabut Anime */}
      <color attach="background" args={[skyColor]} />
      <fog
        attach="fog"
        args={[skyColor, 60, cameraMode === "topdown" ? 800 : 320]}
      />

      {/* Kontrol Kamera: Walk Mode Default, Orbit Mode, atau Top-Down Orthographic */}
      {cameraMode === "walk" && <FirstPersonWalkController />}
      {cameraMode === "orbit" && (
        <OrbitControls
          ref={orbitRef}
          target={[0, 6, 120]}
          maxPolarAngle={Math.PI / 2 - 0.04}
          minDistance={10}
          maxDistance={350}
          makeDefault
        />
      )}
      {cameraMode === "topdown" && (
        <OrthographicCamera
          makeDefault
          position={[0, 280, 120]}
          up={[0, 0, 1]}
          zoom={2.7}
          near={1}
          far={600}
          onUpdate={(c) => c.lookAt(0, 0, 120)}
        />
      )}

      {/* Pencahayaan Lingkungan Anime (Kyoto Animation Daylight) */}
      <ambientLight intensity={isNight ? 0.4 : 0.85} color={isNight ? "#1E293B" : "#F0FDF4"} />
      <directionalLight
        position={[-35, 65, 45]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={10}
        shadow-camera-far={260}
        shadow-camera-left={-110}
        shadow-camera-right={110}
        shadow-camera-top={130}
        shadow-camera-bottom={-130}
        shadow-bias={-0.0004}
      />
      <hemisphereLight
        args={[skyColor, isNight ? "#020617" : "#166534", isNight ? 0.3 : 0.6]}
      />

      {/* 1. Generator Pagar, Gerbang 10m, Pos Satpam, Avenue Sakura, Parkir, Bundaran Air Mancur, Jalan */}
      <RoadsAndFence isNight={isNight} />

      {/* 2. Generator Lapangan Olahraga Gabungan Sepak Bola + Bisbol (x: -61..61, z: 108..192) */}
      <SportsFieldGround />

      {/* 3. Generator Selubung Gedung Kampus Lainnya (Aula, Gym, Asrama, Budaya, Tenis, Kyudo, Koi Garden) */}
      <CampusBuildingEnvelopes />

      {/* 4. Generator Dinding Bersegmen, Bukaan Pintu & Jendela, dan Pelat Lantai Gedung Utama */}
      <MainBuildingSlabsAndWalls floorCutaway={effectiveCutaway} doorsForceOpen={doorsForceOpen} />

      {/* 5. Generator Tangga Berjalan (Grand Atrium + Tangga Sirkulasi 1F -> 2F -> 3F -> Okujo) */}
      <WalkableStairs floorCutaway={effectiveCutaway} />

      {/* 6. Generator Furnitur Lengkap Seluruh Ruangan (36 Meja 6x6, Lab, Buku, Kafetaria, dll.) */}
      <AllCampusFurniture floorCutaway={effectiveCutaway} />

      {/* 7. Partikel Kelopak Sakura Melayang */}
      <FallingSakuraPetals count={240} />
    </>
  );
}
