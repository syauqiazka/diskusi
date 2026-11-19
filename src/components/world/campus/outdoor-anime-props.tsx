"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ANIME_PALETTE, getSharedGradientMap } from "@/lib/world/anime-materials";

// 1. Partikel Kelopak Bunga Sakura Jatuh (Cherry Blossom Falling Petals)
function SakuraPetalParticles({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Simpan data partikel (posisi, rotasi, kecepatan angin)
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 110,
        y: Math.random() * 18 + 1,
        z: (Math.random() - 0.5) * 90,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        speedY: 0.015 + Math.random() * 0.025,
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayRange: 0.015 + Math.random() * 0.02,
        scale: 0.6 + Math.random() * 0.6,
      });
    }
    return arr;
  }, [count]);

  const petalGeometry = useMemo(() => {
    // Bentuk oval pipih melengkung mirip kelopak bunga
    const geo = new THREE.CylinderGeometry(0.12, 0.04, 0.01, 8);
    geo.rotateZ(Math.PI / 4);
    return geo;
  }, []);

  const petalMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(ANIME_PALETTE.sakuraPetal),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Gerakan jatuh ke bawah
      p.y -= p.speedY;
      // Ayunan melayang tertiup angin
      p.x += Math.sin(time * p.swaySpeed + i) * p.swayRange;
      p.z += Math.cos(time * p.swaySpeed * 0.7 + i) * p.swayRange;

      // Rotasi melayang
      p.rotX += delta * 1.2;
      p.rotZ += delta * 0.8;

      // Reset ke atas jika menyentuh tanah
      if (p.y < 0.2) {
        p.y = 16 + Math.random() * 4;
        p.x = (Math.random() - 0.5) * 110;
        p.z = (Math.random() - 0.5) * 90;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[petalGeometry, petalMaterial, count]}
      frustumCulled={false}
    />
  );
}

