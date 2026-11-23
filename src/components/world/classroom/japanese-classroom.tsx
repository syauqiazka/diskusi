/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reusable Japanese Classroom Component (Hikido Doors, North Windows, West Blackboard)
 * Mengikuti spesifikasi resmi campus.json:
 * - Ukuran: 9 m (u, sepanjang koridor X) x 8 m (v, kedalaman Z), tinggi 3.4 m
 * - Dinding Barat: Papan tulis hijau 5.4x1.2m + tray kapur + layar proyektor + meja guru (u=1.2, v=2.0)
 *   Siswa MENGHADAP KE BARAT, jendela lapangan berada di SEBELAH KANAN siswa.
 * - Dinding Utara (menghadap lapangan): Jendela pita geser kontinu sill 1.0m, tinggi 1.8m, pot tanaman di ambang jendela.
 * - Dinding Selatan (sisi koridor): DUA PINTU GESER JEPANG (hikido), depan u 0.6-2.4 dan belakang u 6.6-8.4.
 *   Masing-masing 2 daun pintu geser aluminium + kaca + kayu, transom kaca tetap 0.9m, papan buletin mading di antara pintu.
 * - 36 meja + kursi (6x6) menghadap ke barat, u=2.8..7.3, v=1.4..6.4, lorong koridor v < 1.0m.
 * - Dinding Timur: 36 loker belakang + lemari kebersihan + rak payung dekat pintu belakang.
 * - Plafon: 3 baris lampu plafon, jam dinding di atas papan tulis, speaker.
 */

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface JapaneseClassroomProps {
  id: string;
  name: string;
  x0: number; // West wall (u = 0)
  x1: number; // East wall (u = 9)
  z0: number; // Corridor wall (v = 0 = 111.5)
  z1: number; // Window wall (v = 8 = 119.5)
  floorY: number; // 0, 4.0, 8.0
  doorsForceOpen?: boolean;
}

