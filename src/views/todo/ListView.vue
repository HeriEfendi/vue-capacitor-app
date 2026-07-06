<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>To Do Team</ion-title>
        <ion-buttons slot="end">
            <ion-button @click="openModal()">
                <ion-icon slot="icon-only" :icon="addOutline" />
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <div class="d-flex gap-2 mb-3 flex-wrap">
            <ion-button size="small" v-for="f in filters" :key="f.value" :fill="activeFilter === f.value ? 'solid' : 'outline'" @click="activeFilter = f.value">
                {{ f.label }}
            </ion-button>
        </div>

        <div v-if="loading" class="ion-text-center ion-padding">
            <ion-spinner />
        </div>

        <ion-grid v-else-if="filteredTasks.length > 0">
            <ion-row>
                <ion-col size="12" size-md="6" size-lg="4" v-for="task in filteredTasks" :key="task.id">
                    <ion-card>
                        <ion-card-header>
                            <div class="d-flex align-items-center">
                                <ion-checkbox :checked="task.status === 'DONE'" @ionChange="toggleDone(task)" />
                                <ion-card-title class="ms-2" :class="{'text-decoration-line-through': task.status === 'DONE'}">
                                    {{ task.work_id }} {{ task.title }}
                                </ion-card-title>
                            </div>
                        </ion-card-header>
                        <ion-card-content>
                            <div class="d-flex align-items-center gap-2 text-muted small">
                                <ion-icon :icon="personCircleOutline" /> {{ task.assignee?.name || 'Unassigned' }}
                                <ion-icon :icon="calendarOutline" /> {{ task.due_date || 'None' }}
                            </div>
                            <p class="mt-2">{{ task.description }}</p>
                            <div class="d-flex justify-content-between ion-margin-top">
                                <ion-select v-model="task.status" @ionChange="updateStatus(task)" interface="popover">
                                    <ion-select-option value="TO DO">TO DO</ion-select-option>
                                    <ion-select-option value="IN PROGRESS">IN PROGRESS</ion-select-option>
                                    <ion-select-option value="DONE">DONE</ion-select-option>
                                </ion-select>
                                <ion-button fill="clear" color="danger" @click="deleteTask(task.id)">
                                    <ion-icon :icon="trashOutline" />
                                </ion-button>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>
        <div v-else class="ion-text-center ion-padding">Belum ada task.</div>
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
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonModal, IonButtons, IonItem, IonLabel, IonCheckbox, IonSpinner, IonBadge, IonSelect, IonSelectOption, IonList, IonNote } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline, closeOutline, personCircleOutline, calendarOutline, tagOutline } from 'ionicons/icons';
import { TeamTodoRepository } from '@/db/teamTodoRepository'
import { UsersRepository } from '@/db/usersRepository'
import FormView from './FormView.vue'

export default {
  name: 'TodoListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonModal, IonButtons, IonItem, IonLabel, IonCheckbox, IonSpinner, IonBadge, IonSelect, IonSelectOption, IonList, IonNote, FormView },
  setup() {
    const tasks = ref([])
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

    const openModal = (task = null) => {
        isEdit.value = !!task
        if(task) {
            Object.assign(form, task)
        } else {
            Object.assign(form, { id: null, title: '', assignee_id: null, reporter_id: null, story_points: 1, priority: 'Medium', status: 'TO DO', due_date: '', label: '', description: '' })
        }
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

    const filterCount = (filter) => {
      if (filter === 'ALL') return tasks.value.length
      return tasks.value.filter(t => t.status === filter).length
    }

    const fetchTasks = async () => {
      loading.value = true
      try {
        tasks.value = await TeamTodoRepository.getAll()
      } finally {
        loading.value = false
      }
    }

    const updateStatus = async (task: any) => {
      await TeamTodoRepository.updateStatus(task.id, task.status)
    }

    const toggleDone = (task) => {
      task.status = task.status === 'DONE' ? 'TO DO' : 'DONE'
      updateStatus(task)
    }

    const deleteTask = async (id: number) => {
      if (confirm('Yakin ingin menghapus task ini?')) {
        await TeamTodoRepository.delete(id)
        await fetchTasks()
      }
    }

    const getPriorityIcon = (priority) => {
      const map = {
        Highest: 'fas fa-angle-double-up',
        High: 'fas fa-angle-up',
        Medium: 'fas fa-minus',
        Low: 'fas fa-angle-down',
      }
      return map[priority] || 'fas fa-minus'
    }

    const getPriorityColor = (priority) => {
      const map = {
        Highest: '#c62828',
        High: '#e53935',
        Medium: '#fb8c00',
        Low: '#1e88e5',
      }
      return map[priority] || '#757575'
    }

    const getStatusClass = (status) => {
      const map = {
        'TO DO': 'status-todo',
        'IN PROGRESS': 'status-inprogress',
        'DONE': 'status-done',
      }
      return map[status] || ''
    }

    onMounted(fetchTasks)

    return {
      tasks, loading, activeFilter, filters, filteredTasks, filterCount,
      fetchTasks, updateStatus, toggleDone, deleteTask,
      openModal, saveTask, isEdit, modalVisible, form,
      addOutline, trashOutline, pencilOutline
    }
  }
}
</script>

<style scoped>
.task-table th, .task-table td {
  padding: 8px 12px;
  white-space: nowrap;
}
.task-table tbody tr:hover {
  background-color: rgba(0,0,0,.03);
}

.status-select {
  border-radius: 4px;
  padding: 2px 4px;
  height: auto;
}
.status-todo {
  background-color: #e8eaf6;
  color: #3949ab;
  border-color: #9fa8da;
}
.status-inprogress {
  background-color: #fff3e0;
  color: #e65100;
  border-color: #ffcc80;
}
.status-done {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-color: #a5d6a7;
}
</style>
