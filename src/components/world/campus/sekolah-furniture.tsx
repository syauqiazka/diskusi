"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  SCHOOL_CLASSROOM_DESKS,
  SCHOOL_CLASSROOM_FRONTS,
  SCHOOL_INTERIOR_INTERACTABLES,
  SCHOOL_LAB_BENCHES,
  SCHOOL_LT1_Y,
  SCHOOL_LT2_Y,
  SchoolInteriorInteractable,
} from '@/lib/world/school-interior-layout';
import { DESIGN_TOKENS } from '@/lib/world/campus-palette';
import { INTERACTABLE_LAYER } from '@/lib/world/selection';
import { useWorldStore } from '@/stores/use-world-store';

function InteractiveProxyBox({ item }: { item: SchoolInteriorInteractable }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const hoveredId = useWorldStore((s) => s.hoveredInteractable?.id ?? null);
  const highlighted = hoveredId === item.id;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // Hanya aktif pada layer raycast interaksi (layer 1), tidak mengganggu render kamera utama (layer 0)
    mesh.layers.set(INTERACTABLE_LAYER);
    mesh.userData.interactableId = item.id;
  }, [item.id]);

  return (
    <group position={item.position} rotation={[0, item.rotationY, 0]}>
      <mesh ref={meshRef} visible={true}>
        <boxGeometry args={item.dimensions} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {/* Indikator tepi tipis saat ditarget crosshair */}
      {highlighted && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[item.dimensions[0] + 0.04, 0.03, item.dimensions[2] + 0.04]} />
          <meshStandardMaterial
            color={DESIGN_TOKENS.caution}
            emissive={DESIGN_TOKENS.caution}
            emissiveIntensity={0.65}
            transparent
            opacity={0.75}
          />
        </mesh>
      )}
    </group>
  );
}

