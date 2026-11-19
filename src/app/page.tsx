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
  Radio,
  UserCheck,
} from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { HudHeader } from "@/components/layout/hud-header";
import { HudFooter } from "@/components/layout/hud-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyClasses } from "@/lib/classroom/actions";
import { getClassmatesForDm } from "@/lib/chat/actions";
import { getThreads } from "@/lib/forum/actions";
import { QuickJoinButton } from "@/components/classroom/quick-join-button";

// -------------------------------------------------------------
// TAMPILAN BERANDA UNTUK SISWA TERAUTENTIKASI (STUDENT HOME)
// -------------------------------------------------------------
async function AuthenticatedStudentHome({
  session,
}: {
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>;
}) {
  const [myClasses, classmates, threadsData] = await Promise.all([
    getMyClasses().catch(() => []),
    getClassmatesForDm().catch(() => []),
    getThreads({ limit: 3 }).catch(() => ({ threads: [], total: 0 })),
  ]);

  return (
    <div className="space-y-10">
      {/* 1. WELCOME HERO SISWA */}
      <section className="border-2 border-fluor/40 bg-night p-6 sm:p-8 relative overflow-hidden shadow-[0_0_25px_rgba(233,242,227,0.05)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ok">SESI AKTIF</Badge>
              <Badge variant="outline">SMK TI BAZMA</Badge>
              <Badge variant="cyan">PROGRAM SIJA</Badge>
              <Badge
                variant={
                  session.user.role === "SUPERADMIN"
                    ? "ok"
                    : session.user.role === "ADMIN"
                    ? "cyan"
                    : "outline"
                }
              >
                PERAN:{" "}
                {session.user.role === "SUPERADMIN"
                  ? "SUPER ADMIN"
                  : session.user.role === "ADMIN"
                  ? "ADMIN (GURU/STAF)"
                  : "SISWA"}
              </Badge>
            </div>
            <h1 className="font-sign text-3xl sm:text-5xl uppercase tracking-wide text-fluor leading-tight">
              SELAMAT DATANG, {session.user.name}!
            </h1>
            <p className="font-body text-xs sm:text-sm text-fluor/80 leading-relaxed">
              Ini adalah beranda utama pusat belajar Anda. Akses cepat ruang kelas 2D, temukan rekan belajar untuk berdiskusi, kirim pesan privat, atau jelajahi kampus SMK TI BAZMA dalam dunia 3D.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <Link href="/kelas">
              <Button variant="default" size="lg" className="w-full space-x-2">
                <GraduationCap className="w-5 h-5 text-night" />
                <span className="font-hud text-lg tracking-wider">[ENTER] MODE 2D</span>
              </Button>
            </Link>
            <Link href="/dunia">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-caution text-caution hover:bg-caution hover:text-night space-x-2"
              >
                <Compass className="w-5 h-5" />
                <span className="font-hud text-lg tracking-wider">[E] DUNIA 3D</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DUA GERBANG UTAMA (MODE 2D CEPAT vs DUNIA 3D) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gerbang 2D */}
        <div className="border border-fluor/40 bg-night p-6 flex flex-col justify-between space-y-4 hover:border-fluor transition-colors">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-fluor">
              <div className="w-10 h-10 border border-fluor/50 bg-fluor/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-fluor" />
              </div>
              <div>
                <h2 className="font-sign text-2xl uppercase tracking-wider">MODE CEPAT (2D)</h2>
                <span className="font-mono text-[11px] text-ok">[REKOMENDASI HARIAN]</span>
              </div>
            </div>
            <p className="font-body text-xs sm:text-sm text-fluor/70 leading-relaxed">
              Navigasi langsung tanpa beban render grafis 3D. Akses cepat forum diskusi kelas, mading global, perpustakaan materi, dan obrolan pribadi dengan teman.
            </p>
            <div className="font-mono text-xs text-fluor/60 flex flex-wrap gap-2 pt-1">
              <span className="border border-fluor/20 px-2 py-0.5">/kelas</span>
              <span className="border border-fluor/20 px-2 py-0.5">/mading</span>
              <span className="border border-fluor/20 px-2 py-0.5">/perpustakaan</span>
              <span className="border border-fluor/20 px-2 py-0.5">/pesan</span>
            </div>
          </div>
          <Link href="/kelas">
            <Button variant="default" className="w-full space-x-2">
              <span className="font-hud text-base tracking-wider">BUKA RUANG KELAS 2D</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Gerbang 3D */}
        <div className="border border-caution/60 bg-night p-6 flex flex-col justify-between space-y-4 hover:border-caution transition-colors shadow-[0_0_15px_rgba(242,194,0,0.1)]">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-caution">
              <div className="w-10 h-10 border border-caution/50 bg-caution/10 flex items-center justify-center">
                <Compass className="w-6 h-6 text-caution" />
              </div>
              <div>
                <h2 className="font-sign text-2xl uppercase tracking-wider text-caution">DUNIA JELAJAH (3D)</h2>
                <span className="font-mono text-[11px] text-caution">[FIRST-PERSON RETRO]</span>
              </div>
            </div>
            <p className="font-body text-xs sm:text-sm text-fluor/70 leading-relaxed">
              Eksplorasi spasial kawasan kampus SMK TI BAZMA secara bebas: Gerbang Masuk, Turunan, Loby Asrama, Lapangan Olahraga, dan Interior Gedung Sekolah.
            </p>
            <div className="font-mono text-xs text-caution/70 flex flex-wrap gap-2 pt-1">
              <span className="border border-caution/30 px-2 py-0.5">WASD: Gerak</span>
              <span className="border border-caution/30 px-2 py-0.5">Spasi: Lompat</span>
              <span className="border border-caution/30 px-2 py-0.5">E: Interaksi</span>
              <span className="border border-caution/30 px-2 py-0.5">Esc: Jeda</span>
            </div>
          </div>
          <Link href="/dunia">
            <Button variant="default" className="w-full bg-caution text-night hover:bg-caution/90 border-caution space-x-2">
              <span className="font-hud text-base tracking-wider">MASUK KE KAWASAN 3D</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. KELAS SAYA & PILIHAN GABUNG */}
      <section className="space-y-4">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-sign text-2xl uppercase tracking-wide text-fluor">
              KELAS SAYA &amp; RUANG BELAJAR
            </h2>
          </div>
          <Link href="/kelas">
            <span className="font-mono text-xs text-caution hover:underline">
              LIHAT SEMUA KELAS →
            </span>
          </Link>
        </div>

        {myClasses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.map((cls) => (
              <div
                key={cls.classId}
                className="border border-fluor/30 bg-night p-5 space-y-3 hover:border-fluor transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-caution border border-caution/40 px-2 py-0.5">
                      KODE: {cls.classCode}
                    </span>
                    <span className="font-mono text-xs text-ok">
                      MEJA #{String(cls.seatIndex).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-sign text-xl uppercase tracking-wide text-fluor">
                    {cls.className}
                  </h3>
                  <p className="font-body text-xs text-fluor/70 line-clamp-2">
                    {cls.description || "Kelas kejuruan Sistem Informatika, Jaringan, dan Aplikasi SMK TI BAZMA."}
                  </p>
                </div>

                <div className="pt-2 border-t border-fluor/15 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-fluor/60">
                    {cls.memberCount} Siswa Terdaftar
                  </span>
                  <Link href={`/kelas/${cls.classId}`}>
                    <Button variant="default" size="sm" className="font-hud tracking-wider">
                      MASUK RUANG →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Opsi gabung kelas lain */}
            <div className="border border-dashed border-fluor/30 bg-night/50 p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-neon-cyan block pb-1">
                  {"//"} GABUNG KELAS LAIN
                </span>
                <h4 className="font-sign text-lg uppercase text-fluor">SIJA-11B (XI SIJA 2)</h4>
                <p className="font-body text-xs text-fluor/60 pt-1">
                  Sistem Komputasi, Cloud Computing, dan Otomasi Jaringan tingkat lanjut.
                </p>
              </div>
              <QuickJoinButton classCode="SIJA11B" label="GABUNG XI SIJA 2" />
            </div>
          </div>
        ) : (
          <div className="border border-caution/60 bg-caution/10 p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-sign text-xl uppercase text-caution">
                ANDA BELUM TERDAFTAR DI KELAS MANA PUN
              </h3>
              <p className="font-body text-xs sm:text-sm text-fluor/80 leading-relaxed">
                Untuk terhubung dengan teman sekelas dan mengakses forum materi, silakan pilih salah satu kelas SIJA berikut untuk langsung bergabung:
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <QuickJoinButton
                classCode="SIJA10A"
                label="GABUNG X SIJA 1 (Jaringan & Cloud)"
                variant="default"
                size="default"
              />
              <QuickJoinButton
                classCode="SIJA11B"
                label="GABUNG XI SIJA 2 (Komputasi & IoT)"
                variant="outline"
                size="default"
              />
            </div>
          </div>
        )}
      </section>

      {/* 4. TEMAN BELAJAR & PESAN (ADD FRIEND & DISKUSI) */}
      <section className="space-y-4">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-caution" />
            <h2 className="font-sign text-2xl uppercase tracking-wide text-fluor">
              TEMAN BELAJAR &amp; PESAN PRIBADI
            </h2>
          </div>
          <Link href="/pesan">
            <span className="font-mono text-xs text-caution hover:underline">
              BUKA DIREKTORI TEMAN →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 border border-fluor/30 bg-night p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
              <span className="font-mono text-xs text-fluor/70">
                REKAN SEKELAS SAYA ({classmates.length} TERHUBUNG)
              </span>
              <Link href="/pesan">
                <Button variant="outline" size="sm" className="font-hud tracking-wider text-xs">
                  <UserPlus className="w-3.5 h-3.5 mr-1 text-caution" />
                  + CARI TEMAN LAIN
                </Button>
              </Link>
            </div>

            {classmates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classmates.slice(0, 4).map((mate) => (
                  <div
                    key={mate.userId}
                    className="p-3 border border-fluor/20 bg-fluor/[0.02] flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="font-sign text-base text-fluor uppercase">{mate.name}</p>
                      <p className="font-mono text-[10px] text-caution">{mate.className}</p>
                    </div>
                    <Link href={`/pesan?dm=${mate.userId}`}>
                      <Button variant="outline" size="sm" className="font-hud text-xs tracking-wider">
                        CHAT
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-xs text-fluor/60 py-3">
                Belum ada rekan sekelas yang terdaftar atau Anda belum bergabung ke kelas bersama.
              </p>
            )}
          </div>

          {/* Kartu Bantuan Teman Belajar */}
          <div className="border border-fluor/30 bg-night p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-ok">
                <UserCheck className="w-4 h-4" />
                <h4 className="font-sign text-lg uppercase">DIREKTORI SISWA</h4>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Ingin berdiskusi dengan siswa kelas lain? Buka direktori siswa SMK TI BAZMA untuk melihat teman seangkatan dan bergabung ke kelas yang sama.
              </p>
            </div>
            <Link href="/pesan">
              <Button variant="default" className="w-full font-hud tracking-wider">
                BUKA RUANG PESAN &amp; TEMAN
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MADING & DISKUSI TERHANGAT */}
      <section className="space-y-4">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-neon-pink" />
            <h2 className="font-sign text-2xl uppercase tracking-wide text-fluor">
              MADING &amp; DISKUSI TERHANGAT
            </h2>
          </div>
          <Link href="/mading">
            <span className="font-mono text-xs text-caution hover:underline">
              LIHAT SEMUA DISKUSI →
            </span>
          </Link>
        </div>

        {threadsData.threads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {threadsData.threads.map((t) => (
              <div
                key={t.id}
                className="border border-fluor/30 bg-night p-5 space-y-3 hover:border-fluor transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] border border-fluor/30 px-1.5 py-0.5 text-fluor/70">
                      {t.category}
                    </span>
                    <span className="font-mono text-[11px] text-caution">
                      ▲ {t.votes} UPVOTES
                    </span>
                  </div>
                  <h3 className="font-sign text-lg uppercase text-fluor line-clamp-2">
                    {t.title}
                  </h3>
                  <p className="font-body text-xs text-fluor/60 line-clamp-2">
                    Oleh {t.author.name} ({t.author.role})
                  </p>
                </div>
                <Link href={`/mading/${t.id}`}>
                  <Button variant="outline" size="sm" className="w-full font-hud tracking-wider text-xs">
                    BACA DISKUSI ({t.commentCount} KOMENTAR)
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 border border-fluor/20 bg-fluor/[0.02] font-mono text-xs text-fluor/60">
            Belum ada diskusi publik terbaru di mading sekolah.
          </div>
        )}
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// TAMPILAN LANDING PAGE UNTUK PENGUNJUNG UMUM (GUEST LANDING)
// -------------------------------------------------------------
function PublicLandingPage() {
  return (
    <div className="space-y-12">
      {/* HERO SECTION / PORTAL TAMU */}
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

          <div className="space-y-4 pt-2">
            <div className="p-3 border border-caution/50 bg-caution/10 text-caution font-mono text-xs">
              {"[!]"} Masuk dengan akun siswa SMK TI BAZMA untuk mengakses ruang kelas, materi belajar, mading, dan perpesanan.
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/masuk">
                <Button variant="default" size="lg" className="space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span className="font-hud text-lg tracking-wider">MASUK KE AKUN</span>
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
        </div>
      </section>

      {/* SECTION: TATA LETAK KAWASAN & STRUKTUR LANTAI */}
      <section className="space-y-6">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-sign text-2xl sm:text-3xl uppercase tracking-wide text-fluor">
              TATA LETAK KAWASAN &amp; STRUKTUR LANTAI
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
                <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Ruang Robotik &amp; Ruang Kelas]</span>
              </div>
              <div className="p-2 border border-fluor/15 flex items-center justify-between">
                <span className="font-semibold text-caution">LT 2</span>
                <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Perpustakaan, Server, &amp; Ruang Kelas]</span>
              </div>
              <div className="p-2 border border-fluor/15 flex items-center justify-between">
                <span className="font-semibold text-caution">LT 1</span>
                <span className="text-fluor/50 text-[11px]">[DESAIN KONSEPTUAL: Lab Komputer, Rapat, Konsultansi, Musik]</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: ENAM FASILITAS SEKOLAH */}
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
    </div>
  );
}

// -------------------------------------------------------------
// HALAMAN UTAMA / HOME PAGE
// -------------------------------------------------------------
async function DynamicHomeContent() {
  const session = await getServerSession();
  return session ? <AuthenticatedStudentHome session={session} /> : <PublicLandingPage />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-night text-fluor">
      <HudHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="font-mono text-xs text-caution p-6 border border-fluor/20 bg-night text-center">
              MEMERIKSA STATUS SESI SISWA...
            </div>
          }
        >
          <DynamicHomeContent />
        </Suspense>
      </main>

      <HudFooter />
    </div>
  );
}
