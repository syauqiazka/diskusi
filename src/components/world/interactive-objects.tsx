"use client";

import * as React from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useWorldStore, type InteractableItem } from "@/stores/use-world-store";
import {
  COLORS,
  doorWoodMaterial,
  brassHandleMaterial,
  madingBoardMaterial,
  paperMaterial,
  lockerMetalMaterial,
  mirrorFrameMaterial,
  mirrorGlassMaterial,
  cautionSignMaterial,
} from "./hallway-materials";

interface InteractiveObjectProps {
  data: InteractableItem;
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

function InteractiveWrapper({
  data,
  position,
  rotation = [0, 0, 0],
  children,
}: InteractiveObjectProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);
  const isSelected = activeInteractable?.id === data.id;

  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData = {
        isInteractable: true,
        interactableData: data,
      };
      // Tandai semua child mesh agar raycaster dapat mendeteksinya
      groupRef.current.traverse((child) => {
        child.userData.isInteractable = true;
        child.userData.interactableData = data;
      });
    }
  }, [data]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {children}
      {/* Sorotan Cahaya Aksen jika pemain sedang membidik objek ini */}
      {isSelected && (
        <pointLight
          color={COLORS.caution}
          intensity={1.2}
          distance={3.5}
          decay={2}
          position={[0, 0, 0.4]}
        />
      )}
    </group>
  );
}

// 1. Pintu Ruang Kelas SIJA
export function ClassroomDoorObject() {
  const data: InteractableItem = {
    id: "door-sija",
    type: "door",
    label: "Ruang Kelas SIJA",
    actionPrompt: "[E] MASUK KE KELAS",
    description: "Pintu masuk ke ruang kelas praktikum dan diskusi SIJA SMK TI BAZMA.",
  };

  return (
    <InteractiveWrapper data={data} position={[-2.95, 1.25, -6]} rotation={[0, Math.PI / 2, 0]}>
      {/* Kusen Pintu */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2.5, 0.12]} />
        <meshStandardMaterial color="#2B1A0E" roughness={0.7} />
      </mesh>
      {/* Daun Pintu Kayu */}
      <mesh position={[0, -0.05, 0.02]} material={doorWoodMaterial}>
        <boxGeometry args={[1.35, 2.35, 0.08]} />
      </mesh>
      {/* Gagang Pintu Kuningan */}
      <mesh position={[0.5, -0.1, 0.08]} material={brassHandleMaterial}>
        <boxGeometry args={[0.08, 0.22, 0.12]} />
      </mesh>
      {/* Papan Rambu Nama Kelas (Font Sign Anton vibe) */}
      <mesh position={[0, 1.0, 0.07]}>
        <boxGeometry args={[1.1, 0.28, 0.03]} />
        <meshStandardMaterial color={COLORS.night} roughness={0.3} />
      </mesh>
      <Text
        position={[0, 1.0, 0.09]}
        fontSize={0.14}
        color={COLORS.caution}
        anchorX="center"
        anchorY="middle"
      >
        [ 10-SIJA ]
      </Text>
    </InteractiveWrapper>
  );
}

