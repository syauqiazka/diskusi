# SMK TI BAZMA — Identitas, Sumber, dan Prinsip Desain

## Identitas

- **Nama:** SMK TI BAZMA
- **Kawasan:** gedung sekolah dan gedung asrama dalam satu area
- **Program keahlian yang tampak di referensi:** SIJA (terlihat pada ruang praktik Lab Komputer)

## Sumber Resmi

- Profil dan fasilitas: https://smktibazma.sch.id/about
- Bagian yang dipakai: **Fasilitas** (enam fasilitas sekolah)

## Sumber Referensi Lain

- Gambar satelit kawasan → `images/campus-satellite.png`
- Denah/struktur lantai asrama dan sekolah → lihat `FLOOR-STRUCTURE.md`

## Tujuan

Membangun lingkungan 3D yang merepresentasikan kawasan SMK TI BAZMA, dengan tata letak yang sesuai referensi, karakter bangunan yang realistis, dan fasilitas yang terinspirasi dari foto resmi sekolah.

## Pembagian Fungsi Sumber

| Sumber | Dipakai untuk |
|---|---|
| Gambar satelit | Tata letak kawasan |
| Foto resmi website | Detail interior fasilitas |
| Denah/struktur lantai | Struktur bangunan |

## RULES — SMK TI BAZMA CAMPUS REFERENCE

Gunakan seluruh file dalam `design/refs/` sebagai sumber utama pembangunan lingkungan sekolah 3D.

### Prioritas Referensi
1. `CAMPUS-LAYOUT.md` menjadi acuan tata letak kawasan.
2. `FLOOR-STRUCTURE.md` menjadi acuan jumlah dan struktur lantai.
3. `BUILDING-FACILITIES.md` menjadi acuan visual interior fasilitas.
4. `SMK-TI-BAZMA-REFERENCE.md` menjadi acuan identitas dan karakter sekolah.

### Struktur Bangunan
- Gedung asrama memiliki 5 lantai: B2, B1, LT 1, LT 2, LT 3.
- Gedung sekolah memiliki 3 lantai: LT 1, LT 2, LT 3.
- Pertahankan posisi relatif gedung sesuai referensi satelit.
- Pertahankan hubungan antara gerbang, turunan, lobby asrama, gedung asrama, dan gedung sekolah.

### Visual Facilities
Gunakan foto fasilitas resmi sebagai referensi bentuk ruangan, furnitur, pencahayaan, jendela, material, dan penataan interior.

Fasilitas yang terdokumentasi:
- Lab Komputer
- Ruang Rapat
- Ruang Konsultansi
- Ruang Kelas
- Perpustakaan
- Ruang Musik

### Batasan Akurasi
- Jangan mengarang denah ruangan dan mengklaimnya sebagai denah asli.
- Jangan menentukan lantai setiap fasilitas tanpa bukti.
- Jangan mengubah jumlah lantai.
- Jangan mengubah posisi relatif bangunan.
- Jika informasi tidak tersedia, tandai sebagai **DESAIN KONSEPTUAL**.
- Jangan membuat sekolah generik yang hanya mengambil nama SMK TI BAZMA.
