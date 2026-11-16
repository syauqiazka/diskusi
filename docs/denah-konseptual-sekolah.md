# Usulan Denah Revisi Interior Gedung Sekolah (SMK TI BAZMA)

**Status Dokumen:** Usulan Revisi Menunggu Persetujuan (`Tahap A & Tahap B belum diubah`)
**Keterangan Sumber:**
- **`source: 'user'` (Pemilik Proyek — Mengikat):** Penempatan lantai tertentu (`Ruang Server` & `Perpustakaan` di **LT 2**; `Ruang Robotik` di **LT 3**), jumlah total **`Ruang Kelas` = 3**, isi tiap kelas **tepat 26 meja siswa** (+ 26 kursi), serta adanya **`Kamar Mandi` di setiap lantai (LT 1, LT 2, LT 3)**.
- **`source: 'konseptual'` (Usulan):** Penempatan lantai bagi 3 Ruang Kelas, `Lab Komputer`, `Ruang Rapat`, `Ruang Konsultansi`, `Ruang Musik`, jumlah pasti unit `Kamar Mandi` (diusulkan 2 unit netral per lantai tanpa pemisahan putra/putri), posisi pintu, sekat, tata letak furnitur, serta Inti Tangga U.

---

## 1. Batas Footprint & Elevasi Mengikat (Tidak Diubah)

Mengacu pada `CAMPUS_LAYOUT.buildings.sekolah` (`basePosition: [22, -9.0, -22]`):

| Komponen | Koordinat Dunia X (m) | Koordinat Dunia Z (m) | Dimensi Luar (m) | Source |
|---|---:|---:|---:|---|
| Sayap Utara (`sekolah_wing_north`) | `8.0 .. 36.0` | `-35.5 .. -24.5` | `28.0 x 11.0` | `refs` |
| Sayap Timur (`sekolah_wing_east`) | `25.0 .. 36.0` | `-25.5 .. -3.5` | `11.0 x 22.0` | `refs` |

Elevasi lantai (`floorHeight = 3.4m`, tebal pelat `0.2m`, tinggi bersih ruangan `3.2m`):

| Lantai | Elevasi Pelat (`Y`) | Rentang Vertikal Ruang | Keterangan | Source |
|---|---:|---:|---|---|
| **LT 1** | `-9.0m` | `-9.0m .. -5.8m` | Sejajar `schoolGroundY`; akses langsung dari plaza selatan `-9.0m` | `konseptual` |
| **LT 2** | `-5.6m` | `-5.6m .. -2.4m` | Memuat `Perpustakaan` & `Ruang Server` (`user`) + `Ruang Kelas 1` & 2 KM | `user` / `konseptual` |
| **LT 3** | `-2.2m` | `-2.2m .. +1.0m` | Memuat `Ruang Robotik` (`user`) + `Ruang Kelas 2 & 3` + 2 KM | `user` / `konseptual` |

---

## 2. Verifikasi Rute Berjalan Loby (`0.0m`) -> Depan Sekolah (`-9.0m`)

Batas kemiringan berjalan pemain: `maxWalkableSlope = 0.45` (~24,2 derajat).

| Segmen Rute | Koordinat `(X, Z)` | Elevasi `Y` | Panjang & Beda Tinggi | Kemiringan | Status |
|---|---|---|---|---:|---|
| 1. Loby -> Simpang Turunan (`path_to_lobby`) | `(-7.0, 8.0) -> (0.0, 10.0)` | `0.0m -> 0.0m` | `7.28m`, `dY = 0.0m` | `0.00` | Aman (`refs`) |
| 2. Simpang -> Tepi Lapangan (`path_to_court`) | `(1.0, 8.8) -> (3.8, 3.2)` | `-0.1m -> -2.5m` | `6.26m`, `dY = -2.4m` | `0.38` | Aman (`<= 0.45`) |
| 3. Melintasi Pelataran Lapangan | `(3.8, 3.2) -> (13.0, -13.0)` | `-2.5m -> -2.5m` | Datar di pelataran | `0.00` | Aman (`konseptual`) |
| 4. Tangga Lapangan -> Plaza (`stairs_court_to_school`) | `(13.0, -13.0) -> (13.0, -21.5)` | `-2.5m -> -9.0m` | `8.50m`, `dY = -6.5m` (`20` anak tangga) | Tangga (`sampleStairCorridorHeight`) | Aman (lurus 4.4m) |
| 5. Plaza Sekolah -> Pintu Masuk (`path_to_school`) | `(13.0, -21.5) -> (13.0, -24.5)` | `-9.0m -> -9.0m` | `3.00m`, `dY = 0.0m` | `0.00` | Aman (`<= 0.45`) |

