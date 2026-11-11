# SETUP.md: Memasang 5 skill dan memulai proyek

Perintah di bawah diambil dari README resmi tiap repo (dicek 11 Nov 2026). Jalankan di komputer Anda, di dalam folder proyek, bukan di chat ini. Contoh memakai **Claude Code**; varian Codex dicatat di tempatnya. Setelah memasang, tutup dan buka ulang agent agar skill termuat.

## 0. Persiapan
- Node.js 22 atau lebih baru (taste-skill butuh Node 22+). Cek: `node -v`
- Python 3 (dipakai skrip pencarian ui-ux-pro-max). Cek: `python3 --version`
- Chrome, Edge, atau Chromium terpasang (taste-skill dan impeccable memakainya untuk memeriksa halaman).
- Git, dan folder proyek yang sudah berisi `AGENTS.md`, `DESIGN.md`, `WORLD.md`, `docs/rancangan.md`, `design/refs/`.

## 1. Urutan pemasangan

### 1) superpowers: alur kerja
```
/plugin install superpowers@claude-plugins-official
```
Alternatif: `/plugin marketplace add obra/superpowers-marketplace` lalu `/plugin install superpowers@superpowers-marketplace`. Codex: buka `/plugins`, cari "superpowers", pilih Install Plugin. Jika memakai lebih dari satu agent, pasang terpisah di tiap agent.

