"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CAMPUS_LAYOUT, InteractableDefinition } from '@/lib/world/campus-layout';
import { CAMPUS_PALETTE } from '@/lib/world/campus-palette';
import { removeLabelCandidate, updateLabelCandidate } from '@/lib/world/label-budget';
import { useWorldStore } from '@/stores/use-world-store';
import { INTERACTABLE_LAYER } from '@/lib/world/selection';

const _markerPos = new THREE.Vector3();

function MarkerLabel({
  labelId,
  title,
  subtitle,
  position,
  highlighted,
}: {
  labelId: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  highlighted: boolean;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const frameRef = useRef(0);
  const { camera } = useThree();

  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 112);
    ctx.fillStyle = CAMPUS_PALETTE.labels.bg;
    ctx.fillRect(6, 6, 500, 100);

    ctx.strokeStyle = highlighted ? CAMPUS_PALETTE.labels.borderHighlight : CAMPUS_PALETTE.labels.border;
    ctx.lineWidth = highlighted ? 4 : 2;
    ctx.strokeRect(6, 6, 500, 100);

    ctx.fillStyle = highlighted ? CAMPUS_PALETTE.labels.borderHighlight : CAMPUS_PALETTE.labels.text;
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 256, 42);

    ctx.fillStyle = CAMPUS_PALETTE.labels.conceptualTag;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(subtitle, 256, 78);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [title, subtitle, highlighted]);

  useEffect(() => {
    return () => {
      texture?.dispose();
      removeLabelCandidate(labelId);
    };
  }, [texture, labelId]);

  useFrame(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;
    frameRef.current += 1;
    sprite.getWorldPosition(_markerPos);
    const distSq = camera.position.distanceToSquared(_markerPos);
    const allowed = distSq <= 26 * 26 && updateLabelCandidate(labelId, distSq, frameRef.current);
    sprite.visible = allowed;
  });

  if (!texture) return null;

  return (
    <sprite ref={spriteRef} position={position} scale={[2.4, 0.525, 1]}>
      <spriteMaterial map={texture} transparent depthTest={true} depthWrite={false} />
    </sprite>
  );
}

function InteractableRoot({
  item,
  children,
}: {
  item: InteractableDefinition;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.layers.enable(INTERACTABLE_LAYER);
        obj.userData.interactableId = item.id;
      }
    });
  }, [item.id]);

  return (
    <group
      ref={groupRef}
      position={item.position}
      rotation={[0, item.rotationY, 0]}
      name={`interactable_${item.id}`}
    >
      {children}
    </group>
  );
}

function DoorMarker({
  item,
  highlighted,
  isOpen,
  showLabels,
}: {
  item: InteractableDefinition;
  highlighted: boolean;
  isOpen: boolean;
  showLabels: boolean;
}) {
  const hingeRef = useRef<THREE.Group>(null);
  const highlightColor = highlighted ? '#F2C200' : '#000000';
  const highlightEmissive = highlighted ? 0.28 : 0;

  useFrame((_, delta) => {
    if (!hingeRef.current) return;
    const targetRot = item.isLocked ? 0 : isOpen ? -1.15 : 0;
    const dt = Math.min(delta, 0.1);
    hingeRef.current.rotation.y += (targetRot - hingeRef.current.rotation.y) * (1 - Math.exp(-10 * dt));
  });

  // Pintu disusun lokal menghadap +Z (lebar X=1.4m, tinggi Y=2.3m)
  // Catatan: untuk door_lobby_asrama, rotationY=PI/2 memutar +Z menjadi +X (menghadap turunan)
  return (
    <InteractableRoot item={item}>
      {/* Kusen Pintu */}
      <mesh position={[-0.68, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 2.3, 0.22]} />
        <meshStandardMaterial color="#18181b" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.68, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 2.3, 0.22]} />
        <meshStandardMaterial color="#18181b" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.26, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.48, 0.12, 0.24]} />
        <meshStandardMaterial color="#18181b" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Daun Pintu berengsel */}
      <group ref={hingeRef} position={[-0.6, 0, 0]}>
        <mesh position={[0.6, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 2.18, 0.12]} />
          <meshStandardMaterial
            color={item.isLocked ? '#573626' : '#7c4a2d'}
            roughness={0.72}
            emissive={highlightColor}
            emissiveIntensity={highlightEmissive}
          />
        </mesh>
        {/* Gagang Pintu */}
        <mesh position={[1.05, 1.02, 0.08]}>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshStandardMaterial color="#F2C200" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Indikator Kunci apabila terkunci */}
        {item.isLocked && (
          <mesh position={[0.6, 1.48, 0.075]}>
            <boxGeometry args={[0.42, 0.18, 0.03]} />
            <meshStandardMaterial color="#E0412F" roughness={0.4} />
          </mesh>
        )}
      </group>

      {showLabels && (
        <MarkerLabel
          labelId={`lbl_marker_${item.id}`}
          title={item.isLocked ? 'PINTU TERKUNCI' : 'PINTU LOBY'}
          subtitle="DESAIN KONSEPTUAL"
          position={[0, 2.75, 0]}
          highlighted={highlighted}
        />
      )}
    </InteractableRoot>
  );
}

