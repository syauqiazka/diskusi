"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useWorldStore, MAX_INTERACTION_DISTANCE, type InteractableItem } from "@/stores/use-world-store";

export function RaycastDetector() {
  const { camera, scene } = useThree();
  const raycaster = React.useRef(new THREE.Raycaster());
  const centerScreen = React.useRef(new THREE.Vector2(0, 0)); // Pusat crosshair
  const lastActiveId = React.useRef<string | null>(null);

  const isPaused = useWorldStore((s) => s.isPaused);
  const activePanel = useWorldStore((s) => s.activePanel);
  const setActiveInteractable = useWorldStore((s) => s.setActiveInteractable);

  useFrame(() => {
    if (isPaused || activePanel) {
      if (lastActiveId.current !== null) {
        lastActiveId.current = null;
        setActiveInteractable(null);
      }
      return;
    }

    raycaster.current.setFromCamera(centerScreen.current, camera);
    raycaster.current.far = MAX_INTERACTION_DISTANCE;

    // Temukan semua mesh interaktif di scene
    const interactiveMeshes: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData && obj.userData.isInteractable) {
        interactiveMeshes.push(obj);
      }
    });

    const intersects = raycaster.current.intersectObjects(interactiveMeshes, true);

    if (intersects.length > 0) {
      const closest = intersects[0];
      // Cari parent yang menyimpan data objek interaktif
      let targetObj: THREE.Object3D | null = closest.object;
      while (targetObj && (!targetObj.userData || !targetObj.userData.interactableData)) {
        targetObj = targetObj.parent;
      }

      if (targetObj && targetObj.userData && targetObj.userData.interactableData) {
        const item = targetObj.userData.interactableData as InteractableItem;
        if (lastActiveId.current !== item.id) {
          lastActiveId.current = item.id;
          setActiveInteractable({
            ...item,
            distance: closest.distance,
          });
        }
        return;
      }
    }

    if (lastActiveId.current !== null) {
      lastActiveId.current = null;
      setActiveInteractable(null);
    }
  });

  return null;
}

