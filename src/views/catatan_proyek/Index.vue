<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { initDB } from '@/db'
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonProgressBar, IonBadge, IonSpinner } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline, arrowForwardOutline, walletOutline, cashOutline, closeOutline, saveOutline } from 'ionicons/icons';

interface Project {
  id: number
  name: string
  description: string | null
  status: string
  total_deposits: number
  total_expenses: number
  balance: number
  created_at: string
  transactions: any[]
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
  if (status === 'Active' || status === 'Aktif') return 'success'
  if (status === 'Completed' || status === 'Selesai') return 'primary'
  if (status === 'Pending' || status === 'Tunda') return 'warning'
  return 'secondary'
}

async function fetchProjects() {
  loading.value = true
  try {
    const db = await initDB()
    projects.value = await db.getAll('projects') || []
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
      transactions: [],
    }
    projects.value.unshift(newProject)
    const db = await initDB()
    await db.put('projects', newProject)
    dialogCreate.value = false
    formNew.value = { name: '', description: '', status: 'Active' }
    showSnackbar('Projek berhasil dibuat!', 'success')
  } catch (e) {
    showSnackbar('Gagal memAdd Project', 'error')
  } finally {
    submitting.value = false
  }
}

async function deleteProject(id: number) {
  try {
    projects.value = projects.value.filter(p => p.id !== id)
    const db = await initDB()
    await db.delete('projects', id)
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
      const db = await initDB()
      await db.put('projects', projects.value[pIndex])
      dialogEdit.value = false
      showSnackbar('Projek berhasil diupdate!', 'success')
      closeModal()
    }
  } catch (e) {
    showSnackbar('Gagal mengupdate projek', 'error')
  } finally {
    submitting.value = false
  }
}

function closeModal() {
  dialogCreate.value = false
  dialogEdit.value = false
  editingId.value = null
}

const activeProject = computed(() => dialogEdit.value ? formEdit.value : formNew.value)
onMounted(fetchProjects)
</script>

<template>
  <ion-page>
    <ion-header>
        <ion-toolbar class="ion-padding-horizontal">
            <ion-title>Manajemen Proyek</ion-title>
            <ion-title class="text-muted" style="font-size: 0.9rem;">Kelola keuangan semua projek Anda</ion-title>
            <ion-buttons slot="end">
                <ion-button class="btn-action primary me-3" @click="dialogCreate = true">
                    <ion-icon slot="start" :icon="addOutline" /> Add Project
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">

        <ion-grid>
            <ion-row class="p-2">
                <ion-col size="6">
                    <div class="summary-card shadow-soft" style="background-color: #e8f5e9;">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <div class="icon-box-small" style="background-color: #c8e6c9; color: #2e7d32;"><ion-icon :icon="walletOutline" /></div>
                            <small class="text-muted" style="line-height: 1.2;">Total Modal<br>Semua Projek</small>
                        </div>
                        <div class="fw-bold" style="color: #2e7d32; font-size: 1.2rem;">{{ formatCurrency(totalDepositsAll) }}</div>
                    </div>
                </ion-col>
                <ion-col size="6">
                    <div class="summary-card shadow-soft" style="background-color: #ffebee;">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <div class="icon-box-small" style="background-color: #ffcdd2; color: #c62828;"><ion-icon :icon="walletOutline" /></div>
                            <small class="text-muted" style="line-height: 1.2;">Total Pengeluaran<br>Semua Projek</small>
                        </div>
                        <div class="fw-bold" style="color: #c62828; font-size: 1.2rem;">{{ formatCurrency(totalExpensesAll) }}</div>
                    </div>
                </ion-col>
                <ion-col size="12">
                    <div class="summary-card shadow-soft d-flex align-items-center justify-content-between" style="background-color: #e3f2fd;">
                        <div class="d-flex align-items-center gap-3">
                            <div class="icon-box-small" style="background-color: #bbdefb; color: #1565c0;"><ion-icon :icon="walletOutline" /></div>
                            <small class="text-muted">Total Sisa Saldo Semua Projek</small>
                        </div>
                        <div class="fw-bold" style="color: #1565c0; font-size: 1.2rem;">{{ formatCurrency(totalBalanceAll) }}</div>
                    </div>
                </ion-col>
            </ion-row>
        </ion-grid>

        <div v-if="loading" class="ion-text-center ion-padding">
            <ion-spinner />
        </div>

        <ion-grid v-else>
            <ion-row>
                <ion-col v-for="project in projects" :key="project.id" size="12" size-sm="6" size-lg="4">
                    <ion-card class="shadow-soft p-4 mt-0 mx-2" style="border-radius: 20px; padding: 16px;" @click="goToDetail(project.id)">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <ion-badge class="badge-status" :color="getStatusColor(project.status)">{{ project.status }}</ion-badge>
                            <div class="d-flex gap-2">
                                <ion-button class="btn-action primary" size="small" @click.stop="openEditProject(project)"><ion-icon :icon="pencilOutline" /></ion-button>
                                <ion-button class="btn-action danger" size="small" @click.stop="dialogDeleteId = project.id"><ion-icon :icon="trashOutline" /></ion-button>
                            </div>
                        </div>
                        <ion-card-title class="fw-bold mb-1">{{ project.name }}</ion-card-title>
                        <p class="mb-3 text-muted">{{ project.description || 'Tidak ada deskripsi' }}</p>
                        
                        <div class="d-flex justify-content-between mb-1 ">
                            <span class="text-muted">Modal</span>
                            <span class="text-success fw-bold">{{ formatCurrency(project.total_deposits || 0) }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted">Pengeluaran</span>
                            <span class="text-danger fw-bold">{{ formatCurrency(project.total_expenses || 0) }}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted">Sisa Dana</span>
                            <span :class="`text-${getBalanceColor(project)} fw-bold`">{{ getBalancePercent(project) }}%</span>
                        </div>
                        <ion-progress-bar :value="(getBalancePercent(project) || 0)/100" :color="getBalanceColor(project)" class="mb-3 thick-progress" />
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span :class="`fw-bold fs-5 text-${getBalanceColor(project)}`">{{ formatCurrency(project.balance || 0) }}</span>
                            <ion-button class="btn-action primary" size="small" @click.stop="goToDetail(project.id)"><ion-icon :icon="arrowForwardOutline" /></ion-button>
                        </div>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-content>

    <!-- Modals -->
    <ion-modal :is-open="dialogCreate || dialogEdit" @didDismiss="closeModal">
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ dialogEdit ? 'Edit Project' : 'Add Project' }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeModal"><ion-icon :icon="closeOutline" /></ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-label position="stacked">Nama</ion-label>
                <ion-input v-model="activeProject.name" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Deskripsi</ion-label>
                <ion-textarea v-model="activeProject.description" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Status</ion-label>
                <ion-select v-model="activeProject.status" interface="popover">
                    <ion-select-option value="Active">Aktif</ion-select-option>
                    <ion-select-option value="Completed">Selesai</ion-select-option>
                    <ion-select-option value="Pending">Tunda</ion-select-option>
                </ion-select>
            </ion-item>
            <ion-button expand="block" @click="dialogEdit ? (updateProject(), closeModal()) : (createProject(), closeModal())" class="ion-margin-top btn-action primary m-4">Simpan</ion-button>
        </ion-content>
    </ion-modal>
  </ion-page>
</template>
