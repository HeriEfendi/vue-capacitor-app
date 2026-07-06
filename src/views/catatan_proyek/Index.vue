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
  <ion-page class="project-page">
    <ion-header class="project-header">
      <ion-toolbar class="project-toolbar">
        <div class="hero-shell">
          <div>
            <ion-title class="hero-title">Manajemen Proyek</ion-title>
            <p class="hero-subtitle">Kelola modal, pengeluaran, dan sisa dana dari layar mobile dengan cepat.</p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="project-content" fullscreen>
      <div class="content-wrap">
        <ion-buttons class="hero-shell hero-actions">
            <ion-button class="btn-action primary add-project-btn" @click="dialogCreate = true">
              <ion-icon slot="start" :icon="addOutline" /> Add Project
            </ion-button>
        </ion-buttons>
        
        <ion-grid class="stats-grid">
          <ion-row>
            <ion-col size="6">
              <div class="summary-card stat-card stat-green">
                <div class="stat-top">
                  <div class="icon-box-small"><ion-icon :icon="walletOutline" /></div>
                  <small>Total Modal<br>Semua Projek</small>
                </div>
                <div class="stat-value">{{ formatCurrency(totalDepositsAll) }}</div>
              </div>
            </ion-col>
            <ion-col size="6">
              <div class="summary-card stat-card stat-red">
                <div class="stat-top">
                  <div class="icon-box-small"><ion-icon :icon="cashOutline" /></div>
                  <small>Total Pengeluaran<br>Semua Projek</small>
                </div>
                <div class="stat-value">{{ formatCurrency(totalExpensesAll) }}</div>
              </div>
            </ion-col>
            <ion-col size="12">
              <div class="summary-card stat-card stat-blue stat-wide">
                <div class="stat-top">
                  <div class="icon-box-small"><ion-icon :icon="walletOutline" /></div>
                  <small>Total Sisa Saldo Semua Projek</small>
                </div>
                <div class="stat-value">{{ formatCurrency(totalBalanceAll) }}</div>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <div v-if="loading" class="loading-state">
          <ion-spinner />
          <p>Memuat projek...</p>
        </div>

        <ion-grid v-else class="project-grid">
          <ion-row>
            <ion-col v-for="project in projects" :key="project.id" size="12" size-sm="6" size-lg="4">
              <ion-card class="project-card" @click="goToDetail(project.id)">
                <ion-card-header class="project-card-header">
                  <div class="project-card-top">
                    <ion-badge class="badge-status" :color="getStatusColor(project.status)">{{ project.status }}</ion-badge>
                    <div class="project-actions">
                      <ion-button class="btn-action primary icon-btn" size="small" @click.stop="openEditProject(project)">
                        <ion-icon :icon="pencilOutline" />
                      </ion-button>
                      <ion-button class="btn-action danger icon-btn" size="small" @click.stop="dialogDeleteId = project.id">
                        <ion-icon :icon="trashOutline" />
                      </ion-button>
                    </div>
                  </div>
                  <ion-card-title class="project-name">{{ project.name }}</ion-card-title>
                  <ion-card-subtitle class="project-desc">{{ project.description || 'Tidak ada deskripsi' }}</ion-card-subtitle>
                </ion-card-header>

                <ion-card-content class="project-card-body">
                  <div class="metric-row">
                    <span class="metric-label">Modal</span>
                    <span class="metric-value text-success">{{ formatCurrency(project.total_deposits || 0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Pengeluaran</span>
                    <span class="metric-value text-danger">{{ formatCurrency(project.total_expenses || 0) }}</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Sisa Dana</span>
                    <span :class="`metric-value text-${getBalanceColor(project)}`">{{ getBalancePercent(project) }}%</span>
                  </div>

                  <ion-progress-bar
                    :value="(getBalancePercent(project) || 0) / 100"
                    :color="getBalanceColor(project)"
                    class="thick-progress"
                  />

                  <div class="project-footer">
                    <span :class="`balance-pill text-${getBalanceColor(project)}`">{{ formatCurrency(project.balance || 0) }}</span>
                    <ion-button class="btn-action primary go-btn" size="small" @click.stop="goToDetail(project.id)">
                      <ion-icon :icon="arrowForwardOutline" />
                    </ion-button>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>

    <ion-modal :is-open="dialogCreate || dialogEdit" @didDismiss="closeModal" class="project-modal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ dialogEdit ? 'Edit Project' : 'Add Project' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal"><ion-icon :icon="closeOutline" /></ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding modal-content">
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
        <ion-button expand="block" @click="dialogEdit ? (updateProject(), closeModal()) : (createProject(), closeModal())" class="ion-margin-top btn-action primary save-btn">Simpan</ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<style scoped>
.project-page {
  --background: linear-gradient(180deg, #f8fbff 0%, #f3f7ff 100%);
}

.project-header,
.project-toolbar {
  --background: transparent;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  color: #fff;
}

.hero-shell {
  padding: 16px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: .72rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  opacity: .75;
}

.hero-title {
  padding: 0;
  color: #1f2937;
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.1;
}

.hero-subtitle {
  margin: 8px 0 0;
  max-width: 34rem;
  color: #64748b;
  font-size: .92rem;
  line-height: 1.45;
}

.add-project-btn {
  width: 100%;
  --border-radius: 16px;
}

.content-wrap {
  padding: 14px 6px 24px;
}

.stats-grid {
  margin-bottom: 10px;
}

.summary-card,
.project-card {
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, .08);
}

.stat-card {
  padding: 14px;
  min-height: 118px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #0f172a;
}

.stat-green { background: linear-gradient(135deg, #dcfce7 0%, #ecfdf5 100%); }
.stat-red { background: linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%); }
.stat-blue { background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); }

.stat-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-box-small {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.65);
}

.stat-value {
  margin-top: 10px;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.2;
  word-break: break-word;
}

.loading-state {
  padding: 44px 0;
  text-align: center;
  color: #64748b;
}

.project-grid {
  margin-top: 4px;
}

.project-card {
  margin: 0 8px 14px;
  overflow: hidden;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(12px);
}

.project-card-header {
  padding-bottom: 8px;
}

.project-card-top,
.project-footer,
.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.icon-btn,
.go-btn {
  --border-radius: 14px;
  height: 36px;
  width: 36px;
}

.project-name {
  font-size: 1.08rem;
  font-weight: 800;
  margin-top: 8px;
}

.project-desc {
  margin-top: 6px;
  font-size: .92rem;
  color: #64748b;
  white-space: normal;
}

.project-card-body {
  padding-top: 0;
}

.metric-row {
  margin: 10px 0;
  font-size: .94rem;
}

.metric-label {
  color: #64748b;
}

.metric-value {
  font-weight: 800;
}

.thick-progress {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  margin: 12px 0 14px;
}

.balance-pill {
  font-size: 1.05rem;
  font-weight: 900;
}

.project-footer {
  margin-top: 4px;
}

.project-modal::part(content) {
  border-radius: 24px 24px 0 0;
}

.modal-content ion-item {
  --inner-padding-end: 0;
  margin-bottom: 10px;
  border-radius: 16px;
  --background: #f8fafc;
}

.save-btn {
  margin-top: 18px;
}

@media (min-width: 768px) {
  .hero-shell {
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
  }

  .add-project-btn {
    width: auto;
  }

  .content-wrap {
    padding-inline: 14px;
  }
}
</style>
