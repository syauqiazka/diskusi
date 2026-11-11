"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Zap, Hand, Pause } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";

export function TouchControls() {
  const isCrouching = useWorldStore((s) => s.isCrouching);
  const isRunning = useWorldStore((s) => s.isRunning);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);
  const activePanel = useWorldStore((s) => s.activePanel);

  const setCrouching = useWorldStore((s) => s.setCrouching);
  const setRunning = useWorldStore((s) => s.setRunning);
  const togglePause = useWorldStore((s) => s.togglePause);
  const openPanel = useWorldStore((s) => s.openPanel);

  if (activePanel) return null;

  const simulateKey = (code: string, isDown: boolean) => {
    window.dispatchEvent(
      new KeyboardEvent(isDown ? "keydown" : "keyup", {
        code,
        bubbles: true,
      })
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex flex-col justify-end p-4 md:hidden">
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* D-Pad Virtual (Kiri Bawah) */}
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36 bg-night/80 border border-fluor/30 p-2">
          <div />
          <button
            aria-label="Maju"
            className="flex items-center justify-center bg-night border border-fluor/40 active:bg-caution active:text-night text-fluor h-10"
            onTouchStart={() => simulateKey("KeyW", true)}
            onTouchEnd={() => simulateKey("KeyW", false)}
            onMouseDown={() => simulateKey("KeyW", true)}
            onMouseUp={() => simulateKey("KeyW", false)}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            aria-label="Kiri"
            className="flex items-center justify-center bg-night border border-fluor/40 active:bg-caution active:text-night text-fluor h-10"
            onTouchStart={() => simulateKey("KeyA", true)}
            onTouchEnd={() => simulateKey("KeyA", false)}
            onMouseDown={() => simulateKey("KeyA", true)}
            onMouseUp={() => simulateKey("KeyA", false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center font-hud text-xs text-caution">
            WASD
          </div>
          <button
            aria-label="Kanan"
            className="flex items-center justify-center bg-night border border-fluor/40 active:bg-caution active:text-night text-fluor h-10"
            onTouchStart={() => simulateKey("KeyD", true)}
            onTouchEnd={() => simulateKey("KeyD", false)}
            onMouseDown={() => simulateKey("KeyD", true)}
            onMouseUp={() => simulateKey("KeyD", false)}
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            aria-label="Mundur"
            className="flex items-center justify-center bg-night border border-fluor/40 active:bg-caution active:text-night text-fluor h-10"
            onTouchStart={() => simulateKey("KeyS", true)}
            onTouchEnd={() => simulateKey("KeyS", false)}
            onMouseDown={() => simulateKey("KeyS", true)}
            onMouseUp={() => simulateKey("KeyS", false)}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Tombol Aksi Sentuh (Kanan Bawah) */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            {/* Tombol Jeda */}
            <button
              onClick={togglePause}
              className="w-12 h-12 bg-night border border-fluor/40 text-fluor flex items-center justify-center active:bg-caution active:text-night"
              title="Jeda"
            >
              <Pause className="w-5 h-5" />
            </button>

            {/* Tombol Lari */}
            <button
              onClick={() => setRunning(!isRunning)}
              className={`w-12 h-12 border flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                isRunning
                  ? "bg-caution text-night border-caution"
                  : "bg-night text-fluor border-fluor/40 active:bg-caution active:text-night"
              }`}
              title="Lari"
            >
              <Zap className="w-5 h-5" />
            </button>

            {/* Tombol Jongkok */}
            <button
              onClick={() => setCrouching(!isCrouching)}
              className={`w-12 h-12 border flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                isCrouching
                  ? "bg-neon-cyan text-night border-neon-cyan"
                  : "bg-night text-fluor border-fluor/40 active:bg-neon-cyan active:text-night"
              }`}
              title="Jongkok"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>

          {/* Tombol Interaksi E (Berwarna Caution saat ada objek terdeteksi) */}
          <button
            disabled={!activeInteractable}
            onClick={() => {
              if (activeInteractable) {
                openPanel(activeInteractable.type);
              }
            }}
            className={`w-28 h-12 border flex items-center justify-center space-x-1.5 font-hud text-lg tracking-wider transition-all ${
              activeInteractable
                ? "bg-caution text-night border-caution animate-pulse shadow-[0_0_12px_rgba(242,194,0,0.6)]"
                : "bg-night/50 text-fluor/30 border-fluor/20 cursor-not-allowed"
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>[E] AKSI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
