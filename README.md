# HDEV Mobile

Aplikasi mobile all-in-one untuk produktivitas pribadi, keuangan UMKM, dan manajemen rantai pasok. Dibangun dengan **Vue 3 + Ionic + Capacitor** sehingga berjalan sebagai Progressive Web App (PWA) di browser maupun sebagai aplikasi native Android.

---

## 📱 Fitur & Menu Aplikasi

### 👤 Personal
| Menu | Deskripsi |
|---|---|
| **To Do** | Manajemen task & tugas harian pribadi |
| **To Do Team** | Kolaborasi task dalam tim |
| **Ceklok** | Presensi & pencatat jam kerja harian |

### 💰 Keuangan
| Menu | Deskripsi |
|---|---|
| **Buku Kas** | Catat arus kas per kegiatan — bisnis, hobi, maupun renovasi. Setiap buku memiliki saldo modal, pengeluaran, dan sisa dana sendiri. |
| **Tabungan** | Kelola dan pantau alokasi modal usaha |
| **Pengeluaran** | Catat setiap dana yang keluar dengan kategori dan tanggal |
| **Pendapatan** | Catat setiap pemasukan dan sumber dana masuk |
| **Utang** | Monitor catatan utang beserta jatuh tempo |

### 🏪 Supply Chain
| Menu | Deskripsi |
|---|---|
| **Kasir (POS)** | Point-of-Sale untuk proses penjualan, cetak struk, dan riwayat transaksi |
| **Manajemen Stok** | Monitor stok real-time, atur mutasi stok masuk/keluar, dan lihat histori perubahan |
| **Produk** | CRUD produk beserta foto, harga, stok awal, dan kategori |
| **Kategori** | Manajemen master data kategori produk |

### ⚙️ General Setting
| Menu | Deskripsi |
|---|---|
| **Users** | Manajemen data pengguna aplikasi |
| **Profile** | Profil & pengaturan developer |

---

## 🗄️ Penyimpanan Data

Semua data disimpan **secara lokal di perangkat** menggunakan IndexedDB (Dexie.js), tanpa ketergantungan ke server eksternal.

- **Database:** `FinancialAppDB` (IndexedDB, dikelola Dexie.js)
- **Tabel:** `projects`, `todos`, `team_todos`, `users`, `transactions`, `ceklok_logs`, `ceklok_settings`, `categories`, `products`, `capitalCosts`, `debts`, `incomes`, `expenses`, `dailyLedger`, `sales`, `stockMutations`
- **Gambar Produk:**
  - **Browser/Desktop** → disimpan di IndexedDB (`ProductImagesDB`)
  - **Android (native)** → disimpan di `Documents/h_dev/product/` via Capacitor Filesystem

---

## 🧱 Teknologi

| Kategori | Library / Tool |
|---|---|
| Framework UI | [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`) |
| Mobile/Native | [Capacitor 8](https://capacitorjs.com/) |
| Komponen UI | [Ionic Vue 8](https://ionicframework.com/docs/vue/overview) + CoreUI |
| Database | [Dexie.js v4](https://dexie.org/) (IndexedDB wrapper) |
| Grafik | [ApexCharts](https://apexcharts.com/) via vue3-apexcharts |
| Export | [XLSX](https://sheetjs.com/) (Excel import/export) |
| Kamera & Filesystem | `@capacitor/camera`, `@capacitor/filesystem` |
| Styling | Vanilla CSS + Bootstrap 5 utilities |
| Build Tool | [Vite 7](https://vitejs.dev/) |

---

## 🚀 Cara Menjalankan

### Development (Browser)

```bash
npm install
npm run dev
```

### Build Production

```bash
npm run build
```

### Deploy ke Android

```bash
npm run build
npx cap copy android
npx cap open android
# Lalu build / run dari Android Studio
```

> **Catatan:** Untuk build Android, gunakan **JDK 17** (bukan JDK 21+) karena keterbatasan kompatibilitas Gradle.
>
> ```bash
> export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
> cd android && ./gradlew assembleDebug
> ```

---

## 📁 Struktur Folder Utama

```
src/
├── composables/       # Logic reusable (useProductImage, dll)
├── db/                # Repositories & schema database
│   ├── schema.js      # Definisi Dexie FinancialAppDB
│   ├── repositories.js
│   ├── ceklokRepository.ts
│   ├── todoRepository.ts
│   └── ...
├── layout/            # AppSidebar, DefaultLayout, AppFooter
├── router/            # Vue Router (index.js)
└── views/
    ├── buku_kas/          # Buku Kas (Index + Details)
    ├── accounting/        # Pengeluaran, Pendapatan, Utang, Tabungan
    ├── cashier/           # Kasir POS
    ├── ceklok/            # Presensi & Ceklok
    ├── supply-chain/      # Produk, Kategori, Stok
    ├── todo/              # To Do Team
    └── ...
```

---

## 🔗 Repository

- GitHub: [HeriEfendi/HDEV-Mobile](https://github.com/HeriEfendi/HDEV-Mobile)
- Branch aktif: `dev`
