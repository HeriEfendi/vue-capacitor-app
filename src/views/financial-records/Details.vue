<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  let txs = project.value.transactions || []
  if (filterType.value === 'DEPOSIT') return txs.filter(t => t.type === 'DEPOSIT')
  if (filterType.value === 'EXPENSE') return txs.filter(t => t.type === 'EXPENSE')
  return txs
})

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function fetchProject() {
  loading.value = true
  console.log('Fetching project with ID:', route.params.id)
  try {
    const projectsData = localStorage.getItem('financial_projects')
    console.log('LocalStorage data:', projectsData)
    if (projectsData) {
      const projects: Project[] = JSON.parse(projectsData)
      project.value = projects.find(p => p.id === Number(route.params.id)) || null
      console.log('Found project:', project.value)
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
      console.log('Searching for ID:', project.value!.id, 'Index found:', projectIndex)

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
}

const availableCategories = computed(() => {
  return formTx.value.type === 'DEPOSIT' ? categories.DEPOSIT : categories.EXPENSE
})

// Chart Options & Logic
const donutOptions = computed(() => ({
  chart: { type: 'donut' },
  labels: Object.keys(categoryTotals.value),
  responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
}))

const donutSeries = computed(() => Object.values(categoryTotals.value))

const categoryTotals = computed(() => {
  const totals: Record<string, number> = {}
  project.value?.transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount
  })
  return totals
})

const barOptions = computed(() => ({
  chart: { type: 'bar' },
  xaxis: { categories: ['Mei', 'Juni'] } // Example months
}))

