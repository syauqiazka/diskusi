# Rencana Implementasi: Tahap 8 — Multiplayer dan Presence Real-Time

## Tujuan
Menghadirkan representasi kehadiran (presence) siswa secara real-time di ruang kelas virtual 3D dan Mode Cepat 2D, termasuk status lampu meja menyala, sosok avatar siswa di meja, sinkronisasi posisi pemain lain dalam ruang kelas (throttling maks 10Hz), dan endpoint autentikasi token Ably server-side yang aman.

## Aturan & Batasan Spesifikasi (AGENTS.md, WORLD.md, rancangan.md)
1. **Keamanan Token Real-time**:
   - Token Ably dibuat server-side di Route Handler Next.js (`/api/realtime/auth`) dengan verifikasi sesi Better Auth.
   - Hak akses token (capabilities) dibatasi secara ketat hanya pada channel kelas yang diikuti pengguna (`classroom:${classId}`).
   - Rahasia API Key hanya berada di server environment variable, tidak pernah bocor ke client.
2. **Anggaran Performa & Throttling (WORLD.md & AGENTS.md)**:
   - Posisi multiplayer dikirim maksimal 10 kali per detik (interval 100ms) dan hanya untuk pengguna di ruangan kelas yang sama.
   - Gerakan avatar pemain lain diinterpolasi secara halus di client (lerp).
   - Lorong utama tidak berbagi posisi multiplayer (hanya solo).
   - Batasi jumlah pemain aktif per ruangan maksimal 30 orang.
3. **Representasi Visual Spasial**:
   - Siswa yang online: lampu meja menyala terang (emissive `--fluor`/`--caution`) dan sosok siluet siswa duduk di kursi mejanya.
   - Siswa yang offline: lampu meja mati/redup, kursi meja kosong.
4. **Graceful Fallback**:
   - Kegagalan koneksi atau ketiadaan Ably API Key tidak boleh merusak fungsi forum, materi, chat, maupun navigasi 2D.
   - Mode Cepat (2D) menampilkan dot presence online/offline yang konsisten.

## Rincian Langkah Implementasi
- **Task 1**: Pemasangan dependensi `ably` (dengan pencatatan tertulis) dan Route Handler server-side `/api/realtime/auth`.
- **Task 2**: Utilitas real-time client & Presence Provider (dengan throttling 10Hz dan fallback offline) di `src/lib/realtime/`.
- **Task 3**: Unit test Vitest untuk:
  - Throttler posisi (maks 10 update/detik).
  - Parser hak akses token server-side.
  - Presence state reducer.
- **Task 4**: Sinkronisasi Presence Meja & Avatar 3D di `ClassroomScene`:
  - Lampu meja dinamis (menyala jika siswa online).
  - Avatar 3D siswa duduk di meja saat online.
  - Sinkronisasi avatar siswa lain yang sedang berjalan di dalam kelas dengan lerp.
- **Task 5**: Sinkronisasi Presence di Mode Cepat 2D (`ClassroomTabsView`):
  - Indikator status presence live di denah meja 2D.
- **Task 6**: Verifikasi kualitas menyeluruh (Vitest, Typecheck, ESLint, Impeccable, dan Next.js Turbopack build).
- **Task 7**: Git Commit Tahap 8.

