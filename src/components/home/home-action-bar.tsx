"use client";

import * as React from "react";
import Link from "next/link";
import { Sliders, Keyboard, Map, Trophy, Heart, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionsModal } from "@/components/home/options-modal";
import { ControlsModal } from "@/components/home/controls-modal";
import { MapModal } from "@/components/home/map-modal";
import { AchievementsModal } from "@/components/home/achievements-modal";
import { CreditsModal } from "@/components/home/credits-modal";
import { gsap, isReducedMotion } from "@/lib/animations";

export function HomeActionBar() {
  const [modal, setModal] = React.useState<"options" | "controls" | "map" | "achievements" | "credits" | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current.querySelector(".cta-button"),
      { opacity: 0, scale: 0.92, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" }
    );

    gsap.fromTo(
      containerRef.current.querySelectorAll(".action-pill"),
      { opacity: 0, scale: 0.9, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.06, delay: 0.15, ease: "back.out(1.5)" }
    );
  }, []);

  return (
    <>
      <div ref={containerRef} className="flex flex-col items-center gap-4 w-full pt-2">
        {/* Tombol Utama CTA "Mulai Menjelajah" */}
        <Link href="/dunia" className="w-full sm:w-auto cta-button">
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto px-10 py-5 text-lg font-display tracking-wider flex items-center justify-center space-x-3 shadow-lg active:translate-y-1"
          >
            <Compass className="w-6 h-6 animate-spin-slow" />
            <span>Mulai Menjelajah</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </Link>

        {/* 5 Tombol Pil Mengambang Ramah (Bruno-Simon inspired) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setModal("map")}
            className="action-pill inline-flex items-center space-x-2 px-4 py-2 bg-surface text-text hover:text-accent hover:border-accent/40 border-2 border-border border-b-4 rounded-2xl font-display text-xs tracking-wider transition-all active:translate-y-[2px] active:border-b-2 shadow-xs cursor-pointer"
          >
            <Map className="w-4 h-4 text-emerald-600" />
            <span>Peta Kawasan</span>
          </button>

          <button
            type="button"
            onClick={() => setModal("controls")}
            className="action-pill inline-flex items-center space-x-2 px-4 py-2 bg-surface text-text hover:text-accent hover:border-accent/40 border-2 border-border border-b-4 rounded-2xl font-display text-xs tracking-wider transition-all active:translate-y-[2px] active:border-b-2 shadow-xs cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-indigo-600" />
            <span>Kontrol</span>
          </button>

          <button
            type="button"
            onClick={() => setModal("options")}
            className="action-pill inline-flex items-center space-x-2 px-4 py-2 bg-surface text-text hover:text-accent hover:border-accent/40 border-2 border-border border-b-4 rounded-2xl font-display text-xs tracking-wider transition-all active:translate-y-[2px] active:border-b-2 shadow-xs cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Opsi</span>
          </button>

          <button
            type="button"
            onClick={() => setModal("achievements")}
            className="action-pill inline-flex items-center space-x-2 px-4 py-2 bg-surface text-text hover:text-accent hover:border-accent/40 border-2 border-border border-b-4 rounded-2xl font-display text-xs tracking-wider transition-all active:translate-y-[2px] active:border-b-2 shadow-xs cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Pencapaian</span>
          </button>

          <button
            type="button"
            onClick={() => setModal("credits")}
            className="action-pill inline-flex items-center space-x-2 px-4 py-2 bg-surface text-text hover:text-accent hover:border-accent/40 border-2 border-border border-b-4 rounded-2xl font-display text-xs tracking-wider transition-all active:translate-y-[2px] active:border-b-2 shadow-xs cursor-pointer"
          >
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Kredit</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <OptionsModal isOpen={modal === "options"} onClose={() => setModal(null)} />
      <ControlsModal isOpen={modal === "controls"} onClose={() => setModal(null)} />
      <MapModal isOpen={modal === "map"} onClose={() => setModal(null)} />
      <AchievementsModal isOpen={modal === "achievements"} onClose={() => setModal(null)} />
      <CreditsModal isOpen={modal === "credits"} onClose={() => setModal(null)} />
    </>
  );
}

