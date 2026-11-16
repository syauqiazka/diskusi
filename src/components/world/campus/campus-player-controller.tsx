"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMPUS_LAYOUT } from '@/lib/world/campus-layout';
import {
  SCHOOL_FLOOR_SLABS,
  SCHOOL_INTERIOR_INTERACTABLES,
  SCHOOL_ROOF_CEILING_SLABS,
  SCHOOL_STAIR_RAMPS,
} from '@/lib/world/school-interior-layout';
import { getTerrainHeight } from '@/lib/world/terrain';
import { useWorldStore, WorldStoreState } from '@/stores/use-world-store';
import { useTimeOfDayStore } from '@/stores/use-time-of-day-store';
import {
  CROUCH_BODY_HEIGHT,
  CROUCH_SPEED,
  EYE_SMOOTH_RATE,
  JUMP_VELOCITY,
  MOUSE_SENSITIVITY,
  PLAYER_NEAR_PLANE,
  PLAYER_RADIUS,
  RUN_SPEED,
  STANDING_BODY_HEIGHT,
  WALK_SPEED,
  clampPitch,
  computeDesiredDirection,
  getWalkableHeight,
  resolveCircleAABBCollisions,
  resolveSlopeStep,
  smoothValue,
  stepVelocity,
  stepVerticalPhysics,
} from '@/lib/world/movement';

