# DESIGN.md: Platform Belajar Sekolah Virtual SMK TI BAZMA

> **Arah Desain Baru: Friendly Toy-Like & Anime Campus**
> Menggantikan seluruh estetika lama (retro-liminal VCR/CRT "Cuchillo Midnight Video", font VT323/Anton, token `--night`/`--fluor`/`--caution`).
> Terinspirasi dari karakter antarmuka bersahabat, hangat, dan interaktif ala *bruno-simon.com* (BUKAN meniru), dipadukan dengan atmosfer visual kampus sekolah anime cerah.

---

## 1. Visi & Filosofi Desain

Platform belajar dan eksplorasi digital siswa SMK TI BAZMA dengan dua pilar utama:
1. **Mode 2D (Ruang Belajar Interaktif)**: Antarmuka yang ramah, hangat, seperti mainan (*toy-like*), dengan panel membulat (*rounded-3xl*), bayangan empuk (*soft chunky shadows*), tombol pil ceria, dan navigasi intuitif maksimal 2 tingkat.
2. **Dunia 3D (Jelajah Kampus Anime)**: Kampus sekolah anime cerah bergaya Kyoto Animation dengan *cel/toon shading*, outline halus, langit biru jenuh dengan awan cumulus kartun, dan pencahayaan dinamis 4 fase waktu (pagi, siang, sore, malam).

Prinsip mutlak:
- **Anti-Slop & Human-Centered**: Tanpa label terminal kaku (`[ENTER]`, `[01]`, `SP 0:00:00`), tanpa border 1px hitam suram, tanpa kalimat klise AI.
- **Eye-Comfort & Aksesibilitas**: Kontras teks tubuh minimal 4.5:1 (pada palet baru mencapai 17.8:1), fokus keyboard terlihat tegas (`focus:ring-4 focus:ring-mint-300`), dan selalu menghormati `prefers-reduced-motion`.
- **Desain Konseptual yang Jujur**: Denah sekolah dan tata ruang interior ditandai secara transparan sebagai desain konseptual fiksi terinspirasi sekolah, bukan denah replika arsitektural 1:1.

---

## 2. Sistem Warna (Palet Terpilih: "Fresh Mint & Peach")

> [!NOTE]
> Palet ini berstatus **KONSEPTUAL**. Ketika warna resmi dan logo sekolah diberikan, nilai hex akan disesuaikan ke dalam struktur token ini tanpa mengubah arsitektur komponen.

Satu palet terpadu: **1 Warna Utama, 1 Pendukung, 1 Kontras untuk Tombol Penting, dan Netral**:

| Token Baru | Nilai Hex | Peran Visual | Rasio Kontras |
|---|---|---|---|
| `--color-canvas` | `#F0FDF4` (Mint 50) | Latar belakang kanvas aplikasi; sejuk, segar, ramah di mata | Netral |
| `--color-surface` | `#FFFFFF` (Putih Murni) | Permukaan kartu, panel modal, dialog, dan input | 17.8:1 (AAA) |
| `--color-primary` | `#34D399` (Mint 400) | **Warna Utama**: Header ceria, aksen tab aktif, border fokus ramah | 3.2:1 (Large/Icon) |
| `--color-secondary` | `#FDBA74` (Peach 300) | **Warna Pendukung**: Badge info, sorotan kedua, kartu pendukung | - |
| `--color-accent` | `#4F46E5` (Indigo 600) | **Warna Kontras (CTA Penting)**: Tombol utama *"Mulai Menjelajah"*, aksi primer | 5.8:1 (AA+) |
| `--color-text` | `#0F172A` (Slate 900) | **Teks Utama**: Judul, isi pesan, label tombol, paragraf | 17.8:1 (AAA) |
| `--color-text-muted` | `#64748B` (Slate 500) | **Teks Sekunder**: Keterangan waktu, deskripsi singkat, placeholder | 4.6:1 (AA) |
| `--color-border` | `#E2E8F0` (Slate 200) | Garis tepi kartu dan pemisah lembut (halus dan rapi) | - |
| `--color-destructive` | `#EF4444` (Red 500) | Tombol bahaya, aksi reset, peringatan penting | 4.5:1 (AA) |
| `--color-success` | `#10B981` (Emerald 500)| Indikator online, centang selesai, pencapaian didapat | 4.5:1 (AA) |

---

## 3. Tipografi (Fredoka + Nunito via `next/font/google`)

1. **Font Judul & Header (`font-display`)**: **Fredoka**
   - Karakter: Bulat montok, bersahabat, seperti mainan kayu/balon, tanpa sudut tajam menusuk.
   - Digunakan untuk: Judul halaman, logo sambutan, judul kartu modal, teks tombol besar.
2. **Font Isi & Antarmuka (`font-body`)**: **Nunito**
   - Karakter: Sans-serif geometris dengan ujung melengkung halus (*rounded terminals*), sangat nyaman dibaca berjam-jam di layar HP maupun laptop.
   - Digunakan untuk: Teks bacaan, formulir masuk/daftar, daftar kontrol, dialog chat, dan opsi.
3. **Font Teknis & Angka (`font-mono`)**: **JetBrains Mono**
   - Hanya digunakan saat menampilkan koordinat teknis, kode kelas (`SIJA-10A`), atau shortcut keyboard.

---

## 4. Desain Layar 2D Utama

1. **Home / Sambutan (`/`)**:
   - Sambutan hangat, sapaan singkat kepada siswa/pengunjung.
   - Tombol utama mencolok: **"Mulai Menjelajah"** (`#4F46E5` dengan teks putih dan efek tekan empuk).
   - Deretan tombol aksi mengambang berbentuk pil (*floating pills*): **Opsi**, **Kontrol**, **Peta Kawasan**, **Pencapaian**, dan **Kredit**.
   - Tautan cepat ke Ruang Kelas, Mading, Perpustakaan, dan Pesan.
