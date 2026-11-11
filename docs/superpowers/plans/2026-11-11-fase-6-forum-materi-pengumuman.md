# Fase 6: Forum, Materi, dan Pengumuman Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan model database, Server Actions, validasi Zod, dan antarmuka untuk Forum Diskusi (Mading Global & Papan Diskusi Kelas), Repositori Materi Belajar (Perpustakaan & Rak Materi), dan Pengumuman Kelas (Papan Tulis) berbasis arsitektur *single engine* (`classId` opsional), komentar bertingkat maksimal 3 level, voting, jawaban terbaik berpita `--ok`, serta otorisasi peran ketat di server.

**Architecture:**
- **Single Engine Content Models**: Model `Thread` dan `LearningMaterial` memiliki foreign key `classId` opsional (null = publik/global, non-null = privat kelas). Model `Announcement` terikat ke `classId` untuk papan tulis kelas. Model `Comment` memiliki relasi rekursif `parentId` dengan pembatasan kedalaman `depth <= 3`.
- **Server Actions & Permissions**: Otorisasi keanggotaan kelas diperiksa di server pada setiap operasi query dan mutasi data kelas privat. Peran `TEACHER` dan `ASSISTANT` berhak mengelola pengumuman dan materi kelas.
- **TDD & Zod Validation**: Seluruh input pengguna (judul, isi teks, kategori, komentar) divalidasi dengan skema Zod dan disanitasi sebelum disimpan ke database.
- **2D & 3D Parity**: Halaman `/mading` dan `/perpustakaan` membaca data publik, sedangkan ruang kelas 2D (`/kelas/[id]`) dan modal 3D (`ClassroomModals`) membaca data privat kelas.

**Tech Stack:** Next.js (App Router), TypeScript, Prisma ORM (Neon PostgreSQL), Better Auth, Zod, Tailwind CSS, Lucide-react, Vitest.

**Spec:**
- `docs/rancangan.md` (Bagian 6 s.d. 6.5, dan Tahap 6 Bagian 11)
- `AGENTS.md` (Aturan single engine `classId`, komentar maks 3 level, voting di kiri, jawaban terbaik `--ok`, validasi Zod server)
- `DESIGN.md` (Token warna `--night`, `--fluor`, `--caution`, `--neon-cyan`, `--ok`, pita jawaban terbaik, tanpa emoji)

## Global Constraints
- Token warna wajib dari `DESIGN.md`: `--night` (`#0B0D12`), `--fluor` (`#E9F2E3`), `--caution` (`#F2C200`), `--neon-cyan` (`#5CE1FF`), `--alert` (`#E0412F`), `--ok` (`#4FD08A`).
- Tipografi: `VT323` (label sistem/HUD), `Anton` (judul/kategori), `Instrument Sans` (isi bacaan), `JetBrains Mono` (status/kode).
- Tanpa emoji di antarmuka (wajib SVG atau Lucide-react).
- Komentar bertingkat maksimal 3 level (level 1 = komentar utama, level 2 = balasan, level 3 = balasan terdalam).
- Otorisasi server: pengguna bukan anggota tidak boleh membaca atau membuat thread/materi pada kelas privat.

## Review Focus
1. Upaya akses thread/materi kelas privat melalui manipulasi `classId` oleh pengguna yang bukan anggota: wajib ditolak di server dengan pesan error yang aman.
2. Batas nesting komentar: pembuatan komentar dengan `parentId` yang sudah mencapai depth level 3 tidak boleh membuat level 4.
3. Hak menandai jawaban terbaik (`isBestAnswer` pita `--ok`): hanya pemilik thread atau guru kelas yang berhak menetapkannya.
4. Validasi Zod terhadap payload kosong atau XSS attack vector (karakter berbahaya disanitasi).
5. Voting: pencegahan vote ganda atau nilai vote negatif yang tidak terkontrol.

---

