"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSakuraStore } from "@/stores/use-sakura-store";
import { SakuraMainBuilding } from "./main-building-anime";
import { FountainRoundabout } from "./fountain-roundabout";
import { SakuraSportsField } from "./sports-field";
import { SakuraGymnasium } from "./gymnasium-anime";
import { SakuraAuditorium } from "./auditorium-anime";
import { SakuraDormitory } from "./dormitory-anime";
import { SakuraCultureFacilities } from "./culture-facilities-anime";
import { OutdoorAnimeProps } from "../campus/outdoor-anime-props";

// Controller Mode Berjalan First-Person (WASD + Mouse)
function FirstPersonController() {
  const { camera } = useThree();
  const teleportPosition = useSakuraStore((s) => s.teleportPosition);
  const clearTeleport = useSakuraStore((s) => s.clearTeleport);

  const keys = useRef<{ [key: string]: boolean }>({});
  const moveSpeed = 8.0;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Tangani Teleportasi
  useEffect(() => {
    if (teleportPosition) {
      camera.position.set(teleportPosition[0], teleportPosition[1], teleportPosition[2]);
      clearTeleport();
    }
  }, [teleportPosition, camera, clearTeleport]);

  useFrame((_, delta) => {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const speed = (keys.current["ShiftLeft"] ? moveSpeed * 1.8 : moveSpeed) * delta;

    if (keys.current["KeyW"]) camera.position.addScaledVector(forward, speed);
    if (keys.current["KeyS"]) camera.position.addScaledVector(forward, -speed);
    if (keys.current["KeyA"]) camera.position.addScaledVector(right, speed);
    if (keys.current["KeyD"]) camera.position.addScaledVector(right, -speed);

    // Ketinggian mata pemain rata-rata
    if (camera.position.y < 1.6) camera.position.y = 1.6;
  });

  return null;
}

export function SakuraCampusScene() {
  const cameraMode = useSakuraStore((s) => s.cameraMode);
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

  // Warna langit & pencahayaan sesuai preset waktu
  const isNight = timePreset === "night";
  const isSunset = timePreset === "sunset";
  const isMorning = timePreset === "morning";

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

  return (
    <>
      {/* Warna Latar Langit Anime */}
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 60, 260]} />

      {/* Kontrol Kamera */}
      {cameraMode === "orbit" ? (
        <OrbitControls
          ref={orbitRef}
          target={[-8, 4, 0]}
          maxPolarAngle={Math.PI / 2 - 0.04}
          minDistance={8}
          maxDistance={180}
          makeDefault
        />
      ) : (
        <FirstPersonController />
      )}

      {/* Pencahayaan Lingkungan Anime (Kyoto Animation Daylight) */}
      <ambientLight intensity={isNight ? 0.4 : 0.85} color={isNight ? "#1E293B" : "#F0FDF4"} />
      <directionalLight
        position={[-30, 60, 40]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight
        args={[skyColor, isNight ? "#020617" : "#166534", isNight ? 0.3 : 0.6]}
      />

      {/* 1. Hamparan Tanah Rumput Hijau Kampus (Fenced Campus ~3 Hektar) */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[240, 220]} />
        <meshStandardMaterial color={isNight ? "#0F291E" : "#4ADE80"} roughness={0.8} />
      </mesh>

      {/* Pagar Luar Pengaman Kawasan Kampus (Fenced Campus) */}
      <mesh position={[0, 1.2, 58]}>
        <boxGeometry args={[240, 2.4, 0.2]} />
        <meshStandardMaterial color="#334155" wireframe />
      </mesh>
      <mesh position={[0, 1.2, -78]}>
        <boxGeometry args={[240, 2.4, 0.2]} />
        <meshStandardMaterial color="#334155" wireframe />
      </mesh>
      <mesh position={[-120, 1.2, -10]}>
        <boxGeometry args={[0.2, 2.4, 136]} />
        <meshStandardMaterial color="#334155" wireframe />
      </mesh>
      <mesh position={[120, 1.2, -10]}>
        <boxGeometry args={[0.2, 2.4, 136]} />
        <meshStandardMaterial color="#334155" wireframe />
      </mesh>

      {/* 2. Gedung Utama 3 Lantai + Okujo Rooftop */}
      <SakuraMainBuilding position={[-32, 0, -10]} />

      {/* 3. Plaza Drop-off Bundaran Air Mancur Sakura */}
      <FountainRoundabout position={[-16, 0, 24]} />

      {/* 4. Lapangan Olahraga Gabungan Sepak Bola + Bisbol */}
      <SakuraSportsField position={[22, 0, -10]} />

      {/* 5. Gimnasium & Kolam Renang Indoor 25m */}
      <SakuraGymnasium position={[24, 0, -56]} />

      {/* 6. Aula Teater (800 Kursi) */}
      <SakuraAuditorium position={[-16, 0, -56]} />

      {/* 7. Asrama Siswa (4 Lantai) */}
      <SakuraDormitory position={[24, 0, 38]} />

      {/* 8. Gedung Budaya, Taman Koi & Jembatan, Lapangan Tenis, Dojo Kyudo, Pos Satpam */}
      <SakuraCultureFacilities />

      {/* 9. Gerbang Sekolah, Pohon Sakura Berbunga, Partikel Kelopak Melayang, Vending Machine, Bangku */}
      <OutdoorAnimeProps />
    </>
  );
}
