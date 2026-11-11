"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  GraduationCap,
  LayoutGrid,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function WorldModals() {
  const router = useRouter();
  const activePanel = useWorldStore((s) => s.activePanel);
  const closePanel = useWorldStore((s) => s.closePanel);

  // Pilihan cermin kosmetik lokal
  const [selectedFrame, setSelectedFrame] = React.useState("frame-caution");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePanel) {
        closePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, closePanel]);

  if (!activePanel) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-night/85 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePanel();
      }}
    >
      <div className="max-w-2xl w-full border-2 border-fluor/40 bg-night p-6 sm:p-8 space-y-6 text-fluor relative shadow-[0_0_30px_rgba(11,13,18,0.95)] max-h-[90vh] overflow-y-auto">
        {/* Tombol Tutup [X] */}
        <button
          onClick={closePanel}
          className="absolute top-4 right-4 text-fluor/60 hover:text-caution p-1 transition-colors"
          aria-label="Tutup Panel"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 1. MODAL PINTU RUANG KELAS SIJA (3.2 & 3.3) */}
        {activePanel === "door" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-caution">
                <GraduationCap className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} AKSES PINTU KELAS
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                RUANG KELAS 10-SIJA
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Pintu masuk ruang kelas Sistem Informatika, Jaringan, dan Aplikasi SMK TI BAZMA.
                Di dalam ruangan terdapat papan tulis, papan diskusi kelas, rak materi, dan meja
                siswa.
              </p>
            </div>

            <div className="border border-fluor/20 p-4 bg-fluor/[0.02] space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-fluor/60">KODE KELAS:</span>
                <span className="text-caution font-bold px-2 py-0.5 border border-caution/40 bg-caution/10">
                  SIJA-10A
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fluor/60">TATA LETAK RUANG:</span>
                <span className="text-neon-cyan font-bold">STANDARD-30 (30 MEJA SISWA)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fluor/60">KEAMANAN DM:</span>
                <span className="text-ok font-bold">TERBATAS SESAMA ANGGOTA SEKELAS</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push("/kelas");
                }}
              >
                <span className="font-hud text-lg tracking-wider">[E] MASUK KE KELAS (MODE CEPAT)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                KEMBALI KE LORONG
              </Button>
            </div>
          </div>
        )}

        {/* 2. MODAL MADING GLOBAL (3.2) */}
        {activePanel === "mading" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-neon-cyan">
                <LayoutGrid className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} MADING SEKOLAH GLOBAL
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                PAPAN PENGUMUMAN & DISKUSI
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Pusat pengumuman dan diskusi umum seluruh warga sekolah. Akses topik terhangat,
                tanya jawab jaringan, dan kolaborasi umum.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border border-fluor/20 p-3 bg-night hover:border-fluor/40 transition-colors">
                <div className="flex justify-between text-xs font-mono text-caution mb-1">
                  <span>JARINGAN & SERVER</span>
                  <span>1 jam yang lalu</span>
                </div>
                <h4 className="font-sign text-base uppercase text-fluor">
                  Konfigurasi BGP Routing Multi-Homing untuk Praktik Lab Komputer
                </h4>
                <p className="font-body text-xs text-fluor/60 mt-1 line-clamp-1">
                  Prefix list dan local preference gateway di MikroTik CHR.
                </p>
              </div>

              <div className="border border-fluor/20 p-3 bg-night hover:border-fluor/40 transition-colors">
                <div className="flex justify-between text-xs font-mono text-neon-cyan mb-1">
                  <span>VIRTUALISASI</span>
                  <span>3 jam yang lalu</span>
                </div>
                <h4 className="font-sign text-base uppercase text-fluor">
                  Rekomendasi Lingkungan Docker Container untuk Simulasi Router
                </h4>
                <p className="font-body text-xs text-fluor/60 mt-1 line-clamp-1">
                  Efisiensi container vs Proxmox VE pada server lab SIJA.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push("/mading");
                }}
              >
                <span className="font-hud text-lg tracking-wider">BUKA MADING PENUH</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                TUTUP PAPAN
              </Button>
            </div>
          </div>
        )}

        {/* 3. MODAL PERPUSTAKAAN TERBUKA (3.2) */}
        {activePanel === "library" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-ok">
                <BookOpen className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} PERPUSTAKAAN DIGITAL
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                SUMBER BELAJAR TERBUKA
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Koleksi modul ajar, panduan praktikum lab komputer, dan materi keahlian SIJA yang
                dapat diunduh secara bebas oleh seluruh siswa.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 border border-fluor/20 flex items-center justify-between">
                <div>
                  <div className="text-fluor font-semibold">Panduan MikroTik MTCNA — SIJA BAZMA</div>
                  <div className="text-fluor/50 text-[11px]">Format: PDF (8.5 MB) // Jaringan & Server</div>
                </div>
                <Badge variant="ok">TERSEDIA</Badge>
              </div>
              <div className="p-3 border border-fluor/20 flex items-center justify-between">
                <div>
                  <div className="text-fluor font-semibold">Modul Praktikum Administrasi Linux Debian 12</div>
                  <div className="text-fluor/50 text-[11px]">Format: PDF (5.2 MB) // Sistem Operasi</div>
                </div>
                <Badge variant="ok">TERSEDIA</Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push("/perpustakaan");
                }}
              >
                <span className="font-hud text-lg tracking-wider">BUKA KATALOG PERPUSTAKAAN</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                KEMBALI KE LORONG
              </Button>
            </div>
          </div>
        )}

        {/* 4. MODAL LOKER SISWA (3.2) */}
        {activePanel === "locker" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-caution">
                <User className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} LOKER PRIBADI
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                LOKER SISWA #101
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Penyimpanan identitas dan inventaris virtual. Sesuaikan profil Anda dan kelola
                preferensi tampilan kawasan sekolah.
              </p>
            </div>

            <div className="border border-fluor/20 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-night border-2 border-caution flex items-center justify-center">
                  <User className="w-6 h-6 text-fluor/80" />
                </div>
                <div>
                  <div className="font-sign text-lg text-fluor uppercase">SISWA SMK TI BAZMA</div>
                  <div className="text-fluor/60">PROGRAM: SIJA // MEJA #1</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push("/profil");
                }}
              >
                <span className="font-hud text-lg tracking-wider">KELOLA PROFIL & LOKER LENGKAP</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                KUNCI LOKER & KEMBALI
              </Button>
            </div>
          </div>
        )}

        {/* 5. MODAL CERMIN KOSMETIK (3.2) */}
        {activePanel === "mirror" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-neon-pink">
                <Sparkles className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} CERMIN KOSMETIK
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                BINGKAI AVATAR DARI KATALOG
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Katalog resmi kosmetik visual: pilih bingkai avatar yang tampil di kartu meja siswa
                dan cermin lorong.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {[
                { id: "frame-none", name: "Standar", border: "border-fluor/30" },
                { id: "frame-caution", name: "Neon Caution", border: "border-caution shadow-[0_0_8px_rgba(242,194,0,0.5)]" },
                { id: "frame-cyan", name: "Cyan Circuit", border: "border-neon-cyan shadow-[0_0_8px_rgba(92,225,255,0.5)]" },
                { id: "frame-vcr", name: "Retro VCR", border: "border-fluor border-double border-4" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFrame(f.id)}
                  className={`p-3 border text-left transition-colors flex items-center justify-between ${
                    selectedFrame === f.id
                      ? "border-caution bg-caution/10"
                      : "border-fluor/20 bg-night hover:border-fluor/40"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 border ${f.border} flex items-center justify-center bg-night`}>
                      <User className="w-3.5 h-3.5 text-fluor/70" />
                    </div>
                    <span className="font-semibold text-fluor">{f.name}</span>
                  </div>
                  {selectedFrame === f.id && <CheckCircle2 className="w-4 h-4 text-caution" />}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                }}
              >
                <span className="font-hud text-lg tracking-wider">PASANG BINGKAI & LANJUT JELAJAH</span>
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                TUTUP CERMIN
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
