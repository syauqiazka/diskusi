import { Suspense } from "react";
import Link from "next/link";
import {
  Compass,
  Monitor,
  BookOpen,
  Users,
  MessageSquare,
  Music,
  Building2,
  Home,
  ArrowRight,
  GraduationCap,
  LogIn,
  UserPlus,
} from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { HudHeader } from "@/components/layout/hud-header";
import { HudFooter } from "@/components/layout/hud-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function HeroAuthSection() {
  const session = await getServerSession();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={session ? "ok" : "caution"}>
          {session ? "STATUS: TERAUTENTIKASI" : "STATUS: BUTUH LOGIN"}
        </Badge>
        <Badge variant="outline">SMK TI BAZMA</Badge>
        <Badge variant="cyan">PROGRAM KEAHLIAN: SIJA</Badge>
      </div>

      {/* Tombol Aksi Berdasarkan Status Autentikasi */}
      {session ? (
        <div className="space-y-4 pt-2">
          <div className="p-3 border border-ok/40 bg-ok/10 text-ok font-mono text-xs flex items-center justify-between">
            <span>
              Selamat datang, <strong className="text-fluor">{session.user.name}</strong> ({session.user.email})
            </span>
            <span className="text-ok font-bold uppercase tracking-wider">[AKUN AKTIF]</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Kartu 1: Mode Cepat (2D) */}
            <div className="border-2 border-fluor/40 p-5 bg-night hover:border-fluor transition-colors flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-fluor">
                  <GraduationCap className="w-6 h-6 text-fluor" />
                  <h2 className="font-sign text-2xl uppercase tracking-wider">MODE CEPAT (2D)</h2>
                </div>
                <p className="font-body text-xs text-fluor/70 leading-relaxed">
                  Akses ruang kelas, forum diskusi, mading global, perpustakaan, dan perpesanan secara langsung tanpa beban rendering 3D.
                </p>
              </div>
              <Link href="/kelas">
                <Button variant="default" size="lg" className="w-full space-x-2">
                  <span className="font-hud text-base tracking-wider">[ENTER] BUKA MODE 2D</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Kartu 2: Jelajah Kawasan (3D) */}
            <div className="border-2 border-caution/60 p-5 bg-night hover:border-caution transition-colors flex flex-col justify-between space-y-4 shadow-[0_0_20px_rgba(242,194,0,0.15)]">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-caution">
                  <Compass className="w-6 h-6 text-caution" />
                  <h2 className="font-sign text-2xl uppercase tracking-wider text-caution">DUNIA JELAJAH (3D)</h2>
                </div>
                <p className="font-body text-xs text-fluor/70 leading-relaxed">
                  Jelajahi kawasan kampus first-person secara penuh: Gerbang, Turunan, Loby Asrama, Lapangan Olahraga, Gedung Sekolah 3 Lantai, dan Interior Kelas.
                </p>
              </div>
              <Link href="/dunia">
                <Button variant="default" size="lg" className="w-full bg-caution text-night hover:bg-caution/90 border-caution space-x-2">
                  <span className="font-hud text-base tracking-wider">[E] JELAJAHI DUNIA 3D</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="p-3 border border-caution/50 bg-caution/10 text-caution font-mono text-xs">
            {"[!]"} Anda harus masuk dengan akun SMK TI BAZMA terlebih dahulu untuk mengakses Mode 2D maupun Jelajah 3D.
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/masuk">
              <Button variant="default" size="lg" className="space-x-2">
                <LogIn className="w-4 h-4" />
                <span className="font-hud text-lg tracking-wider">MASUK DENGAN AKUN</span>
              </Button>
            </Link>
            <Link href="/daftar">
              <Button variant="outline" size="lg" className="space-x-2">
                <UserPlus className="w-4 h-4" />
                <span className="font-hud text-lg tracking-wider">DAFTAR SISWA BARU</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-night text-fluor">
      <HudHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* HERO SECTION / PORTAL */}
        <section className="border border-fluor/30 bg-night p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="font-hud text-9xl tracking-widest text-fluor">02:00</span>
          </div>

          <div className="space-y-6 relative z-10 max-w-3xl">
            <div className="space-y-2">
              <p className="font-hud text-xl sm:text-2xl text-caution tracking-widest uppercase">
                {"//"} KAWASAN PEMBELAJARAN TERPADU
              </p>
              <h1 className="font-sign text-4xl sm:text-6xl text-fluor tracking-wide uppercase leading-tight">
                SEKOLAH TENGAH MALAM
              </h1>
              <p className="font-body text-base sm:text-lg text-fluor/80 leading-relaxed pt-2">
                Platform forum diskusi, materi belajar, dan ruang interaksi digital SMK TI BAZMA.
                Pilih antara Mode Cepat (2D) untuk navigasi ringan dan efisien, atau Jelajah Kawasan (3D) untuk pengalaman first-person retro-liminal.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="font-mono text-xs text-caution p-4 border border-fluor/20 bg-night">
                  MEMERIKSA SESI PENGGUNA...
                </div>
              }
            >
              <HeroAuthSection />
            </Suspense>
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
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Ruang Robotik & Ruang Kelas]</span>
                </div>
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-caution">LT 2</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Perpustakaan, Server, & Ruang Kelas]</span>
                </div>
                <div className="p-2 border border-fluor/15 flex items-center justify-between">
                  <span className="font-semibold text-caution">LT 1</span>
                  <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Lab Komputer, Rapat, Konsultansi, Musik]</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: ENAM FASILITAS SEKOLAH (Refs: BUILDING-FACILITIES) */}
        <section className="space-y-6">
          <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-sign text-2xl sm:text-3xl uppercase tracking-wide text-fluor">
                ENAM FASILITAS TERDOKUMENTASI
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/60">
                Daftar fasilitas fisik resmi sekolah (lokasi lantai bersifat [DESAIN KONSEPTUAL]).
              </p>
            </div>
            <span className="font-mono text-xs text-neon-cyan border border-neon-cyan/40 px-2 py-1 hidden sm:inline-block">
              REFS RESMI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-fluor/25 p-5 bg-night space-y-3">
              <div className="flex items-center space-x-2 text-fluor">
                <Monitor className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-sign text-lg uppercase tracking-wide">LAB KOMPUTER</h3>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Fasilitas praktik kejuruan SIJA dengan perangkat komputer dan instalasi jaringan.
              </p>
            </div>

            <div className="border border-fluor/25 p-5 bg-night space-y-3">
              <div className="flex items-center space-x-2 text-fluor">
                <Users className="w-5 h-5 text-caution" />
                <h3 className="font-sign text-lg uppercase tracking-wide">RUANG RAPAT</h3>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Ruang pertemuan koordinasi pengajar, asisten, dan pembahasan kegiatan sekolah.
              </p>
            </div>

            <div className="border border-fluor/25 p-5 bg-night space-y-3">
              <div className="flex items-center space-x-2 text-fluor">
                <MessageSquare className="w-5 h-5 text-ok" />
                <h3 className="font-sign text-lg uppercase tracking-wide">RUANG KONSULTANSI</h3>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Area konsultasi bimbingan, arahan pembelajaran, dan pendampingan siswa.
              </p>
            </div>

            <div className="border border-fluor/25 p-5 bg-night space-y-3">
              <div className="flex items-center space-x-2 text-fluor">
                <GraduationCap className="w-5 h-5 text-caution" />
                <h3 className="font-sign text-lg uppercase tracking-wide">RUANG KELAS</h3>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Ruang belajar teori dan interaksi 26 meja siswa per kelas dengan papan tulis.
              </p>
            </div>

            <div className="border border-fluor/25 p-5 bg-night space-y-3">
              <div className="flex items-center space-x-2 text-fluor">
                <BookOpen className="w-5 h-5 text-fluor" />
                <h3 className="font-sign text-lg uppercase tracking-wide">PERPUSTAKAAN</h3>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Arsip buku, repositori modul pembelajaran terbuka, dan area membaca tenang.
              </p>
            </div>

            <div className="border border-fluor/25 p-5 bg-night space-y-3">
              <div className="flex items-center space-x-2 text-fluor">
                <Music className="w-5 h-5 text-neon-pink" />
                <h3 className="font-sign text-lg uppercase tracking-wide">RUANG MUSIK</h3>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Ruang pengembangan bakat seni, instrumen musik, dan kegiatan ekstrakurikuler.
              </p>
            </div>
          </div>
        </section>
      </main>

      <HudFooter />
    </div>
  );
}
