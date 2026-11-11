"use client";

import * as React from "react";
import { User, Settings, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";

// Katalog Resmi Bingkai Avatar (DESIGN.md: Katalog saja, tanpa upload pengguna)
const avatarFrames = [
  { id: "frame-none", name: "Tanpa Bingkai", desc: "Tampilan avatar standar", borderClass: "border-fluor/30" },
  { id: "frame-caution", name: "Neon Caution", desc: "Aksen kuning rambu menyala", borderClass: "border-caution shadow-[0_0_8px_rgba(242,194,0,0.5)]" },
  { id: "frame-cyan", name: "Cyan Circuit", desc: "Garis sirkuit biru kehijauan", borderClass: "border-neon-cyan shadow-[0_0_8px_rgba(92,225,255,0.5)]" },
  { id: "frame-vcr", name: "Monochrome VCR", desc: "Pola scanline retro tajam", borderClass: "border-fluor border-double border-4" },
];

// Katalog Resmi Efek Profil GSAP (DESIGN.md: configKey ke komponen GSAP)
const profileEffects = [
  { id: "effect-none", name: "Tanpa Efek", desc: "Profil statis tanpa animasi latar" },
  { id: "effect-moon", name: "Bulan Cincin", desc: "Efek cincin cahaya halus GSAP" },
  { id: "effect-neon-pulse", name: "Neon Pulse", desc: "Denyut cahaya lampu lorong sekolah" },
  { id: "effect-scanline", name: "CRT Scanline", desc: "Garis pendar layar tabung retro" },
];

export default function ProfilPage() {
  const { data: session } = authClient.useSession();
  const [selectedFrame, setSelectedFrame] = React.useState("frame-caution");
  const [selectedEffect, setSelectedEffect] = React.useState("effect-moon");
  const [fastMode, setFastMode] = React.useState(true);
  const [nightMode, setNightMode] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [graphicsQuality, setGraphicsQuality] = React.useState<"low" | "medium" | "high">("medium");
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleSaveSettings = () => {
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
      <div className="border-b border-fluor/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-caution mb-1">
            <User className="w-5 h-5" />
            <span className="font-hud text-lg tracking-widest uppercase">
              {"//"} LOKER PRIBADI & CERMIN KOSMETIK
            </span>
          </div>
          <h1 className="font-sign text-3xl sm:text-4xl text-fluor tracking-wide uppercase">
            PENGATURAN AKUN & PROFIL
          </h1>
          <p className="font-body text-xs sm:text-sm text-fluor/70 mt-1">
            Sesuaikan identitas virtual Anda, pilih bingkai avatar dari katalog resmi, dan atur
            preferensi tampilan Mode Cepat / Dunia Sekolah.
          </p>
        </div>

        <Badge variant="cyan" className="self-start sm:self-auto font-mono">
          USER ID: {user?.id ? user.id.slice(0, 10) : "TAMU-01"}
        </Badge>
      </div>

      {saveSuccess && (
        <div className="p-3 border border-ok/60 bg-ok/10 text-ok text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Pengaturan loker dan preferensi profil berhasil disimpan!</span>
        </div>
      )}

      {/* Kartu Profil / Kartu Meja Siswa (Preview) */}
      <Card className="border-fluor/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-caution">KARTU MEJA SISWA (PREVIEW)</CardTitle>
            <Badge variant="outline">TAMPIL DI MEJA SISWA & CERMIN</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 border border-fluor/15 bg-fluor/[0.02]">
            {/* Avatar Preview dengan Bingkai Terpilih */}
            <div
              className={`w-24 h-24 bg-night flex items-center justify-center border-2 transition-all ${
                activeFrameObj?.borderClass || "border-fluor/30"
              }`}
            >
              <User className="w-12 h-12 text-fluor/70" />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1 font-mono">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-sign text-2xl text-fluor uppercase">
                  {user?.name || "Siswa SMK TI BAZMA"}
                </span>
                <Badge variant="caution">
                  {(user as { role?: string })?.role || "STUDENT"}
                </Badge>
              </div>

              <div className="text-xs text-neon-cyan">
                @{(user as { username?: string })?.username || "ahmad_sija"} • {user?.email || "siswa@sekolah.id"}
              </div>

              <div className="text-xs text-fluor/60 pt-2 border-t border-fluor/10">
                Efek Aktif: <span className="text-fluor font-semibold">{selectedEffect.replace("effect-", "").toUpperCase()}</span>
                {" • "}
                Bingkai: <span className="text-fluor font-semibold">{activeFrameObj?.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION CERMIN: KATALOG RESMI BINGKAI & EFEK (DESIGN.md) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Katalog Bingkai Avatar */}
        <div className="border border-fluor/30 bg-night p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
            <span className="font-hud text-lg tracking-widest text-caution">
              [CERMIN // BINGKAI AVATAR]
            </span>
            <span className="font-mono text-[11px] text-fluor/50">KATALOG RESMI</span>
          </div>
          <div className="space-y-2.5">
            {avatarFrames.map((frame) => (
              <label
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`p-3 border block cursor-pointer transition-colors ${
                  selectedFrame === frame.id
                    ? "border-caution bg-caution/10"
                    : "border-fluor/20 bg-night hover:border-fluor/40"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-fluor uppercase">{frame.name}</span>
                  {selectedFrame === frame.id && <Badge variant="caution">DIPAKAI</Badge>}
                </div>
                <div className="font-body text-xs text-fluor/60 mt-1">{frame.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Katalog Efek Profil */}
        <div className="border border-fluor/30 bg-night p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
            <span className="font-hud text-lg tracking-widest text-caution">
              [CERMIN // EFEK PROFIL]
            </span>
            <span className="font-mono text-[11px] text-fluor/50">KOMPONEN GSAP</span>
          </div>
          <div className="space-y-2.5">
            {profileEffects.map((effect) => (
              <label
                key={effect.id}
                onClick={() => setSelectedEffect(effect.id)}
                className={`p-3 border block cursor-pointer transition-colors ${
                  selectedEffect === effect.id
                    ? "border-neon-cyan bg-neon-cyan/10"
                    : "border-fluor/20 bg-night hover:border-fluor/40"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-fluor uppercase">{effect.name}</span>
                  {selectedEffect === effect.id && <Badge variant="cyan">DIPAKAI</Badge>}
                </div>
                <div className="font-body text-xs text-fluor/60 mt-1">{effect.desc}</div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION LOKER: PENGATURAN DUNIA (worldSettings) */}
      <div className="border border-fluor/30 bg-night p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-fluor/15 pb-3">
          <div className="flex items-center space-x-2 text-caution">
            <Settings className="w-5 h-5" />
            <h3 className="font-sign text-xl uppercase tracking-wider">
              LOKER PENGATURAN SISTEM (WORLD SETTINGS)
            </h3>
          </div>
          <span className="font-mono text-xs text-fluor/60">KONFIGURASI PENGGUNA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          {/* Sakelar Mode Cepat */}
          <div className="p-4 border border-fluor/20 bg-night flex items-center justify-between">
            <div>
              <div className="font-bold text-fluor uppercase">MODE CEPAT (2D)</div>
              <div className="text-fluor/60 text-[11px] mt-0.5">
                Gunakan antarmuka panel 2D tanpa grafis 3D
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFastMode(!fastMode)}
              className={`px-3 py-1 border font-bold uppercase transition-colors cursor-pointer ${
                fastMode
                  ? "bg-caution text-night border-caution"
                  : "bg-night text-fluor/60 border-fluor/30"
              }`}
            >
              {fastMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* Sakelar Mode Malam */}
          <div className="p-4 border border-fluor/20 bg-night flex items-center justify-between">
            <div>
              <div className="font-bold text-fluor uppercase">TEMA PENCAHAYAAN</div>
              <div className="text-fluor/60 text-[11px] mt-0.5">
                Sekolah Tengah Malam (Jam 02:00) vs Pagi
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNightMode(!nightMode)}
              className={`px-3 py-1 border font-bold uppercase transition-colors cursor-pointer ${
                nightMode
                  ? "bg-neon-cyan text-night border-neon-cyan"
                  : "bg-night text-fluor/60 border-fluor/30"
              }`}
            >
              {nightMode ? "MALAM" : "PAGI"}
            </button>
          </div>

          {/* Sakelar Efek Suara */}
          <div className="p-4 border border-fluor/20 bg-night flex items-center justify-between">
            <div>
              <div className="font-bold text-fluor uppercase">EFEK SUARA AMBIENCE</div>
              <div className="text-fluor/60 text-[11px] mt-0.5">
                Dengung neon & suara lorong (default mati)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1 border font-bold uppercase transition-colors cursor-pointer ${
                soundEnabled
                  ? "bg-ok text-night border-ok"
                  : "bg-night text-fluor/60 border-fluor/30"
              }`}
            >
              {soundEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Pilihan Kualitas Grafik */}
          <div className="p-4 border border-fluor/20 bg-night flex items-center justify-between">
            <div>
              <div className="font-bold text-fluor uppercase">KUALITAS GRAFIK 3D</div>
              <div className="text-fluor/60 text-[11px] mt-0.5">
                Resolusi tekstur dan pasca-proses VHS
              </div>
            </div>
            <select
              value={graphicsQuality}
              onChange={(e) => setGraphicsQuality(e.target.value as "low" | "medium" | "high")}
              className="border border-fluor/30 bg-night px-2 py-1 text-fluor text-xs font-mono uppercase focus:border-caution focus:outline-none"
            >
              <option value="low">RENDAH</option>
              <option value="medium">SEDANG</option>
              <option value="high">TINGGI</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-fluor/15 flex justify-end">
          <Button variant="default" size="default" onClick={handleSaveSettings}>
            SIMPAN PENGATURAN LOKER
          </Button>
        </div>
      </div>
    </div>
  );
}
