import { Suspense } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  Radio,
  ArrowRight,
  Sparkles,
  Compass,
  Monitor,
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
import { HomeActionBar } from "@/components/home/home-action-bar";

// -------------------------------------------------------------
// TAMPILAN BERANDA UNTUK SISWA/GURU TERAUTENTIKASI
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
      {/* 1. HERO SAMBUTAN HANGAT (BRUNO-SIMON TOY-LIKE INSPIRED) */}
      <section className="bg-surface p-6 sm:p-10 rounded-3xl border-2 border-border shadow-md relative overflow-hidden text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="mint">Sesi Aktif</Badge>
            <Badge variant="outline">SMK TI BAZMA</Badge>
            <Badge variant="peach">Program SIJA</Badge>
            <Badge
              variant={
                userRole === "SUPERADMIN"
                  ? "mint"
                  : userRole === "ADMIN"
                  ? "peach"
                  : "default"
              }
            >
              Peran: {roleDisplay}
            </Badge>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl text-text font-bold leading-tight">
            Halo, {session.user.name}!
          </h1>

          <p className="font-body text-sm sm:text-base text-text-muted leading-relaxed">
            Selamat datang di kampus virtual SMK TI BAZMA. Ruang belajar interaktif tempat kamu
            bisa membuka ruang kelas, berdiskusi di mading, meminjam modul materi, atau menjelajahi
            dunia 3D kampus sekolah anime.
          </p>
        </div>

        {/* Action Bar (Mulai Menjelajah + 5 Tombol Pil: Opsi, Kontrol, Peta, Pencapaian, Kredit) */}
        <HomeActionBar />
      </section>

      {/* 2. DUA JALUR UTAMA (MODE 2D CEPAT vs JELAJAH 3D) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jalur 2D Ruang Belajar */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border-2 border-border flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/60 transition-all">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-emerald-800 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-text font-bold">Mode Ruang Belajar (2D)</h3>
                <span className="font-body text-xs text-emerald-700 font-bold">Ringan, Cepat &amp; Praktis</span>
              </div>
            </div>
            <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
              Navigasi langsung tanpa beban render 3D. Akses cepat ruang kelas virtual, modul belajar
              perpustakaan, mading diskusi, dan pesan pribadi bersama teman.
            </p>
          </div>

          <Link href="/kelas" className="block pt-2">
            <Button variant="secondary" className="w-full flex items-center justify-center space-x-2">
              <span>Buka Ruang Kelas</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Jalur 3D Jelajah Kampus Anime */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border-2 border-border flex flex-col justify-between space-y-4 shadow-sm hover:border-accent/60 transition-all">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-accent/40 flex items-center justify-center text-accent shadow-xs">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-text font-bold">Dunia 3D Kampus Anime</h3>
                <span className="font-body text-xs text-accent font-bold">Eksplorasi Spasial First-Person</span>
              </div>
            </div>
            <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
              Jelajahi kawasan sekolah dalam nuansa anime cerah: gerbang sekolah, turunan asrama,
              lorong kelas, lapangan upacara, dan interior gedung.
            </p>
          </div>

          <Link href="/dunia" className="block pt-2">
            <Button variant="default" className="w-full flex items-center justify-center space-x-2">
              <span>Masuk ke Dunia 3D</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. KELAS SAYA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center space-x-2.5">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl text-text font-bold">
              Kelas Saya &amp; Meja Belajar
            </h2>
          </div>
          <Link href="/kelas">
            <span className="font-body text-xs text-accent hover:underline font-bold">
              Lihat Semua Kelas →
            </span>
          </Link>
        </div>

        {myClasses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.map((cls) => (
              <div
                key={cls.classId}
                className="bg-surface p-5 rounded-3xl border-2 border-border space-y-3 flex flex-col justify-between shadow-xs hover:border-primary/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="peach" className="text-[11px]">
                      Kode: {cls.classCode}
                    </Badge>
                    <span className="font-body text-xs text-emerald-700 font-bold">
                      Meja #{String(cls.seatIndex).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-text font-bold">
                    {cls.className}
                  </h3>
                  <p className="font-body text-xs text-text-muted line-clamp-2">
                    {cls.description || "Kelas kejuruan Sistem Informatika, Jaringan, dan Aplikasi SMK TI BAZMA."}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-body text-xs text-text-muted">
                    {cls.memberCount} Siswa Terdaftar
                  </span>
                  <Link href={`/kelas/${cls.classId}`}>
                    <Button variant="secondary" size="sm" className="font-display text-xs">
                      Buka Kelas
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Rekomendasi gabung kelas */}
            <div className="bg-canvas/80 p-5 rounded-3xl border-2 border-dashed border-border space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-body text-xs text-primary font-bold block pb-1">
                  Rekomendasi Kelas Lain
                </span>
                <h4 className="font-display text-lg text-text font-bold">SIJA-11B (XI SIJA 2)</h4>
                <p className="font-body text-xs text-text-muted pt-1">
                  Sistem Komputasi, Cloud Computing, dan Otomasi Jaringan tingkat lanjut.
                </p>
              </div>
              <QuickJoinButton classCode="SIJA11B" label="Gabung XI SIJA 2" />
            </div>
          </div>
        ) : (
          <div className="bg-surface p-8 rounded-3xl border-2 border-secondary/50 space-y-4 text-center max-w-xl mx-auto shadow-xs">
            <h3 className="font-display text-xl text-text font-bold">
              Belum Terdaftar di Kelas Mana Pun
            </h3>
            <p className="font-body text-xs sm:text-sm text-text-muted">
              Pilih salah satu kelas kejuruan SIJA di bawah untuk langsung terhubung dengan meja rekan sekelas:
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <QuickJoinButton
                classCode="SIJA10A"
                label="Gabung X SIJA 1 (Jaringan)"
                variant="default"
              />
              <QuickJoinButton
                classCode="SIJA11B"
                label="Gabung XI SIJA 2 (Komputasi)"
                variant="outline"
              />
            </div>
          </div>
        )}
      </section>

      {/* 4. TEMAN BELAJAR & MADING */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teman Belajar */}
        <div className="bg-surface p-6 rounded-3xl border-2 border-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl text-text font-bold">Teman Sekelas</h3>
            </div>
            <Link href="/pesan">
              <span className="font-body text-xs text-accent hover:underline font-bold">
                Buka Direktori →
              </span>
            </Link>
          </div>

          {classmates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {classmates.slice(0, 4).map((mate) => (
                <div
                  key={mate.userId}
                  className="p-3 bg-canvas rounded-2xl border border-border flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <p className="font-display text-sm text-text font-bold truncate">{mate.name}</p>
                    <p className="font-body text-[11px] text-emerald-700 font-semibold">{mate.className}</p>
                  </div>
                  <Link href={`/pesan?dm=${mate.userId}`}>
                    <Button variant="secondary" size="sm" className="font-display text-xs px-3">
                      Pesan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-xs text-text-muted py-2">
              Belum ada rekan sekelas yang terdaftar atau Anda belum bergabung ke kelas bersama.
            </p>
          )}
        </div>

        {/* Mading Diskusi */}
        <div className="bg-surface p-6 rounded-3xl border-2 border-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-pink-500" />
              <h3 className="font-display text-xl text-text font-bold">Mading Diskusi Terhangat</h3>
            </div>
            <Link href="/mading">
              <span className="font-body text-xs text-accent hover:underline font-bold">
                Lihat Mading →
              </span>
            </Link>
          </div>

          {threadsData.threads.length > 0 ? (
            <div className="space-y-2.5">
              {threadsData.threads.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-canvas rounded-2xl border border-border flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 truncate flex-1">
                    <span className="font-body text-[10px] text-pink-700 font-bold uppercase">
                      {t.category}
                    </span>
                    <h4 className="font-display text-sm text-text font-bold truncate">
                      {t.title}
                    </h4>
                  </div>
                  <Link href={`/mading/${t.id}`}>
                    <Button variant="outline" size="sm" className="font-display text-xs shrink-0">
                      Baca
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-xs text-text-muted py-2">
              Belum ada topik diskusi terbaru di mading sekolah.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// TAMPILAN BERANDA UNTUK PENGUNJUNG UMUM / TAMU
// -------------------------------------------------------------
function PublicLandingPage() {
  return (
    <div className="space-y-12">
      {/* HERO SECTION TAMU RAMAH & BERSIH */}
      <section className="bg-surface p-6 sm:p-12 rounded-3xl border-2 border-border shadow-md text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/20 text-emerald-800 border border-primary/40 font-display text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>SMK TI BAZMA ISLAMIC BOARDING SCHOOL</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl text-text font-bold tracking-tight leading-tight">
          Sekolah Virtual SMK TI BAZMA
        </h1>

        <p className="font-body text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          Platform pembelajaran interaktif kejuruan SIJA yang menggabungkan kemudahan forum belajar 2D
          dengan dunia penjelajahan 3D bergaya kampus anime yang ramah dan menyenangkan.
        </p>

        {/* Action Bar Tamu */}
        <HomeActionBar />

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link href="/masuk">
            <Button variant="default" size="lg" className="px-8 font-display">
              Masuk ke Akun
            </Button>
          </Link>
          <Link href="/daftar">
            <Button variant="secondary" size="lg" className="px-8 font-display">
              Daftar Siswa Baru
            </Button>
          </Link>
        </div>
      </section>

      {/* SECTION FASILITAS PEMBELAJARAN */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl text-text font-bold">
            Fasilitas Pembelajaran Virtual
          </h2>
          <p className="font-body text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
            Ruang interaksi dan praktik yang dapat dijelajahi baik dalam Mode 2D maupun Dunia 3D.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface p-6 rounded-3xl border-2 border-border space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-accent mb-2">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg text-text font-bold">Lab Jaringan &amp; Komputer</h3>
            <p className="font-body text-xs text-text-muted leading-relaxed">
              Fasilitas praktik kejuruan SIJA untuk konfigurasi router, server Linux, dan cloud.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border-2 border-border space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-primary mb-2">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg text-text font-bold">Ruang Kelas Interaktif</h3>
            <p className="font-body text-xs text-text-muted leading-relaxed">
              26 meja belajar siswa per kelas lengkap dengan papan tulis materi dan forum kelas.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border-2 border-border space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg text-text font-bold">Perpustakaan Digital</h3>
            <p className="font-body text-xs text-text-muted leading-relaxed">
              Repositori terbuka modul pembelajaran dan standar operasional kejuruan SIJA.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// ROOT PAGE COMPONENT
// -------------------------------------------------------------
async function DynamicHomeContent() {
  const session = await getServerSession();
  return session ? <AuthenticatedStudentHome session={session} /> : <PublicLandingPage />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <HudHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="p-12 text-center font-display text-text-muted animate-pulse">
              Memuat beranda sekolah virtual...
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
