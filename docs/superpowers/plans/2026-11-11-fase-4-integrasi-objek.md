# Fase 4: Integrasi Objek dengan Fitur Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghubungkan seluruh objek interaktif dunia 3D (Pintu Kelas, Loker, Cermin, Mading, Perpustakaan) dan objek di dalam kelas ke data nyata di database PostgreSQL Neon/Better Auth melalui Server Actions yang aman, dengan penegakan otorisasi keanggotaan dan paritas penuh di Mode Cepat (2D).

**Architecture:**
- **Server Actions & Permissions**: Buat `src/lib/classroom/object-actions.ts` untuk melayani query dan mutasi data objek (verifikasi keanggotaan pintu kelas, profil loker, katalog kosmetik cermin, serta preview mading/perpustakaan).
- **Interactive Modals (WorldModals)**: Perbarui `src/components/world/world-modals.tsx` agar memuat data dinamis secara reaktif dengan loading skeleton bergaya HUD retro dan umpan balik kesalahan yang jelas.
- **Cosmetics Catalog**: Inisialisasi dan sinkronisasi katalog `AvatarFrame` dan `ProfileEffect` di database, dan sediakan mutasi pemilihan kosmetik akun pengguna.
- **Classroom 2D Parity**: Hubungkan tab pengumuman papan tulis, diskusi, dan rak materi di `ClassroomTabsView` ke data kelas aktif.

**Tech Stack:** Next.js (App Router), TypeScript, Prisma ORM (Neon), Better Auth, Zustand, Tailwind CSS, Lucide-react, Vitest.

**Spec:**
- `docs/rancangan.md` (Bagian 3.2 s.d. 3.4, 4.2, 7.1 s.d. 7.3, dan Tahap 4 Bagian 11)
- `WORLD.md` (Tahap 2: Hubungkan Fitur)
- `DESIGN.md` (Token warna retro-liminal, larangan emoji, tipografi VT323 & Anton)
- `PRODUCT.md` (Akurasi Kawasan SMK TI BAZMA)

## Global Constraints
- Token warna wajib dari `DESIGN.md`: `--night` (`#0B0D12`), `--fluor` (`#E9F2E3`), `--caution` (`#F2C200`), `--neon-cyan` (`#5CE1FF`), `--neon-pink` (`#FF5C93`), `--alert` (`#E0412F`), `--ok` (`#4FD08A`).
- Tipografi: `VT323` untuk label sistem & HUD, `Anton` untuk penunjuk/rambu, `Instrument Sans` untuk isi teks panel, `JetBrains Mono` untuk status.
- Dilarang memakai emoji sebagai ikon atau elemen antarmuka (wajib SVG atau Lucide-react).
- Semua operasi otorisasi (akses kelas, pengubahan profil, pemilihan kosmetik) wajib diverifikasi di sisi server.
- Paritas penuh: semua fitur yang dapat dibuka lewat objek 3D wajib dapat diakses dengan fungsionalitas setara di Mode Cepat (2D).

## Review Focus
1. Pengguna belum login yang berinteraksi dengan Pintu Kelas atau Loker: modal harus menampilkan status tamu secara elegan dengan tombol aksi masuk akun (`/masuk`), bukan unhandled error atau blank modal.
2. Pengguna yang mencoba masuk melalui pintu kelas yang belum diikutinya: pintu wajib menampilkan gembok `TERKUNCI` dan alur input kode kelas langsung berhasil mendaftarkan pengguna dan membuka pintu.
3. Pergantian bingkai avatar pada cermin: perubahan `activeFrameId` harus tersimpan ke database pengguna dan langsung terlihat pada kartu identitas profil.
4. Input sanitasi dan validasi Zod pada Server Action pengubahan bio profil dan klaim kode kelas.
5. Tombol aksi tidak boleh ada yang sekadar dekorasi: setiap tombol di modal harus memicu navigasi atau mutasi nyata.

---

### Task 1: Server Actions untuk Objek Interaktif (TDD)
**Files:**
- Create: `src/lib/classroom/object-actions.ts`
- Create: `tests/unit/object-actions.test.ts`
- Modify: `src/lib/classroom/types.ts`

- [x] Definisikan interface data objek di `src/lib/classroom/types.ts` (`DoorAccessStatus`, `LokerProfileData`, `CosmeticItem`, `CerminCatalogData`).
- [x] Buat pengujian unit di `tests/unit/object-actions.test.ts` untuk skenario:
  - Verifikasi pintu kelas untuk anggota vs non-anggota vs belum login.
  - Pengambilan data loker profil untuk pengguna terautentikasi vs tamu.
  - Pembaruan bio loker dengan validasi string.
  - Pengambilan katalog bingkai cermin dan pembaruan `activeFrameId`.
