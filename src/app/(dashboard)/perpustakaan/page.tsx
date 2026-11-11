"use client";

import * as React from "react";
import {
  BookOpen,
  Search,
  Download,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMaterials,
  createMaterial,
  type MaterialListItem,
} from "@/lib/materials/actions";

export default function PerpustakaanPage() {
  const [materials, setMaterials] = React.useState<MaterialListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("SEMUA");
  const [downloadNotice, setDownloadNotice] = React.useState<string | null>(null);

  // Dialog Unggah Materi
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("JARINGAN & SERVER");
  const [newFormat, setNewFormat] = React.useState("PDF");
  const [newSize, setNewSize] = React.useState("2.5 MB");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

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
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory =
        selectedCategory === "SEMUA" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [materials, searchTerm, selectedCategory]);

  const handleDownload = (title: string) => {
    setDownloadNotice(`Mempersiapkan unduhan: ${title}...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 2500);
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
        category: newCategory,
        fileFormat: newFormat,
        fileSize: newSize,
        fileUrl: `/materials/${newTitle.toLowerCase().replace(/\s+/g, "-")}.${newFormat.toLowerCase()}`,
        classId: null, // Perpustakaan terbuka
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
      {/* Header Perpustakaan */}
      <div className="border-b border-fluor/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-caution mb-1">
            <BookOpen className="w-5 h-5" />
            <span className="font-hud text-lg tracking-widest uppercase">
              {"//"} PERPUSTAKAAN DIGITAL KAWASAN
            </span>
          </div>
          <h1 className="font-sign text-3xl sm:text-4xl text-fluor tracking-wide uppercase">
            REPOSITORI MATERI TERBUKA
          </h1>
          <p className="font-body text-xs sm:text-sm text-fluor/70 mt-1">
            Koleksi buku teks, panduan konfigurasi lab, standar operasional, dan modul mandiri
            jurusan SIJA SMK TI BAZMA.
          </p>
        </div>

        <Button
          variant="default"
          onClick={() => setShowUploadDialog(true)}
          className="self-start sm:self-auto space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>UNGGAH MATERI</span>
        </Button>
      </div>

      {/* Notifikasi Download Toast */}
      {downloadNotice && (
        <div className="border border-ok bg-ok/10 text-ok p-3 font-mono text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Kontrol Pencarian & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-fluor/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari modul, panduan OSPF, Linux, atau SOP lab..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["SEMUA", "JARINGAN & SERVER", "VIRTUALISASI", "SISTEM OPERASI", "PEMROGRAMAN"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 border font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "border-caution text-caution bg-caution/10 font-bold"
                    : "border-fluor/20 text-fluor/70 hover:border-fluor/50 hover:text-fluor bg-night"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid Materi Pembelajaran */}
      {isLoading ? (
        <div className="p-8 border border-fluor/20 text-center font-mono text-xs text-fluor/60">
          Memuat repositori dokumen dan modul pembelajaran...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="border border-fluor/20 bg-night p-8 text-center space-y-2">
          <p className="font-mono text-xs text-fluor/50">
            Tidak ditemukan materi dengan kriteria pencarian tersebut.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="border border-fluor/30 bg-night p-5 flex flex-col justify-between space-y-4 hover:border-fluor/70 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan">{item.category}</Badge>
                  <span className="font-mono text-[11px] text-fluor/50">
                    {item.fileFormat} • {item.fileSize}
                  </span>
                </div>

                <h3 className="font-sign text-xl text-fluor uppercase tracking-wide">
                  {item.title}
                </h3>

                <p className="font-body text-xs text-fluor/70 leading-relaxed">
                  {item.description || "Tidak ada deskripsi rinci untuk dokumen ini."}
                </p>
              </div>

              <div className="pt-3 border-t border-fluor/10 flex items-center justify-between">
                <div className="font-mono text-[11px] text-fluor/50">
                  Oleh: <span className="text-fluor/80">{item.author.name}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(item.title)}
                  className="space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>UNDUH</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Unggah Materi */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 select-none">
          <div className="border border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setShowUploadDialog(false)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-fluor/20 pb-3">
              <span className="font-hud text-lg tracking-widest text-caution">
                [PERPUSTAKAAN // UNGGAH MATERI BARU]
              </span>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                DOKUMEN TERBUKA
              </h3>
            </div>

            {errorMsg && (
              <div className="p-3 border border-alert bg-alert/10 text-alert text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="materialTitle" className="font-mono text-xs text-fluor/70 block">
                  Judul Modul / Berkas:
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
                  <label htmlFor="materialCat" className="font-mono text-xs text-fluor/70 block">
                    Kategori:
                  </label>
                  <select
                    id="materialCat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 border border-fluor/30 bg-night px-3 font-mono text-xs text-fluor focus:border-caution focus:outline-none"
                  >
                    <option value="JARINGAN & SERVER">JARINGAN & SERVER</option>
                    <option value="VIRTUALISASI">VIRTUALISASI</option>
                    <option value="SISTEM OPERASI">SISTEM OPERASI</option>
                    <option value="PEMROGRAMAN">PEMROGRAMAN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="materialFmt" className="font-mono text-xs text-fluor/70 block">
                    Format & Ukuran:
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
                <label htmlFor="materialDesc" className="font-mono text-xs text-fluor/70 block">
                  Deskripsi Singkat:
                </label>
                <textarea
                  id="materialDesc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-fluor/30 bg-night p-3 font-body text-xs text-fluor placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                  placeholder="Ringkasan topik atau kompetensi yang dibahas dalam modul..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadDialog(false)}
                >
                  BATAL
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "MENYIMPAN..." : "UNGGAH KE PERPUSTAKAAN"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
