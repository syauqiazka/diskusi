"use client";

import * as React from "react";
import { X, Volume2, VolumeX, Monitor, LifeBuoy, RotateCcw, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorldStore, STANDING_HEIGHT } from "@/stores/use-world-store";
import { useAchievementStore } from "@/stores/use-achievement-store";
import { useModalAnimation } from "@/components/animations/gsap-animate";

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OptionsModal({ isOpen, onClose }: OptionsModalProps) {
  const worldSettings = useWorldStore((s) => s.worldSettings);
  const updateWorldSettings = useWorldStore((s) => s.updateWorldSettings);
  const setPlayerPosition = useWorldStore((s) => s.setPlayerPosition);
  const unlockAchievement = useAchievementStore((s) => s.unlockAchievement);
  const { backdropRef, cardRef } = useModalAnimation(isOpen);

  const [rescueNotice, setRescueNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      unlockAchievement("options_explored");
    }
  }, [isOpen, unlockAchievement]);

  if (!isOpen) return null;

  const handleRescue = () => {
    // Kembalikan posisi ke titik spawn utama di dekat gerbang
    setPlayerPosition([0, STANDING_HEIGHT, 38]);
    unlockAchievement("stuck_rescued");
    setRescueNotice("Berhasil dipindahkan kembali ke titik awal gerbang utama!");
    setTimeout(() => {
      setRescueNotice(null);
      onClose();
    }, 1400);
  };

  const handleReset = () => {
    updateWorldSettings({
      sound: false,
      graphicsQuality: "medium",
      showHud: true,
      fastMode: false,
    });
    setRescueNotice("Pengaturan berhasil direset ke standar.");
    setTimeout(() => setRescueNotice(null), 1500);
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div ref={cardRef} className="bg-surface w-full max-w-lg p-6 sm:p-8 space-y-6 rounded-3xl border-2 border-border shadow-2xl relative">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-canvas transition-colors"
          aria-label="Tutup Opsi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="border-b border-border pb-4 space-y-1">
          <div className="flex items-center space-x-2 text-primary">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="font-display text-sm uppercase tracking-wider text-emerald-600 font-bold">
              Pengaturan Kampus
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-text">
            Opsi Pengalaman
          </h2>
          <p className="font-body text-xs sm:text-sm text-text-muted">
            Sesuaikan audio, kualitas grafis, atau kembali ke titik awal bila tersangkut.
          </p>
        </div>

        {/* Notifikasi Toast */}
        {rescueNotice && (
          <div className="p-3 bg-primary/20 border border-primary/40 text-emerald-800 rounded-2xl font-body text-xs flex items-center space-x-2 animate-bounce">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{rescueNotice}</span>
          </div>
        )}

        {/* Daftar Opsi */}
        <div className="space-y-4">
          {/* 1. Suara & Musik */}
          <div className="flex items-center justify-between p-4 bg-canvas rounded-2xl border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-emerald-700">
                {worldSettings.sound ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-display text-base text-text">Efek Suara &amp; Audio</p>
                <p className="font-body text-xs text-text-muted">
                  {worldSettings.sound ? "Suara aktif" : "Suara dimatikan (bawaan)"}
                </p>
              </div>
            </div>

            <Button
              variant={worldSettings.sound ? "mint" : "outline"}
              size="sm"
              onClick={() => updateWorldSettings({ sound: !worldSettings.sound })}
              className="rounded-xl px-4"
            >
              {worldSettings.sound ? "AKTIF" : "MATI"}
            </Button>
          </div>

          {/* 2. Kualitas Grafis 3D */}
          <div className="p-4 bg-canvas rounded-2xl border border-border space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center text-amber-700">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-base text-text">Kualitas Grafis 3D</p>
                <p className="font-body text-xs text-text-muted">
                  Pilih kualitas render sesuai kenyamanan perangkat laptop Anda
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {(["low", "medium", "high"] as const).map((q) => {
                const isSelected = worldSettings.graphicsQuality === q;
                const label = q === "low" ? "Ringan" : q === "medium" ? "Sedang" : "Tinggi";
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => updateWorldSettings({ graphicsQuality: q })}
                    className={`py-2 px-3 rounded-xl font-display text-xs tracking-wider transition-all cursor-pointer border-2 ${
                      isSelected
                        ? "bg-accent text-white border-indigo-900 shadow-sm"
                        : "bg-surface text-text border-border hover:border-primary/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tombol Darurat "Aku Tersangkut" */}
          <div className="flex items-center justify-between p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-base text-text">Penyelamat Spasial</p>
                <p className="font-body text-xs text-text-muted">
                  Avatar terjepit atau jatuh dari lantai?
                </p>
              </div>
            </div>

            <Button
              variant="peach"
              size="sm"
              onClick={handleRescue}
              className="rounded-xl whitespace-nowrap"
            >
              Aku Tersangkut
            </Button>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-text-muted hover:text-destructive flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </Button>

          <Button variant="default" size="sm" onClick={onClose} className="px-6">
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}