### Task 1: Skema Prisma & Seeder Forum/Materi/Pengumuman
**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/db/seed-forum.ts`
- Modify: `src/lib/db/seed-cosmetics.ts`

- [ ] Tambahkan model `Thread`, `Comment`, `LearningMaterial`, dan `Announcement` ke `prisma/schema.prisma`.
- [ ] Tambahkan relasi balik pada model `User` dan `Class`.
- [ ] Buat utilitas `ensureForumAndMaterialsSeeded()` di `src/lib/db/seed-forum.ts` untuk inisialisasi data awal mading, materi terbuka, pengumuman kelas, dan materi kelas SIJA.
- [ ] Jalankan `npx prisma generate` untuk memperbarui Prisma Client.

---

### Task 2: Validasi Zod & Server Actions Forum Diskusi (TDD)
**Files:**
- Create: `src/lib/validations/forum.ts`
- Create: `src/lib/forum/actions.ts`
- Create: `tests/unit/forum-actions.test.ts`

- [ ] Buat skema validasi Zod `createThreadSchema`, `createCommentSchema`, dan `voteSchema` di `src/lib/validations/forum.ts`.
- [ ] Buat pengujian unit di `tests/unit/forum-actions.test.ts` (RED):
  - Validasi input thread dan pembersihan XSS.
  - Perhitungan nesting komentar (depth clamp maks 3).
  - Pembatasan hak akses thread privat kelas vs global.
  - Otorisasi penetapan jawaban terbaik.
- [ ] Implementasikan Server Actions di `src/lib/forum/actions.ts` (GREEN):
  - `getThreads({ classId?: string, category?: string, filter?: string })`
  - `getThreadDetail(threadId: string)`
  - `createThread(input: CreateThreadInput)`
  - `voteThread(threadId: string, delta: number)`
  - `createComment(input: CreateCommentInput)`
  - `markBestAnswer(commentId: string)`
- [ ] Jalankan `npm test` dan pastikan seluruh pengujian lulus.

---

### Task 3: Validasi Zod & Server Actions Materi dan Pengumuman (TDD)
**Files:**
- Create: `src/lib/validations/materials.ts`
- Create: `src/lib/materials/actions.ts`
- Create: `src/lib/announcements/actions.ts`
- Create: `tests/unit/material-actions.test.ts`

- [ ] Buat skema validasi Zod untuk materi dan pengumuman.
- [ ] Buat pengujian unit di `tests/unit/material-actions.test.ts` (RED).
- [ ] Implementasikan Server Actions di `src/lib/materials/actions.ts` dan `src/lib/announcements/actions.ts` (GREEN):
  - `getMaterials({ classId?: string, category?: string, query?: string })`
  - `createMaterial(input: CreateMaterialInput)` (otorisasi pengajar jika classId ada)
  - `getAnnouncements(classId: string)`
  - `createAnnouncement(input: CreateAnnouncementInput)` (otorisasi pengajar)
- [ ] Jalankan `npm test` dan pastikan seluruh pengujian lulus.

---

### Task 4: Integrasi Halaman Mading Global (`/mading`)
**Files:**
- Modify: `src/app/(dashboard)/mading/page.tsx`

- [ ] Hubungkan daftar thread mading ke Server Action `getThreads({ classId: undefined })`.
- [ ] Hubungkan form pembuatan topik baru dengan validasi Zod dan mutasi server `createThread`.
- [ ] Hubungkan voting ke `voteThread`.
- [ ] Tampilkan pita jawaban terbaik `--ok` (`#4FD08A`) pada thread yang sudah terselesaikan.

---

### Task 5: Integrasi Halaman Perpustakaan Terbuka (`/perpustakaan`)
**Files:**
- Modify: `src/app/(dashboard)/perpustakaan/page.tsx`

- [ ] Hubungkan daftar materi perpustakaan ke Server Action `getMaterials({ classId: undefined })`.
- [ ] Hubungkan pencarian teks dan filter format (PDF, DOCX, MD) ke query backend.

---

### Task 6: Integrasi Objek Kelas 2D & 3D (Papan Tulis, Diskusi, Rak Materi)
**Files:**
- Modify: `src/components/classroom/classroom-tabs-view.tsx`
- Modify: `src/components/world/classroom-modals.tsx`

- [ ] Sinkronkan tab Papan Tulis (Pengumuman), Papan Diskusi, dan Rak Materi di `ClassroomTabsView` ke data database kelas aktif.
- [ ] Sediakan form tambah pengumuman dan materi untuk pengajar kelas.
- [ ] Sinkronkan modal Papan Tulis, Papan Diskusi, dan Rak Materi di `ClassroomModals` agar memuat data dinamis kelas aktif.

---

### Task 7: Pengujian Unit, Typecheck, Linter, dan Build Verifikasi
**Files:**
- Test: `tests/unit/forum-actions.test.ts`
- Test: `tests/unit/material-actions.test.ts`

- [ ] Jalankan `npm test` dan pastikan seluruh pengujian lulus 100%.
- [ ] Jalankan `npm run typecheck` dan `npm run lint`.
- [ ] Jalankan `npx impeccable detect src/`.
- [ ] Jalankan `npm run build` untuk memverifikasi kompilasi produksi Next.js.

