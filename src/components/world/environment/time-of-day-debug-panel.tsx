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
    <div className="fixed bottom-3 left-3 z-50 font-body text-xs select-none">
      <div
        className={`bg-surface/95 text-text border-2 border-border shadow-xl rounded-2xl backdrop-blur-sm ${
          isCollapsed ? 'px-3 py-2 w-auto max-w-[44vw]' : 'p-3.5 w-80'
        }`}
      >
        {/* Header Panel */}
        <div className={`flex items-center justify-between gap-2 ${!isCollapsed ? 'pb-2.5 mb-2.5 border-b border-border' : ''}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary shrink-0 shadow-sm" />
            <span className="font-display font-bold text-sm tracking-wide text-text truncate">
              {isCollapsed ? `${formattedTime} · ${activePhase}` : 'Debug Waktu Kampus'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!isCollapsed && (
              <span className="px-2 py-0.5 rounded-full border border-secondary/60 bg-secondary/15 text-text text-[10px] font-display font-bold">
                Konseptual
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-xs text-primary font-display font-bold hover:text-primary-dark border border-border bg-canvas px-2 py-0.5 rounded-lg cursor-pointer"
            >
              {isCollapsed ? 'Buka' : 'Tutup'}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-3 font-body">
            <div className="text-[11px] leading-snug text-text-muted bg-canvas border border-border/80 rounded-xl px-2.5 py-1.5">
              Catatan: Tata letak bergaya fiksi terinspirasi sekolah, bukan replika gedung nyata.
            </div>

            {/* Status Waktu dan Fase */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-canvas border border-border/70 rounded-xl">
              <div>
                <div className="text-[10px] font-display font-bold text-text-muted uppercase">Waktu Aktif</div>
                <div className="text-base font-display font-bold text-text tracking-wider">
                  {formattedTime}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-display font-bold text-text-muted uppercase">Sumber</div>
                <div
                  className={`text-xs font-display font-bold ${
                    timeSource === 'system' ? 'text-primary' : 'text-secondary-dark'
                  }`}
                >
                  {timeSource === 'system' ? 'Jam Sistem' : 'Manual'}
                </div>
              </div>

              <div className="col-span-2 pt-1.5 border-t border-border/50">
                <div className="text-[10px] font-display font-bold text-text-muted uppercase">Status Fase</div>
                <div className="flex items-center justify-between text-xs mt-0.5">
                  <span className="font-display font-bold text-text uppercase">{activePhase}</span>
                  <span className="text-[11px] text-text-muted">{transitionDescription}</span>
                </div>
              </div>

              {isTransitioning && (
                <div className="col-span-2 pt-1">
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-150"
                      style={{ width: `${Math.round(blendFactor * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted mt-0.5 font-display font-medium">
                    <span>{activePhase}</span>
                    <span>{nextPhase}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Slider Jam 00:00 - 24:00 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="time-slider" className="text-[10px] font-display font-bold text-text-muted uppercase">
                  Geser Jam (00:00 - 24:00)
                </label>
                <span className="text-xs font-display font-bold text-primary">
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
                className="w-full h-1.5 bg-border rounded-lg accent-primary cursor-pointer"
              />
            </div>

            {/* Tombol Preset Cepat */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setManualHour(7.0)}
                className="py-1 text-[11px] font-display font-bold bg-canvas hover:bg-surface text-text border border-border rounded-lg text-center cursor-pointer transition-colors"
              >
                07:00 Pagi
              </button>
              <button
                type="button"
                onClick={() => setManualHour(12.5)}
                className="py-1 text-[11px] font-display font-bold bg-canvas hover:bg-surface text-text border border-border rounded-lg text-center cursor-pointer transition-colors"
              >
                12:30 Siang
              </button>
              <button
                type="button"
                onClick={() => setManualHour(17.0)}
                className="py-1 text-[11px] font-display font-bold bg-canvas hover:bg-surface text-text border border-border rounded-lg text-center cursor-pointer transition-colors"
              >
                17:00 Sore
              </button>
              <button
                type="button"
                onClick={() => setManualHour(22.0)}
                className="py-1 text-[11px] font-display font-bold bg-canvas hover:bg-surface text-text border border-border rounded-lg text-center cursor-pointer transition-colors"
              >
                22:00 Malam
              </button>
            </div>

            {/* Tombol Kembali ke Jam Sistem */}
            <button
              type="button"
              onClick={useSystemTime}
              className={`w-full py-1.5 text-center text-xs font-display font-bold tracking-wide rounded-xl border-2 cursor-pointer transition-colors ${
                timeSource === 'system'
                  ? 'border-primary bg-primary/10 text-primary-dark'
                  : 'border-border bg-surface text-text hover:bg-canvas'
              }`}
            >
              Gunakan Jam Sistem
            </button>

            {/* Pengaturan Aksesibilitas Gerakan */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
              <span className="font-display font-bold">Reduced Motion</span>
              <button
                type="button"
                onClick={() => setPrefersReducedMotion(!prefersReducedMotion)}
                className={`px-2 py-0.5 rounded-lg border text-xs font-display font-bold cursor-pointer transition-colors ${
                  prefersReducedMotion
                    ? 'border-primary text-primary-dark bg-primary/15'
                    : 'border-border text-text-muted bg-canvas'
                }`}
              >
                {prefersReducedMotion ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
