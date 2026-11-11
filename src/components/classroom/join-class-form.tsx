"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DoorOpen, AlertCircle, CheckCircle2 } from "lucide-react";
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
    <div className="border border-fluor/30 bg-night p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
        <div className="flex items-center space-x-2 text-caution">
          <DoorOpen className="w-5 h-5" />
          <h3 className="font-sign text-lg uppercase tracking-wider">
            GABUNG KELAS DENGAN KODE
          </h3>
        </div>
        <span className="font-mono text-[11px] text-fluor/60 px-2 py-0.5 border border-fluor/20">
          CONTOH: SIJA-10A
        </span>
      </div>

      <p className="font-body text-xs text-fluor/70">
        Masukkan kode akses kelas yang diberikan oleh pengajar atau asisten. Siswa akan secara
        otomatis dialokasikan nomor meja kosong di ruang kelas virtual.
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

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="MASUKKAN KODE KELAS (MISAL: SIJA-10A)"
          className="uppercase tracking-widest text-sm"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="default"
          disabled={isLoading || !code.trim()}
          className="whitespace-nowrap px-6"
        >
          {isLoading ? "MEMERIKSA..." : "GABUNG KELAS"}
        </Button>
      </form>
    </div>
  );
}
