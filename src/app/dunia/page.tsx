"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic import dengan SSR false untuk Canvas WebGL Three.js
const WorldContainer = dynamic(
  () => import("@/components/world/world-container").then((mod) => mod.WorldContainer),
  {
    ssr: false,
    loading: () => <WorldLoadingScreen />,
  }
);

function WorldLoadingScreen() {
  const loadingTexts = [
    "Mempersiapkan kawasan sekolah bernuansa anime...",
    "Menyusun meja dan kursi kelas...",
    "Menghangatkan pencahayaan fajar sekolah...",
    "Menyiapkan rak perpustakaan dan buku...",
    "Membuka pintu lorong utama sekolah...",
  ];

  const [textIndex, setTextIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  return (
    <div className="w-screen h-screen bg-canvas flex flex-col items-center justify-center space-y-5 p-6 select-none font-body">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-sm">
          <Loader2 className="w-8 h-8 text-text animate-spin" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-accent" />
        </span>
      </div>

      <div className="space-y-2 text-center">
        <div className="text-text font-display font-bold text-2xl sm:text-3xl tracking-tight">
          Memuat Kawasan Sekolah 3D
        </div>
        <div className="font-body text-xs text-text-muted">
          {loadingTexts[textIndex]}
        </div>
      </div>

      <div className="border-2 border-border px-4 py-1.5 rounded-full bg-surface text-text-muted font-display text-xs shadow-xs">
        Klik kanvas layar untuk mengaktifkan kendali gerak first-person
      </div>
    </div>
  );
}

export default function DuniaPage() {
  return <WorldContainer />;
}
