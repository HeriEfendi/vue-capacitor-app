<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  CSpinner
} from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import * as icons from '@coreui/icons'

interface Project {
  id: number
  name: string
  description: string | null
  status: string
  total_deposits: number
  total_expenses: number
  balance: number
  created_at: string
}

const router = useRouter()

const projects = ref<Project[]>([])
const loading = ref(false)
const dialogCreate = ref(false)
const dialogDeleteId = ref<number | null>(null)
const snackbar = ref({ show: false, text: '', color: 'success' })

const formNew = ref({ name: '', description: '', status: 'Active' })
const submitting = ref(false)

// Summary computed
const totalDepositsAll = computed(() => projects.value.reduce((acc, p) => acc + p.total_deposits, 0))
const totalExpensesAll = computed(() => projects.value.reduce((acc, p) => acc + p.total_expenses, 0))
const totalBalanceAll = computed(() => totalDepositsAll.value - totalExpensesAll.value)

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function getBalancePercent(project: Project) {
  if (project.total_deposits === 0) return 0
  return Math.min(100, Math.round((project.balance / project.total_deposits) * 100))
}

function getBalanceColor(project: Project) {
  const pct = getBalancePercent(project)
  if (pct > 50) return 'success'
  if (pct > 20) return 'warning'
  return 'error'
}

function getStatusColor(status: string) {
  return status === 'Active' ? 'success' : 'secondary'
}

async function fetchProjects() {
  loading.value = true
  try {
    const data = localStorage.getItem('financial_projects')
    projects.value = data ? JSON.parse(data) : []
  } catch (e) {
    showSnackbar('Gagal memuat data projek', 'error')
  } finally {
    loading.value = false
  }
}

async function createProject() {
  if (!formNew.value.name.trim()) return
  submitting.value = true
  try {
    const newProject: Project = {
      id: Date.now(),
      name: formNew.value.name,
      description: formNew.value.description,
      status: formNew.value.status,
      total_deposits: 0,
      total_expenses: 0,
      balance: 0,
      created_at: new Date().toISOString(),
      transactions: []
    }
    projects.value.unshift(newProject)
    localStorage.setItem('financial_projects', JSON.stringify(projects.value))
    dialogCreate.value = false
    formNew.value = { name: '', description: '', status: 'Active' }
    showSnackbar('Projek berhasil dibuat!', 'success')
  } catch (e) {
    showSnackbar('Gagal membuat projek', 'error')
  } finally {
    submitting.value = false
  }
}

async function deleteProject(id: number) {
  try {
    projects.value = projects.value.filter(p => p.id !== id)
    localStorage.setItem('financial_projects', JSON.stringify(projects.value))
    dialogDeleteId.value = null
    showSnackbar('Projek berhasil dihapus', 'success')
  } catch (e) {
    showSnackbar('Gagal menghapus projek', 'error')
  }
}

function showSnackbar(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}

function goToDetail(id: number) {
  router.push(`/financial-records/${id}`)
}

onMounted(fetchProjects)
</script>

