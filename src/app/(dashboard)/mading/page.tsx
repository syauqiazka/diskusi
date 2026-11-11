"use client";

import * as React from "react";
import {
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Plus,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ThreadItem {
  id: string;
  title: string;
  summary: string;
  author: string;
  category: string;
  votes: number;
  commentsCount: number;
  hasBestAnswer?: boolean;
  timeAgo: string;
}

const initialThreads: ThreadItem[] = [
  {
    id: "th-1",
    title: "Konfigurasi BGP Routing Multi-Homing untuk Praktik Lab Komputer",
    summary:
      "Bagaimana cara menetapkan prefix list dan local preference agar jalur gateway utama otomatis beralih saat salah satu ISP down?",
    author: "Rizky_SIJA",
    category: "JARINGAN & SERVER",
    votes: 18,
    commentsCount: 7,
    hasBestAnswer: true,
    timeAgo: "1 jam yang lalu",
  },
  {
    id: "th-2",
    title: "Rekomendasi Lingkungan Docker Container untuk Simulasi MikroTik CHR",
    summary:
      "Apakah lebih efisien menjalankan MikroTik CHR di atas Proxmox VE atau langsung melalui Docker container pada server lab?",
    author: "Budi_Santoso",
    category: "VIRTUALISASI",
    votes: 12,
    commentsCount: 4,
    hasBestAnswer: false,
    timeAgo: "3 jam yang lalu",
  },
  {
    id: "th-3",
    title: "Jadwal Pembersihan Lorong & Pengecekan Rak Server Malam Hari",
    summary:
      "Pemberitahuan kepada seluruh asisten lab SIJA terkait jadwal inventarisasi kabel patch cord dan switch core di Gedung Sekolah LT 2.",
    author: "Asisten_Lab",
    category: "PENGUMUMAN",
    votes: 24,
    commentsCount: 11,
    hasBestAnswer: false,
    timeAgo: "6 jam yang lalu",
  },
];

export default function MadingPage() {
  const [threads, setThreads] = React.useState<ThreadItem[]>(initialThreads);
  const [filter, setFilter] = React.useState<"all" | "populer" | "unanswered" | "sija">("all");
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("JARINGAN & SERVER");
  const [newSummary, setNewSummary] = React.useState("");

  const handleVote = (id: string, delta: number) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, votes: Math.max(0, t.votes + delta) } : t))
    );
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const newThread: ThreadItem = {
      id: `th-${Date.now()}`,
      title: newTitle.trim(),
      summary: newSummary.trim(),
      author: "Saya (Siswa)",
      category: newCategory,
      votes: 1,
      commentsCount: 0,
      hasBestAnswer: false,
      timeAgo: "Baru saja",
    };

    setThreads([newThread, ...threads]);
    setNewTitle("");
    setNewSummary("");
    setShowCreateDialog(false);
  };

  const filteredThreads = React.useMemo(() => {
    if (filter === "populer") {
      return [...threads].sort((a, b) => b.votes - a.votes);
    }
    if (filter === "unanswered") {
      return threads.filter((t) => !t.hasBestAnswer);
    }
    if (filter === "sija") {
      return threads.filter((t) => t.category.includes("JARINGAN") || t.category.includes("VIRTUALISASI"));
    }
    return threads;
  }, [threads, filter]);

  return (
    <div className="space-y-8">
      {/* Header Mading */}
      <div className="border-b border-fluor/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-caution mb-1">
            <LayoutGrid className="w-5 h-5" />
            <span className="font-hud text-lg tracking-widest uppercase">
              {"//"} PAPAN PENGUMUMAN BESAR (MADING)
            </span>
          </div>
          <h1 className="font-sign text-3xl sm:text-4xl text-fluor tracking-wide uppercase">
            DISKUSI GLOBAL KAWASAN
          </h1>
          <p className="font-body text-xs sm:text-sm text-fluor/70 mt-1">
            Papan diskusi terbuka seluruh civitas SMK TI BAZMA. Berbagi pengalaman teknis, bertanya
            solusi lab, dan mendiskusikan topik antarkelas.
          </p>
        </div>

        <Button
          variant="default"
          onClick={() => setShowCreateDialog(true)}
          className="self-start sm:self-auto space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>BUAT TOPIK BARU</span>
        </Button>
      </div>

      {/* Baris Filter & Kategori */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 border uppercase tracking-wider transition-colors cursor-pointer ${
            filter === "all"
              ? "border-caution text-caution bg-caution/10 font-bold"
              : "border-fluor/20 text-fluor/70 hover:border-fluor/50 hover:text-fluor bg-night"
          }`}
        >
          SEMUA TOPIK ({threads.length})
        </button>
        <button
          onClick={() => setFilter("populer")}
          className={`px-3 py-1.5 border uppercase tracking-wider transition-colors cursor-pointer ${
            filter === "populer"
              ? "border-caution text-caution bg-caution/10 font-bold"
              : "border-fluor/20 text-fluor/70 hover:border-fluor/50 hover:text-fluor bg-night"
          }`}
        >
          POPULER
        </button>
        <button
          onClick={() => setFilter("unanswered")}
          className={`px-3 py-1.5 border uppercase tracking-wider transition-colors cursor-pointer ${
            filter === "unanswered"
              ? "border-caution text-caution bg-caution/10 font-bold"
              : "border-fluor/20 text-fluor/70 hover:border-fluor/50 hover:text-fluor bg-night"
          }`}
        >
          BELUM TERJAWAB
        </button>
        <button
          onClick={() => setFilter("sija")}
          className={`px-3 py-1.5 border uppercase tracking-wider transition-colors cursor-pointer ${
            filter === "sija"
              ? "border-caution text-caution bg-caution/10 font-bold"
              : "border-fluor/20 text-fluor/70 hover:border-fluor/50 hover:text-fluor bg-night"
          }`}
        >
          PRAKTIK SIJA
        </button>
      </div>

      {/* Daftar Kartu Thread Sesuai DESIGN.md */}
      <div className="space-y-4">
        {filteredThreads.map((thread) => (
          <div
            key={thread.id}
            className="border border-fluor/30 bg-night p-4 sm:p-5 flex gap-4 hover:border-fluor/60 transition-colors"
          >
            {/* Voting di Sisi Kiri */}
            <div className="flex flex-col items-center justify-start space-y-1 font-mono text-xs select-none pr-3 border-r border-fluor/15">
              <button
                onClick={() => handleVote(thread.id, 1)}
                className="p-1 hover:text-caution transition-colors text-fluor/50"
                aria-label="Upvote"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className="font-bold text-sm text-caution">{thread.votes}</span>
              <button
                onClick={() => handleVote(thread.id, -1)}
                className="p-1 hover:text-alert transition-colors text-fluor/50"
                aria-label="Downvote"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Konten Thread */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider border border-fluor/30 bg-fluor/5 text-fluor">
                  {thread.category}
                </span>

                {thread.hasBestAnswer && (
                  <span className="px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider border border-ok/60 bg-ok/10 text-ok flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>JAWABAN TERBAIK</span>
                  </span>
                )}
              </div>

              <h3 className="font-sign text-xl text-fluor uppercase tracking-wide">
                {thread.title}
              </h3>

              <p className="font-body text-xs sm:text-sm text-fluor/75 leading-relaxed">
                {thread.summary}
              </p>

              <div className="pt-3 border-t border-fluor/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-fluor/50">
                <div className="flex items-center space-x-2">
                  <span>Oleh: <span className="text-fluor/80">{thread.author}</span></span>
                  <span>•</span>
                  <span>{thread.timeAgo}</span>
                </div>

                <div className="flex items-center space-x-1.5 text-neon-cyan">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{thread.commentsCount} Komentar</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog Buat Topik Baru */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85">
          <div className="border border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setShowCreateDialog(false)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-fluor/20 pb-3">
              <span className="font-hud text-lg tracking-widest text-caution">
                [MADING // BUAT TOPIK BARU]
              </span>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                DISKUSI GLOBAL
              </h3>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="topicTitle" className="font-mono text-xs text-fluor/70 block">
                  Judul Topik Diskusi:
                </label>
                <Input
                  id="topicTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Konfigurasi VLAN Trunking pada Switch Cisco"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="topicCat" className="font-mono text-xs text-fluor/70 block">
                  Kategori Topik:
                </label>
                <select
                  id="topicCat"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-11 border border-fluor/30 bg-night px-3 font-mono text-xs text-fluor focus:border-caution focus:outline-none"
                >
                  <option value="JARINGAN & SERVER">JARINGAN & SERVER</option>
                  <option value="VIRTUALISASI">VIRTUALISASI</option>
                  <option value="PEMROGRAMAN & WEB">PEMROGRAMAN & WEB</option>
                  <option value="PENGUMUMAN">PENGUMUMAN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="topicSummary" className="font-mono text-xs text-fluor/70 block">
                  Isi Pertanyaan / Penjelasan Ringkas:
                </label>
                <textarea
                  id="topicSummary"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  rows={4}
                  className="w-full border border-fluor/30 bg-night p-3 font-body text-xs text-fluor placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                  placeholder="Jelaskan pertanyaan atau topik diskusi yang ingin Anda bahas..."
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateDialog(false)}
                >
                  BATAL
                </Button>
                <Button type="submit" variant="default" size="sm">
                  PUBLIKASIKAN KE MADING
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
