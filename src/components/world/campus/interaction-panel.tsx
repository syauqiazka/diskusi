"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Archive,
  ArrowRight,
  BookOpen,
  DoorOpen,
  FileText,
  GraduationCap,
  Lock,
  MessageSquare,
  Monitor,
  Music,
  UserSquare2,
  Users,
  X,
} from 'lucide-react';
import { ActivePanelState, useWorldStore } from '@/stores/use-world-store';

const VERIFIED_FACILITIES = [
  {
    name: 'Lab Komputer',
    detail: 'Meja komputer, PC, papan tulis, ruang praktik SIJA',
  },
  {
    name: 'Ruang Kelas',
    detail: 'Meja siswa, kursi, jendela besar, kipas, pencahayaan',
  },
  {
    name: 'Perpustakaan',
    detail: 'Rak buku, meja belajar, area membaca bersama',
  },
  {
    name: 'Ruang Rapat',
    detail: 'Meja rapat panjang, kursi, panel kaca',
  },
  {
    name: 'Ruang Konsultansi',
    detail: 'Meja konsultasi, kursi, lemari, jendela',
  },
  {
    name: 'Ruang Musik',
    detail: 'Instrumen musik dan perlengkapan latihan',
  },
];

function renderPanelIcon(panel: ActivePanelState) {
  if (panel.isLocked) {
    return <Lock className="w-5 h-5 text-alert shrink-0" aria-hidden="true" />;
  }
  switch (panel.type) {
    case 'door':
      return <DoorOpen className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />;
    case 'mading':
      return <FileText className="w-5 h-5 text-secondary shrink-0" aria-hidden="true" />;
    case 'library':
      return <BookOpen className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />;
    case 'locker':
      return <Archive className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />;
    case 'mirror':
      return <UserSquare2 className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />;
    case 'lab_komputer':
      return <Monitor className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />;
    case 'ruang_rapat':
      return <Users className="w-5 h-5 text-secondary shrink-0" aria-hidden="true" />;
    case 'ruang_konsultansi':
      return <MessageSquare className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />;
    case 'ruang_kelas':
      return <GraduationCap className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />;
    case 'perpustakaan':
      return <BookOpen className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />;
    case 'ruang_musik':
      return <Music className="w-5 h-5 text-secondary shrink-0" aria-hidden="true" />;
    default:
      return <FileText className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />;
  }
}

