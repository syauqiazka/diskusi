"use client";

import * as React from "react";
import { Text } from "@react-three/drei";
import { useWorldStore } from "@/stores/use-world-store";
import { calculateDeskGridPosition } from "@/lib/classroom/classroom-math";
import { CLASSROOM_COLORS, createGridTexture } from "./classroom-materials";
import type { ClassroomDetail, ClassroomMemberDetail } from "@/lib/classroom/types";

interface ClassroomSceneProps {
  classroom: ClassroomDetail;
  currentUserId: string;
}

export function ClassroomScene({ classroom, currentUserId }: ClassroomSceneProps) {
  const gridTexture = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    return createGridTexture();
  }, []);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);

  // Map seatIndex (0-29) ke siswa
  const studentSeats = React.useMemo(() => {
    const map = new Map<number, ClassroomMemberDetail>();
    classroom.members.forEach((m) => {
      if (m.role === "STUDENT" && m.seatIndex !== null) {
        map.set(m.seatIndex, m);
      }
    });
    return map;
  }, [classroom.members]);

  const teacher = React.useMemo(() => {
    return classroom.members.find((m) => m.role === "TEACHER" || m.role === "ASSISTANT");
  }, [classroom.members]);

  return (
    <group>
      {/* 1. PENCAHAYAAN AMBIENT & DIRECTIONAL */}
      <ambientLight intensity={0.25} color="#E9F2E3" />
      <directionalLight position={[0, 4, -2]} intensity={0.6} color="#E9F2E3" />
      <pointLight position={[0, 3.5, 0]} intensity={1.2} distance={15} color="#E9F2E3" />

      {/* 2. LANTAI RUANG KELAS */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[13, 15]} />
        <meshStandardMaterial
          map={gridTexture || undefined}
          color={CLASSROOM_COLORS.floor}
          roughness={0.8}
        />
      </mesh>

      {/* 3. PLAFON & LAMPU NEON */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.0, 0]}>
        <planeGeometry args={[13, 15]} />
        <meshStandardMaterial color={CLASSROOM_COLORS.ceiling} roughness={0.9} />
      </mesh>

      {/* 4 Strip Lampu Neon Plafon */}
      {[-3, 3].map((x) =>
        [-3, 2].map((z) => (
          <group key={`lamp-${x}-${z}`} position={[x, 3.9, z]}>
            <mesh>
              <boxGeometry args={[0.3, 0.1, 2.0]} />
              <meshStandardMaterial color={CLASSROOM_COLORS.neonCasing} />
            </mesh>
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[0.2, 0.04, 1.9]} />
              <meshBasicMaterial color={CLASSROOM_COLORS.fluor} />
            </mesh>
            <pointLight position={[0, -0.15, 0]} intensity={0.5} distance={6} color="#E9F2E3" />
          </group>
        ))
      )}

      {/* 4. DINDING-DINDING RUANG KELAS */}
      {/* Dinding Depan (Z = -7.5) */}
      <group position={[0, 2.0, -7.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[13, 4.0, 0.2]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wall} roughness={0.85} />
        </mesh>
        {/* Lis bawah dinding */}
        <mesh position={[0, -1.85, 0.11]}>
          <boxGeometry args={[13, 0.3, 0.05]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wallBase} />
        </mesh>
      </group>

      {/* Dinding Belakang (Z = 7.5) */}
      <group position={[0, 2.0, 7.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[13, 4.0, 0.2]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wall} roughness={0.85} />
        </mesh>
        <mesh position={[0, -1.85, -0.11]}>
          <boxGeometry args={[13, 0.3, 0.05]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wallBase} />
        </mesh>
      </group>

      {/* Dinding Kanan (X = 6.5) */}
      <group position={[6.5, 2.0, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 4.0, 15]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wall} roughness={0.85} />
        </mesh>
        <mesh position={[-0.11, -1.85, 0]}>
          <boxGeometry args={[0.05, 0.3, 15]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wallBase} />
        </mesh>
      </group>

      {/* Dinding Kiri dengan 4 Jendela Besar (X = -6.5) */}
      <group position={[-6.5, 2.0, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 4.0, 15]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wall} roughness={0.85} />
        </mesh>
        <mesh position={[0.11, -1.85, 0]}>
          <boxGeometry args={[0.05, 0.3, 15]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.wallBase} />
        </mesh>
        {/* Bingkai Jendela Kaca */}
        {[-4.5, -1.5, 1.5, 4.5].map((z) => (
          <group key={`window-${z}`} position={[0.11, 0.3, z]}>
            <mesh>
              <boxGeometry args={[0.06, 2.2, 1.8]} />
              <meshStandardMaterial color="#0A0E17" roughness={0.2} metalness={0.7} />
            </mesh>
            <pointLight position={[0.3, 0, 0]} intensity={0.15} distance={3} color="#5CE1FF" />
          </group>
        ))}
      </group>

      {/* 5. OBJEK KELAS: PAPAN TULIS BESAR (Depan Kelas) */}
      <group
        position={[0, 2.1, -7.38]}
        userData={{
          interactable: {
            id: "classroom-blackboard",
            type: "classroom-blackboard",
            label: "Papan Tulis Kelas",
            actionPrompt: "[E] BUKA PENGUMUMAN KELAS",
          },
        }}
      >
        {/* Bingkai Kayu */}
        <mesh>
          <boxGeometry args={[6.2, 2.4, 0.08]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.blackboardFrame} />
        </mesh>
        {/* Permukaan Papan Hijau Tua */}
        <mesh position={[0, 0, 0.045]}>
          <boxGeometry args={[6.0, 2.2, 0.02]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.blackboard} roughness={0.7} />
        </mesh>
        <Text
          position={[0, 0.6, 0.06]}
          fontSize={0.24}
          color="#E9F2E3"
          anchorX="center"
          anchorY="middle"
        >
          {classroom.name.toUpperCase()}
        </Text>
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.14}
          color="#F2C200"
          anchorX="center"
          anchorY="middle"
        >
          {`[ KODE: ${classroom.code} // TATA LETAK: ${classroom.roomLayout.toUpperCase()} ]`}
        </Text>
      </group>

      {/* 6. MEJA GURU (Depan Papan Tulis) */}
      <group
        position={[0, 0, -5.6]}
        userData={{
          interactable: {
            id: "classroom-teacher",
            type: "classroom-teacher",
            label: "Meja Guru / Pengajar",
            actionPrompt: teacher ? `[E] MEJA PENGAJAR: ${teacher.user.displayName || teacher.user.name}` : "[E] MEJA PENGAJAR",
          },
        }}
      >
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[2.0, 0.06, 0.9]} />
          <meshStandardMaterial color={CLASSROOM_COLORS.deskTop} />
        </mesh>
        {/* Kaki Meja Guru */}
        {[-0.9, 0.9].map((x) =>
          [-0.38, 0.38].map((z) => (
            <mesh key={`tleg-${x}-${z}`} position={[x, 0.38, z]}>
              <boxGeometry args={[0.06, 0.76, 0.06]} />
              <meshStandardMaterial color={CLASSROOM_COLORS.deskLegs} />
            </mesh>
          ))
        )}
        <Text
          position={[0, 0.8, 0.1]}
          rotation={[-Math.PI / 4, 0, 0]}
          fontSize={0.1}
          color="#F2C200"
          anchorX="center"
        >
          MEJA PENGAJAR
        </Text>
      </group>

      {/* 7. PAPAN DISKUSI (Dinding Kanan) */}
      <group
        position={[6.38, 2.0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        userData={{
          interactable: {
            id: "classroom-discussion",
            type: "classroom-discussion",
            label: "Papan Diskusi Kelas",
            actionPrompt: "[E] BUKA PAPAN DISKUSI KELAS",
          },
        }}
      >
        <mesh>
          <boxGeometry args={[3.0, 1.8, 0.06]} />
          <meshStandardMaterial color="#2E241D" />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[2.85, 1.65, 0.02]} />
          <meshStandardMaterial color="#1F1D19" />
        </mesh>
        <Text position={[0, 0.6, 0.05]} fontSize={0.16} color="#5CE1FF" anchorX="center">
          PAPAN DISKUSI KELAS
        </Text>
      </group>

      {/* 8. RAK MATERI KELAS (Sudut Kanan Belakang) */}
      <group
        position={[5.2, 1.2, 5.8]}
        userData={{
          interactable: {
            id: "classroom-materials",
            type: "classroom-materials",
            label: "Rak Materi Belajar",
            actionPrompt: "[E] BUKA RAK MATERI KELAS",
          },
        }}
      >
        <mesh>
          <boxGeometry args={[1.6, 2.4, 0.6]} />
          <meshStandardMaterial color="#2B2119" />
        </mesh>
        {/* Sekat Rak */}
        {[-0.6, 0, 0.6].map((y) => (
          <mesh key={`shelf-${y}`} position={[0, y, 0.05]}>
            <boxGeometry args={[1.5, 0.04, 0.55]} />
            <meshStandardMaterial color="#4A3B2C" />
          </mesh>
        ))}
        <Text position={[0, 1.3, 0.32]} fontSize={0.14} color="#4FD08A" anchorX="center">
          RAK MATERI KELAS
        </Text>
      </group>

      {/* 9. PINTU KELUAR KE LORONG (Belakang Kelas Z = 7.38) */}
      <group
        position={[0, 1.5, 7.38]}
        rotation={[0, Math.PI, 0]}
        userData={{
          interactable: {
            id: "classroom-exit",
            type: "classroom-exit",
            label: "Pintu Keluar",
            actionPrompt: "[E] KELUAR KE LORONG SEKOLAH",
          },
        }}
      >
        <mesh>
          <boxGeometry args={[1.8, 3.0, 0.1]} />
          <meshStandardMaterial color="#35261C" />
        </mesh>
        <mesh position={[0.65, 0, 0.06]}>
          <boxGeometry args={[0.06, 0.18, 0.08]} />
          <meshStandardMaterial color="#E9F2E3" metalness={0.8} />
        </mesh>
        <Text position={[0, 1.2, 0.06]} fontSize={0.14} color="#F2C200" anchorX="center">
          [E] KELUAR KE LORONG
        </Text>
      </group>

      {/* 10. GRID 30 MEJA SISWA (Standard-30) */}
      {Array.from({ length: 30 }).map((_, index) => {
        const [x, y, z] = calculateDeskGridPosition(index);
        const member = studentSeats.get(index);
        const isMe = member?.user.id === currentUserId;
        const isTargeted = activeInteractable?.id === `desk-${index}`;

        return (
          <group
            key={`desk-${index}`}
            position={[x, y, z]}
            userData={{
              interactable: {
                id: `desk-${index}`,
                type: "classroom-desk",
                label: member
                  ? `Meja #${index + 1}: ${member.user.displayName || member.user.name}`
                  : `Meja #${index + 1} (Kosong)`,
                actionPrompt: member
                  ? isMe
                    ? `[E] MEJA ANDA (#${index + 1})`
                    : `[E] LIHAT MEJA @${member.user.username || member.user.name}`
                  : `[E] MEJA #${index + 1} (KOSONG)`,
                targetId: member?.user.id || "",
              },
            }}
          >
            {/* Permukaan Meja Kayu */}
            <mesh position={[0, 0.72, 0]}>
              <boxGeometry args={[1.2, 0.04, 0.7]} />
              <meshStandardMaterial
                color={isTargeted ? CLASSROOM_COLORS.caution : CLASSROOM_COLORS.deskTop}
                roughness={0.7}
              />
            </mesh>

            {/* 4 Kaki Meja Besi */}
            {[-0.54, 0.54].map((lx) =>
              [-0.28, 0.28].map((lz) => (
                <mesh key={`leg-${lx}-${lz}`} position={[lx, 0.36, lz]}>
                  <boxGeometry args={[0.04, 0.72, 0.04]} />
                  <meshStandardMaterial color={CLASSROOM_COLORS.deskLegs} />
                </mesh>
              ))
            )}

            {/* Kursi Siswa di Belakang Meja */}
            <group position={[0, 0, 0.55]}>
              <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[0.5, 0.04, 0.45]} />
                <meshStandardMaterial color={CLASSROOM_COLORS.chairSeat} />
              </mesh>
              {/* Sandaran Kursi */}
              <mesh position={[0, 0.75, 0.2]}>
                <boxGeometry args={[0.48, 0.35, 0.03]} />
                <meshStandardMaterial color={CLASSROOM_COLORS.chairSeat} />
              </mesh>
              {/* Kaki Kursi */}
              {[-0.2, 0.2].map((cx) =>
                [-0.18, 0.18].map((cz) => (
                  <mesh key={`cleg-${cx}-${cz}`} position={[cx, 0.22, cz]}>
                    <boxGeometry args={[0.03, 0.44, 0.03]} />
                    <meshStandardMaterial color={CLASSROOM_COLORS.deskLegs} />
                  </mesh>
                ))
              )}
            </group>

            {/* Pelat Nomor Meja di Bagian Depan */}
            <mesh position={[0, 0.68, -0.34]}>
              <boxGeometry args={[0.22, 0.08, 0.02]} />
              <meshStandardMaterial color="#11141A" />
            </mesh>
            <Text
              position={[0, 0.68, -0.36]}
              rotation={[0, Math.PI, 0]}
              fontSize={0.06}
              color={member ? (isMe ? "#4FD08A" : "#F2C200") : "#E9F2E3"}
              anchorX="center"
              anchorY="middle"
            >
              {`#${index + 1}`}
            </Text>

            {/* Jika Berpenghuni: Lampu Meja dan Label Nama */}
            {member && (
              <group position={[0.4, 0.74, -0.15]}>
                {/* Dudukan Lampu Meja */}
                <mesh>
                  <cylinderGeometry args={[0.05, 0.07, 0.03, 8]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
                  <meshStandardMaterial color="#444" />
                </mesh>
                {/* Kap Lampu */}
                <mesh position={[0, 0.2, 0]} rotation={[0.2, 0, 0]}>
                  <coneGeometry args={[0.08, 0.08, 8]} />
                  <meshStandardMaterial color={isMe ? "#4FD08A" : "#F2C200"} />
                </mesh>
                <pointLight
                  position={[0, 0.18, 0]}
                  intensity={0.6}
                  distance={2.5}
                  color={isMe ? "#4FD08A" : "#F2C200"}
                />
              </group>
            )}

            {/* Teks Nama Pemilik Meja */}
            {member && (
              <Text
                position={[0, 0.75, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.08}
                color={isMe ? "#4FD08A" : "#E9F2E3"}
                anchorX="center"
                anchorY="middle"
              >
                {isMe ? "MEJA ANDA" : `@${member.user.username || member.user.name}`}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}
