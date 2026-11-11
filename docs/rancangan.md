Rancangan Platform Diskusi dan Forum Pembelajaran
Dokumen rancangan produk, kebutuhan fitur, pengalaman pengguna, dan
arsitektur teknis
Status: Draft rancangan awal untuk menjadi acuan pengembangan
Bahasa antarmuka: Bahasa Indonesia
1. Ringkasan Proyek
Platform ini adalah ruang pembelajaran dan diskusi digital yang
menggabungkan fitur komunitas belajar dengan lingkungan sekolah virtual
3D yang dapat dijelajahi. Pengguna tidak hanya membuka daftar forum,
tetapi dapat memasuki lingkungan sekolah, berjalan menyusuri lorong,
memasuki kelas, mendatangi objek tertentu, dan membuka fitur digital
melalui interaksi dengan objek tersebut.

Konsep utamanya adalah sekolah virtual yang berfungsi sebagai
antarmuka navigasi. Ruang 3D memberi konteks dan pengalaman
menjelajah, sedangkan aktivitas yang membutuhkan banyak teks---seperti
membaca materi, membuat diskusi, menulis komentar, dan mengirim
pesan---tetap disajikan melalui panel 2D yang mudah dibaca.

Platform harus tetap dapat digunakan tanpa dunia 3D melalui Mode Cepat
(2D). Mode 3D merupakan lapisan pengalaman dan navigasi, bukan
satu-satunya cara untuk mengakses fitur inti.
1.1 Tujuan
1. Menyediakan tempat bagi pelajar untuk bertanya, berdiskusi, berbagi
   pengetahuan, dan membantu satu sama lain.
2. Membuat pengalaman belajar digital terasa seperti berada di
   lingkungan sekolah yang dapat dijelajahi.
3. Menghubungkan fitur platform dengan objek dan ruangan yang memiliki
   fungsi jelas.
4. Mendorong interaksi antarpengguna melalui kelas virtual dan meja
   siswa.
5. Menjaga agar fitur inti tetap mudah digunakan pada perangkat dengan
   kemampuan terbatas.
1.2 Prinsip Produk
- Fungsi lebih penting daripada efek: animasi dan 3D tidak boleh
  menghambat aktivitas belajar.
- Dunia 3D sebagai navigasi: fitur teks tetap berada di panel 2D.
- Akses setara: semua fitur inti harus tersedia melalui Mode Cepat
  (2D).
- Akses berbasis keanggotaan: ruang kelas dan DM mengikuti aturan
  keanggotaan kelas.
- Keamanan di server: pembatasan akses tidak boleh hanya
  mengandalkan tampilan antarmuka.
- Bertahap: bangun fondasi dan pengalaman solo sebelum fitur
  real-time dan multiplayer.
2. Pengguna dan Peran
Rancangan awal mengenal peran berikut. Detail hak akses administratif
dapat ditetapkan lebih lanjut ketika kebutuhan moderasi dan pengelolaan
platform difinalisasi.
2.1 Pengguna
Pengguna terdaftar dapat memiliki profil, avatar, bingkai avatar, dan
efek profil. Pengguna dapat bergabung ke kelas menggunakan mekanisme
kode kelas, mengakses ruang kelas yang diikutinya, membaca materi,
membuat diskusi, serta berinteraksi dengan anggota kelas sesuai aturan
akses.
2.2 Anggota Kelas
Anggota kelas adalah pengguna yang telah terdaftar sebagai anggota suatu
kelas. Keanggotaan ini menjadi dasar untuk: - Mengakses ruang kelas
tersebut. - Melihat anggota dan meja yang tersedia di dalam kelas. -
Menggunakan fitur pesan langsung (DM) kepada anggota kelas yang sama. -
Mengakses konten kelas sesuai izin yang ditetapkan.
2.3 Guru dan Asisten
WORLD.md menetapkan bahwa guru dan asisten memiliki meja sendiri di
ruang kelas. Karena itu, nomor meja siswa tidak boleh diwajibkan untuk
kedua peran tersebut. Rincian hak akses guru dan asisten---misalnya
pengelolaan pengumuman atau materi---perlu ditetapkan pada spesifikasi
fitur kelas sebelum implementasi.
2.4 Moderator dan Administrator
Kebutuhan rinci peran moderator dan administrator belum ditetapkan dalam
rancangan awal. Jangan mengarang kemampuan atau memberikan akses
istimewa tanpa keputusan produk. Siapkan arsitektur yang memungkinkan
peran dan izin ditambahkan secara terkontrol.
3. Konsep Dunia Sekolah Virtual
3.1 Gambaran Umum
Dunia virtual mengambil bentuk lingkungan sekolah yang dapat dijelajahi.
Pengguna mengendalikan karakter dari sudut pandang orang pertama,
berjalan menyusuri lorong, memasuki ruangan, dan berinteraksi dengan
objek tertentu.

Referensi pengalaman yang digunakan adalah situs
https://midnightvideo.cuchillo.rocks/, terutama pendekatan eksplorasi
ruang, interaksi dengan objek, dan nuansa pengalaman seperti permainan.
Referensi tersebut digunakan sebagai inspirasi prinsip interaksi, bukan
untuk menyalin identitas visual, aset, teks, atau implementasi situs.

