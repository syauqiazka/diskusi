/**
 * Komponen Lapisan Awan Rendah Poligon (Low-Poly Sky Clouds)
 * Modul Lingkungan Waktu Realtime SMK TI BAZMA
 *
 * Mengatur pergerakan awan secara perlahan di langit, interpolasi warna
 * dan opasitas sesuai fase waktu, serta memudar total saat malam hari.
 */

"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TIME_OF_DAY_CONFIG } from '@/lib/world/time-of-day.config';
import { useTimeOfDayStore } from '@/stores/use-time-of-day-store';

// Variabel scratch tingkat modul (Zero GC per frame)
const _scratchCloudColorA = new THREE.Color();
const _scratchCloudColorB = new THREE.Color();
const _targetCloudColor = new THREE.Color();

interface CloudClusterData {
  initialPosition: [number, number, number];
  speed: number;
  scale: [number, number, number];
  rotationY: number;
  puffs: Array<{
    offset: [number, number, number];
    radius: number;
  }>;
}

export interface SkyCloudsProps {
  count?: number;
  speedMultiplier?: number;
}

export const SkyClouds: React.FC<SkyCloudsProps> = ({
  count = 14,
  speedMultiplier = 1.0,
}) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);

  // Buat geometri dasar icosahedron low-poly bersama sekali
  const basePuffGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(1.0, 1);
  }, []);

  // Material awan low-poly dibuat SEKALI (tanpa dependensi re-instansiasi)
  const cloudMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f0f4f8'),
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      fog: false, // Bebas dari kabut agar warna awan tidak ikut menggelap di malam hari
    });
  }, []);

  // Data sebaran gumpalan awan di angkasa
  const clusters = useMemo<CloudClusterData[]>(() => {
    const list: CloudClusterData[] = [];

    for (let i = 0; i < count; i++) {
      const posX = -140 + (i / count) * 280 + (Math.random() - 0.5) * 18;
      const posY = 74 + Math.random() * 18; // Tinggi di atas puncak bukit dan kamera OVERVIEW
      const posZ = -120 + Math.random() * 240;

      const speed = (0.75 + Math.random() * 0.7) * speedMultiplier;

      const scaleX = 2.4 + Math.random() * 1.6;
      const scaleY = 1.2 + Math.random() * 0.6;
      const scaleZ = 2.0 + Math.random() * 1.4;

      const puffCount = 5 + Math.floor(Math.random() * 3);
      const puffs: Array<{ offset: [number, number, number]; radius: number }> = [];

      puffs.push({ offset: [0, 0, 0], radius: 1.6 + Math.random() * 0.5 });

      for (let p = 0; p < puffCount - 1; p++) {
        puffs.push({
          offset: [
            (Math.random() - 0.5) * 2.8,
            (Math.random() - 0.3) * 0.8,
            (Math.random() - 0.5) * 2.2,
          ],
          radius: 0.9 + Math.random() * 0.8,
        });
      }

      list.push({
        initialPosition: [posX, posY, posZ],
        speed,
        scale: [scaleX, scaleY, scaleZ],
        rotationY: Math.random() * Math.PI * 2,
        puffs,
      });
    }

    return list;
  }, [count, speedMultiplier]);

  // Pembersihan memori saat komponen di-unmount
  useEffect(() => {
    return () => {
      basePuffGeometry.dispose();
      cloudMaterial.dispose();
    };
  }, [basePuffGeometry, cloudMaterial]);

  // Animasi pergerakan dan interpolasi visual awan via getState() (Zero React re-render)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const damping = 1 - Math.exp(-TIME_OF_DAY_CONFIG.dampingLambda * dt);

    const { activePhase, nextPhase, blendFactor, prefersReducedMotion } =
      useTimeOfDayStore.getState();

    // 1. Hitung target warna dan opasitas awan berdasarkan fase
    const fromConfig = TIME_OF_DAY_CONFIG.visuals[activePhase];
    const toConfig = TIME_OF_DAY_CONFIG.visuals[nextPhase];
    const t = Math.max(0, Math.min(1, blendFactor));

    _scratchCloudColorA.set(fromConfig.cloudColor);
    _scratchCloudColorB.set(toConfig.cloudColor);
    _targetCloudColor.copy(_scratchCloudColorA).lerp(_scratchCloudColorB, t);

    const targetOpacity =
      fromConfig.cloudOpacity + (toConfig.cloudOpacity - fromConfig.cloudOpacity) * t;

    // Terapkan interpolasi redaman ke material awan
    cloudMaterial.color.lerp(_targetCloudColor, damping);
    cloudMaterial.opacity = THREE.MathUtils.damp(
      cloudMaterial.opacity,
      targetOpacity,
      TIME_OF_DAY_CONFIG.dampingLambda,
      dt
    );

    // Sembunyikan awan jika sudah sepenuhnya pudar di malam hari (menghemat proses GPU)
    if (groupRef.current) {
      groupRef.current.visible = cloudMaterial.opacity > 0.005;
      // Lapisan awan mengikuti pergerakan horizontal pemain
      groupRef.current.position.set(camera.position.x, 0, camera.position.z);
    }

    // 2. Pergerakan posisi awan secara horizontal
    const motionScale = prefersReducedMotion ? 0.12 : 1.0;

    for (let i = 0; i < clusters.length; i++) {
      const cloudObj = cloudRefs.current[i];
      if (!cloudObj) continue;

      cloudObj.position.x += clusters[i].speed * motionScale * dt;

      // Pembatas langit relatif terhadap pusat group (wrap around)
      if (cloudObj.position.x > 140) {
        cloudObj.position.x = -140;
        cloudObj.position.z = -110 + Math.random() * 220;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {clusters.map((cluster, i) => (
        <group
          key={i}
          ref={(el) => {
            cloudRefs.current[i] = el;
          }}
          position={cluster.initialPosition}
          scale={cluster.scale}
          rotation={[0, cluster.rotationY, 0]}
        >
          {cluster.puffs.map((puff, pIdx) => (
            <mesh
              key={pIdx}
              position={puff.offset}
              scale={[puff.radius, puff.radius, puff.radius]}
              geometry={basePuffGeometry}
              material={cloudMaterial}
              castShadow={false}
              receiveShadow={false}
            />
          ))}
        </group>
      ))}
    </group>
  );
};
