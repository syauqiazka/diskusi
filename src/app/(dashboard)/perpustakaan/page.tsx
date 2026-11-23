"use client";

import * as React from "react";
import {
  BookOpen,
  Search,
  Download,
  Plus,
  X,
  Trash2,
  Loader2,
  FileText,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDestructiveModal } from "@/components/ui/confirm-destructive-modal";
import { ImageUploader } from "@/components/ui/image-uploader";
import { authClient } from "@/lib/auth/auth-client";
import {
  getMaterials,
  createMaterial,
  deleteMaterial,
  type MaterialListItem,
} from "@/lib/materials/actions";

const CATEGORIES = [
  "Semua",
  "Jaringan & Server",
  "Virtualisasi",
  "Sistem Operasi",
  "Pemrograman",
];

export default function PerpustakaanPage() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const canManage = userRole === "SUPERADMIN" || userRole === "ADMIN";

  const [materials, setMaterials] = React.useState<MaterialListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Semua");
  const [downloadNotice, setDownloadNotice] = React.useState<{ title: string; progress: number; secondsLeft: number } | null>(null);

  // Modal Konfirmasi Hapus Destruktif (Psychology of Colors)
  const [pendingDeleteMaterial, setPendingDeleteMaterial] = React.useState<{ id: string; title: string } | null>(null);

  // Dialog Unggah Materi (Hanya Admin & Super Admin)
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("Jaringan & Server");
  const [newFormat, setNewFormat] = React.useState("PDF");
  const [newSize, setNewSize] = React.useState("2.5 MB");
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchMaterials = React.useCallback(async () => {
    try {
      const data = await getMaterials({ classId: null });
      setMaterials(data);
    } catch (err) {
      console.error("Gagal mengambil data perpustakaan:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchMaterials();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchMaterials]);

  const filteredMaterials = React.useMemo(() => {
    return materials.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory =
        selectedCategory === "Semua" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [materials, searchTerm, selectedCategory]);

  const handleDownload = (title: string) => {
    // Tampilkan Determinate Progress (Kaidah UX: "Show How Long" bukan spinner tanpa waktu)
    setDownloadNotice({ title, progress: 15, secondsLeft: 3 });
    setTimeout(() => {
      setDownloadNotice({ title, progress: 65, secondsLeft: 2 });
    }, 700);
    setTimeout(() => {
      setDownloadNotice({ title, progress: 100, secondsLeft: 0 });
    }, 1500);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 2400);
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await createMaterial({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        category: newCategory.toUpperCase(),
        fileFormat: newFormat.toUpperCase(),
        fileSize: newSize,
        fileUrl: `/materials/${newTitle.toLowerCase().replace(/\s+/g, "-")}.${newFormat.toLowerCase()}`,
        classId: null, // Perpustakaan umum
      });

      if (!res.success) {
        setErrorMsg(res.error || "Gagal mengunggah materi.");
        return;
      }

      setNewTitle("");
      setNewDesc("");
      setShowUploadDialog(false);
      await fetchMaterials();
    } catch {
      setErrorMsg("Terjadi kesalahan sistem saat menyimpan materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Halaman Perpustakaan */}
      <div className="bg-surface rounded-3xl border-2 border-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 text-text mb-1">
            <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
              Perpustakaan Digital
            </h1>
          </div>
          <p className="font-body text-sm text-text-muted mt-1">
            Koleksi buku teks, panduan konfigurasi lab, dan modul pembelajaran sekolah.
          </p>
        </div>

        {/* Kontrol Hak Akses: Tombol Tambah hanya untuk Pengajar/Super Admin */}
        <div className="flex items-center space-x-3">
          {canManage ? (
            <Button
              variant="default"
              onClick={() => setShowUploadDialog(true)}
              className="space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Materi</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-border bg-canvas/60 text-text-muted font-body text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Dikelola Guru &amp; Staf</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifikasi Determinate Progress (Kaidah UX: "SHOW HOW LONG") */}
      {downloadNotice && (
        <div className="rounded-2xl border-2 border-primary/40 bg-surface p-4 font-body text-xs shadow-md space-y-2 animate-in fade-in select-none">
          <div className="flex items-center justify-between text-text">
            <span className="font-display font-bold">
              Mengunduh berkas: &quot;{downloadNotice.title}&quot;
            </span>
            <span className="text-text-muted font-mono text-[11px]">
              {downloadNotice.secondsLeft > 0
                ? `Tersisa ~${downloadNotice.secondsLeft} detik`
                : "Selesai!"}
            </span>
          </div>
          <div className="w-full bg-canvas rounded-full h-2 overflow-hidden border border-border">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${downloadNotice.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Bar Pencarian & Filter Kategori */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari materi, modul praktikum, atau topik..."
            className="pl-10 h-11 text-xs sm:text-sm rounded-2xl border-2 border-border bg-canvas/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-display text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-text font-bold shadow-sm"
                    : "bg-surface text-text-muted hover:text-text border border-border"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Materi Pembelajaran (Skeleton Loading Sesuai Kaidah UX) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl border-2 border-border/80 bg-surface/60 p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-6 rounded-full" />
                <Skeleton className="w-16 h-4 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-4/5 h-6 rounded-xl" />
                <Skeleton className="w-full h-4 rounded-xl" />
                <Skeleton className="w-3/5 h-4 rounded-xl" />
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <Skeleton className="w-28 h-4 rounded-xl" />
                <Skeleton className="w-20 h-9 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-3xl border-2 border-border bg-surface p-12 text-center space-y-3 shadow-sm">
          <FileText className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="font-display font-bold text-lg text-text">
            Tidak Ada Materi yang Cocok
          </h3>
          <p className="font-body text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            {searchTerm
              ? `Tidak ditemukan materi dengan kata kunci "${searchTerm}". Silakan periksa kembali kata pencarian atau pilih kategori lain.`
              : "Belum ada dokumen materi untuk kategori ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border-2 border-border bg-surface p-6 flex flex-col justify-between space-y-4 hover:border-primary transition-all shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="mint" className="text-[10px]">
                    {item.category}
                  </Badge>
                  <span className="font-body text-xs text-text-muted">
                    {item.fileFormat} • {item.fileSize}
                  </span>
                </div>

                <div>
                  <h2 className="font-display font-bold text-lg text-text line-clamp-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h2>
                  <p className="font-body text-xs text-text-muted leading-relaxed mt-1.5 line-clamp-3">
                    {item.description || "Dokumen materi pembelajaran sekolah."}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                <div className="font-body text-xs text-text-muted truncate">
                  Oleh: <strong className="text-text">{item.author.name}</strong>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDeleteMaterial({ id: item.id, title: item.title })}
                      disabled={deletingId === item.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10 px-2 h-9 rounded-xl transition-colors"
                      title="Hapus materi"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownload(item.title)}
                    className="space-x-1.5 h-9 rounded-2xl font-display font-bold text-xs px-3.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Modal Unggah Materi (Hanya Super Admin & Admin) */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-lg p-6 sm:p-8 space-y-5 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowUploadDialog(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border/50 pb-3">
              <span className="font-display font-semibold text-xs text-text-muted">
                Kelola Perpustakaan
              </span>
              <h3 className="font-display font-bold text-2xl text-text mt-0.5">
                Unggah Dokumen Materi Baru
              </h3>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl border-2 border-alert/30 bg-alert/10 text-alert text-xs font-body font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadMaterial} className="space-y-4 font-body text-xs">
              <div className="space-y-1">
                <label
                  htmlFor="materialTitle"
                  className="font-display font-semibold text-text block"
                >
                  Judul Modul / Berkas
                </label>
                <Input
                  id="materialTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Modul Praktikum Troubleshooting VLAN"
                  required
                  autoFocus
                  className="rounded-2xl border-2 border-border bg-canvas/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="materialCat"
                    className="font-display font-semibold text-text block"
                  >
                    Kategori
                  </label>
                  <select
                    id="materialCat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 rounded-2xl border-2 border-border bg-canvas/40 px-3 font-body text-xs text-text focus:bg-surface focus:outline-none"
                  >
                    <option value="Jaringan & Server">Jaringan &amp; Server</option>
                    <option value="Virtualisasi">Virtualisasi</option>
                    <option value="Sistem Operasi">Sistem Operasi</option>
                    <option value="Pemrograman">Pemrograman</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="materialFmt"
                    className="font-display font-semibold text-text block"
                  >
                    Format &amp; Ukuran
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="materialFmt"
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      placeholder="PDF"
                      className="w-20 rounded-2xl border-2 border-border bg-canvas/40"
                    />
                    <Input
                      id="materialSize"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="2.5 MB"
                      className="rounded-2xl border-2 border-border bg-canvas/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="materialDesc"
                  className="font-display font-semibold text-text block"
                >
                  Ringkasan Materi
                </label>
                <textarea
                  id="materialDesc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border-2 border-border bg-canvas/40 p-3.5 font-body text-xs text-text placeholder:text-text-muted focus:bg-surface focus:outline-none transition-colors"
                  placeholder="Ringkasan kompetensi atau topik yang dibahas dalam dokumen ini..."
                />
              </div>

              {/* Lampiran Berkas Vercel Blob */}
              <div className="pt-1">
                <ImageUploader
                  value={uploadedFileUrl}
                  onChange={(url) => {
                    setUploadedFileUrl(url);
                    if (url) {
                      setNewFormat(url.endsWith(".pdf") ? "PDF" : "IMG");
                    }
                  }}
                  label="Lampiran Berkas / Sampul (Vercel Blob)"
                  description="Format PDF, JPG, PNG, atau WebP (Maksimal 10 MB)"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadDialog(false)}
                  className="rounded-2xl font-display font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmitting}
                  className="rounded-2xl font-display font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Unggah Materi</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Konfirmasi Hapus Destruktif (Kaidah UX: "Psychology of Colors") */}
      <ConfirmDestructiveModal
        isOpen={!!pendingDeleteMaterial}
        onClose={() => setPendingDeleteMaterial(null)}
        onConfirm={async () => {
          if (!pendingDeleteMaterial) return;
          const id = pendingDeleteMaterial.id;
          setDeletingId(id);
          try {
            const res = await deleteMaterial(id);
            if (res.success) {
              await fetchMaterials();
            }
          } finally {
            setDeletingId(null);
            setPendingDeleteMaterial(null);
          }
        }}
        title="Hapus Materi Pembelajaran"
        description={`Apakah Anda yakin ingin menghapus "${pendingDeleteMaterial?.title}"? Dokumen ini akan dihapus secara permanen dari perpustakaan sekolah.`}
        confirmText="Hapus Permanen"
        isLoading={!!deletingId}
      />
    </div>
  );
}
