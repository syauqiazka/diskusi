"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Compass, Sparkles, LayoutGrid } from "lucide-react";
import { HudAuthButtons } from "@/components/layout/hud-auth-buttons";

export function HudHeader() {
  const pathname = usePathname();
  const is3D = pathname?.startsWith("/dunia") ?? false;

  return (
    <header className="border-b-2 border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Sisi Kiri: Brand Sekolah Bersahabat */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-text hover:text-accent transition-colors group"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-base sm:text-xl font-bold tracking-wide text-text group-hover:text-accent block leading-none">
                SMK TI BAZMA
              </span>
              <span className="font-body text-[10px] sm:text-[11px] text-text-muted flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sekolah Virtual 3D</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Tengah: Mode Switcher (Hanya 2D & 3D, tanpa link kelas/perpus/mading yang dobel) */}
        <div className="flex items-center p-1 bg-canvas/80 border-2 border-border rounded-2xl shadow-2xs">
          <Link
            href="/kelas"
            className={`inline-flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-display text-xs font-bold transition-all ${
              !is3D
                ? "bg-surface text-text shadow-xs border border-border"
                : "text-text-muted hover:text-text"
            }`}
            title="Beralih ke antarmuka Mode Cepat (2D)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-accent" />
            <span>Mode 2D</span>
          </Link>

          <Link
            href="/dunia"
            className={`inline-flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-display text-xs font-bold transition-all ${
              is3D
                ? "bg-primary text-emerald-950 shadow-xs border border-emerald-400"
                : "text-text-muted hover:text-text"
            }`}
            title="Masuk ke Dunia Kampus 3D"
          >
            <Compass className={`w-3.5 h-3.5 text-emerald-600 ${is3D ? "animate-spin-slow" : ""}`} />
            <span>Dunia 3D</span>
          </Link>
        </div>

        {/* Sisi Kanan: Status Akun */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <HudAuthButtons />
        </div>
      </div>
    </header>
  );
}
