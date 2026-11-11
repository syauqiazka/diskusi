# Rencana Implementasi: Tahap 7 — DM Berbasis Meja & Inbox Mode Cepat (2D)

## Tujuan
Menyempurnakan sistem Direct Message (DM) Intra-Kelas dengan menghadirkan rute mandiri Mode Cepat (`/pesan`), panel percakapan lengkap, daftar percakapan aktif per kelas, pemilih kontak rekan sekelas, dan sinkronisasi dua arah dengan interaksi meja spasial 3D (`ClassroomModals`).

## Analisis Desain & Aturan (DESIGN.md, WORLD.md, rancangan.md)
1. **Aturan Keanggotaan DM (Ketat di Server)**:
   - DM hanya diizinkan antar dua pengguna yang terdaftar di kelas yang sama.
   - Pengecekan dilakukan di server pada setiap operasi: pengambilan daftar, pembukaan obrolan, dan pengiriman pesan.
2. **Visual & Gaya UI (DESIGN.md)**:
   - Palet warna: `--night` (#0B0D12), `--fluor` (#D4E0D2), `--caution` (#F2C200), `--neon-cyan` (#00F5D4), `--ok` (#00E599), `--alert` (#FF3B30).
   - Tipografi: HUD/Monospace (VT323, JetBrains Mono) untuk metadata/waktu/nomor meja; Sans (Instrument Sans) untuk isi teks pesan; Display (Anton) untuk header.
   - Tanpa emoji di antarmuka (menggunakan ikon SVG dari `lucide-react`).
3. **Paritas Fitur 2D**:
   - Seluruh interaksi chat yang dapat dilakukan di meja 3D harus dapat diakses melalui `/pesan` dan denah kelas 2D di `/kelas/[id]`.

## Rincian Langkah Implementasi
- **Task 1**: Server Action `getUserConversations` dan `getClassmatesForDm` di `src/lib/chat/actions.ts`.
- **Task 2**: Unit Test di `tests/unit/chat-actions.test.ts` untuk memverifikasi logika daftar percakapan dan pemfilteran sekelas.
- **Task 3**: Halaman Mode Cepat `/pesan` (`src/app/(dashboard)/pesan/page.tsx`) dengan tata letak split (inbox list & active chat panel).
- **Task 4**: Dialog "Kirim Pesan Baru" untuk memilih rekan sekelas yang belum diajak ngobrol.
- **Task 5**: Navigasi platform di `src/components/layout/dashboard-nav.tsx` ditambahkan rute `[05] PESAN KELAS`.
- **Task 6**: Verifikasi kualitas (Vitest, Typecheck, ESLint, Impeccable, Next.js Turbopack build).

