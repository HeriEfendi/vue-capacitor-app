<template>
  <form class="todo-form" @submit.prevent="emitSave">
    <section class="form-section">
      <label class="form-label fw-semibold">Task Title / Work Description <span class="text-danger">*</span></label>
      <input
        v-model="localForm.title"
        type="text"
        class="form-control app-control"
        placeholder="Deskripsi pekerjaan..."
        required
      />
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Assignee</label>
          <select v-model="localForm.assignee_id" class="form-select app-control">
            <option :value="null">-- Pilih Assignee --</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Reporter</label>
          <select v-model="localForm.reporter_id" class="form-select app-control">
            <option :value="null">-- Pilih Reporter --</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-4">
          <label class="form-label fw-semibold">Points</label>
          <input
            v-model.number="localForm.story_points"
            type="number"
            min="1"
            max="100"
            class="form-control app-control"
            required
          />
        </div>
        <div class="col-4">
          <label class="form-label fw-semibold">Priority</label>
          <select v-model="localForm.priority" class="form-select app-control">
            <option>Highest</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div class="col-4">
          <label class="form-label fw-semibold">Status</label>
          <select v-model="localForm.status" class="form-select app-control">
            <option>TO DO</option>
            <option>IN PROGRESS</option>
            <option>DONE</option>
          </select>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Due Date</label>
          <input v-model="localForm.due_date" type="date" class="form-control app-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Label</label>
          <input
            v-model="localForm.label"
            type="text"
            class="form-control app-control"
            placeholder="e.g. env-staging, ui, backend"
          />
        </div>
      </div>
      <label class="form-label fw-semibold">Description</label>
      <textarea v-model="localForm.description" class="form-control app-control description-control" placeholder="Tulis detail tugas..."></textarea>

    </section>

    <div class="form-actions">
      <button type="button" class="btn btn-action light" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn-action primary">Save Changes</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { UsersRepository } from '@/db/usersRepository'

const props = defineProps(['task'])
const emit = defineEmits(['save', 'cancel'])

const localForm = ref({ ...props.task })
const users = ref<any[]>([])

watch(() => props.task, (newVal) => {
  localForm.value = { ...newVal }
}, { deep: true })

const fetchUsers = async () => {
  users.value = await UsersRepository.getAll()
}

const emitSave = () => {
  const plainData = JSON.parse(JSON.stringify(localForm.value))
  emit('save', plainData)
}

onMounted(fetchUsers)
</script>

<style scoped>
.todo-form {
  display: flex;
  flex-direction: column;
  gap: 12px;  
}

.form-label {
  color: #1f2937;
  font-size: .88rem;
}

.description-control {
  min-height: 160px;
}
</style>