*Catatan:* Jalur diagonal lama `path_to_school` `[18.5,-12.5] -> [21.5,-21.5]` yang memotong lereng curam talud telah dipindahkan lurus menyambung kaki `stairs_court_to_school` ke **Pintu Masuk Sekolah** (`X: [11.5, 14.5], Z = -24.5`).

---

## 3. Koridor Lurus & Inti Tangga Vertikal Konsisten

Seluruh 3 lantai tetap memakai selasar L dan Inti Tangga U identik pada grid `0.5m`:

- **Selasar Sayap Utara:** `X: [8.0, 27.5]`, `Z: [-27.0, -24.5]` (lebar `2.5m`, panjang `19.5m`).
- **Selasar Sayap Timur:** `X: [25.0, 27.5]`, `Z: [-27.0, -3.5]` (lebar `2.5m`, panjang `23.5m`).
- **Inti Tangga Utama (`sekolah_stair_core`, `source: 'konseptual'`):** `X: [27.5, 36.0]`, `Z: [-24.5, -20.5]` (`8.5m x 4.0m`, kemiringan ramp `0.34 <= 0.45`, void tepat di atas lubang tangga LT 2 & LT 3).

---

## 4. Usulan Pembagian Ruangan Baru per Lantai (`10` Ruangan + `6` Kamar Mandi, 100% Footprint Terpakai)

Hanya memakai jenis ruangan yang diizinkan: `Ruang Kelas`, `Kamar Mandi`, `Ruang Server`, `Perpustakaan`, `Ruang Robotik`, `Lab Komputer`, `Ruang Rapat`, `Ruang Konsultansi`, `Ruang Musik`, koridor, tangga, dan `Pintu Masuk Sekolah`.

### 4.1 Lantai 1 (`LT 1`, Elevasi `-9.0m`)
| ID | Nama Ruangan | Posisi `X` (m) | Posisi `Z` (m) | Ukuran (`P x L`) | Pintu (`X, Z`, hadap) | Source Lantai / Posisi |
|---|---|---|---|---|---|---|
| `entrance_lt1` | Pintu Masuk Sekolah | `11.5 .. 14.5` | `-24.5` | Bukaan `3.0m` | Langsung dari plaza selatan | `konseptual` |
| `lt1_rapat` | Ruang Rapat | `8.0 .. 17.5` | `-35.5 .. -27.0` | `9.5m x 8.5m` | `[13.0, -27.0]` (Selatan) | `konseptual` |
| `lt1_konsultansi` | Ruang Konsultansi | `17.5 .. 27.5` | `-35.5 .. -27.0` | `10.0m x 8.5m` | `[22.5, -27.0]` (Selatan) | `konseptual` |
| `lt1_musik` | Ruang Musik | `27.5 .. 36.0` | `-35.5 .. -24.5` | `8.5m x 11.0m` | `[27.5, -25.75]` (Barat) | `konseptual` |
| `lt1_stair` | Tangga LT 1 <-> LT 2 | `27.5 .. 36.0` | `-24.5 .. -20.5` | `8.5m x 4.0m` | `[27.5, -22.5]` (Barat) | `konseptual` |
| `lt1_km_a` | Kamar Mandi LT 1-A | `27.5 .. 36.0` | `-20.5 .. -16.75` | `8.5m x 3.75m` | `[27.5, -18.6]` (Barat) | Ada di tiap lantai: `user` / Jumlah & posisi: `konseptual` |
| `lt1_km_b` | Kamar Mandi LT 1-B | `27.5 .. 36.0` | `-16.75 .. -13.0` | `8.5m x 3.75m` | `[27.5, -14.9]` (Barat) | Ada di tiap lantai: `user` / Jumlah & posisi: `konseptual` |
| `lt1_lab_komputer` | Lab Komputer | `27.5 .. 36.0` | `-13.0 .. -3.5` | `8.5m x 9.5m` | `[27.5, -8.25]` (Barat) | `konseptual` |

