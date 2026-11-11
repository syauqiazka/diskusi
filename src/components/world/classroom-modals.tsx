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
} from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { verifySameClassMembership } from "@/lib/classroom/actions";
import type { ClassroomDetail, ClassroomMemberDetail } from "@/lib/classroom/types";

interface ClassroomModalsProps {
  classroom: ClassroomDetail;
  currentUserId: string;
}

export function ClassroomModals({ classroom, currentUserId }: ClassroomModalsProps) {
  const router = useRouter();
  const activePanel = useWorldStore((s) => s.activePanel);
  const activeInteractable = useWorldStore((s) => s.activeInteractable);
  const closePanel = useWorldStore((s) => s.closePanel);

  // State DM Meja Siswa
  const [dmMessage, setDmMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [sentNotice, setSentNotice] = React.useState(false);
  const [dmVerification, setDmVerification] = React.useState<{
    allowed?: boolean;
    reason?: string;
  } | null>(null);

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

  // Reset form DM saat target meja berganti
  React.useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setDmMessage("");
        setSentNotice(false);
        setDmVerification(null);
      }
    });

    if (targetMember && targetMember.user.id !== currentUserId) {
      verifySameClassMembership(targetMember.user.id).then((res) => {
        if (!ignore) setDmVerification(res);
      });
    }

    return () => {
      ignore = true;
    };
  }, [targetMember, currentUserId]);

  const handleSendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmMessage.trim() || !targetMember) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentNotice(true);
      setDmMessage("");
      setTimeout(() => {
        setSentNotice(false);
      }, 2000);
    }, 500);
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
                  {"//"} INTERAKSI MEJA SISWA
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
                      Status Kehadiran: <span className="text-ok font-bold">ONLINE DI MEJA</span>
                    </div>
                  </div>
                </div>

                {/* Formulir DM Intra-Kelas */}
                {targetMember.user.id !== currentUserId ? (
                  <div className="border border-fluor/25 bg-fluor/[0.02] p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-fluor/10 pb-2">
                      <span className="font-bold text-caution uppercase flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>KIRIM PESAN LANGSUNG (DM INTRA-KELAS)</span>
                      </span>
                      {dmVerification?.allowed && (
                        <span className="text-ok text-[11px] flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>TERVERIFIKASI SEKELAS</span>
                        </span>
                      )}
                    </div>

                    {sentNotice ? (
                      <div className="p-3 border border-ok bg-ok/10 text-ok flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pesan berhasil dikirimkan ke meja @{targetMember.user.username || targetMember.user.name}!</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSendDm} className="space-y-2">
                        <Input
                          value={dmMessage}
                          onChange={(e) => setDmMessage(e.target.value)}
                          placeholder={`Tulis pesan untuk ${targetMember.user.displayName || targetMember.user.name}...`}
                          className="font-mono text-xs"
                          disabled={isSending}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="submit" variant="default" size="sm" disabled={isSending || !dmMessage.trim()}>
                            <Send className="w-3.5 h-3.5 mr-1" />
                            <span>{isSending ? "MENGIRIM..." : "KIRIM PESAN"}</span>
                          </Button>
                        </div>
                      </form>
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

        {/* 2. MODAL PAPAN TULIS KELAS (PENGUMUMAN) */}
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

            <div className="space-y-3 font-mono text-xs">
              <div className="border border-caution/40 bg-caution/5 p-4 space-y-2">
                <div className="flex justify-between items-center text-caution font-bold">
                  <span>AGENDA MINGGU INI</span>
                  <Badge variant="caution">DIPIN OLEH GURU</Badge>
                </div>
                <h4 className="font-sign text-base uppercase text-fluor">
                  Praktikum Konfigurasi Switch Core & VLAN SIJA BAZMA
                </h4>
                <p className="font-body text-xs text-fluor/80">
                  Seluruh siswa diharapkan mempersiapkan kabel console dan login ke routerboard lab pada jam pelajaran ke-3.
                </p>
              </div>
            </div>

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

        {/* 3. MODAL PAPAN DISKUSI KELAS */}
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

            <div className="space-y-3 font-mono text-xs">
              <div className="border border-fluor/20 p-3 bg-night">
                <span className="text-neon-cyan font-bold">[DISKUSI KELAS #1]</span>
                <h4 className="font-sign text-base uppercase text-fluor mt-1">
                  Kendala Subnetting CIDR /28 pada Lab Jaringan
                </h4>
                <p className="font-body text-xs text-fluor/60 mt-0.5 line-clamp-1">
                  Berapa host usable yang tersisa jika router gateway mengambil IP pertama?
                </p>
              </div>
            </div>

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

        {/* 4. MODAL RAK MATERI KELAS */}
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

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 border border-fluor/20 flex items-center justify-between">
                <div>
                  <div className="text-fluor font-semibold">Modul 01: Topologi Jaringan & Pengkabelan UTP</div>
                  <div className="text-fluor/50 text-[11px]">Format: PDF (3.2 MB) // Praktikum Lab</div>
                </div>
                <Badge variant="ok">TERSEDIA</Badge>
              </div>
            </div>

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