Arah suasana yang telah dipilih adalah sekolah tengah malam:
lingkungan sekolah yang terasa sinematik, lorong yang relatif sepi,
pencahayaan aksen, dan elemen visual yang mendukung suasana. Efek visual
harus tetap terkendali agar objek interaktif mudah dikenali dan teks
tetap terbaca.
3.2 Ruangan dan Objek
Objek berikut merupakan pemetaan konsep awal:
  Area atau objek                     Fungsi di platform
  Lorong sekolah                      Area navigasi utama untuk berpindah
ke ruangan

  Pintu kelas                         Akses masuk ke kelas berdasarkan
keanggotaan atau kode kelas

  Mading                              Akses ke diskusi global

  Perpustakaan                        Akses ke materi atau sumber belajar
terbuka

  Loker                               Akses ke profil pengguna

  Cermin                              Tempat memilih bingkai avatar dan
efek profil

  Papan tulis di kelas                Area pengumuman kelas

  Papan diskusi di kelas              Akses ke thread atau diskusi kelas

  Rak materi di kelas                 Akses ke materi kelas
Meja siswa                          Titik interaksi dengan anggota
kelas dan akses untuk memulai DM
Objek harus memiliki fungsi yang konsisten. Jangan menambahkan objek
dekoratif seolah-olah interaktif jika tidak memiliki aksi yang jelas.
3.3 Pintu dan Akses Kelas
- Pengguna dapat melihat pintu kelas yang tersedia di lingkungan
  sekolah.
- Anggota kelas dapat masuk ke kelas yang diikutinya.
- Pengguna yang bukan anggota tidak boleh memperoleh akses ke isi
  ruang kelas.
- Jika pengguna mencoba masuk ke kelas yang belum diikuti, tampilkan
  keadaan terkunci dan sediakan alur untuk memasukkan kode kelas.
- Kode kelas harus diverifikasi di server.
- Setelah keanggotaan berhasil dibuat, pengguna dapat masuk sesuai
  aturan kelas.
- Jangan menganggap bahwa menyembunyikan pintu atau tombol sudah cukup
  untuk melindungi data kelas.
3.4 Interaksi dengan Objek
Interaksi harus mudah dipahami dan konsisten: 1. Pengguna mendekati
objek yang dapat digunakan. 2. Antarmuka menampilkan petunjuk interaksi,
misalnya tombol E pada desktop. 3. Pengguna menekan tombol interaksi.
4. Sistem membuka panel atau menjalankan aksi yang sesuai. 5. Pengguna
dapat menutup panel dan kembali menjelajah.

Objek yang sedang dapat diinteraksikan harus memiliki penanda visual
yang cukup, tetapi tidak mengganggu pemandangan. Hindari menampilkan
terlalu banyak tooltip sekaligus.
3.5 Kontrol Karakter
Kontrol desktop yang direncanakan:

  Aksi                                 Kontrol
  Bergerak maju, kiri, mundur, kanan   W, A, S, D
Melihat sekeliling                   Gerakan mouse
Berlari                              Shift
Jongkok                              Ctrl
Berinteraksi dengan objek            E
Membuka atau menutup menu jeda       Esc

Kontrol harus ditampilkan dalam halaman bantuan atau overlay pengenalan.
Jika pemetaan tombol berubah selama implementasi, dokumentasi dan
antarmuka harus ikut diperbarui.

Untuk perangkat sentuh, sediakan joystick virtual dan tombol aksi yang
mudah dijangkau. Kontrol mobile harus diuji pada ukuran layar yang
berbeda dan tidak menutupi objek penting.
3.6 Berjalan dan Jongkok
Karakter mendukung gerakan berjalan, berlari, dan jongkok. Saat jongkok,
kamera dan kapsul tabrakan perlu menyesuaikan tinggi karakter secara
konsisten agar karakter tidak hanya terlihat menunduk tetapi juga
memiliki perilaku ruang yang sesuai.

Gerakan harus memiliki batas kecepatan yang wajar dan tidak menyebabkan
karakter menembus dinding, meja, atau objek lingkungan. Hindari gerakan
kamera yang mendadak.
3.7 HUD dan Menu Jeda
Dunia 3D dapat memiliki HUD minimal untuk menunjukkan status pengalaman,
petunjuk kontrol, dan informasi interaksi. Menu jeda menyediakan kontrol
untuk menghentikan atau melanjutkan pengalaman serta mengakses
pengaturan tampilan.

Elemen seperti indikator PLAY, PAUSE, penghitung waktu, atau sakelar
tampilan boleh digunakan sebagai inspirasi, tetapi label dan fungsi
final harus mengikuti kebutuhan platform sendiri. HUD tidak boleh
menutupi area baca panel fitur.
3.8 Mode Cepat (2D)
Mode Cepat adalah alternatif navigasi 2D untuk pengguna yang: -
Menggunakan perangkat dengan kemampuan grafis terbatas. - Mengalami
kendala performa ketika menjalankan 3D. - Tidak nyaman dengan gerakan
kamera atau lingkungan 3D. - Memilih pengalaman yang lebih langsung.

