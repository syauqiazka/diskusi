/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * First-Person Walk Controller dengan Deteksi Kolisi & Tangga
 * Seluruh koordinat dan batas mengacu 100% pada src/data/campus.json:
 * - Batas pagar kampus: x: -99..99, z: 1..239
 * - Gedung utama: x: -45..45, z: 100..122, lantai 4.0m per tingkat
 * - Tangga Grand Atrium (x: -2..2, z: 105..111) dan Tangga Sayap Barat/Timur (z: 106..116)
 * - Pintu berinteraksi buka/tutup dengan tombol [E]
 * - Spawn awal: Gerbang Utama (0, 1.6, 2) menghadap ke Utara (+Z)
 */

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSakuraStore } from "@/stores/use-sakura-store";
import { CAMPUS_BOUNDS, MAIN_BUILDING_ROOMS } from "@/data/campus";

export function FirstPersonWalkController() {
  const { camera } = useThree();
  const teleportPosition = useSakuraStore((s) => s.teleportPosition);
  const clearTeleport = useSakuraStore((s) => s.clearTeleport);

  const keys = useRef<{ [key: string]: boolean }>({});
  const moveSpeed = 6.5;
  const isPointerLocked = useRef(false);

  // Inisialisasi posisi awal di Gerbang Utama (0, 1.6, 2) menghadap ke Utara (+Z)
  useEffect(() => {
    camera.rotation.order = "YXZ";
    camera.position.set(0, 1.6, 2);
    camera.lookAt(0, 1.6, 62);
  }, [camera]);

  // Mouse Look & Keyboard Event Handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      // Interaksi tombol [E] untuk membuka pintu terdekat
      if (e.code === "KeyE") {
        for (const rm of MAIN_BUILDING_ROOMS) {
          const d = Math.hypot(
            camera.position.x - rm.doorPosition[0],
            camera.position.z - rm.doorPosition[2]
          );
          if (d < 3.0 && Math.abs(camera.position.y - rm.doorPosition[1]) < 2.0) {
            // Trigger room notification
            useSakuraStore.getState().setActiveRoomDetail(rm);
            break;
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      // Rotasi yaw (horizontal)
      camera.rotation.y -= movementX * 0.0022;

      // Rotasi pitch (vertikal)
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x - movementY * 0.0022,
        -Math.PI / 2.2,
        Math.PI / 2.2
      );
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [camera]);

  // Tangani Teleportasi
  useEffect(() => {
    if (teleportPosition) {
      camera.position.set(teleportPosition[0], teleportPosition[1], teleportPosition[2]);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tp = params.get("tp");
        if (tp === "corridor" || tp === "class1a_doors") {
          camera.position.set(14.2, 1.6, 110.0);
          camera.lookAt(6.0, 1.6, 111.5);
        } else if (tp === "class1a_rear" || tp === "class1a") {
          camera.position.set(13.0, 1.5, 114.5);
          camera.lookAt(5.0, 1.4, 115.5);
        } else if (tp === "class1a_seat") {
          camera.position.set(9.6, 1.25, 117.5);
          camera.lookAt(9.6, 1.3, 160.0);
        } else if (tp === "library" || tp === "lab") {
          camera.rotation.set(0, 0, 0);
        }
      }
      clearTeleport();
    }
  }, [teleportPosition, camera, clearTeleport]);

  // Hitung elevasi lantai / tangga berdasarkan koordinat pemain di Gedung Utama
  function calculateGroundHeight(pos: THREE.Vector3): number {
    // Di dalam Gedung Utama (x: -45..45, z: 100..122)
    if (pos.x >= -45 && pos.x <= 45 && pos.z >= 100 && pos.z <= 122) {
      // 1. Grand Atrium Stair (x: -2.0..2.0, z: 105..111) 1F (0m) -> 2F (4.0m)
      if (Math.abs(pos.x) <= 2.0 && pos.z >= 105 && pos.z <= 111 && pos.y < 4.5) {
        const t = (pos.z - 105) / 6.0;
        return t * 4.0;
      }

      // 2. Tangga Sayap Timur (x: 40..44, z: 106..116)
      if (pos.x >= 40 && pos.x <= 44) {
        // 1F -> 2F
        if (pos.z >= 106 && pos.z <= 116 && pos.y < 4.5) {
          const t = (pos.z - 106) / 10.0;
          return t * 4.0;
        }
        // 2F -> 3F (Arah Balik)
        if (pos.z >= 106 && pos.z <= 116 && pos.y >= 4.0 && pos.y < 8.5) {
          const t = (116 - pos.z) / 10.0;
          return 4.0 + t * 4.0;
        }
        // 3F -> Roof Okujo
        if (pos.z >= 106 && pos.z <= 116 && pos.y >= 8.0) {
          const t = (pos.z - 106) / 10.0;
          return 8.0 + t * 4.0;
        }
      }

      // 3. Tangga Sayap Barat (x: -44..-40, z: 106..116)
      if (pos.x >= -44 && pos.x <= -40) {
        // 1F -> 2F
        if (pos.z >= 106 && pos.z <= 116 && pos.y < 4.5) {
          const t = (pos.z - 106) / 10.0;
          return t * 4.0;
        }
        // 2F -> 3F (Arah Balik)
        if (pos.z >= 106 && pos.z <= 116 && pos.y >= 4.0 && pos.y < 8.5) {
          const t = (116 - pos.z) / 10.0;
          return 4.0 + t * 4.0;
        }
        // 3F -> Roof Okujo
        if (pos.z >= 106 && pos.z <= 116 && pos.y >= 8.0) {
          const t = (pos.z - 106) / 10.0;
          return 8.0 + t * 4.0;
        }
      }

      // Deteksi lantai stabil Gedung Utama
      if (pos.y >= 11.5) return 12.0; // Atap Okujo
      if (pos.y >= 7.5) return 8.0;   // Lantai 3
      if (pos.y >= 3.5) return 4.0;   // Lantai 2
      return 0.0;                     // Lantai 1
    }

    return 0.0; // Luar ruangan pada tanah dasar y = 0
  }

  const playerLightRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    if (playerLightRef.current) {
      playerLightRef.current.position.set(
        camera.position.x,
        camera.position.y + 0.3,
        camera.position.z
      );
    }
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const isRunning = keys.current["ShiftLeft"] || keys.current["ShiftRight"];
    const speed = (isRunning ? moveSpeed * 1.8 : moveSpeed) * delta;

    const moveVector = new THREE.Vector3(0, 0, 0);

    if (keys.current["KeyW"]) moveVector.addScaledVector(forward, speed);
    if (keys.current["KeyS"]) moveVector.addScaledVector(forward, -speed);
    if (keys.current["KeyA"]) moveVector.addScaledVector(right, speed);
    if (keys.current["KeyD"]) moveVector.addScaledVector(right, -speed);

    if (moveVector.lengthSq() > 0) {
      const nextPos = camera.position.clone().add(moveVector);

      // Batas Pagar Kampus (-99..99, 1..239)
      nextPos.x = THREE.MathUtils.clamp(nextPos.x, CAMPUS_BOUNDS.minX + 1.0, CAMPUS_BOUNDS.maxX - 1.0);
      nextPos.z = THREE.MathUtils.clamp(nextPos.z, CAMPUS_BOUNDS.minZ + 0.5, CAMPUS_BOUNDS.maxZ - 1.0);

      // Sliding collision pada dinding koridor Gedung Utama (x: -45..45, z: 100..122)
      if (nextPos.x >= -45 && nextPos.x <= 45 && nextPos.z >= 100 && nextPos.z <= 122) {
        // Cek apakah sedang berada di dekat bukaan pintu ruangan
        const nearDoor = MAIN_BUILDING_ROOMS.some(
          (rm) =>
            Math.abs(nextPos.x - rm.doorPosition[0]) < 0.9 &&
            Math.abs(nextPos.z - rm.doorPosition[2]) < 1.2
        );

        if (!nearDoor) {
          // Cegah menembus dinding koridor selatan (z = 109.5..110.0)
          if (camera.position.z >= 110.0 && nextPos.z < 110.0 && nextPos.z > 109.2) {
            nextPos.z = 110.0;
          }
          if (camera.position.z <= 109.5 && nextPos.z > 109.5 && nextPos.z < 110.3) {
            nextPos.z = 109.5;
          }
          // Cegah menembus dinding koridor utara (z = 112.0..112.5)
          if (camera.position.z <= 112.0 && nextPos.z > 112.0 && nextPos.z < 112.8) {
            nextPos.z = 112.0;
          }
          if (camera.position.z >= 112.5 && nextPos.z < 112.5 && nextPos.z > 111.7) {
            nextPos.z = 112.5;
          }
        }
      }

      // Terapkan posisi baru
      camera.position.x = nextPos.x;
      camera.position.z = nextPos.z;
    }

    // Step-up & ketinggian mata kamera (1.6m di atas permukaan lantai)
    const floorH = calculateGroundHeight(camera.position);
    const targetY = floorH + 1.6;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 12.0);
  });

  return (
    <pointLight
      ref={playerLightRef}
      intensity={1.8}
      distance={16}
      decay={1.6}
      color="#FEF9C3"
    />
  );
}
