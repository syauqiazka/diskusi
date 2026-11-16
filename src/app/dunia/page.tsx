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
    "Menyapu lorong tengah malam...",
    "Menyalakan lampu neon tabung...",
    "Mengecek gembok pintu kelas SIJA...",
    "Memeriksa mading sekolah...",
    "Menyusun rak buku perpustakaan...",
    "Mengunci lemari ruang guru...",
  ];

  const [textIndex, setTextIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  return (
    <div className="w-screen h-screen bg-night flex flex-col items-center justify-center space-y-4 p-6 select-none font-hud">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-caution animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-fluor">
          3D
        </span>
      </div>

      <div className="space-y-1 text-center">
        <div className="text-caution text-3xl sm:text-4xl tracking-widest uppercase">
          MEMUAT KAWASAN SEKOLAH 3D
        </div>
        <div className="font-mono text-xs text-fluor/70 tracking-wider">
          {loadingTexts[textIndex]}
        </div>
      </div>

      <div className="border border-fluor/20 px-3 py-1 bg-night text-fluor/50 font-mono text-[11px] uppercase">
        TEKAN KANVAS UNTUK MEMULAI KONTROL FIRST-PERSON
      </div>
    </div>
  );
}

export default function DuniaPage() {
  return <WorldContainer />;
}
