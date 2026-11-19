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
        const updated = await getThreadDetail(activeThreadId);
        setActiveThreadDetail(updated);
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
        className={`mt-3 p-4 rounded-2xl border-2 transition-all ${
          node.isBestAnswer
            ? "border-ok/50 bg-ok/10 shadow-xs"
            : "border-border bg-canvas/30"
        } ${node.depth > 1 ? "ml-4 sm:ml-8 border-l-4 border-l-primary" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 font-body text-xs pb-2 border-b border-border/40">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-sm text-text">{node.authorName}</span>
            <span className="text-text-muted text-[11px]">• Balasan Tingkat {node.depth}</span>
          </div>

          <div className="flex items-center space-x-2">
            {node.isBestAnswer ? (
              <Badge variant="ok" className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solusi Terpilih</span>
              </Badge>
            ) : (
              <button
                type="button"
                onClick={() => handleMarkBest(node.id)}
                className="text-xs text-text-muted hover:text-ok font-medium transition-colors cursor-pointer"
                title="Tandai sebagai jawaban terbaik"
              >
                Pilih sebagai Solusi
              </button>
            )}
          </div>
        </div>

        <p className="font-body text-xs sm:text-sm text-text mt-2.5 whitespace-pre-wrap leading-relaxed">
          {node.content}
        </p>

        {canReply && (
          <div className="mt-3 pt-2 border-t border-border/40 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setReplyParentId(node.id);
                const inputEl = document.getElementById("comment-input-box");
                inputEl?.focus();
              }}
              className="text-xs font-display font-semibold text-accent hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Balas Komentar</span>
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
      <div className="bg-surface rounded-3xl border-2 border-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 text-text mb-1">
            <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
              Mading Sekolah
            </h1>
          </div>
          <p className="font-body text-sm text-text-muted mt-1">
            Papan diskusi umum terbuka seluruh warga sekolah. Berbagi wawasan, berdiskusi proyek, dan tanya jawab antarkelas.
          </p>
        </div>

        <Button
          variant="default"
          onClick={() => setShowCreateDialog(true)}
          className="self-start sm:self-auto space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Topik Baru</span>
        </Button>
      </div>

      {/* Baris Filter & Kategori */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full font-display text-xs transition-all cursor-pointer ${
            filter === "all"
              ? "bg-primary text-text font-bold shadow-sm"
              : "bg-surface text-text-muted hover:text-text border border-border"
          }`}
        >
          Semua Topik ({threads.length})
        </button>
        <button
          onClick={() => setFilter("populer")}
          className={`px-4 py-1.5 rounded-full font-display text-xs transition-all cursor-pointer ${
            filter === "populer"
              ? "bg-primary text-text font-bold shadow-sm"
              : "bg-surface text-text-muted hover:text-text border border-border"
          }`}
        >
          Populer
        </button>
        <button
          onClick={() => setFilter("unanswered")}
          className={`px-4 py-1.5 rounded-full font-display text-xs transition-all cursor-pointer ${
            filter === "unanswered"
              ? "bg-primary text-text font-bold shadow-sm"
              : "bg-surface text-text-muted hover:text-text border border-border"
          }`}
        >
          Belum Terjawab
        </button>
        <button
          onClick={() => setFilter("sija")}
          className={`px-4 py-1.5 rounded-full font-display text-xs transition-all cursor-pointer ${
            filter === "sija"
              ? "bg-primary text-text font-bold shadow-sm"
              : "bg-surface text-text-muted hover:text-text border border-border"
          }`}
        >
          Praktik Kejuruan
        </button>
      </div>

      {/* Status Memuat Data */}
      {isLoading ? (
        <div className="p-12 rounded-3xl border-2 border-border bg-surface text-center font-body text-xs text-text-muted">
          Memuat diskusi mading...
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="p-12 rounded-3xl border-2 border-border bg-surface text-center font-body text-xs text-text-muted">
          Belum ada topik diskusi yang sesuai filter.
        </div>
      ) : (
        /* Daftar Kartu Thread */
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className="rounded-3xl border-2 border-border bg-surface p-5 sm:p-6 flex gap-4 hover:border-primary cursor-pointer transition-all shadow-sm group"
            >
              {/* Voting di Sisi Kiri */}
              <div className="flex flex-col items-center justify-start space-y-1 font-display text-xs select-none pr-3 border-r border-border/50">
                <button
                  type="button"
                  onClick={(e) => handleVote(thread.id, "up", e)}
                  className="p-1.5 rounded-xl hover:bg-canvas text-text-muted hover:text-text transition-colors"
                  aria-label="Upvote"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <span className="font-bold text-sm text-text">{thread.votes}</span>
                <button
                  type="button"
                  onClick={(e) => handleVote(thread.id, "down", e)}
                  className="p-1.5 rounded-xl hover:bg-canvas text-text-muted hover:text-alert transition-colors"
                  aria-label="Downvote"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Isi Konten Thread */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="peach">{thread.category}</Badge>

                  {thread.isPinned && (
                    <Badge variant="mint">Dipin</Badge>
                  )}

                  {thread.hasBestAnswer && (
                    <Badge variant="ok" className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Solusi Terverifikasi</span>
                    </Badge>
                  )}
                </div>

                <h3 className="font-display font-bold text-xl text-text group-hover:text-accent transition-colors">
                  {thread.title}
                </h3>

                <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
                  {thread.content}
                </p>

                <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 font-body text-xs text-text-muted">
                  <div className="flex items-center space-x-2">
                    <span>Oleh: <strong className="text-text">{thread.author.name}</strong></span>
                    <span>•</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-accent font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{thread.commentCount} Komentar</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL THREAD & KOMENTAR BERTINGKAT */}
      {activeThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-3xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveThreadId(null)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup Detail"
            >
              <X className="w-6 h-6" />
            </button>

            {isLoadingDetail || !activeThreadDetail ? (
              <div className="py-16 text-center font-body text-xs text-text-muted">
                Memuat percakapan dan solusi...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Thread Detail */}
                <div className="border-b border-border/50 pb-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="peach">{activeThreadDetail.category}</Badge>
                    {activeThreadDetail.hasBestAnswer && (
                      <Badge variant="ok" className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Solusi Terverifikasi</span>
                      </Badge>
                    )}
                  </div>

                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
                    {activeThreadDetail.title}
                  </h2>

                  <div className="flex items-center space-x-2 font-body text-xs text-text-muted">
                    <span>Penulis: <strong className="text-text">{activeThreadDetail.author.name}</strong></span>
                    <span>•</span>
                    <span>{new Date(activeThreadDetail.createdAt).toLocaleString("id-ID")}</span>
                  </div>

                  <div className="p-5 rounded-2xl border-2 border-border bg-canvas/30 font-body text-sm text-text leading-relaxed whitespace-pre-wrap">
                    {activeThreadDetail.content}
                  </div>
                </div>

                {/* Sesi Komentar Bertingkat */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="font-display font-bold text-base text-text">
                      Diskusi & Solusi ({activeThreadDetail.comments.length} Komentar)
                    </span>
                    <span className="font-body text-xs text-text-muted">
                      Hingga 3 Tingkat Balasan
                    </span>
                  </div>

                  {activeThreadDetail.comments.length === 0 ? (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-border text-center font-body text-xs text-text-muted">
                      Belum ada jawaban di topik ini. Jadilah yang pertama memberikan solusi!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeThreadDetail.comments.map((comment) => renderCommentNode(comment))}
                    </div>
                  )}

                  {/* Form Tulis Komentar / Balasan */}
                  <form onSubmit={handleSendComment} className="pt-4 border-t border-border/50 space-y-3">
                    <div className="flex items-center justify-between font-body text-xs">
                      <span className="text-text font-bold flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <span>
                          {replyParentId ? "Menulis Balasan Komentar" : "Tulis Jawaban / Solusi Baru"}
                        </span>
                      </span>
                      {replyParentId && (
                        <button
                          type="button"
                          onClick={() => setReplyParentId(null)}
                          className="text-alert hover:underline cursor-pointer font-medium"
                        >
                          Batal Balas
                        </button>
                      )}
                    </div>

                    <textarea
                      id="comment-input-box"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border-2 border-border bg-canvas/40 p-3.5 font-body text-xs text-text placeholder:text-text-muted focus:bg-surface focus:outline-none transition-colors"
                      placeholder="Tuliskan analisis, langkah konfigurasi, atau solusi teknis..."
                      required
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={isSubmittingComment || !commentText.trim()}
                        className="space-x-1.5 rounded-2xl font-display font-bold px-4"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingComment ? "Mengirim..." : "Kirim Komentar"}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-lg p-6 sm:p-8 space-y-5 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateDialog(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border/50 pb-3">
              <span className="font-display font-semibold text-xs text-text-muted">
                Mading Sekolah
              </span>
              <h3 className="font-display font-bold text-2xl text-text mt-0.5">
                Buat Topik Diskusi Baru
              </h3>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl border-2 border-alert/30 bg-alert/10 text-alert text-xs font-body font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTopic} className="space-y-4 font-body text-xs">
              <div className="space-y-1">
                <label htmlFor="topicTitle" className="font-display font-semibold text-text block">
                  Judul Topik Diskusi:
                </label>
                <Input
                  id="topicTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Konfigurasi VLAN Trunking pada Switch"
                  required
                  autoFocus
                  className="rounded-2xl border-2 border-border bg-canvas/40"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="topicCat" className="font-display font-semibold text-text block">
                  Kategori Topik:
                </label>
                <select
                  id="topicCat"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-11 rounded-2xl border-2 border-border bg-canvas/40 px-3 font-body text-xs text-text focus:bg-surface focus:outline-none"
                >
                  <option value="JARINGAN & SERVER">JARINGAN & SERVER</option>
                  <option value="VIRTUALISASI">VIRTUALISASI</option>
                  <option value="SISTEM OPERASI">SISTEM OPERASI</option>
                  <option value="PEMROGRAMAN & WEB">PEMROGRAMAN & WEB</option>
                  <option value="PENGUMUMAN">PENGUMUMAN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="topicContent" className="font-display font-semibold text-text block">
                  Isi Pertanyaan / Penjelasan Teknis:
                </label>
                <textarea
                  id="topicContent"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border-2 border-border bg-canvas/40 p-3.5 font-body text-xs text-text placeholder:text-text-muted focus:bg-surface focus:outline-none transition-colors"
                  placeholder="Jelaskan pertanyaan atau topik yang ingin Anda diskusikan..."
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateDialog(false)}
                  className="rounded-2xl font-display font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmittingThread}
                  className="rounded-2xl font-display font-bold"
                >
                  {isSubmittingThread ? "Menyimpan..." : "Publikasikan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