export function SekolahFurniture() {
  // Referensi InstancedMesh untuk 60 meja & kursi kelas + 20 kipas plafon (efisiensi draw call)
  const deskTopInstRef = useRef<THREE.InstancedMesh>(null);
  const deskFrontInstRef = useRef<THREE.InstancedMesh>(null);
  const deskFrameInstRef = useRef<THREE.InstancedMesh>(null);
  const chairSeatInstRef = useRef<THREE.InstancedMesh>(null);
  const chairBackInstRef = useRef<THREE.InstancedMesh>(null);
  const chairFrameInstRef = useRef<THREE.InstancedMesh>(null);
  const fanHousingInstRef = useRef<THREE.InstancedMesh>(null);
  const fanBladesInstRef = useRef<THREE.InstancedMesh>(null);

  const furnMats = useMemo(() => {
    return {
      oakWood: new THREE.MeshStandardMaterial({
        color: '#caa574',
        roughness: 0.62,
        metalness: 0.03,
      }),
      darkOak: new THREE.MeshStandardMaterial({
        color: '#4f545c',
        roughness: 0.72,
        metalness: 0.05,
      }),
      whiteSteel: new THREE.MeshStandardMaterial({
        color: '#dfe5ec',
        roughness: 0.36,
        metalness: 0.45,
      }),
      blackSteel: new THREE.MeshStandardMaterial({
        color: '#1e242c',
        roughness: 0.42,
        metalness: 0.65,
      }),
      chromeMetal: new THREE.MeshStandardMaterial({
        color: '#b8c3ce',
        roughness: 0.22,
        metalness: 0.85,
      }),
      whiteboardFace: new THREE.MeshStandardMaterial({
        color: '#f2f5f7',
        roughness: 0.32,
        metalness: 0.02,
      }),
      monitorScreen: new THREE.MeshStandardMaterial({
        color: '#17232c',
        emissive: '#234254',
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.2,
      }),
      conferenceTop: new THREE.MeshStandardMaterial({
        color: '#efeee8',
        roughness: 0.28,
        metalness: 0.05,
      }),
      redFabric: new THREE.MeshStandardMaterial({
        color: '#b63936',
        roughness: 0.84,
        metalness: 0.02,
      }),
      creamCushion: new THREE.MeshStandardMaterial({
        color: '#cfc2ac',
        roughness: 0.88,
        metalness: 0.02,
      }),
      taupeCabinet: new THREE.MeshStandardMaterial({
        color: '#9c8d7a',
        roughness: 0.66,
        metalness: 0.06,
      }),
      guitarYellow: new THREE.MeshStandardMaterial({
        color: '#e5bf36',
        roughness: 0.35,
        metalness: 0.08,
      }),
      guitarSpruce: new THREE.MeshStandardMaterial({
        color: '#d8b47c',
        roughness: 0.42,
        metalness: 0.04,
      }),
      guitarWhite: new THREE.MeshStandardMaterial({
        color: '#eceff3',
        roughness: 0.32,
        metalness: 0.06,
      }),
      guitarPink: new THREE.MeshStandardMaterial({
        color: '#d95885',
        roughness: 0.36,
        metalness: 0.08,
      }),
      gigBagBlue: new THREE.MeshStandardMaterial({
        color: '#2c5da8',
        roughness: 0.82,
        metalness: 0.04,
      }),
      bookNavy: new THREE.MeshStandardMaterial({ color: '#27436b', roughness: 0.85 }),
      bookTerracotta: new THREE.MeshStandardMaterial({ color: '#a84f33', roughness: 0.85 }),
      bookGreen: new THREE.MeshStandardMaterial({ color: '#39684a', roughness: 0.85 }),
      bookOchre: new THREE.MeshStandardMaterial({ color: '#b88c38', roughness: 0.85 }),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(furnMats).forEach((m) => m.dispose());
    };
  }, [furnMats]);

  // Isi matriks InstancedMesh meja siswa, kursi siswa, & kipas plafon di 10 Ruang Kelas
  const deskCount = SCHOOL_CLASSROOM_DESKS.length;
  const ceilingFanPositions = useMemo(
    () => SCHOOL_CLASSROOM_FRONTS.flatMap((f) => f.ceilingFans),
    []
  );
  const fanCount = ceilingFanPositions.length;

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const qRot = new THREE.Quaternion();
    const offset = new THREE.Vector3();
    const axisY = new THREE.Vector3(0, 1, 0);

    const setInst = (
      mesh: THREE.InstancedMesh | null,
      idx: number,
      baseX: number,
      baseY: number,
      baseZ: number,
      rotY: number,
      lx: number,
      ly: number,
      lz: number
    ) => {
      if (!mesh) return;
      qRot.setFromAxisAngle(axisY, rotY);
      offset.set(lx, ly, lz).applyQuaternion(qRot);
      dummy.position.set(baseX + offset.x, baseY + offset.y, baseZ + offset.z);
      dummy.quaternion.copy(qRot);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    };

    SCHOOL_CLASSROOM_DESKS.forEach((desk, i) => {
      const [bx, by, bz] = desk.position;
      const r = desk.rotationY;
      // Meja siswa (permukaan kayu 0.74m, panel depan, rangka besi bawah)
      setInst(deskTopInstRef.current, i, bx, by, bz, r, 0, 0.73, 0);
      setInst(deskFrontInstRef.current, i, bx, by, bz, r, 0, 0.56, 0.22);
      setInst(deskFrameInstRef.current, i, bx, by, bz, r, 0, 0.36, 0);
      // Kursi siswa diletakkan rapi di belakang meja (z lokal -0.44)
      setInst(chairSeatInstRef.current, i, bx, by, bz, r, 0, 0.44, -0.44);
      setInst(chairBackInstRef.current, i, bx, by, bz, r, 0, 0.72, -0.62);
      setInst(chairFrameInstRef.current, i, bx, by, bz, r, 0, 0.22, -0.44);
    });

    [
      deskTopInstRef,
      deskFrontInstRef,
      deskFrameInstRef,
      chairSeatInstRef,
      chairBackInstRef,
      chairFrameInstRef,
    ].forEach((ref) => {
      if (ref.current) {
        ref.current.instanceMatrix.needsUpdate = true;
        ref.current.computeBoundingSphere();
      }
    });

    ceilingFanPositions.forEach((pos, idx) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.rotation.set(0, idx * 0.6, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      fanHousingInstRef.current?.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(pos[0], pos[1] - 0.12, pos[2]);
      dummy.rotation.set(0, idx * 0.6, 0);
      dummy.updateMatrix();
      fanBladesInstRef.current?.setMatrixAt(idx, dummy.matrix);
    });

    if (fanHousingInstRef.current) {
      fanHousingInstRef.current.instanceMatrix.needsUpdate = true;
      fanHousingInstRef.current.computeBoundingSphere();
    }
    if (fanBladesInstRef.current) {
      fanBladesInstRef.current.instanceMatrix.needsUpdate = true;
      fanBladesInstRef.current.computeBoundingSphere();
    }
  }, [ceilingFanPositions, deskCount]);

  // Daftar rak buku Perpustakaan (modul multi-part berulang dengan blok buku berwarna)
  const libraryBookRows = useMemo(() => {
    const mats = [
      furnMats.bookNavy,
      furnMats.bookTerracotta,
      furnMats.bookGreen,
      furnMats.bookOchre,
    ];
    const clusters: Array<{
      id: string;
      pos: [number, number, number];
      args: [number, number, number];
      mat: THREE.Material;
    }> = [];

    // Rak dinding utara (X: 28.5..35.0, Z: -34.9)
    [29.1, 30.8, 32.5, 34.2].forEach((bx, bayIdx) => {
      [0.45, 0.95, 1.45, 1.88].forEach((shelfY, sIdx) => {
        clusters.push({
          id: `lib_n_${bayIdx}_${sIdx}_a`,
          pos: [bx - 0.35, SCHOOL_LT1_Y + shelfY + 0.12, -34.86],
          args: [0.58, 0.24, 0.22],
          mat: mats[(bayIdx + sIdx) % mats.length],
        });
        clusters.push({
          id: `lib_n_${bayIdx}_${sIdx}_b`,
          pos: [bx + 0.32, SCHOOL_LT1_Y + shelfY + 0.11, -34.86],
          args: [0.52, 0.22, 0.22],
          mat: mats[(bayIdx + sIdx + 2) % mats.length],
        });
      });
    });

    // Rak dinding timur (X: 35.42, Z: -33.2..-26.4)
    [-33.0, -31.2, -29.4, -27.6].forEach((bz, bayIdx) => {
      [0.45, 0.95, 1.45, 1.88].forEach((shelfY, sIdx) => {
        clusters.push({
          id: `lib_e_${bayIdx}_${sIdx}_a`,
          pos: [35.38, SCHOOL_LT1_Y + shelfY + 0.12, bz - 0.32],
          args: [0.22, 0.24, 0.54],
          mat: mats[(bayIdx + sIdx + 1) % mats.length],
        });
        clusters.push({
          id: `lib_e_${bayIdx}_${sIdx}_b`,
          pos: [35.38, SCHOOL_LT1_Y + shelfY + 0.11, bz + 0.34],
          args: [0.22, 0.22, 0.56],
          mat: mats[(bayIdx + sIdx + 3) % mats.length],
        });
      });
    });

    return clusters;
  }, [furnMats]);

  return (
    <group name="sekolah_furniture_root">
      {/* =====================================================================
          1. RUANG RAPAT (LT 1, Y = -9.0m) — Meja Rapat Panjang, 6 Kursi Merah, Papan
         ===================================================================== */}
      <group name="furn_lt1_rapat">
        <group position={[12.75, SCHOOL_LT1_Y, -31.7]}>
          {/* Daun meja rapat mengilap & jalur kabel tengah */}
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow material={furnMats.conferenceTop}>
            <boxGeometry args={[4.6, 0.06, 1.45]} />
          </mesh>
          <mesh position={[0, 0.772, 0]} material={furnMats.chromeMetal}>
            <boxGeometry args={[3.8, 0.012, 0.14]} />
          </mesh>
          {/* Kaki pedestal baja ganda */}
          <mesh position={[-1.4, 0.36, 0]} castShadow material={furnMats.blackSteel}>
            <boxGeometry args={[0.16, 0.72, 0.95]} />
          </mesh>
          <mesh position={[1.4, 0.36, 0]} castShadow material={furnMats.blackSteel}>
            <boxGeometry args={[0.16, 0.72, 0.95]} />
          </mesh>
          {/* 6 Kursi putar sandaran merah (3 utara, 3 selatan) */}
          {[-1.45, 0, 1.45].map((cx) =>
            [-0.95, 0.95].map((cz) => {
              const rotY = cz < 0 ? 0 : Math.PI;
              return (
                <group key={`chair_rapat_${cx}_${cz}`} position={[cx, 0, cz]} rotation={[0, rotY, 0]}>
                  <mesh position={[0, 0.05, 0]} material={furnMats.chromeMetal}>
                    <cylinderGeometry args={[0.25, 0.28, 0.05, 8]} />
                  </mesh>
                  <mesh position={[0, 0.25, 0]} material={furnMats.chromeMetal}>
                    <cylinderGeometry args={[0.035, 0.035, 0.38, 8]} />
                  </mesh>
                  <mesh position={[0, 0.45, 0]} castShadow material={furnMats.blackSteel}>
                    <boxGeometry args={[0.46, 0.06, 0.44]} />
                  </mesh>
                  <mesh position={[0, 0.72, -0.2]} castShadow material={furnMats.redFabric}>
                    <boxGeometry args={[0.44, 0.46, 0.06]} />
                  </mesh>
                </group>
              );
            })
          )}
        </group>
        {/* Papan presentasi dinding barat Ruang Rapat */}
        <mesh position={[8.22, SCHOOL_LT1_Y + 1.55, -31.7]} material={furnMats.blackSteel}>
          <boxGeometry args={[0.04, 1.25, 2.3]} />
        </mesh>
        <mesh position={[8.25, SCHOOL_LT1_Y + 1.55, -31.7]} material={furnMats.whiteboardFace}>
          <boxGeometry args={[0.02, 1.15, 2.2]} />
        </mesh>
      </group>

      {/* =====================================================================
          2. RUANG KONSULTANSI (LT 1, Y = -9.0m) — Meja Kayu, 3 Kursi, Lemari Arsip
         ===================================================================== */}
      <group name="furn_lt1_konsultansi">
        <group position={[20.3, SCHOOL_LT1_Y, -32.2]}>
          {/* Meja konsultasi kayu oak & rangka putih */}
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow material={furnMats.oakWood}>
            <boxGeometry args={[1.55, 0.05, 0.82]} />
          </mesh>
          <mesh position={[-0.68, 0.36, 0]} castShadow material={furnMats.oakWood}>
            <boxGeometry args={[0.05, 0.72, 0.76]} />
          </mesh>
          <mesh position={[0.68, 0.36, 0]} castShadow material={furnMats.whiteSteel}>
            <boxGeometry args={[0.05, 0.72, 0.76]} />
          </mesh>
          <mesh position={[0, 0.5, 0.32]} material={furnMats.oakWood}>
            <boxGeometry args={[1.35, 0.42, 0.04]} />
          </mesh>
          {/* 2 kursi tamu berbingkai gelap di depan meja */}
          {[-0.38, 0.38].map((vx) => (
            <group key={`konsul_v_${vx}`} position={[vx, 0, 0.72]} rotation={[0, Math.PI, 0]}>
              <mesh position={[0, 0.44, 0]} castShadow material={furnMats.blackSteel}>
                <boxGeometry args={[0.44, 0.05, 0.42]} />
              </mesh>
              <mesh position={[0, 0.68, -0.19]} material={furnMats.blackSteel}>
                <boxGeometry args={[0.42, 0.4, 0.04]} />
              </mesh>
              <mesh position={[0, 0.22, 0]} material={furnMats.chromeMetal}>
                <boxGeometry args={[0.42, 0.42, 0.4]} />
              </mesh>
            </group>
          ))}
          {/* Kursi pembimbing di sisi belakang */}
          <group position={[0, 0, -0.7]}>
            <mesh position={[0, 0.45, 0]} material={furnMats.blackSteel}>
              <boxGeometry args={[0.48, 0.06, 0.46]} />
            </mesh>
            <mesh position={[0, 0.75, -0.21]} material={furnMats.blackSteel}>
              <boxGeometry args={[0.46, 0.52, 0.05]} />
            </mesh>
            <mesh position={[0, 0.22, 0]} material={furnMats.chromeMetal}>
              <cylinderGeometry args={[0.04, 0.22, 0.42, 8]} />
            </mesh>
          </group>
        </group>

        {/* Lemari arsip tinggi sudut barat laut */}
        <group position={[18.25, SCHOOL_LT1_Y, -34.65]}>
          <mesh position={[0, 0.94, 0]} castShadow receiveShadow material={furnMats.taupeCabinet}>
            <boxGeometry args={[0.96, 1.88, 0.58]} />
          </mesh>
          <mesh position={[0, 1.32, 0.3]} material={furnMats.creamCushion}>
            <boxGeometry args={[0.84, 0.72, 0.03]} />
          </mesh>
          <mesh position={[0, 0.46, 0.3]} material={furnMats.taupeCabinet}>
            <boxGeometry args={[0.84, 0.68, 0.04]} />
          </mesh>
        </group>
      </group>

      {/* =====================================================================
          3. RUANG MUSIK (LT 1, Y = -9.0m) — 4 Gitar Berwarna, Kajon, Amp, Keyboard
         ===================================================================== */}
      <group name="furn_lt1_musik">
        {/* Rak & alat musik utama di sisi utara */}
        <group position={[25.0, SCHOOL_LT1_Y, -34.45]}>
          {/* Alas kayu panjang dudukan gitar */}
          <mesh position={[0, 0.05, 0]} receiveShadow material={furnMats.darkOak}>
            <boxGeometry args={[2.2, 0.1, 0.55]} />
          </mesh>
          <mesh position={[0, 0.52, -0.22]} material={furnMats.blackSteel}>
            <boxGeometry args={[2.1, 0.05, 0.05]} />
          </mesh>
          {/* 4 Gitar akustik berwarna (kuning, kayu natural, putih, merah muda) */}
          {[
            { x: -0.78, mat: furnMats.guitarYellow },
            { x: -0.26, mat: furnMats.guitarSpruce },
            { x: 0.26, mat: furnMats.guitarWhite },
            { x: 0.78, mat: furnMats.guitarPink },
          ].map((g, idx) => (
            <group key={`guitar_${idx}`} position={[g.x, 0.1, 0]} rotation={[-0.14, 0, 0]}>
              {/* Badan gitar oval */}
              <mesh position={[0, 0.24, 0]} castShadow material={g.mat}>
                <boxGeometry args={[0.34, 0.44, 0.1]} />
              </mesh>
              {/* Lubang suara & bridge */}
              <mesh position={[0, 0.3, 0.055]} material={furnMats.blackSteel}>
                <cylinderGeometry args={[0.055, 0.055, 0.015, 12]} />
              </mesh>
              {/* Leher gitar & headstock */}
              <mesh position={[0, 0.66, 0]} material={furnMats.darkOak}>
                <boxGeometry args={[0.07, 0.44, 0.04]} />
              </mesh>
              <mesh position={[0, 0.92, 0]} material={g.mat}>
                <boxGeometry args={[0.1, 0.12, 0.045]} />
              </mesh>
            </group>
          ))}
          {/* Amplifier hitam di sisi kiri */}
          <group position={[-1.42, 0, 0.18]}>
            <mesh position={[0, 0.26, 0]} castShadow material={furnMats.blackSteel}>
              <boxGeometry args={[0.42, 0.52, 0.28]} />
            </mesh>
            <mesh position={[0, 0.26, 0.145]} material={furnMats.chromeMetal}>
              <boxGeometry args={[0.36, 0.42, 0.015]} />
            </mesh>
          </group>
          {/* Kotak Kajon kayu di sisi kanan */}
          <group position={[1.42, 0, 0.18]}>
            <mesh position={[0, 0.25, 0]} castShadow material={furnMats.blackSteel}>
              <boxGeometry args={[0.34, 0.5, 0.34]} />
            </mesh>
            <mesh position={[0, 0.25, 0.175]} material={furnMats.oakWood}>
              <boxGeometry args={[0.31, 0.46, 0.02]} />
            </mesh>
          </group>
          {/* Tas keyboard biru di depan gitar */}
          <mesh position={[0.05, 0.12, 0.48]} rotation={[0, 0.08, 0]} castShadow material={furnMats.gigBagBlue}>
            <boxGeometry args={[1.05, 0.22, 0.32]} />
          </mesh>
        </group>

        {/* Stand keyboard digital di sisi timur */}
        <group position={[26.6, SCHOOL_LT1_Y, -31.0]}>
          <mesh position={[0, 0.4, 0]} material={furnMats.blackSteel}>
            <boxGeometry args={[0.36, 0.72, 1.05]} />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow material={furnMats.blackSteel}>
            <boxGeometry args={[0.44, 0.1, 1.32]} />
          </mesh>
          <mesh position={[-0.08, 0.86, 0]} material={furnMats.guitarWhite}>
            <boxGeometry args={[0.2, 0.025, 1.2]} />
          </mesh>
        </group>
      </group>

      {/* =====================================================================
          4. PERPUSTAKAAN (LT 1, Y = -9.0m) — Rak Buku Keliling & 2 Meja Lesehan
         ===================================================================== */}
      <group name="furn_lt1_perpustakaan">
        {/* Kabinet rak buku dinding utara & timur */}
        <mesh position={[31.7, SCHOOL_LT1_Y + 1.06, -34.9]} castShadow receiveShadow material={furnMats.darkOak}>
          <boxGeometry args={[6.8, 2.12, 0.48]} />
        </mesh>
        <mesh position={[35.42, SCHOOL_LT1_Y + 1.06, -29.8]} castShadow receiveShadow material={furnMats.darkOak}>
          <boxGeometry args={[0.48, 2.12, 8.6]} />
        </mesh>
        {/* Papan sekat & blok buku warna-warni */}
        {libraryBookRows.map((b) => (
          <mesh key={b.id} position={b.pos} material={b.mat}>
            <boxGeometry args={b.args} />
          </mesh>
        ))}

        {/* 2 Meja belajar lesehan + 4 bantal duduk per meja */}
        {[-31.6, -28.4].map((tz) => (
          <group key={`perpus_table_${tz}`} position={[31.2, SCHOOL_LT1_Y, tz]}>
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={furnMats.darkOak}>
              <boxGeometry args={[2.1, 0.06, 1.25]} />
            </mesh>
            {[
              [-0.88, -0.48],
              [0.88, -0.48],
              [-0.88, 0.48],
              [0.88, 0.48],
            ].map(([lx, lz], i) => (
              <mesh key={`leg_${i}`} position={[lx, 0.19, lz]} material={furnMats.darkOak}>
                <boxGeometry args={[0.1, 0.38, 0.1]} />
              </mesh>
            ))}
            {/* Bantal duduk krem */}
            {[
              [-0.55, -0.82],
              [0.55, -0.82],
              [-0.55, 0.82],
              [0.55, 0.82],
            ].map(([cx, cz], idx) => (
              <mesh key={`cushion_${idx}`} position={[cx, 0.06, cz]} castShadow material={furnMats.creamCushion}>
                <boxGeometry args={[0.48, 0.12, 0.46]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* =====================================================================
          5. LAB KOMPUTER (LT 2, Y = -5.6m) — 16 Stasiun PC, Meja Instruktur, AC & Papan
         ===================================================================== */}
      <group name="furn_lt2_lab_komputer">
        {/* Papan tulis berdiri beroda di sisi barat */}
        <group position={[8.55, SCHOOL_LT2_Y, -31.6]}>
          <mesh position={[0, 1.35, 0]} material={furnMats.blackSteel}>
            <boxGeometry args={[0.08, 1.25, 2.4]} />
          </mesh>
          <mesh position={[0.05, 1.35, 0]} material={furnMats.whiteboardFace}>
            <boxGeometry args={[0.02, 1.15, 2.3]} />
          </mesh>
          <mesh position={[0, 0.38, -1.12]} material={furnMats.blackSteel}>
            <boxGeometry args={[0.48, 0.76, 0.06]} />
          </mesh>
          <mesh position={[0, 0.38, 1.12]} material={furnMats.blackSteel}>
            <boxGeometry args={[0.48, 0.76, 0.06]} />
          </mesh>
        </group>

        {/* Unit AC split di dinding utara */}
        <mesh position={[12.5, SCHOOL_LT2_Y + 2.75, -35.16]} material={furnMats.whiteSteel}>
          <boxGeometry args={[1.15, 0.3, 0.24]} />
        </mesh>

        {/* Meja instruktur depan */}
        <group position={[9.6, SCHOOL_LT2_Y, -29.3]}>
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow material={furnMats.oakWood}>
            <boxGeometry args={[1.45, 0.05, 0.78]} />
          </mesh>
          <mesh position={[-0.65, 0.36, 0]} material={furnMats.whiteSteel}>
            <boxGeometry args={[0.05, 0.72, 0.72]} />
          </mesh>
          <mesh position={[0.65, 0.36, 0]} material={furnMats.whiteSteel}>
            <boxGeometry args={[0.05, 0.72, 0.72]} />
          </mesh>
          <mesh position={[0, 0.94, -0.1]} material={furnMats.blackSteel}>
            <boxGeometry args={[0.46, 0.28, 0.04]} />
          </mesh>
        </group>

        {/* 4 Bank Meja Panjang PC (masing-masing 4 monitor, CPU tower, keyboard & kursi) */}
        {SCHOOL_LAB_BENCHES.map((bench) => (
          <group key={bench.id} position={[bench.centerX, bench.floorY, bench.centerZ]}>
            <mesh position={[0, 0.74, 0]} castShadow receiveShadow material={furnMats.oakWood}>
              <boxGeometry args={[5.2, 0.05, 0.78]} />
            </mesh>
            {[-2.48, 0, 2.48].map((lx) => (
              <mesh key={`leg_${lx}`} position={[lx, 0.36, 0]} material={furnMats.whiteSteel}>
                <boxGeometry args={[0.06, 0.72, 0.7]} />
              </mesh>
            ))}

            {bench.stationXs.map((sx) => {
              const localX = sx - bench.centerX;
              return (
                <group key={`pc_${sx}`} position={[localX, 0, 0]}>
                  {/* Dudukan & bingkai monitor */}
                  <mesh position={[0, 0.82, -0.14]} material={furnMats.blackSteel}>
                    <boxGeometry args={[0.08, 0.14, 0.08]} />
                  </mesh>
                  <mesh position={[0, 1.0, -0.12]} castShadow material={furnMats.blackSteel}>
                    <boxGeometry args={[0.56, 0.34, 0.04]} />
                  </mesh>
                  <mesh position={[0, 1.0, -0.095]} material={furnMats.monitorScreen}>
                    <boxGeometry args={[0.51, 0.29, 0.01]} />
                  </mesh>
                  {/* Keyboard */}
                  <mesh position={[0, 0.775, 0.14]} material={furnMats.blackSteel}>
                    <boxGeometry args={[0.38, 0.02, 0.14]} />
                  </mesh>
                  {/* Case PC Tower di bawah meja */}
                  <mesh position={[0.38, 0.24, -0.1]} material={furnMats.blackSteel}>
                    <boxGeometry args={[0.18, 0.42, 0.38]} />
                  </mesh>
                  {/* Kursi siswa kayu + rangka putih */}
                  <group position={[0, 0, 0.56]}>
                    <mesh position={[0, 0.44, 0]} castShadow material={furnMats.oakWood}>
                      <boxGeometry args={[0.4, 0.04, 0.38]} />
                    </mesh>
                    <mesh position={[0, 0.7, 0.17]} material={furnMats.oakWood}>
                      <boxGeometry args={[0.38, 0.28, 0.035]} />
                    </mesh>
                    <mesh position={[0, 0.22, 0]} material={furnMats.whiteSteel}>
                      <boxGeometry args={[0.38, 0.42, 0.36]} />
                    </mesh>
                  </group>
                </group>
              );
            })}
          </group>
        ))}
      </group>

      {/* =====================================================================
          6. RUANG KELAS 1 - 10 — Meja Guru, Papan Tulis, 60 Meja+Kursi Siswa & Kipas Plafon
         ===================================================================== */}
      {SCHOOL_CLASSROOM_FRONTS.map((front) => (
        <group key={`front_${front.roomId}`}>
          {/* Papan tulis putih bingkai hitam */}
          <group position={front.whiteboardPos} rotation={[0, front.whiteboardRotY, 0]}>
            <mesh material={furnMats.blackSteel}>
              <boxGeometry args={[3.15, 1.22, 0.05]} />
            </mesh>
            <mesh position={[0, 0, 0.03]} material={furnMats.whiteboardFace}>
              <boxGeometry args={[3.04, 1.12, 0.02]} />
            </mesh>
          </group>
          {/* Meja guru depan */}
          <group position={front.teacherDeskPos} rotation={[0, front.teacherDeskRotY, 0]}>
            <mesh position={[0, 0.74, 0]} castShadow receiveShadow material={furnMats.oakWood}>
              <boxGeometry args={[1.32, 0.05, 0.68]} />
            </mesh>
            <mesh position={[0, 0.48, 0.28]} material={furnMats.oakWood}>
              <boxGeometry args={[1.22, 0.44, 0.04]} />
            </mesh>
            <mesh position={[-0.6, 0.36, 0]} material={furnMats.whiteSteel}>
              <boxGeometry args={[0.05, 0.72, 0.62]} />
            </mesh>
            <mesh position={[0.6, 0.36, 0]} material={furnMats.whiteSteel}>
              <boxGeometry args={[0.05, 0.72, 0.62]} />
            </mesh>
            {/* Kursi guru */}
            <mesh position={[0, 0.44, -0.5]} material={furnMats.darkOak}>
              <boxGeometry args={[0.42, 0.05, 0.42]} />
            </mesh>
            <mesh position={[0, 0.72, -0.68]} material={furnMats.darkOak}>
              <boxGeometry args={[0.42, 0.34, 0.04]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* InstancedMesh untuk 60 Meja & Kursi Siswa di 10 Ruang Kelas */}
      {deskCount > 0 && (
        <group name="classroom_desks_instanced">
          <instancedMesh
            ref={deskTopInstRef}
            args={[undefined, undefined, deskCount]}
            material={furnMats.oakWood}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.78, 0.045, 0.52]} />
          </instancedMesh>
          <instancedMesh
            ref={deskFrontInstRef}
            args={[undefined, undefined, deskCount]}
            material={furnMats.oakWood}
          >
            <boxGeometry args={[0.72, 0.32, 0.035]} />
          </instancedMesh>
          <instancedMesh
            ref={deskFrameInstRef}
            args={[undefined, undefined, deskCount]}
            material={furnMats.whiteSteel}
          >
            <boxGeometry args={[0.72, 0.7, 0.46]} />
          </instancedMesh>
          <instancedMesh
            ref={chairSeatInstRef}
            args={[undefined, undefined, deskCount]}
            material={furnMats.oakWood}
            castShadow
          >
            <boxGeometry args={[0.4, 0.04, 0.38]} />
          </instancedMesh>
          <instancedMesh
            ref={chairBackInstRef}
            args={[undefined, undefined, deskCount]}
            material={furnMats.oakWood}
          >
            <boxGeometry args={[0.38, 0.28, 0.035]} />
          </instancedMesh>
          <instancedMesh
            ref={chairFrameInstRef}
            args={[undefined, undefined, deskCount]}
            material={furnMats.whiteSteel}
          >
            <boxGeometry args={[0.38, 0.42, 0.36]} />
          </instancedMesh>
        </group>
      )}

      {/* InstancedMesh untuk 20 Kipas Plafon Kelas */}
      {fanCount > 0 && (
        <group name="classroom_fans_instanced">
          <instancedMesh
            ref={fanHousingInstRef}
            args={[undefined, undefined, fanCount]}
            material={furnMats.whiteSteel}
          >
            <cylinderGeometry args={[0.14, 0.14, 0.22, 12]} />
          </instancedMesh>
          <instancedMesh
            ref={fanBladesInstRef}
            args={[undefined, undefined, fanCount]}
            material={furnMats.whiteSteel}
          >
            <boxGeometry args={[0.76, 0.025, 0.14]} />
          </instancedMesh>
        </group>
      )}

      {/* =====================================================================
          7. TARGET RAYCAST INTERAKSI INTERIOR (Layer 1, klik kiri / E)
         ===================================================================== */}
      <group name="school_interior_interactables_root">
        {SCHOOL_INTERIOR_INTERACTABLES.map((item) => (
          <InteractiveProxyBox key={item.id} item={item} />
        ))}
      </group>
    </group>
  );
}