Semua fitur inti harus dapat digunakan melalui Mode Cepat. Pemetaan
aksesnya mengikuti fungsi objek di dunia 3D, misalnya menu kelas,
diskusi, perpustakaan, profil, dan daftar anggota. Aturan akses kelas
dan DM tetap sama pada kedua mode.

Mode Cepat bukan versi dengan fitur yang dikurangi. Perbedaan utamanya
hanya cara navigasi dan presentasi.
4. Kelas Virtual dan Interaksi Meja
4.1 Ruang Kelas
Ruang kelas merupakan area utama untuk aktivitas belajar bersama. Di
dalam kelas terdapat: - Papan tulis untuk pengumuman. - Papan diskusi
untuk thread kelas. - Rak materi untuk materi pembelajaran. - Meja guru
dan asisten. - Meja siswa yang menjadi titik interaksi antarpengguna.

Objek 3D berfungsi sebagai pintu masuk ke panel fitur. Konten diskusi
dan materi tetap dibaca dalam panel 2D.
4.2 Keanggotaan Kelas
Pengguna harus menjadi anggota kelas untuk mengakses ruang dan fitur
privat kelas tersebut. Alur dasar: 1. Pengguna memilih pintu kelas. 2.
Sistem memeriksa keanggotaan pengguna. 3. Jika sudah menjadi anggota,
pengguna masuk ke kelas. 4. Jika belum, sistem menampilkan keadaan
terkunci dan pilihan memasukkan kode kelas. 5. Server memvalidasi kode
dan membuat keanggotaan jika valid. 6. Pengguna dapat masuk setelah
proses berhasil.

Kegagalan validasi harus menghasilkan pesan yang jelas tanpa membocorkan
informasi sensitif.
4.3 Penempatan Meja
Setiap murid yang menjadi anggota kelas dapat memperoleh nomor meja
(seatIndex). Nomor meja bersifat nullable karena guru dan asisten
memiliki meja sendiri dan tidak membutuhkan nomor meja siswa.

Aturan data: - seatIndex bertipe integer nullable. - Nomor meja harus
unik dalam satu kelas untuk anggota yang memerlukannya. - Constraint
unik menggunakan kombinasi [classId, seatIndex]. - Penetapan nomor
meja dilakukan dalam transaksi database. - Jika terjadi benturan karena
dua pengguna bergabung secara bersamaan, proses harus mencoba ulang
secara aman. - Jangan menetapkan nomor meja hanya di sisi klien.

Rincian tata letak, jumlah meja, dan kapasitas maksimum kelas belum
ditetapkan. Nilainya perlu dikonfirmasi sebelum membangun sistem
penempatan final.
4.4 Status Kehadiran
Konsep awal menyebut meja dengan lampu menyala untuk penghuni yang
sedang online dan meja kosong ketika offline. Implementasi status online
memerlukan mekanisme presence yang andal. Status online tidak boleh
disimpulkan hanya dari halaman yang masih terbuka.

Untuk tahap awal, tampilan meja dapat menggunakan status sederhana atau
placeholder sampai sistem presence real-time siap. Jangan menampilkan
status online palsu.
5. Pesan Langsung (DM)
5.1 Prinsip Utama
DM dilakukan melalui interaksi di dalam kelas. Pengguna harus masuk ke
kelas terlebih dahulu, kemudian mendatangi meja pengguna yang ingin
dihubungi. Dengan demikian, DM bukan fitur bebas yang dapat digunakan
untuk menghubungi siapa pun dari luar konteks kelas.
5.2 Alur DM
1. Pengguna masuk ke kelas yang diikutinya.
2. Pengguna menjelajahi ruang kelas.
3. Pengguna mendekati meja anggota yang ingin dihubungi.
4. Sistem menampilkan petunjuk interaksi.
5. Pengguna menekan E.
6. Sistem membuka kartu profil pemilik meja.
7. Kartu profil menampilkan aksi Kirim pesan jika pengguna memenuhi
   aturan akses.
8. Pengguna memilih aksi tersebut.
9. Panel percakapan DM terbuka.
Meja yang menjadi milik pengguna sendiri tidak perlu menampilkan aksi
untuk mengirim pesan kepada diri sendiri.
5.3 Aturan Akses DM
DM hanya diizinkan antara dua pengguna yang merupakan anggota kelas
yang sama.

Aturan ini wajib diperiksa di server pada setiap operasi yang relevan,
termasuk: - Membuat percakapan baru. - Membuka percakapan. - Mengirim
pesan. - Mengambil riwayat pesan. - Mengakses endpoint atau resource
percakapan secara langsung.

Jangan hanya memeriksa aturan ini di komponen UI. Pengguna tidak boleh
dapat melewati aturan dengan memanggil API secara langsung atau
mengganti ID percakapan.

Rancangan awal mengasumsikan bahwa dua pengguna harus memiliki
setidaknya satu kelas yang sama untuk dapat saling mengirim DM. Jika
aturan yang diinginkan berbeda---misalnya DM hanya berlaku dalam konteks
kelas tertentu---aturan tersebut harus diputuskan sebelum implementasi.
5.4 Panel Percakapan
Panel DM harus berorientasi pada keterbacaan: - Menampilkan identitas
lawan bicara. - Menampilkan riwayat pesan. - Menyediakan area penulisan
pesan. - Menampilkan status pengiriman secara jelas. - Memiliki keadaan
loading, kosong, gagal, dan berhasil. - Tetap dapat digunakan melalui
Mode Cepat (2D).

