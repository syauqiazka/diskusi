# Gabungkan Aset & Lingkungan Realtime 3D SMK TI BAZMA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menggabungkan seluruh aset visual (AI Studio PNG), dokumen denah, matematika elevasi/kawasan, interior sekolah 3 lantai dengan 26 meja per kelas, sistem waktu realtime (pagi, siang, sore, malam), dan fisika pergerakan dari repo unduhan ke dalam platform web Next.js `d:\diskusi`.

**Architecture:** Mengadaptasi struktur modular Three.js / React Three Fiber ke Next.js App Router dengan pemisahan library matematika kawasan (`src/lib/world/`), komponen 3D instanced rendering (`src/components/world/campus/` & `src/components/world/environment/`), penyatuan state player physics & collision di `FirstPersonController`, serta penghubungan interaksi 3D dengan Server Action dan modal 2D retro-liminal.

**Tech Stack:** Next.js 16 (App Router), React 19, Three.js 0.187, @react-three/fiber 9.8, @react-three/drei 10.7, Zustand 5, Tailwind CSS v4, Lucide React, Vitest.

**Spec:** `docs/denah-konseptual-sekolah.md`, `design/refs/CAMPUS-LAYOUT.md`, `design/refs/FLOOR-STRUCTURE.md`, `design/refs/BUILDING-FACILITIES.md`, `DESIGN.md`, `WORLD.md`.

## Global Constraints

- Sesuai aturan: JANGAN MENIMPA atau mengubah `DESIGN.md` atau `design/refs/`.
- Tidak ada emoji di antarmuka (gunakan SVG / Lucide React).
- Palet warna konsisten dengan token: `--night: #0B0D12`, `--fluor: #E9F2E3`, `--caution: #F2C200`, `--neon-cyan: #5CE1FF`, `--neon-pink: #FF3B81`.
- Mode Cepat (2D) tetap 100% berfungsi mandiri sebagai fallback jika WebGL gagal atau dimatikan (`fastMode`).
- Batas ketinggian mata pemain: berdiri 1.6m, jongkok 0.9m. Kemiringan jalan maksimal `maxWalkableSlope = 0.45` (~24.2 derajat).
- Denah sekolah memuat tepat 3 Ruang Kelas, masing-masing memiliki tepat 26 meja dan kursi siswa.

## Review Focus

1. Ketersediaan file tekstur di folder `public/assets/aistudio/` dapat dimuat tanpa error 404 pada client canvas.
2. Elevasi bertingkat (Asrama 0.0m -> Lapangan -2.5m -> Plaza -9.0m) terhubung mulus oleh tangga dan talud batu kali tanpa pemain tembus lantai.
3. Interior 3 lantai gedung sekolah memiliki selasar L dan tangga U yang sinkron dan dapat dinaiki oleh pemain.
4. Raycast interaksi pada penanda 3D (pintu kelas, mading, perpustakaan, loker) membuka panel modal 2D retro-liminal yang terhubung ke Server Action.
5. Seluruh tes unit lama (73 tes) dan tes unit baru yang di-porting berjalan sukses tanpa kegagalan (100% PASS), serta lolos lint dan typecheck.

---

### Task 1: Salin Aset Gambar AI Studio & Dokumen Denah Konseptual

**Files:**
- Create: `public/assets/aistudio/image_4e9095b0.png`
- Create: `public/assets/aistudio/image_8ecc07ca.png`
- Create: `public/assets/aistudio/image_bc5e7a40.png`
- Create: `public/assets/aistudio/image_cb4aafda.png`
- Create: `public/assets/aistudio/image_e4efc7f8.png`
- Create: `docs/denah-konseptual-sekolah.md`

- [x] **Step 1: Buat direktori `public/assets/aistudio` dan salin 5 file gambar PNG**
- [x] **Step 2: Salin file `docs/denah-konseptual-sekolah.md` ke folder `docs/`**
- [x] **Step 3: Verifikasi keberadaan dan ukuran file hasil penyalinan**
- [x] **Step 4: Commit aset dan dokumen denah konseptual**

### Task 2: Porting Library Matematika & Tata Letak Kawasan (`src/lib/world/`)

**Files:**
- Create: `src/lib/world/campus-layout.ts`
- Create: `src/lib/world/campus-elevations.ts`
- Create: `src/lib/world/campus-palette.ts`
- Create: `src/lib/world/school-interior-layout.ts`
- Create: `src/lib/world/terrain.ts`
- Create: `src/lib/world/procedural-textures.ts`
- Create: `src/lib/world/label-budget.ts`
- Create: `src/lib/world/webgl-env.ts`
- Create: `tests/unit/campus-layout.test.ts`

- [x] **Step 1: Tulis unit test Vitest untuk verifikasi tata letak kampus dan elevasi (`tests/unit/campus-layout.test.ts`)**
- [x] **Step 2: Jalankan test dan konfirmasi kegagalan awal jika modul belum di-port**
- [x] **Step 3: Implementasikan modul-modul di `src/lib/world/` dengan import path Next.js `@/...`**
- [x] **Step 4: Jalankan `npm test tests/unit/campus-layout.test.ts` dan pastikan PASS**
- [x] **Step 5: Commit modul lib world**

