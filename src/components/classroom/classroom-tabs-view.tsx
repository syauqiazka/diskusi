"use client";

import * as React from "react";
import {
  Users,
  MessageSquare,
  FileText,
  Pin,
  Send,
  X,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Download,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAnnouncements,
  createAnnouncement,
  type AnnouncementListItem,
} from "@/lib/announcements/actions";
import {
  getThreads,
  createThread,
  type ThreadListItem,
} from "@/lib/forum/actions";
import {
  getMaterials,
  createMaterial,
  type MaterialListItem,
} from "@/lib/materials/actions";
import {
  getOrCreateConversation,
  sendMessage,
  type ConversationDetail,
} from "@/lib/chat/actions";
import { useClassroomPresence } from "@/lib/realtime/use-classroom-presence";
import type {
  ClassroomDetail,
  ClassroomMemberUser,
  ClassroomMemberDetail,
} from "@/lib/classroom/types";

interface ClassroomProps {
  classroom: ClassroomDetail;
  currentUserId: string;
}

export function ClassroomTabsView({ classroom, currentUserId }: ClassroomProps) {
  // Tab State & Data Riil
  const [announcements, setAnnouncements] = React.useState<AnnouncementListItem[]>([]);
  const [threads, setThreads] = React.useState<ThreadListItem[]>([]);
  const [materials, setMaterials] = React.useState<MaterialListItem[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // DM State
  const [selectedRecipient, setSelectedRecipient] = React.useState<ClassroomMemberUser | null>(null);
  const [conversation, setConversation] = React.useState<ConversationDetail | null>(null);
  const [isVerifyingDm, setIsVerifyingDm] = React.useState(false);
  const [dmError, setDmError] = React.useState<string | null>(null);
  const [dmMessage, setDmMessage] = React.useState("");
  const [isSendingDm, setIsSendingDm] = React.useState(false);

  // Form Buat Pengumuman Baru
  const [showAnnounceDialog, setShowAnnounceDialog] = React.useState(false);
  const [announceTitle, setAnnounceTitle] = React.useState("");
  const [announceContent, setAnnounceContent] = React.useState("");
  const [isSubmittingAnnounce, setIsSubmittingAnnounce] = React.useState(false);

  // Form Buat Thread Diskusi Kelas Baru
  const [showThreadDialog, setShowThreadDialog] = React.useState(false);
  const [threadTitle, setThreadTitle] = React.useState("");
  const [threadContent, setThreadContent] = React.useState("");
  const [threadCategory, setThreadCategory] = React.useState("TUGAS & DISKUSI");
  const [isSubmittingThread, setIsSubmittingThread] = React.useState(false);

  // Form Upload Materi Kelas
  const [showMaterialDialog, setShowMaterialDialog] = React.useState(false);
  const [matTitle, setMatTitle] = React.useState("");
  const [matDesc, setMatDesc] = React.useState("");
  const [matCategory, setMatCategory] = React.useState("MATERI KELAS");
  const [isSubmittingMaterial, setIsSubmittingMaterial] = React.useState(false);

  // Unduh toast notice
  const [downloadNotice, setDownloadNotice] = React.useState<string | null>(null);

  // Map seatIndex (0-29) ke siswa
  const studentSeats = React.useMemo(() => {
    const map = new Map<number, ClassroomMemberDetail>();
    classroom.members.forEach((m) => {
      if (m.role === "STUDENT" && m.seatIndex !== null) {
        map.set(m.seatIndex, m);
      }
    });
    return map;
  }, [classroom.members]);

  const teachers = classroom.members.filter(
    (m) => m.role === "TEACHER" || m.role === "ASSISTANT"
  );

  const myMembership = classroom.members.find((m) => m.user.id === currentUserId);
  const myName = myMembership?.user.displayName || myMembership?.user.name || "Saya";
  const mySeat = myMembership?.seatIndex ?? null;

  const classMembersForPresence = React.useMemo(() => {
    return classroom.members.map((m) => ({
      userId: m.user.id,
      seatIndex: m.seatIndex,
      name: m.user.displayName || m.user.name,
    }));
  }, [classroom.members]);

  const { onlineUserIds, activeStudentCount } = useClassroomPresence({
    classId: classroom.id,
    currentUserId,
    currentUserName: myName,
    currentUserSeatIndex: mySeat,
    classMembers: classMembersForPresence,
  });

  const isTeacherOrAdmin = React.useMemo(() => {
    return classroom.members.some(
      (m) => m.user.id === currentUserId && (m.role === "TEACHER" || m.role === "ASSISTANT")
    );
  }, [classroom.members, currentUserId]);

  // Load Data Riil Kelas (Pengumuman, Thread Diskusi, Materi)
  const refreshClassData = React.useCallback(async () => {
    try {
      const [annRes, threadRes, matRes] = await Promise.all([
        getAnnouncements(classroom.id),
        getThreads({ classId: classroom.id }),
        getMaterials({ classId: classroom.id }),
      ]);
      setAnnouncements(annRes);
      setThreads(threadRes.threads);
      setMaterials(matRes);
    } catch (err) {
      console.error("Gagal memuat data ruang kelas:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [classroom.id]);

  React.useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        refreshClassData();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [refreshClassData]);

  // Buka Dialog DM Intra-Kelas
  const handleOpenDm = async (user: ClassroomMemberUser) => {
    setSelectedRecipient(user);
    setDmError(null);
    setConversation(null);
    setIsVerifyingDm(true);

    try {
      const res = await getOrCreateConversation(classroom.id, user.id);
      if (!res.success) {
        setDmError(res.error || "Gagal memulai percakapan.");
      } else if (res.conversation) {
        setConversation(res.conversation);
      }
    } catch {
      setDmError("Terjadi kesalahan sistem saat memverifikasi DM.");
    } finally {
      setIsVerifyingDm(false);
    }
  };

  // Kirim Pesan DM Intra-Kelas
  const handleSendDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmMessage.trim() || !selectedRecipient) return;

    try {
      setIsSendingDm(true);
      const res = await sendMessage({
        classId: classroom.id,
        targetUserId: selectedRecipient.id,
        content: dmMessage.trim(),
      });

      if (res.success && res.message) {
        setConversation((prev) =>
          prev ? { ...prev, messages: [...prev.messages, res.message!] } : null
        );
        setDmMessage("");
      } else {
        setDmError(res.error || "Gagal mengirim pesan.");
      }
    } catch {
      setDmError("Terjadi kesalahan jaringan saat mengirim pesan.");
    } finally {
      setIsSendingDm(false);
    }
  };

  // Buat Pengumuman Baru
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) return;

    try {
      setIsSubmittingAnnounce(true);
      const res = await createAnnouncement({
        classId: classroom.id,
        title: announceTitle.trim(),
        content: announceContent.trim(),
        isPinned: true,
      });

      if (res.success) {
        setAnnounceTitle("");
        setAnnounceContent("");
        setShowAnnounceDialog(false);
        await refreshClassData();
      }
    } finally {
      setIsSubmittingAnnounce(false);
    }
  };

  // Buat Thread Baru
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadTitle.trim() || !threadContent.trim()) return;

    try {
      setIsSubmittingThread(true);
      const res = await createThread({
        title: threadTitle.trim(),
        content: threadContent.trim(),
        category: threadCategory,
        classId: classroom.id,
      });

      if (res.success) {
        setThreadTitle("");
        setThreadContent("");
        setShowThreadDialog(false);
        await refreshClassData();
      }
    } finally {
      setIsSubmittingThread(false);
    }
  };

  // Upload Materi Baru
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    try {
      setIsSubmittingMaterial(true);
      const res = await createMaterial({
        title: matTitle.trim(),
        description: matDesc.trim() || undefined,
        category: matCategory,
        fileFormat: "PDF",
        fileSize: "2.8 MB",
        fileUrl: `/materials/${matTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        classId: classroom.id,
      });

      if (res.success) {
        setMatTitle("");
        setMatDesc("");
        setShowMaterialDialog(false);
        await refreshClassData();
      }
    } finally {
      setIsSubmittingMaterial(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {downloadNotice && (
        <div className="border border-ok bg-ok/10 text-ok p-3 font-mono text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadNotice}</span>
        </div>
      )}

      <Tabs defaultValue="meja">
        <TabsList className="bg-night border border-fluor/25 p-1">
          <TabsTrigger value="meja" className="space-x-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>[01] MEJA ANGGOTA (DENAH 2D)</span>
          </TabsTrigger>
          <TabsTrigger value="papan" className="space-x-1.5">
            <Pin className="w-3.5 h-3.5" />
            <span>[02] PAPAN TULIS ({announcements.length})</span>
          </TabsTrigger>
          <TabsTrigger value="diskusi" className="space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>[03] PAPAN DISKUSI ({threads.length})</span>
          </TabsTrigger>
          <TabsTrigger value="materi" className="space-x-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>[04] RAK MATERI ({materials.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MEJA ANGGOTA (DENAH 2D RUANG KELAS) */}
        <TabsContent value="meja" className="space-y-6">
          {/* Meja Guru di depan */}
          <div className="border border-fluor/30 bg-night p-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-2 mb-3">
              <span className="font-hud text-lg tracking-widest text-caution">
                [MEJA PENGAJAR / GURU & ASISTEN]
              </span>
              <Badge variant="cyan">DEPAN KELAS</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teachers.map((t) => {
                const isTeacherOnline = onlineUserIds.has(t.user.id);
                return (
                  <div
                    key={t.id}
                    className="p-3 border border-neon-cyan/40 bg-neon-cyan/5 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2.5 h-2.5 ${
                          isTeacherOnline ? "bg-ok animate-pulse" : "bg-fluor/20"
                        } inline-block`}
                        title={isTeacherOnline ? "Pengajar Online" : "Pengajar Offline"}
                      />
                      <div>
                        <div className="font-sign uppercase text-base text-fluor">
                          {t.user.displayName || t.user.name}
                        </div>
                        <div className="font-mono text-[11px] text-fluor/60">
                          {t.role === "TEACHER" ? "Pengajar Utama" : "Asisten Kelas"}
                        </div>
                      </div>
                    </div>
                    {t.user.id !== currentUserId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDm(t.user)}
                        className="text-xs"
                      >
                        KIRIM PESAN
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid 30 Meja Siswa (Standard-30 Layout) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-sign text-xl uppercase tracking-wider text-fluor">
                GRID MEJA SISWA ({activeStudentCount} / {classroom.members.filter((m) => m.role === "STUDENT").length} ONLINE)
              </h3>
              <span className="font-mono text-xs text-fluor/60">
                LAYOUT: {classroom.roomLayout.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Array.from({ length: 30 }).map((_, index) => {
                const member = studentSeats.get(index);
                const isMe = member?.user.id === currentUserId;
                const isOnline = member ? onlineUserIds.has(member.user.id) : false;

                return (
                  <div
                    key={index}
                    className={`border p-3 transition-colors flex flex-col justify-between min-h-[110px] ${
                      member
                        ? isMe
                          ? "border-caution bg-caution/10"
                          : isOnline
                            ? "border-fluor bg-fluor/[0.04] shadow-[0_0_10px_rgba(79,208,138,0.1)]"
                            : "border-fluor/30 bg-night"
                        : "border-dashed border-fluor/20 bg-fluor/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-caution">
                        MEJA #{String(index + 1).padStart(2, "0")}
                      </span>
                      {member && (
                        <span
                          className={`w-2 h-2 ${
                            isOnline
                              ? isMe
                                ? "bg-caution animate-pulse"
                                : "bg-ok animate-pulse"
                              : "bg-fluor/20"
                          } inline-block`}
                          title={isOnline ? "Status: Online di Meja" : "Status: Offline"}
                        />
                      )}
                    </div>

                    {member ? (
                      <div className="my-2">
                        <div className="font-sign text-base uppercase text-fluor truncate">
                          {member.user.displayName || member.user.name}
                        </div>
                        <div className="font-mono text-[11px] text-fluor/50 truncate">
                          {isMe ? "(MEJA ANDA)" : `@${member.user.username || "siswa"}`}
                        </div>
                        <div className="font-mono text-[10px] mt-0.5">
                          {isOnline ? (
                            <span className="text-ok font-semibold">● ONLINE DI MEJA</span>
                          ) : (
                            <span className="text-fluor/40">○ OFFLINE</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-[11px] text-fluor/30 my-auto text-center">
                        [KOSONG]
                      </div>
                    )}

                    {member && !isMe && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDm(member.user)}
                        className="w-full text-[10px] h-7 px-1.5"
                      >
                        KIRIM PESAN
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PAPAN TULIS (PENGUMUMAN) */}
        <TabsContent value="papan" className="space-y-4">
          <div className="border border-fluor/30 bg-night p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
              <span className="font-hud text-xl tracking-widest text-caution">
                [PAPAN TULIS // PENGUMUMAN KELAS]
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant="caution">DIPIN OLEH PENGAJAR</Badge>
                {isTeacherOrAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnnounceDialog(true)}
                    className="text-xs space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>TULIS PENGUMUMAN</span>
                  </Button>
                )}
              </div>
            </div>

            {isLoadingData ? (
              <div className="text-center font-mono text-xs text-fluor/60 py-8">
                Memuat pengumuman kelas...
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center font-mono text-xs text-fluor/50 py-8">
                Belum ada pengumuman yang ditulis di papan tulis.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs text-fluor/80 leading-relaxed">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 border border-fluor/20 bg-fluor/[0.02] space-y-2">
                    <div className="flex items-center justify-between text-caution">
                      <span className="font-bold text-sm text-fluor uppercase">{ann.title}</span>
                      <span className="text-[11px] text-fluor/50">
                        {new Date(ann.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="font-body text-xs sm:text-sm text-fluor/90 leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>
                    <div className="text-[10px] text-fluor/50 pt-1 border-t border-fluor/10">
                      Oleh: {ann.author.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: PAPAN DISKUSI */}
        <TabsContent value="diskusi" className="space-y-4">
          <div className="border border-fluor/30 bg-night p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
              <span className="font-hud text-xl tracking-widest text-caution">
                [PAPAN DISKUSI PRIVAT KELAS]
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowThreadDialog(true)}
                className="space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>BUAT TOPIK KELAS</span>
              </Button>
            </div>

            {isLoadingData ? (
              <div className="text-center font-mono text-xs text-fluor/60 py-8">
                Memuat diskusi kelas...
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center font-mono text-xs text-fluor/50 py-8">
                Belum ada topik diskusi di kelas ini.
              </div>
            ) : (
              <div className="space-y-3">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="p-4 border border-fluor/20 bg-night hover:border-fluor/50 transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono text-xs text-fluor/50 mb-1">
                      <span>Ditanyakan oleh {thread.author.name} • {new Date(thread.createdAt).toLocaleDateString("id-ID")}</span>
                      {thread.hasBestAnswer ? (
                        <Badge variant="ok">TERJAWAB</Badge>
                      ) : (
                        <Badge variant="outline">{thread.category}</Badge>
                      )}
                    </div>
                    <h4 className="font-sign text-lg text-fluor uppercase">
                      {thread.title}
                    </h4>
                    <p className="font-body text-xs text-fluor/70 mt-1 line-clamp-2">
                      {thread.content}
                    </p>
                    <div className="mt-3 pt-2 border-t border-fluor/10 flex items-center space-x-4 font-mono text-[11px] text-fluor/60">
                      <span>{thread.votes} Suara</span>
                      <span>•</span>
                      <span>{thread.commentCount} Balasan</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 4: RAK MATERI */}
        <TabsContent value="materi" className="space-y-4">
          <div className="border border-fluor/30 bg-night p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
              <span className="font-hud text-xl tracking-widest text-caution">
                [RAK MATERI KELAS // {classroom.name}]
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMaterialDialog(true)}
                className="space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>UNGGAH MATERI KELAS</span>
              </Button>
            </div>

            {isLoadingData ? (
              <div className="text-center font-mono text-xs text-fluor/60 py-8">
                Memuat materi kelas...
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center font-mono text-xs text-fluor/50 py-8">
                Belum ada materi pembelajaran yang diunggah ke rak kelas ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-4 border border-fluor/20 bg-night space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="cyan">{mat.category}</Badge>
                        <span className="font-mono text-[11px] text-fluor/50">
                          {mat.fileFormat} • {mat.fileSize}
                        </span>
                      </div>
                      <h4 className="font-sign text-base text-fluor uppercase mt-2">
                        {mat.title}
                      </h4>
                      <p className="font-body text-xs text-fluor/70 mt-1">
                        {mat.description || "Modul panduan dan referensi kelas."}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setDownloadNotice(`Mempersiapkan unduhan: ${mat.title}...`);
                        setTimeout(() => setDownloadNotice(null), 2500);
                      }}
                      className="w-full text-xs mt-3 space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>UNDUH MATERI</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG DM INTRA-KELAS LENGKAP DENGAN RIWAYAT PESAN (SERVER VERIFIED) */}
      {selectedRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-xs select-none">
          <div className="border-2 border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative flex flex-col max-h-[85vh]">
            <button
              onClick={() => setSelectedRecipient(null)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor p-1 transition-colors"
              aria-label="Tutup Percakapan"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-fluor/20 pb-3">
              <div className="flex items-center space-x-2 text-caution">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-hud text-lg tracking-widest uppercase">
                  [PESAN PRIBADI // DM INTRA-KELAS]
                </span>
              </div>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                KEPADA: {selectedRecipient.displayName || selectedRecipient.name}
              </h3>
              <p className="font-mono text-xs text-fluor/60">
                @{selectedRecipient.username || "siswa"} • KELAS: {classroom.name}
              </p>
            </div>

            {isVerifyingDm ? (
              <div className="py-12 text-center font-mono text-xs text-fluor/60">
                Memverifikasi keanggotaan kelas di server...
              </div>
            ) : dmError ? (
              <div className="p-4 border border-alert bg-alert/10 text-alert text-xs font-mono space-y-2">
                <div className="font-bold">PELANGGARAN ATURAN AKSES DM</div>
                <p>{dmError}</p>
                <Button variant="outline" size="sm" onClick={() => setSelectedRecipient(null)} className="mt-2">
                  TUTUP
                </Button>
              </div>
            ) : conversation ? (
              <div className="flex-1 flex flex-col space-y-3 min-h-0">
                <div className="p-2 border border-ok/40 bg-ok/5 text-ok text-[11px] font-mono flex items-center space-x-2">
                  <span className="w-2 h-2 bg-ok inline-block" />
                  <span>Terverifikasi: Pengguna berada dalam satu kelas yang sama ({classroom.code}).</span>
                </div>

                {/* Riwayat Percakapan */}
                <div className="flex-1 border border-fluor/20 p-3 space-y-2.5 overflow-y-auto max-h-56 bg-night">
                  {conversation.messages.length === 0 ? (
                    <div className="text-center font-mono text-xs text-fluor/40 py-6">
                      Belum ada percakapan. Sampaikan pesan pertama Anda.
                    </div>
                  ) : (
                    conversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-2.5 max-w-[85%] text-xs font-body leading-relaxed ${
                            msg.isSelf
                              ? "bg-caution/15 border border-caution/40 text-fluor"
                              : "bg-neon-cyan/15 border border-neon-cyan/40 text-fluor"
                          }`}
                        >
                          <div className="font-mono text-[10px] text-fluor/50 mb-0.5">
                            {msg.isSelf ? "Anda" : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div>{msg.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form Kirim Pesan */}
                <form onSubmit={handleSendDm} className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <Input
                      value={dmMessage}
                      onChange={(e) => setDmMessage(e.target.value)}
                      placeholder="Ketik pesan untuk rekan sekelas..."
                      className="font-mono text-xs flex-1"
                      disabled={isSendingDm}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={isSendingDm || !dmMessage.trim()}
                      className="space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingDm ? "..." : "KIRIM"}</span>
                    </Button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Dialog Buat Pengumuman Baru */}
      {showAnnounceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 select-none">
          <div className="border border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setShowAnnounceDialog(false)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-fluor/20 pb-3">
              <span className="font-hud text-lg tracking-widest text-caution">
                [PAPAN TULIS // TULIS PENGUMUMAN]
              </span>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                AGENDA KELAS
              </h3>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Judul Pengumuman:</label>
                <Input
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="Contoh: Praktikum Konfigurasi Switch Core Hari Kamis"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Isi Pengumuman:</label>
                <textarea
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  rows={4}
                  className="w-full border border-fluor/30 bg-night p-3 font-body text-xs text-fluor placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                  placeholder="Tuliskan detail jadwal, instruksi lab, atau pengingat tugas..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAnnounceDialog(false)}>
                  BATAL
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmittingAnnounce}>
                  {isSubmittingAnnounce ? "MENYIMPAN..." : "PASANG DI PAPAN TULIS"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Buat Thread Diskusi Kelas */}
      {showThreadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 select-none">
          <div className="border border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setShowThreadDialog(false)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-fluor/20 pb-3">
              <span className="font-hud text-lg tracking-widest text-caution">
                [PAPAN DISKUSI // TOPIK KELAS BARU]
              </span>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                TANYA JAWAB PRIVAT KELAS
              </h3>
            </div>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Judul Diskusi:</label>
                <Input
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  placeholder="Contoh: Pertanyaan seputar Lab OSPF Multi-Area"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Kategori:</label>
                <select
                  value={threadCategory}
                  onChange={(e) => setThreadCategory(e.target.value)}
                  className="w-full h-11 border border-fluor/30 bg-night px-3 font-mono text-xs text-fluor focus:border-caution focus:outline-none"
                >
                  <option value="TUGAS & DISKUSI">TUGAS & DISKUSI</option>
                  <option value="PRAKTIKUM LAB">PRAKTIKUM LAB</option>
                  <option value="KENDALA TEKNIS">KENDALA TEKNIS</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Isi Pertanyaan:</label>
                <textarea
                  value={threadContent}
                  onChange={(e) => setThreadContent(e.target.value)}
                  rows={4}
                  className="w-full border border-fluor/30 bg-night p-3 font-body text-xs text-fluor placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                  placeholder="Jelaskan pertanyaan atau kendala yang ingin dibahas bersama rekan sekelas..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowThreadDialog(false)}>
                  BATAL
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmittingThread}>
                  {isSubmittingThread ? "MENYIMPAN..." : "PUBLIKASIKAN KE DISKUSI KELAS"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Unggah Materi Kelas */}
      {showMaterialDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 select-none">
          <div className="border border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setShowMaterialDialog(false)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-fluor/20 pb-3">
              <span className="font-hud text-lg tracking-widest text-caution">
                [RAK MATERI // UNGGAH DOKUMEN KELAS]
              </span>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                MODUL KELAS
              </h3>
            </div>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Judul Modul:</label>
                <Input
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Contoh: Lembar Kerja Siswa 03: Routing BGP"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Kategori Materi:</label>
                <select
                  value={matCategory}
                  onChange={(e) => setMatCategory(e.target.value)}
                  className="w-full h-11 border border-fluor/30 bg-night px-3 font-mono text-xs text-fluor focus:border-caution focus:outline-none"
                >
                  <option value="MATERI KELAS">MATERI KELAS</option>
                  <option value="LEMBAR KERJA">LEMBAR KERJA</option>
                  <option value="TUTORIAL PRAKTIK">TUTORIAL PRAKTIK</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs text-fluor/70 block">Deskripsi Singkat:</label>
                <textarea
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-fluor/30 bg-night p-3 font-body text-xs text-fluor placeholder:text-fluor/40 focus:border-caution focus:outline-none"
                  placeholder="Penjelasan ringkas isi modul..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowMaterialDialog(false)}>
                  BATAL
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmittingMaterial}>
                  {isSubmittingMaterial ? "MENYIMPAN..." : "SIMPAN DI RAK MATERI"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