Rincian fitur tambahan seperti lampiran, indikator mengetik, status
dibaca, pencarian pesan, dan notifikasi belum ditetapkan. Jangan
menganggap fitur-fitur tersebut termasuk cakupan tahap awal.
6. Forum, Diskusi, dan Materi Pembelajaran
6.1 Diskusi Global
Mading di lorong menjadi representasi akses ke diskusi global. Diskusi
global adalah area untuk topik yang tidak terbatas pada satu kelas,
sesuai kebijakan platform yang nantinya ditetapkan.
6.2 Diskusi Kelas
Papan diskusi di dalam kelas menjadi akses ke thread kelas. Konten
privat kelas hanya boleh dibaca dan diubah oleh pengguna yang memiliki
izin sesuai keanggotaan dan perannya.
6.3 Materi Pembelajaran
Perpustakaan menjadi akses ke materi terbuka, sedangkan rak materi di
dalam kelas menjadi akses ke materi kelas. Panel materi harus
mengutamakan keterbacaan dan navigasi yang jelas.
6.4 Pengumuman
Papan tulis kelas menjadi representasi pengumuman. Hak untuk membuat,
mengubah, atau menghapus pengumuman harus ditentukan berdasarkan peran
kelas. Rincian hak tersebut belum diputuskan dalam rancangan awal.
6.5 Struktur Konten
Konten forum dan materi harus disajikan dalam panel 2D, bukan ditempel
sebagai teks panjang di dalam ruang 3D. Pendekatan ini menjaga
kenyamanan membaca, memudahkan penggunaan pada perangkat kecil, dan
memisahkan navigasi ruang dari aktivitas belajar.

Rincian model data thread, komentar, kategori, lampiran, reaksi,
pelaporan, dan moderasi perlu disusun pada spesifikasi fitur lanjutan
sebelum implementasi.
7. Profil, Avatar, dan Personalisasi
7.1 Profil Pengguna
Loker menjadi akses visual ke profil pengguna. Profil dapat menampilkan
informasi dasar seperti nama tampilan, username, dan bio sesuai data
yang tersedia.
7.2 Bingkai Avatar dan Efek Profil
Cermin menjadi tempat pengguna memilih bingkai avatar dan efek profil.
Rancangan data awal mencakup entitas AvatarFrame dan ProfileEffect.

Koleksi, aturan kepemilikan, cara memperoleh, serta batas penggunaan
bingkai dan efek belum ditentukan. Jangan membuat sistem pembelian,
hadiah, atau progres tanpa keputusan produk.
7.3 Kartu Profil di Meja
Ketika pengguna berinteraksi dengan meja anggota lain, sistem
menampilkan kartu profil. Kartu ini menjadi penghubung antara identitas
pengguna di ruang kelas dan aksi yang dapat dilakukan, terutama Kirim
pesan apabila syarat DM terpenuhi.
8. Arah Visual dan Pengalaman
8.1 Arah Visual
Tema yang dipilih adalah sekolah tengah malam dengan pengalaman
sinematik dan nuansa eksplorasi seperti permainan. Arah ini mengambil
inspirasi dari suasana referensi, bukan menyalin aset atau identitasnya.

Elemen visual yang dapat dieksplorasi: - Lorong sekolah dengan
pencahayaan terarah. - Area kelas yang terasa hidup meskipun
sederhana. - Loker, pintu, papan tulis, rak, dan meja yang mudah
dikenali. - Aksen cahaya untuk menandai objek interaktif. - HUD minimal
dan menu jeda. - Efek visual atmosferik yang tidak mengurangi
keterbacaan.
8.2 Batasan Visual
- Jangan membuat seluruh antarmuka menjadi efek 3D yang berat.
- Jangan mengorbankan keterbacaan demi suasana.
- Hindari efek kamera berlebihan, blur yang mengganggu, atau gerakan
  yang membuat pengguna tidak nyaman.
- Jangan meniru logo, teks, aset, atau desain spesifik situs
  referensi.
- Jangan memakai animasi dekoratif tanpa tujuan.
- Ikon antarmuka menggunakan lucide-react; jangan menggunakan emoji
  sebagai pengganti ikon.
- Seluruh teks antarmuka menggunakan Bahasa Indonesia.
8.3 Gerakan dan Aksesibilitas
- Hormati preferensi prefers-reduced-motion.
- Sediakan cara untuk menonaktifkan atau mengurangi gerakan dan efek
  visual.
- Pastikan kontras teks dan kontrol memadai.
- Sediakan fokus keyboard yang terlihat pada antarmuka 2D.
- Jangan mengandalkan warna saja untuk menunjukkan status.
- Sediakan Mode Cepat sebagai alternatif penuh dari pengalaman 3D.
9. Arsitektur dan Teknologi
9.1 Stack yang Disepakati untuk Fondasi
  Bagian              Teknologi atau keputusan
  Framework web       Next.js App Router
