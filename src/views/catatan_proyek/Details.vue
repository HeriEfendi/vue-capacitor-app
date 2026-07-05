<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { initDB } from '@/db'
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonProgressBar, IonBadge, IonSpinner, IonList, IonListHeader } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline, closeOutline, cloudUploadOutline, cloudDownloadOutline, listOutline, checkmarkCircleOutline } from 'ionicons/icons';

interface Transaction {
  id: number
  project_id: number
  type: 'DEPOSIT' | 'EXPENSE'
  category: string
  amount: number
  date: string
  description: string | null
}

interface Project {
  id: number
  name: string
  description: string | null
  status: string
  total_deposits: number
  total_expenses: number
  balance: number
  transactions: Transaction[]
  created_at: string
}

const route = useRoute()
const router = useRouter()

const project = ref<Project | null>(null)
const loading = ref(false)
const dialogTransaction = ref(false)
const dialogDeleteTxId = ref<number | null>(null)
const submitting = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })
const editingTxId = ref<number | null>(null)
const filterType = ref('SEMUA')
const filterOptions = ref([
  { label: 'Semua', value: 'SEMUA' },
  { label: 'Modal', value: 'MODAL' },
  { label: 'Pengeluaran', value: 'EXPENSE' },
  { label: 'Pendapatan', value: 'PENDAPATAN' },
])

const filterCount = (filter: string) => {
  if (filter === 'SEMUA') return project.value?.transactions.length || 0
  if (filter === 'MODAL') return project.value?.transactions.filter(t => t.type === 'DEPOSIT' && categories.DEPOSIT_MODAL.includes(t.category)).length || 0
  if (filter === 'EXPENSE') return project.value?.transactions.filter(t => t.type === 'EXPENSE').length || 0
  if (filter === 'PENDAPATAN') return project.value?.transactions.filter(t => t.type === 'DEPOSIT' && categories.DEPOSIT_PENDAPATAN.includes(t.category)).length || 0
  return 0
}
const maxWidth = '100%'

const categories = {
  DEPOSIT_MODAL: ['Modal Awal', 'Pinjaman', 'Investor', 'Lainnya'],
  DEPOSIT_PENDAPATAN: ['Penjualan Panen', 'Keuntungan', 'Transfer'],
  EXPENSE: ['Material / Bahan', 'Bibit / Benih', 'Upah / Tenaga Kerja', 'Peralatan', 'Transportasi', 'Operasional', 'Administrasi', 'Tak Terduga', 'Lainnya'],
}

const formTx = ref({
  type: 'EXPENSE' as 'DEPOSIT' | 'EXPENSE',
  category: '',
  amount: 0,
  date: new Date().toISOString().substring(0, 10),
  description: '',
})

