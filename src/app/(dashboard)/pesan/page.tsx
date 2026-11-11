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
  ArrowRight,
  X,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getUserConversations,
  getClassmatesForDm,
  getOrCreateConversation,
  sendMessage,
  type ConversationDetail,
  type ClassmateOption,
} from "@/lib/chat/actions";
import type { FormattedConversationListItem } from "@/lib/chat/chat-utils";

export default function PesanPage() {
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

  // Dialog Mulai Obrolan Baru
  const [showNewChatDialog, setShowNewChatDialog] = React.useState(false);
  const [classmates, setClassmates] = React.useState<ClassmateOption[]>([]);
  const [isLoadingClassmates, setIsLoadingClassmates] = React.useState(false);
  const [searchClassmate, setSearchClassmate] = React.useState("");

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

  // Load dialog rekan sekelas saat dialog dibuka
  const handleOpenNewChatDialog = async () => {
    setShowNewChatDialog(true);
    setIsLoadingClassmates(true);
    try {
      const data = await getClassmatesForDm();
      setClassmates(data);
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

  return (
    <div className="space-y-6">
      {/* Header Halaman Pesan */}
      <div className="border-b border-fluor/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-caution mb-1">
            <MessageSquare className="w-5 h-5" />
            <span className="font-hud text-lg tracking-widest uppercase">
              {"//"} PESAN PRIBADI // DM INTRA-KELAS (2D)
            </span>
          </div>
          <h1 className="font-sign text-3xl sm:text-4xl text-fluor tracking-wide uppercase">
            INBOX PERCAKAPAN SPASIAL
          </h1>
          <p className="font-body text-xs sm:text-sm text-fluor/70 mt-1">
            Jalur komunikasi langsung antaranggota sekelas. Sesuai aturan dunia, pesan pribadi hanya
            diizinkan bagi pengguna yang berada dalam kelas yang sama.
          </p>
        </div>

        <Button
          variant="default"
          onClick={handleOpenNewChatDialog}
          className="self-start sm:self-auto space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>MULAI PESAN BARU</span>
        </Button>
      </div>

      {/* Grid Split Panel Percakapan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* KOLOM KIRI: DAFTAR INBOX (4 Kolom di Desktop) */}
        <div className="lg:col-span-4 border border-fluor/30 bg-night flex flex-col">
          {/* Header & Filter Pencarian */}
          <div className="p-3.5 border-b border-fluor/20 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-caution uppercase">
                DAFTAR OBROLAN ({conversations.length})
              </span>
              <Badge variant="cyan">SEKELAS SAJA</Badge>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-fluor/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau kelas..."
                className="pl-8 h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* List Item Percakapan */}
          <div className="flex-1 overflow-y-auto divide-y divide-fluor/10 max-h-[500px]">
            {isLoadingList ? (
              <div className="p-6 text-center font-mono text-xs text-fluor/50">
                Memuat percakapan...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2 font-mono text-xs text-fluor/50">
                <p>Belum ada obrolan aktif.</p>
                <button
                  type="button"
                  onClick={handleOpenNewChatDialog}
                  className="text-caution hover:underline uppercase text-[11px]"
                >
                  [+ Mulai Percakapan Baru]
                </button>
              </div>
            ) : (
              filteredConversations.map((item) => {
                const isActive = item.id === activeConversationId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectConversation(item)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-caution/10 border border-caution"
                        : "hover:bg-fluor/[0.03] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                      <span className="font-bold text-fluor truncate max-w-[150px]">
                        {item.otherUser.displayName}
                      </span>
                      <span className="text-fluor/50 text-[10px]">
                        {item.lastMessage
                          ? new Date(item.lastMessage.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-fluor/60 mb-1.5">
                      <span className="text-neon-cyan">@{item.otherUser.username}</span>
                      <span>•</span>
                      <span>{item.classCode}</span>
                      {item.otherUser.seatIndex !== null && (
                        <>
                          <span>•</span>
                          <span className="text-caution font-semibold">
                            MEJA #{String(item.otherUser.seatIndex + 1).padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="font-body text-xs text-fluor/70 truncate">
                      {item.lastMessage ? (
                        <>
                          {item.lastMessage.isSelf && (
                            <span className="text-caution font-mono mr-1">Anda:</span>
                          )}
                          {item.lastMessage.content}
                        </>
                      ) : (
                        <span className="italic text-fluor/40">Belum ada pesan terkirim.</span>
                      )}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM KANAN: PANEL OBROLAN AKTIF (8 Kolom di Desktop) */}
        <div className="lg:col-span-8 border border-fluor/30 bg-night flex flex-col justify-between">
          {activeConversation ? (
            <>
              {/* Header Lawan Bicara */}
              <div className="p-4 border-b border-fluor/20 flex flex-wrap items-center justify-between gap-3 bg-night/95">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 border border-caution bg-night flex items-center justify-center text-caution">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-sign text-xl text-fluor uppercase tracking-wide">
                        {activeConversation.otherUser.displayName || activeConversation.otherUser.name}
                      </h3>
                      <Badge variant="cyan">{activeConversation.otherUser.role || "STUDENT"}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-xs text-fluor/60">
                      <span>@{activeConversation.otherUser.username || "siswa"}</span>
                      <span>•</span>
                      <span>KELAS: {activeConversation.className || activeConversation.classCode}</span>
                      {activeConversation.otherUser.seatIndex !== null && activeConversation.otherUser.seatIndex !== undefined && (
                        <>
                          <span>•</span>
                          <span className="text-caution font-bold">
                            MEJA #{String(activeConversation.otherUser.seatIndex + 1).padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-ok text-xs font-mono flex items-center space-x-1.5 border border-ok/40 bg-ok/5 px-2.5 py-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SEKELAS</span>
                  </span>
                  <Link href={`/dunia/kelas/${activeConversation.classId}`}>
                    <Button variant="outline" size="sm" className="space-x-1 text-xs">
                      <Compass className="w-3.5 h-3.5" />
                      <span>KUNJUNGI DI 3D</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Error Notice */}
              {chatError && (
                <div className="m-3 p-3 border border-alert bg-alert/10 text-alert font-mono text-xs">
                  {chatError}
                </div>
              )}

              {/* Area Percakapan (Balon Chat) */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px] bg-night/80">
                {isLoadingChat ? (
                  <div className="py-12 text-center font-mono text-xs text-fluor/50">
                    Memuat riwayat percakapan...
                  </div>
                ) : activeConversation.messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <p className="font-sign text-lg text-fluor/60 uppercase">
                      RUANG PERCAKAPAN DIMULAI
                    </p>
                    <p className="font-body text-xs text-fluor/40 max-w-sm mx-auto">
                      Sapa rekan sekelas Anda untuk berdiskusi seputar materi lab, tugas kelompok, atau
                      pertukaran modul praktik.
                    </p>
                  </div>
                ) : (
                  activeConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`p-3 max-w-[80%] text-xs font-body leading-relaxed border ${
                          msg.isSelf
                            ? "border-caution/50 bg-caution/10 text-fluor"
                            : "border-neon-cyan/40 bg-neon-cyan/10 text-fluor"
                        }`}
                      >
                        <div className="font-mono text-[10px] text-fluor/50 mb-1 flex items-center space-x-2">
                          <span className={msg.isSelf ? "text-caution font-bold" : "text-neon-cyan font-bold"}>
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
              <form onSubmit={handleSendMessage} className="p-3 border-t border-fluor/20 bg-night/95 flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ketik pesan santai dan jelas untuk rekan sekelas..."
                  className="font-mono text-xs flex-1"
                  disabled={isSending}
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSending || !inputMessage.trim()}
                  className="space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "MENGIRIM..." : "KIRIM"}</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 border border-fluor/30 flex items-center justify-center text-fluor/40">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sign text-2xl uppercase text-fluor">
                  PILIH PERCAKAPAN
                </h3>
                <p className="font-body text-xs text-fluor/60 max-w-sm">
                  Pilih salah satu obrolan dari daftar sebelah kiri atau mulai pesan baru dengan rekan sekelas Anda.
                </p>
              </div>
              <Button variant="default" size="sm" onClick={handleOpenNewChatDialog} className="space-x-2">
                <Plus className="w-3.5 h-3.5" />
                <span>MULAI PESAN BARU</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG PILIH REKAN SEKELAS (MULAI PESAN BARU) */}
      {showNewChatDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-xs select-none">
          <div className="border-2 border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowNewChatDialog(false)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor p-1 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-fluor/20 pb-3">
              <span className="font-hud text-lg tracking-widest text-caution">
                [DM INTRA-KELAS // PILIH REKAN SEKELAS]
              </span>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                DAFTAR TEMAN KELAS
              </h3>
              <p className="font-mono text-xs text-fluor/60">
                Hanya menampilkan murid dan pengajar dari kelas yang Anda ikuti.
              </p>
            </div>

            {/* Input Pencarian Rekan */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3.5 text-fluor/40" />
              <Input
                value={searchClassmate}
                onChange={(e) => setSearchClassmate(e.target.value)}
                placeholder="Cari rekan sekelas berdasarkan nama atau kelas..."
                className="pl-9 font-mono text-xs"
                autoFocus
              />
            </div>

            {/* Daftar Rekan */}
            <div className="flex-1 overflow-y-auto divide-y divide-fluor/10 max-h-64 border border-fluor/20">
              {isLoadingClassmates ? (
                <div className="p-6 text-center font-mono text-xs text-fluor/50">
                  Memuat daftar rekan sekelas...
                </div>
              ) : filteredClassmates.length === 0 ? (
                <div className="p-6 text-center font-mono text-xs text-fluor/50">
                  Tidak ditemukan rekan sekelas dengan nama tersebut.
                </div>
              ) : (
                filteredClassmates.map((cm) => (
                  <div
                    key={`${cm.classId}-${cm.userId}`}
                    onClick={() => handleStartChatWithClassmate(cm)}
                    className="p-3 hover:bg-caution/10 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="font-sign text-base text-fluor uppercase group-hover:text-caution transition-colors">
                        {cm.displayName}
                      </div>
                      <div className="font-mono text-[11px] text-fluor/60 flex items-center space-x-2">
                        <span>@{cm.username}</span>
                        <span>•</span>
                        <span>{cm.className}</span>
                        {cm.seatIndex !== null && (
                          <>
                            <span>•</span>
                            <span className="text-caution font-bold">
                              MEJA #{String(cm.seatIndex + 1).padStart(2, "0")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-fluor/40 group-hover:text-caution transition-colors" />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewChatDialog(false)}>
                TUTUP
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

