# Fase 5: Kelas Virtual dan Meja 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun interior ruang kelas virtual 3D di `/dunia/kelas/[id]` dengan penataan 30 meja murid modular (Standard-30) yang terhubung ke data `seatIndex` anggota kelas, raycast interaksi meja (<2.5m) yang memicu kartu profil siswa dan alur DM intra-kelas, objek kelas (papan tulis pengumuman, papan diskusi, rak materi, meja guru, pintu keluar ke lorong), serta integrasi paritas 2D penuh.

**Architecture:**
- **Spatial Sub-Route & Server Authorization**: `src/app/(dashboard)/dunia/kelas/[id]/page.tsx` memvalidasi hak akses keanggotaan di server sebelum memuat canvas 3D. Bukan anggota tidak dapat merender interior kelas.
- **Classroom 3D Canvas (`ClassroomContainer`)**: Canvas R3F khusus ruang kelas dengan boundary tabrakan fisik kelas, kontrol FPS, raycast detector, pasca-proses VHS adaptif, dan fallback otomatis ke Mode Cepat 2D (`/kelas/[id]`).
- **30 Meja Siswa Spasial (`ClassroomScene`)**: Grid 30 meja murid yang menghadap ke papan tulis depan. Meja berpenghuni memiliki lampu meja menyala dan label nama; meja kosong tampak gelap.
- **Classroom Modals (`ClassroomModals`)**: Lapisan modal 2D retro-liminal saat menekan `E` pada meja siswa (kartu profil + tombol DM intra-kelas), papan tulis, papan diskusi, rak materi, dan pintu keluar.
- **Classroom Math Utility (`classroom-math.ts`)**: Utilitas murni boundary collision clamp dan pemetaan posisi 30 meja siswa yang diuji via Vitest (TDD).

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing, Zustand, Tailwind CSS, Lucide-react, Vitest.

**Spec:**
- `docs/rancangan.md` (Bagian 4.1 s.d. 4.4, Bagian 5, dan Tahap 5 Bagian 11)
- `WORLD.md` (Tahap 3: Dalam kelas — papan tulis, papan diskusi, rak materi, meja murid, alur DM)
- `DESIGN.md` (Token warna `--night`, `--fluor`, `--caution`, `--neon-cyan`, tipografi VT323 & Anton, tanpa emoji)
- `PRODUCT.md` (Fasilitas Ruang Kelas SMK TI BAZMA & aturan keamanan DM intra-kelas)

## Global Constraints
- Token warna wajib dari `DESIGN.md`: `--night` (`#0B0D12`), `--fluor` (`#E9F2E3`), `--caution` (`#F2C200`), `--neon-cyan` (`#5CE1FF`), `--alert` (`#E0412F`), `--ok` (`#4FD08A`).
- Tipografi: `VT323` (HUD/label sistem), `Anton` (papan nama/rambu), `Instrument Sans` (teks bacaan modal), `JetBrains Mono` (status meja).
- Dilarang memakai emoji sebagai ikon atau elemen antarmuka (wajib SVG atau Lucide-react).
- Otorisasi server ketat: pemeriksaan keanggotaan kelas wajib dilakukan di server sebelum membuka ruang kelas atau memulai pesan DM.
- DM intra-kelas: hanya diizinkan antar sesama anggota yang berada di kelas yang sama.

## Review Focus
1. Pengguna non-anggota yang membuka URL `/dunia/kelas/[id]` secara langsung: Server Component wajib menampilkan layar akses ditolak tanpa memuat canvas 3D.
2. Boundary tabrakan ruang kelas: pemain tidak boleh dapat menembus dinding kelas atau jendela keluar ke ruang hampa.
3. Penataan 30 meja murid (Standard-30): posisi meja harus teratur rapi tanpa tumpang tindih dan nomor meja `#1` s.d. `#30` tepat berkorespondensi dengan `seatIndex` 0 s.d. 29.
4. Interaksi meja siswa milik diri sendiri: kartu profil tidak boleh menampilkan tombol untuk mengirim DM ke diri sendiri.
5. Tombol keluar ke lorong di belakang kelas: harus mengembalikan pemain ke lorong sekolah 3D di `/dunia` secara mulus.

---

### Task 1: Utilitas Matematika Ruang Kelas & Grid 30 Meja (TDD)
**Files:**
- Create: `src/lib/classroom/classroom-math.ts`
- Create: `tests/unit/classroom-math.test.ts`

- [x] Definisikan batasan ruang kelas `CLASSROOM_BOUNDS` (minX, maxX, minZ, maxZ).
- [x] Implementasikan fungsi `clampClassroomPosition(x, z)`.
- [x] Implementasikan fungsi `calculateDeskGridPosition(seatIndex: number)`: menghitung koordinat `[x, y, z]` 30 meja siswa dalam formasi 5 kolom x 6 baris.
- [x] Buat unit test di `tests/unit/classroom-math.test.ts` untuk menguji batasan tabrakan dan keunikan posisi setiap meja siswa (0-29).
- [x] Jalankan `npm test` dan pastikan seluruh pengujian lulus.

---

### Task 2: 3D Scene Ruang Kelas & 30 Meja Modular (`ClassroomScene`)
**Files:**
- Create: `src/components/world/classroom-scene.tsx`
- Create: `src/components/world/classroom-materials.ts`