function MadingMarker({
  item,
  highlighted,
  showLabels,
}: {
  item: InteractableDefinition;
  highlighted: boolean;
  showLabels: boolean;
}) {
  const emissive = highlighted ? '#F2C200' : '#000000';
  const emissiveIntensity = highlighted ? 0.25 : 0;

  return (
    <InteractableRoot item={item}>
      {/* Tiang Penyangga */}
      <mesh position={[-0.72, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 2.0, 0.1]} />
        <meshStandardMaterial color="#18181b" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0.72, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 2.0, 0.1]} />
        <meshStandardMaterial color="#18181b" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Papan Mading */}
      <mesh position={[0, 1.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 1.05, 0.12]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.65}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Pita Header Rambu Kuning */}
      <mesh position={[0, 1.76, 0.07]}>
        <boxGeometry args={[1.32, 0.12, 0.02]} />
        <meshStandardMaterial color="#F2C200" roughness={0.4} />
      </mesh>

      {/* Lembar Pengumuman */}
      <mesh position={[-0.36, 1.32, 0.07]}>
        <boxGeometry args={[0.42, 0.56, 0.015]} />
        <meshStandardMaterial color="#E9F2E3" roughness={0.8} />
      </mesh>
      <mesh position={[0.26, 1.36, 0.07]}>
        <boxGeometry args={[0.5, 0.48, 0.015]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>

      {showLabels && (
        <MarkerLabel
          labelId={`lbl_marker_${item.id}`}
          title="MADING KAMPUS"
          subtitle="DESAIN KONSEPTUAL"
          position={[0, 2.45, 0]}
          highlighted={highlighted}
        />
      )}
    </InteractableRoot>
  );
}

function LibraryKioskMarker({
  item,
  highlighted,
  showLabels,
}: {
  item: InteractableDefinition;
  highlighted: boolean;
  showLabels: boolean;
}) {
  const emissive = highlighted ? '#F2C200' : '#000000';
  const emissiveIntensity = highlighted ? 0.25 : 0;

  return (
    <InteractableRoot item={item}>
      {/* Alas Beton Tipis */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.12, 1.0]} />
        <meshStandardMaterial color="#64748b" roughness={0.85} />
      </mesh>

      {/* Badan Rak Buku Kios */}
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 1.6, 0.65]} />
        <meshStandardMaterial
          color="#7c4a2d"
          roughness={0.72}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Buku-buku Konseptual */}
      <mesh position={[-0.3, 1.15, 0.34]}>
        <boxGeometry args={[0.45, 0.26, 0.08]} />
        <meshStandardMaterial color="#5CE1FF" roughness={0.6} />
      </mesh>
      <mesh position={[0.25, 1.15, 0.34]}>
        <boxGeometry args={[0.45, 0.26, 0.08]} />
        <meshStandardMaterial color="#F2C200" roughness={0.6} />
      </mesh>

      {/* Atap Kanopi Kios */}
      <mesh position={[0, 1.82, 0]} castShadow>
        <boxGeometry args={[1.5, 0.12, 1.05]} />
        <meshStandardMaterial color="#18181b" roughness={0.45} metalness={0.5} />
      </mesh>

      {showLabels && (
        <MarkerLabel
          labelId={`lbl_marker_${item.id}`}
          title="PERPUSTAKAAN TERBUKA"
          subtitle="DESAIN KONSEPTUAL"
          position={[0, 2.45, 0]}
          highlighted={highlighted}
        />
      )}
    </InteractableRoot>
  );
}

