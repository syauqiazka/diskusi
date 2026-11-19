"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSakuraStore } from "@/stores/use-sakura-store";

export function FountainRoundabout({
  position = [-16, 0, 24],
}: {
  position?: [number, number, number];
}) {
  const timePreset = useSakuraStore((s) => s.timePreset);
  const isNight = timePreset === "night";

  // Ref untuk partikel semprotan air
  const jetsRef = useRef<THREE.Points>(null);
  const centerJetRef = useRef<THREE.Points>(null);

  // Buat geometri partikel air mancur 8 jet melingkar
  const { jetPositions, jetVelocities } = useMemo(() => {
    const count = 480;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const jetIdx = i % 8;
      const angle = (jetIdx / 8) * Math.PI * 2;
      const radius = 3.6;

      const originX = Math.cos(angle) * radius;
      const originZ = Math.sin(angle) * radius;

      pos[i * 3] = originX;
      pos[i * 3 + 1] = 0.5 + Math.random() * 1.5;
      pos[i * 3 + 2] = originZ;

      // Kecepatan memancar melengkung ke arah pusat
      vel[i * 3] = -Math.cos(angle) * 0.03 + (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = 0.08 + Math.random() * 0.05;
      vel[i * 3 + 2] = -Math.sin(angle) * 0.03 + (Math.random() - 0.5) * 0.01;
    }
    return { jetPositions: pos, jetVelocities: vel };
  }, []);

  // Buat partikel jet tengah tinggi
  const { centerPositions, centerVelocities } = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = 0.8 + Math.random() * 2.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      vel[i * 3] = (Math.random() - 0.5) * 0.015;
      vel[i * 3 + 1] = 0.12 + Math.random() * 0.06;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    return { centerPositions: pos, centerVelocities: vel };
  }, []);

  // Animasi partikel air
  useFrame((_, delta) => {
    if (jetsRef.current) {
      const posAttr = jetsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        const jetIdx = i % 8;
        const angle = (jetIdx / 8) * Math.PI * 2;
        const radius = 3.6;

        arr[i * 3 + 1] += jetVelocities[i * 3 + 1];
        jetVelocities[i * 3 + 1] -= delta * 0.35; // gravitasi

        arr[i * 3] += jetVelocities[i * 3];
        arr[i * 3 + 2] += jetVelocities[i * 3 + 2];

        // Reset partikel jika jatuh ke kolam
        if (arr[i * 3 + 1] < 0.4) {
          arr[i * 3] = Math.cos(angle) * radius;
          arr[i * 3 + 1] = 0.5;
          arr[i * 3 + 2] = Math.sin(angle) * radius;
          jetVelocities[i * 3 + 1] = 0.08 + Math.random() * 0.05;
        }
      }
      posAttr.needsUpdate = true;
    }

    if (centerJetRef.current) {
      const posAttr = centerJetRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] += centerVelocities[i * 3 + 1];
        centerVelocities[i * 3 + 1] -= delta * 0.4;

        arr[i * 3] += centerVelocities[i * 3];
        arr[i * 3 + 2] += centerVelocities[i * 3 + 2];

        if (arr[i * 3 + 1] < 0.8) {
          arr[i * 3] = (Math.random() - 0.5) * 0.2;
          arr[i * 3 + 1] = 0.9;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          centerVelocities[i * 3 + 1] = 0.12 + Math.random() * 0.06;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={position} name="sakura_fountain_roundabout">
      {/* 1. Jalan Drop-off Melingkar (Ring Aspal Halus, Diameter 26m) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[8.5, 13.0, 48]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* 2. Paving Granit Abu-abu (Plaza Tengah, Diameter 17m) */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8.45, 48]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>

      {/* 3. Pita Lantai Motif Bunga Sakura 8 Arah (Cincin Pola Sakura Pink Halus) */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 7.8, 8]} />
        <meshStandardMaterial color="#F48FB1" roughness={0.6} />
      </mesh>

      {/* Garis Pembagi Kelopak 8 Arah */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`petal_line_${i}`}
            position={[Math.cos(angle) * 6.8, 0.06, Math.sin(angle) * 6.8]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.15, 0.02, 2.0]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
        );
      })}

      {/* 4. Dinding Bibir Kolam Air Mancur (Batu Granit Halus) */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.8, 5.0, 0.9, 36]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.5} />
      </mesh>

      {/* Rongga Dalam Kolam */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[4.4, 4.4, 0.82, 36]} />
        <meshStandardMaterial color="#475569" roughness={0.3} />
      </mesh>

      {/* Permukaan Air Kolam (Water Surface Jernih) */}
      <mesh position={[0, 0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.38, 36]} />
        <meshStandardMaterial
          color="#38BDF8"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Tugu Pilar Pusat Air Mancur (Tiered Pedestal) */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.9, 16]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.75, 0.8, 16]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>

      {/* 8 Nozel Pancuran Melingkar */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3.6;
        return (
          <group key={`nozzle_${i}`} position={[Math.cos(angle) * radius, 0.78, Math.sin(angle) * radius]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.1, 0.18, 8]} />
              <meshStandardMaterial color="#FDBA74" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Lampu LED Bawah Air di setiap nozel saat malam */}
            {isNight && (
              <pointLight
                position={[0, 0.2, 0]}
                color="#60A5FA"
                intensity={3.5}
                distance={5}
                decay={2}
              />
            )}
          </group>
        );
      })}

      {/* Nozel Tengah */}
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.2, 8]} />
        <meshStandardMaterial color="#FDBA74" metalness={0.8} />
      </mesh>

      {/* Lampu Sorot LED Pusat saat Malam */}
      {isNight && (
        <pointLight
          position={[0, 2.2, 0]}
          color="#F472B6"
          intensity={8.0}
          distance={10}
          decay={2}
        />
      )}

      {/* 5. Partikel Pancuran Air (8 Jet Melingkar) */}
      <points ref={jetsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[jetPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#BAE6FD"
          size={0.16}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>

      {/* Partikel Pancuran Pusat (Center Jet Tinggi) */}
      <points ref={centerJetRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[centerPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#E0F2FE"
          size={0.2}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
