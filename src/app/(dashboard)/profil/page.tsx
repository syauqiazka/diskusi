"use client";

import * as React from "react";
import { User, Settings, CheckCircle2, Smile } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { getCerminCosmetics, updateUserActiveFrame } from "@/lib/classroom/object-actions";
import { RoleSwitcher } from "@/components/profile/role-switcher";
import { animateProfileEffect } from "@/lib/animations";
import { ImageUploader } from "@/components/ui/image-uploader";

// Katalog Resmi Bingkai Avatar (Palette Fresh Mint & Peach)
const avatarFrames = [
  { id: "frame-none", name: "Tanpa Bingkai", desc: "Tampilan avatar natural", borderClass: "border-border" },
  { id: "frame-mint", name: "Fresh Mint", desc: "Aksen hijau mint cerah & segar", borderClass: "border-primary border-4 shadow-sm" },
  { id: "frame-peach", name: "Warm Peach", desc: "Aksen peach hangat & ramah", borderClass: "border-secondary border-4 shadow-sm" },
  { id: "frame-accent", name: "Indigo Spark", desc: "Aksen indigo ceria untuk siswa aktif", borderClass: "border-accent border-4 shadow-sm" },
];

// Katalog Resmi Efek Profil GSAP
const profileEffects = [
  { id: "effect-none", name: "Tanpa Efek", desc: "Profil statis tanpa animasi latar" },
  { id: "effect-sun", name: "Sinar Pagi", desc: "Pendaran lembut hangat khas pagi hari" },
  { id: "effect-breeze", name: "Kelopak Bunga", desc: "Gerak melayang lembut partikel bunga" },
  { id: "effect-sparkle", name: "Pendar Ceria", desc: "Kerlip bintang lembut dan berseri" },
];

