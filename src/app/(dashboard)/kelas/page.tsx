import { Suspense } from "react";
import Link from "next/link";
import { GraduationCap, Users, ArrowRight, ShieldAlert } from "lucide-react";
import { getMyClasses, getCurrentSession } from "@/lib/classroom/actions";
import { JoinClassForm } from "@/components/classroom/join-class-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function KelasContent() {
  const session = await getCurrentSession();
  const classes = await getMyClasses();

  return (
    <div className="space-y-8">
      {/* Header Halaman Kelas */}
      <div className="border-b border-fluor/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-caution mb-1">
            <GraduationCap className="w-5 h-5" />
            <span className="font-hud text-lg tracking-widest uppercase">
              {"//"} MODE CEPAT 2D: DAFTAR KELAS
            </span>
          </div>
          <h1 className="font-sign text-3xl sm:text-4xl text-fluor tracking-wide uppercase">
            RUANG KELAS SAYA
          </h1>
          <p className="font-body text-xs sm:text-sm text-fluor/70 mt-1">
            Daftar kelas virtual yang Anda ikuti di kawasan SMK TI BAZMA. Masuk ke ruang kelas
            untuk melihat papan tulis, papan diskusi, materi, dan meja rekan sekelas.
          </p>
        </div>

        <div className="font-mono text-xs text-right hidden sm:block">
          <Badge variant="cyan">{classes.length} KELAS AKTIF</Badge>
        </div>
      </div>

      {/* Form Gabung Kelas */}
      {session?.user ? (
        <JoinClassForm />
      ) : (
        <div className="border border-alert/50 bg-alert/10 p-4 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2 text-alert">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Anda belum masuk. Silakan masuk terlebih dahulu untuk bergabung ke kelas.</span>
          </div>
          <Link href="/masuk">
            <Button size="sm" variant="danger">
              MASUK AKUN
            </Button>
          </Link>
        </div>
      )}

      {/* Daftar Kelas Pengguna */}
      <div className="space-y-4">
        <h2 className="font-sign text-xl uppercase tracking-wider text-fluor">
          KELAS YANG DIIKUTI
        </h2>

        {classes.length === 0 ? (
          <div className="border border-fluor/20 p-8 text-center space-y-3 bg-night">
            <GraduationCap className="w-10 h-10 text-fluor/30 mx-auto" />
            <h3 className="font-sign text-lg uppercase tracking-wide text-fluor/80">
              BELUM TERDAFTAR DI KELAS MANA PUN
            </h3>
            <p className="font-body text-xs text-fluor/60 max-w-md mx-auto">
              Anda belum bergabung ke kelas virtual. Masukkan kode kelas pada formulir di atas
              (misalnya ketik <code className="text-caution font-mono">SIJA-10A</code>) untuk
              mendapatkan nomor meja dan masuk ke kelas perdana Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.membershipId}
                className="border border-fluor/30 bg-night p-5 space-y-4 hover:border-fluor/60 transition-colors flex flex-col justify-between"
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

                <div className="pt-4 border-t border-fluor/15 flex items-center justify-between">
                  <div className="space-y-1 font-mono text-[11px] text-fluor/60">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.memberCount} Anggota Terdaftar</span>
                    </div>
                    <div>
                      Alokasi Meja:{" "}
                      <span className="text-caution font-semibold">
                        {cls.seatIndex !== null
                          ? `Meja #${cls.seatIndex + 1}`
                          : "Meja Pengajar"}
                      </span>
                    </div>
                  </div>

                  <Link href={`/kelas/${cls.classId}`}>
                    <Button variant="default" size="sm" className="space-x-1">
                      <span>[E] MASUK</span>
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
          MEMUAT DAFTAR KELAS...
        </div>
      }
    >
      <KelasContent />
    </Suspense>
  );
}
