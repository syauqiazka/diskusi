"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  useWorldStore,
  STANDING_HEIGHT,
  CROUCHING_HEIGHT,
} from "@/stores/use-world-store";
import {
  clampPosition,
  calculateMovementSpeed,
  interpolateCameraHeight,
} from "../../../tests/unit/player-controller-math.test";

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  crouch: boolean;
}

export interface PlayerControllerProps {
  initialPosition?: [number, number, number];
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  onPositionUpdate?: (pos: { x: number; y: number; z: number; rotY: number }) => void;
}

export function PlayerController({
  initialPosition = [0, STANDING_HEIGHT, 5],
  bounds,
  onPositionUpdate,
}: PlayerControllerProps = {}) {
  const { camera, gl } = useThree();
  const keys = React.useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    crouch: false,
  });

  const isPaused = useWorldStore((s) => s.isPaused);
  const isCrouching = useWorldStore((s) => s.isCrouching);
  const isRunning = useWorldStore((s) => s.isRunning);
  const activePanel = useWorldStore((s) => s.activePanel);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);

  const setPaused = useWorldStore((s) => s.setPaused);
  const setCrouching = useWorldStore((s) => s.setCrouching);
  const setRunning = useWorldStore((s) => s.setRunning);
  const setPointerLocked = useWorldStore((s) => s.setPointerLocked);
  const openPanel = useWorldStore((s) => s.openPanel);
  const setPlayerPosition = useWorldStore((s) => s.setPlayerPosition);

  // Vektor pergerakan
  const velocity = React.useRef(new THREE.Vector3());
  const direction = React.useRef(new THREE.Vector3());

  // Mouse Look variables
  const isLocked = React.useRef(false);
  const euler = React.useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  React.useEffect(() => {
    // Set posisi awal kamera
    camera.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
    camera.rotation.set(0, 0, 0);
  }, [camera, initialPosition]);

  React.useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      isLocked.current = locked;
      setPointerLocked(locked);
      if (!locked && !activePanel) {
        // Jika pointer dilepas tanpa modal panel, jeda otomatis
        setPaused(true);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isLocked.current || isPaused) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= movementX * 0.0022;
      euler.current.x -= movementY * 0.0022;

      // Batasi pandangan atas dan bawah (pitch clamp: ~85 derajat)
      euler.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const handleClickCanvas = () => {
      if (!isPaused && !activePanel && !isLocked.current) {
        canvas.requestPointerLock();
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClickCanvas);

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClickCanvas);
    };
  }, [gl, camera, isPaused, activePanel, setPaused, setPointerLocked]);

  // Listener Keyboard (3.5 Kontrol Karakter)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePanel) return;

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.run = true;
          setRunning(true);
          break;
        case "ControlLeft":
        case "ControlRight":
        case "KeyC":
          keys.current.crouch = true;
          setCrouching(true);
          break;
        case "KeyE":
          if (activeInteractable) {
            openPanel(activeInteractable.type);
            if (document.pointerLockElement) {
              document.exitPointerLock();
            }
          }
          break;
        case "Escape":
          setPaused(!isPaused);
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.run = false;
          setRunning(false);
          break;
        case "ControlLeft":
        case "ControlRight":
        case "KeyC":
          keys.current.crouch = false;
          setCrouching(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activePanel, activeInteractable, isPaused, openPanel, setCrouching, setPaused, setRunning]);

  // Pergerakan Frame-by-frame
  useFrame((state, delta) => {
    if (isPaused || activePanel) return;

    // Hitung kecepatan berdasarkan jalan / lari / jongkok
    const speed = calculateMovementSpeed(isRunning, isCrouching);

    // Hitung arah gerak lokal
    direction.current.z = Number(keys.current.forward) - Number(keys.current.backward);
    direction.current.x = Number(keys.current.right) - Number(keys.current.left);
    direction.current.normalize();

    const activeCam = state.camera;

    // Rotasi vektor arah searah orientasi kamera di bidang horizontal (Y-axis)
    if (direction.current.lengthSq() > 0) {
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(
        new THREE.Euler(0, activeCam.rotation.y, 0)
      );
      const right = new THREE.Vector3(1, 0, 0).applyEuler(
        new THREE.Euler(0, activeCam.rotation.y, 0)
      );

      velocity.current
        .copy(forward)
        .multiplyScalar(direction.current.z * speed * delta)
        .add(right.multiplyScalar(direction.current.x * speed * delta));

      activeCam.position.add(velocity.current);
    }

    // Terapkan batasan dinding (boundary collision clamp)
    const clamped = clampPosition(activeCam.position.x, activeCam.position.z, bounds);
    activeCam.position.x = clamped.x;
    activeCam.position.z = clamped.z;

    // Interpolasi mulus tinggi kamera saat jongkok (3.6: 1.6m <-> 0.9m)
    const targetHeight = isCrouching ? CROUCHING_HEIGHT : STANDING_HEIGHT;
    activeCam.position.y = interpolateCameraHeight(activeCam.position.y, targetHeight, delta, 12);

    // Laporkan koordinat posisi ke Zustand store
    setPlayerPosition([activeCam.position.x, activeCam.position.y, activeCam.position.z]);

    if (onPositionUpdate) {
      onPositionUpdate({
        x: activeCam.position.x,
        y: activeCam.position.y,
        z: activeCam.position.z,
        rotY: euler.current.y,
      });
    }
  });

  return null;
}
