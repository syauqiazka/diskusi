/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Tata Letak Master Kampus "Sakura Academy"
 * Representasi data resmi dari 13 dokumen denah arsitektur:
 * - Master Site Plan ~2.5-3 ha (Gerbang Selatan, Plaza Air Mancur, Gedung Utama, Aula Teater,
 *   Gimnasium, Lapangan Sepak Bola + Bisbol, Gedung Budaya, Taman Koi, Asrama, dll.)
 * - Denah Lantai 1, 2, 3 dan Atap (Okujo) Gedung Utama
 * - Denah Aula Teater 800 kursi
 * - Denah Gimnasium + Kolam Indoor 25m
 * - Denah Interior Kelas 36 Meja Siswa (6x6)
 * - Bundaran Air Mancur Drop-Off Plaza
 * - Lapangan Gabungan Sepak Bola 105x68m + Bisbol 27m
 */

export interface RoomInfo {
  id: string;
  name: string;
  floor: 1 | 2 | 3 | 4; // 4 = Okujo / Atap
  side: "west" | "east" | "center";
  position: [number, number, number]; // [x, y, z] relatif terhadap titik nol Gedung Utama
  dimensions: [number, number, number]; // [width, height, depth]
  description: string;
  capacity?: string;
  tag?: string;
}

export interface BuildingZone {
  id: string;
  name: string;
  position: [number, number, number];
  dimensions: [number, number, number];
  category: "academic" | "sports" | "arts" | "residential" | "facility" | "landscape";
  description: string;
  teleportTarget: [number, number, number];
}

export const CAMPUS_BOUNDS = {
  width: 240,
  depth: 220,
  mainGatePosition: [0, 0, 50] as [number, number, number],
};

// 1. ZONA UTAMA MASTER SITE PLAN (~2.5 - 3 Hektar)
export const SAKURA_CAMPUS_ZONES: BuildingZone[] = [
  {
    id: "main_gate",
    name: "Gerbang Utama & Pos Satpam",
    position: [0, 0, 46],
    dimensions: [16, 4, 6],
    category: "facility",
    description: "Pintu masuk utama kawasan kampus dengan pos satpam dan palang keamanan.",
    teleportTarget: [0, 1.6, 42],
  },
  {
    id: "fountain_plaza",
    name: "Plaza Drop-Off & Air Mancur Sakura",
    position: [-16, 0, 24],
    dimensions: [24, 2, 24],
    category: "landscape",
    description: "Bundaran drop-off melingkar dengan paving granit, pita lantai motif sakura 8 arah, dan kolam 8+1 pancuran air.",
    teleportTarget: [-16, 1.6, 14],
  },
  {
    id: "main_building",
    name: "Gedung Utama (3 Lantai + Okujo)",
    position: [-32, 0, -10],
    dimensions: [22, 14, 64],
    category: "academic",
    description: "Gedung belajar utama dengan koridor 2.4m, atrium kaca 7.2m, menara jam, observatorium, dan teras atap.",
    teleportTarget: [-26, 1.6, 10], // Di depan Genkan lantai 1
  },
  {
    id: "auditorium",
    name: "Aula Teater (800 Kursi)",
    position: [-16, 0, -56],
    dimensions: [32, 10, 24],
    category: "arts",
    description: "Gedung pertunjukan dengan panggung 14x8m, pit orkestra, 4 blok kursi lantai 1, dan balkon lantai 2.",
    teleportTarget: [-16, 1.6, -44],
  },
  {
    id: "gymnasium_pool",
    name: "Gimnasium & Kolam Renang Indoor",
    position: [24, 0, -56],
    dimensions: [34, 11, 26],
    category: "sports",
    description: "Fasilitas olahraga indoor ber-AC: lapangan basket/voli, tribun 400 kursi, kolam renang 25m (6 lintasan), dan gym.",
    teleportTarget: [24, 1.6, -43],
  },
  {
    id: "sports_field",
    name: "Lapangan Gabungan Sepak Bola + Bisbol",
    position: [22, 0, -10],
    dimensions: [112, 1, 74],
    category: "sports",
    description: "Lapangan sepak bola 105x68m dengan overlay diamond bisbol (base 27m) dan lintasan lari atletik di sekelilingnya.",
    teleportTarget: [22, 1.6, 26],
  },
  {
    id: "culture_building",
    name: "Gedung Budaya & Taman Koi",
    position: [22, 0, 22],
    dimensions: [22, 7, 18],
    category: "arts",
    description: "Pusat seni rupa, ruang upacara teh tradisional (chashitsu), kolam taman koi dengan jembatan melengkung.",
    teleportTarget: [15, 1.6, 22],
  },
  {
    id: "kyudo_tennis",
    name: "Dojo Kyudo & Lapangan Tenis",
    position: [38, 0, 22],
    dimensions: [18, 5, 20],
    category: "sports",
    description: "Dojo panahan tradisional Kyudo dan 2 lapangan tenis luar ruangan.",
    teleportTarget: [38, 1.6, 12],
  },
  {
    id: "dormitory",
    name: "Asrama Siswa (Ryo, 4 Lantai)",
    position: [24, 0, 38],
    dimensions: [24, 13, 18],
    category: "residential",
    description: "Asrama berkapasitas 200 siswa: lobi, loker sepatu, ruang makan 80 kursi, pemandian ofuro, dan kamar siswa.",
    teleportTarget: [24, 1.6, 29],
  },
  {
    id: "bicycle_parking",
    name: "Parkir Sepeda Siswa",
    position: [-28, 0, 42],
    dimensions: [16, 3, 10],
    category: "facility",
    description: "Kawasan parkir sepeda beratap dengan rak logam untuk transportasi harian siswa.",
    teleportTarget: [-28, 1.6, 37],
  },
];

