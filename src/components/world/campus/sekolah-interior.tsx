"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  SCHOOL_CLEAR_HEIGHT,
  SCHOOL_FLOOR_SLABS,
  SCHOOL_LT1_Y,
  SCHOOL_LT2_Y,
  SCHOOL_LT3_Y,
  SCHOOL_MAIN_ENTRANCE,
  SCHOOL_ROOF_CEILING_SLABS,
  SCHOOL_ROOMS,
  SCHOOL_STAIR_RAMPS,
  SCHOOL_WALL_SEGMENTS,
  SchoolRoomDefinition,
  SchoolWallSegment,
} from '@/lib/world/school-interior-layout';
import { CAMPUS_PALETTE, DESIGN_TOKENS } from '@/lib/world/campus-palette';
import { SekolahFurniture } from './sekolah-furniture';

interface SekolahInteriorProps {
  materials: Record<string, THREE.Material>;
  cutawayMode?: boolean;
  showLabels?: boolean;
}

interface DoorPlaqueProps {
  room: SchoolRoomDefinition;
}

function RoomDoorPlaque({ room }: DoorPlaqueProps) {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = DESIGN_TOKENS.night;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = DESIGN_TOKENS.fluor;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    ctx.fillStyle = DESIGN_TOKENS.fluor;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(room.name.toUpperCase(), canvas.width / 2, 34);

    ctx.fillStyle = DESIGN_TOKENS.caution;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`LT ${room.floorLevel} · KONSEPTUAL`, canvas.width / 2, 68);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [room.name, room.floorLevel]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  const [dx, dy, dz] = room.doorPosition;
  const isSouthFacing = room.doorFacing === 'south';
  const pos: [number, number, number] = isSouthFacing
    ? [dx, dy + 2.68, dz + 0.13]
    : [dx - 0.13, dy + 2.68, dz];
  const rotY = isSouthFacing ? 0 : -Math.PI / 2;

  return (
    <mesh position={pos} rotation={[0, rotY, 0]}>
      <planeGeometry args={[1.05, 0.39]} />
      <meshStandardMaterial map={texture} roughness={0.5} metalness={0.05} />
    </mesh>
  );
}

function EntranceHeaderSign() {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = DESIGN_TOKENS.night;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = DESIGN_TOKENS.caution;
    ctx.lineWidth = 5;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    ctx.fillStyle = DESIGN_TOKENS.fluor;
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PINTU MASUK SEKOLAH', canvas.width / 2, 42);

    ctx.fillStyle = DESIGN_TOKENS.caution;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('GEDUNG SEKOLAH · DENAH KONSEPTUAL', canvas.width / 2, 82);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  const centerX = (SCHOOL_MAIN_ENTRANCE.minX + SCHOOL_MAIN_ENTRANCE.maxX) * 0.5;
  return (
    <mesh
      position={[centerX, SCHOOL_MAIN_ENTRANCE.y + 2.75, SCHOOL_MAIN_ENTRANCE.z + 0.32]}
      rotation={[0, 0, 0]}
    >
      <planeGeometry args={[2.6, 0.57]} />
      <meshStandardMaterial map={texture} roughness={0.45} metalness={0.05} />
    </mesh>
  );
}

