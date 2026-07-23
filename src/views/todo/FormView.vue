<template>
  <form ref="formRef" class="form-container" @submit.prevent="emitSave">
    <section class="form-section">
      <div class="mb-3">
        <label class="form-label fw-semibold">Task Title / Work Description <span class="text-danger">*</span></label>
        <input
          v-model="localForm.title"
          type="text"
          class="form-control app-control"
          placeholder="Deskripsi pekerjaan..."
          required
        />
      </div>

      <div class="row g-3 mb-3">
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

      <div class="row g-3 mb-3">
        <div class="col-4">
          <label class="form-label fw-semibold">Points</label>
          <NumberInput
            v-model="localForm.story_points"
            placeholder="Points..."
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

      <div class="row g-3 mb-3">
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

      <div class="mb-3">
        <label class="form-label fw-semibold">Description</label>
        <textarea v-model="localForm.description" class="form-control app-control form-control-textarea" placeholder="Tulis detail tugas..."></textarea>
      </div>
    </section>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { UsersRepository } from '@/db/usersRepository'

const props = defineProps(['task'])
const emit = defineEmits(['save', 'cancel'])

const localForm = ref({ ...props.task })
const users = ref<any[]>([])
const formRef = ref<HTMLFormElement | null>(null)

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

const submit = () => {
  if (formRef.value && formRef.value.reportValidity()) {
    emitSave()
  }
}

defineExpose({ submit })

onMounted(fetchUsers)
</script>
