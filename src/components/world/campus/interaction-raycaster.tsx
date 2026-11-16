"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMPUS_LAYOUT } from '@/lib/world/campus-layout';
import { SCHOOL_INTERIOR_INTERACTABLES } from '@/lib/world/school-interior-layout';
import { useWorldStore } from '@/stores/use-world-store';
import {
  INTERACTABLE_LAYER,
  MAX_INTERACT_DISTANCE,
  RaycastTargetHit,
  selectBestInteractionTarget,
} from '@/lib/world/selection';

function resolveInteractableId(obj: THREE.Object3D | null): string | null {
  let curr: THREE.Object3D | null = obj;
  while (curr) {
    if (typeof curr.userData?.interactableId === 'string') {
      return curr.userData.interactableId;
    }
    curr = curr.parent;
  }
  return null;
}

export function InteractionRaycaster() {
  const { camera, scene } = useThree();

  // Pra-alokasi raycaster, vector pusat layar, dan buffer intersection di luar useFrame
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const centerNdcRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const scanTargetsRef = useRef<THREE.Object3D[]>([]);
  const intersectionsRef = useRef<THREE.Intersection[]>([]);
  const hitsBufferRef = useRef<RaycastTargetHit[]>([]);
  const lastHoveredIdRef = useRef<string | null>(null);
  const lastHoveredDistRef = useRef<number>(-1);

  useEffect(() => {
    const rc = raycasterRef.current;
    rc.near = 0.05;
    rc.far = MAX_INTERACT_DISTANCE;
    rc.layers.set(INTERACTABLE_LAYER);
  }, []);

  useFrame(() => {
    const state = useWorldStore.getState();

    if (
      state.cameraMode !== 'fps' ||
      state.isPaused ||
      state.activePanel !== null ||
      !CAMPUS_LAYOUT.showConceptualInteractables
    ) {
      if (lastHoveredIdRef.current !== null) {
        lastHoveredIdRef.current = null;
        lastHoveredDistRef.current = -1;
        state.setHoveredInteractable(null);
      }
      return;
    }

    const scanTargets = scanTargetsRef.current;
    scanTargets.length = 0;
    const outdoorRoot = scene.getObjectByName('campus_interactables_root');
    if (outdoorRoot) scanTargets.push(outdoorRoot);
    const schoolRoot = scene.getObjectByName('school_interior_interactables_root');
    if (schoolRoot) scanTargets.push(schoolRoot);

    if (scanTargets.length === 0) {
      if (lastHoveredIdRef.current !== null) {
        lastHoveredIdRef.current = null;
        lastHoveredDistRef.current = -1;
        state.setHoveredInteractable(null);
      }
      return;
    }

    const rc = raycasterRef.current;
    rc.setFromCamera(centerNdcRef.current, camera);

    const intersections = intersectionsRef.current;
    intersections.length = 0;
    rc.intersectObjects(scanTargets, true, intersections);

    const hits = hitsBufferRef.current;
    hits.length = 0;
    for (let i = 0; i < intersections.length; i++) {
      const hit = intersections[i];
      const id = resolveInteractableId(hit.object);
      if (id) {
        hits.push({ id, distance: hit.distance });
      }
    }

    const best = selectBestInteractionTarget(hits, MAX_INTERACT_DISTANCE);
    if (!best) {
      if (lastHoveredIdRef.current !== null) {
        lastHoveredIdRef.current = null;
        lastHoveredDistRef.current = -1;
        state.setHoveredInteractable(null);
      }
      return;
    }

    const roundedDist = Math.round(best.distance * 100) / 100;
    if (
      lastHoveredIdRef.current === best.id &&
      Math.abs(lastHoveredDistRef.current - roundedDist) < 0.05
    ) {
      return;
    }

    const outdoorDef = CAMPUS_LAYOUT.interactables.find((item) => item.id === best.id);
    if (outdoorDef) {
      lastHoveredIdRef.current = outdoorDef.id;
      lastHoveredDistRef.current = roundedDist;
      state.setHoveredInteractable({
        id: outdoorDef.id,
        type: outdoorDef.type,
        label: outdoorDef.label,
        actionLabel: outdoorDef.actionLabel,
        isLocked: outdoorDef.isLocked,
        lockedMessage: outdoorDef.lockedMessage,
        distance: roundedDist,
        source: outdoorDef.source,
      });
      return;
    }

    const interiorDef = SCHOOL_INTERIOR_INTERACTABLES.find((item) => item.id === best.id);
    if (!interiorDef) return;

    lastHoveredIdRef.current = interiorDef.id;
    lastHoveredDistRef.current = roundedDist;
    state.setHoveredInteractable({
      id: interiorDef.id,
      type: interiorDef.category,
      label: interiorDef.label,
      actionLabel: interiorDef.actionLabel,
      isLocked: false,
      distance: roundedDist,
      source: interiorDef.source,
    });
  });

  return null;
}