export function InteractionPanel() {
  const activePanelState = useWorldStore((s) => s.activePanelState);
  const activePanelType = useWorldStore((s) => s.activePanel);
  const doorStates = useWorldStore((s) => s.doorStates);
  const closePanel = useWorldStore((s) => s.closePanel);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activePanel: ActivePanelState | null = React.useMemo(() => {
    if (activePanelState) return activePanelState;
    if (activePanelType) {
      return {
        interactableId: activePanelType,
        type: activePanelType,
        title: activePanelType.toUpperCase().replace(/[-_]/g, ' '),
        description: 'Panel interaksi kawasan retro-liminal SMK TI BAZMA.',
        source: 'konseptual',
      };
    }
    return null;
  }, [activePanelState, activePanelType]);

  useEffect(() => {
    if (!activePanel) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        closePanel();
        return;
      }

      // Focus trap Tab / Shift+Tab di dalam modal
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanel, closePanel]);

  if (!activePanel) {
    return null;
  }

  const isDoorOpen = Boolean(doorStates[activePanel.interactableId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closePanel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interaction-panel-title"
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-surface border-2 border-border text-text rounded-3xl p-6 shadow-2xl space-y-6"
      >
        {/* Header Panel */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary-dark font-display font-bold text-xs uppercase tracking-wider mb-2">
              Interaksi Objek · {activePanel.source === 'konseptual' ? 'Desain Konseptual' : 'Fasilitas'}
            </div>
            <h2
              id="interaction-panel-title"
              className="font-display font-bold text-2xl text-text flex items-center gap-2.5"
            >
              {renderPanelIcon(activePanel)}
              <span>{activePanel.title}</span>
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closePanel}
            aria-label="Tutup panel interaksi"
            className="flex items-center gap-1.5 border-2 border-border bg-surface hover:bg-canvas rounded-full px-3.5 py-1.5 font-display font-bold text-sm text-text-muted hover:text-text cursor-pointer transition-colors shadow-sm"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Tutup</span>
          </button>
        </div>

        {/* Konten berdasarkan tipe interactable */}
        <div className="font-body text-base leading-relaxed text-text-muted space-y-4">
          <p className="text-text font-medium">{activePanel.description}</p>

          {activePanel.type === 'door' && (
            <div className="border-2 border-border/70 rounded-2xl bg-canvas p-4 space-y-2">
              <div className="font-display font-bold text-sm tracking-wide text-text uppercase">
                Status Pintu Eksterior
              </div>
              <p className="text-sm text-text-muted">
                {activePanel.isLocked
                  ? 'Pintu ini dalam kondisi terkunci. Masuk melalui pintu utama sayap sekolah untuk menjelajah ruang kelas.'
                  : `Daun pintu luar berada pada posisi ${isDoorOpen ? 'terbuka' : 'tertutup'}.`}
              </p>
            </div>
          )}

          {activePanel.type === 'mading' && (
            <div className="border-2 border-border/70 rounded-2xl bg-canvas p-4 space-y-3">
              <div className="font-display font-bold text-sm tracking-wide text-text uppercase">
                Papan Informasi Mading Global
              </div>
              <p className="text-sm text-text-muted">
                Mading sekolah memuat pengumuman terbaru, diskusi umum antar angkatan, dan voting topik pembelajaran.
              </p>
            </div>
          )}

          {activePanel.type === 'library' && (
            <div className="border-2 border-border/70 rounded-2xl bg-canvas p-4 space-y-3">
              <div className="font-display font-bold text-sm tracking-wide text-text uppercase">
                Daftar Fasilitas Sekolah
              </div>
              <p className="text-sm text-text-muted">
                Fasilitas sekolah dapat dijelajahi langsung pada interior Gedung Sekolah 3 lantai.
              </p>
              <div className="divide-y divide-border border-t border-border mt-2">
                {VERIFIED_FACILITIES.map((fac) => (
                  <div key={fac.name} className="py-2.5">
                    <div className="font-display font-bold text-sm text-text">{fac.name}</div>
                    <div className="text-xs text-text-muted font-body">
                      {fac.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel.type === 'locker' && (
            <div className="border-2 border-border/70 rounded-2xl bg-canvas p-4 space-y-2">
              <div className="font-display font-bold text-sm tracking-wide text-text uppercase">
                Loker Siswa & Arsip Belajar
              </div>
              <p className="text-sm text-text-muted">
                Loker siswa menyimpan materi yang diunduh, preferensi profil, dan riwayat aktivitas pembelajaran.
              </p>
            </div>
          )}

          {activePanel.type === 'mirror' && (
            <div className="border-2 border-border/70 rounded-2xl bg-canvas p-4 space-y-2">
              <div className="font-display font-bold text-sm tracking-wide text-text uppercase">
                Cermin Profil & Kosmetik
              </div>
              <p className="text-sm text-text-muted">
                Gunakan cermin profil untuk mengubah bingkai avatar dan efek visual identitas siswa.
              </p>
            </div>
          )}

          {activePanel.details && activePanel.details.length > 0 && (
            <div className="border-2 border-border/70 rounded-2xl bg-canvas p-4 space-y-2.5">
              <div className="font-display font-bold text-sm tracking-wide text-text uppercase">
                Detail Fasilitas
              </div>
              <ul className="space-y-1 text-sm text-text-muted font-body">
                {activePanel.details.map((line, i) => (
                  <li key={`detail_${i}`}>• {line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer aksi navigasi langsung ke antarmuka 2D */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(activePanel.type === 'ruang_kelas' || activePanel.type === 'door') && (
              <Link href="/kelas">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-text border border-primary/30 px-4 py-2 rounded-2xl font-display font-bold text-sm cursor-pointer transition-colors"
                >
                  <span>Buka Ruang Kelas 2D</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </button>
              </Link>
            )}

            {activePanel.type === 'mading' && (
              <Link href="/mading">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-secondary/20 hover:bg-secondary/30 text-text border border-secondary/40 px-4 py-2 rounded-2xl font-display font-bold text-sm cursor-pointer transition-colors"
                >
                  <span>Buka Mading 2D</span>
                  <ArrowRight className="w-4 h-4 text-secondary-dark" />
                </button>
              </Link>
            )}

            {(activePanel.type === 'library' || activePanel.type === 'perpustakaan') && (
              <Link href="/perpustakaan">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-text border border-primary/30 px-4 py-2 rounded-2xl font-display font-bold text-sm cursor-pointer transition-colors"
                >
                  <span>Buka Perpustakaan 2D</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </button>
              </Link>
            )}

            {(activePanel.type === 'locker' || activePanel.type === 'mirror') && (
              <Link href="/profil">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-accent/10 hover:bg-accent/20 text-text border border-accent/30 px-4 py-2 rounded-2xl font-display font-bold text-sm cursor-pointer transition-colors"
                >
                  <span>Buka Profil 2D</span>
                  <ArrowRight className="w-4 h-4 text-accent" />
                </button>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={closePanel}
            className="bg-primary hover:bg-primary-hover text-surface font-display font-bold text-sm px-5 py-2.5 rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-105 ml-auto"
          >
            Kembali ke Kawasan
          </button>
        </div>
      </div>
    </div>
  );
}
