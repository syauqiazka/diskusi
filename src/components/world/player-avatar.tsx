"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { PeerPlayerState } from "@/lib/realtime/use-classroom-presence";

export const AVATAR_COLORS = {
  shirt: "#E5ECE9",      // Kemeja putih seragam
  pants: "#2B3A4A",      // Celana abu-abu tua kejuruan
  skin: "#C8A185",       // Warna kulit siluet
  hair: "#1A1A1A",       // Rambut hitam
  deskIndicator: "#4FD08A", // Hijau presence
};

/**
 * Avatar Siswa Duduk di Meja (Presence di Meja)
 * Ditampilkan jika siswa yang memiliki meja tersebut sedang online di kelas.
 */
export function StudentSittingAvatar({
  name,
  isMe,
}: {
  name: string;
  isMe?: boolean;
}) {
  return (
    <group position={[0, 0, 0.45]}>
      {/* 1. Kaki Duduk Menekuk */}
      <mesh position={[0, 0.22, -0.05]}>
        <boxGeometry args={[0.3, 0.44, 0.35]} />
        <meshStandardMaterial color={AVATAR_COLORS.pants} roughness={0.8} />
      </mesh>

      {/* 2. Tubuh Bagian Atas / Kemeja */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.36, 0.5, 0.22]} />
        <meshStandardMaterial
          color={isMe ? "#E9F2E3" : AVATAR_COLORS.shirt}
          roughness={0.7}
        />
      </mesh>

      {/* 3. Lengan & Tangan di Atas Meja */}
      <mesh position={[0.22, 0.65, -0.2]}>
        <boxGeometry args={[0.08, 0.35, 0.25]} />
        <meshStandardMaterial color={AVATAR_COLORS.shirt} />
      </mesh>
      <mesh position={[-0.22, 0.65, -0.2]}>
        <boxGeometry args={[0.08, 0.35, 0.25]} />
        <meshStandardMaterial color={AVATAR_COLORS.shirt} />
      </mesh>

      {/* 4. Kepala & Rambut */}
      <group position={[0, 1.12, 0]}>
        <mesh>
          <boxGeometry args={[0.22, 0.24, 0.22]} />
          <meshStandardMaterial color={AVATAR_COLORS.skin} roughness={0.6} />
        </mesh>
        {/* Rambut */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.24, 0.08, 0.24]} />
          <meshStandardMaterial color={AVATAR_COLORS.hair} />
        </mesh>
      </group>

      {/* Indikator Online di Atas Kepala */}
      <Text
        position={[0, 1.38, 0]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.07}
        color={isMe ? "#4FD08A" : "#00F5D4"}
        anchorX="center"
      >
        {isMe ? "ONLINE (ANDA)" : `ONLINE: ${name}`}
      </Text>
    </group>
  );
}

/**
 * Avatar Pemain Lain yang Berjalan di Ruang Kelas (Multiplayer Spasial)
 * Menggunakan interpolasi posisi lerp (60fps) dari koordinat 10Hz.
 */
export function RemotePlayerAvatar({ player }: { player: PeerPlayerState }) {
  const groupRef = React.useRef<THREE.Group>(null);
  const targetPos = React.useRef(new THREE.Vector3(player.x, player.y - 0.8, player.z));
  const targetRot = React.useRef(player.rotY);

  React.useEffect(() => {
    targetPos.current.set(player.x, Math.max(0, player.y - 0.8), player.z);
    targetRot.current = player.rotY;
  }, [player.x, player.y, player.z, player.rotY]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Interpolasi halus (lerp) per frame
    const factor = Math.min(1, delta * 15);
    groupRef.current.position.lerp(targetPos.current, factor);

    // Interpolasi sudut rotasi
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRot.current,
      factor
    );
  });

  return (
    <group ref={groupRef} position={[player.x, Math.max(0, player.y - 0.8), player.z]}>
      {/* Kaki Berdiri */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.3, 0.9, 0.2]} />
        <meshStandardMaterial color={AVATAR_COLORS.pants} />
      </mesh>

      {/* Badan / Kemeja */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.38, 0.55, 0.22]} />
        <meshStandardMaterial color={AVATAR_COLORS.shirt} />
      </mesh>

      {/* Kepala */}
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[0.22, 0.24, 0.22]} />
        <meshStandardMaterial color={AVATAR_COLORS.skin} />
      </mesh>

      {/* Rambut */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[0.24, 0.08, 0.24]} />
        <meshStandardMaterial color={AVATAR_COLORS.hair} />
      </mesh>

      {/* Label Nama Siswa HUD */}
      <group position={[0, 1.85, 0]}>
        <Text
          fontSize={0.1}
          color="#00F5D4"
          anchorX="center"
          anchorY="middle"
        >
          {player.name}
        </Text>
      </group>
    </group>
  );
}

