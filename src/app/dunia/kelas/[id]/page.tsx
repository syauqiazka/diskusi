import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { getClassDetails } from "@/lib/classroom/actions";
import { ClassroomWorldView } from "@/components/world/classroom-world-view";
import { Button } from "@/components/ui/button";

async function DuniaKelasContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/masuk");
  }

  const { id } = await params;
  const result = await getClassDetails(id);

  if (!result.authorized || !result.class) {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-6 bg-canvas text-text font-body">
        <div className="rounded-3xl border-2 border-alert/30 bg-surface p-8 space-y-4 max-w-xl w-full text-center shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-alert mx-auto" />
          <h2 className="font-display font-bold text-2xl text-alert">Akses Kelas 3D Ditolak</h2>
          <p className="font-body text-sm text-text-muted">
            {result.error || "Anda harus terdaftar sebagai anggota kelas untuk masuk ke ruang 3D."}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/kelas">
              <Button variant="outline" size="sm" className="rounded-2xl font-display font-semibold">
                Kembali ke Daftar Kelas (2D)
              </Button>
            </Link>
            <Link href="/dunia">
              <Button variant="default" size="sm" className="rounded-2xl font-display font-bold">
                Kembali ke Kawasan 3D
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const classroom = result.class;

  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas relative">
      {/* Tombol kembali ke kelas 2D */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <Link href={`/kelas/${classroom.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-surface/90 hover:bg-surface text-text border-2 border-border font-display font-semibold text-xs shadow-sm transition-all"
          >
            Buka Mode 2D
          </Button>
        </Link>
      </div>

      <ClassroomWorldView classroom={classroom} currentUserId={session.user.id} />
    </div>
  );
}

export default function DuniaKelasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-canvas text-text-muted font-display text-sm">
          Memuat ruang kelas 3D...
        </div>
      }
    >
      <DuniaKelasContent params={params} />
    </Suspense>
  );
}
