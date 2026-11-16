"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Lock, Pause, Play } from 'lucide-react';
import { useWorldStore } from '@/stores/use-world-store';
import { useTimeOfDayStore } from '@/stores/use-time-of-day-store';

export function InteractionHud() {
  const cameraMode = useWorldStore((s) => s.cameraMode);
  const isPaused = useWorldStore((s) => s.isPaused);
  const isPointerLocked = useWorldStore((s) => s.isPointerLocked);
  const activePanel = useWorldStore((s) => s.activePanel);
  const hoveredInteractable = useWorldStore((s) => s.hoveredInteractable);
  const isCrouching = useWorldStore((s) => s.isCrouching);
  const headBobEnabled = useWorldStore((s) => s.headBobEnabled);
  const setPaused = useWorldStore((s) => s.setPaused);
  const setCrouching = useWorldStore((s) => s.setCrouching);
  const setHeadBobEnabled = useWorldStore((s) => s.setHeadBobEnabled);

  const systemReducedMotion = useTimeOfDayStore((s) => s.prefersReducedMotion);
  const [osReducedMotion, setOsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setOsReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const reducedMotionActive = osReducedMotion || systemReducedMotion;

  if (cameraMode !== 'fps') {
    return null;
  }

  const handleResume = () => {
    setPaused(false);
    const canvas = document.querySelector('canvas');
    canvas?.requestPointerLock?.();
  };

  const showReticle = !isPaused && activePanel === null;
  const targetActive = hoveredInteractable !== null;

  return (
    <>
      {/* Crosshair Kontras Ganda & Prompt Interaksi [E] */}
      {showReticle && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
          {/* Reticle Tengah */}
          <div
            className="relative flex items-center justify-center w-6 h-6"
            aria-hidden="true"
          >
            {/* Lapisan luar gelap agar tetap terlihat di siang terik */}
            <span
              className="absolute w-4 h-[3px] bg-[#0B0D12]"
            />
            <span
              className="absolute h-4 w-[3px] bg-[#0B0D12]"
            />
            {/* Lapisan dalam terang / kuning rambu saat menarget objek */}
            <span
              className={`absolute w-3.5 h-[1.5px] transition-colors duration-150 ${
                targetActive ? 'bg-[#F2C200]' : 'bg-[#E9F2E3]'
              }`}
            />
            <span
              className={`absolute h-3.5 w-[1.5px] transition-colors duration-150 ${
                targetActive ? 'bg-[#F2C200]' : 'bg-[#E9F2E3]'
              }`}
            />
          </div>

          {/* Prompt Interaksi saat objek berada <= 2.5m di depan pemain */}
          {hoveredInteractable && (
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div
                className={`flex items-center gap-2.5 bg-[#0B0D12]/92 border px-3.5 py-2 shadow-lg ${
                  hoveredInteractable.isLocked
                    ? 'border-[#E0412F]'
                    : 'border-[#F2C200]'
                }`}
              >
                <span className="font-vt323 text-lg leading-none px-1.5 py-0.5 bg-[#F2C200] text-[#0B0D12] font-bold">
                  [E / KLIK]
                </span>
                {hoveredInteractable.isLocked && (
                  <Lock className="w-4 h-4 text-[#E0412F] shrink-0" aria-hidden="true" />
                )}
                <span className="font-instrument text-sm font-medium text-[#E9F2E3] whitespace-nowrap">
                  {hoveredInteractable.isLocked
                    ? 'Terkunci — E / Klik Kiri untuk detail'
                    : hoveredInteractable.actionLabel}
                </span>
                <span className="font-jetbrains text-xs text-[#94a3b8] tabular-nums">
                  {hoveredInteractable.distance.toFixed(1)}m
                </span>
              </div>
              <div className="font-jetbrains text-[11px] text-[#E9F2E3]/80 bg-[#0B0D12]/80 px-2 py-0.5">
                {hoveredInteractable.source === 'konseptual'
                  ? 'DESAIN KONSEPTUAL'
                  : 'REFERENSI KAMPUS'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Petunjuk Kontrol FPS Minimalis di Bawah Layar */}
      {!isPaused && activePanel === null && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex flex-col items-end gap-1.5">
          {!isPointerLocked && (
            <div className="bg-[#0B0D12]/92 border border-[#F2C200] px-3.5 py-2 text-[#E9F2E3] shadow">
              <span className="font-vt323 text-lg tracking-wider text-[#F2C200] uppercase">
                KLIK KANVAS UNTUK MULAI &amp; KUNCI KAMERA
              </span>
            </div>
          )}
          <div className="bg-[#0B0D12]/88 border border-[#E9F2E3]/30 px-3 py-1.5 font-jetbrains text-[11px] text-[#E9F2E3]/90 flex flex-wrap items-center gap-2">
            <span>WASD Gerak</span>
            <span aria-hidden="true">·</span>
            <span>Shift Lari</span>
            <span aria-hidden="true">·</span>
            <span>C Jongkok ({isCrouching ? '0.9m' : '1.6m'})</span>
            <span aria-hidden="true">·</span>
            <span>Spasi Lompat</span>
            <span aria-hidden="true">·</span>
            <span>E / Klik Interaksi</span>
            <span aria-hidden="true">·</span>
            <span>Esc Jeda</span>
          </div>
        </div>
      )}

      {/* Layar Jeda Retro-Liminal (Esc) */}
      {isPaused && activePanel === null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D12]/82 p-4"
        >
          <div className="w-full max-w-md bg-[#0B0D12] border border-[#E9F2E3] p-6 text-[#E9F2E3] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E9F2E3]/20 pb-3 mb-5">
              <span className="font-vt323 text-xl tracking-widest text-[#5CE1FF] uppercase flex items-center gap-2">
                <Pause className="w-4 h-4" aria-hidden="true" />
                PAUSE · SP 00:00:00
              </span>
              <span className="border border-[#F2C200]/60 px-2 py-0.5 font-jetbrains text-[10px] text-[#F2C200] uppercase">
                DENAH KONSEPTUAL
              </span>
            </div>

            <h2
              id="pause-title"
              className="font-anton text-3xl tracking-wide text-[#E9F2E3] uppercase mb-2"
            >
              SIMULASI DIJEDA
            </h2>
            <p className="font-instrument text-sm text-[#E9F2E3]/80 leading-relaxed mb-3">
              Kawasan lereng dan Gedung Sekolah konseptual SMK TI BAZMA. Arahkan titik tengah ke objek interaksi dalam jarak 2,5 meter lalu tekan E atau Klik Kiri.
            </p>
            <p className="font-jetbrains text-[11px] text-[#F2C200]/90 bg-[#141a24] border border-[#F2C200]/30 px-2.5 py-1.5 leading-snug mb-5">
              Penempatan lantai tertentu (Ruang Server &amp; Perpustakaan LT 2, Ruang Robotik LT 3, 3 Ruang Kelas × 26 meja, serta Kamar Mandi tiap lantai) bersumber dari pemilik proyek; sisanya konseptual.
            </p>

            {/* Tombol Utama Lanjut */}
            <button
              type="button"
              onClick={handleResume}
              autoFocus
              className="w-full flex items-center justify-center gap-2 bg-[#F2C200] hover:bg-[#ffd426] text-[#0B0D12] font-anton text-xl tracking-wider uppercase py-3 px-5 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5CE1FF]"
            >
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              KLIK UNTUK LANJUT
            </button>

            {/* Sakelar ON/OFF Ringkas */}
            <div className="mt-5 pt-4 border-t border-[#E9F2E3]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-vt323 text-lg tracking-wider uppercase text-[#E9F2E3]">
                    HEAD BOB KAMERA
                  </div>
                  <div className="font-instrument text-xs text-[#E9F2E3]/65">
                    {reducedMotionActive
                      ? 'Dimatikan otomatis oleh prefers-reduced-motion'
                      : 'Ayunan langkah saat berjalan (bawaan mati)'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={reducedMotionActive}
                  onClick={() => setHeadBobEnabled(!headBobEnabled)}
                  className={`font-vt323 text-lg px-3 py-1 border min-w-[68px] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    headBobEnabled && !reducedMotionActive
                      ? 'border-[#F2C200] bg-[#F2C200] text-[#0B0D12]'
                      : 'border-[#E9F2E3]/40 bg-transparent text-[#E9F2E3] hover:border-[#E9F2E3]'
                  }`}
                >
                  {headBobEnabled && !reducedMotionActive ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-vt323 text-lg tracking-wider uppercase text-[#E9F2E3]">
                    POSTUR MATA (C)
                  </div>
                  <div className="font-instrument text-xs text-[#E9F2E3]/65">
                    Tinggi kamera berdiri 1.6m atau jongkok 0.9m
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCrouching(!isCrouching)}
                  className={`font-vt323 text-lg px-3 py-1 border min-w-[96px] cursor-pointer transition-colors ${
                    isCrouching
                      ? 'border-[#5CE1FF] text-[#5CE1FF]'
                      : 'border-[#E9F2E3]/40 text-[#E9F2E3] hover:border-[#E9F2E3]'
                  }`}
                >
                  {isCrouching ? 'JONGKOK' : 'BERDIRI'}
                </button>
              </div>
            </div>

            {/* Daftar Tombol Kontrol */}
            <div className="mt-5 pt-4 border-t border-[#E9F2E3]/20 grid grid-cols-2 gap-y-1.5 gap-x-4 font-jetbrains text-xs text-[#E9F2E3]/80">
              <span>W / A / S / D : Bergerak</span>
              <span>Shift : Lari cepat</span>
              <span>C : Toggle jongkok</span>
              <span>Spasi : Lompat</span>
              <span>E / Klik Kiri : Interaksi</span>
              <span>Mouse : Arah pandang</span>
              <span>Esc : Jeda / Tutup panel</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