export function FirstPersonController() {
  const { camera, gl } = useThree();

  const cameraMode = useWorldStore((s) => s.cameraMode);
  const systemReducedMotion = useTimeOfDayStore((s) => s.prefersReducedMotion);

  const pressedKeysRef = useRef<Set<string>>(new Set());
  const yawRef = useRef<number>(CAMPUS_LAYOUT.playerSpawn.yaw);
  const pitchRef = useRef<number>(CAMPUS_LAYOUT.playerSpawn.pitch);
  const posRef = useRef<{ x: number; y: number; z: number }>({
    x: CAMPUS_LAYOUT.playerSpawn.position[0],
    y: CAMPUS_LAYOUT.playerSpawn.position[1],
    z: CAMPUS_LAYOUT.playerSpawn.position[2],
  });
  const velRef = useRef<{ vx: number; vz: number }>({ vx: 0, vz: 0 });
  const vyRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(true);
  const ceilingYRef = useRef<number | null>(null);
  const currentEyeRef = useRef<number>(useWorldStore.getState().standingHeight);
  const bobPhaseRef = useRef<number>(0);
  const lastStoreSyncRef = useRef<number>(0);
  const mediaReducedMotionRef = useRef<boolean>(false);
  const wasLockedRef = useRef<boolean>(false);

  // Set near plane kecil agar tidak memotong geometri dekat dan inisialisasi posisi spawn
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = PLAYER_NEAR_PLANE;
      camera.updateProjectionMatrix();
    }
    camera.rotation.order = 'YXZ';

    const spawn = CAMPUS_LAYOUT.playerSpawn;
    const groundY = getTerrainHeight(spawn.position[0], spawn.position[2]);
    posRef.current = { x: spawn.position[0], y: groundY, z: spawn.position[2] };
    yawRef.current = spawn.yaw;
    pitchRef.current = spawn.pitch;
    vyRef.current = 0;
    isGroundedRef.current = true;

    const initialEye = useWorldStore.getState().eyeHeight;
    currentEyeRef.current = initialEye;
    camera.position.set(spawn.position[0], groundY + initialEye, spawn.position[2]);
    camera.rotation.set(spawn.pitch, spawn.yaw, 0, 'YXZ');
  }, [camera]);

  // Pantau preferensi reduced-motion dari OS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaReducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      mediaReducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Lepas pointer lock bila berpindah ke mode inspeksi atau membuka panel 2D
  useEffect(() => {
    const activePanel = useWorldStore.getState().activePanel;
    if (cameraMode !== 'fps' || activePanel !== null) {
      pressedKeysRef.current.clear();
      velRef.current = { vx: 0, vz: 0 };
      if (typeof document !== 'undefined' && document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
      if (cameraMode !== 'fps') {
        useWorldStore.getState().setPaused(false);
      }
    }
  }, [cameraMode, gl]);

  // Sinkronisasi ketika masuk kembali ke mode FPS dari inspeksi
  useEffect(() => {
    if (cameraMode === 'fps') {
      camera.rotation.order = 'YXZ';
      const p = posRef.current;
      camera.position.set(p.x, p.y + currentEyeRef.current, p.z);
      camera.rotation.set(pitchRef.current, yawRef.current, 0, 'YXZ');
    }
  }, [cameraMode, camera]);

  // Penanganan pointer lock, mouse look, klik kiri interaksi, dan keyboard (event.code)
  useEffect(() => {
    const dom = gl.domElement;

    const clearInputs = () => {
      pressedKeysRef.current.clear();
      velRef.current = { vx: 0, vz: 0 };
    };

    const triggerHoveredInteraction = (state: WorldStoreState) => {
      const hovered = state.hoveredInteractable;
      if (!hovered) return;
      clearInputs();

      const def = CAMPUS_LAYOUT.interactables.find((item) => item.id === hovered.id);
      if (def) {
        if (def.type === 'door' && !def.isLocked) {
          state.toggleDoorState(def.id);
        }
        state.openPanel({
          interactableId: def.id,
          type: def.type,
          title: def.label,
          description: def.isLocked ? def.lockedMessage || def.description : def.description,
          source: def.source,
          isLocked: Boolean(def.isLocked),
        });
        if (document.pointerLockElement === dom) {
          document.exitPointerLock?.();
        }
        return;
      }

      const interiorDef = SCHOOL_INTERIOR_INTERACTABLES.find((item) => item.id === hovered.id);
      if (!interiorDef) return;

      state.openPanel({
        interactableId: interiorDef.id,
        type: interiorDef.category,
        title: interiorDef.label,
        description: interiorDef.description,
        details: interiorDef.details,
        source: interiorDef.source,
        isLocked: false,
      });
      if (document.pointerLockElement === dom) {
        document.exitPointerLock?.();
      }
    };

    const handleCanvasClick = () => {
      const state = useWorldStore.getState();
      if (state.cameraMode !== 'fps') return;
      if (state.activePanel !== null) return;
      if (state.isPaused) {
        state.setPaused(false);
      }
      if (document.pointerLockElement !== dom) {
        dom.requestPointerLock?.();
      }
    };

    // Klik kiri mouse memicu interaksi yang sama dengan E hanya saat pointer SUDAH terkunci
    const handleCanvasMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (document.pointerLockElement !== dom) return;
      const state = useWorldStore.getState();
      if (state.cameraMode !== 'fps' || state.isPaused || state.activePanel !== null) return;
      triggerHoveredInteraction(state);
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === dom;
      const state = useWorldStore.getState();
      state.setPointerLocked(locked);

      if (!locked) {
        clearInputs();
        if (wasLockedRef.current && state.cameraMode === 'fps' && state.activePanel === null) {
          state.setPaused(true);
        }
      } else if (state.isPaused) {
        state.setPaused(false);
      }
      wasLockedRef.current = locked;
    };

    const handlePointerLockError = () => {
      clearInputs();
      useWorldStore.getState().setPointerLocked(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== dom) return;
      const state = useWorldStore.getState();
      if (state.cameraMode !== 'fps' || state.isPaused || state.activePanel !== null) return;

      yawRef.current -= e.movementX * MOUSE_SENSITIVITY;
      pitchRef.current = clampPitch(pitchRef.current - e.movementY * MOUSE_SENSITIVITY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useWorldStore.getState();

      // Esc menutup panel 2D atau memicu jeda saat di FPS
      if (e.code === 'Escape') {
        if (state.activePanel !== null) {
          e.preventDefault();
          state.closePanel();
          return;
        }
        if (state.cameraMode === 'fps' && !state.isPaused) {
          clearInputs();
          state.setPaused(true);
          if (document.pointerLockElement === dom) {
            document.exitPointerLock?.();
          }
        }
        return;
      }

      if (state.cameraMode !== 'fps' || state.isPaused || state.activePanel !== null) {
        return;
      }

      // Abaikan input saat fokus berada di elemen form
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat && isGroundedRef.current && !state.isCrouching) {
          const ceil = ceilingYRef.current;
          if (ceil === null || posRef.current.y + STANDING_BODY_HEIGHT + 0.12 < ceil) {
            vyRef.current = JUMP_VELOCITY;
            isGroundedRef.current = false;
          }
        }
        return;
      }

      if (!e.repeat && e.code === 'KeyC') {
        if (state.isCrouching) {
          const ceil = ceilingYRef.current;
          if (ceil !== null && posRef.current.y + STANDING_BODY_HEIGHT > ceil) {
            return;
          }
        }
        state.setCrouching(!state.isCrouching);
        return;
      }

      if (!e.repeat && e.code === 'KeyE') {
        triggerHoveredInteraction(state);
        return;
      }

      pressedKeysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.code);
    };

    const handleWindowBlur = () => {
      clearInputs();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInputs();
        const state = useWorldStore.getState();
        if (state.cameraMode === 'fps' && state.activePanel === null) {
          state.setPaused(true);
        }
        if (document.pointerLockElement === dom) {
          document.exitPointerLock?.();
        }
      }
    };

    dom.addEventListener('click', handleCanvasClick);
    dom.addEventListener('mousedown', handleCanvasMouseDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      dom.removeEventListener('click', handleCanvasClick);
      dom.removeEventListener('mousedown', handleCanvasMouseDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const state = useWorldStore.getState();
    if (state.cameraMode !== 'fps') return;

    const keys = pressedKeysRef.current;
    const isFrozen = state.isPaused || state.activePanel !== null;
    const bodyHeight = state.isCrouching ? CROUCH_BODY_HEIGHT : STANDING_BODY_HEIGHT;

    if (!isFrozen) {
      const dir = computeDesiredDirection(
        {
          forward: keys.has('KeyW'),
          backward: keys.has('KeyS'),
          left: keys.has('KeyA'),
          right: keys.has('KeyD'),
        },
        yawRef.current
      );

      const isSprinting = (keys.has('ShiftLeft') || keys.has('ShiftRight')) && !state.isCrouching;
      const targetSpeed = state.isCrouching
        ? CROUCH_SPEED
        : isSprinting
        ? RUN_SPEED
        : WALK_SPEED;

      const nextVel = stepVelocity(
        velRef.current.vx,
        velRef.current.vz,
        dir.x,
        dir.z,
        targetSpeed,
        delta
      );
      velRef.current = nextVel;

      const dt = Math.min(delta, 0.1);
      const rawNextX = posRef.current.x + nextVel.vx * dt;
      const rawNextZ = posRef.current.z + nextVel.vz * dt;

      // 1. Cek batas kemiringan lereng & tangga interior
      const slopeRes = resolveSlopeStep(
        posRef.current.x,
        posRef.current.z,
        rawNextX,
        rawNextZ,
        state.maxWalkableSlope,
        CAMPUS_LAYOUT.landscapeStairs,
        getTerrainHeight,
        posRef.current.y,
        SCHOOL_FLOOR_SLABS,
        SCHOOL_STAIR_RAMPS,
        SCHOOL_ROOF_CEILING_SLABS
      );

      // 2. Cek tabrakan AABB bangunan, dinding per lantai, pagar, dan batas luar kawasan
      const colRes = resolveCircleAABBCollisions(
        slopeRes.x,
        slopeRes.z,
        PLAYER_RADIUS,
        CAMPUS_LAYOUT.colliders,
        CAMPUS_LAYOUT.worldBounds,
        posRef.current.y,
        bodyHeight
      );

      posRef.current.x = colRes.x;
      posRef.current.z = colRes.z;

      // 3. Cek permukaan pijak bertingkat, tangga U, langit-langit, serta gravitasi & lompatan
      const surface = getWalkableHeight(
        posRef.current.x,
        posRef.current.z,
        posRef.current.y,
        CAMPUS_LAYOUT.landscapeStairs,
        SCHOOL_FLOOR_SLABS,
        SCHOOL_STAIR_RAMPS,
        SCHOOL_ROOF_CEILING_SLABS,
        getTerrainHeight
      );
      ceilingYRef.current = surface.ceilingY;

      const vert = stepVerticalPhysics({
        footY: posRef.current.y,
        verticalVelocity: vyRef.current,
        supportY: surface.y,
        ceilingY: surface.ceilingY,
        onStair: surface.onStair,
        bodyHeight,
        delta,
      });

      posRef.current.y = vert.footY;
      vyRef.current = vert.verticalVelocity;
      isGroundedRef.current = vert.isGrounded;
    }

    // Transisi halus eyeHeight saat berdiri <-> jongkok (1.6m <-> 0.9m)
    const targetEye = state.isCrouching ? state.crouchingHeight : state.standingHeight;
    currentEyeRef.current = smoothValue(currentEyeRef.current, targetEye, EYE_SMOOTH_RATE, delta);

    // Head bob opsional (default mati, nonaktif penuh saat prefers-reduced-motion atau di udara)
    const allowBob =
      state.headBobEnabled &&
      !mediaReducedMotionRef.current &&
      !systemReducedMotion &&
      !isFrozen &&
      isGroundedRef.current;
    const speedMag = Math.hypot(velRef.current.vx, velRef.current.vz);
    let bobOffset = 0;
    if (allowBob && speedMag > 0.25) {
      bobPhaseRef.current += Math.min(delta, 0.1) * speedMag * 2.1;
      bobOffset = Math.sin(bobPhaseRef.current) * 0.025;
    } else {
      bobPhaseRef.current = 0;
    }

    camera.position.set(
      posRef.current.x,
      posRef.current.y + currentEyeRef.current + bobOffset,
      posRef.current.z
    );
    camera.rotation.set(pitchRef.current, yawRef.current, 0, 'YXZ');

    // Tulis playerPosition ke store paling cepat 10 kali per detik (100ms), bukan tiap frame
    const now = performance.now();
    if (now - lastStoreSyncRef.current >= 100) {
      lastStoreSyncRef.current = now;
      state.setPlayerPosition([
        Number(posRef.current.x.toFixed(2)),
        Number((posRef.current.y + currentEyeRef.current).toFixed(2)),
        Number(posRef.current.z.toFixed(2)),
      ]);
    }
  });

  return null;
}

export const CampusPlayerController = FirstPersonController;
