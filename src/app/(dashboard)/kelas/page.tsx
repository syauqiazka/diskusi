import { Suspense } from "react";
import Link from "next/link";
import { GraduationCap, Users, ArrowRight, ShieldAlert } from "lucide-react";
import { getMyClasses, getCurrentSession } from "@/lib/classroom/actions";
import { JoinClassForm } from "@/components/classroom/join-class-form";
import { CreateClassForm } from "@/components/classroom/create-class-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function KelasContent() {
  const session = await getCurrentSession();
  const classes = await getMyClasses();

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const canManage = userRole === "SUPERADMIN" || userRole === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Header Halaman Kelas */}
      <div className="border-b border-fluor/20 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-caution mb-1">
            <GraduationCap className="w-5 h-5" />
            <h1 className="font-sign text-2xl sm:text-3xl text-fluor tracking-wide uppercase">
              Ruang Kelas
            </h1>
          </div>
          <p className="font-body text-xs sm:text-sm text-fluor/70 mt-1">
            Pusat belajar daring kejuruan SMK TI BAZMA: diskusi kelas, materi terpadu, dan alokasi meja belajar.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canManage && <CreateClassForm />}
          <div className="font-mono text-xs">
            <Badge variant="cyan">{classes.length} KELAS SAYA</Badge>
          </div>
        </div>
      </div>

      {/* Form Gabung Kelas untuk Siswa */}
      {session?.user ? (
        <JoinClassForm />
      ) : (
        <div className="border border-alert/50 bg-alert/10 p-4 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2 text-alert">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Silakan masuk ke akun terlebih dahulu untuk bergabung ke kelas.</span>
          </div>
          <Link href="/masuk">
            <Button size="sm" variant="danger">
              Masuk Akun
            </Button>
          </Link>
        </div>
      )}

      {/* Daftar Kelas Pengguna */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sign text-xl uppercase tracking-wider text-fluor">
            Kelas yang Diikuti
          </h2>
          <span className="font-mono text-xs text-fluor/50">
            {classes.length} Terdaftar
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="border border-fluor/20 p-8 text-center space-y-3 bg-night">
            <GraduationCap className="w-10 h-10 text-fluor/30 mx-auto" />
            <h3 className="font-sign text-lg uppercase tracking-wide text-fluor/80">
              Belum Terdaftar di Kelas Mana Pun
            </h3>
            <p className="font-body text-xs text-fluor/60 max-w-md mx-auto">
              Anda belum bergabung ke kelas mana pun. Masukkan kode kelas pada formulir di atas
              (misalnya ketik <code className="text-caution font-mono">SIJA-10A</code>) untuk
              mendapatkan nomor meja dan membuka materi kelas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.membershipId}
                className="border border-fluor/25 bg-night p-5 space-y-4 hover:border-fluor/60 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 border border-caution/50 text-caution bg-caution/10 font-bold tracking-wider">
                      {cls.classCode}
                    </span>
                    <Badge variant={cls.role === "TEACHER" ? "cyan" : "outline"}>
                      {cls.role === "TEACHER" ? "PENGAJAR" : "SISWA"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-sign text-xl uppercase tracking-wide text-fluor">
                      {cls.className}
                    </h3>
                    {cls.description && (
                      <p className="font-body text-xs text-fluor/70 mt-1 line-clamp-2">
                        {cls.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-fluor/15 flex items-center justify-between">
                  <div className="space-y-0.5 font-mono text-[11px] text-fluor/60">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.memberCount} Anggota</span>
                    </div>
                    <div>
                      Alokasi:{" "}
                      <span className="text-caution font-semibold">
                        {cls.seatIndex !== null
                          ? `Meja #${cls.seatIndex + 1}`
                          : "Meja Guru"}
                      </span>
                    </div>
                  </div>

                  <Link href={`/kelas/${cls.classId}`}>
                    <Button variant="default" size="sm" className="space-x-1.5 font-hud text-xs tracking-wider">
                      <span>Buka Kelas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KelasIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 border border-fluor/30 bg-night text-center font-mono text-xs text-caution">
          Memuat daftar kelas...
        </div>
      }
    >
      <KelasContent />
    </Suspense>
  );
}
