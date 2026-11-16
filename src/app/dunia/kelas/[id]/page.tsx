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
      <div className="w-screen h-screen flex items-center justify-center p-6 bg-night text-fluor font-mono">
        <div className="border border-alert/50 bg-night p-8 space-y-4 max-w-xl w-full text-center">
          <ShieldAlert className="w-12 h-12 text-alert mx-auto" />
          <h2 className="font-sign text-2xl uppercase text-alert">AKSES KELAS 3D DITOLAK</h2>
          <p className="font-body text-sm text-fluor/80">
            {result.error || "Anda harus terdaftar sebagai anggota kelas untuk masuk ke ruang 3D."}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/kelas">
              <Button variant="outline" size="sm">
                KEMBALI KE DAFTAR KELAS (2D)
              </Button>
            </Link>
            <Link href="/dunia">
              <Button variant="default" size="sm">
                KEMBALI KE KAWASAN 3D
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const classroom = result.class;

  return (
    <div className="w-screen h-screen overflow-hidden bg-night relative">
      {/* Tombol kembali ke kelas 2D */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <Link href={`/kelas/${classroom.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="bg-night/90 hover:bg-caution hover:text-night text-fluor border-fluor/40 hover:border-caution font-hud text-base tracking-wider uppercase transition-colors"
          >
            KELUAR KE KELAS 2D
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
        <div className="w-screen h-screen flex items-center justify-center bg-night text-caution font-mono text-xs">
          MEMUAT RUANG KELAS 3D...
        </div>
      }
    >
      <DuniaKelasContent params={params} />
    </Suspense>
  );
}