function ExteriorWallWithWindows({
  seg,
  wallMat,
  brickMat,
  glassMat,
  frameMat,
}: {
  seg: SchoolWallSegment;
  wallMat: THREE.Material;
  brickMat: THREE.Material;
  glassMat: THREE.Material;
  frameMat: THREE.Material;
}) {
  const width = seg.maxX - seg.minX;
  const depth = seg.maxZ - seg.minZ;
  const height = seg.maxY - seg.minY;
  const cx = (seg.minX + seg.maxX) * 0.5;
  const cz = (seg.minZ + seg.maxZ) * 0.5;

  const isHorizontal = width >= depth;
  const span = isHorizontal ? width : depth;
  const wallT = isHorizontal ? depth : width;
  const bayCount = Math.max(2, Math.floor(span / 4.2));
  const baySpan = span / bayCount;
  const sillH = 0.98;
  const windowH = 1.42;
  const headerH = Math.max(0.4, height - sillH - windowH);
  const mullionW = 0.55;
  const glassW = Math.max(0.8, baySpan - mullionW * 2);

  return (
    <group name={seg.id}>
      {/* Bagian bawah tembok (sill apron 0..0.98m) */}
      <mesh
        position={[cx, seg.minY + sillH * 0.5, cz]}
        castShadow
        receiveShadow
        material={wallMat}
      >
        <boxGeometry
          args={isHorizontal ? [width, sillH, wallT] : [wallT, sillH, depth]}
        />
      </mesh>

      {/* Balok atas (lintel 2.40..3.20m) */}
      <mesh
        position={[cx, seg.maxY - headerH * 0.5, cz]}
        castShadow
        receiveShadow
        material={wallMat}
      >
        <boxGeometry
          args={isHorizontal ? [width, headerH, wallT] : [wallT, headerH, depth]}
        />
      </mesh>

      {/* Modul jendela + kolom pemisah + aksen bata terakota di bawah kusen */}
      {Array.from({ length: bayCount }).map((_, idx) => {
        const localOffset = -span * 0.5 + (idx + 0.5) * baySpan;
        const bx = isHorizontal ? cx + localOffset : cx;
        const bz = isHorizontal ? cz : cz + localOffset;
        const winY = seg.minY + sillH + windowH * 0.5;

        return (
          <group key={`${seg.id}_bay_${idx}`}>
            {/* Kolom kiri segmen */}
            <mesh
              position={[
                isHorizontal ? bx - baySpan * 0.5 + mullionW * 0.5 : bx,
                winY,
                isHorizontal ? bz : bz - baySpan * 0.5 + mullionW * 0.5,
              ]}
              castShadow
              receiveShadow
              material={wallMat}
            >
              <boxGeometry
                args={
                  isHorizontal
                    ? [mullionW, windowH, wallT]
                    : [wallT, windowH, mullionW]
                }
              />
            </mesh>

            {/* Kolom kanan segmen */}
            <mesh
              position={[
                isHorizontal ? bx + baySpan * 0.5 - mullionW * 0.5 : bx,
                winY,
                isHorizontal ? bz : bz + baySpan * 0.5 - mullionW * 0.5,
              ]}
              castShadow
              receiveShadow
              material={wallMat}
            >
              <boxGeometry
                args={
                  isHorizontal
                    ? [mullionW, windowH, wallT]
                    : [wallT, windowH, mullionW]
                }
              />
            </mesh>

            {/* Aksen spandrel bata terakota di sisi luar bawah jendela */}
            <mesh
              position={[
                isHorizontal ? bx : bx + (seg.minX > 30 ? 0.03 : -0.03),
                seg.minY + sillH * 0.52,
                isHorizontal ? bz + (seg.minZ < -30 ? -0.03 : 0.03) : bz,
              ]}
              material={brickMat}
            >
              <boxGeometry
                args={
                  isHorizontal
                    ? [glassW * 0.88, sillH * 0.72, wallT + 0.04]
                    : [wallT + 0.04, sillH * 0.72, glassW * 0.88]
                }
              />
            </mesh>

            {/* Kusen gelap & kaca jendela tipis */}
            <mesh position={[bx, winY, bz]} material={frameMat}>
              <boxGeometry
                args={
                  isHorizontal
                    ? [glassW, 0.07, wallT * 0.85]
                    : [wallT * 0.85, 0.07, glassW]
                }
              />
            </mesh>
            <mesh position={[bx, winY, bz]} material={glassMat}>
              <boxGeometry
                args={
                  isHorizontal
                    ? [glassW * 0.94, windowH - 0.08, 0.04]
                    : [0.04, windowH - 0.08, glassW * 0.94]
                }
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function SekolahInterior({
  materials,
  cutawayMode = false,
}: SekolahInteriorProps) {
  const picketMeshRef = useRef<THREE.InstancedMesh>(null);

  const interiorMaterials = useMemo(() => {
    return {
      tileFloor: new THREE.MeshStandardMaterial({
        color: '#cdd5dc',
        roughness: 0.72,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
      ceilingSoffit: new THREE.MeshStandardMaterial({
        color: '#dde2e7',
        roughness: 0.86,
        metalness: 0.02,
      }),
      frostedGlass: new THREE.MeshPhysicalMaterial({
        color: '#a8c2cf',
        roughness: 0.24,
        metalness: 0.05,
        transparent: true,
        opacity: 0.42,
      }),
      stairTread: new THREE.MeshStandardMaterial({
        color: CAMPUS_PALETTE.landscape.stairs,
        roughness: 0.78,
        metalness: 0.05,
      }),
      lampTube: new THREE.MeshStandardMaterial({
        color: DESIGN_TOKENS.fluor,
        emissive: DESIGN_TOKENS.fluor,
        emissiveIntensity: 0.95,
        roughness: 0.2,
      }),
      doorHeaderWall: new THREE.MeshStandardMaterial({
        color: CAMPUS_PALETTE.architecture.wallWhite,
        roughness: 0.74,
        metalness: 0.03,
      }),
      windowGlassClear: new THREE.MeshPhysicalMaterial({
        color: '#7da0b5',
        roughness: 0.16,
        metalness: 0.12,
        transparent: true,
        opacity: 0.36,
      }),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(interiorMaterials).forEach((m) => m.dispose());
    };
  }, [interiorMaterials]);

  // Hitung tiang jeruji railing balkon + pembatas tengah tangga U (InstancedMesh untuk performa)
  const picketMatrices = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    SCHOOL_WALL_SEGMENTS.forEach((seg) => {
      if (seg.kind !== 'railing') return;
      const width = seg.maxX - seg.minX;
      const depth = seg.maxZ - seg.minZ;
      const height = seg.maxY - seg.minY;
      const isHorizontal = width >= depth;
      const span = isHorizontal ? width : depth;
      const count = Math.max(2, Math.floor(span / 0.36));
      const step = span / count;

      for (let i = 0; i <= count; i++) {
        const px = isHorizontal ? seg.minX + i * step : (seg.minX + seg.maxX) * 0.5;
        const pz = isHorizontal ? (seg.minZ + seg.maxZ) * 0.5 : seg.minZ + i * step;
        dummy.position.set(px, seg.minY + height * 0.5, pz);
        dummy.scale.set(1, height, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
    });

    return matrices;
  }, []);

  useEffect(() => {
    const mesh = picketMeshRef.current;
    if (!mesh) return;
    picketMatrices.forEach((mat, i) => {
      mesh.setMatrixAt(i, mat);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [picketMatrices]);

  // Daftar lintel pintu di atas bukaan 1.8m setiap ruangan (di atas tinggi kepala 2.25..3.2m)
  const roomDoorHeaders = useMemo(() => {
    return SCHOOL_ROOMS.map((room) => {
      const [dx, dy, dz] = room.doorPosition;
      const isSouth = room.doorFacing === 'south';
      const headerHeight = SCHOOL_CLEAR_HEIGHT - 2.25;
      const yCenter = dy + 2.25 + headerHeight * 0.5;
      return {
        id: `door_portal_${room.id}`,
        room,
        isSouth,
        pos: [dx, yCenter, dz] as [number, number, number],
        args: (isSouth ? [1.84, headerHeight, 0.2] : [0.2, headerHeight, 1.84]) as [
          number,
          number,
          number,
        ],
        jambA: (isSouth ? [dx - 0.88, dy + 1.125, dz] : [dx, dy + 1.125, dz - 0.88]) as [
          number,
          number,
          number,
        ],
        jambB: (isSouth ? [dx + 0.88, dy + 1.125, dz] : [dx, dy + 1.125, dz + 0.88]) as [
          number,
          number,
          number,
        ],
        jambArgs: (isSouth ? [0.08, 2.25, 0.22] : [0.22, 2.25, 0.08]) as [number, number, number],
      };
    });
  }, []);

  // Deretan pilar & lengkungan bata terakota selasar LT 1 menghadap lapangan
  const lt1ArcadeBays = useMemo(() => {
    const northPierXs = [8.22, 11.27, 14.73, 18.15, 21.6, 25.0];
    const northLintels = [
      { minX: 8.22, maxX: 11.27, isEntrance: false },
      { minX: 11.27, maxX: 14.73, isEntrance: true },
      { minX: 14.73, maxX: 18.15, isEntrance: false },
      { minX: 18.15, maxX: 21.6, isEntrance: false },
      { minX: 21.6, maxX: 25.0, isEntrance: false },
    ];
    const eastPierZs = [-24.5, -20.5, -16.25, -12.0, -7.75, -3.7];
    const eastLintels = [
      { minZ: -24.5, maxZ: -20.5 },
      { minZ: -20.5, maxZ: -16.25 },
      { minZ: -16.25, maxZ: -12.0 },
      { minZ: -12.0, maxZ: -7.75 },
      { minZ: -7.75, maxZ: -3.7 },
    ];
    return { northPierXs, northLintels, eastPierZs, eastLintels };
  }, []);

  // Titik lampu neon koridor LT 1..3
  const ceilingLights = useMemo(() => {
    const lights: Array<{ id: string; pos: [number, number, number]; rotY: number }> = [];
    [SCHOOL_LT1_Y, SCHOOL_LT2_Y, SCHOOL_LT3_Y].forEach((floorY, fIdx) => {
      const y = floorY + SCHOOL_CLEAR_HEIGHT - 0.04;
      [12.0, 20.0, 26.25].forEach((x, idx) => {
        lights.push({ id: `light_n_${fIdx}_${idx}`, pos: [x, y, -25.75], rotY: 0 });
      });
      [-18.0, -10.0].forEach((z, idx) => {
        lights.push({ id: `light_e_${fIdx}_${idx}`, pos: [26.25, y, z], rotY: Math.PI / 2 });
      });
      // Lampu di tengah ruang utama
      lights.push(
        { id: `light_room_nw_${fIdx}`, pos: [13.0, y, -31.25], rotY: 0 },
        { id: `light_room_ne_${fIdx}`, pos: [22.5, y, -31.25], rotY: 0 },
        { id: `light_room_lib_${fIdx}`, pos: [31.75, y, -30.0], rotY: 0 },
        { id: `light_room_k1_${fIdx}`, pos: [31.75, y, -16.25], rotY: 0 },
        { id: `light_room_k2_${fIdx}`, pos: [31.75, y, -7.75], rotY: 0 }
      );
    });
    return lights;
  }, []);

  return (
    <group name="sekolah_interior_shell">
      {/* 1. Pelat Lantai Berjalan LT 1, LT 2, LT 3 (dengan lubang void tangga) */}
      {SCHOOL_FLOOR_SLABS.map((slab) => {
        const w = slab.maxX - slab.minX;
        const d = slab.maxZ - slab.minZ;
        const cx = (slab.minX + slab.maxX) * 0.5;
        const cz = (slab.minZ + slab.maxZ) * 0.5;
        return (
          <group key={slab.id}>
            <mesh
              position={[cx, slab.y - slab.thickness * 0.5, cz]}
              receiveShadow
              castShadow
              material={interiorMaterials.tileFloor}
            >
              <boxGeometry args={[w, slab.thickness, d]} />
            </mesh>
            {slab.floorLevel > 1 && (
              <mesh
                position={[cx, slab.y - slab.thickness - 0.01, cz]}
                material={interiorMaterials.ceilingSoffit}
              >
                <boxGeometry args={[w, 0.02, d]} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Langit-langit atas LT 3 */}
      {!cutawayMode &&
        SCHOOL_ROOF_CEILING_SLABS.map((ceil) => {
          const w = ceil.maxX - ceil.minX;
          const d = ceil.maxZ - ceil.minZ;
          const cx = (ceil.minX + ceil.maxX) * 0.5;
          const cz = (ceil.minZ + ceil.maxZ) * 0.5;
          return (
            <mesh
              key={ceil.id}
              position={[cx, ceil.y - ceil.thickness * 0.5, cz]}
              material={interiorMaterials.ceilingSoffit}
            >
              <boxGeometry args={[w, ceil.thickness, d]} />
            </mesh>
          );
        })}

      {/* 2. Dinding Eksterior, Partisi Ruangan, Partisi Kaca Rapat & Curbs */}
      {SCHOOL_WALL_SEGMENTS.map((seg) => {
        const w = seg.maxX - seg.minX;
        const d = seg.maxZ - seg.minZ;
        const h = seg.maxY - seg.minY;
        const cx = (seg.minX + seg.maxX) * 0.5;
        const cy = (seg.minY + seg.maxY) * 0.5;
        const cz = (seg.minZ + seg.maxZ) * 0.5;

        if (seg.kind === 'exterior' && seg.hasWindow) {
          return (
            <ExteriorWallWithWindows
              key={seg.id}
              seg={seg}
              wallMat={materials.wallWhite}
              brickMat={materials.terracottaBrick}
              glassMat={interiorMaterials.windowGlassClear}
              frameMat={materials.metalRailing}
            />
          );
        }

        if (seg.kind === 'exterior' || seg.kind === 'partition') {
          return (
            <group key={seg.id}>
              <mesh
                position={[cx, cy, cz]}
                castShadow
                receiveShadow
                material={materials.wallWhite}
              >
                <boxGeometry args={[w, h, d]} />
              </mesh>
              {/* List plinth dasar dinding interior */}
              <mesh
                position={[cx, seg.minY + 0.04, cz]}
                material={materials.metalRailing}
              >
                <boxGeometry args={[w + 0.015, 0.08, d + 0.015]} />
              </mesh>
            </group>
          );
        }

        if (seg.kind === 'glass_partition') {
          const sillH = 0.95;
          const glassH = 1.4;
          const topH = Math.max(0.3, h - sillH - glassH);
          return (
            <group key={seg.id}>
              <mesh
                position={[cx, seg.minY + sillH * 0.5, cz]}
                castShadow
                receiveShadow
                material={materials.wallWhite}
              >
                <boxGeometry args={[w, sillH, d]} />
              </mesh>
              <mesh
                position={[cx, seg.minY + sillH + glassH * 0.5, cz]}
                material={interiorMaterials.frostedGlass}
              >
                <boxGeometry args={[w, glassH, d * 0.35]} />
              </mesh>
              <mesh
                position={[cx, seg.maxY - topH * 0.5, cz]}
                castShadow
                receiveShadow
                material={materials.wallWhite}
              >
                <boxGeometry args={[w, topH, d]} />
              </mesh>
              <mesh
                position={[cx, seg.minY + sillH + 0.03, cz]}
                material={materials.metalRailing}
              >
                <boxGeometry args={[w, 0.05, d * 0.9]} />
              </mesh>
            </group>
          );
        }

        if (seg.kind === 'arch_curb') {
          return (
            <group key={seg.id}>
              <mesh
                position={[cx, seg.minY + h * 0.42, cz]}
                castShadow
                receiveShadow
                material={materials.terracottaBrick}
              >
                <boxGeometry args={[w, h * 0.84, d + 0.14]} />
              </mesh>
              <mesh
                position={[cx, seg.maxY - 0.08, cz]}
                receiveShadow
                material={materials.concreteCurb}
              >
                <boxGeometry args={[w + 0.02, 0.14, d + 0.18]} />
              </mesh>
            </group>
          );
        }

        if (seg.kind === 'railing') {
          return (
            <group key={seg.id}>
              {/* Pegangan tangan atas & rel bawah */}
              <mesh
                position={[cx, seg.maxY - 0.03, cz]}
                castShadow
                material={materials.metalRailing}
              >
                <boxGeometry args={[Math.max(w, 0.06), 0.06, Math.max(d, 0.06)]} />
              </mesh>
              <mesh
                position={[cx, seg.minY + 0.09, cz]}
                material={materials.metalRailing}
              >
                <boxGeometry args={[Math.max(w, 0.04), 0.04, Math.max(d, 0.04)]} />
              </mesh>
            </group>
          );
        }

        return null;
      })}

      {/* Jeruji vertikal railing balkon & tangga (InstancedMesh tunggal) */}
      {picketMatrices.length > 0 && (
        <instancedMesh
          ref={picketMeshRef}
          args={[undefined, undefined, picketMatrices.length]}
          material={materials.metalRailing}
        >
          <boxGeometry args={[0.035, 1, 0.035]} />
        </instancedMesh>
      )}

      {/* 3. Lengkungan Bata Terakota Selasar LT 1 & Pintu Masuk Sekolah */}
      {lt1ArcadeBays.northPierXs.map((px, i) => (
        <mesh
          key={`lt1_pier_n_${i}`}
          position={[px, SCHOOL_LT1_Y + SCHOOL_CLEAR_HEIGHT * 0.5, -24.5]}
          castShadow
          receiveShadow
          material={materials.wallWhite}
        >
          <boxGeometry args={[0.45, SCHOOL_CLEAR_HEIGHT, 0.45]} />
        </mesh>
      ))}
      {lt1ArcadeBays.northLintels.map((bay, i) => {
        const w = bay.maxX - bay.minX - 0.45;
        const cx = (bay.minX + bay.maxX) * 0.5;
        return (
          <mesh
            key={`lt1_lintel_n_${i}`}
            position={[cx, SCHOOL_LT1_Y + SCHOOL_CLEAR_HEIGHT - 0.45, -24.5]}
            castShadow
            material={bay.isEntrance ? materials.wallWhite : materials.terracottaBrick}
          >
            <boxGeometry args={[w, 0.9, 0.42]} />
          </mesh>
        );
      })}

      {lt1ArcadeBays.eastPierZs.map((pz, i) => (
        <mesh
          key={`lt1_pier_e_${i}`}
          position={[25.0, SCHOOL_LT1_Y + SCHOOL_CLEAR_HEIGHT * 0.5, pz]}
          castShadow
          receiveShadow
          material={materials.wallWhite}
        >
          <boxGeometry args={[0.45, SCHOOL_CLEAR_HEIGHT, 0.45]} />
        </mesh>
      ))}
      {lt1ArcadeBays.eastLintels.map((bay, i) => {
        const d = bay.maxZ - bay.minZ - 0.45;
        const cz = (bay.minZ + bay.maxZ) * 0.5;
        return (
          <mesh
            key={`lt1_lintel_e_${i}`}
            position={[25.0, SCHOOL_LT1_Y + SCHOOL_CLEAR_HEIGHT - 0.45, cz]}
            castShadow
            material={materials.terracottaBrick}
          >
            <boxGeometry args={[0.42, 0.9, d]} />
          </mesh>
        );
      })}

      <EntranceHeaderSign />

      {/* 4. Kusen Pintu, Balok Atas Pintu & Papan Nama Ruangan (KONSEPTUAL) */}
      {roomDoorHeaders.map((door) => (
        <group key={door.id}>
          <mesh
            position={door.pos}
            castShadow
            receiveShadow
            material={interiorMaterials.doorHeaderWall}
          >
            <boxGeometry args={door.args} />
          </mesh>
          <mesh position={door.jambA} material={materials.doorWood}>
            <boxGeometry args={door.jambArgs} />
          </mesh>
          <mesh position={door.jambB} material={materials.doorWood}>
            <boxGeometry args={door.jambArgs} />
          </mesh>
          <RoomDoorPlaque room={door.room} />
        </group>
      ))}

      {/* 5. Tangga Tipe U Konsisten di dalam sekolah_stair_core (LT 1 <-> LT 2 <-> LT 3) */}
      {SCHOOL_STAIR_RAMPS.map((ramp) => {
        const laneDepth = ramp.maxZ - ramp.minZ;
        const cz = (ramp.minZ + ramp.maxZ) * 0.5;
        if (ramp.stepsCount <= 1) {
          // Bordes tengah tangga
          const w = Math.abs(ramp.endX - ramp.startX);
          const cx = (ramp.startX + ramp.endX) * 0.5;
          return (
            <mesh
              key={ramp.id}
              position={[cx, ramp.startY - 0.1, cz]}
              castShadow
              receiveShadow
              material={interiorMaterials.stairTread}
            >
              <boxGeometry args={[w, 0.2, laneDepth]} />
            </mesh>
          );
        }

        const totalDx = ramp.endX - ramp.startX;
        const totalDy = ramp.endY - ramp.startY;
        const stepDx = totalDx / ramp.stepsCount;
        const stepDy = totalDy / ramp.stepsCount;
        const stepWidth = Math.abs(stepDx) + 0.04;
        const railLength = Math.hypot(totalDx, totalDy);
        const railAngle = Math.atan2(totalDy, Math.abs(totalDx));
        const signDir = totalDx >= 0 ? 1 : -1;

        return (
          <group key={ramp.id}>
            {Array.from({ length: ramp.stepsCount }).map((_, idx) => {
              const stepTopY = ramp.startY + (idx + 1) * stepDy;
              const stepCx = ramp.startX + (idx + 0.5) * stepDx;
              const riserH = Math.abs(stepDy) + 0.12;
              return (
                <mesh
                  key={`${ramp.id}_step_${idx}`}
                  position={[stepCx, stepTopY - riserH * 0.5, cz]}
                  castShadow
                  receiveShadow
                  material={interiorMaterials.stairTread}
                >
                  <boxGeometry args={[stepWidth, riserH, laneDepth - 0.04]} />
                </mesh>
              );
            })}

            {/* Pegangan tangga miring sisi luar */}
            <mesh
              position={[
                (ramp.startX + ramp.endX) * 0.5,
                (ramp.startY + ramp.endY) * 0.5 + 0.88,
                ramp.lane === 'north_up' ? ramp.minZ + 0.06 : ramp.maxZ - 0.06,
              ]}
              rotation={[0, 0, signDir * railAngle]}
              material={materials.metalRailing}
            >
              <boxGeometry args={[railLength, 0.05, 0.05]} />
            </mesh>
          </group>
        );
      })}

      {/* 6. Lampu Neon Langit-langit & Pencahayaan Isi Interior (Tanpa Bayangan Tambahan) */}
      {ceilingLights.map((l) => (
        <group key={l.id} position={l.pos} rotation={[0, l.rotY, 0]}>
          <mesh material={interiorMaterials.lampTube}>
            <boxGeometry args={[1.25, 0.05, 0.14]} />
          </mesh>
        </group>
      ))}

      <pointLight
        position={[18.0, SCHOOL_LT1_Y + 2.8, -28.0]}
        color="#edf4e8"
        intensity={8.5}
        distance={22}
        decay={1.8}
        castShadow={false}
      />
      <pointLight
        position={[30.5, SCHOOL_LT1_Y + 2.8, -14.5]}
        color="#edf4e8"
        intensity={8.0}
        distance={22}
        decay={1.8}
        castShadow={false}
      />
      <pointLight
        position={[18.0, SCHOOL_LT2_Y + 2.8, -28.0]}
        color="#edf4e8"
        intensity={8.5}
        distance={22}
        decay={1.8}
        castShadow={false}
      />
      <pointLight
        position={[30.5, SCHOOL_LT2_Y + 2.8, -14.5]}
        color="#edf4e8"
        intensity={8.0}
        distance={22}
        decay={1.8}
        castShadow={false}
      />
      <pointLight
        position={[18.0, SCHOOL_LT3_Y + 2.8, -28.0]}
        color="#edf4e8"
        intensity={8.5}
        distance={22}
        decay={1.8}
        castShadow={false}
      />
      <pointLight
        position={[30.5, SCHOOL_LT3_Y + 2.8, -14.5]}
        color="#edf4e8"
        intensity={8.0}
        distance={22}
        decay={1.8}
        castShadow={false}
      />

      {/* 7. Furnitur & Objek Interaktif Ruangan (Tahap B, source: konseptual) */}
      <SekolahFurniture />
    </group>
  );
}
