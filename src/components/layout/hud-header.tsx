import Link from "next/link";
import { HudAuthButtons } from "@/components/layout/hud-auth-buttons";

export function HudHeader() {
  return (
    <header className="border-b border-fluor/20 bg-night/95 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Sisi Kiri: Status HUD VCR */}
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-fluor hover:text-caution transition-colors group"
          >
            {/* Indikator PLAY via SVG */}
            <span className="flex items-center space-x-1.5 font-hud text-xl tracking-widest text-caution">
              <span>PLAY</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="inline-block text-caution"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
            <span className="hidden sm:inline font-mono text-xs text-fluor/60 pl-2 border-l border-fluor/20">
              SMK TI BAZMA
            </span>
          </Link>
        </div>

        {/* Tengah: Nama Kawasan / Sistem */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            href="/dunia"
            className="font-hud text-lg tracking-widest text-fluor/80 hover:text-caution transition-colors"
          >
            SEKOLAH TENGAH MALAM [3D]
          </Link>
          <Link
            href="/kelas"
            className="text-neon-cyan hover:bg-neon-cyan/10 font-mono text-xs px-1.5 py-0.5 border border-neon-cyan/40 transition-colors"
          >
            MODE CEPAT (2D)
          </Link>
        </div>

        {/* Sisi Kanan: Status Autentikasi Pengguna & Aksi */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <HudAuthButtons />
        </div>
      </div>
    </header>
  );
}
