# PRODUCT.md: Kawasan SMK TI BAZMA (Sekolah Tengah Malam)

## 1. Visi & Identitas Proyek
Platform diskusi dan forum pembelajaran interaktif yang dikemas sebagai dunia virtual 3D kawasan SMK TI BAZMA (gedung sekolah dan gedung asrama) yang dapat dijelajahi dari sudut pandang orang pertama (first-person). Fitur diskusi forum, materi, pengumuman, dan obrolan pribadi (DM) beroperasi sebagai panel 2D di atas lapisan eksplorasi spasial 3D, dengan dukungan penuh Mode Cepat (2D murni) untuk aksesibilitas dan performa perangkat menengah/rendah.

Bukan sekolah generik; representasi fisik digital berakar langsung pada karakter resmi kawasan SMK TI BAZMA.

---

## 2. Sumber Kebenaran & Aturan Akurasi
Semua konstruksi spasial, arsitektur, dan fasilitas mengacu secara ketat pada berkas di `design/refs/`:
1. **`CAMPUS-LAYOUT.md`** (Acuan tertinggi posisi & hubungan spasial kawasan berdasarkan `images/campus-satellite.png`):
   - Alur akses fisik wajib dipertahankan: **Gerbang → Turunan → Lobby Asrama → Gedung Asrama**.
   - Hubungan antara Gedung Asrama dan Gedung Sekolah dihubungkan melalui **Jalur Penghubung**.
   - Posisi relatif bangunan mengikuti gambar satelit; orientasi dan hubungan antar gedung tidak boleh diubah secara sepihak.
2. **`FLOOR-STRUCTURE.md`** (Acuan struktur lantai):
   - **Gedung Asrama**: Tepat **5 lantai** (B2, B1, LT 1, LT 2, LT 3).
   - **Gedung Sekolah**: Tepat **3 lantai** (LT 1, LT 2, LT 3).
   - Jumlah lantai kedua gedung tidak boleh diubah.
