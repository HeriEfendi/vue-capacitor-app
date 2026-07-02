<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import {
  CButton,
  CCard,
  CCardBody,
  CBadge,
  CProgress,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CRow,
  CCol,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/vue'
import VueApexCharts from 'vue3-apexcharts'
import { CIcon } from '@coreui/icons-vue'
import * as icons from '@coreui/icons'

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
const filterType = ref<'SEMUA' | 'DEPOSIT' | 'EXPENSE'>('SEMUA')

const categories = {
  DEPOSIT: ['Modal Awal', 'Pinjaman', 'Investor', 'Keuntungan', 'Transfer', 'Lainnya'],
  EXPENSE: ['Material / Bahan', 'Upah / Tenaga Kerja', 'Peralatan', 'Transportasi', 'Operasional', 'Administrasi', 'Tak Terduga', 'Lainnya'],
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
  if (filterType.value === 'DEPOSIT') txs = txs.filter(t => t.type === 'DEPOSIT')
  if (filterType.value === 'EXPENSE') txs = txs.filter(t => t.type === 'EXPENSE')
  
  return txs.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    // Same date: EXPENSE (-1) before DEPOSIT (1)
    const typeA = a.type === 'EXPENSE' ? -1 : 1
    const typeB = b.type === 'EXPENSE' ? -1 : 1
    return typeA - typeB
  })
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function fetchProject() {
  loading.value = true
  try {
    const projectsData = localStorage.getItem('financial_projects')
    if (projectsData) {
      const projects: Project[] = JSON.parse(projectsData)
      project.value = projects.find(p => p.id === Number(route.params.id)) || null
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
    const projectsData = localStorage.getItem('financial_projects')
    if (projectsData && project.value) {
      const projects: Project[] = JSON.parse(projectsData)
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
        p.total_deposits = p.transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0);
        p.total_expenses = p.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
        p.balance = p.total_deposits - p.total_expenses;

        localStorage.setItem('financial_projects', JSON.stringify(projects))
        await fetchProject()
        closeDialog()
        showSnackbar('Transaksi berhasil disimpan!', 'success')
      }
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
        const projectsData = localStorage.getItem('financial_projects');
        if (projectsData && project.value) {
            let projects: Project[] = JSON.parse(projectsData);
            const projectIndex = projects.findIndex(p => p.id === project.value!.id);

            if (projectIndex !== -1) {
                projects[projectIndex].transactions = projects[projectIndex].transactions.filter(t => t.id !== id);
                
                // Recalculate totals
                const p = projects[projectIndex];
                p.total_deposits = p.transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0);
                p.total_expenses = p.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
                p.balance = p.total_deposits - p.total_expenses;

                localStorage.setItem('financial_projects', JSON.stringify(projects));
                await fetchProject();
                dialogDeleteTxId.value = null;
                showSnackbar('Transaksi berhasil dihapus', 'success');
            }
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
      try {
        project.value.transactions.push(...newTransactions)
        // Recalculate and save to localStorage logic
        const projectsData = localStorage.getItem('financial_projects')
        if (projectsData) {
            const projects: Project[] = JSON.parse(projectsData)
            const pIndex = projects.findIndex(p => p.id === project.value!.id)
            if (pIndex !== -1) {
                projects[pIndex].transactions = project.value.transactions
                projects[pIndex].total_deposits = projects[pIndex].transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0)
                projects[pIndex].total_expenses = projects[pIndex].transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
                projects[pIndex].balance = projects[pIndex].total_deposits - projects[pIndex].total_expenses
                localStorage.setItem('financial_projects', JSON.stringify(projects))
                showSnackbar('Transaksi berhasil diimpor!', 'success')
                fetchProject()
            } else {
                throw new Error('Projek tidak ditemukan')
            }
        }
      } catch (e) {
        console.error(e)
        showSnackbar('Gagal menyimpan transaksi impor', 'error')
      }
    }
  }
  reader.readAsArrayBuffer(file)
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Tipe', 'Kategori', 'Nominal', 'Tanggal (DD/MM/YYYY)', 'Deskripsi'],
    ['DEPOSIT', 'Modal Awal', 1000000, '01/07/2026', 'Modal Awal'],
    ['EXPENSE', 'Material / Bahan', 500000, '02/07/2026', 'Semen']
  ])
  ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 30 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, 'Template_Transaksi.xlsx')
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
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi')
  XLSX.writeFile(wb, 'Riwayat_Transaksi.xlsx')
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
  return formTx.value.type === 'DEPOSIT' ? categories.DEPOSIT : categories.EXPENSE
})

