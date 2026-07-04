<template>
  <div class="container mt-3 p-0">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">My Personal Tasks</h4>
      <button class="btn btn-outline-primary status-select" @click="dialogVisible = true">
        <i class="fas fa-plus me-1"></i> Add Task
      </button>
    </div>

    <CRow>
      <CCol xs="12" md="6" lg="4" v-for="task in tasks" :key="task.id" class="mb-3">
        <CCard class="h-100 shadow-sm border-0">
          <CCardBody>
            <div :class="{'text-decoration-line-through text-muted': task.status === 'DONE'}" class="fw-bold mb-2">{{ task.title }}</div>
            <small class="text-muted d-block"><i class="fas fa-clock me-1"></i> {{ task.target_time }} {{ task.due_date ? '| Done: ' + task.due_date : '' }}</small>
          </CCardBody>
          <CCardFooter class="d-flex justify-content-between align-items-center bg-light border-0">
            <select 
              class="form-select form-select-sm w-auto status-select" 
              :class="getStatusClass(task.status)"
              v-model="task.status" 
              @change="updateStatus(task)"
            >
              <option value="TO DO">TO DO</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <button class="btn btn-sm btn-outline-danger" @click="removeTask(task.id)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>

    <CModal :visible="dialogVisible" @close="dialogVisible = false">
      <CModalHeader>Add New Task</CModalHeader>
      <CModalBody>
        <div class="mb-3">
          <label>Title</label>
          <input v-model="newTask.title" class="form-control" placeholder="Task title...">
        </div>
        <div class="mb-3">
          <label>Target (e.g., 2 days, 5 hours)</label>
          <input v-model="newTask.target_time" class="form-control" placeholder="2 days">
        </div>
      </CModalBody>
      <CModalFooter>
        <button class="btn btn-secondary" @click="dialogVisible = false">Cancel</button>
        <button class="btn btn-primary" @click="addTask">Save Task</button>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CCard, CCardBody, CCardFooter, CRow, CCol, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/vue'
import { TodoRepository } from '../../db/localStorage'

const tasks = ref([])
const newTask = ref({ title: '', target_time: '', status: 'TO DO' })
const dialogVisible = ref(false)

const loadTasks = () => {
  tasks.value = TodoRepository.getAll().filter(t => t.type === 'PERSONAL')
}

const updateStatus = (task) => {
  const update = { status: task.status }
  
  if (task.status === 'IN PROGRESS') {
      update.due_date = new Date().toLocaleDateString()
  } else if (task.status === 'TO DO') {
      update.due_date = ''
  }
  
  TodoRepository.update(task.id, update)
  loadTasks()
}

const addTask = () => {
  if (!newTask.value.title) return
  TodoRepository.add({
    title: newTask.value.title,
    target_time: newTask.value.target_time,
    status: 'TO DO',
    type: 'PERSONAL'
  })
  newTask.value = { title: '', target_time: '', status: 'TO DO' }
  dialogVisible.value = false
  loadTasks()
}

const removeTask = (id) => {
  TodoRepository.delete(id)
  loadTasks()
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