function LockerMarker({
  item,
  highlighted,
  showLabels,
}: {
  item: InteractableDefinition;
  highlighted: boolean;
  showLabels: boolean;
}) {
  const emissive = highlighted ? '#F2C200' : '#000000';
  const emissiveIntensity = highlighted ? 0.28 : 0;

  return (
    <InteractableRoot item={item}>
      {/* Badan Loker 3 Kolom */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.9, 0.45]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.55}
          metalness={0.45}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Garis Pemisah Kolom Loker */}
      {[-0.42, 0, 0.42].map((lx, idx) => (
        <mesh key={`locker_slot_${idx}`} position={[lx, 0.95, 0.235]}>
          <boxGeometry args={[0.36, 1.72, 0.02]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* Plat Nomor Kuning */}
      {[-0.42, 0, 0.42].map((lx, idx) => (
        <mesh key={`locker_tag_${idx}`} position={[lx, 1.65, 0.25]}>
          <boxGeometry args={[0.14, 0.07, 0.015]} />
          <meshStandardMaterial color="#F2C200" roughness={0.4} />
        </mesh>
      ))}

      {showLabels && (
        <MarkerLabel
          labelId={`lbl_marker_${item.id}`}
          title="LOKER SISWA"
          subtitle="DESAIN KONSEPTUAL"
          position={[0, 2.45, 0]}
          highlighted={highlighted}
        />
      )}
    </InteractableRoot>
  );
}

function MirrorMarker({
  item,
  highlighted,
  showLabels,
}: {
  item: InteractableDefinition;
  highlighted: boolean;
  showLabels: boolean;
}) {
  const emissive = highlighted ? '#F2C200' : '#000000';
  const emissiveIntensity = highlighted ? 0.3 : 0;

  return (
    <InteractableRoot item={item}>
      {/* Bingkai Cermin */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.95, 0.14]} />
        <meshStandardMaterial
          color="#18181b"
          roughness={0.45}
          metalness={0.7}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Permukaan Kaca Reflektif */}
      <mesh position={[0, 1.04, 0.08]}>
        <boxGeometry args={[0.84, 1.72, 0.02]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.08} metalness={0.92} />
      </mesh>

      {/* Aksen Neon Tipis di Bawah Bingkai */}
      <mesh position={[0, 0.14, 0.08]}>
        <boxGeometry args={[0.84, 0.05, 0.03]} />
        <meshStandardMaterial
          color="#5CE1FF"
          emissive="#5CE1FF"
          emissiveIntensity={highlighted ? 0.9 : 0.4}
        />
      </mesh>

      {showLabels && (
        <MarkerLabel
          labelId={`lbl_marker_${item.id}`}
          title="CERMIN PROFIL"
          subtitle="DESAIN KONSEPTUAL"
          position={[0, 2.45, 0]}
          highlighted={highlighted}
        />
      )}
    </InteractableRoot>
  );
}

export function InteractableMarkers({ showLabels = true }: { showLabels?: boolean }) {
  const hoveredId = useWorldStore((s) => s.hoveredInteractable?.id ?? null);
  const doorStates = useWorldStore((s) => s.doorStates);

  if (!CAMPUS_LAYOUT.showConceptualInteractables) {
    return null;
  }

  return (
    <group name="campus_interactables_root">
      {CAMPUS_LAYOUT.interactables.map((item) => {
        const highlighted = hoveredId === item.id;
        if (item.type === 'door') {
          return (
            <DoorMarker
              key={item.id}
              item={item}
              highlighted={highlighted}
              isOpen={Boolean(doorStates[item.id])}
              showLabels={showLabels}
            />
          );
        }
        if (item.type === 'mading') {
          return (
            <MadingMarker
              key={item.id}
              item={item}
              highlighted={highlighted}
              showLabels={showLabels}
            />
          );
        }
        if (item.type === 'library') {
          return (
            <LibraryKioskMarker
              key={item.id}
              item={item}
              highlighted={highlighted}
              showLabels={showLabels}
            />
          );
        }
        if (item.type === 'locker') {
          return (
            <LockerMarker
              key={item.id}
              item={item}
              highlighted={highlighted}
              showLabels={showLabels}
            />
          );
        }
        return (
          <MirrorMarker
            key={item.id}
            item={item}
            highlighted={highlighted}
            showLabels={showLabels}
          />
        );
      })}
    </group>
  );
}
