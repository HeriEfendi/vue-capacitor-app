<template>
  <div class="container-fluid p-0 mt-3">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0 fw-bold">To Do Team</h4>
        <small class="text-muted">Kelola tugas team anda.</small>
      </div>
      <button class="btn btn-primary d-flex align-items-center gap-2" @click="openModal()">
        <i class="fas fa-plus"></i>
        Create Task
      </button>
    </div>

    <!-- Filter chips -->
    <div class="d-flex gap-2 mb-3 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.value"
        class="btn btn-sm px-3 py-2"
        :class="activeFilter === f.value ? 'btn-primary' : 'btn-outline-secondary'"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
        <span class="badge ms-1" :class="activeFilter === f.value ? 'bg-white text-primary' : 'bg-secondary text-white'">
          {{ filterCount(f.value) }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Table -->
    <CRow v-if="filteredTasks.length > 0">
      <CCol xs="12" md="6" lg="4" v-for="task in filteredTasks" :key="task.id" class="mb-3">
        <CCard class="h-100 shadow-sm border-0">
          <CCardBody>
            <div class="d-flex align-items-center mb-2">
               <input
                    type="checkbox"
                    class="form-check-input me-2"
                    :checked="task.status === 'DONE'"
                    @change="toggleDone(task)"
                  />
                <a
                   href="#"
                   class="text-decoration-none text-primary fw-bold"
                   :class="{'text-decoration-line-through text-muted': task.status === 'DONE'}"
                   @click.prevent="openModal(task)"
                >
                  {{ task.work_id }} {{ task.title }}
                </a>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2 text-muted small">
                <span title="Assignee"><i class="fas fa-user-circle"></i> {{ task.assignee?.name || 'Unassigned' }}</span>
                <span title="Priority"><i :class="getPriorityIcon(task.priority)" :style="`color:${getPriorityColor(task.priority)}`"></i> {{ task.priority }}</span>
                <span title="Due Date"><i class="fas fa-calendar-alt"></i> {{ task.due_date || 'None' }}</span>
                <span v-if="task.label" title="Label" class="badge bg-light text-secondary border">
                  <i class="fas fa-tag"></i> {{ task.label }}
                </span>
            </div>
            <div v-if="task.description" class="mt-2 small text-muted fst-italic">
                {{ task.description.length > 200 ? task.description.substring(0, 200) + '...' : task.description }}
            </div>
          </CCardBody>
          <CCardFooter class="border-0 d-flex justify-content-between align-items-center bg-white">
            <select
                v-model="task.status"
                class="form-select form-select-sm w-auto"
                :class="getStatusClass(task.status)"
                @change="updateStatus(task)"
            >
                <option value="TO DO">TO DO</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
            </select>
            <button class="btn btn-sm btn-outline-danger" @click="deleteTask(task.id)">
                <i class="fas fa-trash-alt"></i>
            </button>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
    <div v-else class="text-center py-5 text-muted">
        Belum ada task.
    </div>

    <!-- Modal Form -->
    <CModal :visible="modalVisible" @close="modalVisible = false" size="lg">
      <CModalHeader>{{ isEdit ? 'Edit Task' : 'Create Task' }}</CModalHeader>
      <CModalBody>
        <FormView :task="form" @save="saveTask" @cancel="modalVisible = false" />
      </CModalBody>
    </CModal>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { CCard, CCardBody, CCardFooter, CRow, CCol, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/vue'
import { TodoRepository, UsersRepository } from '../../db/localStorage'
import FormView from './FormView.vue'

export default {
  name: 'TodoListView',
  components: { CCard, CCardBody, CCardFooter, CRow, CCol, CModal, CModalHeader, CModalBody, CModalFooter, FormView },
  setup() {
    const tasks = ref([])
    const loading = ref(false)
    const activeFilter = ref('ALL')
    const modalVisible = ref(false)
    const isEdit = ref(false)
    const users = ref(UsersRepository.getAll())

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

    const saveTask = () => {
        if (!form.title.trim()) return
        if (isEdit.value) TodoRepository.update(form.id, { ...form })
        else TodoRepository.add({ ...form })
        modalVisible.value = false
        fetchTasks()
    }

    const filteredTasks = computed(() => {
      if (activeFilter.value === 'ALL') return tasks.value
      return tasks.value.filter(t => t.status === activeFilter.value)
    })

    const filterCount = (filter) => {
      if (filter === 'ALL') return tasks.value.length
      return tasks.value.filter(t => t.status === filter).length
    }

    const fetchTasks = () => {
      loading.value = true
      try {
        tasks.value = TodoRepository.getAll()
      } finally {
        loading.value = false
      }
    }

    const updateStatus = (task) => {
      TodoRepository.updateStatus(task.id, task.status)
    }

    const toggleDone = (task) => {
      task.status = task.status === 'DONE' ? 'TO DO' : 'DONE'
      updateStatus(task)
    }

    const deleteTask = (id) => {
      if (confirm('Yakin ingin menghapus task ini?')) {
        TodoRepository.delete(id)
        fetchTasks()
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
      getPriorityIcon, getPriorityColor, getStatusClass,
      openModal, saveTask, isEdit, modalVisible, form
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
