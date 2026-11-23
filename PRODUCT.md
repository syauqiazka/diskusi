# PRODUCT.md: Kawasan Sekolah Virtual SMK TI BAZMA

## 1. Visi & Identitas Produk
Platform forum diskusi, materi belajar, dan eksplorasi spasial sekolah virtual SMK TI BAZMA. Didesain dengan antarmuka yang ramah, hangat, dan menyenangkan seperti mainan (*toy-like*), memadukan kemudahan aplikasi web 2D modern dengan penjelajahan kampus 3D bergaya sekolah anime.

Platform ini hadir untuk membuat aktivitas belajar kejuruan SIJA (Sistem Informatika, Jaringan, dan Aplikasi) menjadi interaktif, mengasyikkan, dan mudah diakses oleh seluruh siswa dan guru dari berbagai perangkat.

---

## 2. Sumber Kebenaran Spasial & Batasan Akurasi
Eksplorasi virtual dibangun berdasarkan referensi arsitektur kawasan SMK TI BAZMA di `design/refs/` dengan aturan mutlak:
1. **Alur Akses Fisik Tetap Wajib**:
   - **Gerbang Utama → Turunan Asrama → Lobi & Gedung Asrama → Jalur Penghubung → Lapangan Olahraga & Gedung Sekolah**.
2. **Ketinggian & Jumlah Lantai**:
   - **Gedung Asrama**: Tepat **5 lantai** (B2, B1, LT 1, LT 2, LT 3).
   - **Gedung Sekolah**: Tepat **3 lantai** (LT 1, LT 2, LT 3).
   - Bentuk medan lereng, elevasi tanah, dan tapak bangunan (*footprint*) tidak boleh diubah.
3. **Pernyataan Fiksi Terinspirasi Sekolah (Bukan Replika 1:1)**:
   - Dunia virtual ini adalah karya fiksi interaktif yang terinspirasi dari kawasan sekolah SMK TI BAZMA, bukan replika arsitektural resmi atau denah teknis asli.
   - Penempatan spesifik 6 fasilitas resmi (Lab Komputer, Ruang Kelas, Perpustakaan, Ruang Rapat, Ruang Konsultansi, Ruang Musik) ke nomor lantai tertentu bersifat konseptual dan ditandai secara transparan.

---

## 3. Fitur Utama & Layar Antarmuka 2D

1. **Beranda Sambutan (`/`)**:
   - Sambutan ramah untuk siswa, santri, dan pengajar.
   - Tombol utama mencolok: **"Mulai Menjelajah"** (`#4F46E5`).
   - Akses cepat 1-klik berbentuk tombol pil membulat:
     - **Opsi**: Pengaturan suara (musik/efek), kualitas grafis (Rendah/Sedang/Tinggi), tombol penyelamat darurat **"Aku tersangkut"**, dan reset pengaturan.
     - **Kontrol**: Daftar tombol gerak (WASD, Shift, C, Backspace, E/Klik, Esc) dengan kartu tuts keyboard yang ramah.
     - **Peta Kawasan 2D**: Peta interaktif berbasis data layout asli (`campus-layout.ts`), menampilkan posisi/arah pemain live, penanda nama area, dan pemilih lantai.
     - **Pencapaian**: Sistem lencana lokal (*client-only*) untuk aktivitas penjelajahan.
     - **Kredit**: Apresiasi teknologi open-source dan catatan transparansi denah konseptual.
2. **Ruang Kelas Virtual (`/kelas`)**:
   - Menampilkan kelas yang diikuti, nomor meja belajar (26 meja per kelas), dan forum materi.
   - Khusus Pengajar & Super Admin: Tombol buat kelas baru.
   - Siswa: Bergabung dengan kode kelas (misal `SIJA-10A`).
3. **Mading Forum Pembelajaran (`/mading`)**:
   - Papan diskusi publik antarsiswa dengan thread tanya jawab, voting, dan komentar bertingkat.
4. **Perpustakaan Digital (`/perpustakaan`)**:
   - Arsip modul teknis, panduan lab, dan buku referensi kejuruan yang dikurasi oleh pengajar.
5. **Pesan Pribadi / DM Intra-Kelas (`/pesan`)**:
   - Komunikasi aman langsung antarrekan sekelas. Aturan ketat: DM hanya diizinkan untuk siswa yang terdaftar dalam kelas yang sama.
6. **Autentikasi Siswa (`/masuk` & `/daftar`)**:
   - Desain kartu membulat cerah-lembut dengan validasi Zod dan Better Auth.

---

## 4. Dunia Spasial 3D (Sekolah Anime Kyoto Animation)

- **Gaya Visual**: *Cel/toon shading* cerah 3-tingkat, garis outline halus siluet bangunan, langit biru jenuh dengan awan cumulus kartun, pohon berbunga dengan kelopak daun jatuh ringan.
- **Sistem Waktu Realtime (4 Fase)**:
  1. **Pagi (05:00 - 10:00)**: Langit fajar lembut, udara sejuk, semburat hangat.
  2. **Siang (10:00 - 15:30)**: Langit biru cerah jenuh anime, bayangan matahari lembut kebiruan.
  3. **Sore (15:30 - 18:30)**: Lembayung senja keemasan hangat.
  4. **Malam (18:30 - 05:00)**: Langit malam indigo bertabur bintang dengan jendela kelas menyala hangat.
- **HUD Minimalis Bersahabat**:
  - Reticle bidik lingkaran lembut transparan.
  - Prompt interaksi pill mengambang: `[E / KLIK] <AKSI>`.
  - Pesan ramah khusus pengguna ponsel/tablet untuk menggunakan laptop demi kenyamanan kontrol 3D.
  - Mode Cepat 2D tetap tersedia setiap saat sebagai alternatif ringan tanpa 3D.

---

## 5. Larangan Khusus
- Dilarang menyisakan token lama (`--night`, `--fluor`, `--caution`) dan font lama (`VT323`, `Anton`).
- Dilarang meniru identitas atau aset Bruno Simon.
- Dilarang meniru karakter atau nama anime komersial tertentu.
- Dilarang menyentuh isi folder `design/refs/`.