- [x] Implementasikan Server Actions di `src/lib/classroom/object-actions.ts`:
  - `getPintuKelasAccess(classCode: string)`
  - `getLokerProfile()`
  - `updateLokerBio(bio: string)`
  - `getCerminCosmetics()`
  - `updateUserActiveFrame(frameId: string | null)`
- [x] Jalankan `npm test` dan pastikan seluruh pengujian lulus.

---

### Task 2: Seeder & Katalog Kosmetik Database
**Files:**
- Create: `src/lib/db/seed-cosmetics.ts`
- Modify: `src/lib/db/index.ts`

- [x] Buat fungsi utilitas `ensureCosmeticsSeeded()` untuk memastikan tabel `AvatarFrame` dan `ProfileEffect` memiliki katalog standar bertema "Sekolah Tengah Malam":
  - Frame 1: `frame-caution` (Kuning Rambu Neon BAZMA)
  - Frame 2: `frame-cyan` (Terminal SIJA Cyan)
  - Frame 3: `frame-fluor` (Neon Kehijauan Lorong)
  - Frame 4: `frame-chrome` (Krom Klasik Retro)
  - Effect 1: `effect-glow` (Dengung Cahaya Tabung)
  - Effect 2: `effect-scanline` (Pendar Tabung CRT)
- [x] Panggil seeder secara aman saat katalog diakses jika database masih kosong.
- [x] Tambahkan unit test untuk memastikan seeder tidak menduplikasi data yang sudah ada.

---

### Task 3: Integrasi Modal Objek 3D (`WorldModals`)
**Files:**
- Modify: `src/components/world/world-modals.tsx`

- [x] Hubungkan **Modal Pintu Kelas**:
  - Ambil status akses kelas via `getPintuKelasAccess("SIJA-10A")`.
  - Jika anggota: tampilkan badge hijau `TERBUKA`, info meja siswa, dan tombol `MASUK KE RUANG KELAS`.
  - Jika bukan anggota: tampilkan badge merah `TERKUNCI`, formulir input kode kelas inline yang memanggil `joinClassByCode`, serta auto-refresh status setelah berhasil.
- [x] Hubungkan **Modal Loker**:
  - Ambil data profil via `getLokerProfile()`.
  - Tampilkan nama tampilan, username, bio, dan daftar kelas yang diikuti.
  - Sediakan tombol edit bio inline yang langsung memutasi database.
  - Jika belum login: sediakan link tombol langsung menuju `/masuk`.
- [x] Hubungkan **Modal Cermin**:
  - Ambil katalog dari `getCerminCosmetics()`.
  - Tampilkan preview bingkai avatar dan efek profil katalog.
  - Tambahkan tombol `TERAPKAN BINGKAI KE PROFIL` yang memanggil `updateUserActiveFrame` dengan notifikasi sukses.
- [x] Hubungkan **Modal Mading & Perpustakaan**:
  - Pastikan tautan tombol navigasi langsung membuka halaman `/mading` dan `/perpustakaan`.

---

### Task 4: Sinkronisasi Kontrol Spasial di Dalam Kelas (`/kelas/[id]`)
**Files:**
- Modify: `src/components/classroom/classroom-tabs-view.tsx`

- [x] Sinkronkan tab Papan Tulis (Pengumuman), Papan Diskusi, dan Rak Materi agar memiliki data kontekstual yang terhubung ke kelas yang sedang aktif.
- [x] Tambahkan tombol aksi cepat di header kelas untuk beralih kembali ke penjelajahan lorong sekolah 3D di `/dunia`.

---

### Task 5: Paritas Akses di Mode Cepat (2D)
**Files:**
- Modify: `src/app/(dashboard)/profil/page.tsx`
- Modify: `src/components/classroom/join-class-form.tsx`

- [x] Tambahkan bagian "Cermin Kosmetik & Bingkai Avatar" di halaman `src/app/(dashboard)/profil/page.tsx` agar pengguna Mode Cepat 2D dapat memilih dan mengubah bingkai avatar tanpa harus masuk ke dunia 3D.
- [x] Verifikasi bahwa formulir gabung kelas di Mode Cepat dan di Modal 3D bekerja secara konsisten.

---

### Task 6: Verifikasi Kualitas, Typecheck, Linter, dan Impeccable Audit
**Files:**
- Test: `tests/unit/object-actions.test.ts`

- [x] Jalankan `npm test` dan pastikan seluruh test suite (unit tests baru dan lama) lulus 100%.
- [x] Jalankan `npm run typecheck` dan `npm run lint`.
- [x] Jalankan `npx impeccable detect src/` untuk memastikan tidak ada anti-pattern UI yang diperkenalkan.
- [x] Jalankan `npm run build` untuk memverifikasi kompilasi produksi Next.js.
