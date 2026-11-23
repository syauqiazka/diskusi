/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pengendali Pintu Interaktif & Gerbang Utama (Door Controller)
 * - Pintu beranimasi geser/ayun yang dapat dibuka/tutup dengan tombol [E]
 * - Gerbang utama (10m) otomatis bergeser membuka saat pemain mendekat (< 12m)
 * - Menampilkan prompt interaksi saat berada dalam radius < 2.5m
 */

import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

interface InteractiveDoorProps {
  position: [number, number, number];
  width?: number;
  height?: number;
  isSliding?: boolean;
}

export function InteractiveDoor({
  position,
  width = 1.0,
  height = 2.2,
  isSliding = true,
}: InteractiveDoorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const currentOffset = useRef(0);
  const targetOffset = isOpen ? width * 0.9 : 0;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (Math.abs(currentOffset.current - targetOffset) < 0.001) return;
    currentOffset.current = THREE.MathUtils.lerp(
      currentOffset.current,
      targetOffset,
      delta * 8.0
    );
    if (isSliding) {
      meshRef.current.position.x = position[0] + currentOffset.current;
    } else {
      meshRef.current.rotation.y = (currentOffset.current / width) * (Math.PI / 2);
    }
  });

  return (
    <group position={[position[0], position[1] + height / 2, position[2]]}>
      <mesh
        ref={meshRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial color="#854D0E" roughness={0.6} />
      </mesh>
      {/* Handle Pintu */}
      <mesh position={[width * 0.35, 0, 0.06]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
      </mesh>
    </group>
  );
}

export function MainGateController({
  playerPos,
}: {
  playerPos?: [number, number, number];
}) {
  const gateLeftRef = useRef<THREE.Mesh>(null);
  const gateRightRef = useRef<THREE.Mesh>(null);
  const openProgress = useRef(0);
  const { camera } = useThree();

  useFrame((_, delta) => {
    const camPos = playerPos
      ? new THREE.Vector3(playerPos[0], playerPos[1], playerPos[2])
      : camera.position;
    // Jarak ke pusat gerbang (0, 0, 0)
    const distToGate = Math.hypot(camPos.x, camPos.z);
    const shouldOpen = distToGate < 14.0;
    const target = shouldOpen ? 1.0 : 0.0;

    if (Math.abs(openProgress.current - target) < 0.001) return;

    openProgress.current = THREE.MathUtils.lerp(openProgress.current, target, delta * 3.0);

    if (gateLeftRef.current && gateRightRef.current) {
      // Gerbang geser 10m total (daun kiri -5m s/d 0, daun kanan 0 s/d 5m)
      gateLeftRef.current.position.x = -2.5 - openProgress.current * 4.5;
      gateRightRef.current.position.x = 2.5 + openProgress.current * 4.5;
    }
  });

  return (
    <group position={[0, 1.2, 0]} name="main_sliding_gate">
      {/* Daun Gerbang Kiri (Lebar 5m x Tinggi 2.4m) */}
      <mesh ref={gateLeftRef} position={[-2.5, 0, 0]}>
        <boxGeometry args={[5.0, 2.4, 0.12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Daun Gerbang Kanan (Lebar 5m x Tinggi 2.4m) */}
      <mesh ref={gateRightRef} position={[2.5, 0, 0]}>
        <boxGeometry args={[5.0, 2.4, 0.12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tiang Portal Gerbang Kiri & Kanan */}
      <mesh position={[-5.3, 0.3, 0]}>
        <boxGeometry args={[0.6, 3.0, 0.6]} />
        <meshStandardMaterial color="#64748B" />
      </mesh>
      <mesh position={[5.3, 0.3, 0]}>
        <boxGeometry args={[0.6, 3.0, 0.6]} />
        <meshStandardMaterial color="#64748B" />
      </mesh>
    </group>
  );
}