// 2. Mesin Penjual Otomatis Anime (Japanese Vending Machine)
export function AnimeVendingMachine({
  position,
  rotationY = 0,
  variant = "blue",
}: {
  position: [number, number, number];
  rotationY?: number;
  variant?: "blue" | "red";
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);
  const bodyColor = variant === "blue" ? ANIME_PALETTE.vendingBlue : ANIME_PALETTE.vendingRed;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Badan Mesin */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.1, 2.1, 0.85]} />
        <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
      </mesh>

      {/* Jendela Display Minuman (Kaca menyala hangat) */}
      <mesh position={[0, 1.35, 0.44]}>
        <boxGeometry args={[0.9, 0.9, 0.05]} />
        <meshBasicMaterial color="#E0F2FE" />
      </mesh>

      {/* Baris Kaleng Minuman Berwarna di dalam Display */}
      {[-0.3, 0, 0.3].map((x, colIdx) => (
        <group key={`can_col_${colIdx}`}>
          <mesh position={[x, 1.5, 0.46]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
            <meshBasicMaterial color={colIdx % 2 === 0 ? "#EF4444" : "#10B981"} />
          </mesh>
          <mesh position={[x, 1.25, 0.46]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
            <meshBasicMaterial color={colIdx === 1 ? "#F59E0B" : "#3B82F6"} />
          </mesh>
        </group>
      ))}

      {/* Slot Pengambilan Minuman di Bawah */}
      <mesh position={[0, 0.4, 0.44]}>
        <boxGeometry args={[0.7, 0.3, 0.05]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>

      {/* Slot Koin & Tombol Pilihan */}
      <mesh position={[0.32, 0.82, 0.44]}>
        <boxGeometry args={[0.15, 0.25, 0.02]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
    </group>
  );
}

// 3. Rak Sepeda Sekolah Anime (Bicycle Rack)
export function AnimeBicycleRack({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Rel Dasar Rak */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[4.2, 0.08, 0.3]} />
        <meshToonMaterial color={ANIME_PALETTE.bikeRackMetal} gradientMap={gradientMap} />
      </mesh>

      {/* Tiang Lengkung Penjepit Roda Sepeda (7 Slot) */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = -1.8 + i * 0.6;
        return (
          <group key={`bike_slot_${i}`} position={[x, 0.35, 0]}>
            <mesh position={[-0.08, 0, 0]}>
              <boxGeometry args={[0.03, 0.65, 0.6]} />
              <meshToonMaterial color={ANIME_PALETTE.bikeRackMetal} gradientMap={gradientMap} />
            </mesh>
            <mesh position={[0.08, 0, 0]}>
              <boxGeometry args={[0.03, 0.65, 0.6]} />
              <meshToonMaterial color={ANIME_PALETTE.bikeRackMetal} gradientMap={gradientMap} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 4. Bangku Kayu Taman Anime
export function AnimeParkBench({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Bilah Dudukan Kayu */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[2.0, 0.08, 0.55]} />
        <meshToonMaterial color={ANIME_PALETTE.benchWood} gradientMap={gradientMap} />
      </mesh>
      {/* Sandaran Kayu */}
      <mesh position={[0, 0.75, 0.24]} castShadow>
        <boxGeometry args={[2.0, 0.45, 0.08]} />
        <meshToonMaterial color={ANIME_PALETTE.benchWood} gradientMap={gradientMap} />
      </mesh>
      {/* Kaki Besi Hitam */}
      <mesh position={[-0.85, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.44, 0.5]} />
        <meshToonMaterial color={ANIME_PALETTE.gateIronBar} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.85, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.44, 0.5]} />
        <meshToonMaterial color={ANIME_PALETTE.gateIronBar} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

// 5. Pohon Berbunga Sakura Bergaya Anime (Toon Cherry Blossom Tree)
export function AnimeSakuraTree({
  position,
  scale = 1.0,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  return (
    <group position={position} scale={scale}>
      {/* Batang Pohon Cokelat Anime */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.45, 4.4, 8]} />
        <meshToonMaterial color={ANIME_PALETTE.sakuraBark} gradientMap={gradientMap} />
      </mesh>

      {/* Dahan Cabang */}
      <mesh position={[0.5, 3.4, 0.2]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.16, 0.24, 1.8, 6]} />
        <meshToonMaterial color={ANIME_PALETTE.sakuraBark} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[-0.4, 3.2, -0.3]} rotation={[0, 0, Math.PI / 5]}>
        <cylinderGeometry args={[0.14, 0.22, 1.6, 6]} />
        <meshToonMaterial color={ANIME_PALETTE.sakuraBark} gradientMap={gradientMap} />
      </mesh>

      {/* Rimbunan Mahkota Bunga Sakura (Gumpalan Halus Toon) */}
      {/* Mahkota Utama */}
      <mesh position={[0, 5.0, 0]} castShadow>
        <sphereGeometry args={[2.2, 12, 10]} />
        <meshToonMaterial color={ANIME_PALETTE.sakuraPetal} gradientMap={gradientMap} />
      </mesh>
      {/* Gumpalan Timur */}
      <mesh position={[1.4, 4.6, 0.6]} castShadow>
        <sphereGeometry args={[1.5, 10, 8]} />
        <meshToonMaterial color={ANIME_PALETTE.sakuraPetalDark} gradientMap={gradientMap} />
      </mesh>
      {/* Gumpalan Barat */}
      <mesh position={[-1.3, 4.7, -0.5]} castShadow>
        <sphereGeometry args={[1.6, 10, 8]} />
        <meshToonMaterial color={ANIME_PALETTE.sakuraPetal} gradientMap={gradientMap} />
      </mesh>
      {/* Gumpalan Atas */}
      <mesh position={[0.2, 6.2, 0.1]} castShadow>
        <sphereGeometry args={[1.4, 10, 8]} />
        <meshToonMaterial color={ANIME_PALETTE.sakuraPetal} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

// 6. Gerbang Sekolah Anime dengan Tiang Batu dan Pagar Besi
export function AnimeSchoolGate({
  position = [14, -2.6, 32],
  rotationY = 0,
}: {
  position?: [number, number, number];
  rotationY?: number;
}) {
  const gradientMap = useMemo(() => getSharedGradientMap(), []);

  return (
    <group position={position} rotation={[0, rotationY, 0]} name="anime_school_gate">
      {/* Tiang Gerbang Kiri (Batu Abu-abu Terang) */}
      <mesh position={[-3.6, 1.9, 0]} castShadow>
        <boxGeometry args={[1.1, 3.8, 1.1]} />
        <meshToonMaterial color={ANIME_PALETTE.gatePostStone} gradientMap={gradientMap} />
      </mesh>
      {/* Mahkota Piramida Tiang Kiri */}
      <mesh position={[-3.6, 3.9, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.85, 0.45, 4]} />
        <meshToonMaterial color={ANIME_PALETTE.gatePostStone} gradientMap={gradientMap} />
      </mesh>

      {/* Tiang Gerbang Kanan */}
      <mesh position={[3.6, 1.9, 0]} castShadow>
        <boxGeometry args={[1.1, 3.8, 1.1]} />
        <meshToonMaterial color={ANIME_PALETTE.gatePostStone} gradientMap={gradientMap} />
      </mesh>
      {/* Mahkota Piramida Tiang Kanan */}
      <mesh position={[3.6, 3.9, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.85, 0.45, 4]} />
        <meshToonMaterial color={ANIME_PALETTE.gatePostStone} gradientMap={gradientMap} />
      </mesh>

      {/* Daun Pintu Gerbang Besi Terbuka Mengundang Siswa Masuk */}
      {/* Sayap Kiri Terbuka Menghadap Masuk */}
      <mesh position={[-2.4, 1.4, -0.9]} rotation={[0, -Math.PI / 5, 0]}>
        <boxGeometry args={[2.5, 2.6, 0.08]} />
        <meshToonMaterial color={ANIME_PALETTE.gateIronBar} gradientMap={gradientMap} />
      </mesh>
      {/* Sayap Kanan Terbuka */}
      <mesh position={[2.4, 1.4, -0.9]} rotation={[0, Math.PI / 5, 0]}>
        <boxGeometry args={[2.5, 2.6, 0.08]} />
        <meshToonMaterial color={ANIME_PALETTE.gateIronBar} gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

// 7. Komponen Induk Seluruh Prop Luar Ruangan Anime
export function OutdoorAnimeProps() {
  // Deretan Pohon Sakura di Sepanjang Jalur Masuk dan Lapangan
  const sakuraLocations: Array<[number, number, number, number]> = [
    // Sepanjang jalur dari gerbang menuju sekolah
    [10.5, -3.2, 28, 1.1],
    [17.5, -3.2, 28, 1.05],
    [9.5, -4.8, 20, 1.15],
    [18.5, -4.8, 20, 1.1],
    [8.5, -6.6, 12, 1.2],
    [19.5, -6.6, 12, 1.15],
    // Dekat lapangan dan halaman asrama
    [-18, -4.8, 15, 1.0],
    [-24, -4.8, 10, 1.1],
    [-28, -5.2, 0, 1.2],
    [-24, -5.5, -12, 1.1],
  ];

  return (
    <group name="outdoor_anime_props">
      {/* Gerbang Sekolah */}
      <AnimeSchoolGate position={[14, -2.6, 32]} />

      {/* Deretan Pohon Sakura */}
      {sakuraLocations.map(([x, y, z, s], idx) => (
        <AnimeSakuraTree
          key={`sakura_${idx}`}
          position={[x, y, z]}
          scale={s}
        />
      ))}

      {/* Partikel Kelopak Bunga Melayang Ringan (120 partikel instanced) */}
      <SakuraPetalParticles count={120} />

      {/* Mesin Penjual Minuman Otomatis (Vending Machine) di Samping Selasar */}
      <AnimeVendingMachine position={[-8.5, -8.2, 14.5]} rotationY={0} variant="blue" />
      <AnimeVendingMachine position={[-7.2, -8.2, 14.5]} rotationY={0} variant="red" />

      {/* Rak Sepeda di Sisi Jalur Turunan */}
      <AnimeBicycleRack position={[21.5, -5.2, 16]} rotationY={-Math.PI / 2} />

      {/* Bangku Taman Kayu di Bawah Pohon Sakura */}
      <AnimeParkBench position={[7.2, -3.8, 24]} rotationY={Math.PI / 3} />
      <AnimeParkBench position={[20.5, -5.8, 8]} rotationY={-Math.PI / 4} />
      <AnimeParkBench position={[-20, -5.2, 8]} rotationY={Math.PI / 2} />
    </group>
  );
}