export default function ProfilPage() {
  const { data: session } = authClient.useSession();
  const [selectedFrame, setSelectedFrame] = React.useState("frame-mint");
  const [selectedEffect, setSelectedEffect] = React.useState("effect-sun");
  const [customAvatar, setCustomAvatar] = React.useState<string | null>(null);
  const [fastMode, setFastMode] = React.useState(true);
  const [nightMode, setNightMode] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [graphicsQuality, setGraphicsQuality] = React.useState<"low" | "medium" | "high">("medium");
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  // Jalankan animasi GSAP untuk efek profil terpilih
  React.useEffect(() => {
    if (!avatarRef.current) return;
    const cleanup = animateProfileEffect(avatarRef.current, selectedEffect);
    return cleanup;
  }, [selectedEffect]);

  // Sinkronkan bingkai aktif dari database & avatar lokal
  React.useEffect(() => {
    getCerminCosmetics().then((res) => {
      if (res.activeFrameId) {
        setSelectedFrame(res.activeFrameId);
      }
    });
    const savedAvatar = localStorage.getItem("sakura_custom_avatar");
    if (savedAvatar) {
      setCustomAvatar(savedAvatar);
    }
  }, []);

  const handleSaveSettings = async () => {
    if (selectedFrame !== "frame-none") {
      await updateUserActiveFrame(selectedFrame);
    } else {
      await updateUserActiveFrame(null);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const user = session?.user;
  const activeFrameObj = avatarFrames.find((f) => f.id === selectedFrame);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Halaman Profil */}
      <div className="bg-surface rounded-3xl border-2 border-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 text-text mb-1">
            <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
              <Smile className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text tracking-tight">
              Profil & Pengaturan
            </h1>
          </div>
          <p className="font-body text-sm text-text-muted mt-1">
            Sesuaikan identitas virtual Anda, pilih bingkai avatar resmi, dan atur preferensi tampilan sekolah.
          </p>
        </div>

        <Badge variant="mint" className="self-start sm:self-auto font-display font-semibold">
          ID: {user?.id ? user.id.slice(0, 8) : "Siswa"}
        </Badge>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl border-2 border-ok/30 bg-ok/10 text-ok text-xs font-body font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Pengaturan dan preferensi profil berhasil disimpan!</span>
        </div>
      )}

      {/* Kartu Profil / Kartu Meja Siswa (Preview) */}
      <Card className="rounded-3xl border-2 border-border shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-display font-bold text-text">
              Kartu Siswa (Pratinjau)
            </CardTitle>
            <Badge variant="peach">Tampil di Meja & Cermin</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl border-2 border-border bg-canvas/30">
            {/* Avatar Preview dengan Bingkai Terpilih & Efek GSAP Animasi */}
            <div ref={avatarRef} className="relative">
              {selectedEffect === "effect-sun" && (
                <div className="profile-aura absolute -inset-2.5 rounded-3xl bg-amber-400/30 blur-md pointer-events-none" />
              )}
              {selectedEffect === "effect-breeze" && (
                <>
                  <span className="profile-particle absolute -top-2.5 -left-2 text-pink-400 text-sm select-none pointer-events-none">🌸</span>
                  <span className="profile-particle absolute -bottom-1 -right-2 text-pink-400 text-xs select-none pointer-events-none">🌸</span>
                </>
              )}
              {selectedEffect === "effect-sparkle" && (
                <>
                  <span className="profile-sparkle absolute -top-2.5 -right-1 text-amber-400 text-sm select-none pointer-events-none">✨</span>
                  <span className="profile-sparkle absolute -bottom-2 -left-1 text-amber-400 text-xs select-none pointer-events-none">✨</span>
                </>
              )}
              <div
                className={`w-24 h-24 rounded-3xl bg-surface flex items-center justify-center transition-all shadow-sm relative z-10 overflow-hidden ${
                  activeFrameObj?.borderClass || "border-2 border-border"
                }`}
              >
                {customAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customAvatar}
                    alt="Foto Profil Siswa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-text" />
                )}
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1 font-body">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-display font-bold text-2xl text-text">
                  {user?.name || "Siswa Sekolah"}
                </span>
                <Badge
                  variant={
                    (user as { role?: string })?.role === "SUPERADMIN"
                      ? "ok"
                      : (user as { role?: string })?.role === "ADMIN"
                      ? "peach"
                      : "mint"
                  }
                >
                  {(user as { role?: string })?.role === "SUPERADMIN"
                    ? "Super Admin"
                    : (user as { role?: string })?.role === "ADMIN"
                    ? "Admin (Guru & Staf)"
                    : "Siswa"}
                </Badge>
              </div>

              <div className="text-xs text-text-muted">
                <span className="text-accent font-semibold">@{(user as { username?: string })?.username || "ahmad"}</span> • {user?.email || "siswa@sekolah.id"}
              </div>

              <div className="text-xs text-text-muted pt-2 border-t border-border/40 font-medium">
                Efek: <strong className="text-text">{selectedEffect.replace("effect-", "").toUpperCase()}</strong>
                {" • "}
                Bingkai: <strong className="text-text">{activeFrameObj?.name}</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION PENGELOLAAN PERAN (SUPERADMIN / ADMIN / USER) */}
      <RoleSwitcher
        currentRole={(user as { role?: string })?.role}
        isSuperAdmin={(user as { role?: string })?.role === "SUPERADMIN"}
      />

      {/* SECTION CERMIN: KATALOG RESMI BINGKAI & EFEK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Katalog Bingkai Avatar */}
        <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="font-display font-bold text-lg text-text">
              Bingkai Avatar
            </span>
            <span className="font-body text-xs text-text-muted">Katalog Resmi</span>
          </div>
          <div className="space-y-3">
            {avatarFrames.map((frame) => (
              <label
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`p-4 rounded-2xl border-2 block cursor-pointer transition-all ${
                  selectedFrame === frame.id
                    ? "border-primary bg-primary/15 shadow-xs"
                    : "border-border bg-canvas/30 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between font-body text-xs">
                  <span className="font-display font-bold text-sm text-text">{frame.name}</span>
                  {selectedFrame === frame.id && <Badge variant="mint">Dipakai</Badge>}
                </div>
                <div className="font-body text-xs text-text-muted mt-1">{frame.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Katalog Efek Profil */}
        <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="font-display font-bold text-lg text-text">
              Efek Profil
            </span>
            <span className="font-body text-xs text-text-muted">Animasi Lembut</span>
          </div>
          <div className="space-y-3">
            {profileEffects.map((effect) => (
              <label
                key={effect.id}
                onClick={() => setSelectedEffect(effect.id)}
                className={`p-4 rounded-2xl border-2 block cursor-pointer transition-all ${
                  selectedEffect === effect.id
                    ? "border-secondary bg-secondary/20 shadow-xs"
                    : "border-border bg-canvas/30 hover:border-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between font-body text-xs">
                  <span className="font-display font-bold text-sm text-text">{effect.name}</span>
                  {selectedEffect === effect.id && <Badge variant="peach">Dipakai</Badge>}
                </div>
                <div className="font-body text-xs text-text-muted mt-1">{effect.desc}</div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION UNGGAH FOTO AVATAR (VERCEL BLOB STORAGE) */}
      <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3 className="font-display font-bold text-xl text-text">
              Foto Avatar Pribadi
            </h3>
            <p className="font-body text-xs text-text-muted mt-0.5">
              Unggah foto profil karakter kamu langsung ke Vercel Blob Storage awan.
            </p>
          </div>
          <Badge variant="mint" className="font-display text-xs">Vercel Blob Active</Badge>
        </div>

        <ImageUploader
          value={customAvatar}
          onChange={(url) => {
            setCustomAvatar(url);
            if (url) {
              localStorage.setItem("sakura_custom_avatar", url);
            } else {
              localStorage.removeItem("sakura_custom_avatar");
            }
          }}
          label="Foto Profil Siswa"
          description="Format JPG, PNG, atau WebP (Maksimal 10 MB). Foto otomatis tampil di kartu siswa, cermin kelas, dan meja."
        />
      </div>

      {/* SECTION PENGATURAN SISTEM (WORLD SETTINGS) */}
      <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center space-x-2.5 text-text">
            <div className="w-9 h-9 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-xl text-text">
              Preferensi Eksplorasi
            </h3>
          </div>
          <span className="font-body text-xs text-text-muted">Pengaturan Pengguna</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-body text-xs">
          {/* Sakelar Mode Cepat */}
          <div className="p-4 rounded-2xl border-2 border-border bg-canvas/30 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-sm text-text">Mode Cepat (2D)</div>
              <div className="text-text-muted text-xs mt-0.5">
                Akses seluruh fitur kelas dalam format 2D
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFastMode(!fastMode)}
              className={`px-3.5 py-1 rounded-xl font-display font-bold text-xs border transition-all cursor-pointer ${
                fastMode
                  ? "bg-primary text-text border-primary/60 shadow-xs"
                  : "bg-surface text-text-muted border-border hover:text-text"
              }`}
            >
              {fastMode ? "Aktif" : "Mati"}
            </button>
          </div>

          {/* Sakelar Suasana Kawasan */}
          <div className="p-4 rounded-2xl border-2 border-border bg-canvas/30 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-sm text-text">Fase Suasana</div>
              <div className="text-text-muted text-xs mt-0.5">
                Pencahayaan anime: Siang / Malam
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNightMode(!nightMode)}
              className={`px-3.5 py-1 rounded-xl font-display font-bold text-xs border transition-all cursor-pointer ${
                nightMode
                  ? "bg-secondary text-text border-secondary/60 shadow-xs"
                  : "bg-surface text-text-muted border-border hover:text-text"
              }`}
            >
              {nightMode ? "Malam" : "Siang"}
            </button>
          </div>

          {/* Sakelar Efek Suara */}
          <div className="p-4 rounded-2xl border-2 border-border bg-canvas/30 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-sm text-text">Efek Suara Ambience</div>
              <div className="text-text-muted text-xs mt-0.5">
                Suara lingkungan sekolah (default mati)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3.5 py-1 rounded-xl font-display font-bold text-xs border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-primary text-text border-primary/60 shadow-xs"
                  : "bg-surface text-text-muted border-border hover:text-text"
              }`}
            >
              {soundEnabled ? "Aktif" : "Mati"}
            </button>
          </div>

          {/* Pilihan Kualitas Grafik */}
          <div className="p-4 rounded-2xl border-2 border-border bg-canvas/30 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-sm text-text">Kualitas Grafis 3D</div>
              <div className="text-text-muted text-xs mt-0.5">
                Resolusi bayangan & render kanvas
              </div>
            </div>
            <select
              value={graphicsQuality}
              onChange={(e) => setGraphicsQuality(e.target.value as "low" | "medium" | "high")}
              className="rounded-xl border-2 border-border bg-surface px-3 py-1 font-display font-semibold text-xs text-text focus:outline-none"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <Button
            variant="default"
            size="default"
            onClick={handleSaveSettings}
            className="rounded-2xl font-display font-bold text-sm shadow-sm px-6"
          >
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </div>
  );
}
