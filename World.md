# WORLD.md: Dunia Sekolah 3D

Spesifikasi dunia yang bisa dijelajahi (first-person). Referensi: Cuchillo Midnight Video (lorong toko VHS tengah malam, HUD kamera, efek VHS). Versi kita: **sekolah sepi tengah malam**. Lorong, loker, pintu kelas, lampu neon, papan "Awas Lantai Basah".

## Prinsip
1. **Forum dan chat tetap aplikasi 2D biasa.** Dunia 3D adalah lapisan navigasi. Thread, komentar, dan chat tampil sebagai panel 2D di atas dunia saat pemain berinteraksi dengan objek. Jangan membangun teks panjang di dalam 3D.
2. **Semua fitur harus bisa dipakai tanpa 3D** ("Mode Cepat", lihat bawah). Ini syarat aksesibilitas, HP lemah, dan koneksi lambat.
3. **Low-poly dan pencahayaan palsu (baked).** Tampilan khas didapat dari efek pasca-proses, bukan dari model mewah.

## Peta dunia
| Area | Fungsi di platform | Interaksi |
|---|---|---|
| Lobi | Titik muncul, tutorial singkat | Papan petunjuk |
| Lorong utama | Penghubung semua area | Berjalan, jongkok, lihat pintu |
| Pintu kelas | 1 pintu = 1 kelas | Anggota: terbuka, masuk. Bukan anggota: terkunci, muncul kolom "Masukkan kode kelas" |
| Mading (papan pengumuman besar) | Diskusi global: thread terbaru, populer, belum terjawab | Tekan E: panel forum global |
| Perpustakaan | Materi terbuka (global) | Tekan E pada rak: daftar materi |
| Loker | Profil dan pengaturan akun | Tekan E: buka loker, ubah avatar, banner, bio |
| Cermin | Pilih bingkai avatar dan efek profil | Tekan E: katalog bingkai dan efek |
| Ruang guru | Moderasi (hanya moderator dan admin) | Antrean laporan, log moderasi |

## Di dalam kelas
| Objek | Fungsi | Interaksi |
|---|---|---|
| Papan tulis | Pengumuman dan item yang di-pin | E: panel pengumuman |
| Papan diskusi (samping) | Thread kelas | E: panel thread dan komentar |
| Rak materi | Materi belajar kelas | E: daftar materi, preview, unduh |
| Meja guru | Menu pengajar (kelola anggota, kode kelas, moderasi kelas) | Hanya pengajar dan asisten |
| **Meja murid** | **Satu meja = satu anggota kelas** | E: kartu profil, tombol "Kirim pesan" |

### Aturan DM (sesuai permintaan)
- DM hanya bisa dikirim ke orang yang **satu kelas** dengan pengirim.
- Alurnya: masuk pintu kelas, berjalan ke meja orang tujuan, tekan E, kartu profil muncul, tekan "Kirim pesan", panel chat terbuka.
- Meja yang penghuninya sedang online tampil dengan sosok duduk dan lampu meja menyala. Meja offline kosong dan gelap. (Presence dari Ably.)
- Server wajib memeriksa bahwa kedua pengguna adalah anggota kelas yang sama sebelum membuat Conversation atau menyimpan Message. Pemeriksaan ini tidak boleh hanya di client.
- Keputusan produk yang perlu Anda tegaskan: pengguna di diskusi global yang tidak sekelas **tidak bisa** saling DM. Ini juga baik untuk keamanan pelajar di bawah umur.

## Kontrol
| Aksi | Desktop | HP |
|---|---|---|
| Bergerak | WASD | Joystick virtual kiri |
| Melihat | Mouse (pointer lock) | Geser layar kanan |
| Jongkok | Ctrl atau C (tahan) | Tombol jongkok |
| Lari | Shift | Joystick didorong penuh |
| Interaksi | E atau klik | Tombol ketuk di layar |
| Jeda | Esc | Tombol jeda |

Jongkok: tinggi kamera turun (sekitar 1,6 m ke 0,9 m) dan tinggi kapsul tabrakan ikut turun. Pemain bisa lewat bawah objek rendah dan mengintip kolong meja.

## Interaksi
- Raycast dari tengah layar dengan jarak maksimum sekitar 2,5 m.
- Objek yang bisa diinteraksi diberi sorotan tipis dan label gaya HUD: `[E] MASUK KELAS`.
- Pintu terkunci menampilkan gembok dan `[E] MASUKKAN KODE`.
- Saat panel 2D terbuka, kontrol gerak dijeda dan pointer lock dilepas.

