"use client";

import * as React from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { ArrowRight, Zap, DoorOpen, Users } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { CLASSROOM_BOUNDS } from "@/lib/classroom/classroom-math";
import { ClassroomScene } from "./classroom-scene";
import { PlayerController } from "./player-controller";
import { RaycastDetector } from "./raycast-detector";
import { WorldHud } from "./world-hud";
import { PauseMenu } from "./pause-menu";
import { TouchControls } from "./touch-controls";
import { ClassroomModals } from "./classroom-modals";
import { Button } from "@/components/ui/button";
import { useClassroomPresence } from "@/lib/realtime/use-classroom-presence";
import type { ClassroomDetail } from "@/lib/classroom/types";

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

interface ClassroomContainerProps {
  classroom: ClassroomDetail;
  currentUserId: string;
}

export function ClassroomContainer({ classroom, currentUserId }: ClassroomContainerProps) {
  const [hasWebGL] = React.useState<boolean>(() => isWebGLAvailable());
  const fastMode = useWorldStore((s) => s.worldSettings.fastMode);

  // Data keanggotaan pengguna aktif untuk real-time presence
  const myMembership = classroom.members.find((m) => m.user.id === currentUserId);
  const myName = myMembership?.user.displayName || myMembership?.user.name || "Saya";
  const mySeat = myMembership?.seatIndex ?? null;

  const classMembersForPresence = React.useMemo(() => {
    return classroom.members.map((m) => ({
      userId: m.user.id,
      seatIndex: m.seatIndex,
      name: m.user.displayName || m.user.name,
    }));
  }, [classroom.members]);

  // Hook Real-Time Presence & Multiplayer Spasial
  const {
    activeSeatIndices,
    onlineUserIds,
    peerPositions,
    broadcastPosition,
    activeStudentCount,
    isFallback,
  } = useClassroomPresence({
    classId: classroom.id,
    currentUserId,
    currentUserName: myName,
    currentUserSeatIndex: mySeat,
    classMembers: classMembersForPresence,
  });

  // Fallback Otomatis Mode Cepat 2D
  if (!hasWebGL || fastMode) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-canvas text-text font-body">
        <div className="max-w-xl w-full rounded-3xl border-2 border-border bg-surface p-8 space-y-6 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-secondary/30 mx-auto flex items-center justify-center text-text">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">
              {fastMode ? "Mode Cepat (2D) Aktif" : "WebGL Tidak Terdeteksi"}
            </h2>
            <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
              {fastMode
                ? `Navigasi antarmuka 2D aktif untuk ${classroom.name}. Anda dapat melihat denah meja, membaca papan pengumuman, dan mengirim pesan kepada rekan sekelas tanpa beban grafis.`
                : "Perangkat atau peramban Anda tidak mendukung akselerasi grafis WebGL 3D. Dialihkan secara otomatis ke Mode Cepat 2D."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/kelas/${classroom.id}`}>
              <Button variant="default" size="lg" className="w-full sm:w-auto space-x-2 rounded-2xl font-display font-bold">
                <span>Buka Ruang Kelas 2D</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dunia">
              <Button variant="outline" size="lg" className="w-full sm:w-auto space-x-1.5 rounded-2xl font-display font-semibold">
                <DoorOpen className="w-4 h-4" />
                <span>Keluar ke Lorong</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[85vh] sm:h-[88vh] bg-canvas overflow-hidden rounded-3xl border-2 border-border select-none shadow-sm">
      {/* Indikator Status Kehadiran Ruang Kelas */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center space-x-2 font-display text-xs">
        <div className="bg-surface/90 border-2 border-border px-3.5 py-1.5 rounded-full flex items-center space-x-2 text-text shadow-sm backdrop-blur-md">
          <Users className="w-3.5 h-3.5 text-accent" />
          <span className="font-bold">
            {activeStudentCount} / {classroom.members.filter((m) => m.role === "STUDENT").length} Online
          </span>
          <span className="w-2 h-2 rounded-full bg-ok animate-pulse inline-block" />
          {isFallback && <span className="text-[10px] text-text-muted">(Lokal)</span>}
        </div>
      </div>

      {/* 3D Canvas React Three Fiber Khusus Ruang Kelas */}
      <Canvas
        camera={{ position: [0, 1.6, 5.5], fov: 75, near: 0.1, far: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        className="w-full h-full cursor-crosshair"
      >
        <PlayerController
          initialPosition={[0, 1.6, 5.5]}
          bounds={CLASSROOM_BOUNDS}
          onPositionUpdate={broadcastPosition}
        />
        <RaycastDetector />
        <ClassroomScene
          classroom={classroom}
          currentUserId={currentUserId}
          activeSeatIndices={activeSeatIndices}
          onlineUserIds={onlineUserIds}
          peerPositions={peerPositions}
        />
      </Canvas>

      {/* Layer HUD (PLAY, PAUSE, Timer, Crosshair) */}
      <WorldHud />

      {/* Layar Jeda / Pause Menu */}
      <PauseMenu />

      {/* Kontrol Sentuh Mobile */}
      <TouchControls />

      {/* Panel Modal 2D Objek Interaktif Ruang Kelas */}
      <ClassroomModals
        classroom={classroom}
        currentUserId={currentUserId}
        onlineUserIds={onlineUserIds}
      />
    </div>
  );
}
