import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Compass } from "lucide-react";
import { getClassDetails, getCurrentSession } from "@/lib/classroom/actions";
import { ClassroomTabsView } from "@/components/classroom/classroom-tabs-view";
import type { ClassroomDetail } from "@/lib/classroom/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const instant = false;

async function ClassroomContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentSession();
  const result = await getClassDetails(id);

  if (!result.authorized || !result.class) {
    return (
      <div className="rounded-3xl border-2 border-alert/30 bg-surface p-8 space-y-4 max-w-xl mx-auto my-8 text-center shadow-lg">
        <ShieldAlert className="w-12 h-12 text-alert mx-auto" />
        <h2 className="font-display font-bold text-2xl text-alert">Akses Kelas Ditolak</h2>
        <p className="font-body text-sm text-text-muted">
          {result.error || "Anda tidak memiliki izin untuk mengakses ruang kelas ini."}
        </p>
        <div className="pt-4">
          <Link href="/kelas">
            <Button variant="outline" size="sm" className="rounded-2xl font-display font-semibold">
              Kembali ke Daftar Kelas
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
      <div className="bg-surface rounded-3xl border-2 border-border p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/kelas"
            className="inline-flex items-center space-x-1.5 font-display font-semibold text-xs text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Kelas</span>
          </Link>

          <div className="flex items-center space-x-2 font-display text-xs">
            <Link
              href={`/dunia/kelas/${classroom.id}`}
              className="inline-flex items-center space-x-1 text-accent font-bold hover:underline transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Jelajahi Ruang Kelas 3D</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/50">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-display font-bold text-xs px-2.5 py-0.5 rounded-xl border border-secondary/50 text-text bg-secondary/30">
                {classroom.code}
              </span>
              <Badge variant="mint">Mode Cepat (2D)</Badge>
              <Badge variant="peach">Tata Letak: {classroom.roomLayout.toUpperCase()}</Badge>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
              {classroom.name}
            </h1>
            {classroom.description && (
              <p className="font-body text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                {classroom.description}
              </p>
            )}
          </div>

          <div className="font-body text-xs self-start sm:self-auto p-3 rounded-2xl border border-border bg-canvas/40 sm:text-right shrink-0">
            <div className="text-text-muted text-[11px] font-medium">Status Keanggotaan:</div>
            <div className="font-display font-bold text-text text-sm mt-0.5">
              {result.myMembership?.role === "TEACHER"
                ? "Pengajar (Meja Guru)"
                : `Siswa (Meja #${(result.myMembership?.seatIndex ?? 0) + 1})`}
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

export default function RuangKelasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 rounded-3xl border-2 border-border bg-surface text-center font-body text-xs text-text-muted">
          Memuat data ruang kelas...
        </div>
      }
    >
      <ClassroomContent params={params} />
    </Suspense>
  );
}