const filteredTransactions = computed(() => {
  if (!project.value) return []
  let txs = [...(project.value.transactions || [])]
  
  if (filterType.value === 'MODAL') {
    txs = txs.filter(t => t.type === 'DEPOSIT' && categories.DEPOSIT_MODAL.includes(t.category))
  } else if (filterType.value === 'PENDAPATAN') {
    txs = txs.filter(t => t.type === 'DEPOSIT' && categories.DEPOSIT_PENDAPATAN.includes(t.category))
  } else if (filterType.value === 'EXPENSE') {
    txs = txs.filter(t => t.type === 'EXPENSE')
  }
  
  return txs.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    const typeA = a.type === 'EXPENSE' ? -1 : 1
    const typeB = b.type === 'EXPENSE' ? -1 : 1
    return typeA - typeB
  })
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchProject() {
  loading.value = true
  try {
    const db = await initDB()
    const projects = await db.getAll('projects')
    if (projects) {
      let found = projects.find(p => p.id === Number(route.params.id)) || null
      if (found) {
        // Recalculate totals
        const deposits = found.transactions.filter(t => t.type === 'DEPOSIT');
        (found as any).modal_total = deposits.filter(t => categories.DEPOSIT_MODAL.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
        (found as any).panen_total = deposits.filter(t => categories.DEPOSIT_PENDAPATAN.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
      }
      project.value = found
    }
  } catch {
    showSnackbar('Gagal memuat data projek', 'error')
  } finally {
    loading.value = false
  }
}

async function saveTransaction() {
  if (!formTx.value.type || !formTx.value.date) {
    showSnackbar('Tipe dan Tanggal wajib diisi!', 'warning')
    return
  }
  submitting.value = true

  if (!formTx.value.category) {
    formTx.value.category = availableCategories.value[0] || 'Lainnya'
  }

  try {
    const db = await initDB()
    const projects = await db.getAll('projects')
    const projectIndex = projects.findIndex(p => p.id === project.value!.id)

    if (projectIndex !== -1) {
      if (editingTxId.value) {
        const txIndex = projects[projectIndex].transactions.findIndex(t => t.id === editingTxId.value)
        if (txIndex !== -1) {
          projects[projectIndex].transactions[txIndex] = { ...projects[projectIndex].transactions[txIndex], ...formTx.value };
        }
      } else {
        const newTx: Transaction = {
          id: Date.now(),
          project_id: project.value.id,
          ...formTx.value
        }
        if (!projects[projectIndex].transactions) projects[projectIndex].transactions = []
        projects[projectIndex].transactions.push(newTx)
      }
      
      // Recalculate totals
      const p = projects[projectIndex];
      const deposits = p.transactions.filter(t => t.type === 'DEPOSIT');
      p.total_deposits = deposits.reduce((acc, t) => acc + t.amount, 0);
      p.total_expenses = p.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
      
      const modal = deposits.filter(t => categories.DEPOSIT_MODAL.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
      const panen = deposits.filter(t => categories.DEPOSIT_PENDAPATAN.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
      
      (p as any).modal_total = modal;
      (p as any).panen_total = panen;
      p.balance = p.total_deposits - p.total_expenses;

      await db.put('projects', projects[projectIndex])
      await fetchProject()
      closeDialog()
      showSnackbar('Transaksi berhasil disimpan!', 'success')
    }
  } catch (e) {
    console.error(e)
    showSnackbar('Gagal menyimpan transaksi', 'error')
  } finally {
    submitting.value = false
  }
}

async function deleteTransaction(id: number) {
    try {
        const db = await initDB();
        const projects = await db.getAll('projects');
        const projectIndex = projects.findIndex(p => p.id === project.value!.id);

        if (projectIndex !== -1) {
            projects[projectIndex].transactions = projects[projectIndex].transactions.filter(t => t.id !== id);
            
            // Recalculate totals
            const p = projects[projectIndex];
            const deposits = p.transactions.filter(t => t.type === 'DEPOSIT');
            p.total_deposits = deposits.reduce((acc, t) => acc + t.amount, 0);
            p.total_expenses = p.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
            
            const modal = deposits.filter(t => categories.DEPOSIT_MODAL.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
            const panen = deposits.filter(t => categories.DEPOSIT_PENDAPATAN.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
            (p as any).modal_total = modal;
            (p as any).panen_total = panen;
            
            p.balance = p.total_deposits - p.total_expenses;

            await db.put('projects', projects[projectIndex]);
            await fetchProject();
            dialogDeleteTxId.value = null;
            showSnackbar('Transaksi berhasil dihapus', 'success');
        }
    } catch {
        showSnackbar('Gagal menghapus transaksi', 'error');
    }
}


function openCreateDialog() {
  editingTxId.value = null
  formTx.value = {
    type: 'EXPENSE',
    category: '',
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
    description: '',
  }
  dialogTransaction.value = true
}

function openEditDialog(tx: Transaction) {
  editingTxId.value = tx.id
  formTx.value = {
    type: tx.type,
    category: tx.category,
    amount: tx.amount,
    date: tx.date.substring(0, 10),
    description: tx.description || '',
  }
  dialogTransaction.value = true
}

function closeDialog() {
  dialogTransaction.value = false
  editingTxId.value = null
}

function showSnackbar(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
  setTimeout(() => {
    snackbar.value.show = false
  }, 3000)
}

const fileInput = ref<HTMLInputElement | null>(null)
function handleImport() { fileInput.value?.click() }

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  const file = target.files[0]
  const reader = new FileReader()
  reader.onload = (ev) => {
    const data = new Uint8Array(ev.target?.result as ArrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(sheet) as any[]
    
    const newTransactions: Transaction[] = json.map((row: any) => ({
      id: Date.now() + Math.random(),
      project_id: project.value!.id,
      type: row['Tipe'] === 'DEPOSIT' ? 'DEPOSIT' : 'EXPENSE',
      category: row['Kategori'],
      amount: row['Nominal'],
      date: parseDate(row['Tanggal (DD/MM/YYYY)'] || row['Tanggal']),
      description: row['Deskripsi'] || ''
    }))

    if (project.value) {
      (async () => {
        try {
          project.value!.transactions.push(...newTransactions)
          const db = await initDB()
          const p = await db.get('projects', project.value!.id)
          if (p) {
              p.transactions = project.value!.transactions
              p.total_deposits = p.transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0)
              p.total_expenses = p.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
              p.balance = p.total_deposits - p.total_expenses
              
              const deposits = p.transactions.filter(t => t.type === 'DEPOSIT');
              (p as any).modal_total = deposits.filter(t => categories.DEPOSIT_MODAL.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
              (p as any).panen_total = deposits.filter(t => categories.DEPOSIT_PENDAPATAN.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);

              await db.put('projects', JSON.parse(JSON.stringify(p)))
              showSnackbar('Transaksi berhasil diimpor!', 'success')
              fetchProject()
          } else {
              throw new Error('Projek tidak ditemukan')
          }
        } catch (e) {
          console.error(e)
          showSnackbar('Gagal menyimpan transaksi impor', 'error')
        }
      })()
    }
  }
  reader.readAsArrayBuffer(file)
}

function getGuideData() {
  return [
    ['Tipe', 'Kategori'],
    ...categories.DEPOSIT_MODAL.map(c => ['DEPOSIT', c]),
    ...categories.DEPOSIT_PENDAPATAN.map(c => ['DEPOSIT', c]),
    ...categories.EXPENSE.map(c => ['EXPENSE', c]),
    [],
    ['Format Info'],
    ['Tanggal', 'DD/MM/YYYY (Contoh: 01/07/2026)'],
    ['Nominal', 'Angka bulat tanpa titik/koma (Contoh: 1000000)']
  ]
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Tipe', 'Kategori', 'Nominal', 'Tanggal (DD/MM/YYYY)', 'Deskripsi'],
    ['DEPOSIT', 'Modal Awal', 1000000, '01/07/2026', 'Modal Awal'],
    ['EXPENSE', 'Material / Bahan', 500000, '02/07/2026', 'Semen']
  ])
  ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }]
  
  const wsGuide = XLSX.utils.aoa_to_sheet(getGuideData())
  wsGuide['!cols'] = [{ wch: 20 }, { wch: 40 }]
  
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan')
  XLSX.writeFile(wb, 'Tamplate Manajemen Proyek.xlsx')
}

function exportToExcel() {
  const data = project.value!.transactions.map(t => ({
    Tipe: t.type,
    Kategori: t.category,
    Nominal: t.amount,
    Tanggal: t.date.split('-').reverse().join('/'),
    Deskripsi: t.description
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }]
  
  const wsGuide = XLSX.utils.aoa_to_sheet(getGuideData())
  wsGuide['!cols'] = [{ wch: 20 }, { wch: 40 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi')
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan')
  XLSX.writeFile(wb, `Manajemen Proyek - ${project.value!.name}.xlsx`)
}

function parseDate(d: any): string {
    if (!d) return new Date().toISOString().substring(0, 10)
    const str = String(d)
    
    // Check YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
    
    // Check DD/MM/YYYY
    const parts = str.split('/')
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
    
    return new Date().toISOString().substring(0, 10)
}

const availableCategories = computed(() => {
  if (formTx.value.type === 'DEPOSIT') return [...categories.DEPOSIT_MODAL, ...categories.DEPOSIT_PENDAPATAN]
  return categories.EXPENSE
})

// Chart Options & Logic
const donutOptions = computed(() => ({
  chart: { 
    type: 'donut', 
    height: 250,
    width: '100%' 
  },
  labels: Object.keys(categoryTotals.value),
  tooltip: {
    enabled: true,
    trigger: 'click',
    y: {
      formatter: (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
    }
  },
  responsive: [{ breakpoint: 480, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }]
}))

const donutSeries = computed(() => Object.values(categoryTotals.value))

const categoryTotals = computed(() => {
  const totals: Record<string, number> = {}
  project.value?.transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount
  })
  return totals
})

const barOptions = computed(() => {
  if (!project.value) return { chart: { type: 'bar', height: 250, width: '100%' }, xaxis: { categories: [] } }
  
  const monthlyData: Record<string, number> = {}
  const sortedTxs = [...project.value.transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  sortedTxs.forEach(t => {
    if (t.type === 'EXPENSE') {
      const month = new Date(t.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      monthlyData[month] = (monthlyData[month] || 0) + t.amount
    }
  })

  return {
    chart: { 
      type: 'bar',
      height: 250,
      width: '100%',
      toolbar: { show: false } 
    },
    states: {
      hover: {
        filter: { type: 'darken', value: 0.15 }
      }
    },
    colors: ['#FFC0CB'],
    dataLabels: {
      enabled: true,
      style: { colors: ['#000000'] },
      formatter: (val: number) => new Intl.NumberFormat('id-ID').format(val)
    },
    xaxis: { categories: Object.keys(monthlyData) },
    yaxis: {
      labels: {
        formatter: (val: number) => new Intl.NumberFormat('id-ID').format(val)
      }
    },
    tooltip: {
      y: {
        formatter: (val: number) => new Intl.NumberFormat('id-ID').format(val)
      }
    }
  }
})

const barSeries = computed(() => {
  if (!project.value) return [{ name: 'Arus Kas', data: [] }]
  
  const monthlyData: Record<string, number> = {}
  const sortedTxs = [...project.value.transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  sortedTxs.forEach(t => {
    if (t.type === 'EXPENSE') {
      const month = new Date(t.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      monthlyData[month] = (monthlyData[month] || 0) + t.amount
    }
  })

  return [{ 
    name: 'Total Pengeluaran', 
    data: Object.values(monthlyData) 
  }]
})

onMounted(fetchProject)

const chartCarousel = ref(null)
let interval: any = null

onMounted(() => {
  if (window.innerWidth < 768) {
    let active = 0
    interval = setInterval(() => {
      active = active === 0 ? 1 : 0
      if (chartCarousel.value) {
        (chartCarousel.value as any).scrollTo({
          left: active * (chartCarousel.value as any).offsetWidth,
          behavior: 'smooth'
        })
      }
    }, 5000)
  }
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="router.back()">Kembali</ion-button>
        </ion-buttons>
        <ion-title>{{ project?.name || 'Detail Proyek' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="ion-text-center">
        <ion-spinner />
      </div>
      <div v-else-if="project">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="text-h4 font-weight-bold">{{ project.name }}</h2>
          <ion-badge :color="project.status === 'Active' ? 'success' : 'medium'">{{ project.status }}</ion-badge>
        </div>
        <p>{{ project.description }}</p>

        <ion-grid>
          <ion-row>
            <ion-col size="6" size-sm="3">
              <ion-card color="success" class="ion-padding">
                <ion-card-subtitle>Modal</ion-card-subtitle>
                <ion-card-title>{{ formatCurrency((project as any).modal_total || 0) }}</ion-card-title>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-sm="3">
              <ion-card color="danger" class="ion-padding">
                <ion-card-subtitle>Pengeluaran</ion-card-subtitle>
                <ion-card-title>{{ formatCurrency(project.total_expenses) }}</ion-card-title>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-list>
          <ion-list-header>Riwayat Transaksi</ion-list-header>
          <ion-item v-for="tx in filteredTransactions" :key="tx.id">
            <ion-icon slot="start" :icon="tx.type === 'DEPOSIT' ? checkmarkCircleOutline : listOutline" :color="tx.type === 'DEPOSIT' ? 'success' : 'danger'" />
            <ion-label>
              <h2>{{ tx.category }}</h2>
              <p>{{ formatDate(tx.date) }} - {{ tx.description }}</p>
            </ion-label>
            <ion-note slot="end" :color="tx.type === 'DEPOSIT' ? 'success' : 'danger'">
              {{ tx.type === 'DEPOSIT' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </ion-note>
            <ion-button fill="clear" color="medium" @click="openEditDialog(tx)">
              <ion-icon :icon="pencilOutline" />
            </ion-button>
            <ion-button fill="clear" color="danger" @click="dialogDeleteTxId = tx.id">
              <ion-icon :icon="trashOutline" />
            </ion-button>
          </ion-item>
        </ion-list>

        <ion-button expand="block" @click="openCreateDialog" class="ion-margin-top">Tambah Transaksi</ion-button>
      </div>
      <div v-else>
        Proyek tidak ditemukan.
      </div>
    </ion-content>

    <!-- Dialogs -->
    <ion-modal :is-open="dialogTransaction" @didDismiss="closeDialog">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ editingTxId ? 'Edit Transaksi' : 'Tambah Transaksi' }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeDialog"><ion-icon :icon="closeOutline" /></ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-label position="stacked">Tipe</ion-label>
                <ion-select v-model="formTx.type">
                    <ion-select-option value="DEPOSIT">Modal/Pendapatan</ion-select-option>
                    <ion-select-option value="EXPENSE">Pengeluaran</ion-select-option>
                </ion-select>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Kategori</ion-label>
                <ion-select v-model="formTx.category">
                    <ion-select-option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</ion-select-option>
                </ion-select>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Nominal</ion-label>
                <ion-input type="number" v-model.number="formTx.amount" />
            </ion-item>
            <ion-button expand="block" @click="saveTransaction" class="ion-margin-top">Simpan</ion-button>
        </ion-content>
    </ion-modal>
  </ion-page>
</template>

<style scoped>
  @media (min-width: 576px) {
      .flex-row .flex-shrink-0 {
          width: calc((100% - 1rem) / 2) !important;
          min-width: calc((100% - 1rem) / 2) !important;
      }
  }
  .snap-container { scroll-snap-type: x mandatory; }
  .snap-item { scroll-snap-align: start; }
</style>
