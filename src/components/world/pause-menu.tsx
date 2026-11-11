"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Home, Zap, Monitor, Volume2, Eye } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";

export function PauseMenu() {
  const router = useRouter();
  const isPaused = useWorldStore((s) => s.isPaused);
  const activePanel = useWorldStore((s) => s.activePanel);
  const worldSettings = useWorldStore((s) => s.worldSettings);

  const setPaused = useWorldStore((s) => s.setPaused);
  const updateWorldSettings = useWorldStore((s) => s.updateWorldSettings);

  // Jangan tampilkan menu jeda jika ada panel 2D (modal) yang sedang dibuka
  if (!isPaused || activePanel) return null;

  const handleResume = () => {
    setPaused(false);
  };

  const handleToggleFastMode = () => {
    updateWorldSettings({ fastMode: !worldSettings.fastMode });
    if (!worldSettings.fastMode) {
      router.push("/kelas");
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-night/90 backdrop-blur-sm flex items-center justify-center p-4 select-none font-hud">
      <div className="max-w-lg w-full border-2 border-fluor/40 bg-night p-6 sm:p-8 space-y-6 text-fluor relative shadow-[0_0_25px_rgba(11,13,18,0.9)]">
        {/* Header Layar Jeda */}
        <div className="text-center space-y-2 border-b border-fluor/20 pb-4">
          <div className="inline-flex items-center space-x-2 text-alert text-xl tracking-widest animate-pulse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            <span>PAUSE ❚❚</span>
          </div>
          <h2 className="font-sign text-3xl sm:text-5xl tracking-wide uppercase text-fluor">
            SEKOLAH TENGAH MALAM
          </h2>
          <p className="font-mono text-xs text-caution tracking-widest uppercase">
            {"//"} PENGATURAN KAWASAN & PREFERENSI TAMPILAN
          </p>
        </div>

        {/* Deretan Sakelar ON/OFF ala Cuchillo Midnight Video */}
        <div className="space-y-3 font-mono text-xs">
          {/* 1. Mode Cepat (2D Penuh) */}
          <div className="flex items-center justify-between p-3 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-caution" />
              <span className="font-hud text-lg tracking-wider text-fluor">MODE CEPAT (2D)</span>
            </div>
            <button
              onClick={handleToggleFastMode}
              className={`px-3 py-1 font-hud text-lg tracking-widest border transition-colors ${
                worldSettings.fastMode
                  ? "bg-caution text-night border-caution font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {worldSettings.fastMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* 2. Mode Malam vs Pagi */}
          <div className="flex items-center justify-between p-3 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-neon-cyan" />
              <span className="font-hud text-lg tracking-wider text-fluor">SUASANA KAWASAN</span>
            </div>
            <button
              onClick={() => updateWorldSettings({ nightMode: !worldSettings.nightMode })}
              className={`px-3 py-1 font-hud text-lg tracking-widest border transition-colors ${
                worldSettings.nightMode
                  ? "bg-neon-cyan text-night border-neon-cyan font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {worldSettings.nightMode ? "MALAM (ON)" : "PAGI (OFF)"}
            </button>
          </div>

          {/* 3. Efek Suara */}
          <div className="flex items-center justify-between p-3 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-fluor/80" />
              <span className="font-hud text-lg tracking-wider text-fluor">SUARA / AUDIO</span>
            </div>
            <button
              onClick={() => updateWorldSettings({ sound: !worldSettings.sound })}
              className={`px-3 py-1 font-hud text-lg tracking-widest border transition-colors ${
                worldSettings.sound
                  ? "bg-ok text-night border-ok font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {worldSettings.sound ? "ON" : "OFF"}
            </button>
          </div>

          {/* 4. Tampilkan HUD Antarmuka */}
          <div className="flex items-center justify-between p-3 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-fluor/80" />
              <span className="font-hud text-lg tracking-wider text-fluor">ANTARMUKA HUD</span>
            </div>
            <button
              onClick={() => updateWorldSettings({ showHud: !worldSettings.showHud })}
              className={`px-3 py-1 font-hud text-lg tracking-widest border transition-colors ${
                worldSettings.showHud
                  ? "bg-caution text-night border-caution font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {worldSettings.showHud ? "ON" : "OFF"}
            </button>
          </div>

          {/* 5. Kualitas Grafis (Low, Medium, High) */}
          <div className="flex items-center justify-between p-3 border border-fluor/20 bg-fluor/[0.02]">
            <span className="font-hud text-lg tracking-wider text-fluor">KUALITAS GRAFIK</span>
            <div className="flex space-x-1 font-hud text-base">
              {(["low", "medium", "high"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => updateWorldSettings({ graphicsQuality: q })}
                  className={`px-2.5 py-0.5 border uppercase transition-colors ${
                    worldSettings.graphicsQuality === q
                      ? "bg-fluor text-night border-fluor font-bold"
                      : "bg-night text-fluor/50 border-fluor/20 hover:border-fluor/50"
                  }`}
                >
                  {q === "low" ? "Rendah" : q === "medium" ? "Sedang" : "Tinggi"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleResume}
            className="w-full bg-caution text-night py-3 font-hud text-2xl tracking-widest hover:bg-caution/90 transition-colors flex items-center justify-center space-x-2 font-bold"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>KLIK UNTUK LANJUT [ESC]</span>
          </button>

          <Link href="/" className="block">
            <button className="w-full border border-fluor/30 bg-night text-fluor/80 py-2.5 font-hud text-xl tracking-widest hover:border-fluor hover:text-fluor transition-colors flex items-center justify-center space-x-2">
              <Home className="w-4 h-4" />
              <span>KEMBALI KE GERBANG UTAMA</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

