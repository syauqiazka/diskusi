"use client";

import * as React from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { ArrowRight, Zap } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { SchoolHallwayScene } from "./school-hallway-scene";
import { PlayerController } from "./player-controller";
import { RaycastDetector } from "./raycast-detector";
import { VhsEffects } from "./vhs-effects";
import { WorldHud } from "./world-hud";
import { PauseMenu } from "./pause-menu";
import { TouchControls } from "./touch-controls";
import { WorldModals } from "./world-modals";
import { Button } from "@/components/ui/button";

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

export function WorldContainer() {
  const [hasWebGL] = React.useState<boolean>(() => isWebGLAvailable());
  const fastMode = useWorldStore((s) => s.worldSettings.fastMode);

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

  return (
    <div className="relative w-full h-[85vh] sm:h-[88vh] bg-night overflow-hidden border border-fluor/30 select-none">
      {/* 3D Canvas React Three Fiber */}
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 75, near: 0.1, far: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        className="w-full h-full cursor-crosshair"
      >
        <PlayerController />
        <RaycastDetector />
        <SchoolHallwayScene />
        <VhsEffects />
      </Canvas>

      {/* Layer HUD VHS Kamera (PLAY, PAUSE, Timer SP, Crosshair) */}
      <WorldHud />

      {/* Layar Jeda / Pause Menu dengan Sakelar ON/OFF */}
      <PauseMenu />

      {/* Kontrol Sentuh Mobile (D-pad & Tombol Aksi) */}
      <TouchControls />

      {/* Panel Modal 2D Objek Interaktif (Pintu, Mading, Perpustakaan, Loker, Cermin) */}
      <WorldModals />
    </div>
  );
}
