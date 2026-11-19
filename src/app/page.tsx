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
  Sparkles,
  Info,
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
// TAMPILAN BERANDA UNTUK PENGGUNA TERAUTENTIKASI (SISWA/GURU)
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

  const userRole = session.user.role;
  const roleDisplay =
    userRole === "SUPERADMIN"
      ? "Super Admin"
      : userRole === "ADMIN"
      ? "Guru / Staf"
      : "Siswa";

  return (
    <div className="space-y-10">
      {/* 1. HERO PENGGUNA */}
      <section className="border border-fluor/30 bg-night p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ok">Sesi Aktif</Badge>
              <Badge variant="outline">SMK TI BAZMA</Badge>
              <Badge variant="cyan">Program SIJA</Badge>
              <Badge
                variant={
                  userRole === "SUPERADMIN"
                    ? "ok"
                    : userRole === "ADMIN"
                    ? "cyan"
                    : "outline"
                }
              >
                Peran: {roleDisplay}
              </Badge>
            </div>
            <h1 className="font-sign text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide text-fluor leading-tight">
              Selamat Datang, {session.user.name}
            </h1>
            <p className="font-body text-xs sm:text-sm text-fluor/80 leading-relaxed">
              Pusat kendali belajar digital Anda. Akses cepat ruang kelas virtual, temukan rekan belajar untuk berdiskusi, pinjam modul materi di perpustakaan, atau jelajahi kawasan sekolah dalam dunia 3D.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link href="/kelas">
              <Button variant="default" size="lg" className="w-full space-x-2 font-hud tracking-wider text-sm sm:text-base">
                <GraduationCap className="w-5 h-5 text-night" />
                <span>Buka Ruang Kelas</span>
              </Button>
            </Link>
            <Link href="/dunia">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-caution text-caution hover:bg-caution hover:text-night space-x-2 font-hud tracking-wider text-sm sm:text-base"
              >
                <Compass className="w-5 h-5" />
                <span>Jelajah Dunia 3D</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DUA GERBANG UTAMA (MODE 2D CEPAT vs DUNIA 3D) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gerbang 2D */}
        <div className="border border-fluor/30 bg-night p-6 flex flex-col justify-between space-y-4 hover:border-fluor/70 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-fluor">
              <div className="w-10 h-10 border border-fluor/40 bg-fluor/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-fluor" />
              </div>
              <div>
                <h2 className="font-sign text-2xl uppercase tracking-wide">Mode 2D (Ruang Belajar)</h2>
                <span className="font-mono text-xs text-ok">Cepat &amp; Ringan di Semua Perangkat</span>
              </div>
            </div>
            <p className="font-body text-xs sm:text-sm text-fluor/70 leading-relaxed">
              Navigasi langsung tanpa beban render grafis 3D. Akses cepat ruang kelas, materi perpustakaan terbuka, papan mading diskusi, dan pesan pribadi.
            </p>
            <div className="font-mono text-xs text-fluor/60 flex flex-wrap gap-2 pt-1">
              <span className="border border-fluor/20 px-2 py-0.5">Ruang Kelas</span>
              <span className="border border-fluor/20 px-2 py-0.5">Perpustakaan</span>
              <span className="border border-fluor/20 px-2 py-0.5">Mading Diskusi</span>
              <span className="border border-fluor/20 px-2 py-0.5">Pesan Pribadi</span>
            </div>
          </div>
          <Link href="/kelas">
            <Button variant="default" className="w-full space-x-2 font-hud tracking-wider">
              <span>Masuk Mode Ruang Belajar</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Gerbang 3D */}
        <div className="border border-caution/60 bg-night p-6 flex flex-col justify-between space-y-4 hover:border-caution transition-colors shadow-[0_0_15px_rgba(242,194,0,0.08)]">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-caution">
              <div className="w-10 h-10 border border-caution/50 bg-caution/10 flex items-center justify-center">
                <Compass className="w-6 h-6 text-caution" />
              </div>
              <div>
                <h2 className="font-sign text-2xl uppercase tracking-wide text-caution">Dunia 3D (Jelajah Kampus)</h2>
                <span className="font-mono text-xs text-caution">Eksplorasi Spasial First-Person</span>
              </div>
            </div>
            <p className="font-body text-xs sm:text-sm text-fluor/70 leading-relaxed">
              Eksplorasi spasial kawasan kampus SMK TI BAZMA: gerbang utama, turunan asrama, lapangan olahraga, koridor kelas, dan interior gedung sekolah.
            </p>
            <div className="font-mono text-xs text-caution/70 flex flex-wrap gap-2 pt-1">
              <span className="border border-caution/30 px-2 py-0.5">WASD: Jalan</span>
              <span className="border border-caution/30 px-2 py-0.5">Spasi: Lompat</span>
              <span className="border border-caution/30 px-2 py-0.5">E: Interaksi</span>
              <span className="border border-caution/30 px-2 py-0.5">Esc / X: Keluar</span>
            </div>
          </div>
          <Link href="/dunia">
            <Button variant="default" className="w-full bg-caution text-night hover:bg-caution/90 border-caution space-x-2 font-hud tracking-wider">
              <span>Mulai Jelajah Kawasan 3D</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. KELAS SAYA */}
      <section className="space-y-4">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-sign text-2xl uppercase tracking-wide text-fluor">
              Kelas Saya &amp; Ruang Belajar
            </h2>
          </div>
          <Link href="/kelas">
            <span className="font-mono text-xs text-caution hover:underline">
              Buka Semua Kelas →
            </span>
          </Link>
        </div>

        {myClasses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.map((cls) => (
              <div
                key={cls.classId}
                className="border border-fluor/25 bg-night p-5 space-y-3 hover:border-fluor/60 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-caution border border-caution/40 px-2 py-0.5">
                      Kode: {cls.classCode}
                    </span>
                    <span className="font-mono text-xs text-ok">
                      Meja #{String(cls.seatIndex).padStart(2, "0")}
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
                    <Button variant="default" size="sm" className="font-hud tracking-wider text-xs">
                      Buka Kelas →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Rekomendasi gabung kelas lain */}
            <div className="border border-dashed border-fluor/30 bg-night/50 p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-neon-cyan block pb-1">
                  Rekomendasi Kelas Lain
                </span>
                <h4 className="font-sign text-lg uppercase text-fluor">SIJA-11B (XI SIJA 2)</h4>
                <p className="font-body text-xs text-fluor/60 pt-1">
                  Sistem Komputasi, Cloud Computing, dan Otomasi Jaringan tingkat lanjut.
                </p>
              </div>
              <QuickJoinButton classCode="SIJA11B" label="Gabung XI SIJA 2" />
            </div>
          </div>
        ) : (
          <div className="border border-caution/60 bg-caution/10 p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-sign text-xl uppercase text-caution">
                Belum Terdaftar di Kelas Mana Pun
              </h3>
              <p className="font-body text-xs sm:text-sm text-fluor/80 leading-relaxed">
                Untuk berdiskusi dengan rekan sekelas dan mengakses materi kejuruan, silakan pilih kelas SIJA di bawah ini untuk langsung bergabung:
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <QuickJoinButton
                classCode="SIJA10A"
                label="Gabung X SIJA 1 (Jaringan & Cloud)"
                variant="default"
                size="default"
              />
              <QuickJoinButton
                classCode="SIJA11B"
                label="Gabung XI SIJA 2 (Komputasi & IoT)"
                variant="outline"
                size="default"
              />
            </div>
          </div>
        )}
      </section>

      {/* 4. TEMAN BELAJAR & PESAN */}
      <section className="space-y-4">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-caution" />
            <h2 className="font-sign text-2xl uppercase tracking-wide text-fluor">
              Teman Belajar &amp; Pesan Pribadi
            </h2>
          </div>
          <Link href="/pesan">
            <span className="font-mono text-xs text-caution hover:underline">
              Direktori Lengkap Siswa →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 border border-fluor/25 bg-night p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
              <span className="font-mono text-xs text-fluor/70">
                Rekan Sekelas Terhubung ({classmates.length})
              </span>
              <Link href="/pesan">
                <Button variant="outline" size="sm" className="font-hud tracking-wider text-xs">
                  <UserPlus className="w-3.5 h-3.5 mr-1 text-caution" />
                  Cari Teman Lain
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
                      <p className="font-mono text-[11px] text-caution">{mate.className}</p>
                    </div>
                    <Link href={`/pesan?dm=${mate.userId}`}>
                      <Button variant="outline" size="sm" className="font-hud text-xs tracking-wider">
                        Kirim Pesan
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-xs text-fluor/60 py-3">
                Belum ada rekan sekelas yang terhubung atau Anda belum bergabung ke kelas bersama.
              </p>
            )}
          </div>

          {/* Kartu Bantuan Direktori Siswa */}
          <div className="border border-fluor/25 bg-night p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-ok">
                <UserCheck className="w-4 h-4" />
                <h4 className="font-sign text-lg uppercase">Direktori Siswa</h4>
              </div>
              <p className="font-body text-xs text-fluor/70 leading-relaxed">
                Ingin berdiskusi dengan siswa kelas lain? Buka direktori siswa SMK TI BAZMA untuk melihat teman seangkatan dan mulai obrolan belajar.
              </p>
            </div>
            <Link href="/pesan">
              <Button variant="default" className="w-full font-hud tracking-wider text-xs">
                Buka Direktori Teman
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MADING DISKUSI */}
      <section className="space-y-4">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-neon-pink" />
            <h2 className="font-sign text-2xl uppercase tracking-wide text-fluor">
              Mading &amp; Diskusi Terhangat
            </h2>
          </div>
          <Link href="/mading">
            <span className="font-mono text-xs text-caution hover:underline">
              Lihat Semua Diskusi →
            </span>
          </Link>
        </div>

        {threadsData.threads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {threadsData.threads.map((t) => (
              <div
                key={t.id}
                className="border border-fluor/25 bg-night p-5 space-y-3 hover:border-fluor/60 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] border border-fluor/30 px-1.5 py-0.5 text-fluor/70">
                      {t.category}
                    </span>
                    <span className="font-mono text-[11px] text-caution">
                      ▲ {t.votes} Upvotes
                    </span>
                  </div>
                  <h3 className="font-sign text-lg uppercase text-fluor line-clamp-2">
                    {t.title}
                  </h3>
                  <p className="font-body text-xs text-fluor/60 line-clamp-2">
                    Oleh {t.author.name}
                  </p>
                </div>
                <Link href={`/mading/${t.id}`}>
                  <Button variant="outline" size="sm" className="w-full font-hud tracking-wider text-xs">
                    Buka Diskusi ({t.commentCount} Komentar)
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border border-fluor/20 bg-fluor/[0.02] font-mono text-xs text-fluor/60">
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
      {/* HERO SECTION TAMU */}
      <section className="border border-fluor/30 bg-night p-6 sm:p-10 relative overflow-hidden">
        <div className="space-y-6 relative z-10 max-w-3xl">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-caution font-mono text-xs">
              <Sparkles className="w-4 h-4" />
              <span>SMK TI BAZMA ISLAMIC BOARDING SCHOOL</span>
            </div>
            <h1 className="font-sign text-4xl sm:text-6xl text-fluor tracking-wide uppercase leading-tight">
              Sekolah Tengah Malam
            </h1>
            <p className="font-body text-base sm:text-lg text-fluor/80 leading-relaxed pt-2">
              Platform forum diskusi kejuruan SIJA, perpustakaan materi belajar, dan eksplorasi interaktif kawasan sekolah dalam dunia 3D retro-liminal.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-3 border border-caution/40 bg-caution/10 text-caution font-body text-xs sm:text-sm flex items-start space-x-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Masuk dengan akun siswa SMK TI BAZMA untuk mengakses ruang kelas, materi belajar terpadu, forum mading, dan pesan antar teman.
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/masuk">
                <Button variant="default" size="lg" className="space-x-2 font-hud tracking-wider text-sm sm:text-base">
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun</span>
                </Button>
              </Link>
              <Link href="/daftar">
                <Button variant="outline" size="lg" className="space-x-2 font-hud tracking-wider text-sm sm:text-base">
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Siswa Baru</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: TATA LETAK KAWASAN KAMPUS */}
      <section className="space-y-6">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-sign text-2xl sm:text-3xl uppercase tracking-wide text-fluor">
              Tata Letak Kawasan Kampus
            </h2>
            <p className="font-body text-xs sm:text-sm text-fluor/60">
              Struktur fisik kawasan SMK TI BAZMA yang dapat dijelajahi dalam Mode 2D maupun Dunia 3D.
            </p>
          </div>
          <span className="font-mono text-xs text-caution border border-caution/40 px-2 py-1 hidden sm:inline-block">
            Kampus SIJA BAZMA
          </span>
        </div>

        {/* Alur Akses Fisik Kawasan */}
        <div className="p-4 border border-fluor/20 bg-fluor/[0.02] font-mono text-xs flex flex-wrap gap-1 items-center">
          <span className="text-caution font-semibold">Alur Akses Kawasan: </span>
          <span className="text-fluor/90">
            Gerbang Utama → Turunan Asrama → Lobi &amp; Asrama Santri → Jalur Penghubung → Lapangan &amp; Gedung Sekolah
          </span>
        </div>

        {/* Grid Dua Gedung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gedung Asrama */}
          <div className="border border-fluor/25 p-6 space-y-4 bg-night">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
              <div className="flex items-center space-x-2 text-fluor">
                <Home className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-sign text-xl uppercase tracking-wider">Gedung Asrama</h3>
              </div>
              <Badge variant="cyan">5 Lantai</Badge>
            </div>

            <div className="space-y-2 font-body text-xs text-fluor/80">
              <div className="p-2.5 border border-fluor/15 flex items-center justify-between">
                <span className="font-mono font-semibold text-caution">Lantai 3 - 5</span>
                <span className="text-fluor/70">Kamar Asrama &amp; Hunian Siswa</span>
              </div>
              <div className="p-2.5 border border-fluor/15 flex items-center justify-between">
                <span className="font-mono font-semibold text-caution">Lantai 2</span>
                <span className="text-fluor/70">Area Kebersihan &amp; Fasilitas Penunjang</span>
              </div>
              <div className="p-2.5 border border-neon-cyan/40 bg-neon-cyan/5 flex items-center justify-between">
                <span className="font-mono font-semibold text-neon-cyan">Lantai 1</span>
                <span className="text-neon-cyan font-semibold">Lobi Asrama &amp; Pintu Akses Utama</span>
              </div>
            </div>
          </div>

          {/* Gedung Sekolah */}
          <div className="border border-fluor/25 p-6 space-y-4 bg-night">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
              <div className="flex items-center space-x-2 text-fluor">
                <Building2 className="w-5 h-5 text-caution" />
                <h3 className="font-sign text-xl uppercase tracking-wider">Gedung Sekolah</h3>
              </div>
              <Badge variant="caution">3 Lantai</Badge>
            </div>

            <div className="space-y-2 font-body text-xs text-fluor/80">
              <div className="p-2.5 border border-fluor/15 flex items-center justify-between">
                <span className="font-mono font-semibold text-caution">Lantai 3</span>
                <span className="text-fluor/70">Ruang Kelas Kejuruan &amp; Lab Robotik</span>
              </div>
              <div className="p-2.5 border border-fluor/15 flex items-center justify-between">
                <span className="font-mono font-semibold text-caution">Lantai 2</span>
                <span className="text-fluor/70">Perpustakaan Digital, Ruang Server, &amp; Kelas</span>
              </div>
              <div className="p-2.5 border border-fluor/15 flex items-center justify-between">
                <span className="font-mono font-semibold text-caution">Lantai 1</span>
                <span className="text-fluor/70">Lab Komputer Jaringan, Ruang Rapat &amp; Musik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: ENAM FASILITAS UTAMA */}
      <section className="space-y-6">
        <div className="border-b border-fluor/20 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-sign text-2xl sm:text-3xl uppercase tracking-wide text-fluor">
              Fasilitas Pembelajaran
            </h2>
            <p className="font-body text-xs sm:text-sm text-fluor/60">
              Sarana praktik dan interaksi bagi seluruh siswa dan staf pengajar.
            </p>
          </div>
          <span className="font-mono text-xs text-neon-cyan border border-neon-cyan/40 px-2 py-1 hidden sm:inline-block">
            Sarana Resmi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-fluor/25 p-5 bg-night space-y-2">
            <div className="flex items-center space-x-2 text-fluor">
              <Monitor className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-sign text-lg uppercase tracking-wide">Lab Komputer</h3>
            </div>
            <p className="font-body text-xs text-fluor/70 leading-relaxed">
              Fasilitas praktik kejuruan SIJA dengan perangkat komputer dan instalasi jaringan server.
            </p>
          </div>

          <div className="border border-fluor/25 p-5 bg-night space-y-2">
            <div className="flex items-center space-x-2 text-fluor">
              <Users className="w-5 h-5 text-caution" />
              <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Rapat</h3>
            </div>
            <p className="font-body text-xs text-fluor/70 leading-relaxed">
              Ruang koordinasi pengajar, diskusi staf, dan pembahasan kurikulum kejuruan.
            </p>
          </div>

          <div className="border border-fluor/25 p-5 bg-night space-y-2">
            <div className="flex items-center space-x-2 text-fluor">
              <MessageSquare className="w-5 h-5 text-ok" />
              <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Konsultansi</h3>
            </div>
            <p className="font-body text-xs text-fluor/70 leading-relaxed">
              Area bimbingan akademik, arahan karir teknologi, dan pendampingan santri.
            </p>
          </div>

          <div className="border border-fluor/25 p-5 bg-night space-y-2">
            <div className="flex items-center space-x-2 text-fluor">
              <GraduationCap className="w-5 h-5 text-caution" />
              <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Kelas</h3>
            </div>
            <p className="font-body text-xs text-fluor/70 leading-relaxed">
              Ruang teori interaktif 26 meja per kelas dengan papan tulis dan forum diskusi materi.
            </p>
          </div>

          <div className="border border-fluor/25 p-5 bg-night space-y-2">
            <div className="flex items-center space-x-2 text-fluor">
              <BookOpen className="w-5 h-5 text-fluor" />
              <h3 className="font-sign text-lg uppercase tracking-wide">Perpustakaan Digital</h3>
            </div>
            <p className="font-body text-xs text-fluor/70 leading-relaxed">
              Arsip modul belajar, panduan konfigurasi lab, dan repositori terbuka siswa.
            </p>
          </div>

          <div className="border border-fluor/25 p-5 bg-night space-y-2">
            <div className="flex items-center space-x-2 text-fluor">
              <Music className="w-5 h-5 text-neon-pink" />
              <h3 className="font-sign text-lg uppercase tracking-wide">Ruang Musik</h3>
            </div>
            <p className="font-body text-xs text-fluor/70 leading-relaxed">
              Ruang ekspresi bakat seni, instrumen musik, dan kegiatan ekstrakurikuler santri.
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
              Memeriksa sesi siswa...
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
