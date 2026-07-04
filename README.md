# Vue Capacitor: Manajemen Proyek Keuangan

Aplikasi ini adalah sistem manajemen proyek yang fleksibel untuk mencatat transaksi keuangan secara siklikal. Dirancang menggunakan Vue 3 dan Capacitor, aplikasi ini mampu menangani berbagai jenis proyek, mulai dari konstruksi (bangun rumah) hingga siklus usaha (tanam padi, ternak ayam, dsb).

## Fitur Utama

- **Manajemen Proyek Fleksibel:** Lacak setiap kegiatan dengan sistem saldo (Modal vs Pendapatan vs Pengeluaran).
- **Analisis Finansial:**
  - Perhitungan **Bersih** (Pendapatan Panen - Pengeluaran).
  - Perhitungan **Sisa Modal** (Modal - Pengeluaran).
  - **ROI/Margin Profit:** Indikator persentase keuntungan.
- **Visualisasi Data:** Dashboard dengan grafik _Donut_ untuk distribusi pengeluaran dan grafik _Bar_ untuk arus kas bulanan.
- **Transparansi Transaksi:** Riwayat lengkap dengan filter kategori (Modal, Pengeluaran, Pendapatan).
- **Responsif:** Desain modern, ringan, dan dioptimalkan untuk perangkat mobile.

## Menu Aplikasi

- **Manajemen Proyek:** Pusat kendali untuk membuat, memantau, dan menganalisis setiap proyek/siklus usaha.
- **To Do List:** Manajemen tugas harian untuk mendukung produktivitas dan perencanaan kegiatan.
- **Data Management:** Fasilitas import/export data transaksi ke format Excel/CSV untuk cadangan atau laporan.

## Teknologi

- **Framework:** Vue 3 (Composition API)
- **Mobile/Native:** Capacitor
- **UI Framework:** CoreUI for Vue (Bootstrap 5)
- **Visualisasi:** Vue3-Apexcharts
- **Data:** LocalStorage (Persistence)
- **Utilities:** XLSX (Import/Export data)

## Pengaturan Proyek

### Cara Menjalankan (Development)

```bash
npm install
npm run dev
```

### Build untuk Android

```bash
npm run build
npx cap copy
npx cap open android

npm run build
npx cap sync android
cd android
./gradlew assembleDebug

/home/lenovo/www/vue-capacitor-app/android/app/build/outputs/apk/debug
```
