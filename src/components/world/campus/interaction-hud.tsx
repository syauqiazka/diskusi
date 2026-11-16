"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock } from 'lucide-react';
import { useWorldStore } from '@/stores/use-world-store';

export function InteractionHud() {
  const cameraMode = useWorldStore((s) => s.cameraMode);
  const isPaused = useWorldStore((s) => s.isPaused);
  const isPointerLocked = useWorldStore((s) => s.isPointerLocked);
  const activePanel = useWorldStore((s) => s.activePanel);
  const hoveredInteractable = useWorldStore((s) => s.hoveredInteractable);
  const isCrouching = useWorldStore((s) => s.isCrouching);

  if (cameraMode !== 'fps') {
    return null;
  }

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
    </>
  );
}
