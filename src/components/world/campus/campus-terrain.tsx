"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CAMPUS_LAYOUT } from '@/lib/world/campus-layout';
import { GRASS_CONCEPTUAL_PALETTE } from '@/lib/world/campus-palette';
import { getTerrainHeight, getTerrainSlope } from '@/lib/world/terrain';

interface CampusTerrainProps {
  clippingPlanes?: THREE.Plane[];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function isInsideBox(x: number, z: number, minX: number, maxX: number, minZ: number, maxZ: number): boolean {
  return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
}

export function CampusTerrain({ clippingPlanes = [] }: CampusTerrainProps) {
  // Material medan padat memakai vertexColors agar rumput/lereng/peron bernuansa natural & terang
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
      clippingPlanes,
      clipShadows: true,
      side: THREE.FrontSide,
    });
  }, [clippingPlanes]);

  const horizonMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
  }, []);

  // Geometri medan berkontur padat (permukaan + pewarnaan per-vertex + skirt penahan)
  const geometry = useMemo(() => {
    const [dimX, dimZ] = CAMPUS_LAYOUT.terrain.dimensions;
    const [resX, resZ] = CAMPUS_LAYOUT.terrain.resolution;
    const skirtBottomY = CAMPUS_LAYOUT.terrain.skirtDepth;

    const segX = resX - 1;
    const segZ = resZ - 1;
    const planeGeom = new THREE.PlaneGeometry(dimX, dimZ, segX, segZ);
    planeGeom.rotateX(-Math.PI / 2);

    const posAttr = planeGeom.attributes.position as THREE.BufferAttribute;
    const vertexCount = posAttr.count;
    const mainColors = new Float32Array(vertexCount * 3);

    const colMeadow = new THREE.Color(GRASS_CONCEPTUAL_PALETTE.terrainMeadow);
    const colOlive = new THREE.Color(GRASS_CONCEPTUAL_PALETTE.terrainSlopeOlive);
    const colEarth = new THREE.Color(GRASS_CONCEPTUAL_PALETTE.terrainEarthShoulder);
    const colPad = new THREE.Color(GRASS_CONCEPTUAL_PALETTE.terrainConcretePad);
    const colHorizon = new THREE.Color(GRASS_CONCEPTUAL_PALETTE.terrainHorizonBlend);
    const tempCol = new THREE.Color();

    for (let i = 0; i < vertexCount; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getTerrainHeight(x, z);
      posAttr.setY(i, y);

      const slope = getTerrainSlope(x, z, 0.8);
      const distFromCenter = Math.hypot(x, z);

      // Dasar warna padang rumput cerah yang menyatu dengan bilah rumput
      const slopeMix = clamp(slope * 0.9, 0, 1);
      tempCol.copy(colMeadow).lerp(colOlive, slopeMix * 0.55);

      // Bahu lereng curam hanya bergeser tipis ke zaitun lembut (tanpa bercak cokelat kamuflase)
      if (slope > 0.5) {
        const earthMix = clamp((slope - 0.5) / 0.65, 0, 0.35);
        tempCol.lerp(colEarth, earthMix);
      }

      // Peron beton hanya tepat di bawah jejak bangunan & jalur utama (tidak melebar di bawah rumput)
      const onPad =
        isInsideBox(x, z, -28.8, -15.2, -24.2, 12.2) || // Asrama Utama
        isInsideBox(x, z, -38.8, -26.2, -0.2, 14.2) || // Asrama Sayap Barat
        isInsideBox(x, z, -14.8, -5.2, 4.3, 11.8) || // Loby Asrama
        isInsideBox(x, z, 3.8, 16.2, 13.0, 26.2) || // Masjid konseptual
        isInsideBox(x, z, 7.8, 36.2, -35.8, -24.2) || // Sekolah Utara
        isInsideBox(x, z, 24.8, 36.2, -24.2, -3.5) || // Sekolah Timur
        isInsideBox(x, z, 8.5, 25.0, -25.0, -21.2) || // Pelataran Depan Sekolah
        isInsideBox(x, z, -2.8, 2.8, 9.8, 39.0); // Jalan Turunan
      if (onPad) {
        tempCol.lerp(colPad, 0.72);
      }

      // Baurkan tepi jauh (> 68m) menuju warna horizon agar mulus ke apron
      if (distFromCenter > 68) {
        const horizonMix = clamp((distFromCenter - 68) / 88, 0, 0.92);
        tempCol.lerp(colHorizon, horizonMix);
      }

      mainColors[i * 3] = tempCol.r;
      mainColors[i * 3 + 1] = tempCol.g;
      mainColors[i * 3 + 2] = tempCol.b;
    }

    // Dinding skirt bawah agar tertutup rapat saat cutaway
    const halfX = dimX / 2;
    const halfZ = dimZ / 2;
    const skirtVertices: number[] = [];
    const skirtColors: number[] = [];
    const skirtIndices: number[] = [];

    const addSkirtQuad = (x1: number, z1: number, x2: number, z2: number) => {
      const y1 = getTerrainHeight(x1, z1);
      const y2 = getTerrainHeight(x2, z2);
      const baseIdx = skirtVertices.length / 3;

      skirtVertices.push(
        x1, y1, z1,
        x1, skirtBottomY, z1,
        x2, skirtBottomY, z2,
        x2, y2, z2
      );
      for (let k = 0; k < 4; k++) {
        skirtColors.push(colHorizon.r * 0.7, colHorizon.g * 0.7, colHorizon.b * 0.7);
      }
      skirtIndices.push(
        baseIdx, baseIdx + 1, baseIdx + 2,
        baseIdx, baseIdx + 2, baseIdx + 3
      );
    };

    const skirtSteps = 64;
    for (let i = 0; i < skirtSteps; i++) {
      const t1 = i / skirtSteps;
      const t2 = (i + 1) / skirtSteps;
      addSkirtQuad(-halfX + t1 * dimX, halfZ, -halfX + t2 * dimX, halfZ);
      addSkirtQuad(halfX - t1 * dimX, -halfZ, halfX - t2 * dimX, -halfZ);
      addSkirtQuad(halfX, halfZ - t1 * dimZ, halfX, halfZ - t2 * dimZ);
      addSkirtQuad(-halfX, -halfZ + t1 * dimZ, -halfX, -halfZ + t2 * dimZ);
    }

    const baseFloorIdx = skirtVertices.length / 3;
    skirtVertices.push(
      -halfX, skirtBottomY, -halfZ,
       halfX, skirtBottomY, -halfZ,
       halfX, skirtBottomY,  halfZ,
      -halfX, skirtBottomY,  halfZ
    );
    for (let k = 0; k < 4; k++) {
      skirtColors.push(colHorizon.r * 0.5, colHorizon.g * 0.5, colHorizon.b * 0.5);
    }
    skirtIndices.push(
      baseFloorIdx, baseFloorIdx + 1, baseFloorIdx + 2,
      baseFloorIdx, baseFloorIdx + 2, baseFloorIdx + 3
    );

    const combinedGeom = new THREE.BufferGeometry();
    const mainPos = posAttr.array as Float32Array;
    const mainIndices = planeGeom.index?.array as Uint32Array;

    const totalVertices = new Float32Array(mainPos.length + skirtVertices.length);
    totalVertices.set(mainPos, 0);
    totalVertices.set(skirtVertices, mainPos.length);

    const totalColors = new Float32Array(mainColors.length + skirtColors.length);
    totalColors.set(mainColors, 0);
    totalColors.set(skirtColors, mainColors.length);

    const offsetIdx = mainPos.length / 3;
    const totalIndices: number[] = Array.from(mainIndices);
    for (let i = 0; i < skirtIndices.length; i++) {
      totalIndices.push(skirtIndices[i] + offsetIdx);
    }

    combinedGeom.setAttribute('position', new THREE.BufferAttribute(totalVertices, 3));
    combinedGeom.setAttribute('color', new THREE.BufferAttribute(totalColors, 3));
    combinedGeom.setIndex(totalIndices);
    combinedGeom.computeVertexNormals();

    planeGeom.dispose();
    return combinedGeom;
  }, []);

  // Apron horizon luar (180m -> 620m) menyambung tepat pada ketinggian tepi medan tanpa celah garis
  const horizonGeometry = useMemo(() => {
    const innerHalf = CAMPUS_LAYOUT.terrain.dimensions[0] / 2; // Tepat 180.0m menyentuh tepi medan
    const stepsPerSide = 64;
    const perimeterSteps = stepsPerSide * 4;

    const colHorizon = new THREE.Color(GRASS_CONCEPTUAL_PALETTE.terrainHorizonBlend);
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const getPerimeterPoint = (step: number): [number, number] => {
      const s = step % perimeterSteps;
      const side = Math.floor(s / stepsPerSide);
      const t = (s % stepsPerSide) / stepsPerSide;
      if (side === 0) return [-innerHalf + t * (innerHalf * 2), innerHalf];
      if (side === 1) return [innerHalf, innerHalf - t * (innerHalf * 2)];
      if (side === 2) return [innerHalf - t * (innerHalf * 2), -innerHalf];
      return [-innerHalf, -innerHalf + t * (innerHalf * 2)];
    };

    for (let i = 0; i <= perimeterSteps; i++) {
      const [ix, iz] = getPerimeterPoint(i);
      const iy = getTerrainHeight(ix, iz);
      const dist = Math.max(1e-4, Math.hypot(ix, iz));
      const outerRadius = 620;
      const ox = (ix / dist) * outerRadius;
      const oz = (iz / dist) * outerRadius;
      const oy = iy - 3.5;

      positions.push(ix, iy, iz, ox, oy, oz);
      colors.push(colHorizon.r, colHorizon.g, colHorizon.b, colHorizon.r, colHorizon.g, colHorizon.b);

      if (i < perimeterSteps) {
        const a = i * 2;
        const b = (i + 1) * 2;
        // Menghadap ke atas (+Y)
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      horizonGeometry.dispose();
      horizonMaterial.dispose();
    };
  }, [geometry, material, horizonGeometry, horizonMaterial]);

  return (
    <group name="campus_terrain_group">
      <mesh
        geometry={geometry}
        material={material}
        receiveShadow
        castShadow={false}
        name="campus_solid_terrain"
      />
      {clippingPlanes.length === 0 && (
        <mesh
          geometry={horizonGeometry}
          material={horizonMaterial}
          receiveShadow={false}
          castShadow={false}
          name="campus_horizon_apron"
        />
      )}
    </group>
  );
}
