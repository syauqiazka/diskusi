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
    return <Lock className="w-5 h-5 text-[#E0412F] shrink-0" aria-hidden="true" />;
  }
  switch (panel.type) {
    case 'door':
      return <DoorOpen className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
    case 'mading':
      return <FileText className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
    case 'library':
      return <BookOpen className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
    case 'locker':
      return <Archive className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
    case 'mirror':
      return <UserSquare2 className="w-5 h-5 text-[#5CE1FF] shrink-0" aria-hidden="true" />;
    case 'lab_komputer':
      return <Monitor className="w-5 h-5 text-[#5CE1FF] shrink-0" aria-hidden="true" />;
    case 'ruang_rapat':
      return <Users className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
    case 'ruang_konsultansi':
      return <MessageSquare className="w-5 h-5 text-[#4FD08A] shrink-0" aria-hidden="true" />;
    case 'ruang_kelas':
      return <GraduationCap className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
    case 'perpustakaan':
      return <BookOpen className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
    case 'ruang_musik':
      return <Music className="w-5 h-5 text-[#FF5C93] shrink-0" aria-hidden="true" />;
    default:
      return <FileText className="w-5 h-5 text-[#F2C200] shrink-0" aria-hidden="true" />;
  }
}

export function InteractionPanel() {
  const activePanelState = useWorldStore((s) => s.activePanelState);
  const activePanelType = useWorldStore((s) => s.activePanel);
  const doorStates = useWorldStore((s) => s.doorStates);
  const closePanel = useWorldStore((s) => s.closePanel);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activePanel: ActivePanelState | null =
    activePanelState ||
    (activePanelType
      ? {
          interactableId: activePanelType,
          type: activePanelType,
          title: activePanelType.toUpperCase().replace(/[-_]/g, ' '),
          description: 'Panel interaksi kawasan retro-liminal SMK TI BAZMA.',
          source: 'konseptual',
        }
      : null);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D12]/80 p-4"
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
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-[#0B0D12] border border-[#E9F2E3] text-[#E9F2E3] p-6 shadow-2xl"
      >
        {/* Header Panel */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E9F2E3]/20 pb-4 mb-5">
          <div>
            <div className="font-vt323 text-lg tracking-widest text-[#5CE1FF] uppercase mb-1">
              INTERAKSI OBJEK · {activePanel.source === 'konseptual' ? 'DESAIN KONSEPTUAL' : 'REFERENSI'}
            </div>
            <h2
              id="interaction-panel-title"
              className="font-anton text-2xl tracking-wide text-[#E9F2E3] uppercase flex items-center gap-2.5"
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
            className="flex items-center gap-1.5 border border-[#E9F2E3]/40 hover:border-[#F2C200] hover:text-[#F2C200] px-3 py-1.5 font-vt323 text-lg uppercase cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5CE1FF]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span>TUTUP</span>
          </button>
        </div>

        {/* Konten berdasarkan tipe interactable */}
        <div className="font-instrument text-base leading-relaxed text-[#E9F2E3]/90 space-y-4">
          <p>{activePanel.description}</p>

          {activePanel.type === 'door' && (
            <div className="border border-[#E9F2E3]/25 p-4 space-y-2">
              <div className="font-vt323 text-lg tracking-wider text-[#F2C200] uppercase">
                STATUS PINTU EKSTERIOR
              </div>
              <p>
                {activePanel.isLocked
                  ? 'Pintu ini dalam kondisi terkunci. Masuk melalui pintu utama sayap sekolah untuk menjelajah ruang kelas.'
                  : `Daun pintu luar berada pada posisi ${isDoorOpen ? 'terbuka' : 'tertutup'}.`}
              </p>
            </div>
          )}

          {activePanel.type === 'mading' && (
            <div className="border border-[#E9F2E3]/25 p-4 space-y-3">
              <div className="font-vt323 text-lg tracking-wider text-[#F2C200] uppercase">
                PAPAN INFORMASI MADING GLOBAL
              </div>
              <p className="text-sm text-[#E9F2E3]/85">
                Mading sekolah memuat pengumuman terbaru, diskusi umum antar angkatan, dan voting topik pembelajaran.
              </p>
            </div>
          )}

          {activePanel.type === 'library' && (
            <div className="border border-[#E9F2E3]/25 p-4 space-y-3">
              <div className="font-vt323 text-lg tracking-wider text-[#F2C200] uppercase">
                DAFTAR FASILITAS SEKOLAH (SUMBER: REFS)
              </div>
              <p className="text-sm text-[#E9F2E3]/75">
                Fasilitas sekolah dapat dijelajahi langsung pada interior Gedung Sekolah 3 lantai.
              </p>
              <div className="divide-y divide-[#E9F2E3]/15 border-t border-[#E9F2E3]/15">
                {VERIFIED_FACILITIES.map((fac) => (
                  <div key={fac.name} className="py-2.5">
                    <div className="font-semibold text-[#E9F2E3]">{fac.name}</div>
                    <div className="text-sm text-[#E9F2E3]/75">
                      {fac.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel.type === 'locker' && (
            <div className="border border-[#E9F2E3]/25 p-4 space-y-2">
              <div className="font-vt323 text-lg tracking-wider text-[#F2C200] uppercase">
                LOKER SISWA & ARSIP BELAJAR
              </div>
              <p>
                Loker siswa menyimpan materi yang diunduh, preferensi tampilan retro VHS, dan riwayat aktivitas pembelajaran.
              </p>
            </div>
          )}

          {activePanel.type === 'mirror' && (
            <div className="border border-[#5CE1FF]/40 p-4 space-y-2">
              <div className="font-vt323 text-lg tracking-wider text-[#5CE1FF] uppercase">
                CERMIN PROFIL & KOSMETIK
              </div>
              <p>
                Gunakan cermin profil untuk mengubah bingkai avatar neon dan efek visual identitas siswa.
              </p>
            </div>
          )}

          {activePanel.details && activePanel.details.length > 0 && (
            <div className="border border-[#F2C200]/45 bg-[#121620] p-4 space-y-2.5">
              <div className="font-vt323 text-lg tracking-wider text-[#F2C200] uppercase">
                DETAIL FASILITAS
              </div>
              <ul className="space-y-1.5 text-sm text-[#E9F2E3]/85">
                {activePanel.details.map((line, i) => (
                  <li key={`detail_${i}`}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer aksi navigasi langsung ke antarmuka 2D */}
        <div className="mt-6 pt-4 border-t border-[#E9F2E3]/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(activePanel.type === 'ruang_kelas' || activePanel.type === 'door') && (
              <Link href="/kelas">
                <button
                  type="button"
                  className="flex items-center gap-1.5 border border-[#F2C200] text-[#F2C200] hover:bg-[#F2C200] hover:text-[#0B0D12] px-3 py-1.5 font-vt323 text-base uppercase cursor-pointer transition-colors"
                >
                  <span>BUKA RUANG KELAS 2D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}

            {activePanel.type === 'mading' && (
              <Link href="/mading">
                <button
                  type="button"
                  className="flex items-center gap-1.5 border border-[#F2C200] text-[#F2C200] hover:bg-[#F2C200] hover:text-[#0B0D12] px-3 py-1.5 font-vt323 text-base uppercase cursor-pointer transition-colors"
                >
                  <span>BUKA MADING 2D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}

            {(activePanel.type === 'library' || activePanel.type === 'perpustakaan') && (
              <Link href="/perpustakaan">
                <button
                  type="button"
                  className="flex items-center gap-1.5 border border-[#F2C200] text-[#F2C200] hover:bg-[#F2C200] hover:text-[#0B0D12] px-3 py-1.5 font-vt323 text-base uppercase cursor-pointer transition-colors"
                >
                  <span>BUKA PERPUSTAKAAN 2D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}

            {(activePanel.type === 'locker' || activePanel.type === 'mirror') && (
              <Link href="/profil">
                <button
                  type="button"
                  className="flex items-center gap-1.5 border border-[#5CE1FF] text-[#5CE1FF] hover:bg-[#5CE1FF] hover:text-[#0B0D12] px-3 py-1.5 font-vt323 text-base uppercase cursor-pointer transition-colors"
                >
                  <span>BUKA PROFIL 2D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={closePanel}
            className="bg-[#F2C200] hover:bg-[#ffd426] text-[#0B0D12] font-anton text-base tracking-wider uppercase px-5 py-2 cursor-pointer transition-colors ml-auto"
          >
            KEMBALI KE KAWASAN
          </button>
        </div>
      </div>
    </div>
  );
}
                RINGKASAN FASILITAS · DENAH KONSEPTUAL
              </div>
              <ul className="space-y-1.5 text-sm text-[#E9F2E3]/85">
                {activePanel.details.map((line, i) => (
                  <li key={`detail_${i}`}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer aksi */}
        <div className="mt-6 pt-4 border-t border-[#E9F2E3]/20 flex items-center justify-between gap-4">
          <span className="font-jetbrains text-xs text-[#E9F2E3]/60">
            Tekan Esc untuk kembali menjelajah
          </span>
          <button
            type="button"
            onClick={closePanel}
            className="bg-[#F2C200] hover:bg-[#ffd426] text-[#0B0D12] font-anton text-base tracking-wider uppercase px-5 py-2 cursor-pointer transition-colors"
          >
            KEMBALI KE KAWASAN
          </button>
        </div>
      </div>
    </div>
  );
}
