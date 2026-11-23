"use client";

import * as React from "react";
import { X, MousePointer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalAnimation } from "@/components/animations/gsap-animate";

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ControlsModal({ isOpen, onClose }: ControlsModalProps) {
  const { backdropRef, cardRef } = useModalAnimation(isOpen);
  if (!isOpen) return null;

  const KEY_BINDINGS = [
    {
      keys: ["W", "A", "S", "D"],
      label: "Bergerak",
      desc: "Berjalan mengitari kawasan sekolah, asrama, dan ruang kelas.",
    },
    {
      keys: ["Shift"],
      label: "Lari Cepat",
      desc: "Menjelajah lebih cepat di area terbuka dan lapangan.",
    },
    {
      keys: ["C"],
      label: "Jongkok",
      desc: "Menurunkan sudut pandang untuk melihat kolong meja.",
    },
    {
      keys: ["Backspace"],
      label: "Lompat",
      desc: "Melompati undakan dan rintangan rendah di jalanan.",
    },
    {
      keys: ["E", "Klik Kiri"],
      label: "Interaksi",
      desc: "Membuka pintu kelas, papan tulis, rak buku, atau mading.",
    },
    {
      keys: ["Esc"],
      label: "Jeda & Menu",
      desc: "Membuka panel opsi jeda atau menutup dialog aktif.",
    },
  ];

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div ref={cardRef} className="bg-surface w-full max-w-lg p-6 sm:p-8 space-y-6 rounded-3xl border-2 border-border shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:text-text hover:bg-canvas transition-colors"
          aria-label="Tutup Kontrol"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-border pb-4 space-y-1">
          <div className="flex items-center space-x-2 text-primary">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="font-display text-sm uppercase tracking-wider text-emerald-600 font-bold">
              Panduan Kendali
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-text">
            Tombol &amp; Kontrol Jelajah
          </h2>
          <p className="font-body text-xs sm:text-sm text-text-muted">
            Kontrol first-person untuk keyboard dan mouse di laptop atau komputer desktop.
          </p>
        </div>

        {/* Grid Keycaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {KEY_BINDINGS.map((item) => (
            <div
              key={item.label}
              className="p-3.5 bg-canvas rounded-2xl border border-border space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.keys.map((k) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 bg-surface border-2 border-border border-b-4 border-b-slate-300 rounded-xl font-display text-sm text-text shadow-xs font-bold"
                  >
                    {k}
                  </span>
                ))}
              </div>

              <div>
                <p className="font-display text-sm text-text font-bold">{item.label}</p>
                <p className="font-body text-xs text-text-muted mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Mouse & Layar Sentuh */}
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-2xl flex items-start space-x-2 text-xs text-text">
          <MousePointer className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="font-body">
            <span className="font-bold text-emerald-700">Arah Pandang: </span>
            Gerakkan mouse bebas untuk mengarahkan kamera. Klik pada layar untuk mengunci kursor.
          </p>
        </div>

        <div className="pt-2 flex justify-end border-t border-border">
          <Button variant="default" size="sm" onClick={onClose} className="px-6">
            Mengerti
          </Button>
        </div>
      </div>
    </div>
  );
}

