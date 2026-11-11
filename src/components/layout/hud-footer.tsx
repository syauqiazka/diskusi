import { AlertTriangle, Clock } from "lucide-react";

export function HudFooter() {
  return (
    <footer className="border-t border-fluor/20 bg-night text-fluor/70 font-mono text-xs py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Baris Status & Peringatan Retro */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-fluor/10 pb-4">
          <div className="flex items-center space-x-2 text-caution">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-hud text-base tracking-widest uppercase">
              [PERHATIAN] AWAS LANTAI BASAH // JAM 02:00 WIB
            </span>
          </div>
          <div className="flex items-center space-x-3 text-fluor/60">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>SESI SISTEM AKTIF</span>
            </span>
            <span>•</span>
            <span>PREFERS-REDUCED-MOTION: AKTIF</span>
          </div>
        </div>

        {/* Informasi Kawasan & Identitas */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-fluor/50 text-[11px]">
          <div>
            Kawasan Terpadu SMK TI BAZMA • Gedung Sekolah & Gedung Asrama
          </div>
          <div>
            Platform Forum & Diskusi Pembelajaran • Mode Cepat (2D)
          </div>
        </div>
      </div>
    </footer>
  );
}
