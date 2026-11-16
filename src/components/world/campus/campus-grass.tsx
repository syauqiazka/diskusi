"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CAMPUS_LAYOUT } from '@/lib/world/campus-layout';
import { GRASS_CONCEPTUAL_PALETTE } from '@/lib/world/campus-palette';
import { getTerrainHeight, getTerrainSlope } from '@/lib/world/terrain';

interface CampusGrassProps {
  focalPoint?: [number, number, number];
}

function distToSegmentSq2D(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
): number {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq <= 1e-6) {
    return (px - ax) * (px - ax) + (pz - az) * (pz - az);
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  const cx = ax + t * dx;
  const cz = az + t * dz;
  return (px - cx) * (px - cx) + (pz - cz) * (pz - cz);
}

export function CampusGrass({ focalPoint = [0, 0, -4] }: CampusGrassProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const config = CAMPUS_LAYOUT.grass;
  const exclusionZones = CAMPUS_LAYOUT.exclusionZones;

  // Geometri rumpun rumput halus 3 bilah tipis (normal +Y agar menyatu lembut dengan tanah hijau)
  const bladeHeight = 0.16;
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const w = 0.032;
    const h = bladeHeight;

    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const addBladePlane = (angleRad: number, offsetX: number, offsetZ: number) => {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const rot = (lx: number, ly: number, lz: number): [number, number, number] => [
        offsetX + lx * cos - lz * sin,
        ly,
        offsetZ + lx * sin + lz * cos,
      ];

      const localVerts: [number, number, number, number][] = [
        [-w / 2, 0, 0, 0.84],
        [w / 2, 0, 0, 0.84],
        [w * 0.22, h, 0.022, 1.12],
        [-w * 0.22, h, 0.022, 1.12],
      ];

      // Sisi depan (quad tunggal = 2 segitiga)
      const frontBase = positions.length / 3;
      for (const [vx, vy, vz, shade] of localVerts) {
        const [rx, ry, rz] = rot(vx, vy, vz);
        positions.push(rx, ry, rz);
        normals.push(0, 1, 0);
        colors.push(shade, shade, shade);
      }
      indices.push(frontBase + 0, frontBase + 1, frontBase + 2, frontBase + 0, frontBase + 2, frontBase + 3);

      // Sisi belakang (winding dibalik, normal TETAP +Y)
      const backBase = positions.length / 3;
      for (const [vx, vy, vz, shade] of localVerts) {
        const [rx, ry, rz] = rot(vx, vy, vz);
        positions.push(rx, ry, rz);
        normals.push(0, 1, 0);
        colors.push(shade, shade, shade);
      }
      indices.push(backBase + 0, backBase + 2, backBase + 1, backBase + 0, backBase + 3, backBase + 2);
    };

    // 2 bilah tipis bersilangan membentuk rumpun rapi & ringan
    addBladePlane(0, -0.012, 0.005);
    addBladePlane(Math.PI / 2.5, 0.012, -0.006);

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);

    return geom;
  }, []);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uWindSpeed: { value: config.windSpeed },
      uWindStrength: { value: config.windStrength },
    };
  }, [config.windSpeed, config.windStrength]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.FrontSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uWindSpeed = uniforms.uWindSpeed;
      shader.uniforms.uWindStrength = uniforms.uWindStrength;

      shader.vertexShader = `
        uniform float uTime;
        uniform float uWindSpeed;
        uniform float uWindStrength;
        ${shader.vertexShader}
      `;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float hNorm = clamp(position.y / ${bladeHeight.toFixed(2)}, 0.0, 1.0);
        float wave = sin(uTime * uWindSpeed + position.x * 3.0 + position.z * 2.2);
        float sway = hNorm * hNorm * uWindStrength * wave;
        transformed.x += sway;
        transformed.z += sway * 0.35;
        `
      );
    };

    return mat;
  }, [uniforms]);

  const instanceData = useMemo(() => {
    const maxBlades = config.maxBlades;
    const radius = config.radius;
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];

    const baseCol = new THREE.Color(config.baseColor);
    const midCol = new THREE.Color(GRASS_CONCEPTUAL_PALETTE.bladeVariation);
    const varCol = new THREE.Color(config.variationColor);

    const isExcluded = (x: number, z: number) => {
      const margin = 0.35;
      for (let i = 0; i < exclusionZones.length; i++) {
        const zone = exclusionZones[i];
        if (
          x >= zone.minX - margin &&
          x <= zone.maxX + margin &&
          z >= zone.minZ - margin &&
          z <= zone.maxZ + margin
        ) {
          return true;
        }
      }

      // Pengecualian presisi di sepanjang tangga lansekap, talud, dan jalur sirkulasi
      for (let i = 0; i < CAMPUS_LAYOUT.landscapeStairs.length; i++) {
        const st = CAMPUS_LAYOUT.landscapeStairs[i];
        const pad = st.width * 0.5 + 0.65;
        if (distToSegmentSq2D(x, z, st.start[0], st.start[2], st.end[0], st.end[2]) <= pad * pad) {
          return true;
        }
      }

      for (let i = 0; i < CAMPUS_LAYOUT.pathways.length; i++) {
        const p = CAMPUS_LAYOUT.pathways[i];
        const pad = p.width * 0.5 + 0.55;
        if (distToSegmentSq2D(x, z, p.start[0], p.start[2], p.end[0], p.end[2]) <= pad * pad) {
          return true;
        }
      }

      for (let i = 0; i < CAMPUS_LAYOUT.retainingWalls.length; i++) {
        const w = CAMPUS_LAYOUT.retainingWalls[i];
        const pad = w.thickness * 0.5 + 0.7;
        if (distToSegmentSq2D(x, z, w.start[0], w.start[2], w.end[0], w.end[2]) <= pad * pad) {
          return true;
        }
      }

      for (let i = 0; i < CAMPUS_LAYOUT.perimeterFence.runs.length; i++) {
        const f = CAMPUS_LAYOUT.perimeterFence.runs[i];
        const pad = 0.75;
        if (distToSegmentSq2D(x, z, f.start[0], f.start[1], f.end[0], f.end[1]) <= pad * pad) {
          return true;
        }
      }

      // Hindari tebing nyaris vertikal (> 0.90) agar bilah tidak menembus dinding tangga/planter
      if (getTerrainSlope(x, z, 0.5) > 0.9) {
        return true;
      }

      return false;
    };

    let seed = 1337;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    let attempts = 0;
    const maxAttempts = maxBlades * 6;

    while (matrices.length < maxBlades && attempts < maxAttempts) {
      attempts++;

      const angle = pseudoRandom() * Math.PI * 2;
      const r = Math.pow(pseudoRandom(), 0.62) * radius;
      const x = focalPoint[0] + Math.cos(angle) * r;
      const z = focalPoint[2] + Math.sin(angle) * r;

      if (isExcluded(x, z)) {
        continue;
      }

      const terrainY = getTerrainHeight(x, z);
      const scaleXZ = 0.85 + pseudoRandom() * 0.45;
      const scaleY = 0.72 + pseudoRandom() * 0.55;
      const rotY = pseudoRandom() * Math.PI * 2;
      const tiltX = (pseudoRandom() - 0.5) * 0.14;

      dummy.position.set(x, terrainY - 0.01, z);
      dummy.rotation.set(tiltX, rotY, 0);
      dummy.scale.set(scaleXZ, scaleY, scaleXZ);
      dummy.updateMatrix();

      matrices.push(dummy.matrix.clone());

      const t = pseudoRandom();
      const col =
        t < 0.5
          ? baseCol.clone().lerp(midCol, t * 2)
          : midCol.clone().lerp(varCol, (t - 0.5) * 2);
      colors.push(col);
    }

    return { matrices, colors };
  }, [config.maxBlades, config.radius, config.baseColor, config.variationColor, exclusionZones, focalPoint]);

  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const count = instanceData.matrices.length;

    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, instanceData.matrices[i]);
      mesh.setColorAt(i, instanceData.colors[i]);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
  }, [instanceData]);

  useFrame((_, delta) => {
    if (reducedMotionRef.current) {
      uniforms.uWindStrength.value = 0.0;
      return;
    }

    uniforms.uWindStrength.value = config.windStrength;
    timeRef.current += delta;
    uniforms.uTime.value = timeRef.current;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instanceData.matrices.length]}
      receiveShadow
      castShadow={false}
      name="campus_instanced_grass"
    />
  );
}
