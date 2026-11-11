"use client";

import * as React from "react";
import { HelpCircle, X, Compass } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";

function formatSessionTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `SP ${hours}:${pad(minutes)}:${pad(seconds)}`;
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
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none font-hud">
      {/* BARIS ATAS HUD VHS */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Kiri Atas: Indikator PLAY / PAUSE (SVG Murni, Tanpa Emoji) */}
        <div className="flex items-center space-x-3 bg-night/80 border border-fluor/20 px-3 py-1.5 backdrop-blur-xs">
          {isPaused ? (
            <span className="flex items-center space-x-2 text-alert text-xl sm:text-2xl tracking-widest animate-pulse">
              <span>PAUSE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </span>
          ) : (
            <span className="flex items-center space-x-2 text-caution text-xl sm:text-2xl tracking-widest">
              <span>PLAY</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
          )}
          <button
            onClick={togglePause}
            className="text-xs font-mono text-fluor/60 hover:text-fluor border-l border-fluor/20 pl-2 uppercase"
          >
            {isPaused ? "[ESC] LANJUT" : "[ESC] JEDA"}
          </button>
        </div>

        {/* Tengah Atas: Tombol Informasi Kontrol (3.5 & 3.7) */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={toggleControlHelp}
            className="flex items-center space-x-1.5 bg-night/80 border border-fluor/25 hover:border-caution hover:text-caution px-3 py-1.5 text-fluor text-lg tracking-widest transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-caution" />
            <span>[?] INFORMASI KONTROL</span>
          </button>
        </div>

        {/* Kanan Atas: Penghitung Waktu Sesi VHS */}
        <div className="flex items-center space-x-3 bg-night/80 border border-fluor/20 px-3 py-1.5 text-fluor/80 text-xl sm:text-2xl tracking-widest">
          <span>{formatSessionTime(sessionDuration)}</span>
        </div>
      </div>

      {/* PUSAT LAYAR: RETICLE & PROMPT AKSI INTERAKTIF (3.4) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Reticle / Crosshair Minimalis */}
        <div className="relative w-4 h-4 flex items-center justify-center">
          <div className="w-1 h-1 bg-fluor/60" />
          <div className="absolute top-0 w-0.5 h-1 bg-fluor/40" />
          <div className="absolute bottom-0 w-0.5 h-1 bg-fluor/40" />
          <div className="absolute left-0 h-0.5 w-1 bg-fluor/40" />
          <div className="absolute right-0 h-0.5 w-1 bg-fluor/40" />
        </div>

        {/* Banner Prompt Aksi saat objek terdeteksi raycast */}
        {activeInteractable && (
          <div className="mt-6 flex flex-col items-center space-y-1 animate-pulse">
            <div className="bg-night/95 border-2 border-caution px-5 py-2 shadow-[0_0_15px_rgba(242,194,0,0.4)]">
              <span className="text-caution text-2xl sm:text-3xl tracking-widest font-hud font-bold">
                {activeInteractable.actionPrompt}
              </span>
            </div>
            <div className="bg-night/90 border border-fluor/30 px-3 py-0.5">
              <span className="font-mono text-[11px] text-fluor/90 uppercase tracking-wider">
                {activeInteractable.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER HUD: STATUS NAVIGASI CEPAT */}
      <div className="flex items-center justify-between text-fluor/60 text-base sm:text-lg tracking-wider">
        <div className="hidden sm:block bg-night/70 px-2 py-0.5 border border-fluor/10">
          LORONG SEKOLAH TENGAH MALAM — LT 1
        </div>
        <div className="bg-night/70 px-2 py-0.5 border border-fluor/10 text-right ml-auto">
          FIRST-PERSON EXPLORATION // WASD TO WALK
        </div>
      </div>

      {/* MODAL DIALOG BANTUAN KONTROL KARAKTER */}
      {showControlHelp && (
        <div className="fixed inset-0 bg-night/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="max-w-md w-full border-2 border-caution bg-night p-6 space-y-5 relative">
            <button
              onClick={toggleControlHelp}
              className="absolute top-4 right-4 text-fluor/60 hover:text-caution p-1"
              aria-label="Tutup Bantuan"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-fluor/20 pb-3 flex items-center space-x-2 text-caution">
              <Compass className="w-5 h-5" />
              <h3 className="font-hud text-2xl uppercase tracking-widest">
                INFORMASI KONTROL KARAKTER
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs text-fluor/90">
              <div className="flex justify-between items-center p-2 border border-fluor/15">
                <span className="text-caution font-semibold">W, A, S, D / PANAH</span>
                <span>Bergerak Maju, Kiri, Mundur, Kanan</span>
              </div>
              <div className="flex justify-between items-center p-2 border border-fluor/15">
                <span className="text-caution font-semibold">GERAKAN MOUSE</span>
                <span>Melihat Sekeliling (Pointer Lock)</span>
              </div>
              <div className="flex justify-between items-center p-2 border border-fluor/15">
                <span className="text-caution font-semibold">SHIFT</span>
                <span>Berlari Cepat</span>
              </div>
              <div className="flex justify-between items-center p-2 border border-fluor/15">
                <span className="text-caution font-semibold">CTRL / C</span>
                <span>Jongkok (Tinggi 0.9m)</span>
              </div>
              <div className="flex justify-between items-center p-2 border border-fluor/15">
                <span className="text-caution font-semibold">TOMBOL E / KLIK</span>
                <span>Interaksi dengan Objek</span>
              </div>
              <div className="flex justify-between items-center p-2 border border-fluor/15">
                <span className="text-caution font-semibold">ESC</span>
                <span>Membuka / Menutup Menu Jeda</span>
              </div>
            </div>

            <button
              onClick={toggleControlHelp}
              className="w-full bg-caution text-night font-hud text-xl py-2 tracking-widest hover:bg-caution/90 transition-colors"
            >
              [TUTUP INFORMASI]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