### Task 3: Porting Sistem Waktu Realtime & Lingkungan Langit (`src/lib/world/time-of-day/` & Komponen)

**Files:**
- Create: `src/lib/world/time-of-day.config.ts`
- Create: `src/stores/use-time-of-day-store.ts`
- Create: `src/components/world/environment/time-of-day-environment.tsx`
- Create: `src/components/world/environment/sky-clouds.tsx`
- Create: `src/components/world/environment/time-of-day-debug-panel.tsx`
- Create: `tests/unit/time-logic.test.ts`

- [x] **Step 1: Tulis unit test Vitest untuk logika perhitungan waktu dan interpolasi pencahayaan (`tests/unit/time-logic.test.ts`)**
- [x] **Step 2: Implementasikan store `use-time-of-day-store.ts` dan konfigurasi `time-of-day.config.ts`**
- [x] **Step 3: Implementasikan komponen R3F `time-of-day-environment.tsx`, `sky-clouds.tsx`, dan `time-of-day-debug-panel.tsx`**
- [x] **Step 4: Jalankan `npm test tests/unit/time-logic.test.ts` dan pastikan PASS**
- [x] **Step 5: Commit modul waktu realtime**

### Task 4: Porting Komponen 3D Kawasan & Interior Sekolah

**Files:**
- Create: `src/components/world/campus/campus-terrain.tsx`
- Create: `src/components/world/campus/campus-grass.tsx`
- Create: `src/components/world/campus/sekolah-furniture.tsx`
- Create: `src/components/world/campus/sekolah-interior.tsx`
- Create: `src/components/world/campus/campus-blockout.tsx`

- [x] **Step 1: Implementasikan `campus-terrain.tsx` dan `campus-grass.tsx` menggunakan fungsi elevasi tanah**
- [x] **Step 2: Implementasikan `sekolah-furniture.tsx` (instanced rendering meja, kursi, komputer, rak server)**
- [x] **Step 3: Implementasikan `sekolah-interior.tsx` (lantai 1-3, sekat ruangan, pintu, tangga U)**
- [x] **Step 4: Implementasikan `campus-blockout.tsx` (gedung asrama 5 lantai, sekolah 3 lantai, atap limas, tangga lapangan, talud)**
- [x] **Step 5: Verifikasi typecheck modul kampus**
- [x] **Step 6: Commit komponen 3D kampus**

### Task 5: Penyatuan Kontrol Pemain, Fisika Gerak, & Interaksi Terpadu

**Files:**
- Create: `src/lib/world/movement.ts`
- Modify: `src/stores/use-world-store.ts`
- Create: `src/components/world/campus/campus-player-controller.tsx`
- Create: `src/components/world/campus/interactable-markers.tsx`
- Create: `src/components/world/campus/interaction-raycaster.tsx`
- Create: `tests/unit/player-movement.test.ts`

- [x] **Step 1: Tulis unit test Vitest untuk kalkulasi tabrakan AABB dan pijakan tangga (`tests/unit/player-movement.test.ts`)**
- [x] **Step 2: Porting logika fisika `movement.ts`**
- [x] **Step 3: Update `use-world-store.ts` agar mendukung state kamera (fps / inspect), cutaway, dan penanda interaktif**
- [x] **Step 4: Implementasikan `campus-player-controller.tsx`, `interactable-markers.tsx`, dan `interaction-raycaster.tsx`**
- [x] **Step 5: Sambungkan interaksi penanda 3D ke modal 2D `d:\diskusi` (Papan Tulis, Papan Diskusi, Rak Materi, Meja Siswa, Mading, Perpustakaan, Loker)**
- [x] **Step 6: Jalankan test dan pastikan PASS**
- [x] **Step 7: Commit sistem kontrol dan interaksi**

### Task 6: Integrasi Penuh ke Halaman `/dunia` & Verifikasi Akhir

**Files:**
- Modify: `src/components/world/world-container.tsx`
- Modify: `src/app/(dashboard)/dunia/page.tsx`

- [x] **Step 1: Pasang komponen kampus utuh (`CampusBlockout`, `CampusTerrain`, `CampusGrass`, `TimeOfDayEnvironment`, `CampusPlayerController`, `InteractableMarkers`) ke dalam `world-container.tsx`**
- [x] **Step 2: Pastikan sakelar HUD VHS, pause menu, dan fallback Mode Cepat 2D tetap berfungsi sempurna**
- [x] **Step 3: Jalankan seluruh suite tes unit (`npm test`)**
- [x] **Step 4: Jalankan `npm run lint` dan `npm run typecheck`**
- [x] **Step 5: Jalankan `npm run build` untuk memvalidasi kompilasi produksi Next.js**
- [x] **Step 6: Commit dan buat ringkasan penyelesaian**
