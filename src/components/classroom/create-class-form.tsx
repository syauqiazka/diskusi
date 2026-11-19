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
        className="space-x-2 rounded-2xl font-display font-bold text-xs sm:text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Buat Ruang Kelas</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center space-x-2.5 text-text">
                <div className="w-9 h-9 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-xl text-text">
                  Buat Ruang Kelas Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-body text-xs text-text-muted leading-relaxed">
              Sebagai Pengajar atau Super Admin, Anda dapat membuka ruang kelas baru untuk menampung
              materi belajar, meja siswa (26 meja per kelas), dan forum diskusi.
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

            <form onSubmit={handleSubmit} className="space-y-3 font-body text-xs">
              <div className="space-y-1">
                <label className="text-text font-display font-semibold block">Nama Kelas</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: XII SIJA 3 - Cloud & DevOps"
                  required
                  disabled={isLoading}
                  className="rounded-2xl border-2 border-border bg-canvas/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text font-display font-semibold block">Kode Kelas (Akses Siswa)</label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Misal: SIJA-12C"
                  required
                  disabled={isLoading}
                  className="uppercase font-display font-bold rounded-2xl border-2 border-border bg-canvas/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text font-display font-semibold block">Deskripsi Kelas (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan ringkas atau tujuan silabus mata pelajaran..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full rounded-2xl border-2 border-border bg-canvas/40 p-3 font-body text-xs text-text placeholder:text-text-muted focus:bg-surface focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="rounded-2xl font-display font-semibold text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading || !name.trim() || !code.trim()}
                  className="rounded-2xl font-display font-bold text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Daftarkan Kelas</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