export function JapaneseClassroom({
  name,
  x0,
  z0,
  floorY,
  doorsForceOpen = false,
}: JapaneseClassroomProps) {
  const [doorsOpen, setDoorsOpen] = useState(doorsForceOpen);

  useEffect(() => {
    if (doorsForceOpen) setDoorsOpen(true);
  }, [doorsForceOpen]);

  // Handle tombol [E] untuk membuka/menutup pintu saat dekat
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE") {
        setDoorsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Animasi halus pergeseran daun pintu (0.5 detik)
  const slideFrontRef = useRef<THREE.Group>(null);
  const slideRearRef = useRef<THREE.Group>(null);
  const openProgress = useRef(doorsForceOpen ? 1.0 : 0.0);

  useFrame((_, delta) => {
    const target = doorsOpen ? 1.0 : 0.0;
    openProgress.current = THREE.MathUtils.lerp(openProgress.current, target, delta * 10.0);
    const offset = openProgress.current * 0.85; // geser 0.85m membuka

    if (slideFrontRef.current) {
      slideFrontRef.current.position.x = -offset;
    }
    if (slideRearRef.current) {
      slideRearRef.current.position.x = -offset;
    }
  });

  return (
    <group position={[x0, floorY, z0]} name={`classroom_${name.replace(/\s+/g, "_")}`}>
      {/* ------------------------------------------------------------- */}
      {/* 1. LANTAI KAYU KELAS (9m x 8m, local u: 0..9, v: 0..8)        */}
      {/* ------------------------------------------------------------- */}
      <mesh position={[4.5, 0.02, 4.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.0, 8.0]} />
        <meshStandardMaterial color="#D97706" roughness={0.4} />
      </mesh>

      {/* Baseboard kayu keliling ruangan */}
      <mesh position={[4.5, 0.06, 0.03]}>
        <boxGeometry args={[8.9, 0.12, 0.04]} />
        <meshStandardMaterial color="#451A03" />
      </mesh>
      <mesh position={[4.5, 0.06, 7.97]}>
        <boxGeometry args={[8.9, 0.12, 0.04]} />
        <meshStandardMaterial color="#451A03" />
      </mesh>
      <mesh position={[0.03, 0.06, 4.0]}>
        <boxGeometry args={[0.04, 0.12, 7.9]} />
        <meshStandardMaterial color="#451A03" />
      </mesh>
      <mesh position={[8.97, 0.06, 4.0]}>
        <boxGeometry args={[0.04, 0.12, 7.9]} />
        <meshStandardMaterial color="#451A03" />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 2. DINDING BARAT (u = 0): Papan Tulis, Layar Proyektor, Jam    */}
      {/* Siswa menghadap ke barat; guru mengajar di depan dinding ini   */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 0]}>
        {/* Dinding Pembatas Barat (Tebal 0.3m, panjang 8m, tinggi 3.6m) */}
        <mesh position={[0, 1.8, 4.0]}>
          <boxGeometry args={[0.3, 3.6, 8.0]} />
          <meshStandardMaterial color="#FEFCE8" roughness={0.8} />
        </mesh>

        {/* Papan Tulis Kapur Hijau 5.4m x 1.2m, tengah di v = 4.0, bottom 0.9m */}
        <mesh position={[0.16, 1.5, 4.0]}>
          <boxGeometry args={[0.04, 1.2, 5.4]} />
          <meshStandardMaterial color="#064E3B" roughness={0.85} />
        </mesh>
        {/* Bingkai & Tray Kapur */}
        <mesh position={[0.18, 0.88, 4.0]}>
          <boxGeometry args={[0.1, 0.04, 5.5]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.4} />
        </mesh>

        {/* Layar Proyektor di Atas Papan Tulis */}
        <mesh position={[0.17, 2.25, 4.0]}>
          <boxGeometry args={[0.03, 0.35, 3.6]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
        </mesh>

        {/* Jam Dinding Analog Bulat */}
        <mesh position={[0.17, 2.7, 4.0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 20]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
        <mesh position={[0.19, 2.7, 4.0]}>
          <boxGeometry args={[0.01, 0.02, 0.16]} />
          <meshBasicMaterial color="#0F172A" />
        </mesh>

        {/* Speaker Dinding Kelas */}
        <mesh position={[0.17, 3.1, 6.8]}>
          <boxGeometry args={[0.08, 0.22, 0.32]} />
          <meshStandardMaterial color="#78350F" roughness={0.6} />
        </mesh>

        {/* Meja Guru di u = 1.2, v = 2.0 (di samping papan tulis) */}
        <group position={[1.2, 0, 2.0]}>
          {/* Daun Meja Kayu Oak */}
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[1.4, 0.06, 0.8]} />
            <meshStandardMaterial color="#B45309" roughness={0.4} />
          </mesh>
          {/* Kaki Meja Logam */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.3, 0.68, 0.7]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Laptop & Buku Guru */}
          <mesh position={[-0.15, 0.76, 0]}>
            <boxGeometry args={[0.35, 0.02, 0.28]} />
            <meshStandardMaterial color="#475569" metalness={0.6} />
          </mesh>
          {/* Kursi Guru */}
          <mesh position={[-0.55, 0.45, 0]}>
            <boxGeometry args={[0.45, 0.05, 0.45]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[-0.75, 0.85, 0]}>
            <boxGeometry args={[0.05, 0.45, 0.45]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. DINDING UTARA (v = 8): Jendela Pita Menghadap Lapangan      */}
      {/* Melalui jendela ini pemandangan lapangan sepak bola & lintasan */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 8.0]}>
        {/* Ambang Bawah Dinding (Sill: y = 0..1.0m, tinggi 1.0m, tebal 0.5m) */}
        <mesh position={[4.5, 0.5, 0.25]}>
          <boxGeometry args={[9.0, 1.0, 0.5]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.8} />
        </mesh>

        {/* Pot Tanaman Hijau di Ambang Jendela */}
        {[1.5, 3.2, 5.8, 7.5].map((px) => (
          <group key={`plant_${px}`} position={[px, 1.02, 0.12]}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.12, 0.09, 0.16, 12]} />
              <meshStandardMaterial color="#F8FAFC" />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshStandardMaterial color="#16A34A" roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* Kusen & Kaca Jendela Geser Kontinu (y = 1.0..2.8m, tinggi 1.8m) */}
        {/* Kaca Bening Anime Transparan */}
        <mesh position={[4.5, 1.9, 0.25]}>
          <boxGeometry args={[8.8, 1.76, 0.04]} />
          <meshStandardMaterial
            color="#BAE6FD"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.05}
          />
        </mesh>
        {/* Rangka Kusen Aluminium Jendela */}
        <mesh position={[4.5, 1.9, 0.25]}>
          <boxGeometry args={[8.9, 1.8, 0.06]} />
          <meshStandardMaterial color="#334155" wireframe />
        </mesh>

        {/* Lintel Atas Dinding (y = 2.8..4.0m, tinggi 1.2m, tebal 0.5m) */}
        <mesh position={[4.5, 3.4, 0.25]}>
          <boxGeometry args={[9.0, 1.2, 0.5]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.8} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. DINDING SELATAN (v = 0, Sisi Koridor): 2 Pintu Hikido       */}
      {/* Front door u: 0.6-2.4, Rear door u: 6.6-8.4, Mading di tengah */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 0]}>
        {/* Dinding Kiri (u = 0..0.6) */}
        <mesh position={[0.3, 1.8, 0]}>
          <boxGeometry args={[0.6, 3.6, 0.25]} />
          <meshStandardMaterial color="#FEFCE8" roughness={0.8} />
        </mesh>

        {/* Dinding Tengah Antara 2 Pintu (u = 2.4..6.6, lebar 4.2m) */}
        <mesh position={[4.5, 1.8, 0]}>
          <boxGeometry args={[4.2, 3.6, 0.25]} />
          <meshStandardMaterial color="#FEFCE8" roughness={0.8} />
        </mesh>

        {/* Papan Buletin / Mading Kelas di Dinding Tengah */}
        <mesh position={[4.5, 1.6, -0.13]}>
          <boxGeometry args={[2.4, 1.2, 0.03]} />
          <meshStandardMaterial color="#CA8A04" roughness={0.7} />
        </mesh>
        {/* Lembaran Poster Informasi Kelas di Mading */}
        <mesh position={[4.0, 1.6, -0.15]}>
          <boxGeometry args={[0.6, 0.8, 0.01]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[5.0, 1.6, -0.15]}>
          <boxGeometry args={[0.7, 0.7, 0.01]} />
          <meshStandardMaterial color="#BAE6FD" />
        </mesh>

        {/* Dinding Kanan (u = 8.4..9.0) */}
        <mesh position={[8.7, 1.8, 0]}>
          <boxGeometry args={[0.6, 3.6, 0.25]} />
          <meshStandardMaterial color="#FEFCE8" roughness={0.8} />
        </mesh>

        {/* Transom Kaca Tetap 0.9m di Atas Pintu Depan & Belakang (y = 2.0..2.9m) */}
        <mesh position={[1.5, 2.45, 0]}>
          <boxGeometry args={[1.76, 0.86, 0.04]} />
          <meshStandardMaterial color="#BAE6FD" transparent opacity={0.35} />
        </mesh>
        <mesh position={[7.5, 2.45, 0]}>
          <boxGeometry args={[1.76, 0.86, 0.04]} />
          <meshStandardMaterial color="#BAE6FD" transparent opacity={0.35} />
        </mesh>

        {/* Balok Header Lintel di Atas Transom (y = 2.9..3.6m) */}
        <mesh position={[1.5, 3.25, 0]}>
          <boxGeometry args={[1.8, 0.7, 0.25]} />
          <meshStandardMaterial color="#FEFCE8" />
        </mesh>
        <mesh position={[7.5, 3.25, 0]}>
          <boxGeometry args={[1.8, 0.7, 0.25]} />
          <meshStandardMaterial color="#FEFCE8" />
        </mesh>

        {/* Papan Nama Ruangan Akrilik di Koridor Luar (u = 1.5, y = 2.2m) */}
        <group position={[1.5, 2.2, -0.15]}>
          <mesh>
            <boxGeometry args={[1.1, 0.28, 0.04]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, -0.025]}>
            <boxGeometry args={[1.0, 0.22, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* --- PINTU GESER DEPAN (Front Hikido Door u: 0.6..2.4) --- */}
        <group position={[1.5, 1.0, 0]} ref={slideFrontRef}>
          {/* Daun Pintu Geser Kiri (Lebar 0.9m, tinggi 2.0m) */}
          <group position={[-0.45, 0, 0.04]}>
            {/* Bagian Bawah Kayu Solid */}
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.88, 0.95, 0.05]} />
              <meshStandardMaterial color="#854D0E" roughness={0.6} />
            </mesh>
            {/* Bagian Atas Kaca Transparan */}
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.82, 0.95, 0.02]} />
              <meshStandardMaterial color="#BAE6FD" transparent opacity={0.4} />
            </mesh>
            {/* Kusen Daun Pintu Aluminium */}
            <mesh>
              <boxGeometry args={[0.88, 1.96, 0.04]} />
              <meshStandardMaterial color="#334155" wireframe />
            </mesh>
            {/* Handle Cekung Kuningan (Recessed Brass Handle) */}
            <mesh position={[0.38, 0, 0]}>
              <boxGeometry args={[0.04, 0.22, 0.06]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
          </group>

          {/* Daun Pintu Geser Kanan (Lebar 0.9m, tinggi 2.0m) */}
          <group position={[0.45, 0, -0.04]}>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.88, 0.95, 0.05]} />
              <meshStandardMaterial color="#854D0E" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.82, 0.95, 0.02]} />
              <meshStandardMaterial color="#BAE6FD" transparent opacity={0.4} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.88, 1.96, 0.04]} />
              <meshStandardMaterial color="#334155" wireframe />
            </mesh>
            <mesh position={[-0.38, 0, 0]}>
              <boxGeometry args={[0.04, 0.22, 0.06]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
          </group>
        </group>

        {/* --- PINTU GESER BELAKANG (Rear Hikido Door u: 6.6..8.4) --- */}
        <group position={[7.5, 1.0, 0]} ref={slideRearRef}>
          {/* Daun Pintu Geser Kiri */}
          <group position={[-0.45, 0, 0.04]}>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.88, 0.95, 0.05]} />
              <meshStandardMaterial color="#854D0E" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.82, 0.95, 0.02]} />
              <meshStandardMaterial color="#BAE6FD" transparent opacity={0.4} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.88, 1.96, 0.04]} />
              <meshStandardMaterial color="#334155" wireframe />
            </mesh>
            <mesh position={[0.38, 0, 0]}>
              <boxGeometry args={[0.04, 0.22, 0.06]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
          </group>

          {/* Daun Pintu Geser Kanan */}
          <group position={[0.45, 0, -0.04]}>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.88, 0.95, 0.05]} />
              <meshStandardMaterial color="#854D0E" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.82, 0.95, 0.02]} />
              <meshStandardMaterial color="#BAE6FD" transparent opacity={0.4} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.88, 1.96, 0.04]} />
              <meshStandardMaterial color="#334155" wireframe />
            </mesh>
            <mesh position={[-0.38, 0, 0]}>
              <boxGeometry args={[0.04, 0.22, 0.06]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. DINDING TIMUR (u = 9): Loker Siswa, Lemari Piket, Rak Payung*/}
      {/* ------------------------------------------------------------- */}
      <group position={[9.0, 0, 0]}>
        {/* Dinding Pembatas Timur */}
        <mesh position={[0, 1.8, 4.0]}>
          <boxGeometry args={[0.3, 3.6, 8.0]} />
          <meshStandardMaterial color="#FEFCE8" roughness={0.8} />
        </mesh>

        {/* 36 Loker Siswa di Dinding Belakang (v = 1.5..6.5, tinggi 1.8m) */}
        <mesh position={[-0.22, 0.9, 4.0]}>
          <boxGeometry args={[0.42, 1.8, 5.0]} />
          <meshStandardMaterial color="#64748B" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Garis Grid Kompartemen Loker */}
        <mesh position={[-0.43, 0.9, 4.0]}>
          <boxGeometry args={[0.02, 1.76, 4.9]} />
          <meshStandardMaterial color="#475569" wireframe />
        </mesh>

        {/* Lemari Alat Kebersihan Piket di v = 7.0 */}
        <mesh position={[-0.3, 1.0, 7.0]}>
          <boxGeometry args={[0.55, 2.0, 0.9]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Rak Payung dekat Pintu Belakang (v = 0.8) */}
        <mesh position={[-0.25, 0.35, 0.8]}>
          <boxGeometry args={[0.4, 0.7, 0.6]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 6. 36 MEJA + KURSI SISWA (6x6) MENGHADAP KE BARAT (-X)        */}
      {/* u: 2.8 s/d 7.3, v: 1.4 s/d 6.4, lorong koridor v < 1.0m       */}
      {/* ------------------------------------------------------------- */}
      <group name="classroom_student_desks">
        {[0, 1, 2, 3, 4, 5].map((row) => {
          const u = 2.8 + row * 0.9;
          return [0, 1, 2, 3, 4, 5].map((col) => {
            const v = 1.4 + col * 1.0;
            return (
              <group key={`desk_${row}_${col}`} position={[u, 0, v]}>
                {/* Daun Meja Kayu Siswa (Menghadap Barat: panjang 0.65m sepanjang V) */}
                <mesh position={[0, 0.72, 0]}>
                  <boxGeometry args={[0.45, 0.04, 0.65]} />
                  <meshStandardMaterial color="#D97706" roughness={0.5} />
                </mesh>
                {/* Kaki Meja Baja Tubular */}
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.4, 0.68, 0.6]} />
                  <meshStandardMaterial color="#334155" roughness={0.7} />
                </mesh>
                {/* Laci Buku di Bawah Meja */}
                <mesh position={[0, 0.65, 0]}>
                  <boxGeometry args={[0.42, 0.1, 0.58]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.6} />
                </mesh>
                {/* Kursi Siswa (Ditempatkan di sisi Timur Meja, Menghadap ke Barat) */}
                <group position={[0.38, 0, 0]}>
                  <mesh position={[0, 0.45, 0]}>
                    <boxGeometry args={[0.38, 0.04, 0.38]} />
                    <meshStandardMaterial color="#B45309" roughness={0.5} />
                  </mesh>
                  {/* Sandaran Kursi */}
                  <mesh position={[0.18, 0.75, 0]}>
                    <boxGeometry args={[0.03, 0.25, 0.36]} />
                    <meshStandardMaterial color="#B45309" roughness={0.5} />
                  </mesh>
                  {/* Kaki Kursi */}
                  <mesh position={[0, 0.22, 0]}>
                    <boxGeometry args={[0.32, 0.44, 0.32]} />
                    <meshStandardMaterial color="#334155" roughness={0.7} />
                  </mesh>
                </group>
              </group>
            );
          });
        })}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 7. PLAFON: 3 BARIS LAMPU GANTUNG LED HANGAT                   */}
      {/* ------------------------------------------------------------- */}
      {[2.0, 4.0, 6.0].map((v, lIdx) => (
        <group key={`ceiling_light_row_${lIdx}`} position={[4.5, 3.35, v]}>
          <mesh>
            <boxGeometry args={[7.2, 0.05, 0.3]} />
            <meshStandardMaterial emissive="#FEF08A" emissiveIntensity={1.2} color="#FEF3C7" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