Bahasa              TypeScript
Styling             Tailwind CSS
Komponen UI         shadcn/ui
ORM                 Prisma
Database            PostgreSQL di Neon
Autentikasi         Better Auth dengan email dan password
Validasi            Zod
Pengujian awal      Vitest
Ikon                lucide-react
Animasi antarmuka   GSAP bila memang dibutuhkan dan sesuai rancangan
Dunia 3D            Belum dipatok; evaluasi teknologi 3D pada tahap khusus

Gunakan versi stabil yang tersedia ketika proyek dibuat. Jangan
memaksakan nomor versi lama. Ikuti konfigurasi yang dihasilkan oleh
create-next-app, Prisma, dan Tailwind versi yang benar-benar
terpasang.
9.2 Database Neon
Siapkan dua jenis URL database: - DATABASE_URL: koneksi pooled untuk
aplikasi. - DIRECT_URL: koneksi langsung untuk kebutuhan migrasi atau
perintah yang memerlukan koneksi langsung.

Buat .env.example tanpa nilai rahasia. File .env harus masuk
.gitignore. Pemilik proyek mengisi kredensial Neon secara lokal dan
tidak perlu mengirimkan URL database atau rahasia ke chat maupun
repository.
9.3 Autentikasi
Gunakan Better Auth dengan adapter Prisma untuk autentikasi email dan
password. Tabel autentikasi dibuat mengikuti skema dan CLI Better Auth
yang digunakan pada versi terpasang.

Jangan menambahkan passwordHash secara manual ke model profil User
jika kredensial sudah dikelola oleh tabel Better Auth. Field profil
tambahan seperti username, displayName, dan bio dapat ditambahkan
sesuai mekanisme field tambahan Better Auth.

Google atau GitHub OAuth dapat ditunda dan bukan syarat fondasi awal.
9.4 Validasi dan Keamanan Dasar
- Validasi environment menggunakan Zod.
- Jangan mengekspos secret ke browser.
- Terapkan pembatasan percobaan login sederhana.
- Validasi semua input yang berasal dari pengguna.
- Periksa autentikasi dan otorisasi di server.
- Jangan mempercayai classId, userId, atau conversationId hanya
  karena dikirim oleh klien.
- Gunakan transaksi untuk operasi yang memerlukan konsistensi,
  terutama penetapan nomor meja.
- Jangan mencatat password, token, atau URL database ke log.
9.5 Skema Domain Awal
Skema berikut adalah kebutuhan domain awal, bukan SQL atau Prisma Schema
final. Struktur tabel autentikasi harus mengikuti hasil generate Better
Auth.
  Entitas                             Tujuan
  User / profil pengguna              Menyimpan data profil yang terkait
dengan akun autentikasi

  AvatarFrame                         Mendefinisikan bingkai avatar

  ProfileEffect                       Mendefinisikan efek profil

  Class                               Menyimpan data kelas
ClassMember                         Menghubungkan pengguna dengan kelas
dan peran keanggotaannya
Kebutuhan minimum ClassMember: - Relasi ke kelas. - Relasi ke
pengguna. - Informasi peran dalam kelas. - seatIndex bertipe Int?
atau integer nullable. - Constraint unik [classId, seatIndex] untuk
nomor meja yang terisi. - Constraint yang mencegah satu pengguna
terdaftar berulang kali pada kelas yang sama.

Tabel dan relasi untuk thread, komentar, materi, pengumuman, percakapan,
pesan, presence, serta moderasi disusun pada tahap fitur masing-masing.
Jangan membangun seluruh skema lanjutan sebelum aturan produknya jelas.
9.6 Penetapan Nomor Meja yang Aman
Proses penetapan meja harus berjalan di server dan dalam transaksi
database. Jika dua pengguna bergabung pada saat bersamaan dan memperoleh
nomor meja yang sama, sistem harus menangani konflik dan mencoba ulang
secara aman. Pengguna yang tidak memerlukan nomor meja---seperti guru
atau asisten---dapat memiliki seatIndex bernilai null.
10. Struktur Aplikasi yang Disarankan
Struktur berikut merupakan usulan awal dan boleh disesuaikan dengan pola
Next.js serta konfigurasi alat yang dihasilkan:
.
├── app/
│   ├── (auth)/
│   ├── (platform)/
│   │   ├── dashboard/
│   │   ├── school/
│   │   ├── classes/
│   │   ├── discussions/
│   │   ├── library/
│   │   ├── profile/
│   │   └── messages/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── school/
│   ├── classroom/
│   ├── discussion/
│   ├── messaging/
│   └── profile/
├── features/
│   ├── auth/
│   ├── classes/
│   ├── discussions/
│   ├── learning-materials/
│   ├── messaging/
│   └── profile/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── env/
│   ├── permissions/
│   └── validation/
├── prisma/
├── public/
│   └── assets/
├── tests/
├── docs/
│   ├── rancangan.md
│   ├── DESIGN.md
│   ├── WORLD.md
│   └── SETUP.md
├── AGENTS.md
└── .env.example
Struktur ini bukan kewajiban mutlak. Hindari membuat folder atau
abstraksi kosong yang belum memiliki kebutuhan nyata. Jika struktur
proyek aktual berbeda, dokumentasikan alasannya dan jaga pemisahan
domain tetap jelas.
11. Tahapan Pengembangan
Pengembangan harus bertahap. Setiap tahap memiliki hasil yang dapat
diperiksa sebelum melanjutkan ke tahap berikutnya.
Tahap 1 --- Fondasi Proyek
Cakupan: - Membuat proyek Next.js App Router dengan TypeScript. -
Menyiapkan Tailwind CSS dan shadcn/ui. - Menyiapkan Prisma dan
PostgreSQL Neon. - Menyiapkan Better Auth untuk email dan password. -
Membuat model profil, AvatarFrame, ProfileEffect, Class, dan
ClassMember. - Membuat .env.example, .gitignore, validasi
environment dengan Zod, dan pembatasan percobaan login sederhana. -
Menyiapkan Vitest dan tes awal. - Menyiapkan struktur folder dan layout
dasar.