const barSeries = computed(() => [{ name: 'Arus Kas', data: [50000, 80000] }])

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
    <CRow>
      <!-- Header -->
      <CCol xs="12">
        <div class="d-flex align-items-center gap-2 mb-1">
          <CButton variant="ghost" @click="router.back()">
            Semua Projek
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
          <CButton color="light" size="sm">⬆️ Import Excel</CButton>
          <CButton color="info" size="sm" class="text-white">⬇️ Template</CButton>
          <CButton color="success" size="sm" class="text-white">📋 Export Excel</CButton>
          <CButton color="primary" size="sm" @click="openCreateDialog">
            + Tambah Transaksi
          </CButton>
        </div>
      </div>
    </CCol>

    <!-- Summary Cards -->
    <CRow class="g-4 mt-0">
      <CCol xs="12" sm="6" md="3" class="d-flex">
        <CCard class="border-0 shadow-sm w-100 h-100" style="background-color: #e8f5e9;">
            <CCardBody class="d-flex flex-column">
                <div class="d-flex align-items-center mb-3">
                    <div class="p-2 me-2 rounded text-success" style="background: rgba(40, 167, 69, 0.1);"><CIcon :icon="icons.cilTrendingUp" size="lg" /></div>
                    <div class="text-muted fw-medium">Total Modal</div>
                </div>
                <div class="fs-4 fw-bold text-success mt-auto">{{ formatCurrency(project.total_deposits) }}</div>
            </CCardBody>
        </CCard>
      </CCol>
      <CCol xs="12" sm="6" md="3" class="d-flex">
        <CCard class="border-0 shadow-sm w-100 h-100" style="background-color: #ffebee;">
            <CCardBody class="d-flex flex-column">
                <div class="d-flex align-items-center mb-3">
                    <div class="p-2 me-2 rounded text-danger" style="background: rgba(220, 53, 69, 0.1);"><CIcon :icon="icons.cilTrendingDown" size="lg" /></div>
                    <div class="text-muted fw-medium">Total Pengeluaran</div>
                </div>
                <div class="fs-4 fw-bold text-danger mt-auto">{{ formatCurrency(project.total_expenses) }}</div>
            </CCardBody>
        </CCard>
      </CCol>
      <CCol xs="12" sm="6" md="3" class="d-flex">
        <CCard class="border-0 shadow-sm w-100 h-100" style="background-color: #e3f2fd;">
            <CCardBody class="d-flex flex-column">
                <div class="d-flex align-items-center mb-3">
                    <div class="p-2 me-2 rounded text-primary" style="background: rgba(13, 110, 253, 0.1);"><CIcon :icon="icons.cilWallet" size="lg" /></div>
                    <div class="text-muted fw-medium">Sisa Saldo</div>
                </div>
                <div class="fs-4 fw-bold text-primary mt-auto">{{ formatCurrency(project.balance) }}</div>
            </CCardBody>
        </CCard>
      </CCol>
      <CCol xs="12" sm="6" md="3" class="d-flex">
        <CCard class="border-0 shadow-sm w-100 h-100" style="background-color: #fff3e0;">
            <CCardBody class="d-flex flex-column">
                <div class="d-flex align-items-center mb-3">
                    <div class="p-2 me-2 rounded text-warning" style="background: rgba(255, 193, 7, 0.1);"><CIcon :icon="icons.cilNotes" size="lg" /></div>
                    <div class="text-muted fw-medium">Total Transaksi</div>
                </div>
                <div class="fs-4 fw-bold text-warning mt-auto">{{ project.transactions.length }}</div>
            </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Charts Row -->
    <CRow class="g-4 mb-4 mt-0">
      <CCol xs="12" md="6" class="d-flex">
        <CCard class="w-100 h-100 shadow-sm border-0">
          <CCardBody>
            <h5 class="mb-3">Distribusi Pengeluaran</h5>
            <VueApexCharts type="donut" :options="donutOptions" :series="donutSeries" />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs="12" md="6" class="d-flex">
        <CCard class="w-100 h-100 shadow-sm border-0">
          <CCardBody>
            <h5 class="mb-3">Arus Kas per Bulan</h5>
            <VueApexCharts type="bar" :options="barOptions" :series="barSeries" />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>


      <!-- Transaction Table -->
      <CCol xs="12" class="mb-4">
        <CCard>
          <CCardBody>
            <!-- Header Filter -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Riwayat Transaksi ({{ filteredTransactions.length }})</h5>
            <div class="btn-group">
                <CButton :color="filterType === 'SEMUA' ? 'primary' : 'light'" size="sm" @click="filterType = 'SEMUA'">Semua</CButton>
                <CButton :color="filterType === 'DEPOSIT' ? 'primary' : 'light'" size="sm" @click="filterType = 'DEPOSIT'">Modal</CButton>
                <CButton :color="filterType === 'EXPENSE' ? 'primary' : 'light'" size="sm" @click="filterType = 'EXPENSE'">Pengeluaran</CButton>
            </div>
          </div>

          <CTable v-if="filteredTransactions.length > 0" hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Tanggal</CTableHeaderCell>
                <CTableHeaderCell>Tipe</CTableHeaderCell>
                <CTableHeaderCell>Kategori</CTableHeaderCell>
                <CTableHeaderCell>Deskripsi</CTableHeaderCell>
                <CTableHeaderCell class="text-right">Nominal</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Aksi</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="tx in filteredTransactions" :key="tx.id">
                <CTableDataCell>{{ formatDate(tx.date) }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge :color="tx.type === 'DEPOSIT' ? 'success' : 'danger'" variant="soft">
                    {{ tx.type === 'DEPOSIT' ? '▲ Modal' : '▼ Pengeluaran' }}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell><CBadge color="primary" variant="soft">{{ tx.category }}</CBadge></CTableDataCell>
                <CTableDataCell>{{ tx.description || '-' }}</CTableDataCell>
                <CTableDataCell class="text-right font-weight-bold" :class="tx.type === 'DEPOSIT' ? 'text-success' : 'text-danger'">
                  {{ tx.type === 'DEPOSIT' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </CTableDataCell>
                <CTableDataCell class="text-center">
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
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </template>

  <template v-else>
    <CRow class="text-center py-16">
      <CCol>
        <h2>Projek tidak ditemukan</h2>
        <p>Projek yang Anda cari tidak ada atau telah dihapus.</p>
        <CButton color="primary" @click="router.back()">Kembali ke Semua Projek</CButton>
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
                <CFormSelect v-model="formTx.type">
                    <option value="DEPOSIT">Modal</option>
                    <option value="EXPENSE">Pengeluaran</option>
                </CFormSelect>
            </div>
            <div class="mb-3">
                <CFormLabel>Kategori</CFormLabel>
                <CFormSelect v-model="formTx.category" :options="availableCategories"></CFormSelect>
            </div>
            <div class="mb-3">
                <CFormLabel>Nominal</CFormLabel>
                <CFormInput type="number" v-model.number="formTx.amount" placeholder="Contoh: 100000" />
            </div>
            <div class="mb-3">
                <CFormLabel>Tanggal</CFormLabel>
                <CFormInput type="date" v-model="formTx.date" />
            </div>
            <div class="mb-3">
                <CFormLabel>Deskripsi</CFormLabel>
                <CFormTextarea v-model="formTx.description"></CFormTextarea>
            </div>
        </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeDialog">Batal</CButton>
      <CButton :color="formTx.type === 'DEPOSIT' ? 'success' : 'danger'" :disabled="submitting" @click="saveTransaction">
        {{ editingTxId ? 'Simpan Perubahan' : 'Simpan Transaksi' }}
      </CButton>
    </CModalFooter>
  </CModal>

  <!-- Dialog: Konfirmasi Hapus -->
  <CModal :visible="dialogDeleteTxId" @close="dialogDeleteTxId = null">
    <CModalHeader>Hapus Transaksi</CModalHeader>
    <CModalBody>
      Apakah Anda yakin ingin menghapus transaksi ini? Saldo projek akan diperbarui secara otomatis.
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="dialogDeleteTxId = null">Batal</CButton>
      <CButton color="danger" @click="deleteTransaction(dialogDeleteTxId!)">Hapus</CButton>
    </CModalFooter>
  </CModal>
</template>
