"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  GraduationCap,
  LayoutGrid,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Loader2,
  ShieldAlert,
  Edit2,
  Check,
} from "lucide-react";
import { useWorldStore } from "@/stores/use-world-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getPintuKelasAccess,
  getLokerProfile,
  updateLokerBio,
  getCerminCosmetics,
  updateUserActiveFrame,
} from "@/lib/classroom/object-actions";
import { joinClassByCode } from "@/lib/classroom/actions";
import type {
  DoorAccessStatus,
  LokerProfileData,
  CerminCatalogData,
} from "@/lib/classroom/types";

export function WorldModals() {
  const router = useRouter();
  const activePanel = useWorldStore((s) => s.activePanel);
  const closePanel = useWorldStore((s) => s.closePanel);

  // State Pintu Kelas
  const [doorData, setDoorData] = React.useState<DoorAccessStatus | null>(null);
  const [doorLoading, setDoorLoading] = React.useState(false);
  const [doorCodeInput, setDoorCodeInput] = React.useState("SIJA-10A");
  const [doorError, setDoorError] = React.useState<string | null>(null);
  const [doorSubmitting, setDoorSubmitting] = React.useState(false);

  // State Loker Profil
  const [lokerData, setLokerData] = React.useState<LokerProfileData | null>(null);
  const [lokerLoading, setLokerLoading] = React.useState(false);
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [bioInput, setBioInput] = React.useState("");
  const [bioSaving, setBioSaving] = React.useState(false);
  const [bioNotice, setBioNotice] = React.useState<string | null>(null);

  // State Cermin Kosmetik
  const [cerminData, setCerminData] = React.useState<CerminCatalogData | null>(null);
  const [cerminLoading, setCerminLoading] = React.useState(false);
  const [selectedFrameId, setSelectedFrameId] = React.useState<string | null>(null);
  const [frameSaving, setFrameSaving] = React.useState(false);
  const [frameSavedNotice, setFrameSavedNotice] = React.useState(false);

  // Muat data server secara reaktif saat panel tertentu dibuka
  React.useEffect(() => {
    if (!activePanel) return;
    let ignore = false;

    if (activePanel === "door") {
      Promise.resolve().then(() => {
        if (!ignore) {
          setDoorLoading(true);
          setDoorError(null);
        }
      });
      getPintuKelasAccess("SIJA-10A")
        .then((res) => {
          if (!ignore) setDoorData(res);
        })
        .finally(() => {
          if (!ignore) setDoorLoading(false);
        });
    }

    if (activePanel === "locker") {
      Promise.resolve().then(() => {
        if (!ignore) {
          setLokerLoading(true);
          setIsEditingBio(false);
          setBioNotice(null);
        }
      });
      getLokerProfile()
        .then((res) => {
          if (!ignore) {
            setLokerData(res);
            setBioInput(res.user?.bio || "");
          }
        })
        .finally(() => {
          if (!ignore) setLokerLoading(false);
        });
    }

    if (activePanel === "mirror") {
      Promise.resolve().then(() => {
        if (!ignore) {
          setCerminLoading(true);
          setFrameSavedNotice(false);
        }
      });
      getCerminCosmetics()
        .then((res) => {
          if (!ignore) {
            setCerminData(res);
            setSelectedFrameId(res.activeFrameId);
          }
        })
        .finally(() => {
          if (!ignore) setCerminLoading(false);
        });
    }

    return () => {
      ignore = true;
    };
  }, [activePanel]);

  // Handle tombol Escape untuk menutup panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePanel) {
        closePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, closePanel]);

  // Aksi gabung kelas dari modal pintu
  const handleJoinClassFromDoor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doorCodeInput.trim()) return;

    setDoorSubmitting(true);
    setDoorError(null);

    const res = await joinClassByCode(doorCodeInput);
    setDoorSubmitting(false);

    if (res.success) {
      setDoorLoading(true);
      const updated = await getPintuKelasAccess("SIJA-10A");
      setDoorData(updated);
      setDoorLoading(false);
    } else {
      setDoorError(res.error || "Gagal bergabung ke kelas.");
    }
  };

  // Aksi simpan bio dari loker
  const handleSaveBio = async () => {
    setBioSaving(true);
    setBioNotice(null);

    const res = await updateLokerBio(bioInput);
    setBioSaving(false);

    if (res.success) {
      setIsEditingBio(false);
      setBioNotice("Bio berhasil diperbarui.");
      if (lokerData?.user) {
        setLokerData({
          ...lokerData,
          user: { ...lokerData.user, bio: bioInput.trim() },
        });
      }
    } else {
      setBioNotice(res.error || "Gagal menyimpan bio.");
    }
  };

  // Aksi pasang bingkai dari cermin
  const handleSaveFrame = async () => {
    setFrameSaving(true);
    const res = await updateUserActiveFrame(selectedFrameId);
    setFrameSaving(false);

    if (res.success) {
      setFrameSavedNotice(true);
      setTimeout(() => {
        setFrameSavedNotice(false);
      }, 2000);
    }
  };

  if (!activePanel) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePanel();
      }}
    >
      <div className="max-w-2xl w-full rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-6 text-text relative shadow-2xl max-h-[88vh] overflow-y-auto animate-in zoom-in-95">
        {/* Tombol Tutup [X] */}
        <button
          onClick={closePanel}
          className="absolute top-5 right-5 text-text-muted hover:text-text p-1.5 rounded-full hover:bg-canvas transition-colors"
          aria-label="Tutup Panel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. MODAL PINTU RUANG KELAS */}
        {activePanel === "door" && (
          <div className="space-y-6">
            <div className="border-b border-border/50 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-accent">
                <GraduationCap className="w-6 h-6" />
                <span className="font-display font-semibold text-xs text-text-muted">
                  Akses Pintu Kelas
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">
                {doorData?.className || "Ruang Kelas X SIJA 1"}
              </h2>
              <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
                Pintu masuk ruang kelas sekolah. Hak akses diverifikasi langsung melalui database.
              </p>
            </div>

            {doorLoading ? (
              <div className="p-8 rounded-2xl border-2 border-border bg-canvas/30 flex flex-col items-center justify-center space-y-3 font-body text-xs text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span>Memeriksa hak akses pintu...</span>
              </div>
            ) : doorData ? (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-border p-5 bg-canvas/30 space-y-3 font-body text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted font-medium">Kode Kelas:</span>
                    <span className="font-display font-bold text-xs px-2.5 py-0.5 rounded-xl border border-secondary/50 text-text bg-secondary/30">
                      {doorData.classCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted font-medium">Status Akses:</span>
                    {doorData.isMember ? (
                      <span className="flex items-center space-x-1.5 text-ok font-bold">
                        <Unlock className="w-4 h-4" />
                        <span>Terbuka (Anggota Kelas)</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 text-alert font-bold">
                        <Lock className="w-4 h-4" />
                        <span>Terkunci (Belum Terdaftar)</span>
                      </span>
                    )}
                  </div>
                  {doorData.isMember && (
                    <div className="flex justify-between items-center pt-2 border-t border-border/40">
                      <span className="text-text-muted font-medium">Nomor Meja Siswa:</span>
                      <span className="font-display font-bold text-sm text-text">
                        {doorData.seatIndex !== null && doorData.seatIndex !== undefined
                          ? `Meja #${doorData.seatIndex + 1}`
                          : "Meja Guru"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Buka Gembok jika Pintu Terkunci */}
                {!doorData.isMember && (
                  <form onSubmit={handleJoinClassFromDoor} className="rounded-2xl border-2 border-alert/30 bg-alert/10 p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-alert text-xs font-body font-semibold">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>Masukkan kode kelas untuk membuka pintu dan mendaftar nomor meja:</span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={doorCodeInput}
                        onChange={(e) => setDoorCodeInput(e.target.value)}
                        placeholder="KODE KELAS (misal: SIJA-10A)"
                        className="font-display font-bold text-xs uppercase rounded-xl border-2 border-border bg-surface"
                        disabled={doorSubmitting}
                      />
                      <Button type="submit" variant="default" size="sm" disabled={doorSubmitting} className="whitespace-nowrap rounded-xl font-display font-bold">
                        {doorSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="flex items-center space-x-1">
                            <Key className="w-3.5 h-3.5" />
                            <span>Buka Kunci</span>
                          </span>
                        )}
                      </Button>
                    </div>

                    {doorError && (
                      <div className="text-alert font-body text-xs">
                        {doorError}
                      </div>
                    )}
                  </form>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {doorData.isMember ? (
                    <>
                      <Button
                        variant="default"
                        size="lg"
                        className="flex-1 space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
                        onClick={() => {
                          closePanel();
                          router.push(
                            doorData.classId ? `/dunia/kelas/${doorData.classId}` : "/dunia"
                          );
                        }}
                      >
                        <span>Masuk ke Kelas 3D</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-2xl font-display font-semibold text-sm"
                        onClick={() => {
                          closePanel();
                          router.push(
                            doorData.classId ? `/kelas/${doorData.classId}` : "/kelas"
                          );
                        }}
                      >
                        <span>Mode Cepat (2D)</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 rounded-2xl font-display font-semibold text-sm"
                      onClick={() => {
                        closePanel();
                        router.push("/kelas");
                      }}
                    >
                      <span>Lihat Daftar Kelas (Mode 2D)</span>
                    </Button>
                  )}
                  <Button variant="ghost" size="lg" onClick={closePanel} className="rounded-2xl font-display font-semibold text-sm">
                    Kembali
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 2. MODAL MADING GLOBAL */}
        {activePanel === "mading" && (
          <div className="space-y-6">
            <div className="border-b border-border/50 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-accent">
                <LayoutGrid className="w-6 h-6" />
                <span className="font-display font-semibold text-xs text-text-muted">
                  Mading Sekolah
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">
                Papan Pengumuman &amp; Diskusi
              </h2>
              <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
                Pusat pengumuman dan diskusi terbuka seluruh warga sekolah. Akses topik terhangat dan tanya jawab.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-border p-4 bg-canvas/30 hover:border-primary transition-all">
                <div className="flex justify-between text-xs font-body text-text-muted mb-1">
                  <Badge variant="peach">Jaringan & Server</Badge>
                  <span>1 jam yang lalu</span>
                </div>
                <h4 className="font-display font-bold text-base text-text mt-1">
                  Konfigurasi BGP Routing Multi-Homing untuk Praktik Lab Komputer
                </h4>
                <p className="font-body text-xs text-text-muted mt-1 line-clamp-1">
                  Prefix list dan local preference gateway di MikroTik CHR.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-border p-4 bg-canvas/30 hover:border-primary transition-all">
                <div className="flex justify-between text-xs font-body text-text-muted mb-1">
                  <Badge variant="mint">Virtualisasi</Badge>
                  <span>3 jam yang lalu</span>
                </div>
                <h4 className="font-display font-bold text-base text-text mt-1">
                  Rekomendasi Lingkungan Docker Container untuk Simulasi Router
                </h4>
                <p className="font-body text-xs text-text-muted mt-1 line-clamp-1">
                  Efisiensi container vs Proxmox VE pada server lab sekolah.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
                onClick={() => {
                  closePanel();
                  router.push("/mading");
                }}
              >
                <span>Buka Mading Penuh</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel} className="rounded-2xl font-display font-semibold text-sm">
                Tutup Papan
              </Button>
            </div>
          </div>
        )}

        {/* 3. MODAL PERPUSTAKAAN TERBUKA */}
        {activePanel === "library" && (
          <div className="space-y-6">
            <div className="border-b border-border/50 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-primary">
                <BookOpen className="w-6 h-6 text-text" />
                <span className="font-display font-semibold text-xs text-text-muted">
                  Perpustakaan Digital
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">
                Sumber Belajar Terbuka
              </h2>
              <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
                Koleksi modul ajar, panduan praktikum lab, dan materi keahlian sekolah yang dapat diunduh bebas.
              </p>
            </div>

            <div className="space-y-3 font-body text-xs">
              <div className="p-4 rounded-2xl border-2 border-border bg-canvas/30 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-text">Panduan MikroTik MTCNA — SIJA</div>
                  <div className="text-text-muted text-xs mt-0.5">Format: PDF (8.5 MB) • Jaringan & Server</div>
                </div>
                <Badge variant="mint">Tersedia</Badge>
              </div>
              <div className="p-4 rounded-2xl border-2 border-border bg-canvas/30 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-sm text-text">Modul Praktikum Administrasi Linux Debian 12</div>
                  <div className="text-text-muted text-xs mt-0.5">Format: PDF (5.2 MB) • Sistem Operasi</div>
                </div>
                <Badge variant="mint">Tersedia</Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="default"
                size="lg"
                className="flex-1 space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
                onClick={() => {
                  closePanel();
                  router.push("/perpustakaan");
                }}
              >
                <span>Buka Katalog Perpustakaan</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel} className="rounded-2xl font-display font-semibold text-sm">
                Tutup
              </Button>
            </div>
          </div>
        )}

        {/* 4. MODAL LOKER SISWA */}
        {activePanel === "locker" && (
          <div className="space-y-6">
            <div className="border-b border-border/50 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-text">
                <User className="w-6 h-6" />
                <span className="font-display font-semibold text-xs text-text-muted">
                  Loker Siswa
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">
                Loker Pribadi
              </h2>
              <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
                Penyimpanan identitas dan inventaris profil akun siswa Anda di sekolah.
              </p>
            </div>

            {lokerLoading ? (
              <div className="p-8 rounded-2xl border-2 border-border bg-canvas/30 flex flex-col items-center justify-center space-y-3 font-body text-xs text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span>Memuat data identitas loker...</span>
              </div>
            ) : lokerData?.isLoggedIn && lokerData.user ? (
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-border p-5 bg-canvas/30 space-y-4 font-body text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/30 flex items-center justify-center text-text font-display font-bold text-base">
                        {lokerData.user.displayName?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div>
                        <div className="font-display font-bold text-base text-text">
                          {lokerData.user.displayName || lokerData.user.name}
                        </div>
                        <div className="text-accent font-semibold text-xs">
                          @{lokerData.user.username || "pengguna"} • {lokerData.user.role}
                        </div>
                      </div>
                    </div>
                    <Badge variant="mint">Akun Terdaftar</Badge>
                  </div>

                  {/* Bio dengan Fitur Edit Cepat */}
                  <div className="pt-3 border-t border-border/40 space-y-2">
                    <div className="flex justify-between items-center text-xs text-text-muted">
                      <span className="font-semibold">Bio Profil:</span>
                      {!isEditingBio && (
                        <button
                          onClick={() => setIsEditingBio(true)}
                          className="flex items-center space-x-1 text-accent font-bold hover:underline"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>
                      )}
                    </div>

                    {isEditingBio ? (
                      <div className="space-y-2">
                        <Input
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          placeholder="Tulis status/bio Anda (maks 200 karakter)"
                          className="font-body text-xs rounded-xl border-2 border-border bg-surface"
                          maxLength={200}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={handleSaveBio} disabled={bioSaving} className="rounded-xl font-display font-bold">
                            {bioSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingBio(false)} className="rounded-xl font-display font-semibold">
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="font-body text-xs text-text italic bg-surface p-3 rounded-xl border border-border">
                        &quot;{lokerData.user.bio || "Belum ada bio. Klik ubah untuk mengisi."}&quot;
                      </div>
                    )}

                    {bioNotice && (
                      <div className="text-ok font-body text-xs pt-1 font-semibold">
                        {bioNotice}
                      </div>
                    )}
                  </div>

                  {/* Daftar Kelas yang Diikuti */}
                  <div className="pt-3 border-t border-border/40 space-y-2">
                    <span className="text-xs text-text-muted font-semibold">Kelas yang Diikuti:</span>
                    {lokerData.classes.length === 0 ? (
                      <div className="text-text-muted text-xs italic">
                        Belum bergabung ke kelas mana pun. Kunjungi pintu kelas di lorong.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lokerData.classes.map((c) => (
                          <div key={c.classId} className="flex justify-between items-center p-3 rounded-xl border border-border bg-surface">
                            <span className="font-display font-bold text-xs text-text">{c.className}</span>
                            <span className="text-text font-semibold text-xs">
                              {c.seatIndex !== null ? `Meja #${c.seatIndex + 1}` : "Guru"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="default"
                    size="lg"
                    className="flex-1 space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
                    onClick={() => {
                      closePanel();
                      router.push("/profil");
                    }}
                  >
                    <span>Buka Halaman Profil Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={closePanel} className="rounded-2xl font-display font-semibold text-sm">
                    Tutup Loker
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-alert/30 bg-alert/10 p-6 text-center space-y-4">
                <ShieldAlert className="w-10 h-10 text-alert mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-alert">Loker Terkunci</h3>
                  <p className="font-body text-xs text-text-muted">
                    Anda belum masuk akun. Loker hanya dapat diakses oleh siswa yang sudah masuk.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Link href="/masuk">
                    <Button variant="danger" size="sm" className="rounded-xl">
                      Masuk ke Akun
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={closePanel} className="rounded-xl">
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. MODAL CERMIN KOSMETIK */}
        {activePanel === "mirror" && (
          <div className="space-y-6">
            <div className="border-b border-border/50 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-accent">
                <Sparkles className="w-6 h-6" />
                <span className="font-display font-semibold text-xs text-text-muted">
                  Cermin Kosmetik
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">
                Bingkai Avatar Sekolah
              </h2>
              <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
                Pilih bingkai avatar resmi yang tampil di kartu meja siswa dan cermin sekolah.
              </p>
            </div>

            {cerminLoading ? (
              <div className="p-8 rounded-2xl border-2 border-border bg-canvas/30 flex flex-col items-center justify-center space-y-3 font-body text-xs text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span>Memuat katalog cermin...</span>
              </div>
            ) : cerminData ? (
              <div className="space-y-4">
                {frameSavedNotice && (
                  <div className="p-3.5 rounded-2xl border-2 border-ok/30 bg-ok/10 text-ok font-body text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Bingkai avatar berhasil disimpan ke profil Anda!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-body text-xs">
                  {/* Opsi Tanpa Bingkai */}
                  <button
                    onClick={() => setSelectedFrameId(null)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${selectedFrameId === null
                        ? "border-primary bg-primary/15 shadow-xs"
                        : "border-border bg-canvas/30 hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl border border-border flex items-center justify-center bg-surface">
                        <User className="w-4 h-4 text-text-muted" />
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-text">Tanpa Bingkai</div>
                        <div className="text-[11px] text-text-muted">Tampilan standar</div>
                      </div>
                    </div>
                    {selectedFrameId === null && <Check className="w-4 h-4 text-text font-bold" />}
                  </button>

                  {/* Opsi dari Database */}
                  {cerminData.frames.map((frame) => {
                    const isSelected = selectedFrameId === frame.id;
                    return (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrameId(frame.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${isSelected
                            ? "border-primary bg-primary/15 shadow-xs"
                            : "border-border bg-canvas/30 hover:border-primary/50"
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl border-2 border-primary flex items-center justify-center bg-primary/20">
                            <User className="w-4 h-4 text-text" />
                          </div>
                          <div>
                            <div className="font-display font-bold text-sm text-text">{frame.name}</div>
                            <div className="text-[11px] text-text-muted line-clamp-1">
                              {frame.description || "Katalog resmi"}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-text font-bold" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="default"
                    size="lg"
                    className="flex-1 space-x-2 rounded-2xl font-display font-bold text-sm shadow-sm"
                    onClick={handleSaveFrame}
                    disabled={frameSaving}
                  >
                    {frameSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Pasang Bingkai &amp; Simpan</span>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={closePanel} className="rounded-2xl font-display font-semibold text-sm">
                    Tutup
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