### 4.2 Lantai 2 (`LT 2`, Elevasi `-5.6m`)
| ID | Nama Ruangan | Posisi `X` (m) | Posisi `Z` (m) | Ukuran (`P x L`) | Pintu (`X, Z`, hadap) | Source Lantai / Posisi |
|---|---|---|---|---|---|---|
| `lt2_perpustakaan` | Perpustakaan | `8.0 .. 27.5` | `-35.5 .. -27.0` | `19.5m x 8.5m` | `[13.0, -27.0]` & `[22.5, -27.0]` (Selatan) | Lantai: `user` / Posisi: `konseptual` |
| `lt2_kelas_1` | Ruang Kelas 1 (26 Meja) | `27.5 .. 36.0` | `-35.5 .. -24.5` | `8.5m x 11.0m` | `[27.5, -25.75]` (Barat) | Total 3 kelas & 26 meja: `user` / Lantai LT 2: `konseptual` |
| `lt2_stair` | Tangga LT 1 <-> LT 2 <-> LT 3 | `27.5 .. 36.0` | `-24.5 .. -20.5` | `8.5m x 4.0m` | `[27.5, -22.5]` (Barat) | `konseptual` |
| `lt2_km_a` | Kamar Mandi LT 2-A | `27.5 .. 36.0` | `-20.5 .. -16.75` | `8.5m x 3.75m` | `[27.5, -18.6]` (Barat) | Ada di tiap lantai: `user` / Jumlah & posisi: `konseptual` |
| `lt2_km_b` | Kamar Mandi LT 2-B | `27.5 .. 36.0` | `-16.75 .. -13.0` | `8.5m x 3.75m` | `[27.5, -14.9]` (Barat) | Ada di tiap lantai: `user` / Jumlah & posisi: `konseptual` |
| `lt2_server` | Ruang Server | `27.5 .. 36.0` | `-13.0 .. -3.5` | `8.5m x 9.5m` | `[27.5, -8.25]` (Barat) | Lantai: `user` / Posisi: `konseptual` |

### 4.3 Lantai 3 (`LT 3`, Elevasi `-2.2m`)
| ID | Nama Ruangan | Posisi `X` (m) | Posisi `Z` (m) | Ukuran (`P x L`) | Pintu (`X, Z`, hadap) | Source Lantai / Posisi |
|---|---|---|---|---|---|---|
| `lt3_robotik` | Ruang Robotik | `8.0 .. 27.5` | `-35.5 .. -27.0` | `19.5m x 8.5m` | `[13.0, -27.0]` & `[22.5, -27.0]` (Selatan) | Lantai: `user` / Posisi: `konseptual` |
| `lt3_kelas_2` | Ruang Kelas 2 (26 Meja) | `27.5 .. 36.0` | `-35.5 .. -24.5` | `8.5m x 11.0m` | `[27.5, -25.75]` (Barat) | Total 3 kelas & 26 meja: `user` / Lantai LT 3: `konseptual` |
| `lt3_stair` | Tangga LT 2 <-> LT 3 | `27.5 .. 36.0` | `-24.5 .. -20.5` | `8.5m x 4.0m` | `[27.5, -22.5]` (Barat) | `konseptual` |
| `lt3_km_a` | Kamar Mandi LT 3-A | `27.5 .. 36.0` | `-20.5 .. -16.75` | `8.5m x 3.75m` | `[27.5, -18.6]` (Barat) | Ada di tiap lantai: `user` / Jumlah & posisi: `konseptual` |
| `lt3_km_b` | Kamar Mandi LT 3-B | `27.5 .. 36.0` | `-16.75 .. -13.0` | `8.5m x 3.75m` | `[27.5, -14.9]` (Barat) | Ada di tiap lantai: `user` / Jumlah & posisi: `konseptual` |
| `lt3_kelas_3` | Ruang Kelas 3 (26 Meja) | `27.5 .. 36.0` | `-13.0 .. -3.5` | `8.5m x 9.5m` | `[27.5, -8.25]` (Barat) | Total 3 kelas & 26 meja: `user` / Lantai LT 3: `konseptual` |

