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
    <div className="border border-fluor/25 bg-night p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-fluor/15 pb-3">
        <div className="flex items-center space-x-2 text-caution">
          <DoorOpen className="w-5 h-5" />
          <h2 className="font-sign text-lg uppercase tracking-wide text-fluor">
            Gabung ke Ruang Kelas
          </h2>
        </div>
        <span className="font-mono text-xs text-fluor/60">
          Contoh kode: <span className="text-caution font-semibold">SIJA-10A</span>
        </span>
      </div>

      <p className="font-body text-xs text-fluor/70">
        Masukkan kode akses kelas yang dibagikan oleh guru atau staf pengajar. Siswa akan otomatis
        mendapatkan alokasi meja belajar di dalam kelas.
      </p>

      {errorMessage && (
        <div className="p-3 border border-alert/60 bg-alert/10 text-alert text-xs font-mono flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 border border-ok/60 bg-ok/10 text-ok text-xs font-mono flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pt-1">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ketik kode kelas (misal: SIJA-10A)"
          className="uppercase tracking-wider text-xs sm:text-sm h-10 flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="default"
          disabled={isLoading || !code.trim()}
          className="whitespace-nowrap px-6 h-10 font-hud text-xs sm:text-sm tracking-wider"
        >
          {isLoading ? (
            <span className="flex items-center space-x-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Memeriksa...</span>
            </span>
          ) : (
            <span>Gabung Kelas</span>
          )}
        </Button>
      </form>
    </div>
  );
}
