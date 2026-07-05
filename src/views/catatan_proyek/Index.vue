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
      transactions: []
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
  <ion-page>
    <ion-header>
        <ion-toolbar>
            <ion-title>Manajemen Proyek</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <p class="text-muted mb-0">Kelola keuangan semua projek Anda</p>
            <ion-button fill="outline" @click="dialogCreate = true">
                <ion-icon slot="start" :icon="addOutline" /> Add Project
            </ion-button>
        </div>

        <ion-grid>
            <ion-row>
                <ion-col size="6" sm="4" md="3">
                    <ion-card color="success" class="ion-padding">
                        <ion-card-subtitle>Modal</ion-card-subtitle>
                        <ion-card-title>{{ formatCurrency(totalDepositsAll) }}</ion-card-title>
                    </ion-card>
                </ion-col>
                <ion-col size="6" sm="4" md="3">
                    <ion-card color="danger" class="ion-padding">
                        <ion-card-subtitle>Pengeluaran</ion-card-subtitle>
                        <ion-card-title>{{ formatCurrency(totalExpensesAll) }}</ion-card-title>
                    </ion-card>
                </ion-col>
                <ion-col size="12" sm="4" md="3">
                    <ion-card color="primary" class="ion-padding">
                        <ion-card-subtitle>Sisa Saldo</ion-card-subtitle>
                        <ion-card-title>{{ formatCurrency(totalBalanceAll) }}</ion-card-title>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>

        <div v-if="loading" class="ion-text-center ion-padding">
            <ion-spinner />
        </div>

        <ion-grid v-else>
            <ion-row>
                <ion-col v-for="project in projects" :key="project.id" size="12" size-sm="6" size-lg="4">
                    <ion-card button @click="goToDetail(project.id)">
                        <ion-card-header>
                            <ion-card-subtitle>
                                <ion-badge :color="getStatusColor(project.status)">{{ project.status }}</ion-badge>
                            </ion-card-subtitle>
                            <ion-card-title>{{ project.name }}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <p>{{ project.description }}</p>
                            <ion-progress-bar :value="getBalancePercent(project)/100" />
                            <div class="d-flex justify-content-end ion-margin-top">
                                <ion-button fill="clear" @click.stop="openEditProject(project)">
                                    <ion-icon :icon="pencilOutline" />
                                </ion-button>
                                <ion-button fill="clear" color="danger" @click.stop="dialogDeleteId = project.id">
                                    <ion-icon :icon="trashOutline" />
                                </ion-button>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-content>

    <!-- Modals -->
    <ion-modal :is-open="dialogCreate" @didDismiss="dialogCreate = false">
        <ion-header>
            <ion-toolbar>
                <ion-title>Add Project</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="dialogCreate = false"><ion-icon :icon="closeOutline" /></ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-label position="stacked">Nama</ion-label>
                <ion-input v-model="formNew.name" />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Deskripsi</ion-label>
                <ion-textarea v-model="formNew.description" />
            </ion-item>
            <ion-button expand="block" @click="createProject" class="ion-margin-top">Simpan</ion-button>
        </ion-content>
    </ion-modal>
  </ion-page>
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
