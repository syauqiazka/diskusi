"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  GraduationCap,
  MessageSquare,
  FileText,
  Pin,
  Send,
  DoorOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
} from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getAnnouncements,
  type AnnouncementListItem,
} from "@/lib/announcements/actions";
import {
  getThreads,
  type ThreadListItem,
} from "@/lib/forum/actions";
import {
  getMaterials,
  type MaterialListItem,
} from "@/lib/materials/actions";
import {
  getOrCreateConversation,
  sendMessage,
  type ConversationDetail,
} from "@/lib/chat/actions";
import type { ClassroomDetail, ClassroomMemberDetail } from "@/lib/classroom/types";

interface ClassroomModalsProps {
  classroom: ClassroomDetail;
  currentUserId: string;
  onlineUserIds?: Set<string>;
}

export function ClassroomModals({ classroom, currentUserId, onlineUserIds }: ClassroomModalsProps) {
  const router = useRouter();
  const activePanel = useWorldStore((s) => s.activePanel);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);
  const closePanel = useWorldStore((s) => s.closePanel);

  // State DM Meja Siswa (Riwayat Nyata)
  const [conversation, setConversation] = React.useState<ConversationDetail | null>(null);
  const [isLoadingDm, setIsLoadingDm] = React.useState(false);
  const [dmError, setDmError] = React.useState<string | null>(null);
  const [dmMessage, setDmMessage] = React.useState("");
  const [isSendingDm, setIsSendingDm] = React.useState(false);

  // State Data Objek Kelas (Pengumuman, Diskusi, Materi)
  const [announcements, setAnnouncements] = React.useState<AnnouncementListItem[]>([]);
  const [threads, setThreads] = React.useState<ThreadListItem[]>([]);
  const [materials, setMaterials] = React.useState<MaterialListItem[]>([]);
  const [isLoadingObjects, setIsLoadingObjects] = React.useState(false);
  const [downloadNotice, setDownloadNotice] = React.useState<string | null>(null);

  // Temukan anggota berdasarkan meja yang diklik
  const targetMember = React.useMemo<ClassroomMemberDetail | null>(() => {
    if (!activeInteractable) return null;

    if (activeInteractable.type === "classroom-desk") {
      const match = activeInteractable.id.match(/^desk-(\d+)$/);
      if (match) {
        const seatIdx = parseInt(match[1], 10);
        return classroom.members.find((m) => m.seatIndex === seatIdx) || null;
      }
    }
    return null;
  }, [activeInteractable, classroom.members]);

  const teacher = React.useMemo(() => {
    return classroom.members.find((m) => m.role === "TEACHER" || m.role === "ASSISTANT");
  }, [classroom.members]);

  // Escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePanel) {
        closePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, closePanel]);

  // Load riwayat DM saat membuka meja siswa lain
  React.useEffect(() => {
    let isMounted = true;
    if (activePanel !== "classroom-desk" || !targetMember || targetMember.user.id === currentUserId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setConversation(null);
          setDmError(null);
        }
      });
      return;
    }

    Promise.resolve().then(() => {
      if (isMounted) {
        setIsLoadingDm(true);
        setDmError(null);
      }
    });

    getOrCreateConversation(classroom.id, targetMember.user.id)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.conversation) {
          setConversation(res.conversation);
        } else {
          setDmError(res.error || "Gagal memuat percakapan.");
        }
      })
      .catch(() => {
        if (isMounted) setDmError("Terjadi kesalahan memuat DM.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingDm(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activePanel, targetMember, currentUserId, classroom.id]);

  // Load data pengumuman / diskusi / materi saat panel bersangkutan dibuka
  React.useEffect(() => {
    if (!activePanel) return;

    if (
      activePanel === "classroom-blackboard" ||
      activePanel === "classroom-discussion" ||
      activePanel === "classroom-materials"
    ) {
      let isMounted = true;
      Promise.resolve().then(() => {
        if (isMounted) {
          setIsLoadingObjects(true);
        }
      });

      Promise.all([
        getAnnouncements(classroom.id),
        getThreads({ classId: classroom.id }),
        getMaterials({ classId: classroom.id }),
      ])
        .then(([annRes, threadRes, matRes]) => {
          if (!isMounted) return;
          setAnnouncements(annRes);
          setThreads(threadRes.threads);
          setMaterials(matRes);
        })
        .catch((err) => {
          console.error("Gagal memuat data objek kelas 3D:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingObjects(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [activePanel, classroom.id]);

  const handleSendDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmMessage.trim() || !targetMember) return;

    try {
      setIsSendingDm(true);
      const res = await sendMessage({
        classId: classroom.id,
        targetUserId: targetMember.user.id,
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

  if (!activePanel) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-night/85 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePanel();
      }}
    >
      <div className="max-w-2xl w-full border-2 border-fluor/40 bg-night p-6 sm:p-8 space-y-6 text-fluor relative shadow-[0_0_30px_rgba(11,13,18,0.95)] max-h-[90vh] overflow-y-auto">
        {/* Tombol Tutup [X] */}
        <button
          onClick={closePanel}
          className="absolute top-4 right-4 text-fluor/60 hover:text-caution p-1 transition-colors"
          aria-label="Tutup Panel"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 1. MODAL KARTU PROFIL MEJA SISWA (3.2 & WORLD.md Alur DM) */}
        {activePanel === "classroom-desk" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-caution">
                <User className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} INTERAKSI MEJA SISWA (3D)
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                {targetMember
                  ? `MEJA #${(targetMember.seatIndex ?? 0) + 1}: ${targetMember.user.displayName || targetMember.user.name}`
                  : activeInteractable?.label || "MEJA SISWA KOSONG"}
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Titik interaksi spasial antarmurid kelas {classroom.name}. Pesan langsung (DM) hanya
                diizinkan bagi pengguna yang berada dalam satu kelas yang sama.
              </p>
            </div>

            {targetMember ? (
              <div className="space-y-5">
                {/* Kartu Profil Pemilik Meja */}
                <div className="border border-fluor/30 bg-night p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-16 h-16 border-2 border-caution bg-night flex items-center justify-center shadow-[0_0_12px_rgba(242,194,0,0.3)]">
                    <User className="w-8 h-8 text-caution" />
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1 font-mono text-xs">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="font-sign text-xl text-fluor uppercase">
                        {targetMember.user.displayName || targetMember.user.name}
                      </span>
                      {targetMember.user.id === currentUserId ? (
                        <Badge variant="ok">MEJA ANDA</Badge>
                      ) : (
                        <Badge variant="cyan">REKAN SEKELAS</Badge>
                      )}
                    </div>

                    <div className="text-caution font-semibold">
                      @{targetMember.user.username || "siswa"} {" // "} NO MEJA #{(targetMember.seatIndex ?? 0) + 1}
                    </div>

                    <div className="text-[11px] text-fluor/60 pt-1">
                      Status Kehadiran:{" "}
                      {onlineUserIds && !onlineUserIds.has(targetMember.user.id) ? (
                        <span className="text-fluor/40">○ OFFLINE</span>
                      ) : (
                        <span className="text-ok font-bold">● ONLINE DI MEJA</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulir DM Intra-Kelas dengan Riwayat Obrolan Nyata */}
                {targetMember.user.id !== currentUserId ? (
                  <div className="border border-fluor/25 bg-fluor/[0.02] p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-fluor/10 pb-2">
                      <span className="font-bold text-caution uppercase flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>PERCAKAPAN DM SPASIAL (INTRA-KELAS)</span>
                      </span>
                      <span className="text-ok text-[11px] flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>TERVERIFIKASI SEKELAS</span>
                      </span>
                    </div>

                    {isLoadingDm ? (
                      <div className="py-6 text-center text-fluor/50">
                        Memuat riwayat pesan meja...
                      </div>
                    ) : dmError ? (
                      <div className="p-3 border border-alert bg-alert/10 text-alert text-xs">
                        {dmError}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Riwayat Percakapan */}
                        <div className="border border-fluor/20 p-3 space-y-2 max-h-48 overflow-y-auto bg-night">
                          {!conversation || conversation.messages.length === 0 ? (
                            <div className="text-center text-fluor/40 py-4 text-[11px]">
                              Belum ada percakapan dengan @{targetMember.user.username || targetMember.user.name}.
                            </div>
                          ) : (
                            conversation.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
                              >
                                <div
                                  className={`p-2 max-w-[85%] text-xs font-body leading-relaxed ${
                                    msg.isSelf
                                      ? "bg-caution/15 border border-caution/40 text-fluor"
                                      : "bg-neon-cyan/15 border border-neon-cyan/40 text-fluor"
                                  }`}
                                >
                                  <div className="font-mono text-[10px] text-fluor/50 mb-0.5">
                                    {msg.isSelf ? "Anda" : msg.senderName}
                                  </div>
                                  <div>{msg.content}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Input Pesan */}
                        <form onSubmit={handleSendDm} className="flex gap-2">
                          <Input
                            value={dmMessage}
                            onChange={(e) => setDmMessage(e.target.value)}
                            placeholder={`Kirim pesan ke meja @${targetMember.user.username || targetMember.user.name}...`}
                            className="font-mono text-xs flex-1"
                            disabled={isSendingDm}
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
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-ok/40 bg-ok/5 text-xs font-mono text-ok text-center">
                    Ini adalah meja belajar Anda di kelas {classroom.name}. Lampu meja Anda menyala untuk menandai kehadiran Anda kepada rekan sekelas.
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="lg" onClick={closePanel}>
                    TUTUP KARTU MEJA
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-fluor/20 p-8 text-center space-y-3">
                <div className="w-12 h-12 border border-fluor/30 mx-auto flex items-center justify-center text-fluor/40">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-sign text-xl uppercase text-fluor/80">MEJA BELUM BERPENGHUNI</h3>
                <p className="font-body text-xs text-fluor/60 max-w-sm mx-auto">
                  Meja ini belum ditempati oleh siswa. Nomor meja akan dialokasikan secara otomatis saat siswa baru bergabung dengan kode kelas.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={closePanel}>
                    TUTUP
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MODAL PAPAN TULIS KELAS (PENGUMUMAN NYATA) */}
        {activePanel === "classroom-blackboard" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-caution">
                <Pin className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} PAPAN TULIS KELAS
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                PENGUMUMAN & AGENDA KELAS
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Papan tulis di depan kelas berisi agenda penting, jadwal praktik lab, dan pengumuman dari pengajar.
              </p>
            </div>

            {isLoadingObjects ? (
              <div className="py-8 text-center font-mono text-xs text-fluor/50">
                Memuat agenda papan tulis...
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-fluor/50 border border-fluor/20">
                Belum ada pengumuman yang ditulis pada papan kelas.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {announcements.map((ann) => (
                  <div key={ann.id} className="border border-caution/40 bg-caution/5 p-4 space-y-2">
                    <div className="flex justify-between items-center text-caution font-bold">
                      <span className="uppercase">{ann.title}</span>
                      <Badge variant="caution">DIPIN OLEH PENGAJAR</Badge>
                    </div>
                    <p className="font-body text-xs sm:text-sm text-fluor/90 leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>
                    <div className="text-[10px] text-fluor/50 pt-1 border-t border-fluor/10">
                      Oleh: {ann.author.name} • {new Date(ann.createdAt).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push(`/kelas/${classroom.id}`);
                }}
              >
                <span className="font-hud text-lg tracking-wider">BUKA DETAIL KELAS 2D</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                KEMBALI KE KELAS
              </Button>
            </div>
          </div>
        )}

        {/* 3. MODAL PAPAN DISKUSI KELAS (THREAD NYATA) */}
        {activePanel === "classroom-discussion" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-neon-cyan">
                <MessageSquare className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} PAPAN DISKUSI KELAS
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                THREAD DISKUSI KHUSUS KELAS
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Ruang tanya jawab internal seputar materi dan kendala tugas kelas {classroom.name}.
              </p>
            </div>

            {isLoadingObjects ? (
              <div className="py-8 text-center font-mono text-xs text-fluor/50">
                Memuat topik diskusi kelas...
              </div>
            ) : threads.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-fluor/50 border border-fluor/20">
                Belum ada topik diskusi di papan kelas ini.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {threads.map((thread) => (
                  <div key={thread.id} className="border border-fluor/20 p-3 bg-night space-y-1">
                    <div className="flex items-center justify-between text-neon-cyan font-bold">
                      <span>[{thread.category}]</span>
                      <span className="text-[11px] text-fluor/50">{thread.commentCount} Komentar</span>
                    </div>
                    <h4 className="font-sign text-base uppercase text-fluor mt-1">
                      {thread.title}
                    </h4>
                    <p className="font-body text-xs text-fluor/70 line-clamp-2">
                      {thread.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push(`/kelas/${classroom.id}`);
                }}
              >
                <span className="font-hud text-lg tracking-wider">BUKA PAPAN DISKUSI (2D)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                TUTUP
              </Button>
            </div>
          </div>
        )}

        {/* 4. MODAL RAK MATERI KELAS (MATERI NYATA) */}
        {activePanel === "classroom-materials" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-ok">
                <FileText className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} RAK MATERI KELAS
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                MODUL BELAJAR & DOKUMEN PRAKTIK
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Repositori modul dan bahan tayang pembelajaran kelas {classroom.name}.
              </p>
            </div>

            {downloadNotice && (
              <div className="border border-ok bg-ok/10 text-ok p-2.5 font-mono text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>{downloadNotice}</span>
              </div>
            )}

            {isLoadingObjects ? (
              <div className="py-8 text-center font-mono text-xs text-fluor/50">
                Memuat berkas modul rak kelas...
              </div>
            ) : materials.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-fluor/50 border border-fluor/20">
                Belum ada modul yang ditempatkan di rak materi kelas ini.
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs max-h-56 overflow-y-auto">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-3 border border-fluor/20 flex items-center justify-between">
                    <div>
                      <div className="text-fluor font-semibold">{mat.title}</div>
                      <div className="text-fluor/50 text-[11px]">Format: {mat.fileFormat} ({mat.fileSize}) // {mat.category}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDownloadNotice(`Mempersiapkan unduhan: ${mat.title}...`);
                        setTimeout(() => setDownloadNotice(null), 2500);
                      }}
                      className="space-x-1 text-xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>UNDUH</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push(`/kelas/${classroom.id}`);
                }}
              >
                <span className="font-hud text-lg tracking-wider">LIHAT DAFTAR MATERI LENGKAP</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                TUTUP
              </Button>
            </div>
          </div>
        )}

        {/* 5. MODAL MEJA PENGAJAR */}
        {activePanel === "classroom-teacher" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-caution">
                <GraduationCap className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} MEJA PENGAJAR / GURU
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                INSTRUKTUR KELAS
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Meja instruktur dan asisten pembimbing ruang kelas {classroom.name}.
              </p>
            </div>

            <div className="border border-fluor/20 p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-fluor/60">PENGAJAR KELAS:</span>
                <span className="text-fluor font-bold">{teacher?.user.displayName || teacher?.user.name || "Belum ditentukan"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fluor/60">KODE KELAS:</span>
                <span className="text-caution font-bold">{classroom.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fluor/60">TOTAL SISWA TERDAFTAR:</span>
                <span className="text-neon-cyan font-bold">{classroom.members.filter((m) => m.role === "STUDENT").length} / 30 MEJA</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="lg" onClick={closePanel}>
                KEMBALI KE KELAS
              </Button>
            </div>
          </div>
        )}

        {/* 6. MODAL PINTU KELUAR KE LORONG */}
        {activePanel === "classroom-exit" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-alert">
                <DoorOpen className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} PINTU KELUAR KELAS
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                KELUAR KE LORONG SEKOLAH
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Pintu ini menghubungkan ruang kelas {classroom.name} kembali ke lorong utama lantai sekolah 3D.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="danger"
                size="lg"
                className="flex-1 space-x-2"
                onClick={() => {
                  closePanel();
                  router.push("/dunia");
                }}
              >
                <span className="font-hud text-lg tracking-wider">[E] KELUAR KE LORONG 3D</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                TETAP DI DALAM KELAS
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
