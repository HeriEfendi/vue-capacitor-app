<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div>
            <p class="eyebrow">Team Tasks</p>
            <ion-title class="app-hero-title">To Do Team</ion-title>
            <p class="app-hero-subtitle">Pantau task, prioritas, assignee, dan progress dari layar mobile.</p>
          </div>
          <ion-buttons class="app-action-row">
            <ion-button class="btn-action primary" @click="openModal()">
              <ion-icon slot="start" :icon="addOutline" /> Task Baru
            </ion-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div class="filter-chip-row">
        <ion-button
          v-for="f in filters"
          :key="f.value"
          class="chip-btn btn-action primary"
          :fill="activeFilter === f.value ? 'solid' : 'outline'"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <ion-badge slot="end" class="ms-2">{{ filterCount(f.value) }}</ion-badge>
        </ion-button>
      </div>

      <div v-if="loading" class="loading-state">
        <ion-spinner />
        <p>Memuat task...</p>
      </div>

      <div v-else-if="filteredTasks.length > 0">
        <ion-card v-for="task in filteredTasks" :key="task.id" class="mobile-card">
          <ion-card-header class="mobile-card-header">
            <div class="mobile-card-top">
              <ion-checkbox :checked="task.status === 'DONE'" @ionChange="toggleDone(task)" />
              <span :class="['pill-badge', getStatusClass(task.status)]">{{ task.status }}</span>
            </div>
            <ion-card-title class="mobile-card-title" :class="{'text-decoration-line-through': task.status === 'DONE'}">
              {{ task.work_id }} {{ task.title }}
            </ion-card-title>
            <ion-card-subtitle class="mobile-card-subtitle">
              {{ task.description || 'Tidak ada deskripsi' }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div class="metric-row">
              <span class="metric-label">Assignee</span>
              <span class="metric-value">{{ task.assignee?.name || 'Unassigned' }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Reporter</span>
              <span class="metric-value">{{ task.reporter?.name || 'Unknown' }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Due Date</span>
              <span class="metric-value">{{ task.due_date || 'None' }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Story Points</span>
              <span class="metric-value">{{ task.story_points || 0 }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Priority</span>
              <span :class="['pill-badge', String(task.priority || 'Medium').toLowerCase()]">{{ task.priority || 'Medium' }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Label</span>
              <span class="metric-value">{{ task.label || '-' }}</span>
            </div>

            <div class="mobile-card-footer mt-3">
              <ion-select v-model="task.status" @ionChange="updateStatus(task)" interface="popover" class="status-select">
                <ion-select-option value="TO DO">TO DO</ion-select-option>
                <ion-select-option value="IN PROGRESS">IN PROGRESS</ion-select-option>
                <ion-select-option value="DONE">DONE</ion-select-option>
              </ion-select>
              <ion-button fill="clear" color="danger" class="icon-btn" @click="deleteTask(task.id)">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else class="empty-state">Belum ada task.</div>
    </ion-content>

    <ion-modal :is-open="modalVisible" @didDismiss="modalVisible = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ isEdit ? 'Edit Todo Team' : 'Create Todo Team' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="modalVisible = false"><ion-icon :icon="closeOutline" /></ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <FormView :task="form" @save="(taskData: any) => saveTask(taskData)" @cancel="modalVisible = false" />
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonModal, IonButtons, IonCheckbox, IonSpinner, IonBadge, IonSelect, IonSelectOption } from '@ionic/vue';
import { addOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { TeamTodoRepository } from '@/db/teamTodoRepository'
import { UsersRepository } from '@/db/usersRepository'
import FormView from './FormView.vue'

export default {
  name: 'TodoListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonModal, IonButtons, IonCheckbox, IonSpinner, IonBadge, IonSelect, IonSelectOption, FormView },
  setup() {
    const tasks = ref<any[]>([])
    const loading = ref(false)
    const activeFilter = ref('ALL')
    const modalVisible = ref(false)
    const isEdit = ref(false)
    const users = ref<any[]>([])
    const loadUsers = async () => { users.value = await UsersRepository.getAll() }
    loadUsers()

    const form = reactive({
      id: null,
      title: '',
      assignee_id: null,
      reporter_id: null,
      story_points: 1,
      priority: 'Medium',
      status: 'TO DO',
      due_date: '',
      label: '',
      description: '',
    })

    const filters = [
      { label: 'All', value: 'ALL' },
      { label: 'To Do', value: 'TO DO' },
      { label: 'In Progress', value: 'IN PROGRESS' },
      { label: 'Done', value: 'DONE' },
    ]

    const openModal = (task: any = null) => {
      isEdit.value = !!task
      if (task) Object.assign(form, task)
      else Object.assign(form, { id: null, title: '', assignee_id: null, reporter_id: null, story_points: 1, priority: 'Medium', status: 'TO DO', due_date: '', label: '', description: '' })
      modalVisible.value = true
    }

    const saveTask = async (taskData: any) => {
      if (!taskData.title.trim()) return
      if (isEdit.value) await TeamTodoRepository.update(form.id, taskData)
      else await TeamTodoRepository.add(taskData)
      modalVisible.value = false
      await fetchTasks()
    }

    const filteredTasks = computed(() => {
      if (activeFilter.value === 'ALL') return tasks.value
      return tasks.value.filter(t => t.status === activeFilter.value)
    })

    const filterCount = (filter: string) => filter === 'ALL' ? tasks.value.length : tasks.value.filter(t => t.status === filter).length

    const fetchTasks = async () => {
      loading.value = true
      try {
        tasks.value = await TeamTodoRepository.getAll()
      } finally {
        loading.value = false
      }
    }

    const updateStatus = async (task: any) => { await TeamTodoRepository.updateStatus(task.id, task.status) }
    const toggleDone = (task: any) => { task.status = task.status === 'DONE' ? 'TO DO' : 'DONE'; updateStatus(task) }
    const deleteTask = async (id: number) => { if (confirm('Yakin ingin menghapus task ini?')) { await TeamTodoRepository.delete(id); await fetchTasks() } }
    const getStatusClass = (status: string) => ({ 'TO DO': 'todo', 'IN PROGRESS': 'progress', DONE: 'done' } as any)[status] || ''

    onMounted(fetchTasks)

    return { tasks, loading, activeFilter, filters, filteredTasks, filterCount, updateStatus, toggleDone, deleteTask, openModal, saveTask, isEdit, modalVisible, form, addOutline, trashOutline, closeOutline, getStatusClass }
  }
}
</script>

<style scoped>
</style>
