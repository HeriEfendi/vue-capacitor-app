<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">My Personal Tasks</h4>
      <button class="btn btn-primary" @click="addTask">Add Task</button>
    </div>

    <CCard>
      <CCardBody>
        <div v-for="task in tasks" :key="task.id" class="d-flex align-items-center p-3 border-bottom">
          <input type="checkbox" class="form-check-input me-3" :checked="task.status === 'DONE'" @change="toggleTask(task)">
          <div class="flex-grow-1">
            <div :class="{'text-decoration-line-through text-muted': task.status === 'DONE'}">{{ task.title }}</div>
          </div>
          <button class="btn btn-sm btn-outline-danger" @click="removeTask(task.id)">Delete</button>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CCard, CCardBody } from '@coreui/vue'
import { TodoRepository } from '../../db/localStorage'

const tasks = ref([])

const loadTasks = () => {
  tasks.value = TodoRepository.getAll().filter(t => t.type === 'PERSONAL')
}

const toggleTask = (task) => {
  task.status = task.status === 'DONE' ? 'TO DO' : 'DONE'
  TodoRepository.updateStatus(task.id, task.status)
}

const addTask = () => {
  const title = prompt('Enter task:')
  if (title) {
    TodoRepository.add({
      id: Date.now(),
      title,
      status: 'TO DO',
      type: 'PERSONAL'
    })
    loadTasks()
  }
}

const removeTask = (id) => {
  TodoRepository.delete(id)
  loadTasks()
}

onMounted(loadTasks)
</script>
