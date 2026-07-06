<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Personal Tasks</ion-title>
        <ion-buttons slot="end">
            <ion-button @click="dialogVisible = true">
                <ion-icon slot="icon-only" :icon="addOutline" />
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <ion-grid>
            <ion-row>
                <ion-col size="12" size-md="6" size-lg="4" v-for="task in tasks" :key="task.id">
                    <ion-card class="my-0">
                        <ion-card-header>
                            <ion-card-title :class="{'text-decoration-line-through': task.status === 'DONE'}">{{ task.title }}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <div class="d-flex align-items-center gap-2 text-muted">
                                <ion-icon :icon="timeOutline" />
                                <span>{{ task.target_time }} {{ task.due_date ? '| Done: ' + task.due_date : '' }}</span>
                            </div>
                            <div class="d-flex justify-content-between ion-margin-top">
                                <ion-select v-model="task.status" @ionChange="updateStatus(task)" interface="popover">
                                    <ion-select-option value="TO DO">TO DO</ion-select-option>
                                    <ion-select-option value="IN PROGRESS">IN PROGRESS</ion-select-option>
                                    <ion-select-option value="DONE">DONE</ion-select-option>
                                </ion-select>
                                <ion-button fill="clear" color="danger" @click="removeTask(task.id)">
                                    <ion-icon :icon="trashOutline" />
                                </ion-button>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>
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
                <ion-input v-model="newTask.title" placeholder="Task title..." />
            </ion-item>
            <ion-item>
                <ion-label position="stacked">Target</ion-label>
                <ion-input v-model="newTask.target_time" placeholder="2 days" />
            </ion-item>
            <ion-button expand="block" class="ion-margin-top" @click="addTask">Save Todo</ion-button>
        </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonModal, IonButtons, IonItem, IonLabel, IonCheckbox, IonSelect, IonSelectOption, IonList, IonNote, IonInput } from '@ionic/vue';
import { addOutline, trashOutline, closeOutline, timeOutline } from 'ionicons/icons';
import { TodoRepository } from '@/db/todoRepository'

const tasks = ref<any[]>([])
const newTask = ref({ title: '', target_time: '', status: 'TO DO' })
const dialogVisible = ref(false)

const loadTasks = async () => {
  const allTasks = await TodoRepository.getAll()
  tasks.value = allTasks.filter(t => t.type === 'PERSONAL')
}

const updateStatus = async (task: any) => {
  const update = { status: task.status }
  
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

const getStatusClass = (status) => {
  const map = {
    'TO DO': 'status-todo',
    'IN PROGRESS': 'status-inprogress',
    'DONE': 'status-done',
  }
  return map[status] || ''
}

onMounted(loadTasks)
</script>
