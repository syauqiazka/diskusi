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
      {/* Crosshair Lembut & Prompt Interaksi [E] */}
      {showReticle && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
          {/* Reticle Tengah */}
          <div
            className="relative flex items-center justify-center w-6 h-6"
            aria-hidden="true"
          >
            {/* Titik reticle lembut */}
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all duration-150 shadow-sm ${
                targetActive
                  ? 'bg-primary ring-4 ring-primary/30 scale-125'
                  : 'bg-surface/90 ring-2 ring-text/30'
              }`}
            />
          </div>

          {/* Prompt Interaksi saat objek berada <= 2.5m di depan pemain */}
          {hoveredInteractable && (
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center gap-2.5 bg-surface/95 border-2 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-sm ${
                  hoveredInteractable.isLocked
                    ? 'border-alert/70'
                    : 'border-primary'
                }`}
              >
                <span className="font-display text-xs leading-none px-2 py-1 rounded-lg bg-primary text-surface font-bold tracking-wide">
                  E / KLIK
                </span>
                {hoveredInteractable.isLocked && (
                  <Lock className="w-4 h-4 text-alert shrink-0" aria-hidden="true" />
                )}
                <span className="font-display font-bold text-sm text-text whitespace-nowrap">
                  {hoveredInteractable.isLocked
                    ? 'Terkunci — E / Klik Kiri untuk detail'
                    : hoveredInteractable.actionLabel}
                </span>
                <span className="font-body text-xs text-text-muted tabular-nums">
                  {hoveredInteractable.distance.toFixed(1)}m
                </span>
              </div>
              <div className="font-display font-bold text-[10px] text-text-muted bg-surface/90 border border-border px-3 py-0.5 rounded-full shadow-sm">
                {hoveredInteractable.source === 'konseptual'
                  ? 'Desain Konseptual'
                  : 'Fasilitas Kampus'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Petunjuk Kontrol FPS Minimalis di Bawah Layar */}
      {!isPaused && activePanel === null && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
          {!isPointerLocked && (
            <div className="bg-surface/95 border-2 border-secondary px-4 py-2 rounded-2xl text-text shadow-lg backdrop-blur-sm">
              <span className="font-display font-bold text-xs tracking-wide text-text uppercase">
                Klik kanvas untuk mulai &amp; kunci kamera
              </span>
            </div>
          )}
          <div className="bg-surface/90 border-2 border-border/80 rounded-2xl px-3.5 py-1.5 font-body text-xs text-text-muted flex flex-wrap items-center gap-2 shadow-sm backdrop-blur-sm">
            <span>WASD Gerak</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>Shift Lari</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>C Jongkok ({isCrouching ? '0.9m' : '1.6m'})</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>Spasi Lompat</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>E / Klik Interaksi</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>Esc Jeda</span>
          </div>
        </div>
      )}
    </>
  );
}
