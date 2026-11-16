/**
 * Konfigurasi Tunggal Modul Lingkungan Waktu Realtime
 * Kawasan SMK TI BAZMA
 *
 * Catatan Palet:
 * - Palet malam: Berdasarkan identitas proyek retro-liminal Cuchillo Midnight Video
 *   (latar --night, teks --fluor, aksen --caution dari DESIGN.md).
 * - Palet pagi, siang, sore: Desain konseptual netral (belum final), selaras
 *   dalam satu rumpun visual liminal (agak pucat, kontras tegas).
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

  // Partikel debu / mote udara
  dustColor: string;
  dustOpacity: number;

  // Lampu lorong & interior (LiminalLamp)
  lampColor: string;
  lampIntensity: number;
  lampEmissiveColor: string;
  lampEmissiveIntensity: number;

  // Lapisan awan langit (SkyClouds)
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

  // Konfigurasi lampu lorong liminal
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
    flickerProbability: 0.015,
    flickerMinDamping: 12.0,
    flickerIntensityDip: 0.45,
  },

  visuals: {
    // DESAIN KONSEPTUAL - belum final
    // Palet pagi: Kabut fajar sejuk pucat, semburat fajar lembut
    pagi: {
      skyTopColor: '#3a4d63',
      skyBottomColor: '#c4b3a3',
      skyExponent: 0.75,
      celestialColor: '#eadecb',
      celestialIntensity: 2.2,
      ambientColor: '#6e7c8a',
      ambientIntensity: 0.75,
      fogColor: '#9aa8b5',
      fogDensity: 0.005,
      starsOpacity: 0.0,
      dustColor: '#e8eff5',
      dustOpacity: 0.16,
      lampColor: '#F2C200',
      lampIntensity: 0.6,
      lampEmissiveColor: '#F2C200',
      lampEmissiveIntensity: 0.4,
      cloudColor: '#e6ded8',
      cloudOpacity: 0.82,
    },

    // DESAIN KONSEPTUAL - belum final
    // Palet siang: Terang benderang khas siang tropis namun bernuansa liminal pucat & kontras tegas
    siang: {
      skyTopColor: '#426b94',
      skyBottomColor: '#a6c4dc',
      skyExponent: 0.65,
      celestialColor: '#f5f2e6',
      celestialIntensity: 3.4,
      ambientColor: '#9ab0c4',
      ambientIntensity: 1.1,
      fogColor: '#b0c7db',
      fogDensity: 0.002,
      starsOpacity: 0.0,
      dustColor: '#ffffff',
      dustOpacity: 0.08,
      lampColor: '#eee5c8',
      lampIntensity: 0.1,
      lampEmissiveColor: '#ded5b8',
      lampEmissiveIntensity: 0.1,
      cloudColor: '#f0f4f8',
      cloudOpacity: 0.92,
    },

    // DESAIN KONSEPTUAL - belum final
    // Palet sore: Senja tembaga liminal desaturasi, bayangan panjang hening
    sore: {
      skyTopColor: '#3d3345',
      skyBottomColor: '#b5795b',
      skyExponent: 0.72,
      celestialColor: '#c96b3a',
      celestialIntensity: 2.5,
      ambientColor: '#665560',
      ambientIntensity: 0.75,
      fogColor: '#8c6b65',
      fogDensity: 0.006,
      starsOpacity: 0.15,
      dustColor: '#d6a385',
      dustOpacity: 0.22,
      lampColor: '#F2C200',
      lampIntensity: 1.6,
      lampEmissiveColor: '#F2C200',
      lampEmissiveIntensity: 1.0,
      cloudColor: '#bf7d56',
      cloudOpacity: 0.88,
    },

    // Nilai resmi dari DESIGN.md:
    // --night: #0B0D12, --fluor: #E9F2E3, --caution: #F2C200, --neon-cyan: #5CE1FF
    malam: {
      skyTopColor: '#05070a',
      skyBottomColor: '#0B0D12',
      skyExponent: 1.2,
      celestialColor: '#5CE1FF', // Sinar bulan keperakan neon cyan
      celestialIntensity: 0.65,
      ambientColor: '#0B0D12',
      ambientIntensity: 0.22,
      fogColor: '#0B0D12',
      fogDensity: 0.024,
      starsOpacity: 0.95,
      dustColor: '#E9F2E3', // Pendaran debu samar fluor
      dustOpacity: 0.32,
      lampColor: '#F2C200', // Lampu neon liminal caution
      lampIntensity: 3.2,
      lampEmissiveColor: '#F2C200',
      lampEmissiveIntensity: 2.2,
      cloudColor: '#0B0D12', // Memudar total di fase malam
      cloudOpacity: 0.0,
    },
  },
};
