"use client";

/**
 * Panel Debug Waktu Lingkungan Realtime
 * Hanya aktif pada mode pengembangan
 *
 * Gaya: Minimal, border 1px solid, font monospace, tanpa emoji.
 */

import React, { useState } from 'react';
import { useTimeOfDayStore } from '@/stores/use-time-of-day-store';

export const TimeOfDayDebugPanel: React.FC = () => {
  // Panggil semua hook di bagian atas sebelum early return (Rules of Hooks)
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Ambil state dan aksi dari store zustand untuk kebutuhan UI
  const timeSource = useTimeOfDayStore((s) => s.timeSource);
  const currentHour = useTimeOfDayStore((s) => s.currentHour);
  const formattedTime = useTimeOfDayStore((s) => s.formattedTime);
  const activePhase = useTimeOfDayStore((s) => s.activePhase);
  const nextPhase = useTimeOfDayStore((s) => s.nextPhase);
  const blendFactor = useTimeOfDayStore((s) => s.blendFactor);
  const isTransitioning = useTimeOfDayStore((s) => s.isTransitioning);
  const transitionDescription = useTimeOfDayStore((s) => s.transitionDescription);
  const prefersReducedMotion = useTimeOfDayStore((s) => s.prefersReducedMotion);

  const setManualHour = useTimeOfDayStore((s) => s.setManualHour);
  const useSystemTime = useTimeOfDayStore((s) => s.useSystemTime);
  const setPrefersReducedMotion = useTimeOfDayStore((s) => s.setPrefersReducedMotion);

  // Sembunyikan otomatis di lingkungan production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setManualHour(val);
  };

  return (
    <div className="fixed bottom-3 left-3 z-50 font-mono text-xs select-none">
      <div
        className={`bg-[#0B0D12]/95 text-[#E9F2E3] border border-[#E9F2E3]/30 shadow-xl rounded-none ${
          isCollapsed ? 'px-2.5 py-1.5 w-auto max-w-[44vw]' : 'p-2.5 w-80'
        }`}
      >
        {/* Header Panel */}
        <div className={`flex items-center justify-between gap-2 ${!isCollapsed ? 'pb-2 mb-2 border-b border-[#E9F2E3]/15' : ''}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block w-2 h-2 bg-[#F2C200] shrink-0" />
            <span className="font-vt323 text-base tracking-wider uppercase text-[#E9F2E3] truncate">
              {isCollapsed ? `${formattedTime} · ${activePhase.toUpperCase()}` : 'TIME DEBUG // BAZMA'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!isCollapsed && (
              <span className="px-1.5 py-0.5 border border-[#F2C200]/50 text-[#F2C200] text-[9px] font-jetbrains">
                DENAH KONSEPTUAL
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[10px] text-[#5CE1FF] hover:text-[#F2C200] border border-[#E9F2E3]/25 px-1.5 py-0.5 cursor-pointer uppercase"
            >
              {isCollapsed ? '[BUKA]' : '[TUTUP]'}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-3">
            <div className="text-[10px] leading-snug text-[#cbd5e1] bg-[#0b1017] border border-[#1e2736] px-2 py-1">
              Catatan: Penempatan lantai tertentu (Server/Perpus LT 2, Robotik LT 3, 3 Kelas, KM/lantai) bersumber dari pemilik proyek; sisanya konseptual.
            </div>

            {/* Status Waktu dan Fase */}
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#06080c] border border-[#18202c]">
              <div>
                <div className="text-[10px] text-[#69798e] uppercase">WAKTU AKTIF</div>
                <div className="text-sm font-semibold text-[#e1eaf5] tracking-widest">
                  {formattedTime}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#69798e] uppercase">SUMBER</div>
                <div
                  className={`text-xs font-semibold ${
                    timeSource === 'system' ? 'text-[#5CE1FF]' : 'text-[#F2C200]'
                  }`}
                >
                  {timeSource === 'system' ? 'JAM SISTEM' : 'MANUAL'}
                </div>
              </div>

              <div className="col-span-2 pt-1 border-t border-[#141b24]">
                <div className="text-[10px] text-[#69798e] uppercase">STATUS FASE</div>
                <div className="flex items-center justify-between text-xs mt-0.5">
                  <span className="font-semibold text-[#f0f4f8] uppercase">{activePhase}</span>
                  <span className="text-[11px] text-[#8fa1b8]">{transitionDescription}</span>
                </div>
              </div>

              {isTransitioning && (
                <div className="col-span-2 pt-1">
                  <div className="w-full bg-[#18202c] h-1.5 overflow-hidden">
                    <div
                      className="bg-[#5CE1FF] h-full transition-all duration-150"
                      style={{ width: `${Math.round(blendFactor * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#69798e] mt-0.5">
                    <span>{activePhase}</span>
                    <span>{nextPhase}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Slider Jam 00:00 - 24:00 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="time-slider" className="text-[10px] text-[#8fa1b8] uppercase">
                  Geser Jam (00:00 - 24:00)
                </label>
                <span className="text-[10px] text-[#5CE1FF]">
                  {currentHour.toFixed(2)}h
                </span>
              </div>
              <input
                id="time-slider"
                type="range"
                min="0"
                max="24"
                step="0.05"
                value={currentHour}
                onChange={handleSliderChange}
                className="w-full h-1 bg-[#18202c] accent-[#F2C200] cursor-pointer"
              />
            </div>

            {/* Tombol Preset Cepat */}
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setManualHour(7.0)}
                className="py-1 text-[10px] bg-[#101620] hover:bg-[#18212e] text-[#b3c3d4] border border-[#1e2736] text-center cursor-pointer"
              >
                07:00 Pagi
              </button>
              <button
                type="button"
                onClick={() => setManualHour(12.5)}
                className="py-1 text-[10px] bg-[#101620] hover:bg-[#18212e] text-[#b3c3d4] border border-[#1e2736] text-center cursor-pointer"
              >
                12:30 Siang
              </button>
              <button
                type="button"
                onClick={() => setManualHour(17.0)}
                className="py-1 text-[10px] bg-[#101620] hover:bg-[#18212e] text-[#b3c3d4] border border-[#1e2736] text-center cursor-pointer"
              >
                17:00 Sore
              </button>
              <button
                type="button"
                onClick={() => setManualHour(22.0)}
                className="py-1 text-[10px] bg-[#101620] hover:bg-[#18212e] text-[#b3c3d4] border border-[#1e2736] text-center cursor-pointer"
              >
                22:00 Malam
              </button>
            </div>

            {/* Tombol Kembali ke Jam Sistem */}
            <button
              type="button"
              onClick={useSystemTime}
              className={`w-full py-1.5 text-center text-xs tracking-wider border cursor-pointer uppercase transition-colors ${
                timeSource === 'system'
                  ? 'border-[#234236] bg-[#0c1f18] text-[#5CE1FF]'
                  : 'border-[#3a495b] bg-[#131b26] text-[#e1eaf5] hover:bg-[#1d293a]'
              }`}
            >
              Gunakan jam sistem
            </button>

            {/* Pengaturan Aksesibilitas Gerakan */}
            <div className="pt-2 border-t border-[#18202c] flex items-center justify-between text-[10px] text-[#7a8c9f]">
              <span>REDUCED MOTION</span>
              <button
                type="button"
                onClick={() => setPrefersReducedMotion(!prefersReducedMotion)}
                className={`px-1.5 py-0.5 border cursor-pointer ${
                  prefersReducedMotion
                    ? 'border-[#5CE1FF] text-[#5CE1FF] bg-[#081f22]'
                    : 'border-[#263140] text-[#7a8c9f] bg-[#0d121a]'
                }`}
              >
                {prefersReducedMotion ? 'AKTIF (NO FLICKER)' : 'NONAKTIF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
