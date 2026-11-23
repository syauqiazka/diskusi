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

  const teachers = React.useMemo(() => {
    return classroom.members.filter(
      (m) => m.role === "TEACHER" || m.role === "ASSISTANT"
    );
  }, [classroom.members]);

  const isTeacherOrAdmin = React.useMemo(() => {
    const me = classroom.members.find((m) => m.user.id === currentUserId);
    return me?.role === "TEACHER" || me?.role === "ASSISTANT";
  }, [classroom.members, currentUserId]);

  // Realtime Presence Ably
  const classMembersForPresence = React.useMemo(() => {
    return classroom.members.map((m) => ({
      userId: m.user.id,
      seatIndex: m.seatIndex,
      name: m.user.displayName || m.user.name,
    }));
  }, [classroom.members]);

  const myMembership = classroom.members.find((m) => m.user.id === currentUserId);

  const { onlineUserIds, activeStudentCount } = useClassroomPresence({
    classId: classroom.id,
    currentUserId,
    currentUserName: myMembership?.user.displayName || myMembership?.user.name || "Siswa",
    currentUserSeatIndex: myMembership?.seatIndex ?? null,
    classMembers: classMembersForPresence,
  });

  // Refresh data pengumuman, forum, materi
  const refreshClassData = React.useCallback(async () => {
    try {
      setIsLoadingData(true);
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
        <div className="rounded-2xl border-2 border-ok/30 bg-ok/10 text-ok p-3.5 font-body text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadNotice}</span>
        </div>
      )}

      <Tabs defaultValue="meja">
        <TabsList className="bg-surface border-2 border-border p-1.5 rounded-full inline-flex gap-1 shadow-sm flex-wrap h-auto">
          <TabsTrigger value="meja" className="space-x-1.5 rounded-full font-display font-semibold text-xs py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-text data-[state=active]:shadow-sm">
            <Users className="w-4 h-4" />
            <span>Denah Meja Kelas</span>
          </TabsTrigger>
          <TabsTrigger value="papan" className="space-x-1.5 rounded-full font-display font-semibold text-xs py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-text data-[state=active]:shadow-sm">
            <Pin className="w-4 h-4" />
            <span>Papan Tulis ({announcements.length})</span>
          </TabsTrigger>
          <TabsTrigger value="diskusi" className="space-x-1.5 rounded-full font-display font-semibold text-xs py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-text data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4" />
            <span>Papan Diskusi ({threads.length})</span>
          </TabsTrigger>
          <TabsTrigger value="materi" className="space-x-1.5 rounded-full font-display font-semibold text-xs py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-text data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4" />
            <span>Rak Materi ({materials.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MEJA ANGGOTA (DENAH 2D RUANG KELAS) */}
        <TabsContent value="meja" className="space-y-6 pt-2">
          {/* Meja Guru di depan */}
          <div className="rounded-3xl border-2 border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <span className="font-display font-bold text-base text-text">
                Meja Pengajar & Asisten
              </span>
              <Badge variant="peach">Depan Kelas</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teachers.map((t) => {
                const isTeacherOnline = onlineUserIds.has(t.user.id);
                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border-2 border-border bg-canvas/30 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isTeacherOnline ? "bg-ok ring-2 ring-ok/20" : "bg-text-muted/40"
                        } inline-block`}
                        title={isTeacherOnline ? "Pengajar Online" : "Pengajar Offline"}
                      />
                      <div>
                        <div className="font-display font-bold text-sm text-text">
                          {t.user.displayName || t.user.name}
                        </div>
                        <div className="font-body text-xs text-text-muted">
                          {t.role === "TEACHER" ? "Pengajar Utama" : "Asisten Kelas"}
                        </div>
                      </div>
                    </div>
                    {t.user.id !== currentUserId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDm(t.user)}
                        className="rounded-xl text-xs font-display font-semibold"
                      >
                        Kirim Pesan
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
              <h3 className="font-display font-bold text-lg text-text">
                Denah Meja Siswa ({activeStudentCount} / {classroom.members.filter((m) => m.role === "STUDENT").length} Online)
              </h3>
              <span className="font-body text-xs text-text-muted">
                Tata Letak: {classroom.roomLayout.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {Array.from({ length: 30 }).map((_, index) => {
                const member = studentSeats.get(index);
                const isMe = member?.user.id === currentUserId;
                const isOnline = member ? onlineUserIds.has(member.user.id) : false;

                return (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 transition-all flex flex-col justify-between min-h-[125px] ${
                      member
                        ? isMe
                          ? "border-2 border-primary bg-primary/15 shadow-sm"
                          : isOnline
                            ? "border-2 border-border bg-surface shadow-xs"
                            : "border-2 border-border bg-surface/80"
                        : "border-2 border-dashed border-border/60 bg-canvas/40"
                    }`}
                  >
                    <div className="flex items-center justify-between font-body text-xs">
                      <span className="font-display font-bold text-xs text-text">
                        Meja #{String(index + 1).padStart(2, "0")}
                      </span>
                      {member && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isOnline
                              ? isMe
                                ? "bg-primary ring-2 ring-primary/30"
                                : "bg-ok ring-2 ring-ok/30"
                              : "bg-text-muted/30"
                          } inline-block`}
                          title={isOnline ? "Status: Online di Meja" : "Status: Offline"}
                        />
                      )}
                    </div>

                    {member ? (
                      <div className="my-2">
                        <div className="font-display font-bold text-sm text-text truncate">
                          {member.user.displayName || member.user.name}
                        </div>
                        <div className="font-body text-xs text-text-muted truncate">
                          {isMe ? "(Meja Anda)" : `@${member.user.username || "siswa"}`}
                        </div>
                        <div className="font-body text-[11px] mt-1">
                          {isOnline ? (
                            <span className="text-ok font-semibold">● Hadir di Meja</span>
                          ) : (
                            <span className="text-text-muted">○ Tidak di Kelas</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="font-body text-xs text-text-muted/60 my-auto text-center">
                        Kosong
                      </div>
                    )}

                    {member && !isMe && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDm(member.user)}
                        className="w-full text-xs h-8 px-2 rounded-xl font-display font-semibold mt-1"
                      >
                        Kirim Pesan
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PAPAN TULIS (PENGUMUMAN) */}
        <TabsContent value="papan" className="space-y-4 pt-2">
          <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="font-display font-bold text-xl text-text">
                Papan Tulis Kelas
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant="peach">Dipin Pengajar</Badge>
                {isTeacherOrAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnnounceDialog(true)}
                    className="text-xs space-x-1.5 rounded-2xl font-display font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tulis Pengumuman</span>
                  </Button>
                )}
              </div>
            </div>

            {isLoadingData ? (
              <div className="text-center font-body text-xs text-text-muted py-10">
                Memuat pengumuman kelas...
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center font-body text-xs text-text-muted py-10">
                Belum ada pengumuman yang ditulis di papan tulis.
              </div>
            ) : (
              <div className="space-y-3.5 leading-relaxed">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-5 rounded-2xl border-2 border-border bg-canvas/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-base text-text">{ann.title}</span>
                      <span className="font-body text-xs text-text-muted">
                        {new Date(ann.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="font-body text-sm text-text leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>
                    <div className="text-xs text-text-muted pt-2 border-t border-border/40 font-medium">
                      Oleh: {ann.author.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: PAPAN DISKUSI */}
        <TabsContent value="diskusi" className="space-y-4 pt-2">
          <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="font-display font-bold text-xl text-text">
                Papan Diskusi Kelas
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowThreadDialog(true)}
                className="space-x-1.5 rounded-2xl font-display font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Topik Baru</span>
              </Button>
            </div>

            {isLoadingData ? (
              <div className="text-center font-body text-xs text-text-muted py-10">
                Memuat diskusi kelas...
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center font-body text-xs text-text-muted py-10">
                Belum ada topik diskusi di kelas ini.
              </div>
            ) : (
              <div className="space-y-3.5">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="p-5 rounded-2xl border-2 border-border bg-canvas/20 hover:border-primary transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between font-body text-xs text-text-muted mb-1.5">
                      <span>Ditanyakan oleh {thread.author.name} • {new Date(thread.createdAt).toLocaleDateString("id-ID")}</span>
                      {thread.hasBestAnswer ? (
                        <Badge variant="ok">Terjawab</Badge>
                      ) : (
                        <Badge variant="peach">{thread.category}</Badge>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-base text-text">
                      {thread.title}
                    </h4>
                    <p className="font-body text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {thread.content}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center space-x-4 font-body text-xs text-text-muted font-medium">
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
        <TabsContent value="materi" className="space-y-4 pt-2">
          <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="font-display font-bold text-xl text-text">
                Rak Materi Pembelajaran
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMaterialDialog(true)}
                className="space-x-1.5 rounded-2xl font-display font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Unggah Materi</span>
              </Button>
            </div>

            {isLoadingData ? (
              <div className="text-center font-body text-xs text-text-muted py-10">
                Memuat materi kelas...
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center font-body text-xs text-text-muted py-10">
                Belum ada materi pembelajaran yang diunggah ke rak kelas ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-5 rounded-2xl border-2 border-border bg-canvas/30 space-y-3 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="mint">{mat.category}</Badge>
                        <span className="font-body text-xs text-text-muted">
                          {mat.fileFormat} • {mat.fileSize}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-base text-text mt-2.5">
                        {mat.title}
                      </h4>
                      <p className="font-body text-xs text-text-muted mt-1 leading-relaxed">
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
                      className="w-full text-xs mt-3 space-x-1.5 rounded-xl font-display font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Materi</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG DM INTRA-KELAS LENGKAP DENGAN RIWAYAT PESAN */}
      {selectedRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-lg p-6 space-y-4 relative flex flex-col max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedRecipient(null)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup Percakapan"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border/50 pb-3">
              <div className="flex items-center space-x-2 text-text mb-1">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="font-display font-semibold text-xs text-text-muted">
                  Pesan Pribadi Rekan Sekelas
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl text-text">
                {selectedRecipient.displayName || selectedRecipient.name}
              </h3>
              <p className="font-body text-xs text-text-muted">
                @{selectedRecipient.username || "siswa"} • Kelas: {classroom.name}
              </p>
            </div>

            {isVerifyingDm ? (
              <div className="py-12 text-center font-body text-xs text-text-muted">
                Memverifikasi keanggotaan kelas di server...
              </div>
            ) : dmError ? (
              <div className="p-4 rounded-2xl border-2 border-alert/30 bg-alert/10 text-alert text-xs font-body space-y-2">
                <div className="font-bold">Akses DM Ditolak</div>
                <p>{dmError}</p>
                <Button variant="outline" size="sm" onClick={() => setSelectedRecipient(null)} className="mt-2 rounded-xl">
                  Tutup
                </Button>
              </div>
            ) : conversation ? (
              <div className="flex-1 flex flex-col space-y-3 min-h-0">
                <div className="p-2.5 rounded-xl border border-ok/30 bg-ok/10 text-ok text-xs font-body flex items-center space-x-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-ok inline-block" />
                  <span>Terverifikasi: Berada dalam kelas yang sama ({classroom.code}).</span>
                </div>

                {/* Riwayat Percakapan */}
                <div className="flex-1 rounded-2xl border-2 border-border p-3.5 space-y-2.5 overflow-y-auto max-h-56 bg-canvas/30">
                  {conversation.messages.length === 0 ? (
                    <div className="text-center font-body text-xs text-text-muted py-6">
                      Belum ada percakapan. Sampaikan pesan pertama Anda.
                    </div>
                  ) : (
                    conversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-3 max-w-[85%] rounded-2xl text-xs font-body leading-relaxed shadow-xs ${
                            msg.isSelf
                              ? "bg-primary text-text font-medium rounded-tr-sm"
                              : "bg-surface border-2 border-border text-text rounded-tl-sm"
                          }`}
                        >
                          <div className="text-[10px] text-text-muted mb-0.5 flex items-center space-x-1.5 font-medium">
                            <span>{msg.isSelf ? "Anda" : msg.senderName}</span>
                            <span>•</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div>{msg.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form Kirim Pesan */}
                <form onSubmit={handleSendDm} className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <Input
                      value={dmMessage}
                      onChange={(e) => setDmMessage(e.target.value)}
                      placeholder="Ketik pesan untuk rekan sekelas..."
                      className="font-body text-xs flex-1 rounded-2xl border-2 border-border bg-canvas/40"
                      disabled={isSendingDm}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={isSendingDm || !dmMessage.trim()}
                      className="space-x-1.5 rounded-2xl font-display font-bold px-4"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingDm ? "..." : "Kirim"}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-lg p-6 sm:p-8 space-y-4 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAnnounceDialog(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-border/50 pb-3">
              <span className="font-display font-semibold text-xs text-text-muted">
                Papan Tulis Kelas
              </span>
              <h3 className="font-display font-bold text-2xl text-text mt-0.5">
                Tulis Agenda Kelas
              </h3>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Judul Pengumuman:</label>
                <Input
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="Contoh: Praktikum Jaringan Hari Kamis"
                  required
                  className="rounded-2xl border-2 border-border bg-canvas/40 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Isi Pengumuman:</label>
                <textarea
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border-2 border-border bg-canvas/40 p-3 font-body text-xs text-text placeholder:text-text-muted focus:bg-surface focus:outline-none transition-colors"
                  placeholder="Tuliskan detail jadwal, instruksi lab, atau pengingat tugas..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAnnounceDialog(false)} className="rounded-2xl font-display font-semibold">
                  Batal
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmittingAnnounce} className="rounded-2xl font-display font-bold">
                  {isSubmittingAnnounce ? "Menyimpan..." : "Pasang di Papan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Buat Thread Diskusi Kelas */}
      {showThreadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-lg p-6 sm:p-8 space-y-4 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowThreadDialog(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-border/50 pb-3">
              <span className="font-display font-semibold text-xs text-text-muted">
                Papan Diskusi Kelas
              </span>
              <h3 className="font-display font-bold text-2xl text-text mt-0.5">
                Topik Diskusi Baru
              </h3>
            </div>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Judul Diskusi:</label>
                <Input
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  placeholder="Contoh: Pertanyaan seputar Konfigurasi Router"
                  required
                  className="rounded-2xl border-2 border-border bg-canvas/40 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Kategori:</label>
                <select
                  value={threadCategory}
                  onChange={(e) => setThreadCategory(e.target.value)}
                  className="w-full h-11 rounded-2xl border-2 border-border bg-canvas/40 px-3 font-body text-xs text-text focus:bg-surface focus:outline-none"
                >
                  <option value="TUGAS & DISKUSI">TUGAS & DISKUSI</option>
                  <option value="PRAKTIKUM LAB">PRAKTIKUM LAB</option>
                  <option value="KENDALA TEKNIS">KENDALA TEKNIS</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Isi Pertanyaan:</label>
                <textarea
                  value={threadContent}
                  onChange={(e) => setThreadContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border-2 border-border bg-canvas/40 p-3 font-body text-xs text-text placeholder:text-text-muted focus:bg-surface focus:outline-none transition-colors"
                  placeholder="Jelaskan pertanyaan atau kendala yang ingin dibahas bersama rekan sekelas..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowThreadDialog(false)} className="rounded-2xl font-display font-semibold">
                  Batal
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmittingThread} className="rounded-2xl font-display font-bold">
                  {isSubmittingThread ? "Menyimpan..." : "Publikasikan Topik"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Unggah Materi Kelas */}
      {showMaterialDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
          <div className="rounded-3xl border-2 border-border bg-surface w-full max-w-lg p-6 sm:p-8 space-y-4 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowMaterialDialog(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-border/50 pb-3">
              <span className="font-display font-semibold text-xs text-text-muted">
                Rak Materi Kelas
              </span>
              <h3 className="font-display font-bold text-2xl text-text mt-0.5">
                Unggah Modul Kelas
              </h3>
            </div>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Judul Modul:</label>
                <Input
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Contoh: Modul Praktikum 03: Routing"
                  required
                  className="rounded-2xl border-2 border-border bg-canvas/40 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Kategori Materi:</label>
                <select
                  value={matCategory}
                  onChange={(e) => setMatCategory(e.target.value)}
                  className="w-full h-11 rounded-2xl border-2 border-border bg-canvas/40 px-3 font-body text-xs text-text focus:bg-surface focus:outline-none"
                >
                  <option value="MATERI KELAS">MATERI KELAS</option>
                  <option value="LEMBAR KERJA">LEMBAR KERJA</option>
                  <option value="TUTORIAL PRAKTIK">TUTORIAL PRAKTIK</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-display font-semibold text-xs text-text block">Deskripsi Singkat:</label>
                <textarea
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border-2 border-border bg-canvas/40 p-3 font-body text-xs text-text placeholder:text-text-muted focus:bg-surface focus:outline-none transition-colors"
                  placeholder="Penjelasan ringkas isi modul..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowMaterialDialog(false)} className="rounded-2xl font-display font-semibold">
                  Batal
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmittingMaterial} className="rounded-2xl font-display font-bold">
                  {isSubmittingMaterial ? "Menyimpan..." : "Simpan Materi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