// Chart Options & Logic
const donutOptions = computed(() => ({
  chart: { 
    type: 'donut', 
    height: 250,
    width: '100%' 
  },
  labels: Object.keys(categoryTotals.value),
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
  project.value.transactions.forEach(t => {
    const month = new Date(t.date).toLocaleDateString('id-ID', { month: 'short' })
    monthlyData[month] = (monthlyData[month] || 0) + (t.type === 'DEPOSIT' ? t.amount : -t.amount)
  })

  return {
    chart: { 
      type: 'bar',
      height: 250,
      width: '100%',
      toolbar: { show: false } 
    },
    dataLabels: {
      enabled: true,
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
  project.value.transactions.forEach(t => {
    const month = new Date(t.date).toLocaleDateString('id-ID', { month: 'short' })
    monthlyData[month] = (monthlyData[month] || 0) + (t.type === 'DEPOSIT' ? t.amount : -t.amount)
  })

  return [{ 
    name: 'Arus Kas', 
    data: Object.values(monthlyData) 
  }]
})

onMounted(fetchProject)
</script>

<template>
  <template v-if="loading">
    <div class="text-center py-16">
      <CSpinner color="primary" size="lg" />
      <p class="text-body-2 text-disabled mt-4">Memuat data projek...</p>
    </div>
  </template>

  <template v-else-if="project">
    <div class="px-3">
      <CRow>
        <CCol xs="12">
          <div class="d-flex align-items-center gap-2 mb-1">
            <CButton color="secondary" size="sm" @click="router.back()">
              <CIcon :icon="icons.cilArrowLeft" class="me-1" /> Semua Projek
            </CButton>
          </div>
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mt-2">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <h2 class="text-h4 font-weight-bold">{{ project.name }}</h2>
                <CBadge :color="project.status === 'Active' ? 'success' : 'secondary'">
                  {{ project.status === 'Active' ? 'Aktif' : 'Selesai' }}
                </CBadge>
              </div>
              <p class="text-body-2 text-disabled mb-0">{{ project.description || 'Tidak ada deskripsi' }}</p>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <CButton color="warning" size="sm" class="text-white" @click="handleImport"><CIcon :icon="icons.cilCloudUpload" class="me-1" /> Import Excel</CButton>
              <input type="file" ref="fileInput" class="d-none" @change="onFileChange" accept=".xlsx, .xls" />
              <CButton color="info" size="sm" class="text-white" @click="downloadTemplate"><CIcon :icon="icons.cilCloudDownload" class="me-1" /> Template</CButton>
              <CButton color="success" size="sm" class="text-white" @click="exportToExcel"><CIcon :icon="icons.cilSpreadsheet" class="me-1" /> Export Excel</CButton>
              <CButton color="primary" size="sm" @click="openCreateDialog">
                <CIcon :icon="icons.cilPlus" class="me-1" /> Tambah Transaksi
              </CButton>
            </div>
          </div>
        </CCol>
      </CRow>

      <CRow class="g-4 mt-0">
        <CCol xs="12" sm="6" md="3" class="d-flex">
          <CCard class="border-0 shadow-sm p-3 w-100" style="background-color: #e8f5e9;">
              <CCardBody class="d-flex flex-column">
                  <div class="d-flex align-items-center mb-1">
                      <div class="p-1 me-2 rounded text-success" style="background: rgba(40, 167, 69, 0.1);"><CIcon :icon="icons.cilMoney" size="sm" /></div>
                      <div class="text-muted fw-medium small">Total Modal</div>
                  </div>
                  <div class="fs-6 fw-bold text-success">{{ formatCurrency(project.total_deposits) }}</div>
              </CCardBody>
          </CCard>
        </CCol>
        <CCol xs="12" sm="6" md="3" class="d-flex">
          <CCard class="border-0 shadow-sm p-3 w-100" style="background-color: #ffebee;">
              <CCardBody class="d-flex flex-column">
                  <div class="d-flex align-items-center mb-1">
                      <div class="p-1 me-2 rounded text-danger" style="background: rgba(220, 53, 69, 0.1);"><CIcon :icon="icons.cilMoney" size="sm" /></div>
                      <div class="text-muted fw-medium small">Total Pengeluaran</div>
                  </div>
                  <div class="fs-6 fw-bold text-danger">{{ formatCurrency(project.total_expenses) }}</div>
              </CCardBody>
          </CCard>
        </CCol>
        <CCol xs="12" sm="6" md="3" class="d-flex">
          <CCard class="border-0 shadow-sm p-3 w-100" style="background-color: #e3f2fd;">
              <CCardBody class="d-flex flex-column">
                  <div class="d-flex align-items-center mb-1">
                      <div class="p-1 me-2 rounded text-primary" style="background: rgba(13, 110, 253, 0.1);"><CIcon :icon="icons.cilWallet" size="sm" /></div>
                      <div class="text-muted fw-medium small">Sisa Saldo</div>
                  </div>
                  <div class="fs-6 fw-bold text-primary">{{ formatCurrency(project.balance) }}</div>
              </CCardBody>
          </CCard>
        </CCol>
        <CCol xs="12" sm="6" md="3" class="d-flex">
          <CCard class="border-0 shadow-sm p-3 w-100 " style="background-color: #fff3e0;">
              <CCardBody class="d-flex flex-column">
                  <div class="d-flex align-items-center mb-1">
                      <div class="p-1 me-2 rounded text-warning" style="background: rgba(255, 193, 7, 0.1);"><CIcon :icon="icons.cilNotes" size="sm" /></div>
                      <div class="text-muted fw-medium small">Total Transaksi</div>
                  </div>
                  <div class="fs-6 fw-bold text-warning">{{ project.transactions.length }}</div>
              </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow class="g-4 mb-4 mt-0">
        <CCol xs="12" md="6" class="d-flex">
          <CCard class="w-100 h-100 shadow-sm border-0">
            <CCardBody style="max-height: 400px; max-width: 500px; overflow: hidden;">
              <h6 class="mb-3">Distribusi Pengeluaran</h6>
              <VueApexCharts type="donut" :options="donutOptions" :series="donutSeries" />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs="12" md="6" class="d-flex">
          <CCard class="w-100 h-100 shadow-sm border-0">
            <CCardBody style="max-height: 400px; max-width: 500px; overflow: hidden;">
              <h6 class="mb-3">Arus Kas per Bulan</h6>
              <VueApexCharts type="bar" :options="barOptions" :series="barSeries" />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCol xs="12" class="mb-4">
        <CCard>
          <CCardBody class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Riwayat Transaksi ({{ filteredTransactions.length }})</h5>
              <div class="btn-group">
                  <CButton :color="filterType === 'SEMUA' ? 'primary' : 'light'" size="sm" @click="filterType = 'SEMUA'">Semua</CButton>
                  <CButton :color="filterType === 'DEPOSIT' ? 'primary' : 'light'" size="sm" @click="filterType = 'DEPOSIT'">Modal</CButton>
                  <CButton :color="filterType === 'EXPENSE' ? 'primary' : 'light'" size="sm" @click="filterType = 'EXPENSE'">Pengeluaran</CButton>
              </div>
            </div>

            <div class="table-responsive d-block w-100" style="overflow-x: auto; -webkit-overflow-scrolling: touch; min-width: 600px;">
              <CTable v-if="filteredTransactions.length > 0" hover style="min-width: 700px;">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell class="px-5">Tanggal</CTableHeaderCell>
                    <CTableHeaderCell class="px-5">Tipe</CTableHeaderCell>
                    <CTableHeaderCell class="px-5">Kategori</CTableHeaderCell>
                    <CTableHeaderCell class="px-5">Deskripsi</CTableHeaderCell>
                    <CTableHeaderCell class="px-5 text-right">Nominal</CTableHeaderCell>
                    <CTableHeaderCell class="px-5 text-center">Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="tx in filteredTransactions" :key="tx.id">
                    <CTableDataCell class="px-5 text-nowrap">{{ formatDate(tx.date) }}</CTableDataCell>
                    <CTableDataCell class="px-5 text-nowrap">
                      <CBadge :color="tx.type === 'DEPOSIT' ? 'success' : 'danger'" variant="soft">
                        {{ tx.type === 'DEPOSIT' ? '▲ Modal' : '▼ Pengeluaran' }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="px-5 text-nowrap"><CBadge color="primary" variant="soft">{{ tx.category }}</CBadge></CTableDataCell>
                    <CTableDataCell class="px-5 text-nowrap">{{ tx.description || '-' }}</CTableDataCell>
                    <CTableDataCell class="px-5 text-nowrap text-right font-weight-bold" :class="tx.type === 'DEPOSIT' ? 'text-success' : 'text-danger'">
                      {{ tx.type === 'DEPOSIT' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                    </CTableDataCell>
                    <CTableDataCell class="px-5 text-nowrap text-center">
                      <CButton color="primary" size="sm" class="me-1" @click="openEditDialog(tx)">Edit</CButton>
                      <CButton color="danger" size="sm" @click="dialogDeleteTxId = tx.id">Hapus</CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
              <div v-else class="text-center text-disabled py-8">
                <p class="text-body-2">Belum ada transaksi</p>
                <CButton color="primary" size="sm" class="mt-2" @click="openCreateDialog">
                  + Tambah Transaksi Pertama
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </div>
  </template>

  <template v-else>
    <CRow class="text-center py-16">
      <CCol>
        <h2>Projek tidak ditemukan</h2>
        <p>Projek yang Anda cari tidak ada atau telah dihapus.</p>
        <CButton color="primary" size="sm" @click="router.back()">Kembali ke Semua Projek</CButton>
      </CCol>
    </CRow>
  </template>

  <!-- Dialog: Tambah / Edit Transaksi -->
  <CModal :visible="dialogTransaction" @close="closeDialog" >
    <CModalHeader>{{ editingTxId ? 'Edit Transaksi' : 'Tambah Transaksi' }}</CModalHeader>
    <CModalBody>
        <CForm>
            <div class="mb-3">
                <CFormLabel>Tipe Transaksi</CFormLabel>
                <CFormSelect v-model="formTx.type" size="sm">
                    <option value="DEPOSIT">Modal</option>
                    <option value="EXPENSE">Pengeluaran</option>
                </CFormSelect>
            </div>
            <div class="mb-3">
                <CFormLabel>Kategori</CFormLabel>
                <CFormSelect v-model="formTx.category" size="sm" :options="availableCategories"></CFormSelect>
            </div>
            <div class="mb-3">
                <CFormLabel>Nominal</CFormLabel>
                <CFormInput type="number" v-model.number="formTx.amount" size="sm" placeholder="Contoh: 100000" />
            </div>
            <div class="mb-3">
                <CFormLabel>Tanggal</CFormLabel>
                <CFormInput type="date" v-model="formTx.date" size="sm" />
            </div>
            <div class="mb-3">
                <CFormLabel>Deskripsi</CFormLabel>
                <CFormTextarea v-model="formTx.description" size="sm"></CFormTextarea>
            </div>
        </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" size="sm" @click="closeDialog">Batal</CButton>
      <CButton :color="formTx.type === 'DEPOSIT' ? 'success' : 'danger'" size="sm" :disabled="submitting" @click="saveTransaction">
        {{ editingTxId ? 'Simpan Perubahan' : 'Simpan Transaksi' }}
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Dialog: Konfirmasi Hapus -->
    <CModal :visible="dialogDeleteTxId !== null" @close="dialogDeleteTxId = null">
      <CModalHeader>Hapus Transaksi</CModalHeader>
      <CModalBody>
        Apakah Anda yakin ingin menghapus transaksi ini? Saldo projek akan diperbarui secara otomatis.
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" size="sm" @click="dialogDeleteTxId = null">Batal</CButton>
        <CButton color="danger" size="sm" @click="deleteTransaction(dialogDeleteTxId!)">Hapus</CButton>
      </CModalFooter>
    </CModal>

    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1100">
      <div class="toast show" v-if="snackbar.show" role="alert">
        <div class="toast-header" :class="snackbar.color === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
          <strong class="me-auto">{{ snackbar.color === 'success' ? 'Berhasil' : 'Error' }}</strong>
          <button type="button" class="btn-close" @click="snackbar.show = false"></button>
        </div>
        <div class="toast-body">{{ snackbar.text }}</div>
      </div>
    </div>
  </template>
