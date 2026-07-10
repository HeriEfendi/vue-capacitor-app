<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <ion-title class="app-hero-title" style="padding: 0;">Personal Todo</ion-title>
            <ion-buttons style="margin: 0;">
              <ion-button class="btn-action primary" @click="dialogVisible = true">
                <ion-icon slot="start" :icon="addOutline" /> Tambah
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle" style="margin: 0;">Kelola task pribadi dengan tampilan mobile yang lebih rapi dan konsisten.</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div v-if="tasks.length" class="task-stack">
        <ion-card v-for="task in tasks" :key="task.id" class="mobile-card">
          <ion-card-header class="mobile-card-header">
            <div class="mobile-card-top">
              <span :class="['pill-badge', getStatusClass(task.status)]">{{ task.status }}</span>
              <ion-button fill="clear" color="danger" class="icon-btn" @click="removeTask(task.id)">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
            <ion-card-title class="mobile-card-title" :class="{'text-decoration-line-through': task.status === 'DONE'}">
              {{ task.title }}
            </ion-card-title>
            <ion-card-subtitle class="mobile-card-subtitle">
              {{ task.target_time || 'Target belum diisi' }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div class="metric-row">
              <span class="metric-label">Target Time</span>
              <span class="metric-value">{{ task.target_time || '-' }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Due Date</span>
              <span class="metric-value">{{ task.due_date || '-' }}</span>
            </div>

            <div class="mobile-card-footer mt-3">
              <ion-select v-model="task.status" @ionChange="updateStatus(task)" interface="popover" class="status-select">
                <ion-select-option value="TO DO">TO DO</ion-select-option>
                <ion-select-option value="IN PROGRESS">IN PROGRESS</ion-select-option>
                <ion-select-option value="DONE">DONE</ion-select-option>
              </ion-select>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else class="empty-state">Belum ada task.</div>
    </ion-content>

    <ion-modal :is-open="dialogVisible" @didDismiss="dialogVisible = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add New Todo</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="dialogVisible = false"><ion-icon :icon="closeOutline" /></ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="stacked">Title</ion-label>
          <input v-model="newTask.title" class="form-control app-control" placeholder="Task title..." />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Target</ion-label>
          <input v-model="newTask.target_time" class="form-control app-control" placeholder="2 days" />
        </ion-item>
        <ion-button expand="block" class="ion-margin-top btn-action primary" @click="addTask">Save Todo</ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonModal, IonButtons, IonItem, IonLabel, IonSelect, IonSelectOption, IonInput } from '@ionic/vue';
import { addOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { TodoRepository } from '@/db/todoRepository'

const tasks = ref<any[]>([])
const newTask = ref({ title: '', target_time: '', status: 'TO DO' })
const dialogVisible = ref(false)

const loadTasks = async () => {
  const allTasks = await TodoRepository.getAll()
  tasks.value = allTasks.filter(t => t.type === 'PERSONAL')
}

const updateStatus = async (task: any) => {
  const update: any = { status: task.status }

  if (task.status === 'IN PROGRESS') {
    update.due_date = new Date().toLocaleDateString()
  } else if (task.status === 'TO DO') {
    update.due_date = ''
  }

  await TodoRepository.update(task.id, update)
  await loadTasks()
}

const addTask = async () => {
  if (!newTask.value.title) return
  await TodoRepository.add({
    title: newTask.value.title,
    target_time: newTask.value.target_time,
    status: 'TO DO',
    type: 'PERSONAL'
  })
  newTask.value = { title: '', target_time: '', status: 'TO DO' }
  dialogVisible.value = false
  await loadTasks()
}

const removeTask = async (id: number) => {
  await TodoRepository.delete(id)
  await loadTasks()
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'TO DO': 'todo',
    'IN PROGRESS': 'progress',
    'DONE': 'done',
  }
  return map[status] || ''
}

onMounted(loadTasks)
</script>
