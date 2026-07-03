<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0 fw-bold">To Do List</h4>
        <small class="text-muted">Kelola tugas tim anda.</small>
      </div>
      <router-link to="/todo/create" class="btn btn-primary d-flex align-items-center gap-2">
        <i class="fas fa-plus"></i>
        Create Task
      </router-link>
    </div>

    <!-- Filter chips -->
    <div class="d-flex gap-2 mb-3 flex-wrap">
      <button
        v-for="f in filters"
        :key="f.value"
        class="btn btn-sm"
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
    <CCard v-else>
      <CCardBody class="p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 task-table">
            <thead class="table-light">
              <tr>
                <th style="width:40px"></th>
                <th>Work</th>
                <th>Assignee</th>
                <th>Reporter</th>
                <th>Priority</th>
                <th style="width:130px">Status</th>
                <th>Due Date</th>
                <th class="text-center">SP</th>
                <th>Labels</th>
                <th class="text-center" style="width:80px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in filteredTasks" :key="task.id" class="align-middle">
                <!-- Checkbox -->
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="task.status === 'DONE'"
                    @change="toggleDone(task)"
                  />
                </td>

                <!-- Work -->
                <td style="max-width:220px">
                  <div class="d-flex align-items-center gap-2">
                    <i class="fas fa-clipboard-list text-primary" style="font-size:14px;flex-shrink:0"></i>
                    <router-link
                      :to="`/todo/${task.id}/edit`"
                      class="text-decoration-none text-primary fw-semibold text-truncate"
                      :class="{'text-decoration-line-through text-muted': task.status === 'DONE'}"
                      :title="`${task.work_id} ${task.title}`"
                    >
                      {{ task.work_id }} {{ task.title }}
                    </router-link>
                  </div>
                </td>

                <!-- Assignee -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <img
                      :src="task.assignee?.avatar || 'https://i.pravatar.cc/150?img=99'"
                      class="rounded-circle"
                      width="24" height="24"
                      style="object-fit:cover"
                    />
                    <span class="small">{{ task.assignee?.name || 'Unassigned' }}</span>
                  </div>
                </td>

                <!-- Reporter -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <img
                      :src="task.reporter?.avatar || 'https://i.pravatar.cc/150?img=98'"
                      class="rounded-circle"
                      width="24" height="24"
                      style="object-fit:cover"
                    />
                    <span class="small">{{ task.reporter?.name || 'System' }}</span>
                  </div>
                </td>

                <!-- Priority -->
                <td>
                  <span class="d-flex align-items-center gap-1 small">
                    <i :class="getPriorityIcon(task.priority)" :style="`color:${getPriorityColor(task.priority)}`"></i>
                    {{ task.priority }}
                  </span>
                </td>

                <!-- Status Dropdown -->
                <td>
                  <select
                    v-model="task.status"
                    class="form-select form-select-sm status-select"
                    :class="getStatusClass(task.status)"
                    @change="updateStatus(task)"
                    style="font-size:11px; font-weight:600; min-width:110px"
                  >
                    <option value="TO DO">TO DO</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </td>

                <!-- Due Date -->
                <td class="small text-muted">{{ task.due_date || 'None' }}</td>

                <!-- Story Points -->
                <td class="text-center">
                  <span class="badge bg-light text-dark border fw-bold">{{ task.story_points }}</span>
                </td>

                <!-- Labels -->
                <td>
                  <span
                    v-if="task.label"
                    class="badge bg-light text-secondary border small"
                  >{{ task.label }}</span>
                </td>

                <!-- Actions -->
                <td class="text-center">
                  <router-link :to="`/todo/${task.id}/edit`" class="btn btn-sm btn-outline-primary me-1" title="Edit">
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteTask(task.id)" title="Hapus">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredTasks.length === 0">
                <td colspan="10" class="text-center py-5 text-muted">
                  <i class="fas fa-tasks fa-2x mb-2 d-block"></i>
                  Tidak ada task dengan filter ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-3 py-2 text-muted small border-top">
          Menampilkan {{ filteredTasks.length }} dari {{ tasks.length }} task
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { CCard, CCardBody } from '@coreui/vue'
import { TodoRepository } from '../../db/localStorage'

export default {
  name: 'TodoListView',
  components: { CCard, CCardBody },
  setup() {
    const tasks = ref([])
    const loading = ref(false)
    const activeFilter = ref('ALL')

    const filters = [
      { label: 'All', value: 'ALL' },
      { label: 'To Do', value: 'TO DO' },
      { label: 'In Progress', value: 'IN PROGRESS' },
      { label: 'Done', value: 'DONE' },
    ]

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
