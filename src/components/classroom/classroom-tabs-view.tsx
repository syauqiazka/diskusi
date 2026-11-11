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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifySameClassMembership } from "@/lib/classroom/actions";
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
  const [selectedRecipient, setSelectedRecipient] = React.useState<ClassroomMemberUser | null>(null);
  const [dmVerification, setDmVerification] = React.useState<{
    allowed?: boolean;
    reason?: string;
  } | null>(null);
  const [dmMessage, setDmMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [sentNotice, setSentNotice] = React.useState(false);

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

  const handleOpenDm = async (user: ClassroomMemberUser) => {
    setSelectedRecipient(user);
    setDmVerification(null);
    setSentNotice(false);

    // Verifikasi server bahwa kedua user sekelas
    const res = await verifySameClassMembership(user.id);
    setDmVerification(res);
  };

  const handleSendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmMessage.trim()) return;
    setIsSending(true);

    // Simulasi penyimpanan pesan DM dalam ruang kelas
    setTimeout(() => {
      setIsSending(false);
      setSentNotice(true);
      setDmMessage("");
      setTimeout(() => {
        setSentNotice(false);
        setSelectedRecipient(null);
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="meja">
        <TabsList className="bg-night border border-fluor/25 p-1">
          <TabsTrigger value="meja" className="space-x-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>[01] MEJA ANGGOTA (DENAH 2D)</span>
          </TabsTrigger>
          <TabsTrigger value="papan" className="space-x-1.5">
            <Pin className="w-3.5 h-3.5" />
            <span>[02] PAPAN TULIS (PENGUMUMAN)</span>
          </TabsTrigger>
          <TabsTrigger value="diskusi" className="space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>[03] PAPAN DISKUSI</span>
          </TabsTrigger>
          <TabsTrigger value="materi" className="space-x-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>[04] RAK MATERI</span>
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
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className="p-3 border border-neon-cyan/40 bg-neon-cyan/5 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-ok inline-block" />
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
              ))}
            </div>
          </div>

          {/* Grid 30 Meja Siswa (Standard-30 Layout) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-sign text-xl uppercase tracking-wider text-fluor">
                GRID MEJA SISWA (30 MEJA)
              </h3>
              <span className="font-mono text-xs text-fluor/60">
                LAYOUT: {classroom.roomLayout.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Array.from({ length: 30 }).map((_, index) => {
                const member = studentSeats.get(index);
                const isMe = member?.user.id === currentUserId;

                return (
                  <div
                    key={index}
                    className={`border p-3 transition-colors flex flex-col justify-between min-h-[110px] ${
                      member
                        ? isMe
                          ? "border-caution bg-caution/10"
                          : "border-fluor/40 bg-night hover:border-fluor"
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
                            isMe ? "bg-caution" : "bg-ok"
                          } inline-block`}
                          title="Presence: Online"
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
              <Badge variant="caution">DIPIN OLEH PENGAJAR</Badge>
            </div>

            <div className="space-y-3 font-mono text-xs text-fluor/80 leading-relaxed">
              <div className="p-4 border border-fluor/20 bg-fluor/[0.02]">
                <div className="flex items-center justify-between text-caution mb-2">
                  <span className="font-bold">
                    AGENDA PRAKTIK JARINGAN & SERVER LAB SIJA
                  </span>
                  <span className="text-[11px] text-fluor/50">TERBARU</span>
                </div>
                <p className="font-body text-sm text-fluor/90">
                  Praktikum konfigurasi router mikroTik dan routing OSPF akan dimulai pada sesi lab
                  berikutnya. Seluruh siswa diharapkan telah memeriksa nomor meja masing-masing di Lab
                  Komputer dan menyiapkan berkas topologi jaringan.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: PAPAN DISKUSI */}
        <TabsContent value="diskusi" className="space-y-4">
          <div className="border border-fluor/30 bg-night p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
              <span className="font-hud text-xl tracking-widest text-caution">
                [PAPAN DISKUSI KELAS]
              </span>
              <Badge variant="outline">DISKUSI PRIVAT</Badge>
            </div>

            <div className="space-y-3">
              <div className="p-4 border border-fluor/20 bg-night hover:border-fluor/40 transition-colors">
                <div className="flex items-center justify-between font-mono text-xs text-fluor/50 mb-1">
                  <span>Ditanyakan oleh Ahmad • 2 jam yang lalu</span>
                  <Badge variant="ok">TERJAWAB</Badge>
                </div>
                <h4 className="font-sign text-lg text-fluor uppercase">
                  Troubleshooting Subnetting CIDR /28 pada Switch VLAN
                </h4>
                <p className="font-body text-xs text-fluor/70 mt-1">
                  Saat pengujian ping antar VLAN 10 dan VLAN 20, paket time out. Apakah gateway trunk
                  di router interface perlu diset encapsulation dot1q kembali?
                </p>
                <div className="mt-3 pt-2 border-t border-fluor/10 flex items-center space-x-4 font-mono text-[11px] text-fluor/60">
                  <span>3 Balasan</span>
                  <span>•</span>
                  <span>1 Jawaban Terpilih</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: RAK MATERI */}
        <TabsContent value="materi" className="space-y-4">
          <div className="border border-fluor/30 bg-night p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
              <span className="font-hud text-xl tracking-widest text-caution">
                [RAK MATERI KELAS]
              </span>
              <Badge variant="cyan">SIJA 10A</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 border border-fluor/20 bg-night space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">MODUL 01</Badge>
                  <span className="font-mono text-[11px] text-fluor/50">PDF • 2.4 MB</span>
                </div>
                <h4 className="font-sign text-base text-fluor uppercase">
                  Dasar Arsitektur Jaringan Komputer & Subnetting IPv4
                </h4>
                <p className="font-body text-xs text-fluor/70">
                  Panduan perhitungan biner dan pembagian host dalam topologi SIJA.
                </p>
                <Button variant="secondary" size="sm" className="w-full text-xs mt-2">
                  UNDUH MATERI
                </Button>
              </div>

              <div className="p-4 border border-fluor/20 bg-night space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">MODUL 02</Badge>
                  <span className="font-mono text-[11px] text-fluor/50">PDF • 4.1 MB</span>
                </div>
                <h4 className="font-sign text-base text-fluor uppercase">
                  Konfigurasi Server Linux Debian & DNS BIND9
                </h4>
                <p className="font-body text-xs text-fluor/70">
                  Langkah instalasi dan pengujian forward and reverse lookup zone.
                </p>
                <Button variant="secondary" size="sm" className="w-full text-xs mt-2">
                  UNDUH MATERI
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG/MODAL DM (ATURAN DM SEKELAS DIVERIFIKASI SERVER) */}
      {selectedRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/80">
          <div className="border border-fluor/50 bg-night w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedRecipient(null)}
              className="absolute top-4 right-4 text-fluor/60 hover:text-fluor"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-fluor/20 pb-3">
              <div className="flex items-center space-x-2 text-caution">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-hud text-lg tracking-widest uppercase">
                  [PESAN PRIBADI // DM KELAS]
                </span>
              </div>
              <h3 className="font-sign text-2xl text-fluor uppercase mt-1">
                KEPADA: {selectedRecipient.displayName || selectedRecipient.name}
              </h3>
              <p className="font-mono text-xs text-fluor/60">
                @{selectedRecipient.username || "siswa"} • KELAS: {classroom.name}
              </p>
            </div>

            {dmVerification?.allowed ? (
              <form onSubmit={handleSendDm} className="space-y-4">
                <div className="p-2 border border-ok/40 bg-ok/5 text-ok text-xs font-mono flex items-center space-x-2">
                  <span className="w-2 h-2 bg-ok inline-block" />
                  <span>Aturan Terpenuhi: Pengguna berada di kelas yang sama.</span>
                </div>

                {sentNotice && (
                  <div className="p-3 border border-ok/60 bg-ok/10 text-ok text-xs font-mono flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pesan berhasil terkirim ke meja penerima!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="messageInput" className="font-mono text-xs text-fluor/70 block">
                    Tulis Pesan (Bahasa Indonesia santai & jelas):
                  </label>
                  <Input
                    id="messageInput"
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    placeholder="Halo, ada yang ingin saya tanyakan terkait materi lab..."
                    disabled={isSending || sentNotice}
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecipient(null)}
                  >
                    BATAL
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={isSending || !dmMessage.trim() || sentNotice}
                    className="space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? "MENGIRIM..." : "KIRIM PESAN"}</span>
                  </Button>
                </div>
              </form>
            ) : dmVerification?.allowed === false ? (
              <div className="p-4 border border-alert/60 bg-alert/10 text-alert text-xs font-mono space-y-2">
                <div className="font-bold">PELANGGARAN ATURAN AKSES DM</div>
                <p>{dmVerification.reason}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecipient(null)}
                  className="mt-2"
                >
                  TUTUP
                </Button>
              </div>
            ) : (
              <div className="py-6 text-center font-mono text-xs text-fluor/60">
                Memverifikasi keanggotaan kelas di server...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
