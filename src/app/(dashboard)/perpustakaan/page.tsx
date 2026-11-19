"use client";

import * as React from "react";
import {
  BookOpen,
  Search,
  Download,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Loader2,
  FileText,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [downloadNotice, setDownloadNotice] = React.useState<string | null>(null);

  // Dialog Unggah Materi (Hanya Admin & Super Admin)
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("Jaringan & Server");
  const [newFormat, setNewFormat] = React.useState("PDF");
  const [newSize, setNewSize] = React.useState("2.5 MB");
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
    setDownloadNotice(`Mempersiapkan berkas: "${title}"...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 2500);
  };

  const handleDelete = async (materialId: string, title: string) => {
    if (!confirm(`Hapus materi "${title}" dari perpustakaan?`)) {
      return;
    }
    setDeletingId(materialId);
    try {
      const res = await deleteMaterial(materialId);
      if (res.success) {
        await fetchMaterials();
      } else {
        alert(res.error || "Gagal menghapus materi.");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat menghapus materi.");
    } finally {
      setDeletingId(null);
    }
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
    <div className="space-y-6">
      {/* Header Halaman Perpustakaan */}
      <div className="border-b border-fluor/20 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-caution mb-1">
            <BookOpen className="w-5 h-5" />
            <h1 className="font-sign text-2xl sm:text-3xl text-fluor tracking-wide uppercase">
              Perpustakaan Digital
            </h1>
          </div>
          <p className="font-body text-xs sm:text-sm text-fluor/70">
            Koleksi buku teks, panduan konfigurasi lab, dan modul pembelajaran SIJA SMK TI BAZMA.
          </p>
        </div>

        {/* Kontrol Hak Akses: Tombol Tambah hanya untuk Pengajar/Super Admin */}
        <div className="flex items-center space-x-3">
          {canManage ? (
            <Button
              variant="default"
              onClick={() => setShowUploadDialog(true)}
              className="space-x-2 font-hud tracking-wider text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Materi</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 border border-fluor/20 bg-fluor/[0.03] text-fluor/70 font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-ok" />
              <span>Kurasi Guru &amp; Staf</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifikasi Download Toast */}
      {downloadNotice && (
        <div className="border border-ok bg-ok/10 text-ok p-3 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Bar Pencarian & Filter Kategori */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-fluor/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari materi, modul praktikum, atau topik..."
            className="pl-10 h-10 text-xs sm:text-sm"
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
                className={`px-3 py-1.5 border font-mono text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "border-caution text-caution bg-caution/10 font-bold"
                    : "border-fluor/20 text-fluor/70 hover:border-fluor/50 hover:text-fluor bg-night"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Materi Pembelajaran */}
      {isLoading ? (
        <div className="p-12 border border-fluor/20 bg-night text-center font-mono text-xs text-fluor/60 flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-caution" />
          <span>Memuat koleksi materi pembelajaran...</span>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="border border-fluor/20 bg-night p-10 text-center space-y-2">
          <FileText className="w-10 h-10 text-fluor/30 mx-auto" />
          <h3 className="font-sign text-lg uppercase text-fluor/80">
            Tidak Ada Materi yang Cocok
          </h3>
          <p className="font-body text-xs text-fluor/60 max-w-md mx-auto">
            {searchTerm
              ? `Tidak ditemukan materi dengan kata kunci "${searchTerm}". Silakan periksa kembali kata pencarian atau pilih kategori lain.`
              : "Belum ada dokumen materi untuk kategori ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="border border-fluor/25 bg-night p-5 flex flex-col justify-between space-y-4 hover:border-fluor/60 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="cyan" className="text-[10px] uppercase">
                    {item.category}
                  </Badge>
                  <span className="font-mono text-[11px] text-fluor/50">
                    {item.fileFormat} • {item.fileSize}
                  </span>
                </div>

                <div>
                  <h2 className="font-sign text-lg uppercase tracking-wide text-fluor line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="font-body text-xs text-fluor/70 leading-relaxed mt-1 line-clamp-3">
                    {item.description || "Dokumen materi pembelajaran SIJA SMK TI BAZMA."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-fluor/15 flex items-center justify-between gap-2">
                <div className="font-mono text-[11px] text-fluor/50 truncate">
                  Oleh: <span className="text-fluor/80">{item.author.name}</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deletingId === item.id}
                      className="text-alert/80 hover:text-alert hover:bg-alert/10 px-2 h-8"
                      title="Hapus materi"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(item.title)}
                    className="space-x-1.5 h-8 font-hud text-xs tracking-wider"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm select-none">
          <div className="border border-caution/60 bg-night w-full max-w-lg p-6 space-y-4 relative shadow-[0_0_30px_rgba(242,194,0,0.15)]">
            <button
              onClick={() => setShowUploadDialog(false)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-fluor/20 pb-3">
              <div className="flex items-center space-x-2 text-caution mb-0.5">
                <BookOpen className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-wider">
                  Kelola Perpustakaan
                </span>
              </div>
              <h3 className="font-sign text-2xl text-fluor uppercase">
                Unggah Dokumen Materi Baru
              </h3>
            </div>

            {errorMsg && (
              <div className="p-3 border border-alert bg-alert/10 text-alert text-xs font-mono flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="materialTitle"
                  className="font-mono text-xs text-fluor/70 block"
                >
                  Judul Modul / Berkas
                </label>
                <Input
                  id="materialTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Modul Praktikum Troubleshooting VLAN 802.1Q"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="materialCat"
                    className="font-mono text-xs text-fluor/70 block"
                  >
                    Kategori
                  </label>
                  <select
                    id="materialCat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 border border-fluor/30 bg-night px-3 font-mono text-xs text-fluor focus:border-caution focus:outline-none"
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
                    className="font-mono text-xs text-fluor/70 block"
                  >
                    Format &amp; Ukuran
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="materialFmt"
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      placeholder="PDF"
                      className="w-20"
                    />
                    <Input
                      id="materialSize"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="2.5 MB"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="materialDesc"
                  className="font-mono text-xs text-fluor/70 block"
                >
                  Ringkasan Materi
                </label>
                <textarea
                  id="materialDesc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-fluor/30 bg-night p-3 font-body text-xs text-fluor placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                  placeholder="Ringkasan kompetensi atau topik yang dibahas dalam dokumen ini..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-fluor/15">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadDialog(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmitting}
                  className="space-x-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Unggah ke Perpustakaan</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
