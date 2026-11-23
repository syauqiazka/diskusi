"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DoorOpen, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { joinClassByCode } from "@/lib/classroom/actions";

export function JoinClassForm() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await joinClassByCode(code);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Gagal bergabung ke kelas.");
      return;
    }

    setSuccessMessage(result.message || "Berhasil bergabung ke kelas.");
    setCode("");
    router.refresh();

    if (result.classId) {
      setTimeout(() => {
        router.push(`/kelas/${result.classId}`);
      }, 1200);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-border bg-surface p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div className="flex items-center space-x-2 text-text">
          <div className="w-8 h-8 rounded-xl bg-secondary/30 flex items-center justify-center text-text">
            <DoorOpen className="w-4 h-4" />
          </div>
          <h2 className="font-display font-bold text-lg text-text">
            Gabung ke Ruang Kelas
          </h2>
        </div>
        <span className="font-body text-xs text-text-muted">
          Contoh kode: <span className="text-text font-bold">SIJA-10A</span>
        </span>
      </div>

      <p className="font-body text-xs text-text-muted leading-relaxed">
        Masukkan kode akses kelas yang dibagikan oleh guru atau staf pengajar. Siswa akan otomatis
        mendapatkan alokasi nomor meja belajar di dalam kelas.
      </p>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl border-2 border-alert/30 bg-alert/10 text-alert text-xs font-body font-medium flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-alert" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl border-2 border-ok/30 bg-ok/10 text-ok text-xs font-body font-semibold flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-ok" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: SIJA-10A"
              className="uppercase tracking-widest text-sm sm:text-base font-mono font-bold h-12 rounded-2xl border-2 border-border bg-canvas/40 px-4 focus:bg-surface"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading || !code.trim()}
            className="whitespace-nowrap px-7 h-12 rounded-2xl font-display font-bold text-xs sm:text-sm shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Gabung Kelas</span>
            )}
          </Button>
        </div>

        {/* Input Mask & Format Guidance Pills (Kaidah UX: "Use Input Masks In Fields To Guide Users") */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-body text-xs text-text-muted">
          <span className="font-medium text-[11px]">Format: <code className="bg-canvas border border-border px-1.5 py-0.5 rounded font-mono font-bold text-text">PROG-TINGKAT</code></span>
          <span className="text-border">•</span>
          <span className="text-[11px]">Cepat pilih contoh:</span>
          {(["SIJA-10A", "SIJA-11A", "SIJA-12A"] as const).map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setCode(ex)}
              className="px-2 py-0.5 rounded-lg border border-border bg-surface text-[11px] font-mono hover:border-primary hover:text-text transition-colors cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
