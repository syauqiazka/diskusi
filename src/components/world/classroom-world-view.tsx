"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ClassroomDetail } from "@/lib/classroom/types";

// Dynamic import dengan SSR false di dalam Client Component
const ClassroomContainer = dynamic(
  () => import("@/components/world/classroom-container").then((mod) => mod.ClassroomContainer),
  {
    ssr: false,
    loading: () => <ClassroomLoadingScreen />,
  }
);

function ClassroomLoadingScreen() {
  const loadingTexts = [
    "Menyusun 30 meja siswa...",
    "Menyalakan lampu meja anggota kelas...",
    "Memeriksa agenda papan tulis...",
    "Menyiapkan papan diskusi kelas...",
    "Mengatur repositori rak materi...",
  ];

  const [textIndex, setTextIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  return (
    <div className="w-full h-[85vh] bg-night border border-fluor/30 flex flex-col items-center justify-center space-y-4 p-6 select-none font-hud">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-caution animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-fluor">
          3D
        </span>
      </div>

      <div className="space-y-1 text-center">
        <div className="text-caution text-2xl sm:text-3xl tracking-widest uppercase">
          MEMASUKI RUANG KELAS VIRTUAL
        </div>
        <div className="font-mono text-xs text-fluor/70 tracking-wider">
          {loadingTexts[textIndex]}
        </div>
      </div>

      <div className="border border-fluor/20 px-3 py-1 bg-night text-fluor/50 font-mono text-[11px] uppercase">
        KLIK KANVAS UNTUK MENGUNCI POINTER DAN BERJALAN DI DALAM KELAS
      </div>
    </div>
  );
}

interface ClassroomWorldViewProps {
  classroom: ClassroomDetail;
  currentUserId: string;
}

export function ClassroomWorldView({ classroom, currentUserId }: ClassroomWorldViewProps) {
  return <ClassroomContainer classroom={classroom} currentUserId={currentUserId} />;
}
