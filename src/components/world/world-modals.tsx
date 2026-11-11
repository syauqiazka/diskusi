"use client";

import * as React from "react";
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
      // Muat ulang data akses pintu
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

        {/* 1. MODAL PINTU RUANG KELAS SIJA (3.2, 3.3, & Tahap 4) */}
        {activePanel === "door" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-caution">
                <GraduationCap className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} AKSES PINTU KELAS
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                {doorData?.className || "RUANG KELAS 10-SIJA"}
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Pintu masuk ruang kelas Sistem Informasi, Jaringan, dan Aplikasi SMK TI BAZMA.
                Pemeriksaan izin akses dilakukan langsung di server database.
              </p>
            </div>

            {doorLoading ? (
              <div className="p-8 border border-fluor/20 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-caution">
                <Loader2 className="w-6 h-6 animate-spin text-caution" />
                <span>MEMERIKSA HAK AKSES PINTU DI SERVER...</span>
              </div>
            ) : doorData ? (
              <div className="space-y-4">
                <div className="border border-fluor/20 p-4 bg-fluor/[0.02] space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-fluor/60">KODE KELAS:</span>
                    <span className="text-caution font-bold px-2 py-0.5 border border-caution/40 bg-caution/10">
                      {doorData.classCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fluor/60">STATUS AKSES PINTU:</span>
                    {doorData.isMember ? (
                      <span className="flex items-center space-x-1.5 text-ok font-bold">
                        <Unlock className="w-4 h-4" />
                        <span>TERBUKA (ANGGOTA TERDAFTAR)</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 text-alert font-bold">
                        <Lock className="w-4 h-4" />
                        <span>TERKUNCI (BUKAN ANGGOTA)</span>
                      </span>
                    )}
                  </div>
                  {doorData.isMember && (
                    <div className="flex justify-between items-center pt-1 border-t border-fluor/10">
                      <span className="text-fluor/60">NOMOR MEJA SISWA:</span>
                      <span className="text-neon-cyan font-bold">
                        {doorData.seatIndex !== null && doorData.seatIndex !== undefined
                          ? `MEJA #${doorData.seatIndex + 1}`
                          : "MEJA GURU / ASISTEN"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Buka Gembok jika Pintu Terkunci */}
                {!doorData.isMember && (
                  <form onSubmit={handleJoinClassFromDoor} className="border border-alert/40 bg-alert/5 p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-alert text-xs font-mono">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>Masukkan kode kelas untuk membuka gembok dan mendaftar meja siswa:</span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={doorCodeInput}
                        onChange={(e) => setDoorCodeInput(e.target.value)}
                        placeholder="KODE KELAS (misal: SIJA-10A)"
                        className="font-mono text-xs uppercase"
                        disabled={doorSubmitting}
                      />
                      <Button type="submit" variant="default" size="sm" disabled={doorSubmitting} className="whitespace-nowrap">
                        {doorSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="flex items-center space-x-1">
                            <Key className="w-3.5 h-3.5" />
                            <span>BUKA KUNCI</span>
                          </span>
                        )}
                      </Button>
                    </div>

                    {doorError && (
                      <div className="text-alert font-mono text-[11px] leading-tight">
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
                        className="flex-1 space-x-2"
                        onClick={() => {
                          closePanel();
                          router.push(
                            doorData.classId ? `/dunia/kelas/${doorData.classId}` : "/dunia"
                          );
                        }}
                      >
                        <span className="font-hud text-lg tracking-wider">[E] MASUK KE KELAS 3D</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          closePanel();
                          router.push(
                            doorData.classId ? `/kelas/${doorData.classId}` : "/kelas"
                          );
                        }}
                      >
                        <span>MODE CEPAT (2D)</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        closePanel();
                        router.push("/kelas");
                      }}
                    >
                      <span>LIHAT DAFTAR KELAS (MODE CEPAT)</span>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={closePanel}>
                    KEMBALI KE LORONG
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 2. MODAL MADING GLOBAL (3.2 & Tahap 4) */}
        {activePanel === "mading" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-neon-cyan">
                <LayoutGrid className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} MADING SEKOLAH GLOBAL
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                PAPAN PENGUMUMAN & DISKUSI
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Pusat pengumuman dan diskusi umum seluruh warga sekolah. Akses topik terhangat,
                tanya jawab jaringan, dan kolaborasi umum.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border border-fluor/20 p-3 bg-night hover:border-fluor/40 transition-colors">
                <div className="flex justify-between text-xs font-mono text-caution mb-1">
                  <span>JARINGAN & SERVER</span>
                  <span>1 jam yang lalu</span>
                </div>
                <h4 className="font-sign text-base uppercase text-fluor">
                  Konfigurasi BGP Routing Multi-Homing untuk Praktik Lab Komputer
                </h4>
                <p className="font-body text-xs text-fluor/60 mt-1 line-clamp-1">
                  Prefix list dan local preference gateway di MikroTik CHR.
                </p>
              </div>

              <div className="border border-fluor/20 p-3 bg-night hover:border-fluor/40 transition-colors">
                <div className="flex justify-between text-xs font-mono text-neon-cyan mb-1">
                  <span>VIRTUALISASI</span>
                  <span>3 jam yang lalu</span>
                </div>
                <h4 className="font-sign text-base uppercase text-fluor">
                  Rekomendasi Lingkungan Docker Container untuk Simulasi Router
                </h4>
                <p className="font-body text-xs text-fluor/60 mt-1 line-clamp-1">
                  Efisiensi container vs Proxmox VE pada server lab SIJA.
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
                  router.push("/mading");
                }}
              >
                <span className="font-hud text-lg tracking-wider">BUKA MADING PENUH</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                TUTUP PAPAN
              </Button>
            </div>
          </div>
        )}

        {/* 3. MODAL PERPUSTAKAAN TERBUKA (3.2 & Tahap 4) */}
        {activePanel === "library" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-ok">
                <BookOpen className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} PERPUSTAKAAN DIGITAL
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                SUMBER BELAJAR TERBUKA
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Koleksi modul ajar, panduan praktikum lab komputer, dan materi keahlian SIJA yang
                dapat diunduh secara bebas oleh seluruh siswa.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 border border-fluor/20 flex items-center justify-between">
                <div>
                  <div className="text-fluor font-semibold">Panduan MikroTik MTCNA — SIJA BAZMA</div>
                  <div className="text-fluor/50 text-[11px]">Format: PDF (8.5 MB) // Jaringan & Server</div>
                </div>
                <Badge variant="ok">TERSEDIA</Badge>
              </div>
              <div className="p-3 border border-fluor/20 flex items-center justify-between">
                <div>
                  <div className="text-fluor font-semibold">Modul Praktikum Administrasi Linux Debian 12</div>
                  <div className="text-fluor/50 text-[11px]">Format: PDF (5.2 MB) // Sistem Operasi</div>
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
                  router.push("/perpustakaan");
                }}
              >
                <span className="font-hud text-lg tracking-wider">BUKA KATALOG PERPUSTAKAAN</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={closePanel}>
                KEMBALI KE LORONG
              </Button>
            </div>
          </div>
        )}

        {/* 4. MODAL LOKER SISWA (3.2 & Tahap 4) */}
        {activePanel === "locker" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-caution">
                <User className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} LOKER SISWA
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                LOKER PRIBADI
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Penyimpanan identitas dan inventaris profil akun siswa Anda di kawasan SMK TI BAZMA.
              </p>
            </div>

            {lokerLoading ? (
              <div className="p-8 border border-fluor/20 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-caution">
                <Loader2 className="w-6 h-6 animate-spin text-caution" />
                <span>MEMUAT DATA IDENTITAS LOKER DARI DATABASE...</span>
              </div>
            ) : lokerData?.isLoggedIn && lokerData.user ? (
              <div className="space-y-4">
                <div className="border border-fluor/20 p-4 space-y-4 font-mono text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-night border-2 border-caution flex items-center justify-center">
                        <User className="w-6 h-6 text-fluor/80" />
                      </div>
                      <div>
                        <div className="font-sign text-lg text-fluor uppercase">
                          {lokerData.user.displayName || lokerData.user.name}
                        </div>
                        <div className="text-caution">
                          @{lokerData.user.username || "pengguna"} {" // "} {lokerData.user.role}
                        </div>
                      </div>
                    </div>
                    <Badge variant="cyan">AKUN TERVERIFIKASI</Badge>
                  </div>

                  {/* Bio dengan Fitur Edit Cepat */}
                  <div className="pt-2 border-t border-fluor/10 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] text-fluor/60">
                      <span>BIO PENGGUNA:</span>
                      {!isEditingBio && (
                        <button
                          onClick={() => setIsEditingBio(true)}
                          className="flex items-center space-x-1 text-caution hover:underline"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>UBAH</span>
                        </button>
                      )}
                    </div>

                    {isEditingBio ? (
                      <div className="space-y-2">
                        <Input
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          placeholder="Tulis status/bio Anda (maks 200 karakter)"
                          className="font-mono text-xs"
                          maxLength={200}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={handleSaveBio} disabled={bioSaving}>
                            {bioSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "SIMPAN"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingBio(false)}>
                            BATAL
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="font-body text-xs text-fluor/80 italic bg-fluor/5 p-2 border border-fluor/10">
                        &quot;{lokerData.user.bio || "Belum ada bio. Klik ubah untuk mengisi."}&quot;
                      </div>
                    )}

                    {bioNotice && (
                      <div className="text-ok font-mono text-[11px] pt-1">
                        {bioNotice}
                      </div>
                    )}
                  </div>

                  {/* Daftar Kelas yang Diikuti */}
                  <div className="pt-2 border-t border-fluor/10 space-y-2">
                    <span className="text-[11px] text-fluor/60 uppercase">KELAS YANG DIIKUTI:</span>
                    {lokerData.classes.length === 0 ? (
                      <div className="text-fluor/50 text-xs italic">
                        Belum bergabung ke kelas mana pun. Kunjungi pintu kelas di lorong.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {lokerData.classes.map((c) => (
                          <div key={c.classId} className="flex justify-between items-center p-2 border border-fluor/15 bg-night">
                            <span className="text-fluor font-semibold">{c.className}</span>
                            <span className="text-caution">
                              {c.seatIndex !== null ? `MEJA #${c.seatIndex + 1}` : "GURU"}
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
                    className="flex-1 space-x-2"
                    onClick={() => {
                      closePanel();
                      router.push("/profil");
                    }}
                  >
                    <span className="font-hud text-lg tracking-wider">BUKA HALAMAN PROFIL LENGKAP</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={closePanel}>
                    KUNCI LOKER & KEMBALI
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-alert/40 bg-alert/5 p-6 text-center space-y-4">
                <ShieldAlert className="w-10 h-10 text-alert mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-sign text-xl uppercase text-alert">LOKER TERKUNCI</h3>
                  <p className="font-body text-xs text-fluor/70">
                    Anda belum masuk akun. Loker hanya dapat diakses oleh pengguna yang memiliki akun terdaftar.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      closePanel();
                      router.push("/masuk");
                    }}
                  >
                    MASUK KE AKUN
                  </Button>
                  <Button variant="outline" size="sm" onClick={closePanel}>
                    TUTUP
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. MODAL CERMIN KOSMETIK (3.2 & Tahap 4) */}
        {activePanel === "mirror" && (
          <div className="space-y-6">
            <div className="border-b border-fluor/20 pb-4 space-y-2">
              <div className="flex items-center space-x-2 text-neon-pink">
                <Sparkles className="w-6 h-6" />
                <span className="font-hud text-xl tracking-widest uppercase">
                  {"//"} CERMIN KOSMETIK
                </span>
              </div>
              <h2 className="font-sign text-3xl sm:text-4xl uppercase tracking-wide text-fluor">
                BINGKAI AVATAR DARI KATALOG
              </h2>
              <p className="font-body text-xs sm:text-sm text-fluor/70">
                Katalog resmi kosmetik visual: pilih bingkai avatar yang tampil di kartu meja siswa
                dan cermin lorong. Pilihan tersimpan langsung ke akun Anda.
              </p>
            </div>

            {cerminLoading ? (
              <div className="p-8 border border-fluor/20 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-caution">
                <Loader2 className="w-6 h-6 animate-spin text-caution" />
                <span>MEMUAT KATALOG KOSMETIK CERMIN DARI DATABASE...</span>
              </div>
            ) : cerminData ? (
              <div className="space-y-4">
                {frameSavedNotice && (
                  <div className="p-3 border border-ok bg-ok/10 text-ok font-mono text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Bingkai avatar berhasil disimpan ke profil Anda!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {/* Opsi Tanpa Bingkai */}
                  <button
                    onClick={() => setSelectedFrameId(null)}
                    className={`p-3 border text-left transition-colors flex items-center justify-between ${
                      selectedFrameId === null
                        ? "border-caution bg-caution/10"
                        : "border-fluor/20 bg-night hover:border-fluor/40"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 border border-fluor/30 flex items-center justify-center bg-night">
                        <User className="w-3.5 h-3.5 text-fluor/70" />
                      </div>
                      <div>
                        <div className="font-semibold text-fluor">Tanpa Bingkai</div>
                        <div className="text-[10px] text-fluor/50">Tampilan standar</div>
                      </div>
                    </div>
                    {selectedFrameId === null && <Check className="w-4 h-4 text-caution" />}
                  </button>

                  {/* Opsi dari Database */}
                  {cerminData.frames.map((frame) => {
                    const isSelected = selectedFrameId === frame.id;
                    return (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrameId(frame.id)}
                        className={`p-3 border text-left transition-colors flex items-center justify-between ${
                          isSelected
                            ? "border-caution bg-caution/10"
                            : "border-fluor/20 bg-night hover:border-fluor/40"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 border-2 border-caution flex items-center justify-center bg-night">
                            <User className="w-3.5 h-3.5 text-caution" />
                          </div>
                          <div>
                            <div className="font-semibold text-fluor">{frame.name}</div>
                            <div className="text-[10px] text-fluor/50 line-clamp-1">
                              {frame.description || "Katalog resmi"}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-caution" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="default"
                    size="lg"
                    className="flex-1 space-x-2"
                    onClick={handleSaveFrame}
                    disabled={frameSaving}
                  >
                    {frameSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="font-hud text-lg tracking-wider">
                        PASANG BINGKAI & SIMPAN KE AKUN
                      </span>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={closePanel}>
                    TUTUP CERMIN
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
