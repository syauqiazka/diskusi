"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Layers,
  MapPin,
  Clock,
  Footprints,
  X,
  Users,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { useSakuraStore, FloorCutaway, FieldMarkingMode, TimePreset } from "@/stores/use-sakura-store";
import { SAKURA_TELEPORT_POINTS } from "@/lib/world/sakura-campus-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SakuraOverlayUI() {
  const cameraMode = useSakuraStore((s) => s.cameraMode);
  const selectedFloor = useSakuraStore((s) => s.selectedFloor);
  const fieldMode = useSakuraStore((s) => s.fieldMode);
  const hoveredRoom = useSakuraStore((s) => s.hoveredRoom);
  const activeRoomDetail = useSakuraStore((s) => s.activeRoomDetail);
  const timePreset = useSakuraStore((s) => s.timePreset);
  const timeHour = useSakuraStore((s) => s.timeHour);
  const showMinimap = useSakuraStore((s) => s.showMinimap);

  const setCameraMode = useSakuraStore((s) => s.setCameraMode);
  const setSelectedFloor = useSakuraStore((s) => s.setSelectedFloor);
  const setFieldMode = useSakuraStore((s) => s.setFieldMode);
  const teleportTo = useSakuraStore((s) => s.teleportTo);
  const setTimePreset = useSakuraStore((s) => s.setTimePreset);
  const setTimeHour = useSakuraStore((s) => s.setTimeHour);
  const toggleMinimap = useSakuraStore((s) => s.toggleMinimap);
  const setActiveRoomDetail = useSakuraStore((s) => s.setActiveRoomDetail);

  const [showTeleportMenu, setShowTeleportMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const floors: { id: FloorCutaway; label: string }[] = [
    { id: "ALL", label: "Semua" },
    { id: "1F", label: "Lantai 1" },
    { id: "2F", label: "Lantai 2" },
    { id: "3F", label: "Lantai 3" },
    { id: "ROOF", label: "Atap (Okujo)" },
  ];

  const fieldModes: { id: FieldMarkingMode; label: string }[] = [
    { id: "BOTH", label: "Keduanya" },
    { id: "SOCCER", label: "Sepak Bola" },
    { id: "BASEBALL", label: "Bisbol" },
  ];

  return (
    <>
      {/* 1. Header Kontrol Atas (Mode Kamera, Cutaway Lantai, Mode Lapangan) */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2 max-w-[90vw]">
        {/* Toggle Mode Kamera */}
        <div className="bg-surface/95 border-2 border-border p-1.5 rounded-2xl flex items-center gap-1 shadow-md backdrop-blur-md">
          <Button
            size="sm"
            variant={cameraMode === "orbit" ? "default" : "ghost"}
            className="rounded-xl px-3 h-8 font-display font-bold text-xs"
            onClick={() => setCameraMode("orbit")}
          >
            <Compass className="w-3.5 h-3.5 mr-1" />
            Orbit
          </Button>
          <Button
            size="sm"
            variant={cameraMode === "walk" ? "default" : "ghost"}
            className="rounded-xl px-3 h-8 font-display font-bold text-xs"
            onClick={() => setCameraMode("walk")}
          >
            <Footprints className="w-3.5 h-3.5 mr-1" />
            Jalan (FPS)
          </Button>
        </div>

        {/* Pemilih Lantai (Cutaway Selector) */}
        <div className="bg-surface/95 border-2 border-border p-1.5 rounded-2xl flex items-center gap-1 shadow-md backdrop-blur-md">
          <div className="px-2 font-display font-bold text-xs text-text-muted flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Lantai:</span>
          </div>
          {floors.map((fl) => (
            <button
              key={fl.id}
              onClick={() => setSelectedFloor(fl.id)}
              className={`px-3 py-1 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer ${
                selectedFloor === fl.id
                  ? "bg-primary text-surface shadow-xs"
                  : "hover:bg-canvas text-text-muted"
              }`}
            >
              {fl.label}
            </button>
          ))}
        </div>

        {/* Toggle Markings Lapangan Olahraga */}
        <div className="bg-surface/95 border-2 border-border p-1.5 rounded-2xl flex items-center gap-1 shadow-md backdrop-blur-md hidden sm:flex">
          <span className="px-2 font-display font-bold text-xs text-text-muted">Lapangan:</span>
          {fieldModes.map((fm) => (
            <button
              key={fm.id}
              onClick={() => setFieldMode(fm.id)}
              className={`px-2.5 py-1 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer ${
                fieldMode === fm.id
                  ? "bg-secondary text-text font-bold shadow-xs"
                  : "hover:bg-canvas text-text-muted"
              }`}
            >
              {fm.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tombol Aksi Kanan Atas (Teleport, Waktu, Minimap) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Tombol Teleportasi */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            className="rounded-2xl border-2 bg-surface/95 shadow-md font-display font-bold text-xs"
            onClick={() => setShowTeleportMenu(!showTeleportMenu)}
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-accent" />
            Teleport
          </Button>

          {/* Dropdown Menu Teleportasi */}
          {showTeleportMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border-2 border-border rounded-2xl p-2 shadow-xl backdrop-blur-md z-40 space-y-1">
              <div className="px-2 py-1 text-[11px] font-display font-bold text-text-muted uppercase border-b border-border">
                Pilih Lokasi Kampus
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5 pt-1">
                {SAKURA_TELEPORT_POINTS.map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => {
                      teleportTo(pt.pos);
                      setShowTeleportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-canvas text-xs font-display font-bold text-text flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>{pt.name}</span>
                    <MapPin className="w-3 h-3 text-text-muted" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tombol Pengatur Waktu */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            className="rounded-2xl border-2 bg-surface/95 shadow-md font-display font-bold text-xs"
            onClick={() => setShowTimeMenu(!showTimeMenu)}
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 text-secondary-dark" />
            {timePreset.toUpperCase()}
          </Button>

          {showTimeMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-surface border-2 border-border rounded-2xl p-3 shadow-xl z-40 space-y-3">
              <div className="flex items-center justify-between text-xs font-display font-bold border-b border-border pb-1.5">
                <span>Waktu Hari ({timeHour.toFixed(1)}h)</span>
                <Badge variant="mint">{timePreset}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(["morning", "noon", "sunset", "night"] as TimePreset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTimePreset(p)}
                    className={`py-1.5 rounded-xl text-xs font-display font-bold border capitalize transition-colors cursor-pointer ${
                      timePreset === p
                        ? "bg-primary text-surface border-primary"
                        : "bg-canvas text-text-muted border-border hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="0.5"
                  value={timeHour}
                  onChange={(e) => setTimeHour(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Toggle Minimap */}
        <Button
          size="sm"
          variant="outline"
          className="rounded-2xl border-2 bg-surface/95 shadow-md font-display font-bold text-xs p-2.5"
          onClick={toggleMinimap}
          title="Buka / Tutup Minimap"
        >
          <Compass className="w-4 h-4 text-primary" />
        </Button>

        {/* Tombol Petunjuk Kontrol */}
        <Button
          size="sm"
          variant="outline"
          className="rounded-2xl border-2 bg-surface/95 shadow-md font-display font-bold text-xs p-2.5"
          onClick={() => setShowHelp(true)}
          title="Petunjuk & Kontrol"
        >
          <HelpCircle className="w-4 h-4 text-accent" />
        </Button>

        {/* Tombol Kembali ke Mode 2D */}
        <Link href="/">
          <Button
            size="sm"
            variant="default"
            className="rounded-2xl shadow-md font-display font-bold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Mode 2D
          </Button>
        </Link>
      </div>

      {/* 3. Minimap 2D Interaktif di Kanan Bawah */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 z-30 w-72 bg-surface/95 border-2 border-border rounded-3xl p-3 shadow-xl backdrop-blur-md select-none">
          <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-xs text-text">Minimap Kampus</span>
            </div>
            <button
              onClick={toggleMinimap}
              className="text-text-muted hover:text-text cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Peta Skematik 2D sesuai Site Plan Gambar 1 & 3 */}
          <div className="relative w-full h-44 bg-canvas rounded-2xl border border-border/80 overflow-hidden p-1.5 flex flex-col justify-between text-[9px] font-display font-bold">
            {/* Baris Utara: Gimnasium & Teater */}
            <div className="flex justify-between gap-1">
              <div
                onClick={() => teleportTo([-16, 1.6, -44])}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-900 border border-indigo-400 p-1 rounded-lg text-center cursor-pointer flex-1"
              >
                Aula Teater (800)
              </div>
              <div
                onClick={() => teleportTo([24, 1.6, -43])}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-900 border border-indigo-400 p-1 rounded-lg text-center cursor-pointer flex-1"
              >
                Gimnasium + Kolam
              </div>
            </div>

            {/* Baris Tengah: Gedung Utama & Lapangan */}
            <div className="flex justify-between items-center gap-1 my-1 flex-1">
              <div
                onClick={() => teleportTo([-26, 1.6, 10])}
                className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-900 border border-emerald-500 p-1.5 rounded-lg text-center cursor-pointer w-24 h-full flex flex-col justify-center"
              >
                <span>Gedung Utama</span>
                <span className="text-[8px] opacity-75">3 Lantai + Atap</span>
              </div>
              <div
                onClick={() => teleportTo([22, 1.6, 26])}
                className="bg-green-600/25 hover:bg-green-600/45 text-green-950 border border-green-500 p-1.5 rounded-lg text-center cursor-pointer flex-1 h-full flex flex-col justify-center"
              >
                <span>Lapangan Olahraga</span>
                <span className="text-[8px] opacity-75">Sepak Bola & Bisbol</span>
              </div>
            </div>

            {/* Baris Bawah: Asrama, Air Mancur, Gerbang */}
            <div className="flex justify-between gap-1">
              <div
                onClick={() => teleportTo([-16, 1.6, 14])}
                className="bg-pink-500/20 hover:bg-pink-500/40 text-pink-900 border border-pink-400 p-1 rounded-lg text-center cursor-pointer flex-1"
              >
                Air Mancur
              </div>
              <div
                onClick={() => teleportTo([24, 1.6, 29])}
                className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-900 border border-purple-400 p-1 rounded-lg text-center cursor-pointer flex-1"
              >
                Asrama (200)
              </div>
              <div
                onClick={() => teleportTo([0, 1.6, 42])}
                className="bg-slate-500/20 hover:bg-slate-500/40 text-slate-800 border border-slate-400 p-1 rounded-lg text-center cursor-pointer flex-1"
              >
                Gerbang
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tooltip Nama Ruangan Saat Pointer Mengarah ke Ruangan */}
      {hoveredRoom && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-surface/95 border-2 border-primary rounded-2xl px-4 py-2 shadow-xl backdrop-blur-md pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="font-display font-bold text-sm text-text">
              {hoveredRoom.name}
            </span>
            <Badge variant="mint" className="text-[10px]">
              {hoveredRoom.floor === 4 ? "Okujo" : `Lantai ${hoveredRoom.floor}`}
            </Badge>
          </div>
          <div className="text-xs font-body text-text-muted mt-0.5">
            {hoveredRoom.description}
          </div>
        </div>
      )}

      {/* 5. Modal Dialog Detail Ruangan Saat Diklik */}
      {activeRoomDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 backdrop-blur-xs p-4"
          onClick={() => setActiveRoomDetail(null)}
        >
          <div
            className="w-full max-w-md bg-surface border-2 border-border rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <Badge variant="peach" className="mb-1 text-xs">
                  {activeRoomDetail.floor === 4 ? "Teras Atap (Okujo)" : `Gedung Utama · Lantai ${activeRoomDetail.floor}`}
                </Badge>
                <h3 className="font-display font-bold text-xl text-text">
                  {activeRoomDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveRoomDetail(null)}
                className="p-1 rounded-full hover:bg-canvas text-text-muted hover:text-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-body text-sm text-text-muted leading-relaxed">
              {activeRoomDetail.description}
            </p>

            {activeRoomDetail.capacity && (
              <div className="flex items-center gap-2 text-xs font-display font-bold text-text bg-canvas p-3 rounded-2xl border border-border">
                <Users className="w-4 h-4 text-primary" />
                <span>Kapasitas Ruangan: {activeRoomDetail.capacity}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="rounded-2xl font-display font-bold"
                onClick={() => {
                  teleportTo([activeRoomDetail.position[0] - 32, 1.8, activeRoomDetail.position[2] - 10]);
                  setActiveRoomDetail(null);
                }}
              >
                Kunjungi Ruangan Ini
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Petunjuk Navigasi & Kontrol Kampus */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 backdrop-blur-xs p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-lg bg-surface border-2 border-border rounded-3xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-text">
                  Petunjuk &amp; Navigasi Sakura Academy
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-full hover:bg-canvas text-text-muted hover:text-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-body text-xs text-text-muted">
              <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1.5">
                <div className="font-display font-bold text-sm text-text flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-primary" />
                  <span>Mode Jalan Kaki (FPS)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-text">
                  <li><span className="font-bold">W, A, S, D</span>: Melangkah maju, mundur, ke kiri, atau ke kanan.</li>
                  <li><span className="font-bold">Shift</span>: Berlari cepat menjelajahi area kampus yang luas.</li>
                  <li>Arah pandangan mengikuti posisi kamera.</li>
                </ul>
              </div>

              <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1.5">
                <div className="font-display font-bold text-sm text-text flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-accent" />
                  <span>Mode Orbit (Tampilan Udara)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-text">
                  <li><span className="font-bold">Klik Kiri &amp; Geser</span>: Memutar sudut pandang keliling gedung.</li>
                  <li><span className="font-bold">Scroll Roda Mouse</span>: Memperbesar (zoom in) atau memperkecil (zoom out).</li>
                  <li><span className="font-bold">Klik Kanan &amp; Geser</span>: Menggeser (pan) fokus kamera.</li>
                </ul>
              </div>

              <div className="p-3 bg-canvas rounded-2xl border border-border space-y-1.5">
                <div className="font-display font-bold text-sm text-text flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-secondary-dark" />
                  <span>Fitur Khusus Kampus Anime</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-text">
                  <li><span className="font-bold">Pemotong Lantai (Cutaway)</span>: Pilih 1F, 2F, 3F, atau Atap Okujo untuk melihat susunan ruang dalam Gedung Utama.</li>
                  <li><span className="font-bold">Garis Lapangan</span>: Beralih antara garis Sepak Bola, Bisbol, atau Keduanya.</li>
                  <li><span className="font-bold">Teleportasi</span>: Lompat langsung ke 9 titik strategis seperti Gerbang, Air Mancur, Kelas, Atap, dll.</li>
                  <li><span className="font-bold">Suasana Waktu</span>: Ubah atmosfer pagi fajar, siang terik, sore keemasan (sunset), atau malam bertabur bintang.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="default"
                size="sm"
                className="rounded-2xl font-display font-bold"
                onClick={() => setShowHelp(false)}
              >
                Mengerti &amp; Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
