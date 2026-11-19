"use client";

import React from "react";
import { useSakuraStore } from "@/stores/use-sakura-store";

export function SakuraSportsField({
  position = [22, 0, -10],
}: {
  position?: [number, number, number];
}) {
  const fieldMode = useSakuraStore((s) => s.fieldMode);

  const showSoccer = fieldMode === "SOCCER" || fieldMode === "BOTH";
  const showBaseball = fieldMode === "BASEBALL" || fieldMode === "BOTH";

  // Dimensi Lapangan Sepak Bola
  const pitchWidth = 105;
  const pitchDepth = 68;

  return (
    <group position={position} name="sakura_sports_field">
      {/* 1. Lintasan Lari Atletik Luar (Running Track Merah Bata) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[pitchWidth + 14, pitchDepth + 14]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.85} />
      </mesh>

      {/* Garis-garis Jalur Lari Atletik Putih */}
      {[-6, -4, -2, 2, 4, 6].map((offset, idx) => (
        <mesh
          key={`track_line_${idx}`}
          position={[0, 0.03, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              pitchDepth / 2 + 1 + offset * 0.9,
              pitchDepth / 2 + 1.08 + offset * 0.9,
              64,
            ]}
          />
          <meshBasicMaterial color="#FFFFFF" opacity={0.65} transparent />
        </mesh>
      ))}

      {/* 2. Hamparan Rumput Hijau Lapangan (Turf Field) */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[pitchWidth, pitchDepth]} />
        <meshStandardMaterial color="#15803D" roughness={0.7} />
      </mesh>

      {/* Garis Luar Lapangan Sepak Bola (Touchlines & Goal lines) */}
      {showSoccer && (
        <group name="soccer_markings">
          {/* Garis Batas Luar */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[pitchWidth - 0.2, pitchDepth - 0.2]} />
            <meshStandardMaterial color="#16A34A" roughness={0.7} />
          </mesh>

          {/* Garis Tengah Lapangan */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.2, 0.01, pitchDepth]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Lingkaran Tengah (Radius 9.15m) */}
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[9.1, 9.3, 48]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Kotak Penalti Barat */}
          <group position={[-pitchWidth / 2 + 8.25, 0.06, 0]}>
            <mesh>
              <boxGeometry args={[16.5, 0.01, 40.3]} />
              <meshBasicMaterial color="#FFFFFF" wireframe />
            </mesh>
            {/* Titik Penalti */}
            <mesh position={[2.75, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.25, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>

          {/* Kotak Penalti Timur */}
          <group position={[pitchWidth / 2 - 8.25, 0.06, 0]}>
            <mesh>
              <boxGeometry args={[16.5, 0.01, 40.3]} />
              <meshBasicMaterial color="#FFFFFF" wireframe />
            </mesh>
            {/* Titik Penalti */}
            <mesh position={[-2.75, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.25, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>

          {/* Gawang Sepak Bola Barat */}
          <group position={[-pitchWidth / 2, 1.22, 0]}>
            {/* Tiang Vertikal */}
            <mesh position={[0, 0, -3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.7} />
            </mesh>
            <mesh position={[0, 0, 3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.7} />
            </mesh>
            {/* Mistar Atas */}
            <mesh position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 7.32, 8]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.7} />
            </mesh>
            {/* Jaring Belakang */}
            <mesh position={[-1.0, 0, 0]}>
              <boxGeometry args={[2.0, 2.44, 7.32]} />
              <meshStandardMaterial color="#FFFFFF" transparent opacity={0.35} wireframe />
            </mesh>
          </group>

          {/* Gawang Sepak Bola Timur */}
          <group position={[pitchWidth / 2, 1.22, 0]}>
            <mesh position={[0, 0, -3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.7} />
            </mesh>
            <mesh position={[0, 0, 3.66]}>
              <cylinderGeometry args={[0.06, 0.06, 2.44, 8]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.7} />
            </mesh>
            <mesh position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 7.32, 8]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.7} />
            </mesh>
            <mesh position={[1.0, 0, 0]}>
              <boxGeometry args={[2.0, 2.44, 7.32]} />
              <meshStandardMaterial color="#FFFFFF" transparent opacity={0.35} wireframe />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. Overlay Baseball Diamond (Sesuai Gambar 13) */}
      {showBaseball && (
        <group position={[0, 0.055, 10]} name="baseball_diamond">
          {/* Tanah Infield Cokelat Kemerahan (Infield Dirt) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <ringGeometry args={[2.0, 28.0, 32, 1, Math.PI / 4, Math.PI / 2]} />
            <meshStandardMaterial color="#B45309" roughness={0.8} />
          </mesh>

          {/* Busur Outfield Arc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[34.0, 34.3, 32, 1, Math.PI / 4, Math.PI / 2]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Garis Foul Line Kiri & Kanan (45 Derajat dari Home Plate) */}
          <mesh position={[-12, 0.01, -12]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.15, 0.01, 38]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[12, 0.01, -12]} rotation={[0, -Math.PI / 4, 0]}>
            <boxGeometry args={[0.15, 0.01, 38]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Home Plate (Di sisi selatan diamond) */}
          <mesh position={[0, 0.02, 13.5]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.6, 0.02, 0.6]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>

          {/* Pitcher's Mound (Di tengah antara home plate dan second base) */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[2.5, 2.8, 0.25, 24]} />
            <meshStandardMaterial color="#B45309" roughness={0.8} />
          </mesh>
          {/* Pitching Rubber */}
          <mesh position={[0, 0.26, 0]}>
            <boxGeometry args={[0.6, 0.02, 0.15]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Base 1 (Kanan) - Jarak 27m dari home plate */}
          <mesh position={[13.5, 0.04, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.55, 0.06, 0.55]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>

          {/* Base 2 (Tengah Atas) */}
          <mesh position={[0, 0.04, -13.5]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.55, 0.06, 0.55]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>

          {/* Base 3 (Kiri) */}
          <mesh position={[-13.5, 0.04, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.55, 0.06, 0.55]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Bangku Cadangan Tim di Tepi Lapangan (Dugout / Team Benches) */}
      <group position={[0, 0.6, pitchDepth / 2 + 3.5]}>
        <mesh position={[-20, 0, 0]}>
          <boxGeometry args={[8.0, 1.2, 1.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[20, 0, 0]}>
          <boxGeometry args={[8.0, 1.2, 1.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
    </group>
  );
}