// 2. DAFTAR RUANGAN GEDUNG UTAMA (Lantai 1, 2, 3, dan Okujo)
// Sesuai Denah Gambar 2, 4, 5, 6
export const SAKURA_MAIN_BUILDING_ROOMS: RoomInfo[] = [
  // --- LANTAI 1 (1F, y = 1.8) ---
  {
    id: "r1_genkan",
    name: "Genkan (Loker Sepatu)",
    floor: 1,
    side: "east",
    position: [5.0, 1.8, 22.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Lobi atrium utama dengan deretan rak loker sepatu (getabako) tempat siswa mengganti sepatu luar dengan uwabaki.",
    tag: "Lobi & Masuk",
  },
  {
    id: "r1_kepala_sekolah",
    name: "Kepala Sekolah",
    floor: 1,
    side: "west",
    position: [-5.0, 1.8, 22.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Ruang kerja kepala sekolah dan penerimaan tamu resmi.",
  },
  {
    id: "r1_uks",
    name: "UKS (Hokenshitsu)",
    floor: 1,
    side: "east",
    position: [5.0, 1.8, 13.0],
    dimensions: [8.5, 3.6, 8.0],
    description: "Unit kesehatan sekolah dengan tempat tidur istirahat, kotak P3K, dan meja konsultasi perawat.",
    tag: "Kesehatan",
  },
  {
    id: "r1_ruang_guru",
    name: "Ruang Guru (Shokuin-shitsu)",
    floor: 1,
    side: "west",
    position: [-5.0, 1.8, 13.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Ruang kerja bersama para guru dan wali kelas.",
    tag: "Staff",
  },
  {
    id: "r1_tangga_toilet",
    name: "Tangga Utama & Toilet (Pria/Wanita)",
    floor: 1,
    side: "east",
    position: [5.0, 1.8, 4.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Tangga sirkulasi tipe U dan bilik toilet pria & wanita yang bersih.",
  },
  {
    id: "r1_perpustakaan",
    name: "Perpustakaan",
    floor: 1,
    side: "west",
    position: [-5.0, 1.8, 3.5],
    dimensions: [8.5, 3.6, 10.0],
    description: "Perpustakaan modern dengan rak buku berderet, meja baca kayu, dan terminal katalog digital.",
    tag: "Akademik",
  },
  {
    id: "r1_ruang_seni",
    name: "Ruang Seni",
    floor: 1,
    side: "east",
    position: [5.0, 1.8, -5.5],
    dimensions: [8.5, 3.6, 9.0],
    description: "Studio melukis dan seni rupa dengan kanvas berdiri dan wastafel cuci kuas.",
    tag: "Kreatif",
  },
  {
    id: "r1_lab_ipa",
    name: "Lab IPA",
    floor: 1,
    side: "west",
    position: [-5.0, 1.8, -6.5],
    dimensions: [8.5, 3.6, 9.0],
    description: "Laboratorium sains lengkap dengan meja preparat tahan bahan kimia dan mikroskop.",
    tag: "Sains",
  },
  {
    id: "r1_kelas_1d",
    name: "Kelas 1-D",
    floor: 1,
    side: "east",
    position: [5.0, 1.8, -14.5],
    dimensions: [8.5, 3.6, 8.0],
    description: "Ruang kelas siswa tahun pertama (Kelas 1-D) dengan 36 meja berorientasi 6x6.",
    capacity: "36 Siswa",
  },
  {
    id: "r1_kelas_1c",
    name: "Kelas 1-C",
    floor: 1,
    side: "west",
    position: [-5.0, 1.8, -15.5],
    dimensions: [8.5, 3.6, 8.0],
    description: "Ruang kelas siswa tahun pertama (Kelas 1-C).",
    capacity: "36 Siswa",
  },
  {
    id: "r1_kelas_1b",
    name: "Kelas 1-B",
    floor: 1,
    side: "east",
    position: [5.0, 1.8, -23.0],
    dimensions: [8.5, 3.6, 8.0],
    description: "Ruang kelas siswa tahun pertama (Kelas 1-B).",
    capacity: "36 Siswa",
  },
  {
    id: "r1_kelas_1a",
    name: "Kelas 1-A (Enterable)",
    floor: 1,
    side: "west",
    position: [-5.0, 1.8, -24.0],
    dimensions: [8.5, 3.6, 8.0],
    description: "Ruang kelas utama yang dapat dijelajahi langsung: 36 meja 6x6, meja guru, papan tulis kapur, tirai putih, dan loker belakang.",
    capacity: "36 Siswa",
    tag: "Bisa Dimasuki",
  },

  // --- LANTAI 2 (2F, y = 5.4) ---
  {
    id: "r2_void_atrium",
    name: "Void Atrium (Tembus ke Lantai 1)",
    floor: 2,
    side: "east",
    position: [5.0, 5.4, 22.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Bukaan void dua lantai dengan railing kaca memandang ke lobi Genkan lantai 1.",
  },
  {
    id: "r2_lab_bahasa",
    name: "Lab Bahasa",
    floor: 2,
    side: "west",
    position: [-5.0, 5.4, 22.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Laboratorium bahasa asing interaktif dengan bilik audio dan headphone.",
  },
  {
    id: "r2_konseling",
    name: "Ruang Konseling",
    floor: 2,
    side: "east",
    position: [5.0, 5.4, 13.0],
    dimensions: [8.5, 3.6, 8.0],
    description: "Ruang bimbingan konseling pribadi siswa dengan sofa dan suasana tenang.",
  },
  {
    id: "r2_kafetaria",
    name: "Kafetaria Premium (120 Kursi)",
    floor: 2,
    side: "west",
    position: [-5.0, 5.4, 11.5],
    dimensions: [8.5, 3.6, 12.0],
    description: "Kantin sekolah premium dengan counter bento, jus segar, dan area makan santai siswa.",
    capacity: "120 Kursi",
  },
  {
    id: "r2_tangga_toilet",
    name: "Tangga Lantai 2 & Toilet",
    floor: 2,
    side: "east",
    position: [5.0, 5.4, 4.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Akses tangga sirkulasi dan toilet lantai 2.",
  },
  {
    id: "r2_ruang_seminar",
    name: "Ruang Seminar (60 Kursi)",
    floor: 2,
    side: "west",
    position: [-5.0, 5.4, -0.5],
    dimensions: [8.5, 3.6, 11.0],
    description: "Ruang pertemuan bertingkat dengan proyektor untuk kuliah umum dan presentasi riset.",
    capacity: "60 Kursi",
  },
  {
    id: "r2_ruang_komputer",
    name: "Ruang Komputer",
    floor: 2,
    side: "east",
    position: [5.0, 5.4, -5.5],
    dimensions: [8.5, 3.6, 9.0],
    description: "Laboratorium komputer dengan 40 PC modern untuk pemrograman dan multimedia.",
  },
  {
    id: "r2_ruang_musik",
    name: "Ruang Musik",
    floor: 2,
    side: "west",
    position: [-5.0, 5.4, -11.5],
    dimensions: [8.5, 3.6, 10.0],
    description: "Ruang musik kedap suara dengan piano grand, drum kit, dan rak instrumen orkestra.",
    tag: "Kesenian",
  },
  {
    id: "r2_kelas_2d",
    name: "Kelas 2-D",
    floor: 2,
    side: "east",
    position: [5.0, 5.4, -15.5],
    dimensions: [8.5, 3.6, 8.0],
    description: "Ruang kelas siswa tahun kedua (Kelas 2-D).",
    capacity: "36 Siswa",
  },
  {
    id: "r2_kelas_2c",
    name: "Kelas 2-C",
    floor: 2,
    side: "west",
    position: [-5.0, 5.4, -20.5],
    dimensions: [8.5, 3.6, 7.5],
    description: "Ruang kelas siswa tahun kedua (Kelas 2-C).",
    capacity: "36 Siswa",
  },
  {
    id: "r2_kelas_2b",
    name: "Kelas 2-B",
    floor: 2,
    side: "east",
    position: [5.0, 5.4, -23.5],
    dimensions: [8.5, 3.6, 7.5],
    description: "Ruang kelas siswa tahun kedua (Kelas 2-B).",
    capacity: "36 Siswa",
  },
  {
    id: "r2_kelas_2a",
    name: "Kelas 2-A",
    floor: 2,
    side: "west",
    position: [-5.0, 5.4, -27.5],
    dimensions: [8.5, 3.6, 6.5],
    description: "Ruang kelas siswa tahun kedua (Kelas 2-A).",
    capacity: "36 Siswa",
  },

  // --- LANTAI 3 (3F, y = 9.0) ---
  {
    id: "r3_akses_atap",
    name: "Pintu Akses Tangga ke Okujo",
    floor: 3,
    side: "east",
    position: [5.0, 9.0, 22.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Tangga langsung menuju teras atap terbuka (Okujo).",
    tag: "Akses Okujo",
  },
  {
    id: "r3_ruang_sastra",
    name: "Ruang Sastra & Bahasa",
    floor: 3,
    side: "west",
    position: [-5.0, 9.0, 22.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Ruang diskusi klub sastra dan penerbitan majalah dinding sekolah.",
  },
  {
    id: "r3_ruang_klub",
    name: "Ruang Klub OSIS / Siswa",
    floor: 3,
    side: "east",
    position: [5.0, 9.0, 13.0],
    dimensions: [8.5, 3.6, 8.0],
    description: "Sekretariat dewan siswa (Seitokai) dan ruang koordinasi antarklub.",
  },
  {
    id: "r3_lab_robotik",
    name: "Lab Robotik (Klub Sains)",
    floor: 3,
    side: "west",
    position: [-5.0, 9.0, 12.0],
    dimensions: [8.5, 3.6, 11.0],
    description: "Bengkel robotika sekolah dengan printer 3D, sensor, dan arena uji coba robot.",
    tag: "Teknologi",
  },
  {
    id: "r3_tangga_toilet",
    name: "Tangga Lantai 3 & Toilet",
    floor: 3,
    side: "east",
    position: [5.0, 9.0, 4.0],
    dimensions: [8.5, 3.6, 9.0],
    description: "Tangga sirkulasi dan toilet lantai 3.",
  },
  {
    id: "r3_ruang_kuliah",
    name: "Ruang Kuliah (80 Kursi)",
    floor: 3,
    side: "west",
    position: [-5.0, 9.0, 0.0],
    dimensions: [8.5, 3.6, 12.0],
    description: "Amfiteater kelas gabungan untuk mata pelajaran umum.",
    capacity: "80 Kursi",
  },
  {
    id: "r3_studio_rekaman",
    name: "Studio Rekaman Audio",
    floor: 3,
    side: "east",
    position: [5.0, 9.0, -5.5],
    dimensions: [8.5, 3.6, 9.0],
    description: "Studio siaran radio sekolah dan rekaman audio berperedam suara akustik.",
  },
  {
    id: "r3_ruang_karier",
    name: "Ruang Bimbingan Karier & Universitas",
    floor: 3,
    side: "west",
    position: [-5.0, 9.0, -11.5],
    dimensions: [8.5, 3.6, 10.0],
    description: "Pusat informasi perguruan tinggi dan persiapan karier kelulusan siswa.",
  },
  {
    id: "r3_kelas_3d",
    name: "Kelas 3-D",
    floor: 3,
    side: "east",
    position: [5.0, 9.0, -15.5],
    dimensions: [8.5, 3.6, 8.0],
    description: "Ruang kelas siswa tingkat akhir (Kelas 3-D).",
    capacity: "36 Siswa",
  },
  {
    id: "r3_kelas_3c",
    name: "Kelas 3-C",
    floor: 3,
    side: "west",
    position: [-5.0, 9.0, -20.5],
    dimensions: [8.5, 3.6, 7.5],
    description: "Ruang kelas siswa tingkat akhir (Kelas 3-C).",
    capacity: "36 Siswa",
  },
  {
    id: "r3_kelas_3b",
    name: "Kelas 3-B",
    floor: 3,
    side: "east",
    position: [5.0, 9.0, -23.5],
    dimensions: [8.5, 3.6, 7.5],
    description: "Ruang kelas siswa tingkat akhir (Kelas 3-B).",
    capacity: "36 Siswa",
  },
  {
    id: "r3_kelas_3a",
    name: "Kelas 3-A",
    floor: 3,
    side: "west",
    position: [-5.0, 9.0, -27.5],
    dimensions: [8.5, 3.6, 6.5],
    description: "Ruang kelas siswa tingkat akhir (Kelas 3-A).",
    capacity: "36 Siswa",
  },

  // --- ATAP OKUJO (Roof, y = 11.5) ---
  {
    id: "roof_clock_tower",
    name: "Menara Jam Sekolah",
    floor: 4,
    side: "east",
    position: [5.0, 14.0, 18.0],
    dimensions: [6.0, 6.0, 6.0],
    description: "Menara jam analog 4 sisi dengan lonceng chime sekolah yang berdentang di setiap jam.",
    tag: "Ikonik",
  },
  {
    id: "roof_observatory",
    name: "Observatorium Kubah Teleskop",
    floor: 4,
    side: "west",
    position: [-5.0, 13.5, -24.0],
    dimensions: [7.0, 5.0, 7.0],
    description: "Kubah kubikal perak dengan teleskop astronomi untuk klub antariksa dan pengamatan malam.",
    tag: "Astronomi",
  },
  {
    id: "roof_terrace",
    name: "Teras Atap (Okujo) & Tempat Makan Siang",
    floor: 4,
    side: "center",
    position: [0.0, 11.5, -2.0],
    dimensions: [18.0, 2.4, 32.0],
    description: "Teras luas terbuka berpagar kawat ram tinggi, dilengkapi meja dan bangku kayu siswa untuk bersantai saat jam makan siang.",
    tag: "Anime Classic",
  },
  {
    id: "roof_garden",
    name: "Kebun Hijau Hidroponik",
    floor: 4,
    side: "west",
    position: [-5.0, 11.5, 14.0],
    dimensions: [8.0, 1.2, 10.0],
    description: "Petak tanaman hijau, bunga sakura kerdil, dan kebun sayur klub botani.",
  },
  {
    id: "roof_solar_panels",
    name: "Panel Surya Ramah Lingkungan",
    floor: 4,
    side: "east",
    position: [5.0, 12.0, -20.0],
    dimensions: [8.0, 1.5, 12.0],
    description: "Larik modul photovoltaic modern penyuplai energi bersih untuk seluruh kampus.",
  },
];

// 3. DAFTAR TITIK TELEPORTASI CEPAT
export const SAKURA_TELEPORT_POINTS = [
  { id: "gate", name: "Gerbang Utama", pos: [0, 1.6, 42] as [number, number, number] },
  { id: "fountain", name: "Bundaran Air Mancur", pos: [-16, 1.6, 14] as [number, number, number] },
  { id: "genkan", name: "Genkan (Pintu Masuk)", pos: [-26, 1.6, 10] as [number, number, number] },
  { id: "classroom", name: "Ruang Kelas 1-A", pos: [-36, 1.6, -34] as [number, number, number] },
  { id: "rooftop", name: "Teras Atap (Okujo)", pos: [-32, 12.5, -12] as [number, number, number] },
  { id: "auditorium", name: "Aula Teater (800 Kursi)", pos: [-16, 1.6, -44] as [number, number, number] },
  { id: "gym", name: "Gimnasium & Kolam", pos: [24, 1.6, -43] as [number, number, number] },
  { id: "field", name: "Lapangan Olahraga", pos: [22, 1.6, 26] as [number, number, number] },
  { id: "dormitory", name: "Asrama Siswa", pos: [24, 1.6, 29] as [number, number, number] },
];
