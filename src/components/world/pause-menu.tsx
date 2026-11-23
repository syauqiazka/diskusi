"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Home, Zap, Eye, Compass, Pause } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none font-body">
      <div className="max-w-md w-full rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-6 text-text relative shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header Layar Jeda */}
        <div className="text-center space-y-2 border-b border-border/50 pb-5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-secondary/30 text-text font-display font-semibold text-xs border border-secondary/50">
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Simulasi Dijeda [Esc]</span>
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight text-text">
            Menu Eksplorasi
          </h2>
          <p className="font-body text-xs text-text-muted">
            Atur preferensi tampilan dan kontrol jelajah kawasan sekolah
          </p>
        </div>

        {/* Deretan Pengaturan Cepat */}
        <div className="space-y-2.5 font-body text-xs">
          {/* 1. Mode Cepat (2D Penuh) */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-canvas/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-text">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <div>
                <span className="font-display font-bold text-text text-sm">Mode Cepat (2D)</span>
                <p className="text-[11px] text-text-muted">Langsung buka portal web 2D</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleFastMode}
              className={`px-3.5 py-1 rounded-xl font-display font-bold text-xs border transition-all cursor-pointer ${
                worldSettings.fastMode
                  ? "bg-primary text-text border-primary/60 shadow-xs"
                  : "bg-surface text-text-muted border-border hover:text-text"
              }`}
            >
              {worldSettings.fastMode ? "Aktif" : "Mati"}
            </button>
          </div>

          {/* 2. Head Bob Kamera */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-canvas/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-secondary/25 flex items-center justify-center text-text">
                <Compass className="w-4 h-4 text-text" />
              </div>
              <div>
                <span className="font-display font-bold text-text text-sm">Goyangan Langkah</span>
                <p className="text-[11px] text-text-muted">Efek ayunan kamera saat berjalan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setHeadBobEnabled(!headBobEnabled)}
              className={`px-3.5 py-1 rounded-xl font-display font-bold text-xs border transition-all cursor-pointer ${
                headBobEnabled
                  ? "bg-primary text-text border-primary/60 shadow-xs"
                  : "bg-surface text-text-muted border-border hover:text-text"
              }`}
            >
              {headBobEnabled ? "Aktif" : "Mati"}
            </button>
          </div>

          {/* 3. Postur Mata (Berdiri 1.6m vs Jongkok 0.9m) */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-canvas/40">
            <div>
              <span className="font-display font-bold text-text text-sm">Tinggi Kamera (C)</span>
              <p className="text-[11px] text-text-muted">
                {isCrouching ? "Kamera jongkok 0.9m" : "Kamera berdiri 1.6m"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCrouching(!isCrouching)}
              className={`px-3.5 py-1 rounded-xl font-display font-bold text-xs border transition-all cursor-pointer ${
                isCrouching
                  ? "bg-secondary text-text border-secondary/60 shadow-xs"
                  : "bg-surface text-text-muted border-border hover:text-text"
              }`}
            >
              {isCrouching ? "Jongkok" : "Berdiri"}
            </button>
          </div>

          {/* 4. Tampilkan HUD Antarmuka */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-canvas/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-canvas flex items-center justify-center text-text border border-border">
                <Eye className="w-4 h-4 text-text-muted" />
              </div>
              <span className="font-display font-bold text-text text-sm">Antarmuka HUD</span>
            </div>
            <button
              type="button"
              onClick={() => updateWorldSettings({ showHud: !worldSettings.showHud })}
              className={`px-3.5 py-1 rounded-xl font-display font-bold text-xs border transition-all cursor-pointer ${
                worldSettings.showHud
                  ? "bg-primary text-text border-primary/60 shadow-xs"
                  : "bg-surface text-text-muted border-border hover:text-text"
              }`}
            >
              {worldSettings.showHud ? "Tampil" : "Sembunyi"}
            </button>
          </div>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="space-y-2.5 pt-2 border-t border-border/50">
          {/* Tombol Lanjut Simulasi */}
          <button
            type="button"
            onClick={handleResume}
            className="w-full bg-primary text-text py-3 rounded-2xl font-display font-bold text-sm tracking-wide shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Lanjut Jelajah [Esc]</span>
          </button>

          {/* Tombol Keluar Langsung ke Halaman Utama (Pencet X) */}
          <button
            type="button"
            onClick={handleExitToHome}
            className="w-full border-2 border-border bg-surface text-text py-2.5 rounded-2xl font-display font-bold text-sm hover:bg-canvas transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>[X] Keluar ke Beranda</span>
          </button>

          {/* Tombol Alternatif: Masuk ke Mode Cepat 2D */}
          <Link href="/kelas" className="block">
            <button
              type="button"
              className="w-full text-text-muted hover:text-text py-1.5 font-body text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buka Daftar Kelas (Mode 2D)</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
