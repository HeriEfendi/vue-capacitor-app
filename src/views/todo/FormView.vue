<template>
  <div class="container py-4" style="max-width:720px">
    <CCard>
      <CCardBody class="p-4">
        <h5 class="fw-bold mb-4">
          {{ isEdit ? 'Edit Task' : 'Create New Task' }}
        </h5>

        <form @submit.prevent="saveTask">
          <!-- Title -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Task Title / Work Description <span class="text-danger">*</span></label>
            <input
              v-model="form.title"
              type="text"
              class="form-control"
              placeholder="Deskripsi pekerjaan..."
              required
            />
          </div>

          <!-- Assignee & Reporter -->
          <div class="row mb-3">
            <div class="col-md-6 mb-3 mb-md-0">
              <label class="form-label fw-semibold">Assignee</label>
              <select v-model="form.assignee_id" class="form-select">
                <option :value="null">-- Pilih Assignee --</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Reporter</label>
              <select v-model="form.reporter_id" class="form-select">
                <option :value="null">-- Pilih Reporter --</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Story Points / Priority / Status -->
          <div class="row mb-3">
            <div class="col-4">
              <label class="form-label fw-semibold">Story Points</label>
              <input
                v-model.number="form.story_points"
                type="number"
                min="1"
                max="100"
                class="form-control"
                required
              />
            </div>
            <div class="col-4">
              <label class="form-label fw-semibold">Priority</label>
              <select v-model="form.priority" class="form-select">
                <option>Highest</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div class="col-4">
              <label class="form-label fw-semibold">Status</label>
              <select v-model="form.status" class="form-select">
                <option>TO DO</option>
                <option>IN PROGRESS</option>
                <option>DONE</option>
              </select>
            </div>
          </div>

          <!-- Due Date & Label -->
          <div class="row mb-4">
            <div class="col-md-6 mb-3 mb-md-0">
              <label class="form-label fw-semibold">Due Date</label>
              <input v-model="form.due_date" type="date" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Label</label>
              <input
                v-model="form.label"
                type="text"
                class="form-control"
                placeholder="e.g. env-staging, ui, backend"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="d-flex justify-content-end gap-2">
            <router-link to="/todo" class="btn btn-outline-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm"></span>
              Save Changes
            </button>
          </div>
        </form>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CCard, CCardBody } from '@coreui/vue'
import { TodoRepository, UsersRepository } from '../../db/localStorage'

export default {
  name: 'TodoFormView',
  components: { CCard, CCardBody },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isEdit = computed(() => !!route.params.id)
    const users = ref([])
    const saving = ref(false)

    const form = reactive({
      title: '',
      assignee_id: null,
      reporter_id: null,
      story_points: 1,
      priority: 'Medium',
      status: 'TO DO',
      due_date: '',
      label: '',
    })

    const fetchUsers = () => {
      users.value = UsersRepository.getAll()
    }

    onMounted(() => {
      fetchUsers()
      if (isEdit.value) {
        const task = TodoRepository.getById(route.params.id)
        if (task) {
          form.title = task.title
          form.assignee_id = task.assignee_id
          form.reporter_id = task.reporter_id
          form.story_points = task.story_points
          form.priority = task.priority
          form.status = task.status
          form.due_date = task.due_date || ''
          form.label = task.label || ''
        }
      }
    })

    const saveTask = () => {
      if (!form.title.trim()) return
      saving.value = true
      try {
        if (isEdit.value) {
          TodoRepository.update(route.params.id, { ...form })
        } else {
          TodoRepository.add({ ...form })
        }
        router.push('/todo')
      } catch (err) {
        console.error(err)
        alert('Gagal menyimpan task!')
      } finally {
        saving.value = false
      }
    }

    return { isEdit, users, form, saving, saveTask }
  }
}
</script>
