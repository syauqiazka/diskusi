"use client";

import * as React from "react";
import { BookOpen, Search, Download, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MaterialItem {
  id: string;
  title: string;
  category: string;
  description: string;
  format: "PDF" | "DOCX" | "MD";
  size: string;
  author: string;
  updatedAt: string;
}

const materialsData: MaterialItem[] = [
  {
    id: "mat-1",
    title: "Buku Panduan Konfigurasi MikroTik MTCNA — SIJA BAZMA",
    category: "JARINGAN & SERVER",
    description:
      "Panduan komprehensif implementasi IP Addressing, Routing statik & dinamis, Firewall filter rules, dan Queues bandwidth management.",
    format: "PDF",
    size: "8.5 MB",
    author: "Tim Guru SIJA",
    updatedAt: "Kemarin",
  },
  {
    id: "mat-2",
    title: "Modul Praktikum Administrasi Server Linux (Debian 12)",
    category: "SISTEM OPERASI",
    description:
      "Langkah konfigurasi layanan SSH, Web Server Nginx, Database MariaDB, dan Samba file sharing pada jaringan lokal sekolah.",
    format: "PDF",
    size: "5.2 MB",
    author: "Instruktur Lab",
    updatedAt: "3 hari yang lalu",
  },
  {
    id: "mat-3",
    title: "Standard Operating Procedure (SOP) Penggunaan Lab Komputer",
    category: "DOKUMENTASI LAB",
    description:
      "Ketentuan penggunaan perangkat PC workstation, peminjaman kabel tester jaringan, dan etika keselamatan kerja di ruang praktik.",
    format: "PDF",
    size: "1.8 MB",
    author: "Kepala Lab SIJA",
    updatedAt: "1 minggu yang lalu",
  },
  {
    id: "mat-4",
    title: "Dasar Pemrograman TypeScript & Pengembangan Web Modern",
    category: "PEMROGRAMAN",
    description:
      "Pengenalan tipe data statis, interfaces, generic functions, dan arsitektur aplikasi berbasis Next.js App Router.",
    format: "PDF",
    size: "6.1 MB",
    author: "Tim Kurikulum",
    updatedAt: "2 minggu yang lalu",
  },
];

export default function PerpustakaanPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("SEMUA");
  const [downloadNotice, setDownloadNotice] = React.useState<string | null>(null);

  const filteredMaterials = React.useMemo(() => {
    return materialsData.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === "SEMUA" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleDownload = (title: string) => {
    setDownloadNotice(`Mempersiapkan unduhan: ${title}...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 2500);
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
            Koleksi modul belajar mandiri, buku panduan laboratorium komputer, dan dokumentasi teknis
            SMK TI BAZMA yang dapat diunduh bebas oleh seluruh siswa.
          </p>
        </div>

        <Badge variant="ok" className="self-start sm:self-auto">
          AKSES PUBLIK KAWASAN
        </Badge>
      </div>

      {downloadNotice && (
        <div className="p-3 border border-ok/60 bg-ok/10 text-ok text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Baris Pencarian & Kategori */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-fluor/50" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul modul atau topik materi..."
            className="pl-9"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-11 border border-fluor/30 bg-night px-4 font-mono text-xs text-fluor focus:border-caution focus:outline-none"
        >
          <option value="SEMUA">SEMUA KATEGORI</option>
          <option value="JARINGAN & SERVER">JARINGAN & SERVER</option>
          <option value="SISTEM OPERASI">SISTEM OPERASI</option>
          <option value="PEMROGRAMAN">PEMROGRAMAN</option>
          <option value="DOKUMENTASI LAB">DOKUMENTASI LAB</option>
        </select>
      </div>

      {/* Grid Materi Pembelajaran */}
      {filteredMaterials.length === 0 ? (
        <div className="border border-fluor/20 p-8 text-center space-y-3 bg-night">
          <FileText className="w-10 h-10 text-fluor/30 mx-auto" />
          <h3 className="font-sign text-lg uppercase tracking-wide text-fluor/80">
            MATERI TIDAK DITEMUKAN
          </h3>
          <p className="font-body text-xs text-fluor/60">
            Tidak ada dokumen yang cocok dengan kata kunci &quot;{searchTerm}&quot;. Coba cari dengan kata kunci lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="border border-fluor/30 bg-night p-5 space-y-4 hover:border-fluor/60 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan">{mat.category}</Badge>
                  <span className="font-mono text-xs text-fluor/50">
                    {mat.format} • {mat.size}
                  </span>
                </div>

                <div>
                  <h3 className="font-sign text-xl uppercase tracking-wide text-fluor">
                    {mat.title}
                  </h3>
                  <p className="font-body text-xs text-fluor/75 mt-1 leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-fluor/15 flex items-center justify-between">
                <div className="font-mono text-[11px] text-fluor/60">
                  <span>Penyusun: {mat.author}</span>
                  <div>Diperbarui: {mat.updatedAt}</div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(mat.title)}
                  className="space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>UNDUH</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

