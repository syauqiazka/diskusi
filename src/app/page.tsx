import Link from "next/link";
import {
  Compass,
  Monitor,
  BookOpen,
  Users,
  MessageSquare,
  Music,
  ShieldCheck,
  Building2,
  Home,
  ArrowRight,
} from "lucide-react";
import { HudHeader } from "@/components/layout/hud-header";
import { HudFooter } from "@/components/layout/hud-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-night text-fluor">
      <HudHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* HERO SECTION: Layar Jeda / Gerbang Masuk */}
        <section className="border border-fluor/30 bg-night p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="font-hud text-9xl tracking-widest text-fluor">02:00</span>
          </div>

          <div className="space-y-6 relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="caution">SISTEM: AKTIF</Badge>
              <Badge variant="outline">MODE CEPAT (2D)</Badge>
              <Badge variant="cyan">PROGRAM KEAHLIAN: SIJA</Badge>
            </div>

            <div className="space-y-2">
              <p className="font-hud text-xl sm:text-2xl text-caution tracking-widest uppercase">
                {"//"} KAWASAN PEMBELAJARAN TERPADU
              </p>
              <h1 className="font-sign text-4xl sm:text-6xl text-fluor tracking-wide uppercase leading-tight">
                SEKOLAH TENGAH MALAM
              </h1>
              <p className="font-body text-base sm:text-lg text-fluor/80 leading-relaxed pt-2">
                Platform forum diskusi, materi belajar, dan ruang interaksi digital SMK TI BAZMA.
                Seluruh fitur dapat diakses penuh melalui Mode Cepat tanpa beban grafis 3D.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/dunia">
                <Button variant="default" size="lg" className="space-x-2">
                  <span className="font-hud text-lg tracking-wider">[E] JELAJAHI DUNIA 3D</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/masuk">
                <Button variant="outline" size="lg">
                  MASUK (MODE CEPAT)
                </Button>
              </Link>
              <Link href="/daftar">
                <Button variant="outline" size="lg">
                  DAFTAR SISWA
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION: TATA LETAK KAWASAN & STRUKTUR LANTAI (Refs: CAMPUS-LAYOUT & FLOOR-STRUCTURE) */}
        <section className="space-y-6">
          <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-sign text-2xl sm:text-3xl uppercase tracking-wide text-fluor">
                TATA LETAK KAWASAN & STRUKTUR LANTAI
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/60">
                Acuan struktur resmi dari SMK-TI-BAZMA-REFERENCE, CAMPUS-LAYOUT, dan FLOOR-STRUCTURE.
              </p>
            </div>
            <span className="font-mono text-xs text-caution border border-caution/40 px-2 py-1 hidden sm:inline-block">
              HIERARKI RESMI
            </span>
          </div>

          {/* Hubungan Spasial Kawasan */}
          <div className="p-4 border border-fluor/20 bg-fluor/[0.02] font-mono text-xs">
            <span className="text-caution font-semibold block sm:inline">ALUR AKSES FISIK: </span>
            <span className="text-fluor/90">
              Gerbang → Turunan → Lobby Asrama → Gedung Asrama → Jalur Penghubung → Gedung Sekolah
            </span>
          </div>

          {/* Grid Dua Gedung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gedung Asrama (5 Lantai) */}
            <div className="border border-fluor/30 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
                <div className="flex items-center space-x-2 text-fluor">
                  <Home className="w-5 h-5 text-neon-cyan" />
                  <h3 className="font-sign text-xl uppercase tracking-wider">GEDUNG ASRAMA</h3>
                </div>
                <Badge variant="cyan">5 LANTAI</Badge>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-caution">LT 3</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Detail ruang belum ditentukan]</span>
                </div>
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-caution">LT 2</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Detail ruang belum ditentukan]</span>
                </div>
                <div className="p-2 border border-neon-cyan/40 bg-neon-cyan/5 flex items-center justify-between">
                  <span className="font-semibold text-neon-cyan">LT 1</span>
                  <span className="text-neon-cyan text-[11px]">Akses Lobby Asrama</span>
                </div>
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-fluor/70">B1</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Detail ruang belum ditentukan]</span>
                </div>
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-fluor/70">B2</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Detail ruang belum ditentukan]</span>
                </div>
              </div>
            </div>

            {/* Gedung Sekolah (3 Lantai) */}
            <div className="border border-fluor/30 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
                <div className="flex items-center space-x-2 text-fluor">
                  <Building2 className="w-5 h-5 text-caution" />
                  <h3 className="font-sign text-xl uppercase tracking-wider">GEDUNG SEKOLAH</h3>
                </div>
                <Badge variant="caution">3 LANTAI</Badge>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-caution">LT 3</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Detail ruang belum ditentukan]</span>
                </div>
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-caution">LT 2</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Detail ruang belum ditentukan]</span>
                </div>
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-caution">LT 1</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Detail ruang belum ditentukan]</span>
                </div>
                <div className="p-2.5 border border-dashed border-fluor/20 text-center text-fluor/40 text-[11px] italic">
                  Catatan: Lantai penempatan fasilitas menunggu denah resmi
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: ENAM FASILITAS RESMI TERDOKUMENTASI (Refs: BUILDING-FACILITIES.md) */}
        <section className="space-y-6">
          <div className="border-b border-fluor/20 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-sign text-2xl sm:text-3xl uppercase tracking-wide text-fluor">
                ENAM FASILITAS RESMI TERDOKUMENTASI
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/60">
                Visual interior merujuk pada foto dokumentasi resmi SMK TI BAZMA.
              </p>
            </div>
            <Badge variant="alert" className="self-start sm:self-auto">
              LANTAI FASILITAS: BELUM DITENTUKAN
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Lab Komputer */}
            <div className="border border-fluor/25 p-5 space-y-3 bg-night hover:border-fluor/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-caution">
                  <Monitor className="w-4 h-4" />
                  <h3 className="font-sign text-lg uppercase tracking-wide">Lab Komputer</h3>
                </div>
                <Badge variant="cyan">SIJA</Badge>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Meja komputer, PC desktop, papan tulis instruktur, dan perangkat praktik jaringan SIJA.
              </p>
              <div className="pt-2 border-t border-fluor/10 font-mono text-[11px] text-fluor/50">
                Lantai: [DESAIN KONSEPTUAL]
              </div>
            </div>

            {/* 2. Ruang Kelas */}
            <div className="border border-fluor/25 p-5 space-y-3 bg-night hover:border-fluor/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-caution">
                  <Users className="w-4 h-4" />
                  <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Kelas</h3>
                </div>
                <Badge variant="outline">KELAS</Badge>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Meja siswa berpenghuni, kursi, papan tulis, jendela pencahayaan besar, dan kipas angin.
              </p>
              <div className="pt-2 border-t border-fluor/10 font-mono text-[11px] text-fluor/50">
                Lantai: [DESAIN KONSEPTUAL]
              </div>
            </div>

            {/* 3. Perpustakaan */}
            <div className="border border-fluor/25 p-5 space-y-3 bg-night hover:border-fluor/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-caution">
                  <BookOpen className="w-4 h-4" />
                  <h3 className="font-sign text-lg uppercase tracking-wide">Perpustakaan</h3>
                </div>
                <Badge variant="ok">GLOBAL</Badge>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Rak literatur terbuka, meja baca komunal, dan repositori materi belajar bersama.
              </p>
              <div className="pt-2 border-t border-fluor/10 font-mono text-[11px] text-fluor/50">
                Lantai: [DESAIN KONSEPTUAL]
              </div>
            </div>

            {/* 4. Ruang Rapat */}
            <div className="border border-fluor/25 p-5 space-y-3 bg-night hover:border-fluor/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-caution">
                  <Compass className="w-4 h-4" />
                  <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Rapat</h3>
                </div>
                <Badge variant="outline">RAPAT</Badge>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Meja rapat memanjang, kursi rapat ergonomis, dan panel partisi kaca.
              </p>
              <div className="pt-2 border-t border-fluor/10 font-mono text-[11px] text-fluor/50">
                Lantai: [DESAIN KONSEPTUAL]
              </div>
            </div>

            {/* 5. Ruang Konsultansi */}
            <div className="border border-fluor/25 p-5 space-y-3 bg-night hover:border-fluor/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-caution">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Konsultansi</h3>
                </div>
                <Badge variant="outline">BK / KONSUL</Badge>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Meja konsultasi dua arah, kursi wawancara, lemari arsip, dan poster edukasi siswa.
              </p>
              <div className="pt-2 border-t border-fluor/10 font-mono text-[11px] text-fluor/50">
                Lantai: [DESAIN KONSEPTUAL]
              </div>
            </div>

            {/* 6. Ruang Musik */}
            <div className="border border-fluor/25 p-5 space-y-3 bg-night hover:border-fluor/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-caution">
                  <Music className="w-4 h-4" />
                  <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Musik</h3>
                </div>
                <Badge variant="pink">SENI</Badge>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Instrumen gitar, cajon akustik, wadah alat musik, dan area latihan kreativitas.
              </p>
              <div className="pt-2 border-t border-fluor/10 font-mono text-[11px] text-fluor/50">
                Lantai: [DESAIN KONSEPTUAL]
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: PRINSIP PLATFORM & KEAMANAN DM (WORLD.md & DESIGN.md) */}
        <section className="border border-fluor/20 p-6 bg-night space-y-4">
          <div className="flex items-center space-x-2 text-caution">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-sign text-xl uppercase tracking-wider">
              ATURAN PRIVASI & INTEGRITAS PLATFORM
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-fluor/80 leading-relaxed">
            <div className="p-3 border border-fluor/15">
              <span className="text-caution font-semibold block mb-1">ATURAN PESAN PRIBADI (DM):</span>
              DM hanya dapat dimulai antar sesama anggota kelas yang sama. Pemeriksaan keanggotaan
              ditegakkan secara ketat pada transaksi server.
            </div>
            <div className="p-3 border border-fluor/15">
              <span className="text-neon-cyan font-semibold block mb-1">MODE CEPAT (2D):</span>
              Seluruh diskusi kelas, materi pembelajaran, dan profil pengguna dapat diakses tanpa
              memerlukan dukungan 3D WebGL atau perangkat grafis tinggi.
            </div>
          </div>
        </section>
      </main>

      <HudFooter />
    </div>
  );
}
