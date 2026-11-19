import { GraduationCap, Heart, Sparkles } from "lucide-react";

export function HudFooter() {
  return (
    <footer className="border-t-2 border-border bg-surface text-text-muted font-body text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center space-x-2 text-text">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-display text-sm font-bold tracking-wide">
              SMK TI BAZMA Islamic Boarding School
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-text-muted">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Kawasan Kampus Virtual Interaktif • Program SIJA</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-text-muted text-[11px]">
          <div>
            Karya fiksi kreatif terinspirasi dari lingkungan sekolah • Hak cipta komunitas edukasi
          </div>
          <div className="flex items-center space-x-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
            <span>untuk pengalaman belajar yang menyenangkan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