3. **`BUILDING-FACILITIES.md`** (Acuan visual interior fasilitas resmi dari dokumentasi situs https://smktibazma.sch.id/about):
   - Enam fasilitas terdokumentasi:
     1. **Lab Komputer** (praktik SIJA, PC desktop, meja komputer, papan instruktur)
     2. **Ruang Kelas** (meja siswa berpenghuni, kursi, papan tulis, jendela pencahayaan besar)
     3. **Perpustakaan** (rak literatur terbuka, meja baca bersama, repositori materi)
     4. **Ruang Rapat** (meja rapat memanjang, kursi rapat ergonomis, partisi kaca)
     5. **Ruang Konsultansi** (meja konsultasi dua arah, lemari arsip, ruang konseling/BK)
     6. **Ruang Musik** (instrumen gitar, cajon akustik, wadah alat musik)
   - **Batasan Keras Penempatan Fasilitas**: Penempatan keenam fasilitas tersebut ke nomor lantai tertentu **BELUM DITENTUKAN** (menunggu denah resmi). Dilarang menetapkan lantai fasilitas tanpa bukti dokumentasi resmi.
4. **`SMK-TI-BAZMA-REFERENCE.md`** (Identitas, program keahlian SIJA, dan batasan akurasi):
   - Dilarang mengarang denah ruangan dan mengklaimnya sebagai denah asli.
   - Semua elemen, vegetasi, pembagian ruangan, atau detail interior yang tidak terdapat buktinya dalam dokumen referensi wajib ditandai secara tegas sebagai **DESAIN KONSEPTUAL**.

---

## 3. Arah & Nuansa Visual
- **Gaya**: Retro-liminal yang terinspirasi dari prinsip pengalaman *Cuchillo Midnight Video*.
- **Karakter Antarmuka**:
  - Border tegas 1px solid (bukan glassmorphism atau blur transparan tebal).
  - Tanpa emoji di antarmuka; seluruh ikonografi wajib menggunakan SVG / `lucide-react`.
  - Font sistem, HUD, dan label navigasi menggunakan **VT323**.
  - Bebas dari AI-slop visual maupun teks klise pemasaran.

---

## 4. Sistem Tema Waktu Realtime (4 Fase)
Sistem tampilan dan atmosfer mengikuti waktu nyata lokal (jam perangkat pemain) yang terbagi ke dalam empat fase:

1. **Fase Pagi**:
   - Status Palet: **BELUM DITENTUKAN** (akan diusulkan terpisah; tidak membuat nilai warna sendiri).
   - Karakter Spasial: Cahaya alami pagi, kabut tipis, pencahayaan lembut.
2. **Fase Siang**:
   - Status Palet: **BELUM DITENTUKAN** (akan diusulkan terpisah; tidak membuat nilai warna sendiri).
   - Karakter Spasial: Pencahayaan matahari penuh, kontras terik, visibilitas tinggi.
3. **Fase Sore**:
   - Status Palet: **BELUM DITENTUKAN** (akan diusulkan terpisah; tidak membuat nilai warna sendiri).
   - Karakter Spasial: Semburat senja/keemasan, bayangan memanjang, lampu ruangan mulai menyala.
4. **Fase Malam** (Fase acuan utama dengan identitas matang):
   - Palet Resmi: Latar `--night` (`#0B0D12`), Teks utama/cahaya neon `--fluor` (`#E9F2E3`), Aksen utama `--caution` (`#F2C200`), Info/link `--neon-cyan` (`#5CE1FF`), Aksen khusus `--neon-pink` (`#FF5C93`), Peringatan `--alert` (`#E0412F`), Sukses/Online `--ok` (`#4FD08A`).
   - Karakter Spasial: Suasana sekolah sepi pukul dua pagi, dengung lampu neon, lorong liminal tenang.

### Persyaratan Transisi & Aksesibilitas Fase:
- Suasana dunia 3D (cahaya ambient/directional, warna latar langit/skybox, densitas kabut, intensitas lampu) dan UI 2D (HUD kamera, header/footer, panel interaksi, form autentikasi) bertransformasi sinkron mengikuti fase aktif.
- Kontras teks wajib memenuhi standar WCAG AA dan keterbacaan HUD harus terjamin lolos di seluruh keempat fase.
- Perpindahan fase harus berjalan halus (gradual transition) tanpa kedipan mendadak.
- Menghormati pengaturan `prefers-reduced-motion` pengguna (menonaktifkan guncangan, transisi cepat, atau kedipan).

---

## 5. Audiens & Tujuan Produk

### Target Audiens (Berdasarkan Dokumen Proyek):
- **Siswa / Pelajar**: Khususnya siswa SMK TI BAZMA (program SIJA) dan pelajar tingkat menengah/atas yang terbiasa dengan game dan interaksi digital, namun membutuhkan lingkungan belajar yang interaktif dan tidak membosankan.
- **Tenaga Pendidik & Staf**: Guru/pengajar dan asisten pengajar yang mengelola materi, pengumuman kelas, dan moderasi diskusi.
- **Pengguna Perangkat Beragam**: Siswa yang mengakses via smartphone spesifikasi menengah hingga komputer desktop (memerlukan Mode Cepat 2D yang ringan dan cepat).

### Tujuan Produk (Berdasarkan Dokumen Proyek):
1. Menyediakan ruang belajar dan kolaborasi digital yang menggabungkan kehadiran fisik-virtual dengan fungsionalitas LMS/forum modern.
2. Menyediakan ruang kelas privat berbasis kode akses yang aman, serta mading untuk pertukaran pengetahuan global.
3. Memfasilitasi interaksi sosial yang aman (aturan ketat: DM hanya diizinkan antar anggota yang berada dalam satu kelas yang sama).
4. Menghadirkan representasi virtual yang akurat dan menghargai identitas arsitektur kawasan SMK TI BAZMA.

### Aspek yang BELUM DITENTUKAN (Menunggu Keputusan Pengguna):
- Integrasi kurikulum spesifik / silabus otomatis selain program SIJA: **BELUM DITENTUKAN**.
- Mekanisme sinkronisasi jadwal pelajaran sekolah ke dalam agenda virtual: **BELUM DITENTUKAN**.
- Sistem absensi resmi sekolah berbasis kehadiran avatar di kelas: **BELUM DITENTUKAN**.
- Batasan kuota anggota per ruang kelas virtual (default teknis 30 meja): **BELUM DITENTUKAN**.
- Nilai palet warna token resmi untuk Fase Pagi, Siang, dan Sore: **BELUM DITENTUKAN**.

