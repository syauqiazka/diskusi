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
import { VhsEffects } from "./vhs-effects";
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
      <VhsEffects />
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

  // Fallback Otomatis Mode Cepat 2D (Review Focus 1 & WORLD.md)
  if (!hasWebGL || fastMode) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-night text-fluor font-mono">
        <div className="max-w-xl w-full border-2 border-caution bg-night/95 p-8 space-y-6 text-center shadow-[0_0_25px_rgba(242,194,0,0.2)]">
          <div className="w-16 h-16 border-2 border-caution mx-auto flex items-center justify-center bg-caution/10">
            <Zap className="w-8 h-8 text-caution" />
          </div>

          <div className="space-y-2">
            <h2 className="font-sign text-3xl sm:text-4xl uppercase text-fluor tracking-wide">
              {fastMode ? "MODE CEPAT (2D) AKTIF" : "WEBGL TIDAK TERDETEKSI"}
            </h2>
            <p className="font-body text-xs sm:text-sm text-fluor/80 leading-relaxed">
              {fastMode
                ? "Anda memilih navigasi antarmuka 2D cepat. Seluruh fitur forum kelas, mading global, perpustakaan, dan pesan pribadi dapat diakses penuh tanpa beban grafis."
                : "Perangkat atau peramban Anda tidak mendukung akselerasi grafis WebGL 3D. Sistem secara otomatis mengalihkan navigasi ke Mode Cepat 2D."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/kelas">
              <Button variant="default" size="lg" className="w-full sm:w-auto space-x-2">
                <span className="font-hud text-lg tracking-wider">MASUK KE RUANG KELAS 2D</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/mading">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                BUKA MADING GLOBAL
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
    <div className="relative w-screen h-screen bg-night overflow-hidden select-none">
      {/* Tombol Pintas Kembali ke Mode Cepat 2D — hanya tampil saat dijeda */}
      {showExitButton && (
        <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
          <Link href="/kelas" tabIndex={isPointerLocked ? -1 : 0}>
            <Button
              variant="outline"
              size="sm"
              tabIndex={isPointerLocked ? -1 : 0}
              className="bg-night/90 hover:bg-caution hover:text-night text-fluor border-fluor/40 hover:border-caution font-hud text-base tracking-wider uppercase transition-colors"
            >
              KELUAR KE MODE 2D
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
          far: 250,
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
