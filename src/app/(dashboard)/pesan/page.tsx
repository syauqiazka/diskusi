"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Search,
  User,
  Users,
  ArrowRight,
  X,
  Compass,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getUserConversations,
  getClassmatesForDm,
  getSchoolStudentsDirectory,
  getOrCreateConversation,
  connectAndStartChat,
  sendMessage,
  type ConversationDetail,
  type ClassmateOption,
  type SchoolStudentItem,
} from "@/lib/chat/actions";
import { authClient } from "@/lib/auth/auth-client";
import type { FormattedConversationListItem } from "@/lib/chat/chat-utils";

export default function PesanPage() {
  const { data: session } = authClient.useSession();
  const [conversations, setConversations] = React.useState<FormattedConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [activeConversation, setActiveConversation] = React.useState<ConversationDetail | null>(null);
  const [isLoadingList, setIsLoadingList] = React.useState(true);
  const [isLoadingChat, setIsLoadingChat] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Pesan input
  const [inputMessage, setInputMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);

  // Dialog Mulai Obrolan Baru & Direktori Teman
  const [showNewChatDialog, setShowNewChatDialog] = React.useState(false);
  const [dialogTab, setDialogTab] = React.useState<"classmates" | "directory">("classmates");
  const [classmates, setClassmates] = React.useState<ClassmateOption[]>([]);
  const [allStudents, setAllStudents] = React.useState<SchoolStudentItem[]>([]);
  const [isLoadingClassmates, setIsLoadingClassmates] = React.useState(false);
  const [searchClassmate, setSearchClassmate] = React.useState("");
  const [connectingUserId, setConnectingUserId] = React.useState<string | null>(null);

  // Load daftar inbox percakapan
  const fetchConversations = React.useCallback(async () => {
    try {
      const data = await getUserConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        // Otomatis pilih percakapan pertama jika belum ada yang aktif
        const first = data[0];
        setActiveConversationId(first.id);
        const res = await getOrCreateConversation(first.classId, first.otherUser.id);
        if (res.success && res.conversation) {
          setActiveConversation(res.conversation);
        }
      }
    } catch (err) {
      console.error("Gagal memuat percakapan:", err);
    } finally {
      setIsLoadingList(false);
    }
  }, [activeConversationId]);

  React.useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchConversations();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchConversations]);

  // Load dialog rekan sekelas & direktori siswa saat dialog dibuka
  const handleOpenNewChatDialog = async () => {
    setShowNewChatDialog(true);
    setIsLoadingClassmates(true);
    try {
      const [classmatesData, allStudentsData] = await Promise.all([
        getClassmatesForDm(),
        getSchoolStudentsDirectory(),
      ]);
      setClassmates(classmatesData);
      setAllStudents(allStudentsData);
    } catch {
      console.error("Gagal mengambil data rekan sekelas.");
    } finally {
      setIsLoadingClassmates(false);
    }
  };

  // Pilih percakapan dari daftar inbox
  const handleSelectConversation = async (item: FormattedConversationListItem) => {
    setActiveConversationId(item.id);
    setIsLoadingChat(true);
    setChatError(null);

    // Optimis hilangkan tanda merah notifikasi pesan belum dibaca
    setConversations((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c))
    );

    try {
      const res = await getOrCreateConversation(item.classId, item.otherUser.id);
      if (res.success && res.conversation) {
        setActiveConversation(res.conversation);
      } else {
        setChatError(res.error || "Gagal membuka percakapan.");
      }
    } catch {
      setChatError("Terjadi kesalahan jaringan saat memuat obrolan.");
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Mulai obrolan dengan siapapun dari direktori siswa (otomatis terhubung & buat kelas bersama jika perlu)
  const handleStartDirectChat = async (targetUserId: string) => {
    setConnectingUserId(targetUserId);
    setChatError(null);
    try {
      const res = await connectAndStartChat(targetUserId);
      if (res.success && res.conversation) {
        setShowNewChatDialog(false);
        setActiveConversationId(res.conversation.id);
        setActiveConversation(res.conversation);
        await fetchConversations();
      } else {
        alert(res.error || "Gagal menghubungkan obrolan.");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat menghubungkan obrolan.");
    } finally {
      setConnectingUserId(null);
    }
  };

  // Mulai percakapan dengan rekan sekelas dari dialog
  const handleStartChatWithClassmate = async (cm: ClassmateOption) => {
    setShowNewChatDialog(false);
    setIsLoadingChat(true);
    setChatError(null);
    try {
      const res = await getOrCreateConversation(cm.classId, cm.userId);
      if (res.success && res.conversation) {
        setActiveConversationId(res.conversation.id);
        setActiveConversation(res.conversation);
        await fetchConversations();
      } else {
        setChatError(res.error || "Gagal memulai obrolan.");
      }
    } catch {
      setChatError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Kirim pesan
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    try {
      setIsSending(true);
      const res = await sendMessage({
        classId: activeConversation.classId,
        targetUserId: activeConversation.otherUser.id,
        content: inputMessage.trim(),
      });

      if (res.success && res.message) {
        setActiveConversation((prev) =>
          prev ? { ...prev, messages: [...prev.messages, res.message!] } : null
        );
        setInputMessage("");
        await fetchConversations();
      } else {
        setChatError(res.error || "Gagal mengirim pesan.");
      }
    } catch {
      setChatError("Terjadi kesalahan sistem.");
    } finally {
      setIsSending(false);
    }
  };

  // Filter daftar inbox
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUser.name.toLowerCase().includes(q) ||
        c.otherUser.username.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Filter rekan di modal
  const filteredClassmates = React.useMemo(() => {
    if (!searchClassmate.trim()) return classmates;
    const q = searchClassmate.toLowerCase();
    return classmates.filter(
      (cm) =>
        cm.name.toLowerCase().includes(q) ||
        cm.username.toLowerCase().includes(q) ||
        cm.className.toLowerCase().includes(q)
    );
  }, [classmates, searchClassmate]);

  const filteredAllStudents = React.useMemo(() => {
    // Kecualikan diri sendiri agar tidak mencari akun sendiri
    const list = allStudents.filter((s) => s.userId !== session?.user?.id);
    if (!searchClassmate.trim()) return list;
    const q = searchClassmate.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.displayName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.classes.some((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
    );
  }, [allStudents, searchClassmate, session?.user?.id]);

  return (
    <div className="space-y-6">
      {/* Header Halaman Pesan */}
      <div className="bg-surface rounded-3xl border-2 border-border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-text mb-1">
            <div className="w-9 h-9 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
              Pesan Pribadi
            </h1>
          </div>
          <p className="font-body text-sm text-text-muted mt-1">
            Komunikasi langsung dengan rekan sekelas dan guru pembimbing sekolah.
          </p>
        </div>

        <Button
          variant="default"
          onClick={handleOpenNewChatDialog}
          className="self-start sm:self-auto space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Kirim Pesan Baru</span>
        </Button>
      </div>

      {/* Grid Split Panel Percakapan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* KOLOM KIRI: DAFTAR INBOX (4 Kolom di Desktop) */}
        <div className="lg:col-span-4 bg-surface rounded-3xl border-2 border-border shadow-sm flex flex-col overflow-hidden">
          {/* Header & Filter Pencarian */}
          <div className="p-4 border-b border-border/50 space-y-3 bg-surface">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm text-text">
                Daftar Obrolan ({conversations.length})
              </span>
              <Badge variant="mint">Sekelas</Badge>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari teman atau kelas..."
                className="pl-9 h-10 text-xs rounded-2xl border-2 border-border bg-canvas/40"
              />
            </div>
          </div>

          {/* List Item Percakapan */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/30 max-h-[520px]">
            {isLoadingList ? (
              <div className="p-8 text-center font-body text-xs text-text-muted">
                Memuat obrolan...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3 font-body text-xs text-text-muted">
                <p>Belum ada obrolan aktif.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenNewChatDialog}
                  className="rounded-2xl font-display font-semibold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Mulai Pesan Baru
                </Button>
              </div>
            ) : (
              filteredConversations.map((item) => {
                const isActive = item.id === activeConversationId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectConversation(item)}
                    className={`p-4 cursor-pointer transition-all ${
                      isActive
                        ? "bg-primary/15 border-l-4 border-primary"
                        : "hover:bg-canvas/60 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between font-body text-xs mb-1">
                      <div className="flex items-center space-x-2 truncate max-w-[180px]">
                        {item.unreadCount > 0 && (
                          <span className="w-2.5 h-2.5 rounded-full bg-alert inline-block shrink-0 shadow-sm" />
                        )}
                        <span className="font-display font-bold text-sm text-text truncate">
                          {item.otherUser.displayName}
                        </span>
                        {item.unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-alert text-white rounded-full font-display font-bold text-[10px] shrink-0">
                            {item.unreadCount} baru
                          </span>
                        )}
                      </div>
                      <span className="text-text-muted text-[11px] font-medium">
                        {item.lastMessage
                          ? new Date(item.lastMessage.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-body text-[11px] text-text-muted mb-1.5">
                      <span className="text-accent font-medium">@{item.otherUser.username}</span>
                      <span>•</span>
                      <span>{item.classCode}</span>
                      {item.otherUser.seatIndex !== null && (
                        <>
                          <span>•</span>
                          <span className="text-text font-semibold">
                            Meja #{String(item.otherUser.seatIndex + 1).padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="font-body text-xs text-text-muted truncate">
                      {item.lastMessage ? (
                        <>
                          {item.lastMessage.isSelf && (
                            <span className="text-text font-semibold mr-1">Anda:</span>
                          )}
                          {item.lastMessage.content}
                        </>
                      ) : (
                        <span className="italic text-text-muted/70">Belum ada pesan terkirim.</span>
                      )}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM KANAN: PANEL OBROLAN AKTIF (8 Kolom di Desktop) */}
        <div className="lg:col-span-8 bg-surface rounded-3xl border-2 border-border shadow-sm flex flex-col justify-between overflow-hidden">
          {activeConversation ? (
            <>
              {/* Header Lawan Bicara */}
              <div className="p-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-3 bg-surface">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-secondary/30 flex items-center justify-center text-text border border-secondary/50 font-display font-bold">
                    <User className="w-5 h-5 text-text" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-display font-bold text-lg text-text">
                        {activeConversation.otherUser.displayName || activeConversation.otherUser.name}
                      </h3>
                      <Badge variant="peach">{activeConversation.otherUser.role || "SISWA"}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 font-body text-xs text-text-muted">
                      <span className="text-accent font-medium">@{activeConversation.otherUser.username || "siswa"}</span>
                      <span>•</span>
                      <span>Kelas: {activeConversation.className || activeConversation.classCode}</span>
                      {activeConversation.otherUser.seatIndex !== null && activeConversation.otherUser.seatIndex !== undefined && (
                        <>
                          <span>•</span>
                          <span className="text-text font-semibold">
                            Meja #{String(activeConversation.otherUser.seatIndex + 1).padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="mint" className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sekelas</span>
                  </Badge>
                  <Link href={`/dunia/kelas/${activeConversation.classId}`}>
                    <Button variant="outline" size="sm" className="rounded-2xl space-x-1.5 text-xs font-display font-semibold">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Kunjungi di 3D</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Error Notice */}
              {chatError && (
                <div className="m-3 p-3.5 rounded-2xl border-2 border-alert/30 bg-alert/10 text-alert font-body text-xs">
                  {chatError}
                </div>
              )}

              {/* Area Percakapan (Balon Chat) */}
              <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[440px] bg-canvas/30">
                {isLoadingChat ? (
                  <div className="py-12 text-center font-body text-xs text-text-muted">
                    Memuat riwayat obrolan...
                  </div>
                ) : activeConversation.messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 text-text flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="font-display font-bold text-base text-text">
                      Mulai Percakapan Baru!
                    </p>
                    <p className="font-body text-xs text-text-muted max-w-sm mx-auto">
                      Sapa rekan sekelas Anda untuk berdiskusi seputar materi pelajaran, tugas kelompok, atau kegiatan sekolah.
                    </p>
                  </div>
                ) : (
                  activeConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`p-3.5 max-w-[80%] rounded-2xl text-xs font-body leading-relaxed shadow-sm ${
                          msg.isSelf
                            ? "bg-primary text-text font-medium rounded-tr-sm"
                            : "bg-surface border-2 border-border text-text rounded-tl-sm"
                        }`}
                      >
                        <div className="text-[10px] text-text-muted mb-1 flex items-center space-x-2 font-medium">
                          <span className={msg.isSelf ? "text-text font-bold" : "text-accent font-bold"}>
                            {msg.isSelf ? "Anda" : msg.senderName}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form Input Teks Pesan */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border/50 bg-surface flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ketik pesan santai dan jelas untuk rekan sekelas..."
                  className="font-body text-xs flex-1 rounded-2xl border-2 border-border bg-canvas/40 focus:bg-surface"
                  disabled={isSending}
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSending || !inputMessage.trim()}
                  className="space-x-1.5 rounded-2xl font-display font-bold px-4"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Mengirim..." : "Kirim"}</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-secondary/20 flex items-center justify-center text-text">
                <MessageSquare className="w-8 h-8 text-text" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-2xl text-text">
                  Pilih Percakapan
                </h3>
                <p className="font-body text-xs text-text-muted max-w-sm">
                  Pilih salah satu obrolan dari daftar sebelah kiri atau mulai pesan baru dengan rekan sekelas Anda.
                </p>
              </div>
              <Button variant="default" size="sm" onClick={handleOpenNewChatDialog} className="space-x-2 rounded-2xl font-display font-bold">
                <Plus className="w-4 h-4" />
                <span>Mulai Pesan Baru</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG PILIH REKAN SEKELAS (MULAI PESAN BARU) */}
      {showNewChatDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-lg p-6 space-y-5 relative max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowNewChatDialog(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border/50 pb-4">
              <div className="flex items-center space-x-2 text-text mb-1">
                <div className="w-7 h-7 rounded-full bg-secondary/30 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-text" />
                </div>
                <span className="font-display font-semibold text-xs text-text-muted">
                  Mulai Obrolan Baru
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl text-text">
                Pilih Teman Belajar
              </h3>
              <p className="font-body text-xs text-text-muted mt-1">
                Pilih rekan sekelas untuk mulai mengobrol langsung, atau temukan siswa sekolah lainnya.
              </p>

              {/* Tab Pemilih: Teman Sekelas vs Direktori Siswa */}
              <div className="flex p-1 bg-canvas rounded-2xl border border-border mt-3 gap-1">
                <button
                  type="button"
                  onClick={() => setDialogTab("classmates")}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-display text-xs transition-all ${
                    dialogTab === "classmates"
                      ? "bg-surface text-text font-bold shadow-sm"
                      : "text-text-muted hover:text-text font-medium"
                  }`}
                >
                  Rekan Sekelas ({filteredClassmates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDialogTab("directory")}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-display text-xs transition-all ${
                    dialogTab === "directory"
                      ? "bg-primary text-text font-bold shadow-sm"
                      : "text-text-muted hover:text-text font-medium"
                  }`}
                >
                  Direktori Siswa ({filteredAllStudents.length})
                </button>
              </div>
            </div>

            {/* Input Pencarian Rekan */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-text-muted" />
              <Input
                value={searchClassmate}
                onChange={(e) => setSearchClassmate(e.target.value)}
                placeholder={
                  dialogTab === "classmates"
                    ? "Cari rekan sekelas berdasarkan nama..."
                    : "Cari siswa berdasarkan nama atau username..."
                }
                className="pl-9 font-body text-xs rounded-2xl border-2 border-border bg-canvas/40"
                autoFocus
              />
            </div>

            {/* Konten Tab 1: Rekan Sekelas */}
            {dialogTab === "classmates" && (
              <div className="flex-1 overflow-y-auto divide-y divide-border/30 max-h-64 rounded-2xl border-2 border-border p-1 bg-canvas/20">
                {isLoadingClassmates ? (
                  <div className="p-8 text-center font-body text-xs text-text-muted">
                    Memuat daftar rekan sekelas...
                  </div>
                ) : filteredClassmates.length === 0 ? (
                  <div className="p-6 text-center space-y-3 font-body text-xs">
                    <div className="text-text-muted">
                      Belum ada rekan sekelas yang ditemukan di kelas Anda saat ini.
                    </div>
                    <div className="p-3.5 rounded-2xl border-2 border-secondary/40 bg-secondary/15 text-text text-xs text-left leading-relaxed">
                      <strong>Tips:</strong> Bergabunglah ke kelas untuk langsung terhubung dengan rekan-rekan sekelas:
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="font-bold border border-border px-2.5 py-1 rounded-xl bg-surface text-text">
                          Kode: SIJA10A (X SIJA 1)
                        </span>
                        <span className="font-bold border border-border px-2.5 py-1 rounded-xl bg-surface text-text">
                          Kode: SIJA11B (XI SIJA 2)
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogTab("directory")}
                      className="rounded-2xl font-display font-semibold text-xs"
                    >
                      Lihat Direktori Siswa Sekolah
                    </Button>
                  </div>
                ) : (
                  filteredClassmates.map((cm) => (
                    <div
                      key={`${cm.classId}-${cm.userId}`}
                      onClick={() => handleStartChatWithClassmate(cm)}
                      className="p-3 rounded-xl hover:bg-surface cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center font-display font-bold text-text">
                          {cm.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-display font-bold text-sm text-text group-hover:text-accent transition-colors">
                            {cm.displayName}
                          </div>
                          <div className="font-body text-xs text-text-muted flex items-center space-x-2">
                            <span>@{cm.username}</span>
                            <span>•</span>
                            <span>{cm.className}</span>
                            {cm.seatIndex !== null && (
                              <>
                                <span>•</span>
                                <span className="text-text font-semibold">
                                  Meja #{String(cm.seatIndex + 1).padStart(2, "0")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text transition-colors" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Konten Tab 2: Direktori Siswa Sekolah */}
            {dialogTab === "directory" && (
              <div className="flex-1 overflow-y-auto divide-y divide-border/30 max-h-64 rounded-2xl border-2 border-border p-1 bg-canvas/20">
                {isLoadingClassmates ? (
                  <div className="p-8 text-center font-body text-xs text-text-muted">
                    Memuat direktori seluruh siswa...
                  </div>
                ) : filteredAllStudents.length === 0 ? (
                  <div className="p-8 text-center font-body text-xs text-text-muted">
                    Tidak ditemukan siswa dengan kata kunci tersebut.
                  </div>
                ) : (
                  filteredAllStudents.map((student) => {
                    const isConnecting = connectingUserId === student.userId;
                    return (
                      <div
                        key={student.userId}
                        onClick={() => handleStartDirectChat(student.userId)}
                        className="p-3.5 rounded-2xl hover:bg-surface border border-transparent hover:border-border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/25 flex items-center justify-center font-display font-bold text-text shrink-0 mt-0.5">
                            {student.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-display font-bold text-sm text-text group-hover:text-accent transition-colors">
                                {student.displayName}
                              </span>
                              <span className="font-body text-xs text-text-muted">
                                @{student.username}
                              </span>
                              {student.canChatDirectly && (
                                <Badge variant="mint" className="text-[10px] py-0 px-2">
                                  Sekelas
                                </Badge>
                              )}
                            </div>
                            {student.bio && (
                              <p className="font-body text-xs text-text-muted line-clamp-1">
                                {student.bio}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {student.classes.length > 0 ? (
                                student.classes.map((cls) => (
                                  <span
                                    key={cls.id}
                                    className={`font-body text-[10px] px-2 py-0.5 rounded-full border ${
                                      cls.isShared
                                        ? "border-primary/60 text-text bg-primary/20 font-semibold"
                                        : "border-border text-text-muted bg-canvas"
                                    }`}
                                  >
                                    {cls.name} ({cls.code})
                                  </span>
                                ))
                              ) : (
                                <span className="font-body text-[10px] text-text-muted border border-border px-2 py-0.5 rounded-full bg-canvas">
                                  Belum terdaftar di kelas
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="self-end sm:self-auto shrink-0">
                          <Button
                            variant={student.canChatDirectly ? "default" : "secondary"}
                            size="sm"
                            disabled={isConnecting}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartDirectChat(student.userId);
                            }}
                            className="text-xs rounded-2xl font-display font-bold px-3 py-1.5 shadow-sm space-x-1.5"
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                <span>Menghubungkan...</span>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{student.canChatDirectly ? "Kirim Pesan" : "Mulai Obrolan"}</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-border/50">
              <span className="font-body text-xs text-text-muted">
                Pesan terhubung langsung dengan otorisasi kelas sekolah.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewChatDialog(false)}
                className="rounded-2xl font-display font-semibold text-xs px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
