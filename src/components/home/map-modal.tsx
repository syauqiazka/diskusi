"use client";

import * as React from "react";
import { X, Compass, Layers, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorldStore } from "@/stores/use-world-store";
import { useAchievementStore } from "@/stores/use-achievement-store";
import { useModalAnimation } from "@/components/animations/gsap-animate";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FloorType = "ALL" | "LT1" | "LT2" | "LT3" | "ATAP" | "FASILITAS";

export function MapModal({ isOpen, onClose }: MapModalProps) {
  const { backdropRef, cardRef } = useModalAnimation(isOpen);
  const playerPosition = useWorldStore((s) => s.playerPosition);
  const unlockAchievement = useAchievementStore((s) => s.unlockAchievement);
  const [activeFloor, setActiveFloor] = React.useState<FloorType>("ALL");

  React.useEffect(() => {
    if (isOpen) {
      unlockAchievement("map_opened");
    }
  }, [isOpen, unlockAchievement]);

  if (!isOpen) return null;

  // Master campus coordinate bounds: X: -100..100 (width 200), Z: 0..240 (depth 240)
  const minX = -100;
  const maxX = 100;
  const minZ = 0;
  const maxZ = 240;
  const mapWidth = maxX - minX;
  const mapDepth = maxZ - minZ;

  // Transform campus (X, Z) into SVG viewBox (width: 900, height: 900, padded)
  const toCampusSvgX = (x: number) => ((x - minX) / mapWidth) * 800 + 50;
  const toCampusSvgY = (z: number) => (1 - (z - minZ) / mapDepth) * 800 + 50; // Invert Z so north (+Z) is UP

  // Player position in SVG coordinates
  const playerSvgX = toCampusSvgX(playerPosition[0]);
  const playerSvgY = toCampusSvgY(playerPosition[2]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
    >
      <div
        ref={cardRef}
        className="bg-surface w-full max-w-4xl p-5 sm:p-7 space-y-4 rounded-3xl border-2 border-border shadow-2xl relative flex flex-col max-h-[94vh]"
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-canvas transition-colors"
          aria-label="Tutup Peta"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center space-x-2 text-primary mb-1">
              <Compass className="w-5 h-5 text-emerald-500 animate-spin-slow" />
              <span className="font-display text-xs uppercase tracking-wider text-emerald-600 font-bold">
                Cetak Biru Arsitektur &amp; Denah 2D
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-text font-bold">
              {activeFloor === "ALL" && "Denah Master Kawasan Kampus"}
              {activeFloor === "LT1" && "Gedung Utama - Denah Lantai 1"}
              {activeFloor === "LT2" && "Gedung Utama - Denah Lantai 2"}
              {activeFloor === "LT3" && "Gedung Utama - Denah Lantai 3"}
              {activeFloor === "ATAP" && "Gedung Utama - Teras Atap (Okujo)"}
              {activeFloor === "FASILITAS" && "Fasilitas Olahraga & Seni (Gym & Aula)"}
            </h2>
            <p className="font-body text-xs text-text-muted">
              Sesuai cetak biru tata ruang anime Kyoto Animation &amp; data master `campus.json`.
            </p>
          </div>

          {/* Pemilih Denah / Lantai */}
          <div className="flex flex-wrap items-center gap-1 bg-canvas p-1 rounded-2xl border border-border self-start sm:self-auto">
            <span className="font-display text-xs text-text-muted px-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pilihan:</span>
            </span>
            {(
              [
                { id: "ALL", label: "Kawasan" },
                { id: "LT1", label: "Lantai 1" },
                { id: "LT2", label: "Lantai 2" },
                { id: "LT3", label: "Lantai 3" },
                { id: "ATAP", label: "Atap" },
                { id: "FASILITAS", label: "Fasilitas" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFloor(item.id)}
                className={`px-2.5 py-1 rounded-xl font-display text-xs transition-all cursor-pointer ${
                  activeFloor === item.id
                    ? "bg-primary text-emerald-950 font-bold shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* AREA TAMPILAN DENAH VECTOR RESPONSIF */}
        <div className="flex-1 min-h-[360px] max-h-[520px] w-full bg-[#181a1f] rounded-3xl border-2 border-border/80 overflow-hidden relative shadow-inner flex items-center justify-center p-2">
          {/* 1. DENAH KAWASAN KAMPUS (MASTER PLAN) */}
          {activeFloor === "ALL" && (
            <svg viewBox="0 0 900 900" className="w-full h-full max-h-[480px] select-none">
              {/* Grid Kawasan */}
              <defs>
                <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a2e39" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="900" height="900" fill="#1e222a" rx="20" />
              <rect x="50" y="50" width="800" height="800" fill="url(#campusGrid)" rx="16" />

              {/* Pagar Keliling (x -100..100, z 0..240) */}
              <rect
                x="50"
                y="50"
                width="800"
                height="800"
                fill="none"
                stroke="#475569"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                rx="14"
              />

              {/* Lapangan Sepak Bola + Bisbol + Running Track (Utara) */}
              {/* Track Oval */}
              <rect
                x={toCampusSvgX(-62)}
                y={toCampusSvgY(225)}
                width={toCampusSvgX(62) - toCampusSvgX(-62)}
                height={toCampusSvgY(135) - toCampusSvgY(225)}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="2"
                rx="48"
              />
              {/* Soccer Pitch */}
              <rect
                x={toCampusSvgX(-48)}
                y={toCampusSvgY(215)}
                width={toCampusSvgX(48) - toCampusSvgX(-48)}
                height={toCampusSvgY(145) - toCampusSvgY(215)}
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="2"
                rx="8"
              />
              {/* Center Line & Circle */}
              <line
                x1={toCampusSvgX(0)}
                y1={toCampusSvgY(215)}
                x2={toCampusSvgX(0)}
                y2={toCampusSvgY(145)}
                stroke="#6ee7b7"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={toCampusSvgX(0)}
                cy={toCampusSvgY(180)}
                r="22"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="1.5"
              />
              {/* Baseball Diamond Infield (Brown/Dotted) */}
              <polygon
                points={`
                  ${toCampusSvgX(0)},${toCampusSvgY(160)}
                  ${toCampusSvgX(18)},${toCampusSvgY(180)}
                  ${toCampusSvgX(0)},${toCampusSvgY(200)}
                  ${toCampusSvgX(-18)},${toCampusSvgY(180)}
                `}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <rect
                x={toCampusSvgX(0) - 4}
                y={toCampusSvgY(160) - 4}
                width="8"
                height="8"
                fill="#d97706"
              />
              <rect
                x={toCampusSvgX(18) - 4}
                y={toCampusSvgY(180) - 4}
                width="8"
                height="8"
                fill="#d97706"
              />
              <rect
                x={toCampusSvgX(0) - 4}
                y={toCampusSvgY(200) - 4}
                width="8"
                height="8"
                fill="#d97706"
              />
              <rect
                x={toCampusSvgX(-18) - 4}
                y={toCampusSvgY(180) - 4}
                width="8"
                height="8"
                fill="#d97706"
              />
              <text
                x={toCampusSvgX(0)}
                y={toCampusSvgY(183)}
                textAnchor="middle"
                className="fill-emerald-100 font-display text-[15px] font-bold"
              >
                Lapangan Sepak Bola &amp; Bisbol
              </text>
              <text
                x={toCampusSvgX(0)}
                y={toCampusSvgY(173)}
                textAnchor="middle"
                className="fill-emerald-300 font-body text-[11px]"
              >
                Lintasan Lari Atletik 400m
              </text>

              {/* Lapangan Tenis (Barat Lapangan) */}
              <rect
                x={toCampusSvgX(-90)}
                y={toCampusSvgY(215)}
                width={toCampusSvgX(-68) - toCampusSvgX(-90)}
                height={toCampusSvgY(165) - toCampusSvgY(215)}
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="1.5"
                rx="6"
              />
              <text
                x={toCampusSvgX(-79)}
                y={toCampusSvgY(190)}
                textAnchor="middle"
                className="fill-slate-300 font-display text-[12px] font-bold"
              >
                Tenis (2 Lap)
              </text>

              {/* Taman Koi & Jembatan (Barat Lapangan / Selatan Tenis) */}
              <rect
                x={toCampusSvgX(-90)}
                y={toCampusSvgY(155)}
                width={toCampusSvgX(-68) - toCampusSvgX(-90)}
                height={toCampusSvgY(125) - toCampusSvgY(155)}
                fill="#0f3d3e"
                stroke="#14b8a6"
                strokeWidth="1.5"
                rx="6"
              />
              <text
                x={toCampusSvgX(-79)}
                y={toCampusSvgY(140)}
                textAnchor="middle"
                className="fill-teal-200 font-display text-[12px] font-bold"
              >
                Taman Koi
              </text>

              {/* Dojo Kyudo (Panahan) di Timur Lapangan */}
              <rect
                x={toCampusSvgX(72)}
                y={toCampusSvgY(205)}
                width={toCampusSvgX(90) - toCampusSvgX(72)}
                height={toCampusSvgY(155) - toCampusSvgY(205)}
                fill="#312e81"
                stroke="#6366f1"
                strokeWidth="1.5"
                rx="6"
              />
              <text
                x={toCampusSvgX(81)}
                y={toCampusSvgY(180)}
                textAnchor="middle"
                className="fill-indigo-100 font-display text-[12px] font-bold"
              >
                Dojo Kyudo
              </text>

              {/* GEDUNG UTAMA (3 Lantai + Atap, x -46..46, z 100..120) */}
              <rect
                x={toCampusSvgX(-46)}
                y={toCampusSvgY(120)}
                width={toCampusSvgX(46) - toCampusSvgX(-46)}
                height={toCampusSvgY(100) - toCampusSvgY(120)}
                fill="#064e3b"
                stroke="#34d399"
                strokeWidth="2.5"
                rx="8"
              />
              <text
                x={toCampusSvgX(0)}
                y={toCampusSvgY(112)}
                textAnchor="middle"
                className="fill-emerald-100 font-display text-[16px] font-bold"
              >
                Gedung Utama (3 Lantai + Atap)
              </text>
              <text
                x={toCampusSvgX(0)}
                y={toCampusSvgY(105)}
                textAnchor="middle"
                className="fill-emerald-300 font-body text-[11px]"
              >
                Atrium Kaca, Menara Jam &amp; Kubah Observatorium
              </text>

              {/* Gedung Budaya (Barat Gedung Utama, z 90..115) */}
              <rect
                x={toCampusSvgX(-90)}
                y={toCampusSvgY(115)}
                width={toCampusSvgX(-52) - toCampusSvgX(-90)}
                height={toCampusSvgY(85) - toCampusSvgY(115)}
                fill="#312e81"
                stroke="#818cf8"
                strokeWidth="2"
                rx="8"
              />
              <text
                x={toCampusSvgX(-71)}
                y={toCampusSvgY(102)}
                textAnchor="middle"
                className="fill-indigo-100 font-display text-[13px] font-bold"
              >
                Gedung Budaya
              </text>
              <text
                x={toCampusSvgX(-71)}
                y={toCampusSvgY(94)}
                textAnchor="middle"
                className="fill-indigo-300 font-body text-[10px]"
              >
                Seni &amp; Ruang Teh
              </text>

              {/* Gimnasium + Kolam Indoor (Timur Gedung Utama) */}
              <rect
                x={toCampusSvgX(52)}
                y={toCampusSvgY(120)}
                width={toCampusSvgX(92) - toCampusSvgX(52)}
                height={toCampusSvgY(75) - toCampusSvgY(120)}
                fill="#312e81"
                stroke="#818cf8"
                strokeWidth="2"
                rx="8"
              />
              <text
                x={toCampusSvgX(72)}
                y={toCampusSvgY(102)}
                textAnchor="middle"
                className="fill-indigo-100 font-display text-[14px] font-bold"
              >
                Gimnasium
              </text>
              <text
                x={toCampusSvgX(72)}
                y={toCampusSvgY(92)}
                textAnchor="middle"
                className="fill-indigo-300 font-body text-[10px]"
              >
                Lapangan &amp; Kolam Indoor
              </text>

              {/* BUNDARAN AIR MANCUR (Center 0, 50) */}
              {/* Outer Ring Drop-off */}
              <circle
                cx={toCampusSvgX(0)}
                cy={toCampusSvgY(50)}
                r="44"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="2"
              />
              {/* Granite Plaza */}
              <circle
                cx={toCampusSvgX(0)}
                cy={toCampusSvgY(50)}
                r="30"
                fill="#475569"
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
              {/* Water Basin */}
              <circle
                cx={toCampusSvgX(0)}
                cy={toCampusSvgY(50)}
                r="18"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              {/* Water Center Jet */}
              <circle cx={toCampusSvgX(0)} cy={toCampusSvgY(50)} r="4" fill="#bae6fd" />
              <text
                x={toCampusSvgX(0)}
                y={toCampusSvgY(50) + 4}
                textAnchor="middle"
                className="fill-sky-100 font-display text-[9px] font-bold"
              >
                Air Mancur
              </text>

              {/* Gedung Asrama (Barat Daya, z 30..65) */}
              <rect
                x={toCampusSvgX(-85)}
                y={toCampusSvgY(65)}
                width={toCampusSvgX(-40) - toCampusSvgX(-85)}
                height={toCampusSvgY(30) - toCampusSvgY(65)}
                fill="#312e81"
                stroke="#818cf8"
                strokeWidth="2"
                rx="8"
              />
              <text
                x={toCampusSvgX(-62.5)}
                y={toCampusSvgY(50)}
                textAnchor="middle"
                className="fill-indigo-100 font-display text-[14px] font-bold"
              >
                Asrama (Ryo)
              </text>
              <text
                x={toCampusSvgX(-62.5)}
                y={toCampusSvgY(42)}
                textAnchor="middle"
                className="fill-indigo-300 font-body text-[10px]"
              >
                4 Lantai - 200 Siswa
              </text>

              {/* Aula Teater (Tenggara, z 30..65) */}
              <rect
                x={toCampusSvgX(38)}
                y={toCampusSvgY(68)}
                width={toCampusSvgX(85) - toCampusSvgX(38)}
                height={toCampusSvgY(28) - toCampusSvgY(68)}
                fill="#312e81"
                stroke="#818cf8"
                strokeWidth="2"
                rx="8"
              />
              <text
                x={toCampusSvgX(61.5)}
                y={toCampusSvgY(51)}
                textAnchor="middle"
                className="fill-indigo-100 font-display text-[14px] font-bold"
              >
                Aula Teater
              </text>
              <text
                x={toCampusSvgX(61.5)}
                y={toCampusSvgY(43)}
                textAnchor="middle"
                className="fill-indigo-300 font-body text-[10px]"
              >
                Kapasitas 800 Kursi
              </text>

              {/* Parkir Sepeda & Tamu (Dekat Gerbang Selatan) */}
              <rect
                x={toCampusSvgX(-75)}
                y={toCampusSvgY(25)}
                width={toCampusSvgX(-22) - toCampusSvgX(-75)}
                height={toCampusSvgY(6) - toCampusSvgY(25)}
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
                rx="6"
              />
              <text
                x={toCampusSvgX(-48.5)}
                y={toCampusSvgY(15)}
                textAnchor="middle"
                className="fill-slate-300 font-display text-[12px] font-bold"
              >
                Parkir Sepeda
              </text>

              <rect
                x={toCampusSvgX(22)}
                y={toCampusSvgY(25)}
                width={toCampusSvgX(75) - toCampusSvgX(22)}
                height={toCampusSvgY(6) - toCampusSvgY(25)}
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
                rx="6"
              />
              <text
                x={toCampusSvgX(48.5)}
                y={toCampusSvgY(15)}
                textAnchor="middle"
                className="fill-slate-300 font-display text-[12px] font-bold"
              >
                Parkir Tamu &amp; Drop-off
              </text>

              {/* Jalan Masuk Sakura (Entrance Avenue) */}
              <rect
                x={toCampusSvgX(-6)}
                y={toCampusSvgY(32)}
                width={toCampusSvgX(6) - toCampusSvgX(-6)}
                height={toCampusSvgY(0) - toCampusSvgY(32)}
                fill="#334155"
              />
              {/* Gerbang Utama (0, 0) */}
              <line
                x1={toCampusSvgX(-7)}
                y1={toCampusSvgY(0)}
                x2={toCampusSvgX(7)}
                y2={toCampusSvgY(0)}
                stroke="#f59e0b"
                strokeWidth="5"
              />
              <text
                x={toCampusSvgX(0)}
                y={toCampusSvgY(0) + 16}
                textAnchor="middle"
                className="fill-amber-400 font-display text-[13px] font-bold"
              >
                Gerbang Utama (0,0) ↑
              </text>

              {/* Pos Satpam */}
              <rect
                x={toCampusSvgX(-15)}
                y={toCampusSvgY(8)}
                width="14"
                height="14"
                fill="#334155"
                stroke="#94a3b8"
                strokeWidth="1"
                rx="2"
              />

              {/* Indikator Posisi Pemain Live */}
              <g transform={`translate(${playerSvgX}, ${playerSvgY})`}>
                <circle r="18" fill="#10b981" opacity="0.3" className="animate-ping" />
                <circle r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <polygon points="0,-12 4,-6 -4,-6" fill="#10b981" />
              </g>
            </svg>
          )}

          {/* 2. DENAH GEDUNG UTAMA - LANTAI 1 */}
          {activeFloor === "LT1" && (
            <svg viewBox="0 0 500 780" className="w-full h-full max-h-[480px] select-none">
              <rect width="500" height="780" fill="#181a1f" rx="16" />

              {/* Koridor Tengah */}
              <line
                x1="250"
                y1="40"
                x2="250"
                y2="690"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* KIRI (BARAT) */}
              {/* Kelas 1-A */}
              <rect x="30" y="40" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="130" y="92" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 1-A</text>

              {/* Kelas 1-C */}
              <rect x="30" y="140" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="130" y="192" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 1-C</text>

              {/* Lab IPA */}
              <rect x="30" y="240" width="200" height="90" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="292" textAnchor="middle" className="fill-indigo-100 font-display text-[17px] font-bold">Lab IPA</text>

              {/* Perpustakaan */}
              <rect x="30" y="340" width="200" height="180" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="435" textAnchor="middle" className="fill-indigo-100 font-display text-[18px] font-bold">Perpustakaan</text>

              {/* Ruang Guru */}
              <rect x="30" y="530" width="200" height="150" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="600" textAnchor="middle" className="fill-indigo-100 font-display text-[18px] font-bold">Ruang Guru</text>
              <text x="130" y="625" textAnchor="middle" className="fill-indigo-300 font-body text-[12px]">Shokuin-shitsu</text>

              {/* Kepala Sekolah */}
              <rect x="30" y="690" width="200" height="75" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="735" textAnchor="middle" className="fill-indigo-100 font-display text-[16px] font-bold">Kepala Sekolah</text>

              {/* KANAN (TIMUR) */}
              {/* Kelas 1-B */}
              <rect x="270" y="40" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="370" y="92" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 1-B</text>

              {/* Kelas 1-D */}
              <rect x="270" y="140" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="370" y="192" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 1-D</text>

              {/* Ruang Seni */}
              <rect x="270" y="240" width="200" height="90" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="370" y="292" textAnchor="middle" className="fill-indigo-100 font-display text-[17px] font-bold">Ruang Seni</text>

              {/* Toilet Pria */}
              <rect x="270" y="340" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="390" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Toilet Pria</text>

              {/* Toilet Wanita */}
              <rect x="270" y="435" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="485" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Toilet Wanita</text>

              {/* Tangga */}
              <rect x="270" y="530" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="580" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Tangga</text>

              {/* UKS */}
              <rect x="270" y="625" width="200" height="65" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="370" y="655" textAnchor="middle" className="fill-indigo-100 font-display text-[16px] font-bold">UKS</text>
              <text x="370" y="675" textAnchor="middle" className="fill-indigo-300 font-body text-[11px]">Hokenshitsu</text>

              {/* Genkan Loker Sepatu */}
              <rect x="270" y="690" width="200" height="75" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="4" />
              <text x="370" y="725" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Genkan</text>
              <text x="370" y="748" textAnchor="middle" className="fill-slate-300 font-body text-[12px]">Loker Sepatu</text>

              {/* Pintu Masuk Arrow */}
              <text x="370" y="775" textAnchor="middle" className="fill-emerald-400 font-display text-[12px] font-bold">↑ Pintu Masuk</text>
            </svg>
          )}

          {/* 3. DENAH GEDUNG UTAMA - LANTAI 2 */}
          {activeFloor === "LT2" && (
            <svg viewBox="0 0 500 780" className="w-full h-full max-h-[480px] select-none">
              <rect width="500" height="780" fill="#181a1f" rx="16" />

              <line x1="250" y1="40" x2="250" y2="690" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" />

              {/* KIRI (BARAT) */}
              <rect x="30" y="40" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="130" y="92" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 2-A</text>

              <rect x="30" y="140" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="130" y="192" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 2-C</text>

              <rect x="30" y="240" width="200" height="90" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="292" textAnchor="middle" className="fill-indigo-100 font-display text-[17px] font-bold">Ruang Musik</text>

              <rect x="30" y="340" width="200" height="180" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="425" textAnchor="middle" className="fill-indigo-100 font-display text-[18px] font-bold">Ruang Seminar</text>
              <text x="130" y="450" textAnchor="middle" className="fill-indigo-300 font-body text-[13px]">60 Kursi</text>

              <rect x="30" y="530" width="200" height="150" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="595" textAnchor="middle" className="fill-indigo-100 font-display text-[18px] font-bold">Kafetaria</text>
              <text x="130" y="620" textAnchor="middle" className="fill-indigo-300 font-body text-[12px]">Premium, 120 Kursi</text>

              <rect x="30" y="690" width="200" height="75" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="735" textAnchor="middle" className="fill-indigo-100 font-display text-[16px] font-bold">Lab Bahasa</text>

              {/* KANAN (TIMUR) */}
              <rect x="270" y="40" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="370" y="92" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 2-B</text>

              <rect x="270" y="140" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="370" y="192" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 2-D</text>

              <rect x="270" y="240" width="200" height="90" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="370" y="292" textAnchor="middle" className="fill-indigo-100 font-display text-[17px] font-bold">Ruang Komputer</text>

              <rect x="270" y="340" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="390" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Toilet Pria</text>

              <rect x="270" y="435" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="485" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Toilet Wanita</text>

              <rect x="270" y="530" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="580" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Tangga</text>

              <rect x="270" y="625" width="200" height="65" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="370" y="660" textAnchor="middle" className="fill-indigo-100 font-display text-[16px] font-bold">Konseling</text>

              <rect x="270" y="690" width="200" height="75" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" rx="4" />
              <text x="370" y="725" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Void Atrium</text>
              <text x="370" y="748" textAnchor="middle" className="fill-slate-300 font-body text-[11px]">Tembus ke Lantai 1</text>
            </svg>
          )}

          {/* 4. DENAH GEDUNG UTAMA - LANTAI 3 */}
          {activeFloor === "LT3" && (
            <svg viewBox="0 0 500 780" className="w-full h-full max-h-[480px] select-none">
              <rect width="500" height="780" fill="#181a1f" rx="16" />

              <line x1="250" y1="40" x2="250" y2="690" stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" />

              {/* KIRI (BARAT) */}
              <rect x="30" y="40" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="130" y="92" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 3-A</text>

              <rect x="30" y="140" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="130" y="192" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 3-C</text>

              <rect x="30" y="240" width="200" height="90" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="292" textAnchor="middle" className="fill-indigo-100 font-display text-[17px] font-bold">Ruang Karier</text>

              <rect x="30" y="340" width="200" height="180" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="425" textAnchor="middle" className="fill-indigo-100 font-display text-[18px] font-bold">Ruang Kuliah</text>
              <text x="130" y="450" textAnchor="middle" className="fill-indigo-300 font-body text-[13px]">80 Kursi</text>

              <rect x="30" y="530" width="200" height="150" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="595" textAnchor="middle" className="fill-indigo-100 font-display text-[18px] font-bold">Lab Robotik</text>
              <text x="130" y="620" textAnchor="middle" className="fill-indigo-300 font-body text-[12px]">Klub Sains</text>

              <rect x="30" y="690" width="200" height="75" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="130" y="735" textAnchor="middle" className="fill-indigo-100 font-display text-[16px] font-bold">Ruang Sastra</text>

              {/* KANAN (TIMUR) */}
              <rect x="270" y="40" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="370" y="92" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 3-B</text>

              <rect x="270" y="140" width="200" height="90" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="4" />
              <text x="370" y="192" textAnchor="middle" className="fill-emerald-100 font-display text-[17px] font-bold">Kelas 3-D</text>

              <rect x="270" y="240" width="200" height="90" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="370" y="292" textAnchor="middle" className="fill-indigo-100 font-display text-[17px] font-bold">Studio Rekaman</text>

              <rect x="270" y="340" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="390" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Toilet Pria</text>

              <rect x="270" y="435" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="485" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Toilet Wanita</text>

              <rect x="270" y="530" width="200" height="85" fill="#334155" stroke="#64748b" strokeWidth="1.5" rx="4" />
              <text x="370" y="580" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Tangga</text>

              <rect x="270" y="625" width="200" height="65" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="4" />
              <text x="370" y="660" textAnchor="middle" className="fill-indigo-100 font-display text-[16px] font-bold">Ruang Klub</text>

              <rect x="270" y="690" width="200" height="75" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="4" />
              <text x="370" y="725" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Akses Atap</text>
              <text x="370" y="748" textAnchor="middle" className="fill-slate-300 font-body text-[11px]">Tangga ke Okujo</text>
            </svg>
          )}

          {/* 5. DENAH GEDUNG UTAMA - TERAS ATAP (OKUJO) */}
          {activeFloor === "ATAP" && (
            <svg viewBox="0 0 500 520" className="w-full h-full max-h-[480px] select-none">
              <rect width="500" height="520" fill="#181a1f" rx="16" />

              {/* Observatorium (Kubah Teleskop) */}
              <rect x="30" y="30" width="200" height="110" fill="#312e81" stroke="#818cf8" strokeWidth="2" rx="10" />
              <circle cx="130" cy="75" r="24" fill="#1e1b4b" stroke="#a5b4fc" strokeWidth="1.5" />
              <text x="130" y="118" textAnchor="middle" className="fill-indigo-100 font-display text-[15px] font-bold">Observatorium</text>
              <text x="130" y="132" textAnchor="middle" className="fill-indigo-300 font-body text-[11px]">Kubah Teleskop</text>

              {/* Panel Surya */}
              <rect x="270" y="30" width="200" height="110" fill="#334155" stroke="#64748b" strokeWidth="2" rx="10" />
              <text x="370" y="80" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Panel Surya</text>
              <text x="370" y="105" textAnchor="middle" className="fill-slate-300 font-body text-[12px]">Listrik Hemat Energi</text>

              {/* Teras Atap Utama (Okujo) */}
              <rect x="30" y="160" width="440" height="140" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" rx="12" />
              <text x="250" y="225" textAnchor="middle" className="fill-emerald-100 font-display text-[20px] font-bold">Teras Atap (Okujo)</text>
              <text x="250" y="255" textAnchor="middle" className="fill-emerald-300 font-body text-[13px]">Pagar Jaring Aman, Meja &amp; Bangku Makan Siang Siswa</text>

              {/* Kebun Hijau */}
              <rect x="30" y="320" width="200" height="90" fill="#334155" stroke="#64748b" strokeWidth="2" rx="10" />
              <text x="130" y="372" textAnchor="middle" className="fill-slate-100 font-display text-[16px] font-bold">Kebun Hijau</text>

              {/* Menara Jam */}
              <rect x="270" y="320" width="200" height="90" fill="#312e81" stroke="#818cf8" strokeWidth="2" rx="10" />
              <circle cx="370" cy="355" r="16" fill="#1e1b4b" stroke="#a5b4fc" strokeWidth="1.5" />
              <text x="370" y="396" textAnchor="middle" className="fill-indigo-100 font-display text-[15px] font-bold">Menara Jam</text>

              {/* Pintu Akses Tangga */}
              <rect x="30" y="430" width="440" height="60" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="8" />
              <text x="250" y="466" textAnchor="middle" className="fill-slate-200 font-display text-[15px] font-bold">Pintu Akses Tangga Menuju Lantai 3</text>
            </svg>
          )}

          {/* 6. DENAH FASILITAS (AULA TEATER & GIMNASIUM) */}
          {activeFloor === "FASILITAS" && (
            <svg viewBox="0 0 900 620" className="w-full h-full max-h-[480px] select-none">
              <rect width="900" height="620" fill="#181a1f" rx="16" />

              {/* AULA TEATER (KIRI, 400x560) */}
              <g transform="translate(30, 20)">
                <rect width="400" height="570" fill="#1e222a" stroke="#818cf8" strokeWidth="2" rx="12" />
                <text x="200" y="32" textAnchor="middle" className="fill-indigo-300 font-display text-[16px] font-bold">
                  AULA TEATER (800 KURSI)
                </text>

                {/* Backstage */}
                <rect x="20" y="45" width="360" height="45" fill="#334155" stroke="#64748b" strokeWidth="1" rx="4" />
                <text x="200" y="73" textAnchor="middle" className="fill-slate-200 font-display text-[13px] font-bold">Backstage &amp; Ruang Ganti</text>

                {/* Panggung */}
                <rect x="20" y="100" width="360" height="70" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" rx="6" />
                <text x="200" y="132" textAnchor="middle" className="fill-indigo-100 font-display text-[16px] font-bold">Panggung Utama</text>
                <text x="200" y="152" textAnchor="middle" className="fill-indigo-300 font-body text-[11px]">14 x 8 Meter</text>

                {/* Pit Orkestra */}
                <rect x="20" y="178" width="360" height="30" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" rx="4" />
                <text x="200" y="198" textAnchor="middle" className="fill-indigo-300 font-display text-[12px]">Pit Orkestra</text>

                {/* Blok A, B, C */}
                <rect x="20" y="218" width="112" height="120" fill="#064e3b" stroke="#34d399" strokeWidth="1" rx="4" />
                <text x="76" y="270" textAnchor="middle" className="fill-emerald-100 font-display text-[14px] font-bold">Blok A</text>
                <text x="76" y="290" textAnchor="middle" className="fill-emerald-300 font-body text-[10px]">180 Kursi</text>

                <rect x="144" y="218" width="112" height="120" fill="#064e3b" stroke="#34d399" strokeWidth="1" rx="4" />
                <text x="200" y="270" textAnchor="middle" className="fill-emerald-100 font-display text-[14px] font-bold">Blok B</text>
                <text x="200" y="290" textAnchor="middle" className="fill-emerald-300 font-body text-[10px]">180 Kursi</text>

                <rect x="268" y="218" width="112" height="120" fill="#064e3b" stroke="#34d399" strokeWidth="1" rx="4" />
                <text x="324" y="270" textAnchor="middle" className="fill-emerald-100 font-display text-[14px] font-bold">Blok C</text>
                <text x="324" y="290" textAnchor="middle" className="fill-emerald-300 font-body text-[10px]">180 Kursi</text>

                {/* Blok D */}
                <rect x="20" y="348" width="360" height="50" fill="#064e3b" stroke="#34d399" strokeWidth="1" rx="4" />
                <text x="200" y="378" textAnchor="middle" className="fill-emerald-100 font-display text-[14px] font-bold">Blok D (80 Kursi)</text>

                {/* Balkon Lt 2 */}
                <rect x="20" y="408" width="360" height="55" fill="#312e81" stroke="#818cf8" strokeWidth="1" rx="4" />
                <text x="200" y="432" textAnchor="middle" className="fill-indigo-100 font-display text-[13px] font-bold">Balkon Lantai 2 (180 Kursi)</text>
                <text x="200" y="450" textAnchor="middle" className="fill-indigo-300 font-body text-[10px]">Ruang Kontrol Audio &amp; Lighting</text>

                {/* Lobi & Pintu Masuk */}
                <rect x="20" y="472" width="360" height="55" fill="#334155" stroke="#64748b" strokeWidth="1" rx="4" />
                <text x="200" y="505" textAnchor="middle" className="fill-slate-100 font-display text-[14px] font-bold">Lobi &amp; Pintu Masuk</text>
                <text x="200" y="555" textAnchor="middle" className="fill-emerald-400 font-display text-[12px] font-bold">↑ Dari Plaza Utama</text>
              </g>

              {/* GIMNASIUM & KOLAM (KANAN, 410x560) */}
              <g transform="translate(460, 20)">
                <rect width="410" height="570" fill="#1e222a" stroke="#818cf8" strokeWidth="2" rx="12" />
                <text x="205" y="32" textAnchor="middle" className="fill-indigo-300 font-display text-[16px] font-bold">
                  GIMNASIUM &amp; KOLAM INDOOR
                </text>

                {/* Lapangan Utama */}
                <rect x="20" y="45" width="370" height="150" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" rx="6" />
                <circle cx="205" cy="120" r="28" fill="none" stroke="#6ee7b7" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="205" y1="45" x2="205" y2="195" stroke="#6ee7b7" strokeWidth="1.5" />
                <text x="205" y="115" textAnchor="middle" className="fill-emerald-100 font-display text-[16px] font-bold">Lapangan Utama</text>
                <text x="205" y="135" textAnchor="middle" className="fill-emerald-300 font-body text-[11px]">Basket, Voli &amp; Badminton</text>

                {/* Tribun */}
                <rect x="20" y="205" width="370" height="45" fill="#334155" stroke="#64748b" strokeWidth="1" rx="4" />
                <text x="205" y="233" textAnchor="middle" className="fill-slate-100 font-display text-[14px] font-bold">Tribun 400 Kursi Penonton</text>

                {/* Kolam Renang Indoor */}
                <rect x="20" y="260" width="370" height="110" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" rx="6" />
                {[1, 2, 3, 4, 5].map((lane) => (
                  <line
                    key={lane}
                    x1="20"
                    y1={260 + lane * 18}
                    x2="390"
                    y2={260 + lane * 18}
                    stroke="#bae6fd"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                ))}
                <text x="205" y="315" textAnchor="middle" className="fill-sky-50 font-display text-[16px] font-bold">Kolam Renang Indoor</text>
                <text x="205" y="335" textAnchor="middle" className="fill-sky-200 font-body text-[11px]">25 Meter, 6 Lintasan Berstandar</text>

                {/* Ruang Ganti Pria & Wanita */}
                <rect x="20" y="380" width="180" height="65" fill="#334155" stroke="#64748b" strokeWidth="1" rx="4" />
                <text x="110" y="415" textAnchor="middle" className="fill-slate-100 font-display text-[14px] font-bold">Ruang Ganti Pria</text>

                <rect x="210" y="380" width="180" height="65" fill="#334155" stroke="#64748b" strokeWidth="1" rx="4" />
                <text x="300" y="415" textAnchor="middle" className="fill-slate-100 font-display text-[14px] font-bold">Ruang Ganti Wanita</text>

                {/* Ruang Fitness */}
                <rect x="20" y="455" width="370" height="65" fill="#312e81" stroke="#818cf8" strokeWidth="1" rx="4" />
                <text x="205" y="492" textAnchor="middle" className="fill-indigo-100 font-display text-[15px] font-bold">Ruang Fitness &amp; Kebugaran</text>

                <text x="205" y="555" textAnchor="middle" className="fill-emerald-400 font-display text-[12px] font-bold">↑ Pintu Masuk Gimnasium</text>
              </g>
            </svg>
          )}

          {/* Indikator Posisi Pemain Live di Sudut */}
          <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-border shadow-xs text-xs font-body flex items-center space-x-2 text-text">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>
              Posisi Kamu: ({playerPosition[0].toFixed(1)}m, {playerPosition[2].toFixed(1)}m)
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-border text-[11px] font-body text-text-muted flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Denah Arsitektur Deterministik</span>
          </div>
        </div>

        {/* Footer Modal & Informasi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted pt-2 border-t border-border font-body">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="mint">Sumber: campus.json &amp; Cetak Biru Kyoto</Badge>
            <Badge variant="peach">Dukungan: 600 Siswa &amp; Boarding</Badge>
          </div>

          <Button variant="default" size="sm" onClick={onClose} className="px-6 self-end sm:self-auto font-display">
            Tutup Peta
          </Button>
        </div>
      </div>
    </div>
  );
}
