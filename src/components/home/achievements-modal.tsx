"use client";

import * as React from "react";
import { X, Trophy, CheckCircle2, Lock, Sparkles, BookOpen, Map, Radio, Users, Sliders, LifeBuoy, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAchievementStore } from "@/stores/use-achievement-store";
import { useModalAnimation } from "@/components/animations/gsap-animate";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Compass,
  Map,
  BookOpen,
  Radio,
  Users,
  Sliders,
  LifeBuoy,
};

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { backdropRef, cardRef } = useModalAnimation(isOpen);
  const achievements = useAchievementStore((s) => s.achievements);
  const resetAchievements = useAchievementStore((s) => s.resetAchievements);

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div ref={cardRef} className="bg-surface w-full max-w-lg p-6 sm:p-8 space-y-6 rounded-3xl border-2 border-border shadow-2xl relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-canvas transition-colors"
          aria-label="Tutup Pencapaian"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="border-b border-border pb-4 space-y-2">
          <div className="flex items-center space-x-2 text-primary">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-display text-sm uppercase tracking-wider text-amber-600 font-bold">
              Koleksi Lencana
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-text">
            Pencapaian Siswa
          </h2>
          <p className="font-body text-xs sm:text-sm text-text-muted">
            Kumpulkan seluruh lencana penjelajahan dan interaksi di kampus virtual SMK TI BAZMA.
          </p>

          {/* Progress Bar */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-xs font-display">
              <span className="text-text font-bold">Kemajuan Koleksi:</span>
              <span className="text-accent font-bold">{unlockedCount} dari {achievements.length} Tercapai ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3 bg-canvas border border-border rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daftar Kartu Pencapaian */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
          {achievements.map((item) => {
            const isUnlocked = item.unlockedAt !== null;
            const Icon = ICON_MAP[item.iconName] || Sparkles;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? "bg-canvas border-primary/40 shadow-xs"
                    : "bg-surface/50 border-border opacity-70"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                    isUnlocked
                      ? "bg-primary text-text border-emerald-500 shadow-xs"
                      : "bg-canvas text-text-muted border-border"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-base text-text font-bold">
                      {item.title}
                    </h4>
                    {isUnlocked ? (
                      <Badge variant="mint" className="text-[11px] py-0.5 px-2">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 inline" />
                        Tercapai
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px] py-0.5 px-2 text-text-muted">
                        <Lock className="w-3 h-3 mr-1 text-text-muted inline" />
                        Terkunci
                      </Badge>
                    )}
                  </div>
                  <p className="font-body text-xs text-text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Modal */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <button
            type="button"
            onClick={resetAchievements}
            className="text-xs font-body text-text-muted hover:text-destructive underline cursor-pointer"
          >
            Reset Pencapaian Saya
          </button>

          <Button variant="default" size="sm" onClick={onClose} className="px-6">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