// 2. Mading Sekolah (Papan Diskusi Global)
export function MadingBoardObject() {
  const data: InteractableItem = {
    id: "mading-global",
    type: "mading",
    label: "Mading Global",
    actionPrompt: "[E] BUKA MADING",
    description: "Papan pengumuman utama: diskusi umum, tanya-jawab, dan berita sekolah.",
  };

  return (
    <InteractiveWrapper data={data} position={[2.95, 1.5, -2]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Frame Kayu Papan */}
      <mesh material={madingBoardMaterial}>
        <boxGeometry args={[2.4, 1.5, 0.08]} />
      </mesh>
      {/* Permukaan Papan Gabus/Kayu */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.2, 1.3, 0.05]} />
        <meshStandardMaterial color="#5C4532" roughness={0.9} />
      </mesh>
      {/* Label Header Mading */}
      <mesh position={[0, 0.52, 0.05]}>
        <boxGeometry args={[2.0, 0.18, 0.02]} />
        <meshStandardMaterial color={COLORS.night} />
      </mesh>
      <Text
        position={[0, 0.52, 0.07]}
        fontSize={0.1}
        color={COLORS.neonCyan}
        anchorX="center"
        anchorY="middle"
      >
        {"//"} MADING SEKOLAH TENGAH MALAM
      </Text>
      {/* Kertas-kertas Pengumuman Low-poly */}
      <mesh position={[-0.6, 0.1, 0.06]} material={paperMaterial}>
        <boxGeometry args={[0.5, 0.55, 0.01]} />
      </mesh>
      <mesh position={[0.0, 0.05, 0.06]} material={paperMaterial}>
        <boxGeometry args={[0.55, 0.45, 0.01]} />
      </mesh>
      <mesh position={[0.65, 0.12, 0.06]} material={paperMaterial}>
        <boxGeometry args={[0.45, 0.6, 0.01]} />
      </mesh>
      {/* Lampu Sorot Kecil di atas Mading */}
      <pointLight color={COLORS.neonCyan} intensity={0.8} distance={2.5} position={[0, 0.8, 0.3]} />
    </InteractiveWrapper>
  );
}

// 3. Perpustakaan Terbuka (Pintu Ganda)
export function LibraryDoorObject() {
  const data: InteractableItem = {
    id: "library-main",
    type: "library",
    label: "Perpustakaan Kawasan",
    actionPrompt: "[E] PERPUSTAKAAN",
    description: "Repositori materi terbuka, e-book praktikum, dan modul pembelajaran mandiri.",
  };

  return (
    <InteractiveWrapper data={data} position={[-2.95, 1.25, -14]} rotation={[0, Math.PI / 2, 0]}>
      {/* Kusen Pintu Dobel */}
      <mesh>
        <boxGeometry args={[2.2, 2.5, 0.12]} />
        <meshStandardMaterial color="#1C2028" roughness={0.6} />
      </mesh>
      {/* Daun Pintu Kiri */}
      <mesh position={[-0.52, -0.05, 0.02]}>
        <boxGeometry args={[0.95, 2.35, 0.06]} />
        <meshStandardMaterial color="#2B3340" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Daun Pintu Kanan */}
      <mesh position={[0.52, -0.05, 0.02]}>
        <boxGeometry args={[0.95, 2.35, 0.06]} />
        <meshStandardMaterial color="#2B3340" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Handle Vertikal Modern */}
      <mesh position={[-0.1, -0.05, 0.08]} material={brassHandleMaterial}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
      </mesh>
      <mesh position={[0.1, -0.05, 0.08]} material={brassHandleMaterial}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
      </mesh>
      {/* Rambu Perpustakaan */}
      <mesh position={[0, 1.0, 0.07]}>
        <boxGeometry args={[1.6, 0.26, 0.03]} />
        <meshStandardMaterial color={COLORS.night} roughness={0.3} />
      </mesh>
      <Text
        position={[0, 1.0, 0.09]}
        fontSize={0.13}
        color={COLORS.ok}
        anchorX="center"
        anchorY="middle"
      >
        [ PERPUSTAKAAN ]
      </Text>
    </InteractiveWrapper>
  );
}

