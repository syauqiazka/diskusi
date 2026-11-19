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
      <div className="bg-surface rounded-3xl border-2 border-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 text-text mb-1">
            <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
              Ruang Kelas
            </h1>
          </div>
          <p className="font-body text-sm text-text-muted mt-1">
            Pusat belajar daring sekolah: diskusi kelas, materi terpadu, dan alokasi meja belajar.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canManage && <CreateClassForm />}
          <Badge variant="mint">{classes.length} Kelas Terdaftar</Badge>
        </div>
      </div>

      {/* Form Gabung Kelas untuk Siswa */}
      {session?.user ? (
        <JoinClassForm />
      ) : (
        <div className="rounded-2xl border-2 border-alert/30 bg-alert/10 p-4 text-xs font-body flex items-center justify-between">
          <div className="flex items-center space-x-2 text-alert">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Silakan masuk ke akun terlebih dahulu untuk bergabung ke kelas.</span>
          </div>
          <Link href="/masuk">
            <Button size="sm" variant="danger" className="rounded-xl">
              Masuk Akun
            </Button>
          </Link>
        </div>
      )}

      {/* Daftar Kelas Pengguna */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-text">
            Kelas yang Diikuti
          </h2>
          <span className="font-body text-xs text-text-muted">
            {classes.length} Terdaftar
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-3xl border-2 border-border p-8 text-center space-y-3 bg-surface shadow-sm">
            <GraduationCap className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="font-display font-bold text-lg text-text">
              Belum Terdaftar di Kelas Mana Pun
            </h3>
            <p className="font-body text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              Anda belum bergabung ke kelas mana pun. Masukkan kode kelas pada formulir di atas
              (misalnya ketik <code className="bg-canvas border border-border px-2 py-0.5 rounded-lg text-text font-bold">SIJA-10A</code>) untuk
              mendapatkan nomor meja dan membuka materi kelas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <div
                key={cls.membershipId}
                className="rounded-3xl border-2 border-border bg-surface p-6 space-y-4 hover:border-primary transition-all shadow-sm flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display font-bold text-xs px-2.5 py-1 rounded-xl border border-secondary/50 text-text bg-secondary/30">
                      {cls.classCode}
                    </span>
                    <Badge variant={cls.role === "TEACHER" ? "peach" : "mint"}>
                      {cls.role === "TEACHER" ? "Pengajar" : "Siswa"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-xl text-text group-hover:text-accent transition-colors">
                      {cls.className}
                    </h3>
                    {cls.description && (
                      <p className="font-body text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                        {cls.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="space-y-0.5 font-body text-xs text-text-muted">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.memberCount} Anggota</span>
                    </div>
                    <div>
                      Alokasi:{" "}
                      <span className="text-text font-semibold">
                        {cls.seatIndex !== null
                          ? `Meja #${cls.seatIndex + 1}`
                          : "Meja Guru"}
                      </span>
                    </div>
                  </div>

                  <Link href={`/kelas/${cls.classId}`}>
                    <Button variant="default" size="sm" className="space-x-1.5 rounded-2xl font-display font-bold text-xs">
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
        <div className="p-8 rounded-3xl border-2 border-border bg-surface text-center font-body text-xs text-text-muted">
          Memuat daftar kelas...
        </div>
      }
    >
      <KelasContent />
    </Suspense>
  );
}
