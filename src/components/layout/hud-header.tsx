import Link from "next/link";
import { GraduationCap, Compass, Sparkles } from "lucide-react";
import { HudAuthButtons } from "@/components/layout/hud-auth-buttons";

export function HudHeader() {
  return (
    <header className="border-b-2 border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Sisi Kiri: Brand Sekolah Bersahabat */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-text hover:text-accent transition-colors group"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-text group-hover:text-accent block leading-none">
                SMK TI BAZMA
              </span>
              <span className="font-body text-[11px] text-text-muted flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sekolah Virtual 3D</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Tengah: Tautan Cepat */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            href="/dunia"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-primary/15 text-emerald-800 hover:bg-primary/25 font-display text-xs font-bold transition-colors"
          >
            <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
            <span>Jelajah Kampus 3D</span>
          </Link>
          <Link
            href="/kelas"
            className="inline-flex items-center px-3.5 py-1.5 rounded-2xl text-text-muted hover:text-text hover:bg-canvas font-body text-xs font-bold transition-colors"
          >
            Ruang Kelas
          </Link>
          <Link
            href="/perpustakaan"
            className="inline-flex items-center px-3.5 py-1.5 rounded-2xl text-text-muted hover:text-text hover:bg-canvas font-body text-xs font-bold transition-colors"
          >
            Perpustakaan
          </Link>
          <Link
            href="/mading"
            className="inline-flex items-center px-3.5 py-1.5 rounded-2xl text-text-muted hover:text-text hover:bg-canvas font-body text-xs font-bold transition-colors"
          >
            Mading
          </Link>
        </div>

        {/* Sisi Kanan: Status Akun */}
        <div className="flex items-center space-x-3">
          <HudAuthButtons />
        </div>
      </div>
    </header>
  );
}
