"use client";

import * as React from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ArrowRight, Zap } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { CampusBlockout } from "./campus/campus-blockout";
import { CampusTerrain } from "./campus/campus-terrain";
import { CampusGrass } from "./campus/campus-grass";
import { CampusPlayerController } from "./campus/campus-player-controller";
import { InteractableMarkers } from "./campus/interactable-markers";
import { InteractionRaycaster } from "./campus/interaction-raycaster";
import { InteractionHud } from "./campus/interaction-hud";
import { InteractionPanel } from "./campus/interaction-panel";
import { TimeOfDayEnvironment } from "./environment/time-of-day-environment";
import { TimeOfDayDebugPanel } from "./environment/time-of-day-debug-panel";
import { PauseMenu } from "./pause-menu";
import { TouchControls } from "./touch-controls";
import { Button } from "@/components/ui/button";
import { CAMPUS_LAYOUT } from "@/lib/world/campus-layout";

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

function CampusScene({
  showLabels,
  cutawayMode,
}: {
  showLabels: boolean;
  cutawayMode: boolean;
}) {
  const cameraMode = useWorldStore((s) => s.cameraMode);

  return (
    <>
      <TimeOfDayEnvironment />
      <CampusTerrain />
      <CampusBlockout showLabels={showLabels} cutawayMode={cutawayMode} />
      <CampusGrass />
      <InteractableMarkers />
      <InteractionRaycaster />
      {cameraMode === "fps" ? (
        <CampusPlayerController />
      ) : (
        <OrbitControls target={[0, -2, 0]} makeDefault />
      )}
    </>
  );
}

export function WorldContainer() {
  const [hasWebGL] = React.useState<boolean>(() => isWebGLAvailable());
  const fastMode = useWorldStore((s) => s.worldSettings.fastMode);
  const cutawayMode = useWorldStore((s) => s.cutawayMode);
  const isPointerLocked = useWorldStore((s) => s.isPointerLocked);
  const isPaused = useWorldStore((s) => s.isPaused);
  const [showLabels] = React.useState(false);

  // Fallback Otomatis Mode Cepat 2D
  if (!hasWebGL || fastMode) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-canvas text-text font-body">
        <div className="max-w-xl w-full border-2 border-border bg-surface rounded-3xl p-8 space-y-6 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl border-2 border-primary/40 mx-auto flex items-center justify-center bg-primary/10">
            <Zap className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-wide">
              {fastMode ? "Mode Cepat (2D) Aktif" : "WebGL Tidak Terdeteksi"}
            </h2>
            <p className="font-body text-sm sm:text-base text-text-muted leading-relaxed">
              {fastMode
                ? "Anda memilih navigasi antarmuka 2D cepat. Seluruh fitur forum kelas, mading global, perpustakaan, dan pesan pribadi dapat diakses penuh tanpa beban grafis 3D."
                : "Perangkat atau peramban Anda tidak mendukung akselerasi grafis WebGL 3D. Sistem secara otomatis mengalihkan navigasi ke Mode Cepat 2D."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/kelas">
              <Button variant="default" size="lg" className="w-full sm:w-auto space-x-2">
                <span className="font-display font-bold text-base">Masuk ke Ruang Kelas 2D</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/mading">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-display font-bold text-base">
                Buka Mading Global
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const spawnPos = CAMPUS_LAYOUT.playerSpawn.position;

  // Tombol keluar hanya terlihat saat dijeda atau pointer tidak terkunci
  const showExitButton = isPaused || !isPointerLocked;

  return (
    <div className="relative w-screen h-screen bg-canvas overflow-hidden select-none">
      {/* Tombol Pintas Kembali ke Mode Cepat 2D — hanya tampil saat dijeda */}
      {showExitButton && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
          <Link href="/kelas" tabIndex={isPointerLocked ? -1 : 0}>
            <Button
              variant="outline"
              size="sm"
              tabIndex={isPointerLocked ? -1 : 0}
              className="bg-surface/95 hover:bg-surface text-text border-2 border-border shadow-md font-display font-bold text-sm tracking-wide rounded-full px-4 py-2 transition-transform hover:scale-105"
            >
              Kembali ke Mode 2D
            </Button>
          </Link>
        </div>
      )}

      {/* 3D Canvas React Three Fiber */}
      <Canvas
        camera={{
          position: [spawnPos[0], spawnPos[1] + 1.6, spawnPos[2]],
          fov: 75,
          near: 0.05,
          far: 1200,
        }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        className="w-full h-full cursor-crosshair"
      >
        <CampusScene showLabels={showLabels} cutawayMode={cutawayMode} />
      </Canvas>

      {/* Layer HUD VHS Kamera (PLAY, PAUSE, Timer SP, Crosshair) */}
      <InteractionHud />

      {/* Layar Jeda / Pause Menu dengan Sakelar ON/OFF */}
      <PauseMenu />

      {/* Kontrol Sentuh Mobile (D-pad & Tombol Aksi) */}
      <TouchControls />

      {/* Panel Modal 2D Objek Interaktif (Pintu, Mading, Perpustakaan, Loker, Cermin) */}
      <InteractionPanel />

      {/* Panel Debug Pengaturan Waktu Realtime (Pagi, Siang, Sore, Malam) */}
      <TimeOfDayDebugPanel />
    </div>
  );
}
