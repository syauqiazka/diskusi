"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CAMPUS_LAYOUT,
  BuildingDefinition,
  PathwaySegment,
  LandscapeStairsDefinition,
  SafetyRailingSegment,
} from '@/lib/world/campus-layout';
import { CAMPUS_PALETTE } from '@/lib/world/campus-palette';
import { removeLabelCandidate, updateLabelCandidate } from '@/lib/world/label-budget';
import { getTerrainHeight } from '@/lib/world/terrain';
import {
  createPaverWalkwayTexture,
  createRiverStoneTexture,
  createSportsNetTexture,
} from '@/lib/world/procedural-textures';
import { CampusTerrain } from './campus-terrain';
import { SekolahInterior } from './sekolah-interior';

const _labelWorldPos = new THREE.Vector3();

/**
 * Membangun geometri atap limas (hipped roof) proporsional yang rapat pada bidang bawahnya.
 */
function createHippedRoofGeometry(width: number, depth: number, height: number): THREE.BufferGeometry {
  const hw = width / 2;
  const hd = depth / 2;

  const bl: [number, number, number] = [-hw, 0, hd];
  const br: [number, number, number] = [hw, 0, hd];
  const tr: [number, number, number] = [hw, 0, -hd];
  const tl: [number, number, number] = [-hw, 0, -hd];

  const verts: number[] = [];
  const pushTri = (a: [number, number, number], b: [number, number, number], c: [number, number, number]) => {
    verts.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };

  if (width >= depth) {
    const ridgeHalf = (width - depth) * 0.5;
    const rL: [number, number, number] = [-ridgeHalf, height, 0];
    const rR: [number, number, number] = [ridgeHalf, height, 0];

    // Sisi selatan & utara (trapesium)
    pushTri(bl, br, rR);
    pushTri(bl, rR, rL);
    pushTri(tr, tl, rL);
    pushTri(tr, rL, rR);

    // Sisi barat & timur (segitiga)
    pushTri(tl, bl, rL);
    pushTri(br, tr, rR);
  } else {
    const ridgeHalf = (depth - width) * 0.5;
    const rF: [number, number, number] = [0, height, ridgeHalf];
    const rB: [number, number, number] = [0, height, -ridgeHalf];

    // Sisi barat & timur (trapesium)
    pushTri(tl, bl, rF);
    pushTri(tl, rF, rB);
    pushTri(br, tr, rB);
    pushTri(br, rB, rF);

    // Sisi selatan & utara (segitiga)
    pushTri(bl, br, rF);
    pushTri(tr, tl, rB);
  }

  // Pelat penutup bawah agar solid
  pushTri(bl, tl, tr);
  pushTri(bl, tr, br);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geom.computeVertexNormals();
  return geom;
}

function HippedRoof({
  width,
  depth,
  height,
  material,
  position = [0, 0, 0],
}: {
  width: number;
  depth: number;
  height: number;
  material: THREE.Material;
  position?: [number, number, number];
}) {
  const geom = useMemo(() => createHippedRoofGeometry(width, depth, height), [width, depth, height]);

  useEffect(() => {
    return () => geom.dispose();
  }, [geom]);

  return <mesh position={position} geometry={geom} material={material} castShadow receiveShadow />;
}

// Label 3D terpadu sesuai token DESIGN.md dengan pembatasan jarak & jumlah tampil serentak
function DistanceLimitedSpriteLabel({
  labelId,
  text,
  position,
  isConceptual = false,
  baseWidth = 4.2,
  maxDistance = 135,
}: {
  labelId: string;
  text: string;
  position: [number, number, number];
  isConceptual?: boolean;
  baseWidth?: number;
  maxDistance?: number;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const frameCounterRef = useRef(0);
  const { camera } = useThree();

  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = isConceptual ? 116 : 96;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pad = 6;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;

    ctx.fillStyle = CAMPUS_PALETTE.labels.bg;
    ctx.fillRect(pad, pad, w, h);

    ctx.strokeStyle = CAMPUS_PALETTE.labels.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(pad, pad, w, h);

    ctx.fillStyle = CAMPUS_PALETTE.labels.text;
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, isConceptual ? 42 : canvas.height / 2);

    if (isConceptual) {
      ctx.fillStyle = CAMPUS_PALETTE.labels.conceptualTag;
      ctx.font = 'bold 18px monospace';
      ctx.fillText('KONSEPTUAL', canvas.width / 2, 82);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [text, isConceptual]);

  useEffect(() => {
    return () => {
      texture?.dispose();
      removeLabelCandidate(labelId);
    };
  }, [texture, labelId]);

  useFrame(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;
    frameCounterRef.current += 1;
    sprite.getWorldPosition(_labelWorldPos);
    const distSq = camera.position.distanceToSquared(_labelWorldPos);
    const allowed =
      distSq <= maxDistance * maxDistance &&
      updateLabelCandidate(labelId, distSq, frameCounterRef.current);
    sprite.visible = allowed;
    if (allowed) {
      const dist = Math.sqrt(distSq);
      const scaleFactor = THREE.MathUtils.clamp(dist / 22, 0.72, 2.2);
      const aspect = isConceptual ? 116 / 512 : 96 / 512;
      sprite.scale.set(baseWidth * scaleFactor, baseWidth * aspect * scaleFactor, 1);
    }
  });

  if (!texture) return null;

  return (
    <sprite ref={spriteRef} position={position} scale={[baseWidth, baseWidth * (isConceptual ? 116 / 512 : 96 / 512), 1]}>
      <spriteMaterial
        map={texture}
        transparent
        depthTest={true}
        depthWrite={false}
      />
    </sprite>
  );
}

interface CampusBlockoutProps {
  showLabels?: boolean;
  cutawayMode?: boolean;
}