## HUD (meniru HUD kamera VHS di referensi)
- Kiri atas: `PLAY ▶` saat berjalan, `PAUSE ❚❚` saat panel terbuka.
- Tengah atas: `INFORMASI` (bantuan kontrol).
- Kanan atas: penghitung waktu `SP 0:00:02` berisi lama sesi.
- Layar jeda: logo besar, teks `KLIK UNTUK LANJUT`, dan deretan sakelar **ON/OFF** seperti di referensi:
  - `MODE CEPAT` (tanpa 3D, antarmuka 2D penuh)
  - `MODE MALAM` (ON) atau `PAGI` (OFF)
  - `SUARA`
  - `ANTARMUKA` (tampilkan atau sembunyikan HUD)
  - `GRAFIK` (rendah, sedang, tinggi)
- Catatan: karakter ▶ dan ❚❚ di HUD digambar sebagai SVG, bukan emoji.

## Mode Cepat (wajib)
Tampilan 2D tanpa dunia 3D: daftar kelas, diskusi global, materi, dan daftar teman sekelas (pengganti meja) dengan tombol "Kirim pesan". Aturan DM sama persis. Dipilih otomatis pada perangkat lemah, `prefers-reduced-motion`, atau jika WebGL gagal. Pengguna bisa mengubahnya kapan saja.

## Multiplayer (bertahap)
- Awal: tidak ada pemain lain yang terlihat bergerak. Hanya presence (online/offline) per meja.
- Lanjutan: dalam satu kelas, posisi pemain lain dikirim lewat Ably, maksimal 5 sampai 10 kali per detik, dengan interpolasi di client. Hanya orang di ruangan yang sama yang berbagi posisi. Lorong utama tidak.
- Batasi jumlah pemain terlihat per ruangan (misalnya 30) untuk performa dan biaya pesan Ably.

## Teknis
| Kebutuhan | Pilihan |
|---|---|
| Render 3D | three, @react-three/fiber, @react-three/drei |
| Kontrol first-person | PointerLockControls (drei) atau kontrol buatan sendiri |
| Tabrakan | @react-three/rapier (kapsul pemain) atau tabrakan sederhana berbasis kotak |
| Efek VHS | @react-three/postprocessing: ChromaticAberration, Noise, Vignette, Scanline, sedikit blur gerak |
| State dunia | zustand |
| Model | glTF (.glb), dikompres Draco dan tekstur KTX2 |
| Sumber model | Buat di Blender, atau paket low-poly gratis (Kenney, Quaternius); cek lisensi |
| UI panel | React + Tailwind + shadcn/ui seperti biasa |

Anggaran performa awal (sesuaikan setelah uji): total aset dunia di bawah sekitar 15 MB, draw call rendah (pakai instancing untuk loker, meja, dan kursi), tekstur maks 1024 px, target 60 fps desktop dan 30 fps HP menengah. Muat area secara bertahap (lorong dulu, lalu kelas saat pintu didekati).

## Perubahan database
- `ClassMember.seatIndex` (Int): posisi meja anggota. Ditetapkan otomatis saat bergabung.
- `Class.roomLayout` (String): kunci tata letak ruangan (misalnya `standard-30`).
- `User.worldSettings` (Json): kualitas grafis, mode cepat, mode malam, suara.
- Aturan DM: `Conversation` hanya boleh dibuat jika ada `ClassMember` kedua pengguna pada `classId` yang sama.

## Tahap pengerjaan dunia 3D
1. **Dunia solo**: lorong, pintu, kontrol jalan dan jongkok, HUD, efek VHS, Mode Cepat. Pintu kelas membuka panel 2D (data dummy).
2. **Hubungkan fitur**: pintu kelas nyata dari database, mading global, perpustakaan, loker, cermin.
3. **Dalam kelas**: papan tulis, papan diskusi, rak materi, meja murid, alur DM via meja.
4. **Presence di meja**: online/offline lewat Ably.
5. **Multiplayer posisi**: avatar pemain lain di dalam kelas.
6. **Poles**: suara, mode pagi, optimasi HP.

Tahap 1 sampai 2 harus berjalan sebelum menyentuh 5. Jangan membuat multiplayer sebelum fondasi forum dan chat stabil.