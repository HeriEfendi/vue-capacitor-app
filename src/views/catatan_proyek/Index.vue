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
const dialogEdit = ref(false)
const editingId = ref<number | null>(null)
const dialogDeleteId = ref<number | null>(null)
const snackbar = ref({ show: false, text: '', color: 'success' })

const formNew = ref({ name: '', description: '', status: 'Active' })
const formEdit = ref({ name: '', description: '', status: 'Active' })
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
  router.push(`/catatan_proyek/${id}`)
}

function openEditProject(p: Project) {
  editingId.value = p.id
  formEdit.value = { name: p.name, description: p.description || '', status: p.status }
  dialogEdit.value = true
}

async function updateProject() {
  if (!editingId.value || !formEdit.value.name.trim()) return
  submitting.value = true
  try {
    const pIndex = projects.value.findIndex(p => p.id === editingId.value)
    if (pIndex !== -1) {
      projects.value[pIndex] = { ...projects.value[pIndex], ...formEdit.value }
      localStorage.setItem('financial_projects', JSON.stringify(projects.value))
      dialogEdit.value = false
      showSnackbar('Projek berhasil diupdate!', 'success')
    }
  } catch (e) {
    showSnackbar('Gagal mengupdate projek', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchProjects)
</script>

<template>
  <CRow class="mt-4">
    <!-- Header -->
    <CCol xs="12" class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-h4 font-weight-bold">Catatan Proyek</h2>
        <p class="text-subtitle-2 text-disabled mt-1 mb-0">Kelola keuangan semua projek Anda</p>
      </div>
      <button
        class="btn btn-outline-primary status-select"
        @click="dialogCreate = true"
      >
        <i class="fas fa-plus"></i> Buat Projek
      </button>
    </CCol>

    <!-- Summary Cards -->

    <CCol xs="6" sm="4" md="3" class="d-flex mb-4">
      <CCard class="border-0 shadow-sm p-0 w-100" style="background-color: #e8f5e9;">
        <CCardBody class="d-flex flex-column">
          <div class="d-flex align-items-center mb-1">
            <div
              class="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
              style="width: 45px; height: 45px;"
            >
              <CIcon :icon="icons.cilMoney" size="lg" class="text-success" />
            </div>              
            <div class="text-muted fw-medium small">Total Modal Semua Projek</div>
          </div>
          <div class="mt-auto text-center fs-5 fw-bold text-success">{{ formatCurrency(totalDepositsAll) }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="6" sm="4" md="3" class="d-flex mb-4">
      <CCard class="border-0 shadow-sm p-0 w-100" style="background-color: #ffebee;">
        <CCardBody class="d-flex flex-column">
          <div class="d-flex align-items-center mb-1">
            <div
              class="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
              style="width: 45px; height: 45px;"
            >
              <CIcon :icon="icons.cilMoney" size="lg" class="text-danger" />
            </div>              
            <div class="text-muted fw-medium small">Total Pengeluaran Semua Projek</div>
          </div>
          <div class="mt-auto text-center fs-5 fw-bold text-danger">{{ formatCurrency(totalExpensesAll) }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12" sm="4" md="3" class="d-flex mb-4">
      <CCard class="border-0 shadow-sm p-0 w-100" style="background-color: #e3f2fd;">
        <CCardBody class="d-flex flex-column">
          <div class="d-flex justify-content-center align-items-center mb-1">
            <div
              class="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
              style="width: 45px; height: 45px;"
            >
              <CIcon :icon="icons.cilWallet" size="lg" class="text-primary" />
            </div>              
            <div class="text-muted fw-medium small">Total Sisa Saldo Semua Projek</div>
          </div>
          <div class="mt-auto text-center fs-5 fw-bold text-primary">{{ formatCurrency(totalBalanceAll) }}</div>
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
      <button class="btn btn-outline-primary status-select" @click="dialogCreate = true">Buat Projek Pertama</button>
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
            <div class="d-flex gap-2">
                <button
                  class="btn btn-sm btn-outline-primary status-select"
                  @click.stop="openEditProject(project)"
                ><i class="fas fa-edit"></i></button>
                <button
                  class="btn btn-sm btn-outline-danger status-select"
                  @click.stop="dialogDeleteId = project.id"
                ><i class="fas fa-trash"></i></button>
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
            <button
              class="btn btn-sm btn-outline-primary status-select"
              @click.stop="goToDetail(project.id)"
            >
              <i class="fas fa-arrow-right"></i>
            </button>
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
        <button class="btn btn-secondary status-select" @click="dialogCreate = false"><i class="fas fa-times me-2"></i>Batal</button>
        <button class="btn btn-primary status-select" :disabled="submitting" @click="createProject"><i class="fas fa-plus me-2"></i>Buat Projek</button>
    </CModalFooter>
  </CModal>

    <!-- Dialog: Konfirmasi Hapus -->
    <CModal :visible="dialogDeleteId !== null" @close="dialogDeleteId = null">
    <CModalHeader>
        Hapus Projek
    </CModalHeader>
    <CModalBody>
        Apakah Anda yakin ingin menghapus projek ini beserta seluruh catatan transaksinya? Tindakan ini tidak dapat dibatalkan.
    </CModalBody>
    <CModalFooter>
        <button class="btn btn-secondary status-select" @click="dialogDeleteId = null">Batal</button>
        <button class="btn btn-danger status-select" @click="deleteProject(dialogDeleteId!)">Ya, Hapus</button>
    </CModalFooter>
    </CModal>

    <!-- Dialog: Edit Projek -->
    <CModal :visible="dialogEdit" @close="dialogEdit = false">
    <CModalHeader>Edit Projek</CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="updateProject">
        <CFormInput v-model="formEdit.name" label="Nama Projek" class="mb-3" size="lg" />
        <CFormTextarea v-model="formEdit.description" label="Deskripsi" rows="3" class="mb-3" size="lg" />
        <CFormSelect v-model="formEdit.status" label="Status" size="lg" :options="[{ label: 'Aktif', value: 'Active' }, { label: 'Selesai', value: 'Completed' }]" />
      </CForm>
    </CModalBody>
    <CModalFooter>
        <button class="btn btn-secondary status-select" @click="dialogEdit = false"><i class="fas fa-times me-2"></i>Batal</button>
        <button class="btn btn-primary status-select" :disabled="submitting" @click="updateProject"><i class="fas fa-save me-2"></i>Simpan</button>
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