Tidak termasuk: - Dunia 3D. - Chat/DM. - Forum dan materi lengkap. -
Multiplayer.

Kriteria selesai: aplikasi dapat dijalankan, autentikasi dasar
berfungsi, koneksi database tervalidasi, skema awal dapat dimigrasikan,
dan lint, typecheck, serta tes berhasil.
Tahap 2 --- Layout Platform dan Mode Cepat (2D)
Cakupan: - Navigasi utama platform. - Halaman kelas dan daftar kelas. -
Akses ke diskusi global, perpustakaan, profil, dan area pesan sesuai
fitur yang telah tersedia. - Komponen keadaan loading, kosong, error,
dan sukses. - Responsivitas desktop, tablet, dan mobile.

Kriteria selesai: pengguna dapat menavigasi kerangka platform tanpa
3D dan tidak ada tombol utama yang hanya menjadi dekorasi.
Tahap 3 --- Dunia Sekolah 3D Solo
Cakupan: - Membangun lingkungan sekolah awal. - Lorong dan pintu
kelas. - Kontrol first-person. - Berjalan, berlari, dan jongkok. -
Deteksi tabrakan dasar. - Petunjuk interaksi objek. - HUD dan menu
jeda. - Kontrol sentuh dasar untuk mobile jika performa memungkinkan.

Pada tahap ini dunia masih dapat digunakan secara solo. Jangan
mengerjakan multiplayer posisi terlebih dahulu.

Kriteria selesai: pengguna dapat menjelajahi area awal, bergerak
tanpa menembus geometri utama, berinteraksi dengan objek uji, dan
kembali ke Mode Cepat.
Tahap 4 --- Integrasi Objek dengan Fitur Platform
Cakupan: - Pintu kelas terhubung ke pemeriksaan keanggotaan. - Mading
terhubung ke diskusi global. - Perpustakaan terhubung ke materi
terbuka. - Loker terhubung ke profil. - Cermin terhubung ke bingkai
avatar dan efek profil. - Papan tulis, papan diskusi, dan rak materi
terhubung ke fitur kelas.

Kriteria selesai: interaksi objek membuka fitur yang benar, dan
semua fitur yang terhubung tetap tersedia melalui Mode Cepat.
Tahap 5 --- Kelas Virtual dan Meja
Cakupan: - Alur bergabung ke kelas menggunakan kode. - Ruang kelas
dengan papan tulis, papan diskusi, rak materi, meja guru/asisten, dan
meja siswa. - Penetapan seatIndex secara aman. - Kartu profil saat
berinteraksi dengan meja.

Kriteria selesai: akses kelas diperiksa di server, nomor meja tidak
bentrok, dan pengguna yang bukan anggota tidak dapat membaca data privat
kelas.
Tahap 6 --- Forum, Materi, dan Pengumuman
Cakupan: - Diskusi global. - Thread diskusi kelas. - Komentar sesuai
kebutuhan yang telah disepakati. - Materi perpustakaan dan materi
kelas. - Pengumuman kelas. - Pemeriksaan izin berdasarkan keanggotaan
dan peran.

Kriteria selesai: pengguna dapat membaca dan melakukan aksi sesuai
izin; data privat tidak dapat diakses melalui endpoint langsung oleh
pengguna tanpa hak.
Tahap 7 --- DM Berbasis Meja
Cakupan: - Interaksi dengan meja anggota. - Kartu profil. - Aksi Kirim
pesan. - Panel percakapan. - Penyimpanan dan pengambilan riwayat
pesan. - Pemeriksaan aturan anggota kelas yang sama pada setiap operasi
server.

Kriteria selesai: alur DM berjalan dari meja, aturan keanggotaan
ditegakkan di server, dan Mode Cepat memiliki akses setara.
Tahap 8 --- Multiplayer dan Presence
Cakupan: - Status online anggota. - Representasi kehadiran di ruang
kelas. - Sinkronisasi posisi atau kehadiran jika memang dibutuhkan. -
Lampu meja berdasarkan status online yang tervalidasi.

Tahap ini dikerjakan setelah dunia solo, akses kelas, dan fitur inti
stabil. Teknologi real-time dipilih berdasarkan kebutuhan dan hasil
evaluasi, bukan ditambahkan sejak awal tanpa alasan.

