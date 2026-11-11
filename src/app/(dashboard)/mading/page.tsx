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
  CornerDownRight,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getThreads,
  getThreadDetail,
  createThread,
  voteThread,
  createComment,
  markBestAnswer,
  type ThreadListItem,
  type ThreadDetail,
} from "@/lib/forum/actions";
import type { CommentTreeNode } from "@/lib/forum/forum-utils";

export default function MadingPage() {
  const [threads, setThreads] = React.useState<ThreadListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "populer" | "unanswered" | "sija">("all");
  
  // Dialog Buat Topik
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("JARINGAN & SERVER");
  const [newContent, setNewContent] = React.useState("");
  const [isSubmittingThread, setIsSubmittingThread] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Detail Thread & Komentar
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [activeThreadDetail, setActiveThreadDetail] = React.useState<ThreadDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [replyParentId, setReplyParentId] = React.useState<string | null>(null);
  const [commentText, setCommentText] = React.useState("");
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  // Ambil daftar thread mading publik
  const fetchThreads = React.useCallback(async () => {
    try {
      const res = await getThreads({ classId: null });
      setThreads(res.threads);
    } catch (err) {
      console.error("Gagal mengambil data mading:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchThreads();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchThreads]);

  // Ambil detail thread saat activeThreadId diset
  React.useEffect(() => {
    let isMounted = true;
    if (!activeThreadId) {
      Promise.resolve().then(() => {
        if (isMounted) setActiveThreadDetail(null);
      });
      return;
    }

    Promise.resolve().then(() => {
      if (isMounted) setIsLoadingDetail(true);
    });

    getThreadDetail(activeThreadId).then((res) => {
      if (isMounted) {
        setActiveThreadDetail(res);
        setIsLoadingDetail(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeThreadId]);

  const handleVote = async (id: string, direction: "up" | "down", e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      // Optimistic update
      const delta = direction === "up" ? 1 : -1;
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, votes: Math.max(0, t.votes + delta) } : t))
      );
      if (activeThreadDetail && activeThreadDetail.id === id) {
        setActiveThreadDetail((prev) =>
          prev ? { ...prev, votes: Math.max(0, prev.votes + delta) } : null
        );
      }

      const res = await voteThread({ threadId: id, direction });
      if (res.success && res.votes !== undefined) {
        setThreads((prev) =>
          prev.map((t) => (t.id === id ? { ...t, votes: res.votes! } : t))
        );
        if (activeThreadDetail && activeThreadDetail.id === id) {
          setActiveThreadDetail((prev) =>
            prev ? { ...prev, votes: res.votes! } : null
          );
        }
      }
    } catch (err) {
      console.error("Gagal melakukan voting:", err);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setIsSubmittingThread(true);
      setFormError(null);

      const res = await createThread({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        classId: null, // Mading Global
      });

      if (!res.success) {
        setFormError(res.error || "Gagal mempublikasikan thread.");
        return;
      }

      setNewTitle("");
      setNewContent("");
      setShowCreateDialog(false);
      await fetchThreads();
    } catch {
      setFormError("Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setIsSubmittingThread(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeThreadId) return;

    try {
      setIsSubmittingComment(true);
      const res = await createComment({
        threadId: activeThreadId,
        content: commentText.trim(),
        parentId: replyParentId,
      });

      if (res.success) {
        setCommentText("");
        setReplyParentId(null);
        // Refresh detail
        const updated = await getThreadDetail(activeThreadId);
        setActiveThreadDetail(updated);
        // Perbarui jumlah komentar di list
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId ? { ...t, commentCount: t.commentCount + 1 } : t
          )
        );
      }
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleMarkBest = async (commentId: string) => {
    if (!activeThreadId) return;
    try {
      const res = await markBestAnswer(commentId);
      if (res.success) {
        const updated = await getThreadDetail(activeThreadId);
        setActiveThreadDetail(updated);
        setThreads((prev) =>
          prev.map((t) => (t.id === activeThreadId ? { ...t, hasBestAnswer: true } : t))
        );
      }
    } catch (err) {
      console.error("Gagal menandai jawaban terbaik:", err);
    }
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

  // Render komentar bertingkat rekursif
  const renderCommentNode = (node: CommentTreeNode) => {
    const isLevel3 = node.depth >= 3;
    const canReply = !isLevel3;

    return (
      <div
        key={node.id}
        className={`mt-3 p-3.5 border transition-colors ${
          node.isBestAnswer
            ? "border-ok/60 bg-ok/[0.04]"
            : "border-fluor/20 bg-night/80"
        } ${node.depth > 1 ? "ml-4 sm:ml-8 border-l-2 border-l-caution/60" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] pb-2 border-b border-fluor/10">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-fluor">{node.authorName}</span>
            <span className="text-fluor/40">{"//"} Kedalaman: Lvl {node.depth}</span>
          </div>

          <div className="flex items-center space-x-2">
            {node.isBestAnswer ? (
              <span className="px-2 py-0.5 text-[10px] font-bold border border-ok/80 bg-ok/15 text-ok flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>JAWABAN TERBAIK</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleMarkBest(node.id)}
                className="text-[10px] text-fluor/50 hover:text-ok transition-colors cursor-pointer"
                title="Tandai sebagai jawaban terbaik"
              >
                [PILIH JAWABAN TERBAIK]
              </button>
            )}
          </div>
        </div>

        <p className="font-body text-xs sm:text-sm text-fluor/90 mt-2 whitespace-pre-wrap leading-relaxed">
          {node.content}
        </p>

        {canReply && (
          <div className="mt-2.5 pt-2 border-t border-fluor/10 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setReplyParentId(node.id);
                const inputEl = document.getElementById("comment-input-box");
                inputEl?.focus();
              }}
              className="text-[11px] font-mono text-neon-cyan hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <CornerDownRight className="w-3 h-3" />
              <span>BALAS KOMENTAR</span>
            </button>
          </div>
        )}

        {/* Anak balasan (rekursif) */}
        {node.replies && node.replies.length > 0 && (
          <div className="space-y-2 mt-2">
            {node.replies.map((reply) => renderCommentNode(reply))}
          </div>
        )}
      </div>
    );
  };

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

      {/* Status Memuat Data */}
      {isLoading ? (
        <div className="p-8 border border-fluor/20 text-center font-mono text-xs text-fluor/60">
          Memuat data diskusi mading kawasan...
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="p-8 border border-fluor/20 text-center font-mono text-xs text-fluor/60">
          Belum ada topik diskusi yang sesuai filter.
        </div>
      ) : (
        /* Daftar Kartu Thread */
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className="border border-fluor/30 bg-night p-4 sm:p-5 flex gap-4 hover:border-fluor/70 cursor-pointer transition-colors group"
            >
              {/* Voting di Sisi Kiri */}
              <div className="flex flex-col items-center justify-start space-y-1 font-mono text-xs select-none pr-3 border-r border-fluor/15">
                <button
                  type="button"
                  onClick={(e) => handleVote(thread.id, "up", e)}
                  className="p-1 hover:text-caution transition-colors text-fluor/50"
                  aria-label="Upvote"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <span className="font-bold text-sm text-caution">{thread.votes}</span>
                <button
                  type="button"
                  onClick={(e) => handleVote(thread.id, "down", e)}
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

                  {thread.isPinned && (
                    <span className="px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider border border-caution/60 bg-caution/10 text-caution">
                      DIPIN
                    </span>
                  )}

                  {thread.hasBestAnswer && (
                    <span className="px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider border border-ok/60 bg-ok/10 text-ok flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>JAWABAN TERBAIK</span>
                    </span>
                  )}
                </div>

                <h3 className="font-sign text-xl text-fluor uppercase tracking-wide group-hover:text-caution transition-colors">
                  {thread.title}
                </h3>

                <p className="font-body text-xs sm:text-sm text-fluor/75 leading-relaxed line-clamp-2">
                  {thread.content}
                </p>

                <div className="pt-3 border-t border-fluor/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-fluor/50">
                  <div className="flex items-center space-x-2">
                    <span>Oleh: <span className="text-fluor/80">{thread.author.name}</span></span>
                    <span>•</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-neon-cyan font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{thread.commentCount} Komentar</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL / DRAWER THREAD & KOMENTAR BERTINGKAT (MAKSIMAL 3 LEVEL) */}
      {activeThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-xs select-none">
          <div className="border-2 border-fluor/50 bg-night w-full max-w-3xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveThreadId(null)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-caution p-1 transition-colors"
              aria-label="Tutup Detail"
            >
              <X className="w-6 h-6" />
            </button>

            {isLoadingDetail || !activeThreadDetail ? (
              <div className="py-12 text-center font-mono text-xs text-fluor/60">
                Memuat percakapan dan solusi lab...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Thread Detail */}
                <div className="border-b border-fluor/20 pb-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="cyan">{activeThreadDetail.category}</Badge>
                    {activeThreadDetail.hasBestAnswer && (
                      <Badge variant="ok" className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SOLUSI TERVERIFIKASI</span>
                      </Badge>
                    )}
                  </div>

                  <h2 className="font-sign text-2xl sm:text-3xl text-fluor uppercase tracking-wide">
                    {activeThreadDetail.title}
                  </h2>

                  <div className="flex items-center space-x-2 font-mono text-xs text-fluor/60">
                    <span>Penulis: <strong className="text-fluor">{activeThreadDetail.author.name}</strong></span>
                    <span>•</span>
                    <span>{new Date(activeThreadDetail.createdAt).toLocaleString("id-ID")}</span>
                  </div>

                  <div className="p-4 border border-fluor/20 bg-fluor/[0.02] font-body text-sm text-fluor/90 leading-relaxed whitespace-pre-wrap">
                    {activeThreadDetail.content}
                  </div>
                </div>

                {/* Sesi Komentar Bertingkat */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
                    <span className="font-hud text-lg tracking-widest text-caution">
                      [DISKUSI & JAWABAN // {activeThreadDetail.comments.length} KOMENTAR UTAMA]
                    </span>
                    <span className="font-mono text-xs text-fluor/60">
                      NESTING MAX: 3 TINGKAT
                    </span>
                  </div>

                  {activeThreadDetail.comments.length === 0 ? (
                    <div className="p-6 border border-dashed border-fluor/20 text-center font-mono text-xs text-fluor/50">
                      Belum ada jawaban di thread ini. Jadilah yang pertama memberikan solusi teknis!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeThreadDetail.comments.map((comment) => renderCommentNode(comment))}
                    </div>
                  )}

                  {/* Form Tulis Komentar / Balasan */}
                  <form onSubmit={handleSendComment} className="pt-4 border-t border-fluor/20 space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-caution font-bold flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {replyParentId ? "MENULIS BALASAN KOMENTAR" : "TULIS KOMENTAR / SOLUSI BARU"}
                        </span>
                      </span>
                      {replyParentId && (
                        <button
                          type="button"
                          onClick={() => setReplyParentId(null)}
                          className="text-alert hover:underline cursor-pointer"
                        >
                          [Batal Balas]
                        </button>
                      )}
                    </div>

                    <textarea
                      id="comment-input-box"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full border border-fluor/30 bg-night p-3 font-body text-xs text-fluor placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                      placeholder="Tuliskan analisis, langkah konfigurasi, atau pertanyaan lanjutan..."
                      required
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={isSubmittingComment || !commentText.trim()}
                        className="space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingComment ? "MENGIRIM..." : "KIRIM KOMENTAR"}</span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog Buat Topik Baru */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 select-none">
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

            {formError && (
              <div className="p-3 border border-alert bg-alert/10 text-alert text-xs font-mono">
                {formError}
              </div>
            )}

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
                  <option value="SISTEM OPERASI">SISTEM OPERASI</option>
                  <option value="PEMROGRAMAN & WEB">PEMROGRAMAN & WEB</option>
                  <option value="PENGUMUMAN">PENGUMUMAN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="topicContent" className="font-mono text-xs text-fluor/70 block">
                  Isi Pertanyaan / Penjelasan Teknis:
                </label>
                <textarea
                  id="topicContent"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
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
                <Button type="submit" variant="default" size="sm" disabled={isSubmittingThread}>
                  {isSubmittingThread ? "MENYIMPAN..." : "PUBLIKASIKAN KE MADING"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
