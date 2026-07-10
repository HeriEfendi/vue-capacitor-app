<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import * as XLSX from 'xlsx'
import { useRoute } from 'vue-router'
import { initDB } from '@/db'
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonProgressBar, IonBadge, IonSpinner, IonList, IonListHeader, IonAlert, IonFooter } from '@ionic/vue';
import AppToast from '@/components/AppToast.vue';
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
const roi = computed(() => {
  const modal = (project.value as any)?.modal_total || 0
  if (modal <= 0) return 0
  return Math.floor((netProfit.value / modal) * 100) || 0
})

const profitPercent = computed(() => {
  const sales = (project.value as any).panen_total || 0
  if (sales <= 0) return 0
  return Math.floor((netProfit.value / sales) * 100) || 0
})

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
  if (status === 'Active' || status === 'Aktif') return 'success'
  if (status === 'Completed' || status === 'Selesai') return 'primary'
  if (status === 'Pending' || status === 'Tunda') return 'warning'
  return 'secondary'
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

            dialogDeleteTxId.value = null;
            await db.put('projects', projects[projectIndex]);
            project.value = JSON.parse(JSON.stringify(projects[projectIndex]));
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
    try {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet) as any[]
      
      const validCategories = [...categories.DEPOSIT_MODAL, ...categories.DEPOSIT_PENDAPATAN, ...categories.EXPENSE]
      const newTransactions: Transaction[] = json.map((row: any, index: number) => {
        const rowNumber = index + 2
        const type = String(row['Tipe'] || '').trim()
        const category = String(row['Kategori'] || '').trim()
        const amount = Number(row['Nominal'])
        const rawDate = row['Tanggal (DD/MM/YYYY)'] || row['Tanggal']

        if (type !== 'DEPOSIT' && type !== 'EXPENSE') {
          throw new Error(`Baris ${rowNumber}: Tipe harus DEPOSIT atau EXPENSE`)
        }
        if (!validCategories.includes(category)) {
          throw new Error(`Baris ${rowNumber}: Kategori tidak valid`)
        }
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error(`Baris ${rowNumber}: Nominal harus angka lebih dari 0`)
        }
        if (!rawDate) {
          throw new Error(`Baris ${rowNumber}: Tanggal wajib diisi`)
        }

        return {
          id: Date.now() + Math.random(),
          project_id: project.value!.id,
          type,
          category,
          amount,
          date: parseDate(rawDate),
          description: row['Deskripsi'] || ''
        }
      })

      if (project.value) {
        (async () => {
          let success = false;
          try {
            if (!project.value) throw new Error('Projek tidak ditemukan')
            const newTxs = [...project.value!.transactions, ...newTransactions];
            const db = await initDB()
            const p = await db.get('projects', project.value!.id)
            if (!p) throw new Error('Projek tidak ditemukan di database')
            
            p.transactions = newTxs;
            p.total_deposits = p.transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0)
            p.total_expenses = p.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
            p.balance = p.total_deposits - p.total_expenses
            
            const deposits = p.transactions.filter(t => t.type === 'DEPOSIT');
            (p as any).modal_total = deposits.filter(t => categories.DEPOSIT_MODAL.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);
            (p as any).panen_total = deposits.filter(t => categories.DEPOSIT_PENDAPATAN.includes(t.category)).reduce((acc, t) => acc + t.amount, 0);

            await db.put('projects', JSON.parse(JSON.stringify(p)))
            await fetchProject()
            success = true;
          } catch (e) {
            console.error(e)
            showSnackbar('Gagal menyimpan: ' + (e as Error).message, 'error')
          }
          if (success) {
            showSnackbar('Transaksi berhasil diimpor!', 'success')
          }
        })()
      }
    } catch (e) {
      console.error(e)
      showSnackbar('Gagal memproses file: ' + (e as Error).message, 'error')
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
  XLSX.writeFile(wb, 'Template Buku Kas.xlsx')
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
  XLSX.writeFile(wb, `Buku Kas - ${project.value!.name}.xlsx`)
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
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <ion-title class="app-hero-title" style="padding: 0;">
              {{ project?.name || 'Detail Buku Kas' }}
            </ion-title>
            <ion-badge v-if="project" class="badge-status" :color="getStatusColor(project.status)">{{ project.status }}</ion-badge>
          </div>
          <p class="app-hero-subtitle" style="margin: 0;">{{ project?.description || 'Tidak ada deskripsi.' }}</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <input ref="fileInput" type="file" @change="onFileChange" accept=".xlsx" style="display: none;" />
      <div v-if="loading" class="ion-text-center">
        <ion-spinner />
      </div>
      <div v-else-if="project">
        

        <div class="project-actions d-grid gap-2 m-3">
          <ion-button class="btn-action warning action-btn" @click="handleImport"><ion-icon :icon="cloudUploadOutline" slot="start" /> Import</ion-button>
          <ion-button class="btn-action info action-btn" @click="downloadTemplate"><ion-icon :icon="listOutline" slot="start" /> Template</ion-button>
          <ion-button class="btn-action success action-btn" @click="exportToExcel"><ion-icon :icon="cloudDownloadOutline" slot="start" /> Export</ion-button>
          <ion-button @click="openCreateDialog" class="btn-action primary action-btn"><ion-icon :icon="addOutline" slot="start" /> Tambah Transaksi</ion-button>
        </div>

        <ion-grid>
            <ion-row>
                <ion-col size="6" size-lg="3">
                    <div class="summary-card summary-card--green shadow-soft">
                        <small class="text-muted mb-2">Modal</small>
                        <div class="summary-value summary-value--green">{{ formatCurrency((project as any).modal_total || 0) }}</div>
                    </div>
                </ion-col>
                <ion-col size="6" size-lg="3">
                    <div class="summary-card summary-card--red shadow-soft">
                        <small class="text-muted mb-2">Pengeluaran</small>
                        <div class="summary-value summary-value--red">{{ formatCurrency(project.total_expenses) }}</div>
                    </div>
                </ion-col>
                <ion-col size="6" size-lg="3" v-if="(project as any).panen_total > 0">
                    <div class="summary-card summary-card--green shadow-soft">
                        <small class="text-muted mb-2">Pendapatan</small>
                        <div class="summary-value summary-value--green">{{ formatCurrency((project as any).panen_total || 0) }}</div>
                        
                        <div class="d-flex justify-content-between align-items-center border-top mt-2 pt-2">
                            <div class="d-flex flex-column align-items-start">
                                <small class="text-muted mb-2">Margin</small>
                                <span class="summary-value" :class="profitPercent >= 0 ? 'summary-value--green' : 'summary-value--red'">{{ profitPercent }}%</span>
                            </div>
                            <div class="d-flex flex-column align-items-end">
                                <small class="text-muted mb-2">ROI</small>
                                <span class="summary-value" :class="roi >= 0 ? 'summary-value--green' : 'summary-value--red'">{{ roi }}%</span>
                            </div>
                        </div>
                    </div>
                </ion-col>
                <ion-col size="6" size-lg="3">
                    <div class="summary-card summary-card--blue shadow-soft">
                        <div v-if="(project as any).panen_total > 0">
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted mb-2">Keuntungan</small>
                                <!-- <ion-badge :color="netProfit < 0 ? 'danger' : 'light'" :class="{'text-dark': netProfit > 0}">{{ profitPercent }}%</ion-badge> -->
                            </div>
                            <div class="summary-profit summary-profit--border mb-2" :style="{ color: getFinancialColor(netProfit) }">{{ formatCurrency(netProfit) }}</div>
                            <div class="border-bottom mb-2"></div>
                        </div>
                        <small class="text-muted mb-2">Sisa Saldo</small>
                        <div class="summary-value summary-value--blue">{{ formatCurrency(project.balance) }}</div>
                    </div>
                </ion-col>
                <ion-col size="6" size-lg="3" v-if="(project as any).panen_total <= 0">
                    <div class="summary-card summary-card--orange shadow-soft">
                        <small class="text-muted mb-2">Total Transaksi</small>
                        <div class="summary-value summary-value--orange">{{ (project.transactions || []).length }}</div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-grid>

        <div ref="chartCarousel" class="chart-container mx-3">
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
        
        <div class="ion-padding m-3 transaction-section">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <ion-card-title class="section-title">Riwayat Transaksi</ion-card-title>
            <div class="filter-chips filter-chip-row">
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'SEMUA'" size="small">Semua <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('SEMUA') }}</ion-badge></ion-button>
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'MODAL'" size="small">Modal <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('MODAL') }}</ion-badge></ion-button>
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'EXPENSE'" size="small">Pengeluaran <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('EXPENSE') }}</ion-badge></ion-button>
              <ion-button class="btn-action primary chip-btn" fill="solid" @click="filterType = 'PENDAPATAN'" size="small">Pendapatan <ion-badge slot="end" class="ms-2 small-badge">{{ filterCount('PENDAPATAN') }}</ion-badge></ion-button>
            </div>
          </div>

          <div class="transaction-scroll pb-2">
            <div class="transaction-list d-flex flex-column gap-1">
              <template v-for="tx in filteredTransactions" :key="tx.id">
                <ion-card class="transaction-card">
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
                  <div class="transaction-amount text-end fw-bold me-2" :class="{ 'text-success': tx.type === 'DEPOSIT', 'text-danger': tx.type === 'EXPENSE' }">
                    {{ tx.type === 'DEPOSIT' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                  </div>
                  <div class="transaction-actions flex-shrink-0 d-flex justify-content-end">
                    <ion-button class="btn-action primary icon-btn" size="small" @click="openEditDialog(tx)">
                      <ion-icon :icon="pencilOutline" />
                    </ion-button>
                    <ion-button class="btn-action danger icon-btn" size="small" @click="dialogDeleteTxId = tx.id">
                      <ion-icon :icon="trashOutline" />
                    </ion-button>
                  </div>
                </div>
              </ion-card>
              </template>
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
        Buku kas tidak ditemukan.
      </div>
      <ion-alert
        :is-open="dialogDeleteTxId !== null"
        header="Konfirmasi Hapus"
        message="Apakah anda yakin ingin menghapus transaksi ini?"
        :buttons="[
          { text: 'Batal', role: 'cancel', handler: () => dialogDeleteTxId = null },
          { text: 'Hapus', role: 'destructive', handler: () => dialogDeleteTxId !== null && deleteTransaction(dialogDeleteTxId) }
        ]"
        @didDismiss="dialogDeleteTxId = null"
      />
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
        <ion-content class="ion-padding modal-content">
            <div class="form-container">
                <div class="form-section">
                    <label class="form-label">Tipe</label>
                    <select v-model="formTx.type" class="form-control app-control">
                        <option value="DEPOSIT">Modal/Pendapatan</option>
                        <option value="EXPENSE">Pengeluaran</option>
                    </select>
                </div>
                <div class="form-section">
                    <label class="form-label">Kategori</label>
                    <select v-model="formTx.category" class="form-control app-control">
                        <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>
                <div class="form-section">
                    <label class="form-label">Tanggal</label>
                    <input type="date" v-model="formTx.date" class="form-control app-control"/>
                </div>
                <div class="form-section">
                    <label class="form-label">Nominal</label>
                    <input type="number" v-model.number="formTx.amount" class="form-control app-control"/>
                </div>
                <div class="form-section">
                    <label class="form-label">Deskripsi</label>
                    <input type="text" v-model="formTx.description" class="form-control app-control form-control-textarea" />
                </div>
            </div>
        </ion-content>
        <ion-footer>
          <div class="form-actions p-3">
            <button type="button" class="btn btn-action light w-100" @click="closeDialog">Cancel</button>
            <button type="button" class="btn btn-action primary w-100 mt-2" @click="saveTransaction">Save Changes</button>
          </div>
        </ion-footer>
    </ion-modal>

    <AppToast 
        :is-open="snackbar.show" 
        :message="snackbar.text" 
        :color="snackbar.color as any" 
        @dismiss="snackbar.show = false" 
    />
  </ion-page>
</template>