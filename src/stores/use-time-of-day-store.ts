/**
 * Zustand Store untuk Pengelolaan Waktu Lingkungan Realtime
 * Modul Lingkungan SMK TI BAZMA
 */

import { create } from 'zustand';
import { TIME_OF_DAY_CONFIG, TimePhase } from '@/lib/world/time-of-day.config';

export interface TimeOfDayState {
  // Sumber waktu aktif ('system' = jam lokal perangkat, 'manual' = override debug)
  timeSource: 'system' | 'manual';

  // Jam aktif dalam format desimal 0.00 - 24.00
  currentHour: number;

  // Format teks jam aktif (HH:MM:SS)
  formattedTime: string;

  // Fase waktu dominan saat ini
  activePhase: TimePhase;

  // Fase tujuan saat masa transisi
  nextPhase: TimePhase;

  // Progres interpolasi transisi (0.0 sampai 1.0)
  blendFactor: number;

  // Penanda apakah saat ini sedang dalam jendela transisi (30 menit sebelum batas)
  isTransitioning: boolean;

  // Keterangan teks status transisi untuk UI debug
  transitionDescription: string;

  // Deteksi prefers-reduced-motion untuk mematikan flicker dan meredam gerak
  prefersReducedMotion: boolean;

  // Aksi store
  setManualHour: (hour: number) => void;
  useSystemTime: () => void;
  tickSystemTime: () => void;
  setPrefersReducedMotion: (enabled: boolean) => void;
}

/**
 * Menghitung status fase dan progres blending berdasarkan jam desimal
 */
export function calculateTimePhaseState(hour: number) {
  // Normalisasi jam ke rentang 0 <= hour < 24
  let normalizedHour = hour % 24;
  if (normalizedHour < 0) normalizedHour += 24;

  const blendWindow = TIME_OF_DAY_CONFIG.blendWindowHours; // 0.5 jam (30 menit)

  // Batas-batas fase
  const bPagi = TIME_OF_DAY_CONFIG.phases.pagi.startHour;  // 5.0
  const bSiang = TIME_OF_DAY_CONFIG.phases.siang.startHour; // 10.0
  const bSore = TIME_OF_DAY_CONFIG.phases.sore.startHour;   // 15.5
  const bMalam = TIME_OF_DAY_CONFIG.phases.malam.startHour; // 18.5

  let currentPhase: TimePhase = 'malam';
  let nextPhase: TimePhase = 'malam';
  let blendFactor = 0;
  let isTransitioning = false;

  // Jendela transisi: 30 menit sebelum batas fase berikutnya
  if (normalizedHour >= bPagi - blendWindow && normalizedHour < bPagi) {
    // 04:30 - 05:00: Malam menuju Pagi
    currentPhase = 'malam';
    nextPhase = 'pagi';
    blendFactor = (normalizedHour - (bPagi - blendWindow)) / blendWindow;
    isTransitioning = true;
  } else if (normalizedHour >= bPagi && normalizedHour < bSiang - blendWindow) {
    // 05:00 - 09:30: Pagi murni
    currentPhase = 'pagi';
    nextPhase = 'pagi';
    blendFactor = 0;
    isTransitioning = false;
  } else if (normalizedHour >= bSiang - blendWindow && normalizedHour < bSiang) {
    // 09:30 - 10:00: Pagi menuju Siang
    currentPhase = 'pagi';
    nextPhase = 'siang';
    blendFactor = (normalizedHour - (bSiang - blendWindow)) / blendWindow;
    isTransitioning = true;
  } else if (normalizedHour >= bSiang && normalizedHour < bSore - blendWindow) {
    // 10:00 - 15:00: Siang murni
    currentPhase = 'siang';
    nextPhase = 'siang';
    blendFactor = 0;
    isTransitioning = false;
  } else if (normalizedHour >= bSore - blendWindow && normalizedHour < bSore) {
    // 15:00 - 15:30: Siang menuju Sore
    currentPhase = 'siang';
    nextPhase = 'sore';
    blendFactor = (normalizedHour - (bSore - blendWindow)) / blendWindow;
    isTransitioning = true;
  } else if (normalizedHour >= bSore && normalizedHour < bMalam - blendWindow) {
    // 15:30 - 18:00: Sore murni
    currentPhase = 'sore';
    nextPhase = 'sore';
    blendFactor = 0;
    isTransitioning = false;
  } else if (normalizedHour >= bMalam - blendWindow && normalizedHour < bMalam) {
    // 18:00 - 18:30: Sore menuju Malam
    currentPhase = 'sore';
    nextPhase = 'malam';
    blendFactor = (normalizedHour - (bMalam - blendWindow)) / blendWindow;
    isTransitioning = true;
  } else {
    // 18:30 - 04:30: Malam murni
    currentPhase = 'malam';
    nextPhase = 'malam';
    blendFactor = 0;
    isTransitioning = false;
  }

  // Tentukan fase nominal saat ini
  let activePhase: TimePhase;
  if (normalizedHour >= bPagi && normalizedHour < bSiang) {
    activePhase = 'pagi';
  } else if (normalizedHour >= bSiang && normalizedHour < bSore) {
    activePhase = 'siang';
  } else if (normalizedHour >= bSore && normalizedHour < bMalam) {
    activePhase = 'sore';
  } else {
    activePhase = 'malam';
  }

  const clampedBlend = Math.max(0, Math.min(1, blendFactor));
  const percent = Math.round(clampedBlend * 100);

  const transitionDescription = isTransitioning
    ? `${currentPhase} -> ${nextPhase} (${percent}%)`
    : `${activePhase} (stabil)`;

  return {
    activePhase: isTransitioning && clampedBlend >= 0.5 ? nextPhase : currentPhase,
    nominalPhase: activePhase,
    fromPhase: currentPhase,
    toPhase: nextPhase,
    blendFactor: clampedBlend,
    isTransitioning,
    transitionDescription,
  };
}

