/**
 * Konfigurasi Tunggal Modul Lingkungan Waktu Realtime
 * Kawasan Sekolah Bernuansa Anime (Arah A: Kyoto Animation Daylight)
 *
 * Palet cerah, hangat, dan jernih:
 * - Pagi: Semburat fajar peach cerah dengan langit biru sejuk.
 * - Siang: Langit biru jenuh khas Kyoto Animation, awan putih tebal, bayangan lembut.
 * - Sore: Golden hour hangat bernuansa oranye keemasan dan violet pastel.
 * - Malam: Langit deep navy anime dengan pendaran jendela sekolah kuning hangat.
 */

export type TimePhase = 'pagi' | 'siang' | 'sore' | 'malam';

export interface PhaseVisualConfig {
  // Gradien kubah langit
  skyTopColor: string;
  skyBottomColor: string;
  skyExponent: number;

  // Cahaya matahari / bulan (directional light utama)
  celestialColor: string;
  celestialIntensity: number;

  // Cahaya ambien
  ambientColor: string;
  ambientIntensity: number;

  // Kabut atmosfer
  fogColor: string;
  fogDensity: number;

  // Bintang langit malam
  starsOpacity: number;

  // Partikel debu / kelopak bunga
  dustColor: string;
  dustOpacity: number;

  // Lampu lorong & jendela interior sekolah
  lampColor: string;
  lampIntensity: number;
  lampEmissiveColor: string;
  lampEmissiveIntensity: number;

  // Lapisan awan langit cumulus bergaya anime
  cloudColor: string;
  cloudOpacity: number;
}

export interface PhaseTimeRange {
  name: TimePhase;
  label: string;
  startHour: number;
  endHour: number;
}

export interface TimeOfDayConfig {
  // Rentang jam operasional fase waktu
  phases: Record<TimePhase, PhaseTimeRange>;

  // Jam terbit (05:50) dan terbenam (17:55) matahari
  sunriseHour: number;
  sunsetHour: number;

  // Durasi blending sebelum batas fase (dalam jam, 0.5 = 30 menit)
  blendWindowHours: number;

  // Jarak orbit celestial (matahari / bulan)
  celestialOrbitRadius: number;

  // Kecepatan redaman interpolasi (lambda untuk exponential damping)
  dampingLambda: number;

  // Konfigurasi visual tiap fase
  visuals: Record<TimePhase, PhaseVisualConfig>;

  // Konfigurasi lampu sekolah
  liminalLamp: {
    flickerProbability: number;
    flickerMinDamping: number;
    flickerIntensityDip: number;
  };
}

export const TIME_OF_DAY_CONFIG: TimeOfDayConfig = {
  // Rentang jam operasional fase waktu
  phases: {
    pagi: {
      name: 'pagi',
      label: 'Pagi Hari',
      startHour: 5.0, // 05:00
      endHour: 10.0,  // 10:00
    },
    siang: {
      name: 'siang',
      label: 'Siang Hari',
      startHour: 10.0, // 10:00
      endHour: 15.5,  // 15:30
    },
    sore: {
      name: 'sore',
      label: 'Sore Hari',
      startHour: 15.5, // 15:30
      endHour: 18.5,  // 18:30
    },
    malam: {
      name: 'malam',
      label: 'Malam Hari',
      startHour: 18.5, // 18:30
      endHour: 5.0,   // 05:00 (keesokan hari)
    },
  },

  // Jam terbit 05:50 (5 + 50/60) dan terbenam 17:55 (17 + 55/60)
  sunriseHour: 5.8333,
  sunsetHour: 17.9167,

  // 30 menit sebelum batas fase sudah mulai transisi halus
  blendWindowHours: 0.5,

  // Jarak orbit langit
  celestialOrbitRadius: 85,

  // Kecepatan damping lerp per detik
  dampingLambda: 3.5,

  liminalLamp: {
    flickerProbability: 0.005, // Tenang & stabil untuk suasana sekolah ramah
    flickerMinDamping: 14.0,
    flickerIntensityDip: 0.15,
  },

  visuals: {
    // Arah A: Kyoto Animation Daylight
    // Pagi: Fajar peach cerah berseri
    pagi: {
      skyTopColor: '#70B8F8',
      skyBottomColor: '#FFE4C4',
      skyExponent: 0.8,
      celestialColor: '#FFF3D1',
      celestialIntensity: 2.8,
      ambientColor: '#D8E8F8',
      ambientIntensity: 1.05,
      fogColor: '#EAF2FA',
      fogDensity: 0.002,
      starsOpacity: 0.0,
      dustColor: '#FFD1DC', // Nuansa kelopak bunga lembut
      dustOpacity: 0.22,
      lampColor: '#FFE8B2',
      lampIntensity: 0.2,
      lampEmissiveColor: '#FFE8B2',
      lampEmissiveIntensity: 0.15,
      cloudColor: '#FFFFFF',
      cloudOpacity: 0.95,
    },

    // Siang: Langit biru jenuh cerah, bayangan lembut kebiruan
    siang: {
      skyTopColor: '#389BFF',
      skyBottomColor: '#BAE0FD',
      skyExponent: 0.7,
      celestialColor: '#FFFFFA',
      celestialIntensity: 3.6,
      ambientColor: '#E0EFFF',
      ambientIntensity: 1.25,
      fogColor: '#CEE4FA',
      fogDensity: 0.001,
      starsOpacity: 0.0,
      dustColor: '#FFFFFF',
      dustOpacity: 0.12,
      lampColor: '#FFFDF5',
      lampIntensity: 0.05,
      lampEmissiveColor: '#FFFDF5',
      lampEmissiveIntensity: 0.05,
      cloudColor: '#FFFFFF',
      cloudOpacity: 0.98,
    },

    // Sore: Golden hour hangat, langit violet-oranye pastel
    sore: {
      skyTopColor: '#6058A8',
      skyBottomColor: '#FF9E5E',
      skyExponent: 0.75,
      celestialColor: '#FFA64D',
      celestialIntensity: 2.9,
      ambientColor: '#FFDAC4',
      ambientIntensity: 1.1,
      fogColor: '#FFCEBA',
      fogDensity: 0.003,
      starsOpacity: 0.1,
      dustColor: '#FFE3C2',
      dustOpacity: 0.25,
      lampColor: '#FFB84D',
      lampIntensity: 1.5,
      lampEmissiveColor: '#FFB84D',
      lampEmissiveIntensity: 1.0,
      cloudColor: '#FFCCAA',
      cloudOpacity: 0.92,
    },

    // Malam: Deep navy blue dengan jendela sekolah kuning hangat yang nyaman
    malam: {
      skyTopColor: '#151E3D',
      skyBottomColor: '#2A3B68',
      skyExponent: 1.1,
      celestialColor: '#96B9F5', // Rembulan keperakan lembut
      celestialIntensity: 0.95,
      ambientColor: '#232B45',
      ambientIntensity: 0.45,
      fogColor: '#1A2445',
      fogDensity: 0.008,
      starsOpacity: 0.95,
      dustColor: '#E0EAFF',
      dustOpacity: 0.2,
      lampColor: '#FFE28A', // Lampu jendela sekolah hangat ramah
      lampIntensity: 2.8,
      lampEmissiveColor: '#FFE28A',
      lampEmissiveIntensity: 2.0,
      cloudColor: '#202D52',
      cloudOpacity: 0.65,
    },
  },
};