// 4. Loker Siswa
export function StudentLockersObject() {
  const data: InteractableItem = {
    id: "student-lockers",
    type: "locker",
    label: "Loker Siswa",
    actionPrompt: "[E] BUKA LOKER",
    description: "Loker penyimpanan pribadi: atur profil, biodata, dan preferensi akun.",
  };

  return (
    <InteractiveWrapper data={data} position={[2.95, 1.0, -10]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Deretan 4 Loker Logam */}
      {[-0.75, -0.25, 0.25, 0.75].map((xOffset, idx) => (
        <group key={idx} position={[xOffset, 0, 0]}>
          <mesh material={lockerMetalMaterial}>
            <boxGeometry args={[0.45, 1.9, 0.45]} />
          </mesh>
          {/* Celah Garis Pintu Loker */}
          <mesh position={[0, 0, 0.23]}>
            <boxGeometry args={[0.42, 1.84, 0.02]} />
            <meshStandardMaterial color="#22362C" roughness={0.5} />
          </mesh>
          {/* Ventilasi Kisi */}
          <mesh position={[0, 0.6, 0.24]}>
            <boxGeometry args={[0.22, 0.12, 0.01]} />
            <meshStandardMaterial color="#0E1713" />
          </mesh>
          {/* Dial Gembok / Handle */}
          <mesh position={[0.14, 0.0, 0.25]} rotation={[Math.PI / 2, 0, 0]} material={brassHandleMaterial}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
          </mesh>
          {/* Nomor Loker */}
          <Text
            position={[0, 0.78, 0.25]}
            fontSize={0.06}
            color={COLORS.fluor}
            anchorX="center"
            anchorY="middle"
          >
            {`#${idx + 101}`}
          </Text>
        </group>
      ))}
    </InteractiveWrapper>
  );
}

// 5. Cermin Kosmetik Lorong
export function MirrorWallObject() {
  const data: InteractableItem = {
    id: "mirror-cosmetics",
    type: "mirror",
    label: "Cermin Kosmetik",
    actionPrompt: "[E] LIHAT CERMIN",
    description: "Cermin interaktif untuk menguji dan memilih bingkai avatar serta efek profil.",
  };

  return (
    <InteractiveWrapper data={data} position={[2.95, 1.5, -18]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Bingkai Krom Retro */}
      <mesh material={mirrorFrameMaterial}>
        <boxGeometry args={[1.2, 1.6, 0.06]} />
      </mesh>
      {/* Kaca Cermin Reflektif */}
      <mesh position={[0, 0, 0.03]} material={mirrorGlassMaterial}>
        <boxGeometry args={[1.05, 1.45, 0.02]} />
      </mesh>
      {/* Lampu Bohlam Cermin di Atas */}
      <mesh position={[0, 0.9, 0.1]}>
        <cylinderGeometry args={[0.03, 0.05, 0.1, 12]} />
        <meshStandardMaterial color={COLORS.fluor} emissive={COLORS.fluor} emissiveIntensity={0.8} />
      </mesh>
      <pointLight color={COLORS.fluor} intensity={0.7} distance={2.0} position={[0, 0.9, 0.2]} />
      {/* Label Cermin */}
      <Text
        position={[0, -0.9, 0.05]}
        fontSize={0.08}
        color={COLORS.fluor}
        anchorX="center"
        anchorY="middle"
      >
        [ CERMIN IDENTITAS ]
      </Text>
    </InteractiveWrapper>
  );
}

// 6. Rambu "Awas Lantai Basah" (Ikonik Sekolah Tengah Malam)
export function CautionWetFloorSign({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Sisi Kiri Segitiga */}
      <mesh position={[-0.1, 0.3, 0]} rotation={[0, 0, -0.15]} material={cautionSignMaterial}>
        <boxGeometry args={[0.04, 0.65, 0.3]} />
      </mesh>
      {/* Sisi Kanan Segitiga */}
      <mesh position={[0.1, 0.3, 0]} rotation={[0, 0, 0.15]} material={cautionSignMaterial}>
        <boxGeometry args={[0.04, 0.65, 0.3]} />
      </mesh>
      {/* Tulisan Rambu */}
      <Text
        position={[0.12, 0.35, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.06}
        color={COLORS.night}
        anchorX="center"
        anchorY="middle"
      >
        AWAS LANTAI BASAH
      </Text>
    </group>
  );
}