Kriteria selesai: status online tidak menyesatkan, sinkronisasi
stabil pada kondisi jaringan yang wajar, dan kegagalan koneksi tidak
merusak akses fitur 2D.
Tahap 9 --- Audit dan Penyempurnaan
Cakupan: - Audit keamanan dan izin akses. - Audit performa dunia 3D. -
Audit aksesibilitas dan reduced motion. - Pengujian desktop, tablet, dan
mobile. - Audit seluruh tombol dan interaksi. - Audit desain dan
konsistensi dokumentasi. - Pemeriksaan lisensi seluruh aset 3D, model,
tekstur, font, dan audio yang digunakan.

Kriteria selesai: tidak ada alur inti yang buntu, fitur penting
dapat digunakan tanpa 3D, tidak ada akses lintas kelas yang melanggar
aturan, dan masalah kritis telah diselesaikan atau dicatat secara
eksplisit.
12. Pengujian dan Kriteria Kualitas
12.1 Pengujian Teknis
Setiap perubahan yang relevan harus diikuti: - Lint. - Typecheck. - Unit
test. - Integration test untuk alur database dan otorisasi. - Pengujian
browser untuk alur antarmuka yang berubah.

Gunakan Vitest untuk pengujian awal. Tambahkan alat pengujian lain hanya
jika ada kebutuhan yang jelas dan disetujui.
12.2 Pengujian Otorisasi
Kasus minimum: 1. Pengguna yang bukan anggota tidak dapat membuka ruang
kelas privat. 2. Kode kelas yang tidak valid tidak membuat keanggotaan.
3. Pengguna yang bukan anggota tidak dapat membaca thread atau materi
privat kelas. 4. Dua pengguna yang tidak memiliki kelas bersama tidak
dapat membuat atau mengakses DM. 5. Pengguna tidak dapat mengirim pesan
dengan memalsukan identitas pengirim. 6. Pengguna tidak dapat mengakses
percakapan hanya dengan mengganti ID. 7. Penetapan nomor meja tidak
menghasilkan nomor ganda pada kelas yang sama.
12.3 Pengujian Antarmuka
Uji minimal pada: - Desktop dengan lebar umum. - Tablet. - Mobile. -
Layar dengan tinggi pendek. - Kondisi jaringan lambat. - Kondisi
loading, kosong, gagal, dan data tersedia.
12.4 Pengujian Dunia 3D
- Kontrol keyboard dapat digunakan.
- Kontrol mobile tidak menutupi interaksi penting.
- Karakter tidak menembus dinding dan objek utama.
- Jongkok menyesuaikan kamera dan kapsul tabrakan.
- Petunjuk interaksi muncul pada objek yang tepat.
- Panel dapat dibuka dan ditutup tanpa kehilangan konteks.
- Pengguna dapat beralih ke Mode Cepat.
- Pengaturan reduced motion dihormati.
- Performa dipantau pada perangkat dengan kemampuan grafis berbeda.
13. Keamanan, Privasi, dan Moderasi
- Autentikasi dan otorisasi wajib dilakukan di server.
- Akses kelas harus diperiksa pada setiap endpoint yang mengembalikan
  data privat.
- DM harus memverifikasi keanggotaan kelas yang sama pada setiap
  operasi.
- Input pengguna harus divalidasi dan ditangani dengan aman.
- Rahasia aplikasi dan kredensial database tidak boleh masuk
  repository.
- Data profil yang ditampilkan harus dibatasi pada informasi yang
  memang dimaksudkan untuk publik atau anggota kelas.
- Jangan menampilkan status online jika data presence belum dapat
  dipercaya.
- Kebijakan pelaporan, pemblokiran, moderasi konten, retensi pesan,
  dan penghapusan akun masih perlu ditetapkan.
- Jangan mengklaim platform telah aman hanya karena tombol atau
  halaman tertentu disembunyikan.
14. Aset dan Lisensi
Dunia 3D membutuhkan aset seperti model lorong, pintu, loker, meja,
papan tulis, rak, tekstur, dan pencahayaan. Aset dapat dibuat sendiri
atau menggunakan paket aset yang lisensinya mengizinkan penggunaan dalam
proyek.

Setiap aset eksternal harus diperiksa: - Sumber aset. - Jenis lisensi. -
Izin penggunaan dan modifikasi. - Kewajiban atribusi. - Batasan
distribusi atau penggunaan komersial jika relevan.

Jangan menggunakan aset dari situs referensi seolah-olah aset tersebut
bebas digunakan. Aset 3D belum disediakan dalam rancangan ini dan perlu
dipersiapkan pada tahap dunia 3D.
15. Aturan Kerja untuk Coding Agent
Dokumen ini digunakan bersama AGENTS.md, DESIGN.md, dan WORLD.md.

Urutan prioritas: 1. Kebutuhan dan aturan produk dalam dokumen rancangan
ini. 2. Aturan interaksi dan dunia dalam WORLD.md. 3. Arah visual
dalam DESIGN.md. 4. Aturan kerja teknis dalam AGENTS.md. 5.
Rekomendasi dari skill atau tool yang digunakan agent.

