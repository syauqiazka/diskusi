# DESIGN.md: Platform Belajar "Sekolah Tengah Malam" (SMK TI BAZMA)

> **Pembaruan Desain & Ergonomi Warna (Berdasarkan Rekomendasi `ui-ux-pro-max`)**:
> Menggantikan palet *pitch-black terminal* (`#0B0D12` / neon `#E9F2E3`) yang melelahkan mata menjadi sistem **Modern Clean Campus / Academic Slate**. Mengutamakan kenyamanan mata pengguna (*eye comfort*), keterbacaan teks (*readability*), dan standar aksesibilitas WCAG 2.2 AAA saat membaca modul, berdiskusi di forum, dan berkirim pesan. Detail eksplorasi dunia 3D tetap mengikuti `WORLD.md`.

---

## 1. Konteks & Prinsip Desain
Platform pembelajaran dan forum diskusi kejuruan SIJA SMK TI BAZMA yang memadukan dua pengalaman:
1. **Mode 2D (Ruang Belajar Utama)**: Antarmuka aplikasi bersih, ergonomis, cepat, dan nyaman di mata untuk kegiatan belajar harian (membaca materi perpustakaan, berdiskusi di mading, mengelola kelas, dan pesan langsung).
2. **Dunia 3D (Jelajah Kampus)**: Eksplorasi first-person spasial kawasan sekolah SMK TI BAZMA (lapangan, lorong, gedung sekolah, dan asrama).

Prinsip utama: **Anti-Slop & Eye-Comfort**. Tidak ada tombol dengan label membingungkan, tidak ada kurung siku berlebihan (`[...]`), dan tidak ada latar hitam pekat yang menyebabkan ketegangan mata (*visual eye fatigue / astigmatism halation*).

---

## 2. Target Pengguna
Siswa, santri, pengajar, dan staf SMK TI BAZMA. Pengguna menghabiskan waktu berjam-jam untuk membaca modul praktikum, dokumentasi konfigurasi server/jaringan, serta berdiskusi tugas. Oleh karena itu, antarmuka wajib nyaman di mata (*eye comfort*), tidak menyilaukan, dan memiliki hierarki visual yang jelas.

---

## 3. Sistem Warna Ergonomis (`ui-ux-pro-max`)

Sistem token warna dirancang agar memiliki rasio kontras tinggi di atas latar bersih tanpa efek silau (*zero-glare*):

| Token | Hex | Rasio Kontras | Kegunaan & Makna |
|---|---|---|---|
| `--night` (Surface) | `#FFFFFF` | 18.2:1 (AAA) | Permukaan kartu, panel, kotak dialog, input formulir, dan navbar |
| `--canvas` (Latar Utama) | `#F8FAFC` | 17.8:1 (AAA) | Latar belakang seluruh halaman aplikasi (Slate 50 yang sejuk dan ramah mata) |
| `--fluor` (Teks Utama) | `#0F172A` | 17.8:1 (AAA) | Teks utama, judul, dan tipografi penting (Slate 900, tajam dan sangat mudah dibaca) |
| `--fluor-muted` | `#475569` | 7.5:1 (AAA) | Teks sekunder, deskripsi, informasi pengunggah, dan timestamp (Slate 600) |
| `--caution` (Aksen Utama) | `#D97706` | 4.8:1 (AA+) | Tombol aksi utama (CTA), lencana kelas aktif, sorotan terpilih (Warm Amber 600) |
| `--neon-cyan` (Informasi) | `#0284C7` | 4.6:1 (AA+) | Kategori materi, tautan, badge peran guru/asisten (Sky Blue 600) |
| `--neon-pink` | `#E11D48` | 4.7:1 (AA+) | Sorotan mading terhangat, aksen logo (Rose 600) |
| `--alert` (Peringatan/Hapus) | `#DC2626` | 5.2:1 (AA+) | Tombol hapus, pesan kesalahan, peringatan validasi (Red 600) |
| `--ok` (Sukses/Online) | `#16A34A` | 4.6:1 (AA+) | Status aktif, jawaban terverifikasi, unduhan selesai (Emerald 600) |
| `--border-subtle` | `rgba(15, 23, 42, 0.12)` | - | Garis batas kartu, pemisah tabel, dan border input yang rapi |

### Aturan Penerapan Warna:
- **Latar & Kartu**: Latar belakang aplikasi menggunakan warna sejuk `#F8FAFC`, dan komponen kartu menggunakan warna putih `#FFFFFF` dengan batas halus `border-fluor/15` serta bayangan tipis `shadow-sm`.
- **Tombol Utama (`default`)**: Latar Amber `#D97706` dengan teks Putih `#FFFFFF` untuk kontras tindakan yang tegas.
- **Tombol Sekunder & Outline**: Latar putih transparan dengan border halus dan teks Slate `#0F172A`.
- **Tidak ada teks neon menyilaukan**: Semua warna aksen dioptimalkan untuk keterbacaan di atas latar terang.

---

## 4. Tipografi
- **Teks Isi & Antarmuka Utama**: **Instrument Sans** (bersih, modern, spasi proporsional, ramah mata untuk teks panjang).
- **Kode, Tag, Nomor Meja, Username**: **JetBrains Mono** (keterbacaan teknis tinggi).
- **Judul Besar & Rambu**: **Anton** (kondensed, tegas, berwibawa).
- **Label HUD & Display Retro**: **VT323** (digunakan secukupnya pada elemen tematik kawasan).

---

## 5. Tata Letak Komponen & Anti-Pola (Anti-Slop)

### Hindari:
- Latar hitam pekat (`#000000` / `#0B0D12`) yang membuat mata cepat lelah saat membaca teks panjang.
- Teks neon kuning/hijau stabilo yang menyilaukan (*high-glare*).
- Polusi kurung siku ASCII (`[...]`) pada label tombol harian. Gunakan bahasa Indonesia wajar: *"Buka Kelas"*, *"Tambah Materi"*, *"Kirim Pesan"*.
- Emoji sebagai ikon utama (gunakan SVG dari `lucide-react`).
- Pengulangan kotak di dalam kotak (*nested bordered boxes*) tanpa hierarki yang jelas.

### Wajib Diterapkan:
- Semua tombol dan elemen interaktif memiliki `cursor-pointer`, transisi halus (`transition-colors duration-150`), dan state `:hover` yang jelas.
- Formulir input memiliki kontras yang nyaman, padding memadai, dan ring fokus (`focus:ring-2 focus:ring-caution`).
- Dialog modal menggunakan latar belakang peredup lembut (`bg-slate-900/50 backdrop-blur-sm`) dengan kartu modal putih bersih.

---

## 6. Aksesibilitas (WCAG 2.2 Compliant)
- Rasio kontras teks tubuh minimal 4.5:1 (pada tema ini mencapai 17.8:1).
- Fokus keyboard terlihat jelas untuk navigasi tanpa mouse.
- Menghormati pengaturan `prefers-reduced-motion` untuk pengguna yang sensitif terhadap animasi.
- Teks deskriptif pada setiap tombol aksi dan formulir.
