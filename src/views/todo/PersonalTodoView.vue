<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">My Personal Tasks</h4>
      <button class="btn btn-outline-primary status-select" @click="dialogVisible = true">
        <i class="fas fa-plus me-1"></i> Add Task
      </button>
    </div>

    <CCard>
      <CCardBody class="p-0">
        <div v-for="task in tasks" :key="task.id" class="d-flex align-items-center p-3 border-bottom">
          <div class="flex-grow-1">
            <div :class="{'text-decoration-line-through text-muted': task.status === 'DONE'}">{{ task.title }}</div>
            <small class="text-muted d-block">Target: {{ task.target_time }} {{ task.due_date ? '| Done: ' + task.due_date : '' }}</small>
          </div>
          <select 
            class="form-select form-select-sm w-auto me-3 status-select" 
            :class="getStatusClass(task.status)"
            v-model="task.status" 
            @change="updateStatus(task)"
          >
            <option value="TO DO">TO DO</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <button class="btn btn-sm btn-outline-danger status-select" @click="removeTask(task.id)">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </CCardBody>
    </CCard>

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
import { CCard, CCardBody, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/vue'
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
