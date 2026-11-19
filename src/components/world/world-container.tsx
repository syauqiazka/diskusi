"use client";

import * as React from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { ArrowRight, Zap } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { Button } from "@/components/ui/button";
import { SakuraCampusScene } from "./sakura/sakura-campus-scene";
import { SakuraOverlayUI } from "./sakura/sakura-overlay-ui";

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

  // Fallback Otomatis Mode Cepat 2D jika perangkat tidak mendukung WebGL atau user memilih mode cepat
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

  return (
    <div className="relative w-screen h-screen bg-canvas overflow-hidden select-none">
      {/* 3D Canvas React Three Fiber - Sakura Academy Japanese Anime Campus */}
      <Canvas
        camera={{
          position: [-16, 26, 48],
          fov: 55,
          near: 0.1,
          far: 600,
        }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <SakuraCampusScene />
      </Canvas>

      {/* Layer Overlay UI Interaktif (Orbit/Walk, Cutaway Lantai, Mode Lapangan, Teleport, Waktu, Minimap) */}
      <SakuraOverlayUI />
    </div>
  );
}