Jika ada pertentangan, agent harus melaporkannya dan tidak memilih
sendiri keputusan produk yang mengubah perilaku inti.
15.1 Penggunaan Skill
Skill yang direncanakan: - Superpowers: membantu alur kerja
terstruktur, perencanaan, implementasi, dan review. - UI UX Pro Max:
membantu eksplorasi pola UI/UX dan panduan implementasi. -
Impeccable: membantu kritik dan audit kualitas desain. -
Anti-slop: membantu mendeteksi pola UI dan copywriting generik. -
Taste-skill: digunakan secara terbatas untuk landing page atau layar
jeda, bukan sebagai pedoman utama panel aplikasi dan dunia 3D.

Skill yang belum terdeteksi tidak boleh dianggap telah digunakan. Agent
tidak boleh memasang perangkat lunak atau paket baru tanpa persetujuan
pengguna.
15.2 Aturan Implementasi
- Baca dokumen proyek sebelum mengubah kode.
- Jangan menimpa DESIGN.md dengan generator dokumentasi.
- Jangan menambah dependensi tanpa alasan tertulis.
- Jangan membuat fitur di luar cakupan tahap yang sedang dikerjakan.
- Jangan mengganti aturan DM atau akses kelas tanpa persetujuan.
- Jangan menganggap efek visual sebagai pengganti fungsi.
- Jangan meninggalkan tombol yang tampak aktif tetapi tidak memiliki
  aksi.
- Jangan membuat data contoh seolah-olah data produksi.
- Gunakan Bahasa Indonesia untuk teks antarmuka.
- Gunakan ikon dari lucide-react, bukan emoji.
- Perbarui dokumentasi jika keputusan teknis atau alur produk berubah.
15.3 Definisi Selesai
Sebuah tugas baru dapat dinyatakan selesai apabila: 1. Implementasi
sesuai cakupan yang disetujui. 2. Tidak ada tombol atau kontrol utama
yang tidak berfungsi. 3. Loading, error, empty state, dan success state
ditangani sesuai kebutuhan. 4. Otorisasi server diterapkan untuk data
yang dilindungi. 5. Lint, typecheck, dan tes yang relevan berhasil. 6.
Tampilan diuji pada ukuran layar yang relevan. 7. Mode Cepat tetap dapat
mengakses fitur inti. 8. Dokumentasi terkait diperbarui. 9. Keterbatasan
atau pekerjaan tersisa dilaporkan dengan jujur.
16. Keputusan yang Masih Perlu Dikonfirmasi
Poin berikut belum memiliki keputusan final dalam pembahasan awal. Agent
tidak boleh mengarang jawabannya ketika keputusan tersebut memengaruhi
implementasi.
1. Nama resmi platform: nama produk belum ditetapkan dalam
   rancangan ini.
2. Jenis pengguna: apakah platform hanya untuk satu sekolah atau
   dapat digunakan oleh banyak sekolah/organisasi.
3. Pembuatan kelas: siapa yang boleh membuat kelas dan menghasilkan
   kode kelas.
4. Peran kelas: rincian izin guru, asisten, dan murid.
5. Kapasitas kelas: jumlah maksimum anggota dan jumlah meja siswa.
6. Aturan DM: apakah cukup memiliki satu kelas bersama, atau DM
   harus dibatasi pada kelas tempat pengguna sedang berada.
7. Diskusi global: apakah semua pengguna terdaftar dapat membaca
   dan membuat thread.
8. Materi: format file dan batas ukuran lampiran yang diizinkan.
9. Moderasi: pelaporan, pemblokiran, penghapusan konten, dan
   penanganan penyalahgunaan.
10. Presence: apakah status online harus real-time dan apakah posisi
    karakter akan disinkronkan.
11. Aset 3D: gaya model, sumber aset, dan perangkat minimum yang
    harus didukung.
12. Teknologi 3D: pilihan library atau engine web belum dipatok.
13. Notifikasi: jenis notifikasi yang dibutuhkan untuk diskusi,
    pengumuman, dan pesan.
14. Privasi profil: informasi apa yang dapat dilihat oleh anggota
    kelas dan pengguna umum.
Keputusan-keputusan tersebut dapat dibuat bertahap sesuai kebutuhan
tahap pengembangan.
17. Ringkasan Arah Produk
Platform ini dibangun sebagai sekolah virtual interaktif yang
menghubungkan ruang fisik digital dengan aktivitas belajar dan
diskusi.

Pengguna dapat menjelajahi sekolah, memasuki kelas, berinteraksi dengan
papan dan rak untuk membuka fitur pembelajaran, serta mendatangi meja
anggota kelas untuk membuka profil dan memulai DM. Akses kelas dan DM
dibatasi berdasarkan keanggotaan dan harus diverifikasi di server.

Dunia 3D memberikan pengalaman eksplorasi, tetapi seluruh aktivitas inti
tetap tersedia melalui Mode Cepat (2D). Pengembangan dimulai dari
fondasi aplikasi dan database, dilanjutkan dengan navigasi 2D, dunia 3D
solo, integrasi objek, kelas dan meja, forum serta materi, DM, lalu
multiplayer dan audit akhir.

Dokumen ini menjadi acuan kebutuhan produk. Detail visual mengikuti
DESIGN.md, perilaku dunia mengikuti WORLD.md, dan prosedur kerja
agent mengikuti AGENTS.md.