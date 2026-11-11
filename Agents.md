# AGENTS.md

Panduan untuk coding agent (Claude Code, Codex, dll.) yang mengerjakan proyek ini.

## Proyek
Platform diskusi dan forum pembelajaran yang dikemas sebagai dunia sekolah 3D yang bisa dijelajahi (first-person): ruang kelas privat, diskusi global, berbagi materi, komentar, moderasi, chat pribadi real-time, profil kustom. Detail fitur ada di `docs/rancangan.md`, visual di `DESIGN.md`, dunia 3D di `WORLD.md`.

## Urutan baca wajib
1. `DESIGN.md`
2. `WORLD.md`
3. `docs/rancangan.md`
4. Gambar di `design/refs/`
Jangan membuat UI atau adegan 3D sebelum keempatnya dibaca.

## Stack
Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui + lucide-react, GSAP, PostgreSQL (Neon) + Prisma, Auth.js atau Better Auth, Ably (realtime + Presence), Cloudinary (gambar), Zod. Dunia 3D: three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, zustand, dan @react-three/rapier bila perlu. Opsional: TanStack Query, React Hook Form, react-easy-crop, lottie-react, Upstash Ratelimit, Resend.

## Cara kerja
- Kerjakan per tahap sesuai bagian 10 dokumen rancangan, dan tahap dunia 3D di `WORLD.md`. Fondasi forum dan chat (2D) harus berjalan sebelum multiplayer 3D.
- Fitur apa pun harus bisa dipakai lewat Mode Cepat (2D). Jangan membuat fitur yang hanya bisa diakses lewat dunia 3D.
- Satu fitur, satu cabang, satu pull request kecil.
- Sebelum menulis kode fitur baru: brainstorm singkat, tulis rencana, lalu implementasi bertahap dengan tes.
- Jangan menambah dependensi tanpa alasan tertulis.
- Jika spesifikasi ambigu, tanya dulu. Jangan menebak.

## Skill yang dipakai
Pasang dari README masing-masing repo (cara pasang berbeda per agent). Pembagian tugasnya:

| Skill | Dipakai untuk |
|---|---|
| obra/superpowers | Alur kerja: brainstorm, rencana, TDD, review sebelum selesai |
| Leonxlnx/taste-skill | Arah seni, referensi gambar, pengecekan di browser sebelum dianggap selesai |
| pbakaus/impeccable | Perintah polish dan bolder saat membangun; critique dan audit saat meninjau |
| nextlevelbuilder/ui-ux-pro-max-skill | Pilihan pola UI/UX, komponen, dan aksesibilitas |
| miqdadbadjuber/anti-slop | Pemeriksa akhir: tangkap tampilan dan teks generik khas AI |

Urutan pakai untuk setiap halaman UI:
1. `DESIGN.md` dan `WORLD.md` menentukan arah (ini yang utama).
2. superpowers: rencana.
3. taste-skill + ui-ux-pro-max: bangun.
4. impeccable (critique, audit) lalu anti-slop: tinjau.
5. Buka di browser (HP dan desktop), cek konsol, baru lapor selesai.

Jika saran skill bertentangan dengan `DESIGN.md`, ikuti `DESIGN.md`.

## Aturan kode
- Validasi semua input dengan Zod di server. Data dari client tidak dipercaya.
- Sanitasi konten buatan pengguna (XSS). Validasi file upload di server (JPG, PNG, WebP, maks 10 MB).
- Cek hak akses berdasarkan peran (platform: member, moderator, admin; kelas: pengajar, asisten, murid) di setiap Server Action dan Route Handler.
- `classId` opsional di Thread dan Material: terisi berarti konten kelas, kosong berarti diskusi global. Satu mesin untuk keduanya.
- Token Ably dibuat server dengan izin terbatas. Rahasia hanya di environment variable.
- Gambar disimpan di Cloudinary; database hanya menyimpan URL.
- Bingkai avatar dan efek profil hanya dari katalog.
- Daftar panjang (thread, komentar, chat) selalu paginasi atau infinite scroll.

## Aturan 3D
- Dunia 3D hanya lapisan navigasi. Data dan logika bisnis tetap di server dan UI 2D.
- DM hanya antar anggota kelas yang sama. Server memeriksa keanggotaan sebelum membuat Conversation atau menyimpan Message. Tidak cukup di client.
- Pemuatan area bertahap, aset dikompres (Draco, KTX2), instancing untuk objek berulang.
- Hormati anggaran performa di `WORLD.md`. Uji di HP menengah, bukan hanya di laptop.
- Fallback otomatis ke Mode Cepat bila WebGL gagal atau perangkat lemah.
- Posisi multiplayer dikirim terbatas (maks 10 kali per detik) dan hanya ke orang di ruangan yang sama.
- Jangan menyalin aset, logo, atau teks dari situs referensi.

## Aturan UI
- Semua warna dan font lewat token di `DESIGN.md`. Tidak ada warna hex acak di komponen.
- Tanpa emoji di antarmuka. Ikon dari lucide-react.
- Teks antarmuka berbahasa Indonesia, nada santai tapi jelas. Hindari kalimat klise (lihat bagian Hindari).
- Animasi GSAP hanya transform dan opacity, hormati `prefers-reduced-motion`.

## Definisi selesai
- [ ] Berjalan tanpa error di konsol
- [ ] Tampilan HP dan desktop dicek di browser (termasuk Mode Cepat)
- [ ] Dunia 3D diuji kontrol (jalan, jongkok, interaksi) dan fps
- [ ] Lolos lint dan typecheck
- [ ] Ada tes untuk logika penting (izin, validasi, moderasi)
- [ ] Lolos audit impeccable dan anti-slop
- [ ] Sesuai `DESIGN.md`

## Perintah
```bash
npm install
npx prisma migrate dev
npm run dev
npm run lint && npm run typecheck && npm test
```
(Sesuaikan setelah proyek dibuat.)

## Catatan pemasangan dan konflik skill
Perintah pemasangan lengkap ada di `SETUP.md`. Hal yang harus dipatuhi agent:
- **Jangan menimpa `DESIGN.md`.** Jangan jalankan `/impeccable document` atau perintah apa pun yang menulis `DESIGN.md` tanpa persetujuan eksplisit. `/impeccable init` (menulis `PRODUCT.md`) boleh.
- **taste-skill hanya untuk landing page dan layar jeda.** Jangan dipakai untuk panel aplikasi atau dunia 3D.
- **ui-ux-pro-max bersifat saran.** Jika rekomendasi (warna, gaya, anti-pola) bertentangan dengan `DESIGN.md`, ikuti `DESIGN.md`. Jangan memakai `--persist` tanpa persetujuan.
- **anti-slop** dijalankan dalam mode "during" dan Delivery Gate wajib lolos sebelum menyatakan UI selesai.
- Jangan memasang perangkat lunak di komputer pengguna. Jika dependensi (Node, Python, Chrome) kurang, minta pengguna memasangnya.