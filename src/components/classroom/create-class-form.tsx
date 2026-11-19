"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createNewClass } from "@/lib/classroom/actions";

export function CreateClassForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await createNewClass({
      name: name.trim(),
      code: code.trim(),
      description: description.trim() || undefined,
    });

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Gagal membuat kelas.");
      return;
    }

    setSuccessMessage("Ruang kelas baru berhasil dibuat dan didaftarkan!");
    setName("");
    setCode("");
    setDescription("");
    router.refresh();

    setTimeout(() => {
      setIsOpen(false);
      setSuccessMessage(null);
      if (result.classId) {
        router.push(`/kelas/${result.classId}`);
      }
    }, 1200);
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setIsOpen(true)}
        className="space-x-2 font-hud tracking-wider text-xs sm:text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Buat Ruang Kelas</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-caution/60 bg-night p-6 space-y-4 shadow-[0_0_30px_rgba(242,194,0,0.15)]">
            <div className="flex items-center justify-between border-b border-fluor/20 pb-3">
              <div className="flex items-center space-x-2 text-caution">
                <Building2 className="w-5 h-5" />
                <h3 className="font-sign text-xl uppercase tracking-wider text-fluor">
                  Buat Ruang Kelas Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-fluor/60 hover:text-fluor transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-body text-xs text-fluor/70 leading-relaxed">
              Sebagai Pengajar atau Super Admin, Anda dapat membuka ruang kelas baru untuk menampung
              materi belajar, meja siswa (26 meja per kelas), dan forum diskusi.
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

            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-fluor/80 font-bold block">Nama Kelas</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: XII SIJA 3 - Cloud & DevOps"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-fluor/80 font-bold block">Kode Kelas (Akses Siswa)</label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Misal: SIJA12C"
                  required
                  disabled={isLoading}
                  className="uppercase tracking-widest"
                />
              </div>

              <div className="space-y-1">
                <label className="text-fluor/80 font-bold block">Deskripsi Kelas (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ringkasan kompetensi kejuruan dan fokus pembelajaran..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full bg-night border border-fluor/30 px-3 py-2 text-fluor text-xs font-mono placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-fluor/15">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading || !name.trim() || !code.trim()}
                  className="space-x-1.5"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? "Menyimpan..." : "Simpan & Buat Kelas"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