<template>
  <CRow>
    <!-- Header -->
    <CCol xs="12" class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-h4 font-weight-bold">Catatan Keuangan</h2>
        <p class="text-subtitle-2 text-disabled mt-1 mb-0">Kelola keuangan semua projek Anda</p>
      </div>
      <CButton
        color="primary"
        size="lg"
        @click="dialogCreate = true"
      >
        Buat Projek Baru
      </CButton>
    </CCol>

    <!-- Summary Cards -->
    <CCol xs="12" md="4" class="d-flex mb-4">
      <CCard class="border-0 shadow-sm p-3 w-100" style="background-color: #e8f5e9;">
        <CCardBody class="d-flex flex-column">
            <div class="d-flex align-items-center mb-1">
                <div class="p-1 me-2 rounded text-success" style="background: rgba(40, 167, 69, 0.1);"><CIcon :icon="icons.cilMoney" size="lg" /></div>
                <div class="text-muted fw-medium small">Total Modal Semua Projek</div>
            </div>
            <div class="fs-6 fw-bold text-success">{{ formatCurrency(totalDepositsAll) }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12" md="4" class="d-flex mb-4">
      <CCard class="border-0 shadow-sm p-3 w-100" style="background-color: #ffebee;">
        <CCardBody class="d-flex flex-column">
            <div class="d-flex align-items-center mb-1">
                <div class="p-1 me-2 rounded text-danger" style="background: rgba(220, 53, 69, 0.1);"><CIcon :icon="icons.cilMoney" size="lg" /></div>
                <div class="text-muted fw-medium small">Total Pengeluaran Semua Projek</div>
            </div>
            <div class="fs-6 fw-bold text-danger">{{ formatCurrency(totalExpensesAll) }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12" md="4" class="d-flex mb-4">
      <CCard class="border-0 shadow-sm p-3 w-100" style="background-color: #e3f2fd;">
        <CCardBody class="d-flex flex-column">
            <div class="d-flex align-items-center mb-1">
                <div class="p-1 me-2 rounded text-primary" style="background: rgba(13, 110, 253, 0.1);"><CIcon :icon="icons.cilWallet" size="lg" /></div>
                <div class="text-muted fw-medium small">Total Sisa Saldo Semua Projek</div>
            </div>
            <div class="fs-6 fw-bold text-primary">{{ formatCurrency(totalBalanceAll) }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Loading -->
    <CCol v-if="loading" xs="12" class="text-center py-8">
      <CSpinner color="primary" />
      <p class="text-body-2 text-disabled mt-3">Memuat data projek...</p>
    </CCol>

    <!-- Project Cards Grid -->
    <CCol v-if="!loading && projects.length === 0" xs="12" class="text-center py-12">
      <p class="text-h6 text-disabled">Belum ada projek keuangan</p>
      <p class="text-body-2 text-disabled mb-4">Klik tombol "Buat Projek Baru" untuk memulai mencatat keuangan projek Anda</p>
      <CButton color="primary" @click="dialogCreate = true">Buat Projek Pertama</CButton>
    </CCol>

    <CCol
      v-for="project in projects"
      :key="project.id"
      xs="12"
      sm="6"
      lg="4"
      class="mb-4"
    >
      <CCard
        class="project-card h-100"
        @click="goToDetail(project.id)"
        style="cursor: pointer;"
      >
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <CBadge :color="getStatusColor(project.status)" size="small">
              {{ project.status === 'Active' ? 'Aktif' : 'Selesai' }}
            </CBadge>
            <div>
                <CButton
                  color="danger"
                  size="lg"
                  @click.stop="dialogDeleteId = project.id"
                >Hapus</CButton>
                
            </div>
          </div>

          <h3 class="text-h6 font-weight-bold mb-1 text-truncate">{{ project.name }}</h3>
          <p class="text-caption text-disabled mb-4 text-truncate">{{ project.description || 'Tidak ada deskripsi' }}</p>

          <div class="d-flex justify-content-between mb-2">
            <span class="text-caption text-disabled">Modal</span>
            <span class="text-caption font-weight-bold text-success">{{ formatCurrency(project.total_deposits) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-3">
            <span class="text-caption text-disabled">Pengeluaran</span>
            <span class="text-caption font-weight-bold text-error">{{ formatCurrency(project.total_expenses) }}</span>
          </div>

          <div class="mb-2">
            <div class="d-flex justify-content-between mb-1">
              <span class="text-caption text-disabled">Sisa Dana</span>
              <span class="text-caption font-weight-bold" :class="`text-${getBalanceColor(project)}`">
                {{ getBalancePercent(project) }}%
              </span>
            </div>
            <CProgress
              :value="getBalancePercent(project)"
              :color="getBalanceColor(project)"
              
            />
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <span class="text-body-2 font-weight-bold" :class="project.balance >= 0 ? 'text-success' : 'text-error'">
              {{ formatCurrency(project.balance) }}
            </span>
            <CButton
              color="primary"
              size="lg"
              @click.stop="goToDetail(project.id)"
            >
              Detail
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Dialog: Buat Projek Baru -->
  <CModal :visible="dialogCreate" @close="dialogCreate = false">
    <CModalHeader>Buat Projek Keuangan Baru</CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="createProject">
        <CFormInput
          v-model="formNew.name"
          label="Nama Projek"
          placeholder="cth: Bangun Rumah, Tambak Udang 2025..."
          class="mb-4"
          size="lg"
          autofocus
        />
        <CFormTextarea
          v-model="formNew.description"
          label="Deskripsi (Opsional)"
          placeholder="Keterangan singkat tentang projek ini..."
          rows="3"
          class="mb-4"
          size="lg"
        />
        <CFormSelect
          v-model="formNew.status"
          label="Status Projek"
          size="lg"
          :options="[{ label: 'Aktif', value: 'Active' }, { label: 'Selesai', value: 'Completed' }]"
        />
      </CForm>
    </CModalBody>
    <CModalFooter>
        <CButton color="secondary" size="lg" @click="dialogCreate = false">Batal</CButton>
        <CButton color="primary" size="lg" :disabled="submitting" @click="createProject">Buat Projek</CButton>
    </CModalFooter>
  </CModal>

  <!-- Dialog: Konfirmasi Hapus -->
    <CModal :visible="dialogDeleteId" @close="dialogDeleteId = null">
    <CModalHeader>
        Hapus Projek
    </CModalHeader>
    <CModalBody>
        Apakah Anda yakin ingin menghapus projek ini beserta seluruh catatan transaksinya? Tindakan ini tidak dapat dibatalkan.
    </CModalBody>
    <CModalFooter>
        <CButton color="secondary" size="lg" @click="dialogDeleteId = null">Batal</CButton>
        <CButton color="danger" size="lg" @click="deleteProject(dialogDeleteId!)">Ya, Hapus</CButton>
    </CModalFooter>
    </CModal>

</template>

<style scoped>
.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}
</style>
