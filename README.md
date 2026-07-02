# Aplikasi Manajemen UMKM

Aplikasi ini adalah sistem manajemen bisnis terpadu yang dirancang khusus untuk Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia. Tujuannya adalah untuk menyederhanakan operasional bisnis melalui fitur manajemen rantai pasok (supply chain) dan akuntansi dasar.

## Prinsip Arsitektur

1.  **Cross-Platform:** Aplikasi ini dibangun menggunakan Vue 3 dan Capacitor, memastikannya berjalan dengan baik sebagai aplikasi web modern di desktop dan sebagai aplikasi asli (native) di Android.
2.  **UI Profesional & Responsif:** Antarmuka pengguna (UI) dibangun menggunakan [CoreUI for Vue](https://coreui.io/vue/) yang berbasis Bootstrap 5. Semua komponen harus responsif dan memberikan pengalaman pengguna yang konsisten di semua perangkat.
3.  **CRUD Lengkap:** Setiap modul utama dalam aplikasi ini **harus** memiliki fungsionalitas Create, Read, Update, dan Delete (CRUD).
4.  **Penyimpanan Lokal:** Data disimpan di sisi klien menggunakan Dexie.js (IndexedDB), memungkinkan fungsionalitas offline.
5.  **Kode Terstruktur:** Kode harus mengikuti praktik terbaik Vue 3, dengan komponen yang modular dan mudah dikelola.

---

## Rencana Pengembangan & Fitur Utama

### Phase 1: Fondasi Aplikasi & UI (Selesai)
- [x] Instalasi dan konfigurasi CoreUI for Vue.
- [x] Membuat tata letak utama aplikasi (Sidebar, Header, Footer).
- [x] Membuat sistem navigasi dinamis.

### Phase 2: Manajemen Rantai Pasok (Supply Chain)
- [x] **Modul Bahan Baku (CRUD):**
    - [x] Melihat daftar semua bahan baku.
    - [x] Menambah bahan baku baru (Nama, Satuan, Stok).
    - [x] Memperbarui informasi dan stok bahan baku.
    - [x] Menghapus bahan baku.
- [x] **Modul Produk Jadi (CRUD):**
    - [x] Melihat daftar semua produk jadi.
    - [x] Menambah produk baru (Nama, Harga, Stok, Deskripsi, Gambar).
    - [x] Memperbarui informasi dan stok produk.
    - [x] Menghapus produk.

### Phase 3: Modul Akuntansi (Accounting)
- [x] **Modul Pengeluaran (CRUD):**
    - [x] Mencatat semua pengeluaran (Deskripsi, Jumlah, Tanggal, Kategori).
    - [x] Melihat riwayat pengeluaran.
    - [x] Mengedit dan menghapus catatan pengeluaran.
- [x] **Modul Pendapatan (CRUD):**
    - [x] Mencatat semua pendapatan/penjualan (Deskripsi, Jumlah, Tanggal).
    - [x] Melihat riwayat pendapatan.
    - [x] Mengedit dan menghapus catatan pendapatan.
- [x] **Modul Utang (CRUD):**
    - [x] Mencatat utang (Pemberi utang, Jumlah, Tanggal, Status).
    - [x] Melihat daftar utang.
    - [x] Memperbarui status pembayaran dan jumlah.
    - [x] Menghapus catatan utang yang sudah lunas.
- [x] **Modul Modal (CRUD):**
    - [x] Mencatat setoran modal (Sumber, Jumlah, Tanggal).
    - [x] Melihat riwayat modal.
    - [x] Mengedit dan menghapus catatan modal.

### Phase 4: Dasbor & Laporan
- [ ] Membuat dasbor utama yang menampilkan ringkasan (misalnya, total pendapatan bulan ini, stok kritis, dll.).
- [ ] Membuat halaman laporan sederhana (laporan laba/rugi, laporan utang).

---

## Model Data

Berikut adalah struktur data dasar yang akan digunakan:

```javascript
// Bahan Baku
{
  id: 'auto-increment',
  name: 'String',
  unit: 'String (e.g., kg, liter, pcs)',
  stock: 'Number'
}

// Produk Jadi
{
  id: 'auto-increment',
  name: 'String',
  price: 'Number',
  stock: 'Number',
  description: 'String',
  image: 'Blob' // Untuk menyimpan file gambar
}

// Pengeluaran
{
  id: 'auto-increment',
  description: 'String',
  amount: 'Number',
  date: 'Date',
  category: 'String'
}

// Pendapatan
{
  id: 'auto-increment',
  description: 'String',
  amount: 'Number',
  date: 'Date'
}

// Utang
{
  id: 'auto-increment',
  lender: 'String',
  amount: 'Number',
  dueDate: 'Date',
  status: 'String (e.g., Belum Lunas, Lunas)'
}

// Modal
{
  id: 'auto-increment',
  source: 'String',
  amount: 'Number',
  date: 'Date'
}
```
*Setiap pembaruan atau penambahan fitur pada proyek ini harus diperbarui juga di dalam file README.md ini.*



npm run build
npx cap sync android
cd android
./gradlew assembleDebug


unutk build debug masuk ke folder android lalu gunakan : `./gradlew assembleDebug`
unutk merilis apk masuk ke folder android lalu gunakan: `./gradlew assembleRelease`

maka apk akan tersimpan di folder `android/app/build/outputs/apk/release`