---

## 5. Diagram ASCII Per Lantai (Utara di Atas, Timur di Kanan)

```text
X:     8.0        17.5         27.5           36.0
Z=-35.5 +----------+------------+--------------+
        |  RUANG   |   RUANG    |              |
  LT 1  |  RAPAT   |KONSULTANSI | RUANG MUSIK  |
Z=-27.0 +----[]----+-----[]-----+              | Z=-24.5
        |  SELASAR UTARA (2.5m)  []            |
Z=-24.5 +---[PINTU MASUK]---+----+--------------+
        ^ Tangga Plaza      | S  | TANGGA UTAMA | Z=-20.5
                            | E  | (LT1 <-> LT2)|
                            | L  +--------------+
                            | A [] KAMAR MANDI A| Z=-16.75
                            | S  +--------------+
                            | A [] KAMAR MANDI B| Z=-13.0
                            | R  +--------------+
                            |   [] LAB KOMPUTER |
Z=-3.5                      +----+--------------+

X:     8.0                     27.5           36.0
Z=-35.5 +-----------------------+--------------+
        |     PERPUSTAKAAN      |              |
  LT 2  |   [user: LT 2]        | RUANG KELAS 1|
        |     (19.5m x 8.5m)    |  (26 Meja)   |
Z=-27.0 +-----[]----------[]----+              | Z=-24.5
        |  SELASAR BALKON UTARA []             |
Z=-24.5 +------------------+----+--------------+
                           | B  | TANGGA UTAMA | Z=-20.5
                           | A  | (VOID + NAIK)|
                           | L  +--------------+
                           | K [] KAMAR MANDI A| Z=-16.75
                           | O  +--------------+
                           | N [] KAMAR MANDI B| Z=-13.0
                           |    +--------------+
                           |   [] RUANG SERVER |
Z=-3.5                     +----+--------------+  [user: LT 2]

X:     8.0                     27.5           36.0
Z=-35.5 +-----------------------+--------------+
        |     RUANG ROBOTIK     |              |
  LT 3  |   [user: LT 3]        | RUANG KELAS 2|
        |     (19.5m x 8.5m)    |  (26 Meja)   |
Z=-27.0 +-----[]----------[]----+              | Z=-24.5
        |  SELASAR BALKON UTARA []             |
Z=-24.5 +------------------+----+--------------+
                           | B  | TANGGA UTAMA | Z=-20.5
                           | A  | (ATAS)       |
                           | L  +--------------+
                           | K [] KAMAR MANDI A| Z=-16.75
                           | O  +--------------+
                           | N [] KAMAR MANDI B| Z=-13.0
                           |    +--------------+
                           |   [] RUANG KELAS 3|
Z=-3.5                     +----+--------------+  (26 Meja)
```

---

## 6. Verifikasi Perhitungan 26 Meja Siswa per Kelas (`PLAYER_RADIUS = 0.42m`)

