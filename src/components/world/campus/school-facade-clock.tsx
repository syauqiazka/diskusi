"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTimeOfDayStore } from "@/stores/use-time-of-day-store";

interface SchoolFacadeClockProps {
  position?: [number, number, number];
  scale?: number;
}

export function SchoolFacadeClock({
  position = [0, 8.8, 12.1],
  scale = 1.0,
}: SchoolFacadeClockProps) {
  const hourHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);
  const currentHour = useTimeOfDayStore((s) => s.currentHour);

  useFrame(() => {
    if (!hourHandRef.current || !minuteHandRef.current) return;

    // Hitung sudut rotasi jarum jam & menit (Z axis rotation dalam radian)
    const hours = currentHour % 12;
    const minutes = (currentHour % 1) * 60;

    // Jarum jam berputar 360 derajat per 12 jam: -(hours / 12) * 2PI
    const hourAngle = -(hours / 12) * Math.PI * 2;
    // Jarum menit berputar 360 derajat per jam: -(minutes / 60) * 2PI
    const minuteAngle = -(minutes / 60) * Math.PI * 2;

    hourHandRef.current.rotation.z = hourAngle;
    minuteHandRef.current.rotation.z = minuteAngle;
  });

  return (
    <group position={position} scale={scale} name="school_facade_clock">
      {/* Bingkai Luar Jam Bulat Menjorok dari Dinding */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.15, 0.22, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* Cincin Trim Keemasan / Putih Gading Fasad */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.04, 32]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
      </mesh>

      {/* Piringan Muka Jam (Putih Bersih) */}
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 0.02, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Titik Penanda 12 Jam (12 Bar Tanda Waktu) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.82;
        const x = Math.sin(angle) * radius;
        const y = Math.cos(angle) * radius;
        const isCardinal = i % 3 === 0;

        return (
          <mesh
            key={`clock_mark_${i}`}
            position={[x, y, 0.14]}
            rotation={[0, 0, -angle]}
          >
            <boxGeometry args={[isCardinal ? 0.05 : 0.025, isCardinal ? 0.14 : 0.08, 0.01]} />
            <meshBasicMaterial color="#1E293B" />
          </mesh>
        );
      })}

      {/* Jarum Jam (Pendek & Tebal) */}
      <group ref={hourHandRef} position={[0, 0, 0.15]}>
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[0.06, 0.48, 0.015]} />
          <meshBasicMaterial color="#0F172A" />
        </mesh>
      </group>

      {/* Jarum Menit (Panjang & Ramping) */}
      <group ref={minuteHandRef} position={[0, 0, 0.16]}>
        <mesh position={[0, 0.36, 0]}>
          <boxGeometry args={[0.04, 0.72, 0.015]} />
          <meshBasicMaterial color="#1E293B" />
        </mesh>
      </group>

      {/* Baut / Penutup Poros Tengah Jam */}
      <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
        <meshStandardMaterial color="#0F172A" roughness={0.2} />
      </mesh>
    </group>
  );
}

