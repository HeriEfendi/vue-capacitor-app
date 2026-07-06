

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { initDB } from '@/db'
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonProgressBar, IonBadge, IonSpinner, IonList, IonListHeader } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline, closeOutline, cloudUploadOutline, cloudDownloadOutline, listOutline, checkmarkCircleOutline } from 'ionicons/icons';
const VueApexCharts = defineAsyncComponent(() => import("vue3-apexcharts"));


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

const netProfit = computed(() => (project.value as any).panen_total - project.value.total_expenses)
const roi = computed(() => Math.round(netProfit.value / project.value.total_expenses * 100) || 0)

function getFinancialColor(value: number, positiveColor = '#1565c0') {
  return value < 0 ? '#c62828' : positiveColor
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getStatusColor(status: string) {
  if (status === 'Active') return 'success'
  if (status === 'Finished') return 'medium'
  return 'light'
}

async function fetchProject() {
  loading.value = true
  try {
    const db = await initDB()
    const projectId = Number(route.params.id)
    let found = await db.get('projects', projectId)
    
    if (found) {
      // Ensure transactions array exists
      found.transactions = found.transactions || []
      
      // Recalculate totals
      const deposits = found.transactions.filter(t => t.type === 'DEPOSIT');
      (found as any).modal_total = deposits.filter(t => categories.DEPOSIT_MODAL.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
      (found as any).panen_total = deposits.filter(t => categories.DEPOSIT_PENDAPATAN.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
    }
    project.value = found || null
  } catch(e) {
    console.error("Failed to fetch project:", e);
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

async function downloadTemplate() {
  const XLSX = await import('xlsx');
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

async function exportToExcel() {
  const XLSX = await import('xlsx');
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
    height: 300,
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
      height: 300,
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
  if (window.innerWidth < 992) { // Use 'lg' breakpoint
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
        <ion-title>
          <div>
            {{ project?.name || 'Detail Proyek' }}
            <ion-badge v-if="project" class="badge-status" :color="getStatusColor(project.status)">{{ project.status }}</ion-badge>
          </div>
          <div class="text-muted" style="font-size: 0.8rem; margin-top: 4px;">{{ project?.description || 'Tidak ada deskripsi.' }}</div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <input ref="fileInput" type="file" @change="onFileChange" accept=".xlsx" style="display: none;" />
      <div v-if="loading" class="ion-text-center">
        <ion-spinner />
      </div>
      <div v-else-if="project">
        

        <div class="project-actions d-grid gap-2 m-3 m-md-3">
          <ion-button class="btn-action warning action-btn" @click="handleImport"><ion-icon :icon="cloudUploadOutline" slot="start" /> Import</ion-button>
          <ion-button class="btn-action info action-btn" @click="downloadTemplate"><ion-icon :icon="listOutline" slot="start" /> Template</ion-button>
          <ion-button class="btn-action success action-btn" @click="exportToExcel"><ion-icon :icon="cloudDownloadOutline" slot="start" /> Export</ion-button>
          <ion-button @click="openCreateDialog" class="btn-action primary action-btn"><ion-icon :icon="addOutline" slot="start" /> Tambah Transaksi</ion-button>
        </div>

        <ion-grid>
            <ion-row>
                <ion-col size="6" size-lg="2">
                    <div class="summary-card summary-card--green shadow-soft">
                        <small class="text-muted">Modal</small>
                        <div class="summary-value summary-value--green">{{ formatCurrency((project as any).modal_total || 0) }}</div>
                    </div>
                </ion-col>
                <ion-col size="6" size-lg="2">
                    <div class="summary-card summary-card--red shadow-soft">
                        <small class="text-muted">Pengeluaran</small>
                        <div class="summary-value summary-value--red">{{ formatCurrency(project.total_expenses) }}</div>
                    </div>
                </ion-col>
                <ion-col size="6" size-lg="2">
                    <div class="summary-card summary-card--green shadow-soft">
                        <small class="text-muted">Penjualan</small>
                        <div class="summary-value summary-value--green mb-2">{{ formatCurrency((project as any).panen_total || 0) }}</div>
                        
                        <div class="d-flex justify-content-between align-items-center border-top pt-2">
                            <small class="text-muted">ROI</small>
                            <ion-badge :color="netProfit < 0 ? 'danger' : 'light'" :class="{'text-dark': netProfit > 0}">{{ roi }}%</ion-badge>
                        </div>
                        <div class="summary-profit" :style="{ color: getFinancialColor(netProfit) }">{{ formatCurrency(netProfit) }}</div>
                    </div>
                </ion-col>
                <ion-col size="6" size-lg="2">
                    <div class="summary-card summary-card--blue shadow-soft">
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Keuntungan</small>
                            <ion-badge :color="netProfit < 0 ? 'danger' : 'light'" :class="{'text-dark': netProfit > 0}">{{ Math.round(netProfit / (project as any).panen_total * 100) || 0 }}%</ion-badge>
                        </div>
                        <div class="summary-profit summary-profit--border" :style="{ color: getFinancialColor(netProfit) }">{{ formatCurrency(netProfit) }}</div>
                        
                        <small class="text-muted">Sisa Modal</small>
                        <div class="summary-value summary-value--blue">{{ formatCurrency(project.balance) }}</div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-grid>

        <div ref="chartCarousel" class="chart-container m-3">
            <ion-card class="chart-card chart-card--wide">
              <ion-card-header>
                <ion-card-title class="chart-title">Arus Kas Keluar per Bulan</ion-card-title>
              </ion-card-header>
              <VueApexCharts type="bar" :options="barOptions" :series="barSeries" />
            </ion-card>
            <ion-card class="chart-card chart-card--wide me-0">
              <ion-card-header>
                <ion-card-title class="chart-title">Pengeluaran per Kategori</ion-card-title>
              </ion-card-header>
              <VueApexCharts type="donut" :options="donutOptions" :series="donutSeries" />
            </ion-card>
        </div>



        <div class="ion-padding mx-3 transaction-section">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <ion-card-title class="section-title">Riwayat Transaksi</ion-card-title>
            <div class="filter-chips filter-chips--mobile">
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'SEMUA'" size="small">Semua <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('SEMUA') }}</ion-badge></ion-button>
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'MODAL'" size="small">Modal <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('MODAL') }}</ion-badge></ion-button>
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'EXPENSE'" size="small">Pengeluaran <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('EXPENSE') }}</ion-badge></ion-button>
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'PENDAPATAN'" size="small">Pendapatan <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('PENDAPATAN') }}</ion-badge></ion-button>
            </div>
          </div>

          <div class="transaction-scroll pb-2">
            <div class="transaction-list d-flex flex-column gap-1">
              <ion-card v-for="tx in filteredTransactions" :key="tx.id" class="transaction-card">
                <div class="transaction-inner d-flex align-items-center" :class="tx.type === 'DEPOSIT' ? 'deposit-bg' : 'expense-bg'">
                  <div class="transaction-meta">
                    <span class="fw-bold" :class="{ 'text-success': tx.type === 'DEPOSIT', 'text-danger': tx.type === 'EXPENSE' }">
                      {{ tx.type === 'DEPOSIT' ? '▲ In' : '▼ Out' }}
                    </span>
                    <small class="text-muted d-block">{{ formatDate(tx.date) }}</small>
                  </div>
                  <div class="transaction-main text-truncate px-1">
                    <div class="fw-bold text-truncate">{{ tx.category }}</div>
                    <div class="text-muted text-truncate">{{ tx.description || '-' }}</div>
                  </div>
                  <div class="transaction-amount text-end fw-bold" :class="{ 'text-success': tx.type === 'DEPOSIT', 'text-danger': tx.type === 'EXPENSE' }">
                    {{ tx.type === 'DEPOSIT' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                  </div>
                  <div class="transaction-actions flex-shrink-0 d-flex justify-content-end">
                    <ion-button fill="clear" class="btn-action primary" @click="openEditDialog(tx)">
                      <ion-icon :icon="pencilOutline" />
                    </ion-button>
                    <ion-button fill="clear" class="btn-action danger" @click="dialogDeleteTxId = tx.id">
                      <ion-icon :icon="trashOutline" />
                    </ion-button>
                  </div>
                </div>
              </ion-card>
            </div>
          </div>
          
          <div v-if="filteredTransactions.length === 0" class="text-center text-muted py-5">
            <p>Belum ada transaksi</p>
            <ion-button @click="openCreateDialog" size="small" class="btn-action primary mt-2">
              + Tambah Transaksi
            </ion-button>
          </div>

        </div>

      </div>
      <div v-else class="d-flex justify-content-center align-items-center h-100">
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
                <ion-select v-model="formTx.type" interface="popover">
                    <ion-select-option value="DEPOSIT">Modal/Pendapatan</ion-select-option>
                    <ion-select-option value="EXPENSE">Pengeluaran</ion-select-option>
                </ion-select>
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Kategori</ion-label>
                <ion-select v-model="formTx.category" interface="popover">
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
  .summary-card {
    height: 100%;
    border-radius: 22px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .summary-card--green { background: linear-gradient(180deg, #f2fbf4 0%, #e8f5e9 100%); }
  .summary-card--red { background: linear-gradient(180deg, #fff5f5 0%, #ffebee 100%); }
  .summary-card--blue { background: linear-gradient(180deg, #eff6ff 0%, #e3f2fd 100%); }
  .summary-grid {
    --ion-grid-column-padding: 8px;
    margin-inline: 0;
  }
  .summary-value,
  .summary-profit {
    font-weight: 800;
    font-size: 1rem;
    line-height: 1.15;
  }
  .summary-value--green,
  .summary-value--blue {
    color: #2e7d32;
  }
  .summary-value--red {
    color: #c62828;
  }
  .summary-profit--border {
    border-bottom: 1px solid rgba(0,0,0,0.08);
    padding-bottom: 12px;
    margin-bottom: 10px;
  }
  .project-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  .chart-container {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 16px;
  }
  .chart-card {
    flex: 0 0 calc(100% - 8px);
    min-width: calc(100% - 8px);
    margin-inline: 0;
    scroll-snap-align: start;
  }
  .chart-card--wide {
    border-radius: 28px;
    padding-bottom: 8px;
  }
  .chart-title {
    font-size: 1.15rem;
    line-height: 1.2;
  }
  .filter-chips--mobile {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    width: 100%;
  }
  .chip-btn {
    --border-radius: 18px;
    font-size: 0.72rem;
    white-space: nowrap;
    flex: 0 0 auto;
  }
  .transaction-scroll {
    overflow-x: auto;
    width: 100%;
  }
  .transaction-list {
    box-sizing: border-box;
    min-width: 560px;
    width: 100%;
  }
  .transaction-card {
    width: 100%;
    margin-inline: 0;
    border-radius: 18px;
    overflow: hidden;
  }
  /* .transaction-card::part(native) {
    padding-inline: 8px;
  } */
  .transaction-inner {
    padding: 0.5rem 0.4rem 0.5rem 0.5rem;
    width: 100%;
    gap: 8px;
  }
  .transaction-meta {
    flex: 0 0 86px;
    min-width: 86px;
  }
  .transaction-actions {
    gap: 2px;
    flex: 0 0 76px;
  }
  .transaction-main {
    flex: 0 0 170px;
    max-width: 170px;
    min-width: 0;
  }
  .transaction-amount {
    flex: 0 0 150px;
    min-width: 150px;
    white-space: nowrap;
  }
  .small-badge {
    --padding-start: 2px;
    --padding-end: 2px;
    min-width: 12px;
    min-height: 12px;
    font-size: 0.5rem;
    line-height: 1;
  }
  .small-badge::part(native) {
    padding: 0 3px;
    min-width: 12px;
    min-height: 12px;
    font-size: 0.5rem;
    line-height: 1;
  }
  @media (min-width: 768px) {
    .project-actions {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .chart-card {
      flex-basis: calc(50% - 8px);
      min-width: calc(50% - 8px);
    }
    .filter-chips--mobile {
      overflow-x: visible;
      flex-wrap: wrap;
    }
  }
  @media (min-width: 992px) { /* lg breakpoint */
    .chart-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      overflow-x: hidden;
    }
    .chart-card {
      min-width: auto;
      width: 100%;
    }
    .transaction-list {
      min-width: 100%;
      padding-right: 0;
    }
    .transaction-inner {
      padding: 0.5rem 0.75rem;
      gap: 0;
    }
    .transaction-main {
      flex: 1 1 auto;
      max-width: none;
    }
  }
  .filter-chips ion-button {
    --border-radius: 20px;
    font-size: 0.8rem;
  }
</style>