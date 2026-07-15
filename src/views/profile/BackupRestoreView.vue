<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <ion-title class="app-hero-title" style="padding: 0;">Backup & Restore</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="openSettingsModal">
                <ion-icon :icon="settingsOutline" />
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle" style="margin: 0;">Ekspor seluruh data database ke Excel atau Impor kembali kapan saja.</p>
        </div>
      </ion-toolbar>
    </ion-header> 

    <ion-content class="app-content-wrap ion-padding">
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-card shadow-soft text-center p-4">
          <ion-spinner name="crescent" color="primary" />
          <p class="mt-3 fw-bold text-dark">{{ loadingMessage }}</p>
          <small class="text-muted">Jangan keluar dari halaman atau menutup aplikasi.</small>
        </div>
      </div>

      <!-- Action Grid -->
      <div class="backup-grid m-2">
        <!-- Card 1: Backup -->
        <ion-card class="mobile-card action-card shadow-soft mb-2">
          <div class="card-glow-bg backup-glow"></div>
          <ion-card-header class="mobile-card-header">
            <div class="icon-circle bg-emerald-light">
              <ion-icon :icon="cloudDownloadOutline" class="text-emerald" />
            </div>
            <ion-card-title class="mobile-card-title mt-3">Backup Database</ion-card-title>
            <ion-card-subtitle class="mobile-card-subtitle">
              Ekspor seluruh data dari database lokal (termasuk Proyek, Transaksi, Ceklok, Produk, Kasir, To Do, dll) ke dalam satu file Excel (.xlsx).
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content class="d-flex flex-column gap-3">
            <div class="info-alert">
              <ion-icon :icon="informationCircleOutline" />
              <span>Setiap tabel database akan disimpan sebagai lembar sheet terpisah di file Excel.</span>
            </div>
            <button class="btn btn-action primary btn-lg w-100" @click="handleBackup">
              <ion-icon slot="start" :icon="downloadOutline" /> Ekspor ke Excel
            </button>
          </ion-card-content>
        </ion-card>

        <!-- Card 2: Restore -->
        <ion-card class="mobile-card action-card shadow-soft mb-2 mt-0">
          <div class="card-glow-bg restore-glow"></div>
          <ion-card-header class="mobile-card-header">
            <div class="icon-circle bg-indigo-light">
              <ion-icon :icon="cloudUploadOutline" class="text-indigo" />
            </div>
            <ion-card-title class="mobile-card-title mt-3">Restore Database</ion-card-title>
            <ion-card-subtitle class="mobile-card-subtitle">
              Pilih file Excel hasil backup sebelumnya untuk memperbarui data database lokal Anda.
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content class="d-flex flex-column gap-3">
            <div class="info-alert warning">
              <ion-icon :icon="alertCircleOutline" />
              <span>PENTING: Seluruh data pada tabel yang ada di file backup akan dihapus terlebih dahulu dan digantikan dengan data baru dari file Excel tersebut. Tabel yang tidak ada di file backup aman dan tidak akan dihapus.</span>
            </div>

            <!-- Custom File Upload Button -->
            <div class="file-upload-container">
              <input
                ref="fileInput"
                type="file"
                accept=".xlsx"
                class="hidden-file-input"
                @change="handleFileChange"
              />
              <button class="btn btn-action dark btn-lg w-100" @click="triggerFileSelect">
                <ion-icon slot="start" :icon="documentTextOutline" /> Pilih File Excel & Restore
              </button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- App Toast for info -->
      <app-toast
        :show="toast.show"
        :text="toast.text"
        :color="toast.color"
        @close="toast.show = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonBackButton,
} from '@ionic/vue';
import {
  cloudDownloadOutline,
  cloudUploadOutline,
  informationCircleOutline,
  alertCircleOutline,
  downloadOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { db } from '@/db/schema';
import * as XLSX from 'xlsx';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import AppToast from '@/components/AppToast.vue';

const fileInput = ref(null);
const loading = ref(false);
const loadingMessage = ref('');

const toast = ref({
  show: false,
  text: '',
  color: 'success',
});

function showToast(text, color = 'success') {
  toast.value = { show: true, text, color };
}

function triggerFileSelect() {
  fileInput.value?.click();
}

/**
 * BACKUP DATABASE
 * Export all Dexie tables to a single Excel file
 */
async function handleBackup() {
  loading.value = true;
  loadingMessage.value = 'Mengekspor database ke Excel...';
  try {
    const wb = XLSX.utils.book_new();

    for (const table of db.tables) {
      const data = await table.toArray();
      
      // Clean up and serialize nested objects or arrays to JSON strings
      const cleanedData = data.map((row) => {
        const cleaned = { ...row };
        for (const key of Object.keys(cleaned)) {
          const val = cleaned[key];
          if (val !== null && typeof val === 'object') {
            cleaned[key] = JSON.stringify(val);
          }
        }
        return cleaned;
      });

      // Create sheet. If empty, create empty sheet with headers if possible, or just empty
      const ws = cleanedData.length > 0 ? XLSX.utils.json_to_sheet(cleanedData) : XLSX.utils.aoa_to_sheet([]);
      XLSX.utils.book_append_sheet(wb, ws, table.name);
    }

    const fileName = `FinancialApp_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;

    if (Capacitor.isNativePlatform()) {
      const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });
      const { uri } = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache,
      });
      await Share.share({
        title: 'Backup Database',
        files: [uri],
        dialogTitle: 'Simpan file Backup',
      });
      showToast('Berhasil mengekspor backup!', 'success');
    } else {
      XLSX.writeFile(wb, fileName);
      showToast('Berhasil mendownload file backup!', 'success');
    }
  } catch (err) {
    console.error('Export failed:', err);
    showToast('Gagal mengekspor database: ' + err.message, 'danger');
  } finally {
    loading.value = false;
  }
}

// Map for renamed tables to maintain backward compatibility
const TABLE_NAME_MAP = {
  capitalCosts: 'savings',
};

/**
 * RESTORE DATABASE
 * Import tables from chosen Excel file, wiping only modified tables
 */
async function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Ask for confirmation
  const confirmRestore = confirm(
    'Apakah Anda yakin ingin melakukan restore? Data pada tabel yang terdaftar di file backup ini akan DIHAPUS dan digantikan sepenuhnya.'
  );
  if (!confirmRestore) {
    e.target.value = ''; // Reset file input
    return;
  }

  loading.value = true;
  loadingMessage.value = 'Membaca file & merestore database...';

  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const data = new Uint8Array(ev.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      if (!workbook.SheetNames.length) {
        throw new Error('File Excel kosong atau tidak valid.');
      }

      let restoredTables = [];
      let totalRecords = 0;

      // Wrap the restore operation in a write transaction covering all stores
      await db.transaction('rw', db.tables, async () => {
        for (const sheetName of workbook.SheetNames) {
          // Resolve target table name (handling renamed tables for backward compatibility)
          const targetTableName = TABLE_NAME_MAP[sheetName] || sheetName;

          // Check if targetTableName is a valid table in Dexie
          const table = db.tables.find((t) => t.name === targetTableName);
          if (!table) continue;

          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet);

          // 1. Wipe the table completely as requested
          await table.clear();

          // 2. Parse and insert new rows if any
          if (rows.length > 0) {
            const cleanedRows = rows.map((row) => {
              const cleaned = { ...row };
              delete cleaned.__rowNum__;

              // Parse and coerce types dynamically
              for (const key of Object.keys(cleaned)) {
                const val = cleaned[key];
                if (typeof val === 'string') {
                  // Check if it's stringified JSON (array or object)
                  if (
                    (val.startsWith('[') && val.endsWith(']')) ||
                    (val.startsWith('{') && val.endsWith('}'))
                  ) {
                    try {
                      cleaned[key] = JSON.parse(val);
                      continue;
                    } catch {
                      // fallback to string if parsing fails
                    }
                  }

                  // Coerce numeric strings to numbers for known numeric/ID field patterns
                  const isIdField = key === 'id' || key.endsWith('Id') || key.endsWith('_id');
                  const isNumericField = /price|stock|amount|qty|quantity|discount|balance|total|sum|count|hours|minutes|rate/i.test(key);

                  if (isIdField || isNumericField) {
                    const num = Number(val);
                    if (!isNaN(num) && val.trim() !== '') {
                      cleaned[key] = num;
                    }
                  }
                }
              }
              return cleaned;
            });

            await table.bulkAdd(cleanedRows);
          }

          restoredTables.push(targetTableName);
          totalRecords += rows.length;
        }
      });

      showToast(`Restore berhasil! Memulihkan ${restoredTables.length} tabel (${totalRecords} baris data).`, 'success');
      alert(`Database berhasil dipulihkan!\n\nTabel yang dipulihkan:\n${restoredTables.map(t => `- ${t}`).join('\n')}`);
    } catch (err) {
      console.error('Restore failed:', err);
      showToast('Gagal memulihkan database: ' + err.message, 'danger');
      alert('Gagal memulihkan database: ' + err.message);
    } finally {
      loading.value = false;
      e.target.value = ''; // Reset file input
    }
  };

  reader.onerror = (err) => {
    console.error(err);
    showToast('Gagal membaca file.', 'danger');
    loading.value = false;
    e.target.value = ''; // Reset file input;
  };

  reader.readAsArrayBuffer(file);
}
</script>

<style scoped>
/* Gradient and premium hero styles */
.backup-hero {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25) !important;
  padding: 24px 20px !important;
}

.custom-back-btn {
  --color: #ffffff;
  margin-left: -8px;
}

/* Grid Layout */
.backup-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .backup-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Premium Card aesthetics */
.action-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08) !important;
}

.card-glow-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.12;
  pointer-events: none;
}

.backup-glow {
  background: #10b981;
}

.restore-glow {
  background: #4f46e5;
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle ion-icon {
  font-size: 1.6rem;
}

.bg-emerald-light {
  background: #ecfdf5;
}

.text-emerald {
  color: #059669;
}

.bg-indigo-light {
  background: #eef2ff;
}

.text-indigo {
  color: #4f46e5;
}

/* Alert Boxes */
.info-alert {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.4;
}

.info-alert ion-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  color: #64748b;
}

.info-alert.warning {
  background: #fffbeb;
  border-color: #fef3c7;
  color: #92400e;
}

.info-alert.warning ion-icon {
  color: #d97706;
}

/* Hidden inputs */
.hidden-file-input {
  display: none;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-card {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