export function CampusBlockout({ showLabels = true, cutawayMode = false }: CampusBlockoutProps) {
  const clippingPlanes = useMemo(() => {
    if (!cutawayMode) return [];
    return [new THREE.Plane(new THREE.Vector3(1, 0, 0), 12)];
  }, [cutawayMode]);

  const textures = useMemo(() => {
    return {
      riverStone: createRiverStoneTexture(),
      sportsNet: createSportsNetTexture(),
      paver: createPaverWalkwayTexture(),
    };
  }, []);

  // Palet material arsitektural terpadu dari CAMPUS_PALETTE
  const materials = useMemo(() => {
    const arch = CAMPUS_PALETTE.architecture;
    const land = CAMPUS_PALETTE.landscape;
    return {
      wallWhite: new THREE.MeshStandardMaterial({
        color: arch.wallWhite,
        roughness: 0.72,
        metalness: 0.03,
      }),
      wallLightGrey: new THREE.MeshStandardMaterial({
        color: arch.wallLightGrey,
        roughness: 0.76,
        metalness: 0.04,
      }),
      terracottaBrick: new THREE.MeshStandardMaterial({
        color: arch.terracottaBrick,
        roughness: 0.84,
        metalness: 0.04,
      }),
      rosterScreen: new THREE.MeshStandardMaterial({
        color: arch.rosterScreen,
        roughness: 0.86,
        metalness: 0.04,
      }),
      windowGlass: new THREE.MeshStandardMaterial({
        color: arch.windowGlass,
        roughness: 0.24,
        metalness: 0.45,
      }),
      metalRailing: new THREE.MeshStandardMaterial({
        color: arch.metalRailing,
        roughness: 0.42,
        metalness: 0.7,
      }),
      doorWood: new THREE.MeshStandardMaterial({
        color: arch.doorWood,
        roughness: 0.72,
        metalness: 0.04,
      }),
      roofDark: new THREE.MeshStandardMaterial({
        color: arch.roofSlate,
        roughness: 0.58,
        metalness: 0.14,
      }),
      roofFascia: new THREE.MeshStandardMaterial({
        color: arch.roofFascia,
        roughness: 0.65,
        metalness: 0.06,
      }),
      taludRiverStone: new THREE.MeshStandardMaterial({
        color: textures.riverStone ? '#d8dde2' : land.taludRiverStone,
        map: textures.riverStone ?? null,
        roughness: 0.9,
        metalness: 0.03,
      }),
      concreteLight: new THREE.MeshStandardMaterial({
        color: land.concreteLight,
        roughness: 0.82,
        metalness: 0.04,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
      concreteCurb: new THREE.MeshStandardMaterial({
        color: land.concreteCurb,
        roughness: 0.78,
        metalness: 0.04,
      }),
      stairs: new THREE.MeshStandardMaterial({
        color: land.stairs,
        roughness: 0.78,
        metalness: 0.04,
      }),
      stairBase: new THREE.MeshStandardMaterial({
        color: land.stairBase,
        roughness: 0.88,
        metalness: 0.04,
      }),
      foundation: new THREE.MeshStandardMaterial({
        color: arch.foundation,
        roughness: 0.92,
      }),
      pathway: new THREE.MeshStandardMaterial({
        color: textures.paver ? '#cfd5dc' : land.pathway,
        map: textures.paver ?? null,
        roughness: 0.84,
        metalness: 0.04,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      turunanSlope: new THREE.MeshStandardMaterial({
        color: land.turunanSlope,
        roughness: 0.78,
        metalness: 0.06,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      turfField: new THREE.MeshStandardMaterial({
        color: land.turfField,
        roughness: 0.9,
        metalness: 0.02,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
      courtLine: new THREE.MeshStandardMaterial({
        color: land.courtLine,
        roughness: 0.55,
        metalness: 0.04,
      }),
      sportsNet: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        map: textures.sportsNet ?? null,
        transparent: true,
        opacity: 0.95,
        alphaTest: 0.08,
        side: THREE.DoubleSide,
        roughness: 0.78,
      }),
      flagPole: new THREE.MeshStandardMaterial({
        color: land.flagPole,
        roughness: 0.28,
        metalness: 0.85,
      }),
      flagRed: new THREE.MeshStandardMaterial({
        color: land.flagRed,
        roughness: 0.65,
      }),
      flagWhite: new THREE.MeshStandardMaterial({
        color: land.flagWhite,
        roughness: 0.65,
      }),
      shrubGreen: new THREE.MeshStandardMaterial({
        color: land.shrubGreen,
        roughness: 0.85,
        flatShading: true,
      }),
      netPostGreen: new THREE.MeshStandardMaterial({
        color: land.netPostGreen,
        roughness: 0.48,
        metalness: 0.3,
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: land.treeTrunk,
        roughness: 0.9,
      }),
      treeFoliageShade: new THREE.MeshStandardMaterial({
        color: land.treeCanopyShade,
        roughness: 0.82,
        flatShading: true,
      }),
      treeFoliagePalm: new THREE.MeshStandardMaterial({
        color: land.treeCanopyPalm,
        roughness: 0.78,
        flatShading: true,
      }),
      masjidWall: new THREE.MeshStandardMaterial({
        color: arch.masjidWall,
        roughness: 0.6,
      }),
      masjidRoof: new THREE.MeshStandardMaterial({
        color: arch.masjidRoof,
        roughness: 0.4,
        metalness: 0.12,
      }),
      masjidFinial: new THREE.MeshStandardMaterial({
        color: arch.masjidFinial,
        roughness: 0.25,
        metalness: 0.85,
      }),
      masjidPillars: new THREE.MeshStandardMaterial({
        color: arch.masjidPillars,
        roughness: 0.6,
      }),
      gate: new THREE.MeshStandardMaterial({
        color: arch.gate,
        roughness: 0.55,
        metalness: 0.18,
      }),
      canopy: new THREE.MeshStandardMaterial({
        color: arch.canopyDark,
        roughness: 0.48,
        metalness: 0.55,
      }),
      conceptualStairs: new THREE.MeshStandardMaterial({
        color: land.conceptualStairs,
        transparent: true,
        opacity: 0.3,
        roughness: 0.4,
        metalness: 0.1,
      }),
    };
  }, [textures]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
      textures.riverStone?.dispose();
      textures.sportsNet?.dispose();
      textures.paver?.dispose();
    };
  }, [materials, textures]);

  const gateLandmark = CAMPUS_LAYOUT.landmarks[0];
  const lobbyLandmark = CAMPUS_LAYOUT.landmarks[1];
  const courtFacility = CAMPUS_LAYOUT.facilityAreas[0];
  const masjidBuilding = CAMPUS_LAYOUT.buildings.masjid;
  const posSatpamLandmark = CAMPUS_LAYOUT.landmarks.find((l) => l.id === 'pos_satpam');
  const flagLandmark = CAMPUS_LAYOUT.landmarks.find((l) => l.id === 'tiang_bendera');

  return (
    <group name="campus_blockout_root">
      {/* 1. Medan Berkontur Padat Watertight */}
      <CampusTerrain clippingPlanes={clippingPlanes} />

      {/* Grid batas datum y=0 saat mode cutaway aktif */}
      {cutawayMode && (
        <group position={[-22, 0, -6]}>
          <gridHelper args={[40, 20, '#f2c200', '#475569']} position={[0, 0.01, 0]} />
        </group>
      )}

      {/* 2. Pagar Pembatas Keliling Kawasan Mengikuti Kontur Tanah */}
      <PerimeterFenceMesh materials={materials} />

      {/* 3. Gerbang Utama & Pos Satpam (+4.0m) */}
      <group position={gateLandmark.position}>
        <mesh position={[-2.7, 1.9, 0]} castShadow receiveShadow material={materials.gate}>
          <boxGeometry args={[0.8, 3.8, 1.0]} />
        </mesh>
        <mesh position={[2.7, 1.9, 0]} castShadow receiveShadow material={materials.gate}>
          <boxGeometry args={[0.8, 3.8, 1.0]} />
        </mesh>
        <mesh position={[0, 3.6, 0]} castShadow receiveShadow material={materials.gate}>
          <boxGeometry args={[6.2, 0.6, 1.2]} />
        </mesh>
        <mesh position={[0, 3.0, 0]} receiveShadow material={materials.roofDark}>
          <boxGeometry args={[4.4, 0.4, 0.15]} />
        </mesh>
        {showLabels && (
          <DistanceLimitedSpriteLabel
            labelId="lbl_gerbang"
            text="GERBANG UTAMA (+4.0m)"
            position={[0, 4.8, 0]}
          />
        )}
      </group>

      {/* Pos Satpam Gerbang (+4.0m) */}
      {posSatpamLandmark && (
        <group position={posSatpamLandmark.position}>
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow material={materials.wallWhite}>
            <boxGeometry args={[3.2, 2.8, 3.2]} />
          </mesh>
          <mesh position={[0, 1.45, -1.61]} material={materials.windowGlass}>
            <boxGeometry args={[1.6, 0.95, 0.05]} />
          </mesh>
          <mesh position={[0, 2.84, 0]} receiveShadow material={materials.roofFascia}>
            <boxGeometry args={[3.5, 0.1, 3.5]} />
          </mesh>
          <HippedRoof
            width={3.5}
            depth={3.5}
            height={0.75}
            position={[0, 2.89, 0]}
            material={materials.roofDark}
          />
          {showLabels && (
            <DistanceLimitedSpriteLabel
              labelId="lbl_satpam"
              text="POS SATPAM (+4.0m)"
              position={[0, 4.1, 0]}
              isConceptual
              baseWidth={3.8}
            />
          )}
        </group>
      )}

      {/* 4. Turunan Utama Rapi dengan Kanstin Beton (+4.0m -> 0.0m) */}
      <group name="turunan_utama_group">
        {(() => {
          const p1 = new THREE.Vector3(0, 4.0, 38);
          const p2 = new THREE.Vector3(0, 0.0, 10);
          const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
          const length = p1.distanceTo(p2);
          const angleX = Math.atan2(p1.y - p2.y, p1.z - p2.z);

          return (
            <group position={mid} rotation={[-angleX, 0, 0]}>
              <mesh position={[0, 0.03, 0]} receiveShadow material={materials.turunanSlope}>
                <boxGeometry args={[4.6, 0.08, length]} />
              </mesh>
              <mesh position={[-2.4, 0.08, 0]} receiveShadow castShadow material={materials.concreteCurb}>
                <boxGeometry args={[0.22, 0.16, length]} />
              </mesh>
              <mesh position={[2.4, 0.08, 0]} receiveShadow castShadow material={materials.concreteCurb}>
                <boxGeometry args={[0.22, 0.16, length]} />
              </mesh>
              <mesh position={[-2.75, 0.01, 0]} receiveShadow material={materials.taludRiverStone}>
                <boxGeometry args={[0.5, 0.06, length]} />
              </mesh>
              <mesh position={[2.75, 0.01, 0]} receiveShadow material={materials.taludRiverStone}>
                <boxGeometry args={[0.5, 0.06, length]} />
              </mesh>
            </group>
          );
        })()}

        {showLabels && (
          <DistanceLimitedSpriteLabel
            labelId="lbl_turunan"
            text="TURUNAN UTAMA (+4.0m -> 0.0m)"
            position={[0, 2.8, 24]}
          />
        )}
      </group>

      {/* 5. Loby Asrama (0.0m) */}
      <group position={lobbyLandmark.position}>
        <mesh
          position={[0, lobbyLandmark.dimensions[1] / 2 + 0.02, 0]}
          castShadow
          receiveShadow
          material={materials.wallWhite}
        >
          <boxGeometry args={lobbyLandmark.dimensions} />
        </mesh>
        <mesh position={[4.52, 1.4, 0]} material={materials.windowGlass}>
          <boxGeometry args={[0.06, 1.5, 4.4]} />
        </mesh>
        <mesh position={[4.2, 2.7, 0]} castShadow receiveShadow material={materials.canopy}>
          <boxGeometry args={[1.6, 0.15, 4.2]} />
        </mesh>
        <mesh position={[0, lobbyLandmark.dimensions[1] + 0.06, 0]} receiveShadow material={materials.roofFascia}>
          <boxGeometry args={[lobbyLandmark.dimensions[0] + 0.35, 0.1, lobbyLandmark.dimensions[2] + 0.35]} />
        </mesh>
        <HippedRoof
          width={lobbyLandmark.dimensions[0] + 0.3}
          depth={lobbyLandmark.dimensions[2] + 0.3}
          height={0.85}
          position={[0, lobbyLandmark.dimensions[1] + 0.11, 0]}
          material={materials.roofDark}
        />
        {showLabels && (
          <DistanceLimitedSpriteLabel
            labelId="lbl_lobby"
            text="LOBY ASRAMA (0.0m)"
            position={[0, lobbyLandmark.dimensions[1] + 1.5, 0]}
          />
        )}
      </group>

      {/* 6. Masjid SMK TI BAZMA (Pelataran Beton Terjangkar, Atap Limas Bertingkat, & Kubah Puncak Ramping) */}
      <group position={masjidBuilding.basePosition}>
        {/* Pelataran dasar beton terjangkar ke lereng agar tidak ada tepi tanah menggantung */}
        <mesh position={[0, -0.52, -1.6]} receiveShadow castShadow material={materials.concreteLight}>
          <boxGeometry args={[14.4, 1.1, 16.0]} />
        </mesh>
        <mesh position={[0, 2.4, 0]} castShadow receiveShadow material={materials.masjidWall}>
          <boxGeometry args={[12.0, 4.8, 11.0]} />
        </mesh>
        <HippedRoof width={12.8} depth={11.8} height={1.45} position={[0, 4.8, 0]} material={materials.masjidRoof} />
        <mesh position={[0, 6.2, 0]} castShadow receiveShadow material={materials.masjidWall}>
          <boxGeometry args={[5.2, 0.65, 4.8]} />
        </mesh>
        <HippedRoof width={5.9} depth={5.5} height={1.35} position={[0, 6.52, 0]} material={materials.masjidRoof} />
        {/* Mahkota Kubah Ramping Kuningan */}
        <group position={[0, 7.87, 0]}>
          <mesh position={[0, 0.14, 0]} castShadow material={materials.masjidFinial}>
            <cylinderGeometry args={[0.16, 0.24, 0.28, 12]} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow material={materials.masjidFinial}>
            <sphereGeometry args={[0.18, 12, 10]} />
          </mesh>
          <mesh position={[0, 0.85, 0]} castShadow material={materials.masjidFinial}>
            <cylinderGeometry args={[0.025, 0.04, 0.72, 8]} />
          </mesh>
          <mesh position={[0, 1.24, 0]} castShadow material={materials.masjidFinial}>
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
        </group>
        {/* Serambi Utara Menghadap Kawasan */}
        <mesh position={[0, 1.6, -7.2]} castShadow receiveShadow material={materials.masjidWall}>
          <boxGeometry args={[12.0, 3.2, 3.5]} />
        </mesh>
        <mesh position={[0, 3.26, -7.2]} receiveShadow material={materials.roofFascia}>
          <boxGeometry args={[12.3, 0.12, 3.8]} />
        </mesh>
        {[-5.2, -1.8, 1.8, 5.2].map((px) => (
          <mesh key={`masjid_col_${px}`} position={[px, 1.5, -8.7]} castShadow material={materials.masjidPillars}>
            <cylinderGeometry args={[0.18, 0.18, 3.0, 12]} />
          </mesh>
        ))}
        {showLabels && (
          <DistanceLimitedSpriteLabel
            labelId="lbl_masjid"
            text="MASJID"
            position={[0, 9.6, 0]}
            isConceptual
          />
        )}
      </group>

      {/* 7. Lapangan Upacara & Rumput (-2.5m) */}
      <group position={courtFacility.position} name="lapangan_rapi_group">
        {(() => {
          const [w, , d] = courtFacility.dimensions; // 17.0 x 16.5
          const walkWidth = 1.6;
          const innerW = w - walkWidth * 2;
          const innerD = d - walkWidth * 2;

          return (
            <group>
              <mesh position={[0, 0.03, 0]} receiveShadow material={materials.turfField}>
                <boxGeometry args={[innerW, 0.06, innerD]} />
              </mesh>

              {/* Garis Batas Tipis Lapangan */}
              <mesh position={[0, 0.065, innerD / 2 - 0.5]} material={materials.courtLine}>
                <boxGeometry args={[innerW - 1.0, 0.015, 0.08]} />
              </mesh>
              <mesh position={[0, 0.065, -innerD / 2 + 0.5]} material={materials.courtLine}>
                <boxGeometry args={[innerW - 1.0, 0.015, 0.08]} />
              </mesh>
              <mesh position={[-innerW / 2 + 0.5, 0.065, 0]} material={materials.courtLine}>
                <boxGeometry args={[0.08, 0.015, innerD - 1.0]} />
              </mesh>
              <mesh position={[innerW / 2 - 0.5, 0.065, 0]} material={materials.courtLine}>
                <boxGeometry args={[0.08, 0.015, innerD - 1.0]} />
              </mesh>

              {/* Trotoar Beton Keliling 4 Sisi */}
              <mesh position={[0, 0.06, d / 2 - walkWidth / 2]} receiveShadow material={materials.concreteLight}>
                <boxGeometry args={[w, 0.12, walkWidth]} />
              </mesh>
              <mesh position={[0, 0.06, -d / 2 + walkWidth / 2]} receiveShadow material={materials.concreteLight}>
                <boxGeometry args={[w, 0.12, walkWidth]} />
              </mesh>
              <mesh position={[-w / 2 + walkWidth / 2, 0.06, 0]} receiveShadow material={materials.concreteLight}>
                <boxGeometry args={[walkWidth, 0.12, d - walkWidth * 2]} />
              </mesh>
              <mesh position={[w / 2 - walkWidth / 2, 0.06, 0]} receiveShadow material={materials.concreteLight}>
                <boxGeometry args={[walkWidth, 0.12, d - walkWidth * 2]} />
              </mesh>

              {/* Kanstin Pembatas Rendah di Sisi Barat (Pagar Besi Terbuka di render lewat SafetyRailing) */}
              <mesh position={[-w / 2 - 0.15, 0.16, 0]} castShadow receiveShadow material={materials.concreteCurb}>
                <boxGeometry args={[0.24, 0.32, d]} />
              </mesh>

              {/* Bak Tanaman Perdu Rapi di Tepi Selatan Lapangan */}
              <mesh position={[0, 0.14, d / 2 - walkWidth - 0.45]} receiveShadow castShadow material={materials.concreteCurb}>
                <boxGeometry args={[10.4, 0.24, 0.9]} />
              </mesh>
              {[-4.2, -2.1, 0, 2.1, 4.2].map((ox) => (
                <group key={`shrub_row_${ox}`} position={[ox, 0.26, d / 2 - walkWidth - 0.45]}>
                  <mesh position={[0, 0.22, 0]} castShadow receiveShadow material={materials.shrubGreen}>
                    <dodecahedronGeometry args={[0.32, 0]} />
                  </mesh>
                  <mesh position={[0.1, 0.32, 0.05]} castShadow material={materials.treeFoliagePalm}>
                    <dodecahedronGeometry args={[0.2, 0]} />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })()}

        {showLabels && (
          <DistanceLimitedSpriteLabel
            labelId="lbl_lapangan"
            text="LAPANGAN (-2.5m)"
            position={[0, 2.4, 0]}
            isConceptual
          />
        )}
      </group>

      {/* Tiang Bendera Merah Putih di Sudut Trotoar Lapangan */}
      {flagLandmark && (
        <group position={flagLandmark.position} name="tiang_bendera_merah_putih">
          <mesh position={[0, 0.14, 0]} receiveShadow material={materials.concreteCurb}>
            <boxGeometry args={[0.8, 0.28, 0.8]} />
          </mesh>
          <mesh position={[0, 4.3, 0]} castShadow material={materials.flagPole}>
            <cylinderGeometry args={[0.06, 0.08, 8.2, 12]} />
          </mesh>
          <group position={[0.68, 7.6, 0]}>
            <mesh position={[0, 0.34, 0]} material={materials.flagRed}>
              <boxGeometry args={[1.3, 0.65, 0.03]} />
            </mesh>
            <mesh position={[0, -0.34, 0]} material={materials.flagWhite}>
              <boxGeometry args={[1.3, 0.65, 0.03]} />
            </mesh>
          </group>
        </group>
      )}

      {/* Tiang Net Hijau & Anyaman Jaring Transparan di Lapangan */}
      {CAMPUS_LAYOUT.sportsFixtures.map((fixture) => (
        <group key={fixture.id} position={fixture.position} rotation={[0, fixture.rotationY, 0]}>
          <mesh position={[0, 1.2, -3.2]} castShadow material={materials.netPostGreen}>
            <cylinderGeometry args={[0.05, 0.05, 2.4, 10]} />
          </mesh>
          <mesh position={[0, 1.2, 3.2]} castShadow material={materials.netPostGreen}>
            <cylinderGeometry args={[0.05, 0.05, 2.4, 10]} />
          </mesh>
          <mesh position={[0, 2.02, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.sportsNet}>
            <planeGeometry args={[6.4, 0.78]} />
          </mesh>
        </group>
      ))}

      {/* 8. Pagar Pengaman Terbuka Tepi Jurang / Talud */}
      {CAMPUS_LAYOUT.safetyRailings.map((rail) => (
        <OpenSafetyRailing key={rail.id} railing={rail} materials={materials} />
      ))}

      {/* 9. Dinding Penahan Tanah / Talud Terasering Batu Kali + Pilaster + Berm Tanaman */}
      {CAMPUS_LAYOUT.retainingWalls.map((wall) => {
        const p1 = new THREE.Vector3(...wall.start);
        const p2 = new THREE.Vector3(...wall.end);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const length = p1.distanceTo(p2);
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        const pilasterCount = Math.max(2, Math.floor(length / 4.0) + 1);

        return (
          <group key={wall.id} position={mid} quaternion={q}>
            <mesh receiveShadow castShadow material={materials.taludRiverStone}>
              <boxGeometry args={[wall.thickness, wall.height, length]} />
            </mesh>
            {/* Topi / Cap Beton di Atas Talud */}
            <mesh position={[0, wall.height / 2 + 0.06, 0]} receiveShadow material={materials.concreteCurb}>
              <boxGeometry args={[wall.thickness + 0.16, 0.12, length]} />
            </mesh>
            {/* Pilaster Pengaku Vertikal tiap ~4m */}
            {Array.from({ length: pilasterCount }).map((_, idx) => {
              const t = pilasterCount === 1 ? 0.5 : idx / (pilasterCount - 1);
              const lz = -length / 2 + 0.25 + t * Math.max(0, length - 0.5);
              return (
                <mesh
                  key={`pilaster_${wall.id}_${idx}`}
                  position={[0, 0, lz]}
                  castShadow
                  receiveShadow
                  material={materials.concreteLight}
                >
                  <boxGeometry args={[wall.thickness + 0.14, wall.height + 0.04, 0.34]} />
                </mesh>
              );
            })}
            {/* Bak Tanaman Berm Rapi di Kaki Talud */}
            <mesh position={[0, -wall.height / 2 + 0.32, 0]} receiveShadow material={materials.concreteCurb}>
              <boxGeometry args={[wall.thickness + 0.7, 0.45, length - 0.2]} />
            </mesh>
            <mesh position={[0, -wall.height / 2 + 0.62, 0]} receiveShadow material={materials.shrubGreen}>
              <boxGeometry args={[wall.thickness + 0.45, 0.24, length - 0.4]} />
            </mesh>
          </group>
        );
      })}

      {/* 10. Tangga Lansekap Terasering Rapi & Terjangkar Tanpa Segitiga Menggantung */}
      {CAMPUS_LAYOUT.landscapeStairs.map((st) => (
        <LandscapeStaircase key={st.id} stair={st} materials={materials} />
      ))}

      {/* Terasering Planter Beton & Bata Muted di Lereng Asrama */}
      <group name="terasering_asrama_planters">
        {[
          { x: -12.8, z: 2.0, w: 2.0, h: 1.3, d: 3.2 },
          { x: -12.8, z: -2.0, w: 2.0, h: 1.4, d: 3.2 },
          { x: -12.8, z: -6.0, w: 2.0, h: 1.5, d: 3.2 },
          { x: -12.8, z: -10.0, w: 2.0, h: 1.6, d: 3.2 },
        ].map((tier, idx) => {
          const groundY = getTerrainHeight(tier.x, tier.z);
          return (
            <group key={`terrace_box_${idx}`} position={[tier.x, groundY + tier.h * 0.32, tier.z]}>
              <mesh castShadow receiveShadow material={materials.wallWhite}>
                <boxGeometry args={[tier.w, tier.h, tier.d]} />
              </mesh>
              <mesh position={[0, tier.h / 2 + 0.05, 0]} receiveShadow material={materials.terracottaBrick}>
                <boxGeometry args={[tier.w + 0.06, 0.1, tier.d + 0.06]} />
              </mesh>
              <mesh position={[0, tier.h / 2 + 0.22, 0]} castShadow receiveShadow material={materials.shrubGreen}>
                <boxGeometry args={[tier.w - 0.5, 0.28, tier.d - 0.5]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 11. Jalur Sirkulasi Mengikuti Kontur Tanah Secara Mulus */}
      {CAMPUS_LAYOUT.pathways.map((path) => {
        if (path.id === 'path_gerbang_turunan') return null;
        return (
          <TerrainPathwayRibbon
            key={path.id}
            pathway={path}
            surfaceMat={materials.pathway}
            curbMat={materials.concreteCurb}
          />
        );
      })}

      {/* 12. Pepohonan Tepi Kawasan */}
      <group name="campus_trees">
        {CAMPUS_LAYOUT.campusTrees.map((tree) => {
          const y = getTerrainHeight(tree.position[0], tree.position[2]);
          const s = tree.scale;

          if (tree.type === 'palm') {
            return (
              <group key={tree.id} position={[tree.position[0], y, tree.position[2]]} scale={[s, s, s]}>
                <mesh position={[0, 2.0, 0]} castShadow receiveShadow material={materials.treeTrunk}>
                  <cylinderGeometry args={[0.14, 0.22, 4.0, 7]} />
                </mesh>
                <mesh position={[0, 4.1, 0]} castShadow receiveShadow material={materials.treeFoliagePalm}>
                  <coneGeometry args={[1.65, 1.2, 6]} />
                </mesh>
                <mesh position={[0, 4.65, 0]} rotation={[0, Math.PI / 6, 0]} castShadow material={materials.treeFoliagePalm}>
                  <coneGeometry args={[1.25, 1.0, 6]} />
                </mesh>
              </group>
            );
          }

          return (
            <group key={tree.id} position={[tree.position[0], y, tree.position[2]]} scale={[s, s, s]}>
              <mesh position={[0, 1.45, 0]} castShadow receiveShadow material={materials.treeTrunk}>
                <cylinderGeometry args={[0.18, 0.28, 2.9, 7]} />
              </mesh>
              <mesh position={[0, 3.25, 0]} castShadow receiveShadow material={materials.treeFoliageShade}>
                <icosahedronGeometry args={[1.45, 0]} />
              </mesh>
              <mesh position={[0.55, 3.9, 0.35]} castShadow material={materials.treeFoliagePalm}>
                <icosahedronGeometry args={[0.95, 0]} />
              </mesh>
              <mesh position={[-0.45, 3.7, -0.3]} castShadow material={materials.treeFoliageShade}>
                <icosahedronGeometry args={[0.9, 0]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 13. Gedung Asrama Rapi (B2, B1, LT 1–3 + Menara Tangga Utara + Atap Limas Proporsional) */}
      <AsramaBuildingReal
        definition={CAMPUS_LAYOUT.buildings.asrama}
        materials={materials}
        showLabels={showLabels}
        cutawayMode={cutawayMode}
      />

      {/* 14. Gedung Sekolah dengan Interior 3 Lantai & Atap Limas Proporsional */}
      <SekolahBuildingReal
        definition={CAMPUS_LAYOUT.buildings.sekolah}
        materials={materials}
        showLabels={showLabels}
        cutawayMode={cutawayMode}
      />
    </group>
  );
}

/**
 * Pagar Pembatas Keliling Kawasan Mengikuti Kontur Tanah + InstancedMesh Picket Besi
 */
function PerimeterFenceMesh({ materials }: { materials: Record<string, THREE.Material> }) {
  const picketMeshRef = useRef<THREE.InstancedMesh>(null);
  const fenceCfg = CAMPUS_LAYOUT.perimeterFence;

  const { panelData, picketMatrices } = useMemo(() => {
    const panels: Array<{
      midX: number;
      midY: number;
      midZ: number;
      segLen: number;
      yaw: number;
      slopeAngle: number;
    }> = [];
    const postPositions: Array<[number, number, number]> = [];
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];

    for (const run of fenceCfg.runs) {
      const [sx, sz] = run.start;
      const [ex, ez] = run.end;
      const dx = ex - sx;
      const dz = ez - sz;
      const totalLen = Math.hypot(dx, dz);
      const count = Math.max(1, Math.round(totalLen / 2.2));
      const yaw = Math.atan2(dx, dz);

      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const px = THREE.MathUtils.lerp(sx, ex, t);
        const pz = THREE.MathUtils.lerp(sz, ez, t);
        const py = getTerrainHeight(px, pz);
        postPositions.push([px, py, pz]);
      }

      for (let i = 0; i < count; i++) {
        const t0 = i / count;
        const t1 = (i + 1) / count;
        const x0 = THREE.MathUtils.lerp(sx, ex, t0);
        const z0 = THREE.MathUtils.lerp(sz, ez, t0);
        const x1 = THREE.MathUtils.lerp(sx, ex, t1);
        const z1 = THREE.MathUtils.lerp(sz, ez, t1);
        const y0 = getTerrainHeight(x0, z0);
        const y1 = getTerrainHeight(x1, z1);
        const horiz = Math.hypot(x1 - x0, z1 - z0);
        const dy = y1 - y0;
        const slopeAngle = Math.atan2(-dy, horiz);
        const segLen = Math.hypot(horiz, dy);

        panels.push({
          midX: (x0 + x1) * 0.5,
          midY: (y0 + y1) * 0.5,
          midZ: (z0 + z1) * 0.5,
          segLen,
          yaw,
          slopeAngle,
        });

        // Kisi vertikal besi setiap ~0.26m sepanjang panel
        const picketCount = Math.max(2, Math.floor(horiz / 0.26));
        for (let p = 1; p < picketCount; p++) {
          const tp = p / picketCount;
          const ppx = THREE.MathUtils.lerp(x0, x1, tp);
          const ppz = THREE.MathUtils.lerp(z0, z1, tp);
          const ppy = THREE.MathUtils.lerp(y0, y1, tp);
          dummy.position.set(ppx, ppy + 0.94, ppz);
          dummy.rotation.set(0, yaw, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          matrices.push(dummy.matrix.clone());
        }
      }
    }

    return {
      panelData: { panels, postPositions },
      picketMatrices: matrices,
    };
  }, [fenceCfg.runs]);

  const picketGeometry = useMemo(() => new THREE.BoxGeometry(0.032, 1.38, 0.032), []);

  useEffect(() => {
    const mesh = picketMeshRef.current;
    if (!mesh) return;
    for (let i = 0; i < picketMatrices.length; i++) {
      mesh.setMatrixAt(i, picketMatrices[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [picketMatrices]);

  useEffect(() => {
    return () => picketGeometry.dispose();
  }, [picketGeometry]);

  return (
    <group name="perimeter_fence_group">
      {panelData.panels.map((p, idx) => (
        <group
          key={`fence_panel_${idx}`}
          position={[p.midX, p.midY, p.midZ]}
          rotation={[0, p.yaw, 0]}
        >
          {/* Pondasi & Plinth Beton Terjangkar -0.65m ke Tanah */}
          <mesh
            position={[0, -0.18, 0]}
            rotation={[p.slopeAngle, 0, 0]}
            castShadow
            receiveShadow
            material={materials.concreteCurb}
          >
            <boxGeometry args={[0.24, 0.92, p.segLen + 0.04]} />
          </mesh>
          {/* Rel Atas & Tengah Baja Hitam */}
          <mesh
            position={[0, 1.62, 0]}
            rotation={[p.slopeAngle, 0, 0]}
            castShadow
            material={materials.metalRailing}
          >
            <boxGeometry args={[0.055, 0.055, p.segLen]} />
          </mesh>
          <mesh
            position={[0, 0.88, 0]}
            rotation={[p.slopeAngle, 0, 0]}
            castShadow
            material={materials.metalRailing}
          >
            <boxGeometry args={[0.045, 0.045, p.segLen]} />
          </mesh>
        </group>
      ))}

      {/* Tiang Pilar Pagar di Tiap Titik Simpul */}
      {panelData.postPositions.map(([px, py, pz], idx) => (
        <mesh
          key={`fence_post_${idx}`}
          position={[px, py + 0.84, pz]}
          castShadow
          receiveShadow
          material={materials.concreteLight}
        >
          <boxGeometry args={[0.16, 1.88, 0.16]} />
        </mesh>
      ))}

      {/* Kisi Vertikal InstancedMesh */}
      <instancedMesh
        ref={picketMeshRef}
        args={[picketGeometry, materials.metalRailing, picketMatrices.length]}
        castShadow
        receiveShadow
        name="perimeter_fence_pickets"
      />
    </group>
  );
}

/**
 * Railing Pengaman Baja Terbuka (untuk Tepian Lapangan Barat & Atas Talud)
 */
function OpenSafetyRailing({
  railing,
  materials,
}: {
  railing: SafetyRailingSegment;
  materials: Record<string, THREE.Material>;
}) {
  const { mid, yaw, length, posts } = useMemo(() => {
    const p1 = new THREE.Vector3(...railing.start);
    const p2 = new THREE.Vector3(...railing.end);
    const d = p1.distanceTo(p2);
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const postCount = Math.max(2, Math.floor(d / 1.8) + 1);
    const postArr: number[] = [];
    for (let i = 0; i < postCount; i++) {
      postArr.push(-d / 2 + (i / (postCount - 1)) * d);
    }
    return {
      mid: new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5),
      yaw: Math.atan2(dir.x, dir.z),
      length: d,
      posts: postArr,
    };
  }, [railing.start, railing.end]);

  return (
    <group position={[mid.x, mid.y, mid.z]} rotation={[0, yaw, 0]} name={`safety_${railing.id}`}>
      {/* Rel Atas & Tengah */}
      <mesh position={[0, railing.height, 0]} castShadow material={materials.metalRailing}>
        <boxGeometry args={[0.05, 0.05, length]} />
      </mesh>
      <mesh position={[0, railing.height * 0.55, 0]} castShadow material={materials.metalRailing}>
        <boxGeometry args={[0.04, 0.04, length]} />
      </mesh>
      {posts.map((lz, idx) => (
        <mesh
          key={`sp_${railing.id}_${idx}`}
          position={[0, railing.height * 0.5, lz]}
          castShadow
          material={materials.metalRailing}
        >
          <boxGeometry args={[0.05, railing.height, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

// Komponen Jalur Sirkulasi Menyatu Rapi Rata Mengikuti Ketinggian Medan getTerrainHeight(x, z)
function TerrainPathwayRibbon({
  pathway,
  surfaceMat,
  curbMat,
}: {
  pathway: PathwaySegment;
  surfaceMat: THREE.Material;
  curbMat: THREE.Material;
}) {
  const { surfaceGeom, leftCurbGeom, rightCurbGeom } = useMemo(() => {
    const pStart = new THREE.Vector2(pathway.start[0], pathway.start[2]);
    const pEnd = new THREE.Vector2(pathway.end[0], pathway.end[2]);
    const dir2D = new THREE.Vector2().subVectors(pEnd, pStart).normalize();
    const perp2D = new THREE.Vector2(-dir2D.y, dir2D.x);
    const totalLen = Math.max(1, pStart.distanceTo(pEnd));

    const segments = 24;
    const halfW = pathway.width / 2;
    const curbW = 0.14;
    const yOffset = 0.04;
    const curbHeight = 0.065; // Kanstin rata halus mengikuti jalan, bukan parit tinggi

    const buildRibbon = (offsetLeft: number, offsetRight: number, yTop: number, yBot: number) => {
      const positions: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const cx = THREE.MathUtils.lerp(pStart.x, pEnd.x, t);
        const cz = THREE.MathUtils.lerp(pStart.y, pEnd.y, t);

        const lx = cx + perp2D.x * offsetLeft;
        const lz = cz + perp2D.y * offsetLeft;
        const rx = cx + perp2D.x * offsetRight;
        const rz = cz + perp2D.y * offsetRight;

        const ly = getTerrainHeight(lx, lz);
        const ry = getTerrainHeight(rx, rz);

        positions.push(
          lx, ly + yTop, lz,
          rx, ry + yTop, rz,
          lx, ly + yBot, lz,
          rx, ry + yBot, rz
        );

        const vCoord = t * (totalLen / 3.0);
        uvs.push(0, vCoord, 1, vCoord, 0, vCoord, 1, vCoord);

        if (i < segments) {
          const a = i * 4;
          const b = (i + 1) * 4;
          indices.push(a, a + 1, b, a + 1, b + 1, b);
          indices.push(a + 2, a, b + 2, a, b, b + 2);
          indices.push(a + 1, a + 3, b + 1, a + 3, b + 3, b + 1);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    };

    return {
      surfaceGeom: buildRibbon(-halfW, halfW, yOffset, -0.18),
      leftCurbGeom: buildRibbon(-halfW - curbW, -halfW, curbHeight, -0.18),
      rightCurbGeom: buildRibbon(halfW, halfW + curbW, curbHeight, -0.18),
    };
  }, [pathway]);

  useEffect(() => {
    return () => {
      surfaceGeom.dispose();
      leftCurbGeom.dispose();
      rightCurbGeom.dispose();
    };
  }, [surfaceGeom, leftCurbGeom, rightCurbGeom]);

  return (
    <group name={`pathway_${pathway.id}`}>
      <mesh geometry={surfaceGeom} material={surfaceMat} receiveShadow />
      <mesh geometry={leftCurbGeom} material={curbMat} receiveShadow castShadow />
      <mesh geometry={rightCurbGeom} material={curbMat} receiveShadow castShadow />
    </group>
  );
}

// Komponen Tangga Terasering Rapi dengan Kanstin Bertangga Terjangkar ke Tanah & Railing Tiang Terbuka
function LandscapeStaircase({
  stair,
  materials,
}: {
  stair: LandscapeStairsDefinition;
  materials: Record<string, THREE.Material>;
}) {
  const { start, end, width, stepsCount } = stair;

  const { mid, yaw, slopeAngle, totalLength, stepDepth, stepRise } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const horizDist = Math.sqrt(dx * dx + dz * dz);
    const len = p1.distanceTo(p2);

    return {
      mid: new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5),
      yaw: Math.atan2(dx, dz),
      slopeAngle: Math.atan2(-dy, horizDist),
      totalLength: len,
      stepDepth: horizDist / stepsCount,
      stepRise: Math.abs(dy) / stepsCount,
    };
  }, [start, end, stepsCount]);

  return (
    <group name={`stairs_${stair.id}`}>
      {/* 1. Badan Beton Solid di Bawah Anak Tangga + Pegangan Railing Besi Terbuka */}
      <group position={[mid.x, mid.y - 0.36, mid.z]} rotation={[0, yaw, 0]}>
        <mesh rotation={[slopeAngle, 0, 0]} receiveShadow castShadow material={materials.stairBase}>
          <boxGeometry args={[width, 0.72, totalLength + 0.35]} />
        </mesh>
        {/* Pegangan Railing Besi Hitam Kiri & Kanan */}
        <mesh position={[-width / 2 - 0.1, 1.24, 0]} rotation={[slopeAngle, 0, 0]} castShadow material={materials.metalRailing}>
          <boxGeometry args={[0.055, 0.055, totalLength + 0.3]} />
        </mesh>
        <mesh position={[width / 2 + 0.1, 1.24, 0]} rotation={[slopeAngle, 0, 0]} castShadow material={materials.metalRailing}>
          <boxGeometry args={[0.055, 0.055, totalLength + 0.3]} />
        </mesh>
      </group>

      {/* 2. Anak Tangga Bertingkat, Kanstin Samping Vertikal Terjangkar, & Tiang Railing */}
      {Array.from({ length: stepsCount }).map((_, i) => {
        const t = (i + 0.5) / stepsCount;
        const x = THREE.MathUtils.lerp(start[0], end[0], t);
        const y = THREE.MathUtils.lerp(start[1], end[1], t);
        const z = THREE.MathUtils.lerp(start[2], end[2], t);
        const showStanchion = i === 0 || i === stepsCount - 1 || i % 4 === 0;

        return (
          <group key={`step_${stair.id}_${i}`} position={[x, y, z]} rotation={[0, yaw, 0]}>
            {/* Anak Tangga */}
            <mesh
              position={[0, -stepRise * 0.25, 0]}
              receiveShadow
              castShadow
              material={materials.stairs}
            >
              <boxGeometry args={[width, Math.max(0.28, stepRise + 0.14), stepDepth + 0.14]} />
            </mesh>

            {/* Kanstin Samping Bertangga Terjangkar ke Tanah (menggantikan dinding miring mengambang) */}
            <mesh position={[-width / 2 - 0.1, -0.35, 0]} receiveShadow castShadow material={materials.wallWhite}>
              <boxGeometry args={[0.18, 0.92, stepDepth + 0.14]} />
            </mesh>
            <mesh position={[width / 2 + 0.1, -0.35, 0]} receiveShadow castShadow material={materials.wallWhite}>
              <boxGeometry args={[0.18, 0.92, stepDepth + 0.14]} />
            </mesh>

            {/* Tiang Stanchion Railing */}
            {showStanchion && (
              <>
                <mesh position={[-width / 2 - 0.1, 0.45, 0]} castShadow material={materials.metalRailing}>
                  <boxGeometry args={[0.05, 0.88, 0.05]} />
                </mesh>
                <mesh position={[width / 2 + 0.1, 0.45, 0]} castShadow material={materials.metalRailing}>
                  <boxGeometry args={[0.05, 0.88, 0.05]} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Gedung Asrama Realistis (Tanpa Bay Jendela Melayang, Roster Terbuka, Railing Terbuka, & Atap Limas)
function AsramaBuildingReal({
  definition,
  materials,
  showLabels,
  cutawayMode,
}: {
  definition: BuildingDefinition;
  materials: Record<string, THREE.Material>;
  showLabels: boolean;
  cutawayMode: boolean;
}) {
  const { basePosition, floors, wings, circulationPlaceholder, name } = definition;
  const mainWing = wings[0]; // [13, 3, 36] at [0,0,0]

  return (
    <group position={basePosition} name="gedung_asrama_real">
      {/* 1. Talud Batu Kali Rapi Tepat di Bawah Lantai B2 */}
      {wings.map((wing) => (
        <mesh
          key={`asrama_found_${wing.id}`}
          position={[wing.position[0], -6.9, wing.position[2]]}
          receiveShadow
          material={materials.taludRiverStone}
        >
          <boxGeometry args={[wing.dimensions[0], 1.8, wing.dimensions[2]]} />
        </mesh>
      ))}

      {/* Pelataran & Jalur Rumput Rapi di Kaki B2 Sisi Timur */}
      <mesh position={[mainWing.dimensions[0] / 2 + 1.2, -6.02, -3.0]} receiveShadow material={materials.turfField}>
        <boxGeometry args={[2.4, 0.08, 22.0]} />
      </mesh>

      {/* 2. Lantai B2 (-6.0m) & B1 (-3.0m) dengan Kolom Putih, Selasar, Jendela Dalam, & Railing Besi Terbuka */}
      {floors.slice(0, 2).map((floor) => (
        <group key={floor.id} position={[0, floor.relativeY, 0]}>
          {wings.map((wing) => {
            const isMain = wing.id === 'asrama_wing_main';
            return (
              <group key={`${floor.id}_${wing.id}`}>
                <mesh
                  position={isMain ? [wing.position[0] - 1.2, 0, wing.position[2]] : wing.position}
                  castShadow
                  receiveShadow
                  material={materials.wallLightGrey}
                >
                  <boxGeometry
                    args={
                      isMain
                        ? [wing.dimensions[0] - 2.4, floor.height - 0.14, wing.dimensions[2] - 0.2]
                        : [wing.dimensions[0], floor.height - 0.14, wing.dimensions[2]]
                    }
                  />
                </mesh>

                {isMain && (
                  <>
                    {/* Pelat Lantai Selasar Terbuka Sisi Timur B1/B2 */}
                    <mesh
                      position={[wing.position[0] + wing.dimensions[0] / 2 - 1.0, -floor.height / 2 + 0.07, wing.position[2]]}
                      receiveShadow
                      castShadow
                      material={materials.concreteCurb}
                    >
                      <boxGeometry args={[2.2, 0.14, wing.dimensions[2]]} />
                    </mesh>

                    {/* Balok Lisplang Putih Rapi */}
                    <mesh
                      position={[wing.position[0] + wing.dimensions[0] / 2, floor.height / 2 - 0.1, wing.position[2]]}
                      receiveShadow
                      castShadow
                      material={materials.wallWhite}
                    >
                      <boxGeometry args={[0.3, 0.2, wing.dimensions[2]]} />
                    </mesh>

                    {/* Kolom Pilar Putih */}
                    {[-16, -12, -8, -4, 0, 4, 8, 12, 16].map((pz) => (
                      <mesh
                        key={`pillar_${floor.id}_${pz}`}
                        position={[wing.position[0] + wing.dimensions[0] / 2 - 0.25, 0, wing.position[2] + pz]}
                        castShadow
                        receiveShadow
                        material={materials.wallWhite}
                      >
                        <boxGeometry args={[0.46, floor.height, 0.46]} />
                      </mesh>
                    ))}

                    {/* Jendela Kaca Gelap Ruangan B1/B2 di Dinding Dalam */}
                    {[-14, -10, -6, -2, 2, 6, 10, 14].map((wz) => (
                      <mesh
                        key={`b_win_${floor.id}_${wz}`}
                        position={[wing.position[0] + wing.dimensions[0] / 2 - 2.38, 0.1, wing.position[2] + wz]}
                        material={materials.windowGlass}
                      >
                        <boxGeometry args={[0.08, 1.35, 2.2]} />
                      </mesh>
                    ))}

                    {/* Railing Besi Terbuka Selasar B1 & B2 (Rel Atas + Rel Tengah + Tiang Picket Tipis) */}
                    <mesh
                      position={[wing.position[0] + wing.dimensions[0] / 2 - 0.16, -floor.height / 2 + 0.96, wing.position[2]]}
                      material={materials.metalRailing}
                    >
                      <boxGeometry args={[0.05, 0.05, wing.dimensions[2] - 0.4]} />
                    </mesh>
                    <mesh
                      position={[wing.position[0] + wing.dimensions[0] / 2 - 0.16, -floor.height / 2 + 0.52, wing.position[2]]}
                      material={materials.metalRailing}
                    >
                      <boxGeometry args={[0.04, 0.04, wing.dimensions[2] - 0.4]} />
                    </mesh>
                    {[-14, -10, -6, -2, 2, 6, 10, 14].map((rz) => (
                      <mesh
                        key={`b_rail_post_${floor.id}_${rz}`}
                        position={[wing.position[0] + wing.dimensions[0] / 2 - 0.16, -floor.height / 2 + 0.55, wing.position[2] + rz]}
                        material={materials.metalRailing}
                      >
                        <boxGeometry args={[0.04, 0.86, 0.04]} />
                      </mesh>
                    ))}
                  </>
                )}
              </group>
            );
          })}

          {(showLabels || cutawayMode) && (
            <DistanceLimitedSpriteLabel
              labelId={`lbl_asrama_${floor.id}`}
              text={`${name} - ${floor.label} (${floor.floorSlabElevation.toFixed(1)}m)`}
              position={[mainWing.position[0], 0, mainWing.position[2] + mainWing.dimensions[2] / 2 + 1.5]}
              maxDistance={cutawayMode ? 135 : 42}
            />
          )}
        </group>
      ))}

      {/* 3. Lantai 1, 2, 3 di Atas Tanah dengan Modul Jendela Proporsional Sesuai Ukuran Sayap */}
      {floors.slice(2).map((floor) => (
        <group key={floor.id} position={[0, floor.relativeY, 0]}>
          {wings.map((wing) => {
            const isMain = wing.id === 'asrama_wing_main';
            return (
              <group key={`${floor.id}_${wing.id}`}>
                {/* Dinding Utama Putih */}
                <mesh position={wing.position} castShadow receiveShadow material={materials.wallWhite}>
                  <boxGeometry args={[wing.dimensions[0], floor.height - 0.08, wing.dimensions[2]]} />
                </mesh>

                {/* Modul Jendela Ramping per Sayap (tidak keluar footprint wing!) */}
                {isMain ? (
                  <>
                    {[-14, -10.5, -7, -3.5, 0, 3.5, 7, 10.5, 14].map((pz) => (
                      <group
                        key={`win_main_e_${floor.id}_${pz}`}
                        position={[wing.position[0] + wing.dimensions[0] / 2 + 0.04, 0, wing.position[2] + pz]}
                      >
                        <mesh position={[0, 0.72, 0]} material={materials.terracottaBrick}>
                          <boxGeometry args={[0.06, 0.36, 1.8]} />
                        </mesh>
                        <mesh position={[0, 0.02, 0]} material={materials.windowGlass}>
                          <boxGeometry args={[0.05, 1.0, 1.55]} />
                        </mesh>
                        <mesh position={[0, -0.7, 0]} material={materials.terracottaBrick}>
                          <boxGeometry args={[0.06, 0.36, 1.8]} />
                        </mesh>
                      </group>
                    ))}
                  </>
                ) : (
                  <>
                    {[-3.6, 0, 3.6].map((px) => (
                      <React.Fragment key={`win_west_ns_${floor.id}_${px}`}>
                        <group position={[wing.position[0] + px, 0, wing.position[2] - wing.dimensions[2] / 2 - 0.04]}>
                          <mesh position={[0, 0.72, 0]} material={materials.terracottaBrick}>
                            <boxGeometry args={[1.8, 0.34, 0.06]} />
                          </mesh>
                          <mesh position={[0, 0.02, 0]} material={materials.windowGlass}>
                            <boxGeometry args={[1.55, 0.96, 0.05]} />
                          </mesh>
                          <mesh position={[0, -0.68, 0]} material={materials.terracottaBrick}>
                            <boxGeometry args={[1.8, 0.34, 0.06]} />
                          </mesh>
                        </group>
                        <group position={[wing.position[0] + px, 0, wing.position[2] + wing.dimensions[2] / 2 + 0.04]}>
                          <mesh position={[0, 0.72, 0]} material={materials.terracottaBrick}>
                            <boxGeometry args={[1.8, 0.34, 0.06]} />
                          </mesh>
                          <mesh position={[0, 0.02, 0]} material={materials.windowGlass}>
                            <boxGeometry args={[1.55, 0.96, 0.05]} />
                          </mesh>
                          <mesh position={[0, -0.68, 0]} material={materials.terracottaBrick}>
                            <boxGeometry args={[1.8, 0.34, 0.06]} />
                          </mesh>
                        </group>
                      </React.Fragment>
                    ))}
                    {[-4, 0, 4].map((pz) => (
                      <group
                        key={`win_west_w_${floor.id}_${pz}`}
                        position={[wing.position[0] - wing.dimensions[0] / 2 - 0.04, 0, wing.position[2] + pz]}
                      >
                        <mesh position={[0, 0.72, 0]} material={materials.terracottaBrick}>
                          <boxGeometry args={[0.06, 0.34, 1.8]} />
                        </mesh>
                        <mesh position={[0, 0.02, 0]} material={materials.windowGlass}>
                          <boxGeometry args={[0.05, 0.96, 1.55]} />
                        </mesh>
                        <mesh position={[0, -0.68, 0]} material={materials.terracottaBrick}>
                          <boxGeometry args={[0.06, 0.34, 1.8]} />
                        </mesh>
                      </group>
                    ))}
                  </>
                )}

                {/* Strip Lantai Pemisah Beton Halus */}
                <mesh position={[wing.position[0], -floor.height / 2 + 0.04, wing.position[2]]} receiveShadow material={materials.concreteLight}>
                  <boxGeometry args={[wing.dimensions[0] + 0.08, 0.08, wing.dimensions[2] + 0.08]} />
                </mesh>
              </group>
            );
          })}

          {(showLabels || cutawayMode) && (
            <DistanceLimitedSpriteLabel
              labelId={`lbl_asrama_${floor.id}`}
              text={`${name} - ${floor.label} (+${floor.floorSlabElevation.toFixed(1)}m)`}
              position={[mainWing.position[0], 0, mainWing.position[2] + mainWing.dimensions[2] / 2 + 1.0]}
              maxDistance={cutawayMode ? 135 : 42}
            />
          )}
        </group>
      ))}

      {/* 4. Selasar Terbuka Depan LT 1 dengan Parapet Terakota Rendah & Kolom Putih (Menggantikan Tembok Merah Masif) */}
      <group position={[mainWing.position[0] + mainWing.dimensions[0] / 2 + 2.8, 0, mainWing.position[2] - 3.0]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow material={materials.rosterScreen}>
          <boxGeometry args={[0.22, 0.84, 21.0]} />
        </mesh>
        <mesh position={[0, 0.87, 0]} receiveShadow material={materials.concreteCurb}>
          <boxGeometry args={[0.28, 0.08, 21.1]} />
        </mesh>
        {[-10, -6, -2, 2, 6, 10].map((cz) => (
          <mesh key={`colonnade_${cz}`} position={[0, 1.4, cz]} castShadow receiveShadow material={materials.wallWhite}>
            <boxGeometry args={[0.32, 2.8, 0.32]} />
          </mesh>
        ))}
        {/* Balok Pengikat Atas Kolom Selasar LT 1 */}
        <mesh position={[0, 2.74, 0]} castShadow receiveShadow material={materials.wallWhite}>
          <boxGeometry args={[0.36, 0.24, 21.1]} />
        </mesh>
        <group position={[-1.4, 2.7, 3.0]}>
          <mesh rotation={[0, 0, -0.08]} castShadow receiveShadow material={materials.canopy}>
            <boxGeometry args={[3.4, 0.1, 6.2]} />
          </mesh>
          <mesh position={[0.3, -1.3, -2.8]} material={materials.metalRailing}>
            <cylinderGeometry args={[0.05, 0.05, 2.6, 8]} />
          </mesh>
          <mesh position={[0.3, -1.3, 2.8]} material={materials.metalRailing}>
            <cylinderGeometry args={[0.05, 0.05, 2.6, 8]} />
          </mesh>
        </group>
      </group>

      {/* 5. Menara Tangga Ujung Utara Asrama Terbuka (Aksen Terakota Ramping) */}
      <group position={[0, 0, -mainWing.dimensions[2] / 2 - 1.8]} name="menara_tangga_utara">
        {[
          [-3.2, -1.5],
          [3.2, -1.5],
          [-3.2, 1.5],
          [3.2, 1.5],
        ].map(([px, pz], idx) => (
          <mesh key={`st_col_${idx}`} position={[px, 1.5, pz]} castShadow receiveShadow material={materials.wallWhite}>
            <boxGeometry args={[0.6, 15.0, 0.6]} />
          </mesh>
        ))}

        {[-6.0, -3.0, 0.0, 3.0, 6.0].map((floorY, idx) => (
          <group key={`st_lvl_${idx}`} position={[0, floorY, 0]}>
            <mesh position={[0, 0.1, 0]} receiveShadow castShadow material={materials.concreteCurb}>
              <boxGeometry args={[6.6, 0.2, 3.2]} />
            </mesh>
            {/* Aksen Terakota Ramping */}
            <mesh position={[0, 1.35, -1.72]} material={materials.terracottaBrick}>
              <boxGeometry args={[6.2, 0.28, 0.1]} />
            </mesh>
            <mesh position={[3.42, 1.35, 0]} material={materials.terracottaBrick}>
              <boxGeometry args={[0.1, 0.28, 3.0]} />
            </mesh>
            {idx < 4 && (
              <group position={[0, 1.5, 0]}>
                <mesh rotation={[0, 0, 0.45]} castShadow material={materials.stairs}>
                  <boxGeometry args={[5.2, 0.25, 1.3]} />
                </mesh>
                <mesh position={[0, 0.55, 0.65]} rotation={[0, 0, 0.45]} material={materials.metalRailing}>
                  <boxGeometry args={[5.2, 0.05, 0.05]} />
                </mesh>
              </group>
            )}
          </group>
        ))}

        <mesh position={[0, 9.04, 0]} receiveShadow material={materials.roofFascia}>
          <boxGeometry args={[6.9, 0.12, 3.5]} />
        </mesh>
        <HippedRoof width={6.8} depth={3.4} height={0.9} position={[0, 9.1, 0]} material={materials.roofDark} />
      </group>

      {/* 6. Atap Limas Proporsional Asrama */}
      {wings.map((wing) => (
        <group key={`roof_${wing.id}`} position={[wing.position[0], 9.0, wing.position[2]]}>
          <mesh position={[0, 0.07, 0]} receiveShadow material={materials.roofFascia}>
            <boxGeometry args={[wing.dimensions[0] + 0.55, 0.14, wing.dimensions[2] + 0.55]} />
          </mesh>
          <HippedRoof
            width={wing.dimensions[0] + 0.48}
            depth={wing.dimensions[2] + 0.48}
            height={1.65}
            position={[0, 0.14, 0]}
            material={materials.roofDark}
          />
        </group>
      ))}

      {/* Volume Debug Sirkulasi Vertikal (Hanya tampil saat Cutaway Aktif) */}
      {cutawayMode && (
        <group position={circulationPlaceholder.position}>
          <mesh material={materials.conceptualStairs}>
            <boxGeometry args={circulationPlaceholder.dimensions} />
          </mesh>
          <DistanceLimitedSpriteLabel
            labelId="lbl_asrama_circ"
            text="SIRKULASI ASRAMA"
            position={[0, circulationPlaceholder.dimensions[1] / 2 + 1.0, 0]}
            isConceptual
          />
        </group>
      )}
    </group>
  );
}

// Gedung Sekolah Realistis + Atap Limas Proporsional
function SekolahBuildingReal({
  definition,
  materials,
  showLabels,
  cutawayMode,
}: {
  definition: BuildingDefinition;
  materials: Record<string, THREE.Material>;
  showLabels: boolean;
  cutawayMode: boolean;
}) {
  const { basePosition, floors, wings, circulationPlaceholder, name } = definition;

  return (
    <group position={basePosition} name="gedung_sekolah_real">
      {/* 1. Pondasi Datar di bawah pelat lantai LT 1 (-9.2m) */}
      {wings.map((wing) => (
        <mesh
          key={`sekolah_found_${wing.id}`}
          position={[wing.position[0], -0.9, wing.position[2]]}
          receiveShadow
          material={materials.foundation}
        >
          <boxGeometry args={[wing.dimensions[0] + 0.4, 1.4, wing.dimensions[2] + 0.4]} />
        </mesh>
      ))}

      {/* 2. Interior & Selubung Arsitektural 3 Lantai (Koordinat Dunia) */}
      <group position={[-basePosition[0], -basePosition[1], -basePosition[2]]}>
        <SekolahInterior
          materials={materials}
          cutawayMode={cutawayMode}
          showLabels={showLabels}
        />
      </group>

      {/* Label Lantai Khusus Mode Inspeksi */}
      {(showLabels || cutawayMode) &&
        floors.map((floor) => (
          <DistanceLimitedSpriteLabel
            key={`lbl_sekolah_${floor.id}`}
            labelId={`lbl_sekolah_${floor.id}`}
            text={`${name} - ${floor.label} (${floor.floorSlabElevation >= 0 ? '+' : ''}${floor.floorSlabElevation.toFixed(1)}m)`}
            position={[wings[0].position[0], floor.relativeY, wings[0].position[2] + wings[0].dimensions[2] / 2 + 1.2]}
            isConceptual
            maxDistance={cutawayMode ? 135 : 42}
          />
        ))}

      {/* 3. Atap Limas Proporsional Sekolah (Tanpa Pelat Kotak Hitam Lebar) */}
      {!cutawayMode &&
        wings.map((wing) => (
          <group key={`sekolah_roof_${wing.id}`} position={[wing.position[0], 10.2, wing.position[2]]}>
            <mesh position={[0, 0.06, 0]} receiveShadow material={materials.roofFascia}>
              <boxGeometry args={[wing.dimensions[0] + 0.48, 0.14, wing.dimensions[2] + 0.48]} />
            </mesh>
            <HippedRoof
              width={wing.dimensions[0] + 0.44}
              depth={wing.dimensions[2] + 0.44}
              height={1.55}
              position={[0, 0.13, 0]}
              material={materials.roofDark}
            />
          </group>
        ))}

      {/* Penanda Sirkulasi Tangga U saat Cutaway Aktif */}
      {cutawayMode && (
        <DistanceLimitedSpriteLabel
          labelId="lbl_sekolah_circ"
          text="TANGGA U SEKOLAH"
          position={[
            circulationPlaceholder.position[0],
            circulationPlaceholder.position[1] + circulationPlaceholder.dimensions[1] / 2 + 1.0,
            circulationPlaceholder.position[2],
          ]}
          isConceptual
        />
      )}
    </group>
  );
}
