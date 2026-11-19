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
    <div className="w-full h-[85vh] bg-canvas border-2 border-border/70 rounded-3xl flex flex-col items-center justify-center space-y-4 p-6 select-none font-body shadow-sm">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[10px] text-primary">
          3D
        </span>
      </div>

      <div className="space-y-1 text-center">
        <div className="font-display font-bold text-text text-xl sm:text-2xl tracking-wide">
          Memasuki Ruang Kelas Virtual
        </div>
        <div className="font-body text-sm text-text-muted">
          {loadingTexts[textIndex]}
        </div>
      </div>

      <div className="px-4 py-1.5 rounded-full bg-surface border border-border text-text-muted font-body text-xs shadow-sm">
        Klik kanvas untuk mengaktifkan kendali dan mulai berkeliling
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

