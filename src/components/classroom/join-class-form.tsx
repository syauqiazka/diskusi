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

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ketik kode kelas (misal: SIJA-10A)"
          className="uppercase tracking-wider text-xs sm:text-sm h-11 flex-1 rounded-2xl border-2 border-border bg-canvas/40"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="default"
          disabled={isLoading || !code.trim()}
          className="whitespace-nowrap px-6 h-11 rounded-2xl font-display font-bold text-xs sm:text-sm"
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
      </form>
    </div>
  );
}
