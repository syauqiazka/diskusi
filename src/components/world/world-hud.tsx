"use client";

import * as React from "react";
import { HelpCircle, X, Compass, Play, Pause } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";

function formatSessionTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function WorldHud() {
  const isPaused = useWorldStore((s) => s.isPaused);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);
  const activePanel = useWorldStore((s) => s.activePanel);
  const showHud = useWorldStore((s) => s.worldSettings.showHud);
  const showControlHelp = useWorldStore((s) => s.showControlHelp);
  const sessionDuration = useWorldStore((s) => s.sessionDuration);

  const togglePause = useWorldStore((s) => s.togglePause);
  const toggleControlHelp = useWorldStore((s) => s.toggleControlHelp);
  const incrementSessionDuration = useWorldStore((s) => s.incrementSessionDuration);

  // Timer sesi real-time (setiap detik)
  React.useEffect(() => {
    const timer = setInterval(() => {
      incrementSessionDuration();
    }, 1000);
    return () => clearInterval(timer);
  }, [incrementSessionDuration]);

  if (!showHud || activePanel) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none font-body">
      {/* BARIS ATAS HUD BERSIH & RAMAH */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Kiri Atas: Indikator PLAY / PAUSE */}
        <div className="flex items-center space-x-2 bg-surface/90 border-2 border-border px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
          {isPaused ? (
            <span className="flex items-center space-x-1.5 text-alert font-display font-bold text-xs tracking-wide">
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Dijeda</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-text font-display font-bold text-xs tracking-wide">
              <Play className="w-3.5 h-3.5 fill-primary text-primary" />
              <span>Jelajah Aktif</span>
            </span>
          )}
          <button
            onClick={togglePause}
            className="text-xs font-display font-medium text-text-muted hover:text-text border-l border-border pl-2 transition-colors"
          >
            {isPaused ? "[Esc] Lanjut" : "[Esc] Jeda"}
          </button>
        </div>

        {/* Tengah Atas: Tombol Panduan Kontrol */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={toggleControlHelp}
            className="flex items-center space-x-1.5 bg-surface/90 border-2 border-border hover:border-primary px-3.5 py-1.5 rounded-full text-text font-display font-bold text-xs shadow-sm transition-all hover:scale-105"
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            <span>[?] Panduan Kontrol</span>
          </button>
        </div>

        {/* Kanan Atas: Penghitung Waktu Jelajah */}
        <div className="flex items-center space-x-2 bg-surface/90 border-2 border-border px-3.5 py-1.5 rounded-full text-text font-display font-bold text-xs shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Waktu: {formatSessionTime(sessionDuration)}</span>
        </div>
      </div>

      {/* PUSAT LAYAR: RETICLE & PROMPT AKSI INTERAKTIF */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Reticle / Crosshair Lembut Bersahabat */}
        <div className="relative w-3 h-3 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-surface border-2 border-primary shadow-md" />
        </div>

        {/* Banner Prompt Aksi saat objek terdeteksi raycast */}
        {activeInteractable && (
          <div className="mt-8 flex flex-col items-center space-y-1.5 animate-bounce">
            <div className="bg-surface/95 border-2 border-primary px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
              <span className="text-text font-display font-bold text-base sm:text-lg">
                {activeInteractable.actionPrompt}
              </span>
            </div>
            <div className="bg-surface/90 border border-border px-3 py-1 rounded-full shadow-sm">
              <span className="font-body text-xs font-medium text-text-muted">
                {activeInteractable.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER HUD: STATUS NAVIGASI CEPAT */}
      <div className="flex items-center justify-between text-text-muted text-xs font-medium">
        <div className="hidden sm:block bg-surface/80 px-3 py-1 rounded-full border border-border shadow-xs backdrop-blur-xs">
          Kawasan Sekolah • Navigasi Bebas
        </div>
        <div className="bg-surface/80 px-3 py-1 rounded-full border border-border text-right ml-auto shadow-xs backdrop-blur-xs">
          Gunakan WASD untuk berjalan • Geser mouse untuk melihat
        </div>
      </div>

      {/* MODAL DIALOG BANTUAN KONTROL KARAKTER */}
      {showControlHelp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="max-w-md w-full rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={toggleControlHelp}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup Bantuan"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border/50 pb-3 flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-text">
                Panduan Kontrol Karakter
              </h3>
            </div>

            <div className="space-y-2.5 font-body text-xs text-text">
              <div className="flex justify-between items-center p-2.5 rounded-2xl border border-border bg-canvas/30">
                <span className="font-display font-bold text-text">W, A, S, D / Panah</span>
                <span className="text-text-muted">Maju, Kiri, Mundur, Kanan</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-2xl border border-border bg-canvas/30">
                <span className="font-display font-bold text-text">Gerakan Mouse</span>
                <span className="text-text-muted">Melihat Sekeliling (Pointer Lock)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-2xl border border-border bg-canvas/30">
                <span className="font-display font-bold text-text">Shift</span>
                <span className="text-text-muted">Berlari Cepat</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-2xl border border-border bg-canvas/30">
                <span className="font-display font-bold text-text">C</span>
                <span className="text-text-muted">Jongkok (Kamera 0.9m)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-2xl border border-border bg-canvas/30">
                <span className="font-display font-bold text-text">Tombol E / Klik Kiri</span>
                <span className="text-text-muted">Interaksi dengan Objek / Pintu</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-2xl border border-border bg-canvas/30">
                <span className="font-display font-bold text-text">Esc</span>
                <span className="text-text-muted">Buka / Tutup Menu Jeda</span>
              </div>
            </div>

            <button
              onClick={toggleControlHelp}
              className="w-full bg-primary text-text font-display font-bold text-sm py-3 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Mengerti, Lanjutkan Jelajah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