### 2) anti-slop: pemeriksa akhir
```
npx antislop-ai
npx antislop-ai --mode during
```
Perintah pertama membuka installer interaktif (pilih skill, lokasi, agent). Perintah kedua menyimpan mode "during" supaya agent tidak bertanya tiap sesi; pakai `--mode after` bila ingin mode audit. Alternatif plugin Claude Code:
```
/plugin marketplace add https://github.com/miqdadbadjuber/anti-slop
/plugin install antislop@anti-slop
```
Perhatian: nama `antislop` di npm adalah paket lain. Gunakan persis `antislop-ai`. Pasang skill `antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, dan `antislop-layoutmobile`. `antislop-code` opsional.

### 3) ui-ux-pro-max: kecerdasan desain
```
npm install -g ui-ux-pro-max-cli
uipro init --ai claude
```
Atau tanpa instal global: `npx ui-ux-pro-max-cli init --ai claude`. Codex: `uipro init --ai codex`. Alternatif plugin Claude Code:
```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```
Pembuat design system-nya bisa dijalankan langsung (opsional, untuk riset warna dan font):
```
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "education forum community" --design-system -p "Sekolah Tengah Malam"
```
Jangan memakai `--persist` kecuali Anda siap menggabungkan hasilnya dengan `DESIGN.md` (lihat bagian Konflik).

### 4) impeccable: kosakata desain dan peninjauan
```
npx impeccable install
```
Jalankan dari akar proyek, terima tawaran "design hook", lalu muat ulang agent. Setelah itu: `/impeccable init` (di Codex: `$impeccable init`). Alternatif Claude Code: `/plugin marketplace add pbakaus/impeccable`, lalu buka `/plugin` dan pasang Impeccable. Detektor tanpa agent: `npx impeccable detect src/`.

### 5) taste-skill: arah seni dan cek di browser
```
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```
Alternatif Claude Code: `/plugin marketplace add Leonxlnx/taste-skill` lalu `/plugin install taste-skill@taste-skill`. Codex: `codex plugin marketplace add Leonxlnx/taste-skill` lalu `codex plugin add taste-skill@taste-skill`.

## 2. Konflik yang harus diantisipasi

| Skill | Risiko | Penanganan |
|---|---|---|
| impeccable | Perintah `/impeccable document` menulis `DESIGN.md`, dan `/impeccable init` menulis `PRODUCT.md`. Bisa menimpa `DESIGN.md` Anda. | Commit `DESIGN.md` ke Git dulu. Jalankan `init` saja. Jangan jalankan `document` kecuali Anda ingin menggantinya, dan periksa diff-nya. |
| taste-skill | Versi 2.5 berfokus pada situs perusahaan/landing page (mulai dari `starter.html`, satu bagian per layar). Bukan untuk panel aplikasi atau dunia 3D. | Pakai hanya untuk landing page dan layar jeda. Untuk dunia 3D dan panel app, jangan dipakai. |
| ui-ux-pro-max | Generator-nya bisa menyarankan gaya yang bertentangan dengan tema malam (contoh keluarannya memuat anti-pola seperti "Dark mode" dan "neon" untuk produk lain). Opsi `--persist` membuat folder `design-system/` terpisah. | Anggap saran sebagai masukan. Jika bertentangan dengan `DESIGN.md`, `DESIGN.md` menang. Gunakan terutama untuk panel 2D, aksesibilitas, dan pola komponen. Ada panduan stack Three.js yang berguna untuk dunia 3D. |
| anti-slop | Hanya filter, tidak menentukan arah. Hasil hambar berarti arah di `DESIGN.md` kurang jelas, bukan skill-nya rusak. | Biarkan membaca `DESIGN.md`. Jalankan Delivery Gate sebelum menyatakan halaman selesai. |
| superpowers | Mewajibkan brainstorm dan rencana sebelum kode; terasa lambat untuk perubahan kecil. | Wajar untuk fitur besar. Untuk perbaikan kecil, minta agent langsung mengerjakan. |

Aturan emas: arah visual ditentukan `DESIGN.md` dan `WORLD.md`. Skill lain hanya membantu menjalankan, meninjau, dan menyaring.

## 3. Keamanan pemasangan
Skill dan hook menjalankan skrip dengan izin Anda. Sebelum menerima hook (terutama impeccable) atau menyetujui plugin, baca apa yang dipasang. Gunakan hanya sumber resmi di atas, dan periksa nama paket (`antislop-ai`, `ui-ux-pro-max-cli`). Mode `live` impeccable hanya untuk checkout lokal, jangan dipasang ke situs yang sudah dirilis.

## 4. Urutan kerja per halaman
1. superpowers: brainstorm, lalu rencana tertulis.
2. Landing page: taste-skill + ui-ux-pro-max. Panel app: ui-ux-pro-max saja.
3. Dunia 3D: ikuti `WORLD.md` (tahap 1 dulu).
4. `/impeccable critique` lalu `/impeccable audit`, kemudian perbaiki.
5. anti-slop: Delivery Gate (PASS/FAIL).
6. `/impeccable polish` sebagai lapis akhir, lalu cek di browser (HP dan desktop).

## 5. Prompt pembuka (tempel ke agent setelah semua terpasang)

### Tahap 1: fondasi
```
Baca AGENTS.md, DESIGN.md, WORLD.md, docs/rancangan.md, dan semua gambar di design/refs/.
Gunakan skill superpowers: mulai dengan brainstorm singkat lalu tulis rencana untuk
TAHAP 1 (Fondasi) di bagian 10 dokumen rancangan: setup Next.js (App Router) + TypeScript +
Tailwind + shadcn/ui, Prisma + Neon, autentikasi, layout dasar, dan token warna/font dari DESIGN.md.
Jangan membuat dunia 3D atau fitur lain dulu. Tunggu persetujuan saya atas rencana sebelum menulis kode.
```

### Tahap 2 (dunia 3D solo, setelah fondasi berjalan)
```
Baca WORLD.md dan DESIGN.md. Kerjakan "Tahap 1: Dunia solo" di WORLD.md: lorong sekolah low-poly,
kontrol first-person (jalan, lari, jongkok), raycast interaksi, HUD ala VHS, efek pasca-proses,
layar jeda dengan sakelar ON/OFF, dan Mode Cepat 2D. Pintu kelas membuka panel 2D dengan data dummy.
Gunakan superpowers untuk rencana dan tes, ui-ux-pro-max untuk pola panel dan aksesibilitas.
Jangan pakai taste-skill di sini. Setelah selesai, jalankan impeccable critique/audit dan
anti-slop Delivery Gate, uji di browser (HP dan desktop), lalu laporkan hasil dan fps.
```

### Landing page (kapan saja setelah tahap 1)
```
Bangun bagian landing di bawah layar jeda sesuai DESIGN.md bagian 7. Gunakan taste-skill dan
ui-ux-pro-max. Arah dari DESIGN.md menang jika ada konflik. Jalankan anti-slop Delivery Gate
dan impeccable audit sebelum menyatakan selesai.
```