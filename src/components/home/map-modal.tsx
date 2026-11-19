"use client";

import * as React from "react";
import { X, Compass, Layers, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorldStore } from "@/stores/use-world-store";
import { useAchievementStore } from "@/stores/use-achievement-store";
import { CAMPUS_LAYOUT } from "@/lib/world/campus-layout";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MapModal({ isOpen, onClose }: MapModalProps) {
  const playerPosition = useWorldStore((s) => s.playerPosition);
  const unlockAchievement = useAchievementStore((s) => s.unlockAchievement);
  const [activeFloor, setActiveFloor] = React.useState<"ALL" | "LT1" | "LT2" | "LT3">("ALL");

  React.useEffect(() => {
    if (isOpen) {
      unlockAchievement("map_opened");
    }
  }, [isOpen, unlockAchievement]);

  if (!isOpen) return null;

  // Koordinat batas dunia dari CAMPUS_LAYOUT (satu sumber kebenaran)
  const { minX, maxX, minZ, maxZ } = CAMPUS_LAYOUT.worldBounds;
  const mapWidth = maxX - minX;
  const mapHeight = maxZ - minZ;

  // Konversi koordinat 3D [X, Y, Z] ke koordinat SVG viewBox (0-1000)
  const toSvgX = (x: number) => ((x - minX) / mapWidth) * 900 + 50;
  const toSvgY = (z: number) => ((z - minZ) / mapHeight) * 900 + 50;

  // Titik pemain saat ini
  const playerSvgX = toSvgX(playerPosition[0]);
  const playerSvgY = toSvgY(playerPosition[2]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface w-full max-w-4xl p-6 sm:p-8 space-y-6 rounded-3xl border-2 border-border shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-canvas transition-colors"
          aria-label="Tutup Peta"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center space-x-2 text-primary mb-1">
              <Compass className="w-5 h-5 text-emerald-500 animate-spin-slow" />
              <span className="font-display text-sm uppercase tracking-wider text-emerald-600 font-bold">
                Peta 2D Kawasan
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-text">
              Denah Kawasan SMK TI BAZMA
            </h2>
            <p className="font-body text-xs sm:text-sm text-text-muted">
              Tata letak spasial deterministik. Posisi pemain diperbarui secara langsung.
            </p>
          </div>

          {/* Pemilih Lantai Bangunan */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-canvas p-1.5 rounded-2xl border border-border">
            <span className="font-display text-xs text-text-muted px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Lantai:</span>
            </span>
            {(["ALL", "LT1", "LT2", "LT3"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFloor(f)}
                className={`px-3 py-1 rounded-xl font-display text-xs transition-all cursor-pointer ${
                  activeFloor === f
                    ? "bg-accent text-white font-bold shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface"
                }`}
              >
                {f === "ALL" ? "Semua" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Peta SVG Responsif */}
        <div className="flex-1 min-h-[320px] max-h-[500px] w-full bg-canvas/70 rounded-3xl border-2 border-border overflow-hidden relative shadow-inner flex items-center justify-center p-2">
          <svg
            viewBox="0 0 1000 1000"
            className="w-full h-full max-h-[460px] select-none"
          >
            {/* Grid Latar Halus */}
            <defs>
              <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#mapGrid)" rx="24" />

            {/* Jalur & Turunan */}
            {CAMPUS_LAYOUT.exclusionZones
              .filter((z) => z.name.toLowerCase().includes("koridor") || z.name.toLowerCase().includes("turunan"))
              .map((zone) => {
                const x1 = toSvgX(zone.minX);
                const y1 = toSvgY(zone.minZ);
                const w = toSvgX(zone.maxX) - x1;
                const h = toSvgY(zone.maxZ) - y1;
                return (
                  <rect
                    key={zone.id}
                    x={x1}
                    y={y1}
                    width={Math.max(w, 8)}
                    height={Math.max(h, 8)}
                    fill="#E2E8F0"
                    rx="6"
                    opacity="0.85"
                  />
                );
              })}

            {/* Area Lapangan Olahraga */}
            <rect
              x={toSvgX(2)}
              y={toSvgY(-14)}
              width={toSvgX(24) - toSvgX(2)}
              height={toSvgY(6) - toSvgY(-14)}
              fill="#D1FAE5"
              stroke="#6EE7B7"
              strokeWidth="2"
              rx="12"
            />
            <text
              x={toSvgX(13)}
              y={toSvgY(-4)}
              textAnchor="middle"
              className="fill-emerald-800 font-display text-[22px] font-bold"
            >
              Lapangan Olahraga &amp; Upacara
            </text>

            {/* Gedung Asrama */}
            <rect
              x={toSvgX(-39.5)}
              y={toSvgY(-25)}
              width={toSvgX(-14.5) - toSvgX(-39.5)}
              height={toSvgY(15) - toSvgY(-25)}
              fill="#FEF3C7"
              stroke="#FCD34D"
              strokeWidth="3"
              rx="16"
            />
            <text
              x={toSvgX(-27)}
              y={toSvgY(-5)}
              textAnchor="middle"
              className="fill-amber-900 font-display text-[24px] font-bold"
            >
              Gedung Asrama (5 Lantai)
            </text>
            <text
              x={toSvgX(-27)}
              y={toSvgY(2)}
              textAnchor="middle"
              className="fill-amber-700 font-body text-[16px]"
            >
              Lobi Asrama &amp; Kamar Santri
            </text>

            {/* Gedung Sekolah */}
            <rect
              x={toSvgX(7)}
              y={toSvgY(-36.5)}
              width={toSvgX(37) - toSvgX(7)}
              height={toSvgY(-5) - toSvgY(-36.5)}
              fill="#E0E7FF"
              stroke="#A5B4FC"
              strokeWidth="3"
              rx="16"
            />
            <text
              x={toSvgX(22)}
              y={toSvgY(-22)}
              textAnchor="middle"
              className="fill-indigo-950 font-display text-[26px] font-bold"
            >
              Gedung Sekolah (3 Lantai)
            </text>
            <text
              x={toSvgX(22)}
              y={toSvgY(-15)}
              textAnchor="middle"
              className="fill-indigo-700 font-body text-[16px]"
            >
              Ruang Kelas, Lab Jaringan &amp; Perpustakaan
            </text>

            {/* Gerbang Utama (Spawn Point) */}
            <circle
              cx={toSvgX(0)}
              cy={toSvgY(38)}
              r="14"
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth="3"
            />
            <text
              x={toSvgX(0)}
              y={toSvgY(44)}
              textAnchor="middle"
              className="fill-amber-900 font-display text-[18px] font-bold"
            >
              Gerbang Utama
            </text>

            {/* Penanda Posisi Live Pemain */}
            <g transform={`translate(${playerSvgX}, ${playerSvgY})`}>
              <circle r="22" fill="#4F46E5" opacity="0.25" className="animate-ping" />
              <circle r="12" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="3" />
              <polygon points="0,-16 5,-8 -5,-8" fill="#4F46E5" />
            </g>
          </svg>

          {/* Indikator Posisi Pemain Live di Sudut */}
          <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-border shadow-xs text-xs font-body flex items-center space-x-2 text-text">
            <span className="w-3 h-3 rounded-full bg-accent animate-pulse inline-block" />
            <span>
              Posisi Kamu: ({playerPosition[0].toFixed(1)}m, {playerPosition[2].toFixed(1)}m)
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs px-3 py-1 rounded-xl border border-border text-[11px] font-body text-text-muted flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Denah konseptual fiksi terinspirasi kampus</span>
          </div>
        </div>

        {/* Catatan Konseptual */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted pt-2 border-t border-border font-body">
          <div className="flex items-center space-x-2">
            <Badge variant="mint">Sumber Data: campus-layout.ts</Badge>
            <Badge variant="peach">Akurasi: Konseptual Terverifikasi</Badge>
          </div>

          <Button variant="default" size="sm" onClick={onClose} className="px-6 self-end sm:self-auto">
            Tutup Peta
          </Button>
        </div>
      </div>
    </div>
  );
}