function getSystemDecimalHour(date: Date = new Date()): { hour: number; formatted: string } {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const decimalHour = h + m / 60 + s / 3600;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    hour: decimalHour,
    formatted: `${pad(h)}:${pad(m)}:${pad(s)}`,
  };
}

function formatDecimalHour(decimalHour: number): string {
  const normalized = ((decimalHour % 24) + 24) % 24;
  const h = Math.floor(normalized);
  const remainderMinutes = (normalized - h) * 60;
  const m = Math.floor(remainderMinutes);
  const s = Math.floor((remainderMinutes - m) * 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Inisialisasi awal
const initialSys = getSystemDecimalHour();
const initialCalculated = calculateTimePhaseState(initialSys.hour);

const initialReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export const useTimeOfDayStore = create<TimeOfDayState>((set, get) => ({
  timeSource: 'system',
  currentHour: initialSys.hour,
  formattedTime: initialSys.formatted,
  activePhase: initialCalculated.fromPhase,
  nextPhase: initialCalculated.toPhase,
  blendFactor: initialCalculated.blendFactor,
  isTransitioning: initialCalculated.isTransitioning,
  transitionDescription: initialCalculated.transitionDescription,
  prefersReducedMotion: initialReducedMotion,

  setManualHour: (hour: number) => {
    const clamped = Math.max(0, Math.min(24, hour));
    const phaseState = calculateTimePhaseState(clamped);
    set({
      timeSource: 'manual',
      currentHour: clamped,
      formattedTime: formatDecimalHour(clamped),
      activePhase: phaseState.fromPhase,
      nextPhase: phaseState.toPhase,
      blendFactor: phaseState.blendFactor,
      isTransitioning: phaseState.isTransitioning,
      transitionDescription: phaseState.transitionDescription,
    });
  },

  useSystemTime: () => {
    const sys = getSystemDecimalHour();
    const phaseState = calculateTimePhaseState(sys.hour);
    set({
      timeSource: 'system',
      currentHour: sys.hour,
      formattedTime: sys.formatted,
      activePhase: phaseState.fromPhase,
      nextPhase: phaseState.toPhase,
      blendFactor: phaseState.blendFactor,
      isTransitioning: phaseState.isTransitioning,
      transitionDescription: phaseState.transitionDescription,
    });
  },

  tickSystemTime: () => {
    // Hanya perbarui waktu otomatis jika mode sistem aktif
    if (get().timeSource !== 'system') return;

    const sys = getSystemDecimalHour();
    const phaseState = calculateTimePhaseState(sys.hour);
    set({
      currentHour: sys.hour,
      formattedTime: sys.formatted,
      activePhase: phaseState.fromPhase,
      nextPhase: phaseState.toPhase,
      blendFactor: phaseState.blendFactor,
      isTransitioning: phaseState.isTransitioning,
      transitionDescription: phaseState.transitionDescription,
    });
  },

  setPrefersReducedMotion: (enabled: boolean) => {
    set({ prefersReducedMotion: enabled });
  },
}));
