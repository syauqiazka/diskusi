import { Suspense } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, DoorOpen } from "lucide-react";
import { getClassDetails, getCurrentSession } from "@/lib/classroom/actions";
import { ClassroomWorldView } from "@/components/world/classroom-world-view";
import { Button } from "@/components/ui/button";
import type { ClassroomDetail } from "@/lib/classroom/types";

async function ClassroomWorldContent({ id }: { id: string }) {
  const session = await getCurrentSession();
  const result = await getClassDetails(id);

  // Review Focus 1: Otorisasi ketat di server untuk ruang kelas 3D
  if (!result.authorized || !result.class) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-night text-fluor">
        <div className="max-w-md w-full border-2 border-alert bg-night p-8 space-y-6 text-center shadow-[0_0_25px_rgba(224,65,47,0.2)]">
          <ShieldAlert className="w-16 h-16 text-alert mx-auto" />

          <div className="space-y-2">
            <h2 className="font-sign text-3xl uppercase text-alert">AKSES KELAS DITOLAK</h2>
            <p className="font-body text-xs sm:text-sm text-fluor/80 leading-relaxed">
              {result.error || "Pintu ruang kelas ini terkunci. Anda belum terdaftar sebagai anggota resmi kelas ini."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dunia">
              <Button variant="default" size="sm" className="space-x-1.5">
                <DoorOpen className="w-4 h-4" />
                <span>KEMBALI KE LORONG 3D</span>
              </Button>
            </Link>
            <Link href="/kelas">
              <Button variant="outline" size="sm">
                DAFTAR KELAS (2D)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClassroomWorldView
      classroom={result.class as unknown as ClassroomDetail}
      currentUserId={session?.user?.id || ""}
    />
  );
}

export default async function DuniaKelasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      {/* Header Kecil Breadcrumb */}
      <div className="flex items-center justify-between border-b border-fluor/15 pb-2 text-xs font-mono text-fluor/60">
        <Link href="/dunia" className="hover:text-caution flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>[E] KELUAR KE LORONG UTAMA 3D</span>
        </Link>
        <Link href={`/kelas/${id}`} className="hover:text-neon-cyan">
          [MODE CEPAT 2D]
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="w-full h-[85vh] bg-night border border-fluor/30 flex items-center justify-center font-mono text-xs text-caution">
            MEMVALIDASI AKSES RUANG KELAS DI SERVER...
          </div>
        }
      >
        <ClassroomWorldContent id={id} />
      </Suspense>
    </div>
  );
}