2. **Modal Opsi**:
   - Sakelar suara (Efek Audio & Musik Latar).
   - Pemilih kualitas grafis (Rendah / Sedang / Tinggi).
   - Tombol pertolongan pertama: **"Aku tersangkut"** (mereset koordinat avatar kembali ke titik awal spawn).
   - Tombol reset pengaturan ke bawaan.
3. **Modal Kontrol**:
   - Visual tuts keyboard membulat: `W A S D` (Jalan), `Shift` (Lari cepat), `C` (Jongkok), `Backspace` (Lompat), `E / Klik Kiri` (Interaksi), `Esc` (Jeda).
4. **Peta Kawasan 2D (`MapModal`)**:
   - Digambar secara deterministik dari file data tata letak `campus-layout.ts` dan `school-interior-layout.ts` (satu sumber kebenaran, tanpa hardcode angka koordinat).
   - Menampilkan posisi pemain secara live (titik dot dengan arah panah orientasi).
   - Menampilkan area bernama: Gerbang Utama, Turunan, Lobi Asrama, Lapangan Olahraga, Gedung Sekolah, Perpustakaan, dsb.
   - Pemilih lantai bila berada di gedung bertingkat. Penanda seragam untuk area konseptual.
5. **Modal Pencapaian (Achievements)**:
   - Disimpan di sisi klien (`localStorage` / Zustand client-only).
   - Lencana: *"Langkah Pertama"* (masuk ke kampus), *"Kutu Buku"* (membuka perpustakaan), *"Penyapa"* (membuka direktori teman), *"Penjelajah"* (berkeliling ke 3 area berbeda).
6. **Modal Kredit "Di Balik Layar"**:
   - Apresiasi alat & pustaka: Three.js, React Three Fiber, Next.js, Tailwind CSS, Lucide Icons.
   - Penegasan status: Karya dunia virtual ini adalah fiksi bergaya yang terinspirasi dari SMK TI BAZMA, bukan replika arsitektural resmi.
7. **Halaman Masuk (`/masuk`) & Daftar (`/daftar`)**:
   - Formulir kartu putih membulat (*rounded-3xl*) dengan bayangan lembut di atas latar mint `#F0FDF4`.
   - Logika autentikasi Zod dan Better Auth tetap berjalan 100% tanpa perubahan backend.
8. **HUD Dalam Dunia (`world-hud.tsx`)**:
   - Crosshair lingkaran lembut transparan di tengah layar.
   - Prompt interaksi mengambang berbentuk pil: `[E / KLIK] <AKSI>` yang empuk.
   - Layar jeda membulat dan layar memuat (*loading screen*) dengan animasi ceria.
   - Deteksi perangkat layar sentuh: memunculkan pesan ramah untuk membuka di laptop demi pengalaman kontrol optimal.

---

## 5. Arah Suasana Dunia 3D (Arah A: "Kyoto Animation Daylight")

- **Shading**: `MeshToonMaterial` cel-shaded 3-tingkat dengan bayangan kebiruan lembut, garis outline siluet tipis (*inverted-hull method*).
- **Arsitektur Fiksi Bergaya**:
  - Gedung sekolah: Blok panjang berderet jendela geser kaca, garis pelat lantai tipis, tiang vertikal teratur.
  - Atap datar berpagar besi dengan penutup tangga dan tangki air silinder.
  - Jam dinding analog besar di fasad depan sekolah yang berputar halus mengikuti waktu sistem / debug.
  - Pintu masuk sekolah dengan area rak sepatu (*getabako*) dan pintu kaca geser.
  - Lorong: Jendela besar di satu sisi, pintu geser kelas di sisi lain, papan nama menjorok dari tiang.
  - Kelas: Tirai putih lembut, loker di belakang, tanaman pot, dan tepat 26 meja siswa.
- **Luar Ruangan**: Jalur menurun dihiasi pohon berbunga dengan kelopak daun gugur (*lightweight particle system*), rak sepeda, bangku taman, dan gerbang berpagar besi.
- **Tabel 4 Fase Waktu**:

| Fase | Langit Atas | Langit Bawah | Sinar Matahari/Bulan | Cahaya Ambien | Kabut Horison | Suasana Jendela |
|---|---|---|---|---|---|---|
| **Pagi (05:00 - 10:00)** | `#70B8F8` | `#FFE4C4` | `#FFF3D1` | `#D8E8F8` | `#EAF2FA` | Fajar lembut |
| **Siang (10:00 - 15:30)** | `#389BFF` | `#BAE0FD` | `#FFFFFA` | `#E0EFFF` | `#CEE4FA` | Terang anime |
| **Sore (15:30 - 18:30)** | `#6058A8` | `#FF9E5E` | `#FFA64D` | `#FFDAC4` | `#FFCEBA` | Keemasan hangat |
| **Malam (18:30 - 05:00)** | `#151E3D` | `#2A3B68` | `#96B9F5` | `#232B45` | `#1A2445` | Jendela hangat (`#FFE28A`) |

---

## 6. Hal yang DILARANG
- Dilarang menyisakan token lama (`--night`, `--fluor`, `--caution`, dll.) atau font lama (`VT323`, `Anton`).
- Dilarang meniru atau menyalin logo, teks, atau identitas milik Bruno Simon.
- Dilarang meniru karakter, nama, atau seragam anime tertentu.
- Dilarang mengubah elevasi tanah, bentuk lereng, footprint bangunan, jumlah lantai, atau posisi koordinat bangunan.
- Dilarang membuat fitur "pesan pengunjung" sebelum ada infrastruktur moderasi yang disetujui.
