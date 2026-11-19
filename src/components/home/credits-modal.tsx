"use client";

import * as React from "react";
import { X, Heart, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  if (!isOpen) return null;

  const TECH_STACK = [
    { name: "Next.js 16 (App Router)", role: "Fondasi Full-Stack & SSR", category: "Core" },
    { name: "Three.js & React Three Fiber", role: "Rendering 3D Spasial Kampus", category: "3D Graphics" },
    { name: "@react-three/drei", role: "Pustaka Kontrol & Shading Shader", category: "3D Graphics" },
    { name: "Tailwind CSS & Shadcn/UI", role: "Sistem Desain Fresh Mint & Peach", category: "UI/UX" },
    { name: "Zustand", role: "Manajemen Status Dunia & Pencapaian", category: "State" },
    { name: "GSAP (GreenSock)", role: "Koreografi Animasi Halus & Ringan", category: "Animation" },
    { name: "Better Auth & Zod", role: "Autentikasi Akun & Validasi Skema Server", category: "Backend" },
    { name: "PostgreSQL & Prisma ORM", role: "Basis Data Ruang Kelas, Mading & Chat", category: "Database" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface w-full max-w-lg p-6 sm:p-8 space-y-6 rounded-3xl border-2 border-border shadow-2xl relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-canvas transition-colors"
          aria-label="Tutup Kredit"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="border-b border-border pb-4 space-y-1">
          <div className="flex items-center space-x-2 text-primary">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
            <span className="font-display text-sm uppercase tracking-wider text-pink-600 font-bold">
              Di Balik Layar
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-text">
            Kredit &amp; Catatan Proyek
          </h2>
          <p className="font-body text-xs sm:text-sm text-text-muted">
            Teknologi terbuka dan transparansi arsitektur kampus virtual SMK TI BAZMA.
          </p>
        </div>

        {/* Catatan Transparansi Konseptual */}
        <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
          <div className="flex items-center space-x-2 text-text">
            <Building className="w-4 h-4 text-primary shrink-0" />
            <h4 className="font-display text-sm font-bold text-text">
              Status Representasi Kampus
            </h4>
          </div>
          <p className="font-body text-xs text-text-muted leading-relaxed">
            Dunia virtual ini adalah karya fiksi interaktif yang terinspirasi dari kawasan sekolah
            <strong className="text-text"> SMK TI BAZMA Islamic Boarding School</strong> (Bogor).
            Elevasi tanah, alur gerbang, dan tapak gedung mengacu pada referensi arsitektur, sedangkan
            tata ruang interior dan penempatan fasilitas bernilai <em>desain konseptual terarah</em>, bukan
            denah teknis resmi atau replika nyata 1:1.
          </p>
        </div>

        {/* Daftar Teknologi */}
        <div className="space-y-2 flex-1 overflow-y-auto max-h-48 pr-1">
          <p className="font-display text-xs text-text-muted uppercase tracking-wider font-bold">
            Pustaka &amp; Alat yang Digunakan:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="p-2.5 bg-canvas rounded-xl border border-border space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs text-text font-bold truncate">
                    {tech.name}
                  </span>
                </div>
                <p className="font-body text-[11px] text-text-muted truncate">
                  {tech.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <Badge variant="mint" className="text-xs">
            Lisensi Terbuka &amp; Edukasi
          </Badge>

          <Button variant="default" size="sm" onClick={onClose} className="px-6">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

