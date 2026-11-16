"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Home, Zap, Monitor, Eye, Compass } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";

export function PauseMenu() {
  const router = useRouter();
  const isPaused = useWorldStore((s) => s.isPaused);
  const activePanel = useWorldStore((s) => s.activePanel);
  const worldSettings = useWorldStore((s) => s.worldSettings);
  const headBobEnabled = useWorldStore((s) => s.headBobEnabled);
  const isCrouching = useWorldStore((s) => s.isCrouching);

  const setPaused = useWorldStore((s) => s.setPaused);
  const updateWorldSettings = useWorldStore((s) => s.updateWorldSettings);
  const setHeadBobEnabled = useWorldStore((s) => s.setHeadBobEnabled);
  const setCrouching = useWorldStore((s) => s.setCrouching);

  // Tangani shortcut keyboard saat layar jeda terbuka (Esc untuk lanjut, X untuk keluar ke beranda)
  React.useEffect(() => {
    if (!isPaused || activePanel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika fokus di form input
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "KeyX" || e.key === "x" || e.key === "X") {
        e.preventDefault();
        setPaused(false);
        router.push("/");
      } else if (e.code === "Escape") {
        e.preventDefault();
        setPaused(false);
        const canvas = document.querySelector("canvas");
        canvas?.requestPointerLock?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused, activePanel, router, setPaused]);

  // Jangan tampilkan menu jeda jika ada panel 2D (modal) yang sedang dibuka
  if (!isPaused || activePanel) return null;

  const handleResume = () => {
    setPaused(false);
    const canvas = document.querySelector("canvas");
    canvas?.requestPointerLock?.();
  };

  const handleExitToHome = () => {
    setPaused(false);
    router.push("/");
  };

  const handleToggleFastMode = () => {
    updateWorldSettings({ fastMode: !worldSettings.fastMode });
    if (!worldSettings.fastMode) {
      router.push("/kelas");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-night/95 backdrop-blur-sm flex items-center justify-center p-4 select-none font-hud">
      <div className="max-w-lg w-full border-2 border-fluor/40 bg-night p-6 sm:p-8 space-y-5 text-fluor relative shadow-[0_0_35px_rgba(11,13,18,0.95)]">
        {/* Header Layar Jeda */}
        <div className="text-center space-y-2 border-b border-fluor/20 pb-4">
          <div className="inline-flex items-center space-x-2 text-alert text-xl tracking-widest animate-pulse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            <span>SIMULASI DIJEDA [ESC]</span>
          </div>
          <h2 className="font-sign text-3xl sm:text-5xl tracking-wide uppercase text-fluor">
            SEKOLAH TENGAH MALAM
          </h2>
          <p className="font-mono text-xs text-caution tracking-widest uppercase">
            {"//"} PENGATURAN KAWASAN &amp; KENDALI EKSPLORASI
          </p>
        </div>

        {/* Deretan Sakelar ON/OFF ala Cuchillo Midnight Video */}
        <div className="space-y-2.5 font-mono text-xs max-h-[42vh] overflow-y-auto pr-1">
          {/* 1. Mode Cepat (2D Penuh) */}
          <div className="flex items-center justify-between p-2.5 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-caution" />
              <span className="font-hud text-lg tracking-wider text-fluor">MODE CEPAT (2D)</span>
            </div>
            <button
              type="button"
              onClick={handleToggleFastMode}
              className={`px-3 py-1 font-hud text-base tracking-widest border transition-colors cursor-pointer ${
                worldSettings.fastMode
                  ? "bg-caution text-night border-caution font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {worldSettings.fastMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* 2. Head Bob Kamera */}
          <div className="flex items-center justify-between p-2.5 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-fluor/80" />
              <div>
                <span className="font-hud text-lg tracking-wider text-fluor">HEAD BOB KAMERA</span>
                <p className="text-[10px] text-fluor/60 font-body">Ayunan langkah saat berjalan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHeadBobEnabled(!headBobEnabled)}
              className={`px-3 py-1 font-hud text-base tracking-widest border transition-colors cursor-pointer ${
                headBobEnabled
                  ? "bg-caution text-night border-caution font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {headBobEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* 3. Postur Mata (Berdiri 1.6m vs Jongkok 0.9m) */}
          <div className="flex items-center justify-between p-2.5 border border-fluor/20 bg-fluor/[0.02]">
            <div>
              <span className="font-hud text-lg tracking-wider text-fluor">POSTUR MATA (C)</span>
              <p className="text-[10px] text-fluor/60 font-body">
                {isCrouching ? "Kamera jongkok 0.9m" : "Kamera berdiri 1.6m"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCrouching(!isCrouching)}
              className={`px-3 py-1 font-hud text-base tracking-widest border transition-colors cursor-pointer ${
                isCrouching
                  ? "bg-neon-cyan text-night border-neon-cyan font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {isCrouching ? "JONGKOK" : "BERDIRI"}
            </button>
          </div>

          {/* 4. Suasana Kawasan (Malam vs Pagi) */}
          <div className="flex items-center justify-between p-2.5 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-neon-cyan" />
              <span className="font-hud text-lg tracking-wider text-fluor">SUASANA KAWASAN</span>
            </div>
            <button
              type="button"
              onClick={() => updateWorldSettings({ nightMode: !worldSettings.nightMode })}
              className={`px-3 py-1 font-hud text-base tracking-widest border transition-colors cursor-pointer ${
                worldSettings.nightMode
                  ? "bg-neon-cyan text-night border-neon-cyan font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {worldSettings.nightMode ? "MALAM (ON)" : "PAGI (OFF)"}
            </button>
          </div>

          {/* 5. Tampilkan HUD Antarmuka */}
          <div className="flex items-center justify-between p-2.5 border border-fluor/20 bg-fluor/[0.02]">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-fluor/80" />
              <span className="font-hud text-lg tracking-wider text-fluor">ANTARMUKA HUD</span>
            </div>
            <button
              type="button"
              onClick={() => updateWorldSettings({ showHud: !worldSettings.showHud })}
              className={`px-3 py-1 font-hud text-base tracking-widest border transition-colors cursor-pointer ${
                worldSettings.showHud
                  ? "bg-caution text-night border-caution font-bold"
                  : "bg-night text-fluor/60 border-fluor/30 hover:border-fluor"
              }`}
            >
              {worldSettings.showHud ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="space-y-2.5 pt-2">
          {/* Tombol Lanjut Simulasi */}
          <button
            type="button"
            onClick={handleResume}
            className="w-full bg-caution text-night py-3 font-hud text-xl sm:text-2xl tracking-widest hover:bg-caution/90 transition-colors flex items-center justify-center space-x-2 font-bold cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>KLIK UNTUK LANJUT [ESC]</span>
          </button>

          {/* Tombol Keluar Langsung ke Halaman Utama (Pencet X) */}
          <button
            type="button"
            onClick={handleExitToHome}
            className="w-full border-2 border-caution/80 bg-caution/15 text-caution py-2.5 font-hud text-lg sm:text-xl tracking-widest hover:bg-caution hover:text-night transition-colors flex items-center justify-center space-x-2 font-bold cursor-pointer shadow-[0_0_15px_rgba(242,194,0,0.2)]"
          >
            <Home className="w-4 h-4" />
            <span>[X] KELUAR KE HALAMAN UTAMA</span>
          </button>

          {/* Tombol Alternatif: Masuk ke Mode Cepat 2D */}
          <Link href="/kelas" className="block">
            <button
              type="button"
              className="w-full border border-fluor/30 bg-night text-fluor/70 py-2 font-hud text-base tracking-wider hover:border-fluor hover:text-fluor transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>MASUK KE RUANG KELAS (2D)</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

