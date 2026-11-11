# DESIGN.md: Platform Belajar "Sekolah Tengah Malam"

Menggantikan versi sebelumnya (kertas krem dan kuning stabilo). Referensi utama: Cuchillo Midnight Video. Jika ada konflik dengan skill lain, file ini menang. Detail dunia 3D ada di `WORLD.md`.

## 1. Konteks
Platform diskusi belajar yang dikemas sebagai sekolah 3D yang bisa dijelajahi: lorong, pintu kelas, loker, mading, meja murid. Forum, materi, komentar, dan chat tampil sebagai panel 2D saat pemain berinteraksi dengan objek. Ada Mode Cepat (2D tanpa dunia 3D) untuk semua fungsi.

## 2. Target
Pelajar SMA dan mahasiswa, plus pengajar dan asisten. Mereka akrab dengan game dan media sosial, dan bosan dengan LMS kaku. Banyak yang memakai HP menengah, jadi performa dan Mode Cepat penting.

## 3. Vibe
Liminal: sekolah kosong jam dua pagi. Lampu neon berdengung, lorong panjang, loker, karpet, papan "Awas Lantai Basah". Nostalgia dengan sedikit rasa aneh, tapi **tidak menakutkan**: ini tempat belajar. Hangatnya datang dari kehadiran orang lain (meja yang lampunya menyala, balasan baru, nama yang online). Efek kamera VHS (butiran, aberasi warna, HUD) menjadi tanda tangan visual.

## 4. Referensi
- Cuchillo Midnight Video: HUD kamera (PLAY, PAUSE, penghitung `SP 0:00:00`), sakelar ON/OFF di layar jeda, lorong sempit berperspektif dalam, aberasi kromatik, blur tepi layar, logo krom 3D dengan neon di bawahnya.
- Simpan tangkapan layar di `design/refs/`. Agent wajib melihatnya sebelum membuat UI atau adegan baru.
- Jangan menyalin aset, logo, atau teks dari situs referensi. Ambil prinsipnya, buat milik sendiri.

## 5. Warna
| Token | Hex | Pakai untuk |
|---|---|---|
| `--night` | `#0B0D12` | Latar panel dan layar |
| `--fluor` | `#E9F2E3` | Teks utama, cahaya neon lorong (putih kehijauan) |
| `--caution` | `#F2C200` | Aksen utama: rambu, sorotan interaksi, CTA |
| `--neon-cyan` | `#5CE1FF` | Info, mention, link, tepi HUD |
| `--neon-pink` | `#FF5C93` | Logo dan aksen langka |
| `--alert` | `#E0412F` | Laporan, hapus, belum terjawab |
| `--ok` | `#4FD08A` | Jawaban terbaik, online |

Aturan: satu aksen dominan (kuning rambu). Pink hanya untuk logo dan momen khusus. Mode Pagi memakai cahaya hangat dan langit lebih terang, tetap dengan token yang sama. Semua teks lewat variabel dengan kontras AA di atas `--night`.

## 6. Font
- HUD dan label sistem: **VT323** (nuansa teks layar VCR), huruf kapital.
- Rambu dan judul pintu: **Anton** (kapital, kondensed, seperti papan penunjuk).
- Isi panel: **Instrument Sans**, minimal 16px.
- Kode, tag, username: **JetBrains Mono**.
- Judul logo dibuat khusus (krom atau chrome blackletter), bukan font bawaan.
- Semua font lewat `next/font`, dengan fallback sistem.

## 7. Struktur

### Layar awal (landing = layar jeda)
1. Latar: lorong sekolah berkabut yang bergerak pelan, blur tepi, aberasi warna.
2. Logo besar dengan neon di bawahnya, teks `KLIK UNTUK MULAI`.
3. Baris sakelar ON/OFF: Mode Cepat, Mode Malam, Suara, Antarmuka, Grafis.
4. HUD di sudut: PAUSE, INFORMASI, penghitung waktu.
5. Di bawah lipatan (untuk SEO dan Mode Cepat): penjelasan singkat dua ruang (Kelas dan Global), cuplikan kartu profil dengan bingkai dan efek bulan-cincin GSAP, dan aturan komunitas.
6. Teks loading berganti-ganti dengan gaya khas referensi, versi sekolah: "Menyapu lorong", "Mengecek absen", "Menghapus papan tulis", "Menyalakan lampu neon", "Menyusun kursi", "Mengunci ruang guru".

### Dunia dan panel
- Panel 2D berborder tipis `--fluor`, latar `--night` semi-solid (bukan kaca blur), sudut tegas, label ala HUD.
- Panel thread: voting di kiri, tag seperti stiker, jawaban terbaik dengan pita `--ok`.
- Komentar bertingkat maksimal 3 level.
- Panel chat dibuka dari meja murid; indikator mengetik berupa tiga titik berkedip.
- Pesan, thread, dan materi ditulis berbahasa Indonesia, nada santai tapi jelas.

## 8. Hindari
- Gradient ungu atau biru-ungu generik, glassmorphism, glow neon di semua elemen.
- Emoji sebagai ikon atau dekorasi. Gunakan SVG dan lucide-react.
- Font Inter, Roboto, Arial untuk tampilan.
- Kalimat klise: "Welcome to...", "Unlock your potential", "Revolusi belajar", "Selamat datang di platform terbaik".
- Efek VHS berlebihan sampai teks tidak terbaca. Efek hanya pada dunia 3D dan elemen dekoratif, tidak pada teks panel.
- Dunia horor sungguhan (darah, jumpscare, suara mengejutkan). Nuansa aneh boleh, menakutkan tidak.
- Model dan tekstur berat. Tekstur besar tanpa kompresi.
- Memaksa 3D. Pengguna harus selalu bisa memilih Mode Cepat.
- Menyalin aset, logo, atau teks dari situs referensi.
- Data karangan (testimoni dan angka palsu).

## Gerak, suara, aksesibilitas
- Animasi UI dengan GSAP hanya `transform` dan `opacity`. Jeda saat tidak terlihat.
- `prefers-reduced-motion`: matikan goyangan kamera dan efek berkedip, tawarkan Mode Cepat.
- Suara tidak otomatis menyala. Tombol Suara jelas, default mati sampai pengguna mengaktifkan.
- Kurangi efek berkedip cepat (ancaman bagi pengguna sensitif cahaya): tidak ada kedipan lebih dari 3 kali per detik.
- Semua tindakan di dunia 3D punya padanan keyboard dan layar sentuh. Panel 2D bisa dioperasikan dengan keyboard dan pembaca layar.

## Bingkai dan efek profil
- Katalog saja, tidak ada unggahan pengguna.
- Ditampilkan di kartu profil (meja murid, cermin, panel) dan sebagai lampu atau hiasan di meja pemilik.
- Setiap efek punya `configKey` ke satu komponen GSAP, dan tetap terbaca bila animasi dimatikan.