"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Zap, Hand, Pause, Laptop } from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";

export function TouchControls() {
  const isCrouching = useWorldStore((s) => s.isCrouching);
  const isRunning = useWorldStore((s) => s.isRunning);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);
  const activePanel = useWorldStore((s) => s.activePanel);
  const [showNotice, setShowNotice] = React.useState(true);

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
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-4 md:hidden">
      {/* Pesan Ramah Pengguna Sentuh (Mobile Banner) */}
      {showNotice && (
        <div className="pointer-events-auto bg-surface/95 border-2 border-border p-3.5 rounded-2xl shadow-lg backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary/30 flex items-center justify-center text-text shrink-0">
              <Laptop className="w-4 h-4" />
            </div>
            <p className="font-body text-xs text-text leading-tight">
              Dunia 3D dioptimalkan untuk keyboard & mouse di laptop. Gunakan Mode 2D untuk kenyamanan penuh di HP.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/">
              <button className="px-2.5 py-1 rounded-xl bg-primary text-text font-display font-bold text-xs shadow-xs">
                Mode 2D
              </button>
            </Link>
            <button
              onClick={() => setShowNotice(false)}
              className="text-text-muted hover:text-text px-1 text-xs"
              aria-label="Tutup saran"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Kontrol Sentuh Bawah */}
      <div className="flex items-end justify-between w-full pointer-events-auto mt-auto">
        {/* D-Pad Virtual Membulat */}
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36 bg-surface/90 rounded-3xl border-2 border-border p-2 backdrop-blur-md shadow-lg">
          <div />
          <button
            aria-label="Maju"
            className="flex items-center justify-center bg-canvas rounded-xl border border-border active:bg-primary active:text-text text-text h-10 shadow-xs"
            onTouchStart={() => simulateKey("KeyW", true)}
            onTouchEnd={() => simulateKey("KeyW", false)}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            aria-label="Kiri"
            className="flex items-center justify-center bg-canvas rounded-xl border border-border active:bg-primary active:text-text text-text h-10 shadow-xs"
            onTouchStart={() => simulateKey("KeyA", true)}
            onTouchEnd={() => simulateKey("KeyA", false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center font-display font-bold text-[10px] text-text-muted">
            WASD
          </div>
          <button
            aria-label="Kanan"
            className="flex items-center justify-center bg-canvas rounded-xl border border-border active:bg-primary active:text-text text-text h-10 shadow-xs"
            onTouchStart={() => simulateKey("KeyD", true)}
            onTouchEnd={() => simulateKey("KeyD", false)}
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            aria-label="Mundur"
            className="flex items-center justify-center bg-canvas rounded-xl border border-border active:bg-primary active:text-text text-text h-10 shadow-xs"
            onTouchStart={() => simulateKey("KeyS", true)}
            onTouchEnd={() => simulateKey("KeyS", false)}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Tombol Aksi Sentuh Membulat */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            {/* Tombol Jeda */}
            <button
              onClick={togglePause}
              className="w-11 h-11 bg-surface rounded-2xl border-2 border-border text-text flex items-center justify-center active:bg-canvas shadow-sm"
              title="Jeda"
            >
              <Pause className="w-5 h-5" />
            </button>

            {/* Tombol Lari */}
            <button
              onClick={() => setRunning(!isRunning)}
              className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center font-display text-xs font-bold transition-all shadow-sm ${
                isRunning
                  ? "bg-primary text-text border-primary/60"
                  : "bg-surface text-text border-border active:bg-canvas"
              }`}
              title="Lari"
            >
              <Zap className="w-5 h-5" />
            </button>

            {/* Tombol Jongkok */}
            <button
              onClick={() => setCrouching(!isCrouching)}
              className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center font-display text-xs font-bold transition-all shadow-sm ${
                isCrouching
                  ? "bg-secondary text-text border-secondary/60"
                  : "bg-surface text-text border-border active:bg-canvas"
              }`}
              title="Jongkok"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>

          {/* Tombol Interaksi E */}
          <button
            disabled={!activeInteractable}
            onClick={() => {
              if (activeInteractable) {
                openPanel(activeInteractable.type);
              }
            }}
            className={`w-28 h-12 rounded-2xl border-2 flex items-center justify-center space-x-1.5 font-display font-bold text-sm tracking-wide transition-all shadow-sm ${
              activeInteractable
                ? "bg-primary text-text border-primary animate-bounce shadow-md"
                : "bg-surface/50 text-text-muted border-border/50 cursor-not-allowed"
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>[E] Aksi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