- **Jumlah kelas (`source: 'user'`):** **3** (`Ruang Kelas 1`, `Ruang Kelas 2`, `Ruang Kelas 3`).
- **Jumlah meja siswa per kelas (`source: 'user'`):** **Tepat 26 meja siswa + 26 kursi siswa** per ruangan (`78` meja siswa total untuk 3 kelas).
- **Ukuran ruangan kelas yang dipakai:**
  - `Ruang Kelas 1` (LT 2 Timur-Utara) & `Ruang Kelas 2` (LT 3 Timur-Utara): `8.5m (X) x 11.0m (Z)` -> ruang bersih dalam `8.14m x 10.64m` (tebal dinding `0.18m`).
  - `Ruang Kelas 3` (LT 3 Timur-Selatan): `8.5m (X) x 9.5m (Z)` -> ruang bersih dalam `8.14m x 9.14m`.
- **Tata letak 26 unit meja (ukuran meja `0.65m x 0.48m`):**
  - **Sumbu Barat–Timur (`X`, lebar bersih `8.14m`):**
    - `3` pasang lajur meja ganda (`6` kolom total × `0.65m = 3.90m`).
    - Sisa lebar bebas untuk `4` lorong jalan (`Dinding Barat – Lajur 1 – Lajur 2 – Lajur 3 – Dinding Timur`): `8.14m - 3.90m = 4.24m`.
    - **Lebar tiap lorong = `4.24m / 4 = 1.06m`**, lebih lebar dari diameter kapsul pemain (`2 × 0.42m = 0.84m`), sehingga seluruh lorong aman dilewati pemain tanpa tersangkut collider!
  - **Sumbu Utara–Selatan (`Z`, panjang bersih minimal `9.14m` pada `Ruang Kelas 3`):**
    - Zona depan (Papan tulis & meja/kursi guru): `2.35m`.
    - **5 baris tempat duduk** (`6 + 6 + 6 + 6 + 2 = tepat 26 meja` + `26 kursi`): jarak antar-baris `1.20m` (meja `0.48m` + ruang kursi/lewat `0.72m`), total panjang `5 × 1.20m = 6.00m`.
    - Sisa ruang gerak belakang: `9.14m - (2.35m + 6.00m) = 0.79m` (di `Ruang Kelas 3`) atau `2.29m` (di `Ruang Kelas 1 & 2`).
    - Seluruh `26` meja & kursi terpasang rapi di atas lantai dengan collider masing-masing dan tidak menempel dinding.

---

## 7. Rencana Furnitur Lanjutan per Ruangan (Tahap B, setelah persetujuan `"lanjut"`)

- **Ruang Kelas 1, 2, 3:** Papan tulis, meja+kursi guru, tepat `26` meja siswa + `26` kursi siswa (grid 3 lajur × 5 baris: `6+6+6+6+2`), objek interaktif `ruang_kelas`.
- **Ruang Server (LT 2, `user`):** 4 kabinet rak server 42U berjajar dengan lampu indikator LED samar, meja terminal pemeliharaan jaringan, unit AC split dinding, objek interaktif `ruang_server`.
- **Perpustakaan (LT 2, `user`):** Deretan rak buku tinggi dua sisi, 2 meja baca panjang + bangku baca, meja layanan pustakawan, objek interaktif `perpustakaan`.
- **Ruang Robotik (LT 3, `user`):** Meja kerja perakitan mekanik-elektronik, lintasan uji robot line-follower di lantai, lemari perkakas/komponen, objek interaktif `ruang_robotik`.
- **Kamar Mandi LT 1–3 (`6` unit, `2` per lantai):** Meja wastafel dengan 2–3 keran cermin dan 3 bilik toilet berpintu setengah-tertutup + sekat partisi bersih (netral tanpa pembagian putra/putri).
- **Lab Komputer (LT 1):** Meja komputer panjang berderet + unit monitor & PC low-poly + kursi + papan tulis (`lab_komputer`).
- **Ruang Rapat (LT 1):** Dinding kaca buram ke arah selasar, meja rapat panjang, kursi, layar presentasi (`ruang_rapat`).
- **Ruang Konsultansi (LT 1):** Meja konsultasi, 2 kursi, lemari arsip (`ruang_konsultansi`).
- **Ruang Musik (LT 1):** Rak gitar akustik, kajon, amplifier kotak sederhana (`ruang_musik`).
