import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getClassDetails, getCurrentSession } from "@/lib/classroom/actions";
import { ClassroomTabsView } from "@/components/classroom/classroom-tabs-view";
import type { ClassroomDetail } from "@/lib/classroom/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function RuangKelasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentSession();
  const result = await getClassDetails(id);

  if (!result.authorized || !result.class) {
    return (
      <div className="border border-alert/50 bg-night p-8 space-y-4 max-w-xl mx-auto my-8 text-center">
        <ShieldAlert className="w-12 h-12 text-alert mx-auto" />
        <h2 className="font-sign text-2xl uppercase text-alert">AKSES KELAS DITOLAK</h2>
        <p className="font-body text-sm text-fluor/80">
          {result.error || "Anda tidak memiliki izin untuk mengakses ruang kelas ini."}
        </p>
        <div className="pt-4">
          <Link href="/kelas">
            <Button variant="outline" size="sm">
              KEMBALI KE DAFTAR KELAS
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const classroom = result.class;

  return (
    <div className="space-y-6">
      {/* Baris Navigasi Kembali & Info Header Kelas */}
      <div className="border-b border-fluor/20 pb-4 space-y-3">
        <Link
          href="/kelas"
          className="inline-flex items-center space-x-1.5 font-mono text-xs text-fluor/60 hover:text-caution transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>KEMBALI KE DAFTAR KELAS</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 border border-caution/60 text-caution bg-caution/10 font-bold tracking-wider">
                {classroom.code}
              </span>
              <Badge variant="cyan">MODE CEPAT (2D)</Badge>
              <Badge variant="outline">LAYOUT: {classroom.roomLayout.toUpperCase()}</Badge>
            </div>
            <h1 className="font-sign text-3xl sm:text-4xl text-fluor tracking-wide uppercase">
              {classroom.name}
            </h1>
            {classroom.description && (
              <p className="font-body text-xs sm:text-sm text-fluor/70 mt-1">
                {classroom.description}
              </p>
            )}
          </div>

          <div className="font-mono text-xs self-start sm:self-auto p-2 border border-fluor/20 bg-fluor/5 text-right">
            <div className="text-fluor/60 text-[11px]">STATUS KEANGGOTAAN ANDA:</div>
            <div className="text-caution font-bold mt-0.5">
              {result.myMembership?.role === "TEACHER"
                ? "PENGAJAR (MEJA GURU)"
                : `SISWA (MEJA #${(result.myMembership?.seatIndex ?? 0) + 1})`}
            </div>
          </div>
        </div>
      </div>

      {/* Komponen Tampilan 4 Tab Kelas */}
      <ClassroomTabsView
        classroom={classroom as unknown as ClassroomDetail}
        currentUserId={session?.user?.id || ""}
      />
    </div>
  );
}
