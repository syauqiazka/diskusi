# Sakura Academy — Kampus Virtual SMK TI BAZMA

> Platform diskusi, ruang kelas interaktif, dan forum pembelajaran kejuruan SIJA yang dikemas dalam pengalaman ganda: **Mode Cepat (2D)** yang ringan dan responsif, serta **Dunia 3D Spasial** bergaya anime Kyoto Animation yang dapat dijelajahi secara *first-person*.

---

## Daftar Isi
- [Ringkasan & Filosofi Produk](#ringkasan--filosofi-produk)
- [Teknologi Utama (Tech Stack)](#teknologi-utama-tech-stack)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Fitur Utama](#fitur-utama)
- [11 Kaidah Standar UX](#11-kaidah-standar-ux)
- [Struktur Direktori](#struktur-direktori)
- [Panduan Instalasi & Penggunaan](#panduan-instalasi--penggunaan)
- [Pengujian & Jaminan Mutu](#pengujian--jaminan-mutu)

---

## Ringkasan & Filosofi Produk

Proyek ini dibangun untuk siswa dan pengajar program keahlian Sistem Informasi, Jaringan, dan Aplikasi (SIJA) di SMK TI BAZMA. Filosofi utama platform ini berpegang pada **Dual-Mode Experience**:

1. **Fungsi Lebih Penting Daripada Efek:** Aktivitas intensif teks (membaca modul, berdiskusi di mading, mengirim tugas, dan mengirim pesan pribadi) disajikan melalui panel **Mode Cepat (2D)** yang ringan, ramah perangkat hemat daya, dan bebas hambatan komputasi grafis.
2. **Dunia 3D Sebagai Navigasi:** Dunia sekolah 3D berfungsi sebagai lapisan eksplorasi spasial yang menyenangkan. Setiap ruangan dan fasilitas fisik (kelas, meja belajar, papan tulis, loker genkan, perpustakaan, aula teater, gimnasium, dan kolam renang) terhubung langsung dengan data digital platform.
3. **Kesetaraan Akses:** Tidak ada satu pun fitur yang terkunci hanya di dunia 3D. Seluruh fungsionalitas selalu dapat diakses secara penuh melalui antarmuka web 2D.
4. **Keamanan di Sisi Server:** Seluruh validasi input dan otorisasi peran (SUPERADMIN, ADMIN/Pengajar, dan SISWA) ditegakkan di sisi server melalui Server Actions, Zod, dan Prisma ORM.

---

## Teknologi Utama (Tech Stack)

### Frontend & Desain Antarmuka
- **Framework:** [Next.js](https://nextjs.org/) (App Router dengan React 19 & TypeScript)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) dengan palet resmi *Fresh Mint & Warm Peach*
- **Tipografi:** Fredoka (Display / Judul) & Nunito (Body / Teks Bacaan)
- **Komponen UI Primitif:** shadcn/ui + [Lucide React](https://lucide.dev/)
- **Animasi Antarmuka:** [GSAP](https://greensock.com/gsap/) & `@gsap/react` (efek *toy-like pop*, transisi modal, dan animasi cermin profil)
- **Smooth Inertial Scroll:** [Lenis](https://lenis.darkroom.engineering/) (aktif di rute 2D dan otomatis dinonaktifkan di kontrol kanvas 3D)

### Dunia 3D & Grafika Spasial
- **Engine 3D:** [Three.js](https://threejs.org/) melalui [@react-three/fiber](https://r3f.docs.pmnd.rs/) & [@react-three/drei](https://github.com/pmndrs/drei)
- **Post-Processing:** `@react-three/postprocessing`
- **Arsitektur Spasial:** Deterministik 1:1 dari [src/data/campus.json](file:///d:/diskusi/src/data/campus.json)
- **Fisika & Kontrol:** First-person capsule collision, pointer-lock camera, dan pintu geser Jepang (*hikido*) beranimasi halus
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (`useWorldStore`, `useSakuraStore`, `useAchievementStore`)

### Backend, Database & Penyimpanan Awan
- **Autentikasi:** [Better Auth](https://www.better-auth.com/) (Email & Kata Sandi, sesi terenkripsi)
- **Validasi Data:** [Zod v4](https://zod.dev/) untuk seluruh mutasi data dan environment variable
- **Database:** Serverless PostgreSQL via [Neon](https://neon.tech/)
- **ORM:** [Prisma ORM v7](https://www.prisma.io/) dengan Prisma PostgreSQL Adapter (`@prisma/adapter-pg`)
- **Penyimpanan Berkas (Cloud Storage):** [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob) (`@vercel/blob` dengan `BLOB_READ_WRITE_TOKEN`)
- **Real-Time & Kehadiran:** [Ably Realtime](https://ably.com/) (Token Auth & Presence) dengan *graceful local fallback*
- **Unit Testing:** [Vitest](https://vitest.dev/) (19 test suites, 125 unit tests)

---

## Arsitektur Sistem

### Diagram Arsitektur Keseluruhan
```mermaid
flowchart TD
    User["Pengguna (Siswa / Guru)"] --> WebApp["Next.js App Router (React 19)"]
    
    subgraph FrontendExperience ["Pengalaman Pengguna (Dual-Mode)"]
        WebApp --> Mode2D["Mode Cepat 2D (Lenis + GSAP + Tailwind)"]
        WebApp --> Mode3D["Dunia 3D (R3F + Three.js + Zustand)"]
    end
    
    subgraph CoreDomain ["Lapisan Bisnis & Validasi (Server Actions)"]
        Mode2D --> ServerActions["Server Actions & API Handlers"]
        Mode3D --> ServerActions
        ServerActions --> ZodValidator["Validasi Skema Zod (Anti-XSS & Kuota)"]
        ServerActions --> RBAC["Pemeriksaan Hak Akses (Role-Based Access Control)"]
    end
    
    subgraph BackendServices ["Layanan Data & Awan"]
        RBAC --> PrismaORM["Prisma Client Adapter"]
        PrismaORM --> NeonDB[("Neon PostgreSQL Serverless")]
        ServerActions --> VercelBlob[("Vercel Blob Storage (Berkas & Foto)")]
        ServerActions --> AblyService[("Ably Realtime Presence")]
    end
```

### Alur Unggah Berkas & Gambar (Vercel Blob Storage)
```mermaid
sequenceDiagram
    autonumber
    actor Siswa as Siswa / Guru
    participant Client as ImageUploader (Client UI)
    participant API as /api/upload (Route Handler)
    participant Auth as Better Auth Session
    participant Blob as Vercel Blob Storage

    Siswa->>Client: Memilih gambar avatar / berkas materi
    Client->>Client: Validasi ukuran client-side (maks 10 MB)
    Client->>API: POST FormData (file) + Cookie Sesi
    API->>Auth: Verifikasi sesi pengguna
    alt Tidak Terautentikasi
        API-->>Client: 401 Unauthorized
    else Sesi Valid
        API->>API: Validasi MIME Type (JPG, PNG, WebP, PDF) & ukuran <= 10 MB
        API->>API: Sanitasi nama berkas (regex alfanumerik)
        API->>Blob: put(uploads/userId/timestamp-name, file, token)
        Blob-->>API: URL publik Vercel Blob (https://*.public.blob.vercel-storage.com)
        API-->>Client: 200 OK { success: true, url, pathname, size }
        Client->>Client: Tampilkan pratinjau & progress 100% selesai
        Client-->>Siswa: Berkas berhasil tersimpan di profil / materi
    end
```

---

## Fitur Utama

### 1. Ruang Kelas Digital & Alokasi Meja Siswa
- **26 Meja Belajar per Ruang:** Setiap siswa yang bergabung ke kelas dengan kode akses (misal `SIJA-10A`) otomatis dialokasikan nomor meja tetap.
- **Meja Guru & Papan Tulis:** Menampilkan silabus, topik aktif, dan daftar materi ajar.
- **Pesan Pribadi Khusus Kelas (DM):** Siswa hanya dapat saling berkirim pesan jika berada dalam ruang kelas yang sama untuk menjaga fokus belajar.

### 2. Mading Sekolah & Forum Komunitas
- **Pemberian Suara Optimistik (*Optimistic Voting*):** Skor topik langsung bertambah/berkurang di layar seketika saat tombol ditekan (*Update First, Sync Later*).
- **Komentar Bertingkat (3 Tingkat):** Diskusi terstruktur dengan kedalaman hingga 3 level untuk percakapan mendalam.
- **Penandaan Jawaban Terbaik (*Best Answer*):** Penulis topik dan guru dapat menandai solusi terbaik yang otomatis disematkan di baris teratas.

### 3. Perpustakaan Digital SIJA & Vercel Blob
- **Pencarian Real-Time & Filter Kategori:** Penyaringan dokumen langsung per topik (Jaringan & Server, Virtualisasi, Sistem Operasi, Pemrograman).
- **Unggah Dokumen Nyata:** Guru dapat mengunggah berkas modul, silabus, dan sampul materi ke penyimpanan awan Vercel Blob.
- **Determinate Progress Bar:** Menampilkan persentase unduhan dan perkiraan sisa waktu unduh.

### 4. Cermin Kosmetik Profil & Efek GSAP
- **Bingkai Avatar Resmi:** Katalog bingkai *Fresh Mint*, *Warm Peach*, dan *Indigo Spark*.
- **Animasi Efek Cermin GSAP:** Animasi partikel melayang *Sinar Pagi* (aura hangat), *Kelopak Bunga* (bunga sakura melayang), dan *Pendar Ceria* (kerlip bintang) yang mematuhi preferensi aksesibilitas `prefers-reduced-motion`.
- **Foto Avatar Kustom:** Dukungan penggantian foto profil asli yang disimpan di Vercel Blob.

### 5. Cetak Biru Arsitektur 2D (`MapModal`)
- **Peta Interaktif Lengkap:** Menampilkan denah deterministik kampus sekolah anime:
  - *Kawasan Kampus (Master Plan)*: Gerbang selatan, bundaran air mancur, asrama, aula teater, gym, lapangan sepak bola & bisbol, tenis, taman koi, dojo kyudo.
  - *Gedung Utama Lantai 1, 2, 3 & Teras Atap (Okujo)*.
  - *Fasilitas Olahraga & Seni (Aula 800 kursi & Gimnasium kolam indoor)*.

### 6. Dunia 3D Spasial (Sakura Academy)
- Navigasi spasial first-person bergaya Kyoto Animation dengan pencahayaan hangat, pohon sakura, lorong kelas, dan pintu geser interaktif.
- Optimasi performa tinggi stabil hingga 90 FPS dengan *instanced rendering* dan nol *z-fighting*.

---

## 11 Kaidah Standar UX

Platform ini menerapkan 11 aturan fundamental pengalaman pengguna modern:

| No | Kaidah UX | Penerapan di Platform |
|:---|:---|:---|
| 1 | **Align Fields with Data Type** | Kode kelas ditampilkan dengan format monospaced tersegmen (`PROG-TINGKAT`). |
| 2 | **Horizontal Alignment in Forms** | Seluruh label formulir diposisikan *top-aligned* di atas input dengan rata kiri lurus (*single vertical line of sight*). |
| 3 | **Don't Use Placeholder As Label** | Teks placeholder berupa contoh format nyata (`nama@sekolah.id`, `Ahmad Rizky`), bukan pengulangan nama label. |
| 4 | **Use Skeleton Loading Instead of Spinner** | Transisi halaman dan pemuatan data menggunakan kartu *skeleton wireframe* responsif ([skeleton.tsx](file:///d:/diskusi/src/components/ui/skeleton.tsx)). |
| 5 | **Law of Proximity / Adjust Spacing** | Hierarki jarak terstruktur: label-ke-input ($6\text{ px}$), antar kelompok formulir ($20\text{--}24\text{ px}$), dan sebelum tombol submit ($24\text{--}32\text{ px}$). |
| 6 | **Use Input Masks to Guide Users** | Format panduan jelas pada kode kelas (`SIJA-___`), email sekolah, dan kata sandi minimal 8 karakter. |
| 7 | **Allow Users to Both Type & Scroll** | Filter pencarian di perpustakaan dapat diketik untuk menyaring materi seketika sekaligus dapat di-scroll per kategori. |
| 8 | **Split Long Forms Into Steps** | Pendaftaran siswa di [daftar/page.tsx](file:///d:/diskusi/src/app/(auth)/daftar/page.tsx) dibagi menjadi 2 tahap (*Identitas Siswa* $\rightarrow$ *Keamanan Akun*) dengan indikator progres stepper. |
| 9 | **Psychology of Colors** | Aksi destruktif (hapus berkas, keluar kelas) menggunakan [ConfirmDestructiveModal](file:///d:/diskusi/src/components/ui/confirm-destructive-modal.tsx) berikon tempat sampah merah dan tombol merah tegas (`variant="danger"`). |
| 10 | **Update First, Sync Later (Optimistic UI)** | Skor voting pada forum mading langsung diperbarui saat diklik, lalu disinkronkan secara asinkron ke server. |
| 11 | **Show How Long** | Unduhan materi dan unggahan berkas Vercel Blob menyajikan bilah progres persentase ($0\% \rightarrow 100\%$) dan estimasi waktu sisa. |

---

## Struktur Direktori

```text
d:\diskusi/
├── prisma/
│   └── schema.prisma                # Skema database PostgreSQL (Pengguna, Kelas, Materi, Mading, Chat)
├── public/                          # Aset statis, audio, dan gambar publik
├── scripts/
│   └── validate-layout.mjs          # Validator tata letak AABB spasial kampus 3D
├── src/
│   ├── app/                         # Next.js App Router (Rute & Halaman)
│   │   ├── (auth)/                  # Rute autentikasi publik (masuk & daftar)
│   │   ├── (dashboard)/             # Rute hub siswa & pengajar (kelas, mading, perpustakaan, pesan, profil)
│   │   │   └── loading.tsx          # Skeleton loading otomatis saat navigasi dashboard
│   │   ├── api/                     # Endpoint API (Better Auth, Ably Token, Vercel Blob Upload)
│   │   │   ├── auth/[...all]/       # Better Auth handler
│   │   │   ├── realtime/auth/       # Ably presence token generator
│   │   │   └── upload/route.ts      # Vercel Blob upload handler (validasi 10MB anti-XSS)
│   │   ├── dunia/                   # Rute navigasi kanvas 3D kampus & ruang kelas
│   │   ├── globals.css              # Variabel tema CSS & kelas utilitas Lenis
│   │   ├── layout.tsx               # Root Layout (SmoothScrollProvider, Font Fredoka & Nunito)
│   │   └── page.tsx                 # Beranda publik & beranda siswa terautentikasi
│   ├── components/                  # Komponen antarmuka React
│   │   ├── animations/              # Komponen pembungkus animasi GSAP (GsapFadeUp, GsapStagger)
│   │   ├── classroom/               # Kartu kelas, grid meja siswa, dan formulir gabung kelas
│   │   ├── home/                    # Tombol aksi beranda & 5 modal interaktif (Opsi, Kontrol, Peta, dll.)
│   │   ├── layout/                  # Navigasi dashboard, HUD header, dan footer
│   │   ├── profile/                 # Pengganti peran & kosmetik profil
│   │   ├── providers/               # Context provider (Lenis smooth inertial scroll)
│   │   ├── ui/                      # Komponen primitif (Button, Card, Input, Skeleton, ImageUploader, Modal)
│   │   └── world/                   # Adegan 3D Three.js (Koleksi gedung, kelas, langit, kontrol)
│   ├── data/
│   │   └── campus.json              # Satu sumber kebenaran (SSOT) arsitektur & koordinat kampus
│   ├── lib/                         # Logika domain, database, dan helper server
│   │   ├── animations.ts            # Registrasi plugin GSAP & logika animasi efek cermin
│   │   ├── auth/                    # Konfigurasi Better Auth & authClient
│   │   ├── chat/                    # Server Actions untuk pesan langsung (DM sesama kelas)
│   │   ├── classroom/               # Server Actions manajemen kelas & alokasi meja
│   │   ├── db/                      # Koneksi Prisma Client dengan adapter Neon PG
│   │   ├── env.ts                   # Validasi variabel lingkungan dengan Zod
│   │   ├── forum/                   # Server Actions forum mading, voting, dan komentar
│   │   ├── materials/               # Server Actions repositori materi perpustakaan
│   │   ├── realtime/                # Helper koneksi Ably Realtime & Presence
│   │   ├── tokens.ts                # Token warna, font, dan konstanta desain
│   │   └── world/                   # Perhitungan matematika spasial & deteksi tabrakan
│   └── stores/                      # State manager Zustand
│       ├── use-achievement-store.ts # Pelacak pencapaian dan trofi eksplorasi
│       ├── use-sakura-store.ts      # Konfigurasi suasana kampus & grafika
│       └── use-world-store.ts       # Posisi pemain spasial & kontrol kanvas 3D
├── tests/
│   └── unit/                        # 19 suite pengujian Vitest (125 tes logika & validasi)
├── .env                             # Konfigurasi variabel lingkungan lokal
├── .env.example                     # Contoh konfigurasi template environment
├── package.json                     # Konfigurasi dependensi dan skrip proyek
├── tsconfig.json                    # Konfigurasi TypeScript compiler
└── vitest.config.mts                # Konfigurasi testing framework Vitest
```

---

## Panduan Instalasi & Penggunaan

### 1. Prasyarat Sistem
- **Node.js:** Versi 20 atau lebih baru (disarankan Node v22+)
- **NPM:** Versi 10+
- **Database:** PostgreSQL (atau akun [Neon Database](https://neon.tech/))

### 2. Kloning Repositori & Pasang Dependensi
```bash
git clone <url-repositori>
cd diskusi
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env`)
Salin berkas `.env.example` menjadi `.env` lalu sesuaikan kredensial Anda:
```env
# Neon PostgreSQL Connection
DATABASE_URL="postgresql://user:password@endpoint-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="kunci-rahasia-acak-minimal-32-karakter-harus-diisi"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Ably Realtime & Presence
ABLY_API_KEY="your-ably-api-key"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 4. Sinkronisasi Database (Prisma Migration)
Jalankan migrasi skema database:
```bash
npx prisma migrate dev
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda di `http://localhost:3000`.

---

## Pengujian & Jaminan Mutu

Seluruh alur logika, validasi data, hak akses, dan tata letak diuji secara otomatis:

```bash
# Menjalankan seluruh pengujian unit (19 file, 125 tes)
npm test

# Menjalankan pemeriksaan tipe TypeScript
npm run typecheck

# Menjalankan pemeriksaan linter ESLint
npm run lint

# Validasi deterministik tata letak spasial 3D
node scripts/validate-layout.mjs src/data/campus.json
```

Status pengujian terkini:
- ✅ **125/125 Unit Tests Passed**
- ✅ **TypeScript 0 Errors**
- ✅ **ESLint 0 Errors**
- ✅ **Layout Validator OK** (tanpa tabrakan volume AABB)