- [x] Definisikan material interior ruang kelas di `classroom-materials.ts`:
  - Lantai ubin kelas dengan grid halus.
  - Dinding beton krem-kelabu dengan lis kayu.
  - Papan tulis hijau tua dengan bingkai kayu di dinding depan.
  - Jendela kaca besar di sisi kiri dengan pemandangan malam berkabut.
  - Meja guru kayu di depan kelas.
  - Meja siswa kayu-besi dengan lampu meja kecil dan pelat nomor.
- [x] Bangun komponen `ClassroomScene`:
  - Geometri ruangan kelas (lantai, dinding, plafon, jendela, lampu neon tabung).
  - Papan Tulis di depan (interactable: `blackboard`).
  - Papan Diskusi di dinding kanan (interactable: `class-board`).
  - Rak Materi di pojok kelas (interactable: `class-rack`).
  - Meja Guru di depan (interactable: `teacher-desk`).
  - Pintu Keluar di belakang (interactable: `exit-door`).
  - 30 Meja Siswa modular terpetakan dengan data anggota kelas:
    - Meja berpenghuni: lampu meja menyala (`#F2C200`), label nama siswa di atas meja, dan raycast interactable `desk-${seatIndex}` dengan prompt `[E] LIHAT MEJA @${name}`.
    - Meja kosong: lampu padam, label `[KOSONG]`.

---

### Task 3: Modal Interaksi Ruang Kelas (`ClassroomModals`)
**Files:**
- Create: `src/components/world/classroom-modals.tsx`

- [x] Implementasikan modal **Kartu Profil Meja Siswa**:
  - Menampilkan nama, username, avatar dengan bingkai katalog cermin, dan status meja.
  - Tombol aksi **"Kirim Pesan" (DM)**: memverifikasi keanggotaan kelas yang sama via `verifySameClassMembership`, membuka dialog input pesan pribadi intra-kelas, dan mengirim pesan.
  - Jika meja adalah milik pengguna sendiri: sembunyikan tombol DM dan tampilkan badge `MEJA ANDA`.
- [x] Implementasikan modal **Papan Tulis Kelas** (Pengumuman ter-pin).
- [x] Implementasikan modal **Papan Diskusi Kelas** (Preview topik diskusi kelas + link ke `/kelas/[id]`).
- [x] Implementasikan modal **Rak Materi Kelas** (Preview modul ajar kelas + link ke `/kelas/[id]`).
- [x] Implementasikan modal **Pintu Keluar** (Konfirmasi kembali ke lorong sekolah 3D `/dunia`).

---

### Task 4: Kontainer 3D Ruang Kelas (`ClassroomContainer`)
**Files:**
- Create: `src/components/world/classroom-container.tsx`

- [x] Bangun kontainer WebGL Canvas R3F khusus ruang kelas:
  - Posisi kamera awal di belakang kelas (menghadap ke depan papan tulis).
  - Kontrol first-person dengan batasan pergerakan ruang kelas (`clampClassroomPosition`).
  - Raycast detector terhubung ke objek kelas dan meja siswa (<2.5m).
  - Efek pasca-proses VHS adaptif.
  - Lapisan HUD retro (PLAY/PAUSE, crosshair, timer sesi, prompt `[E] AKSI`).
  - Lapisan modal `ClassroomModals`.
  - Kontrol sentuh untuk perangkat mobile.
  - Fallback otomatis ke Mode Cepat 2D `/kelas/[id]` jika WebGL gagal atau `fastMode` aktif.

---

### Task 5: Halaman Sub-Rute Spasial `/dunia/kelas/[id]` & Integrasi Navigasi
**Files:**
- Create: `src/app/(dashboard)/dunia/kelas/[id]/page.tsx`
- Modify: `src/components/world/world-modals.tsx`
- Modify: `src/components/classroom/classroom-tabs-view.tsx`

- [x] Buat rute Server Component `src/app/(dashboard)/dunia/kelas/[id]/page.tsx`:
  - Validasi keanggotaan pengguna via `getClassDetails(id)`.
  - Jika tidak berhak: tampilkan tampilan `Akses Kelas Ditolak`.
  - Jika berhak: muat `ClassroomContainer` secara dinamis (SSR false).
- [x] Perbarui tombol di Modal Pintu Lorong (`world-modals.tsx`) agar tombol `[E] MASUK KE DALAM KELAS` mengarah ke `/dunia/kelas/[classId]`.
- [x] Perbarui tab `ClassroomTabsView` di Mode Cepat 2D agar menyediakan opsi `[00] JELAJAHI RUANG KELAS 3D`.

---

### Task 6: Pengujian Unit, Typecheck, Linter, dan Build Verifikasi
**Files:**
- Test: `tests/unit/classroom-math.test.ts`

- [x] Jalankan `npm test` dan pastikan seluruh test suite (unit tests baru dan lama) lulus 100%.
- [x] Jalankan `npm run typecheck` dan `npm run lint`.
- [x] Jalankan `npx impeccable detect src/`.
- [x] Jalankan `npm run build` untuk memverifikasi kompilasi produksi Next.js.
