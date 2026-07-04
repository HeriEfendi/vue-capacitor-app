<template>
  <form @submit.prevent="emitSave">
    <!-- Title -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Task Title / Work Description <span class="text-danger">*</span></label>
      <input
        v-model="localForm.title"
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
        <select v-model="localForm.assignee_id" class="form-select">
          <option :value="null">-- Pilih Assignee --</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label fw-semibold">Reporter</label>
        <select v-model="localForm.reporter_id" class="form-select">
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
          v-model.number="localForm.story_points"
          type="number"
          min="1"
          max="100"
          class="form-control"
          required
        />
      </div>
      <div class="col-4">
        <label class="form-label fw-semibold">Priority</label>
        <select v-model="localForm.priority" class="form-select">
          <option>Highest</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <div class="col-4">
        <label class="form-label fw-semibold">Status</label>
        <select v-model="localForm.status" class="form-select">
          <option>TO DO</option>
          <option>IN PROGRESS</option>
          <option>DONE</option>
        </select>
      </div>
    </div>

    <!-- Due Date & Label -->
    <div class="row mb-3">
      <div class="col-md-6 mb-3 mb-md-0">
        <label class="form-label fw-semibold">Due Date</label>
        <input v-model="localForm.due_date" type="date" class="form-control" />
      </div>
      <div class="col-md-6">
        <label class="form-label fw-semibold">Label</label>
        <input
          v-model="localForm.label"
          type="text"
          class="form-control"
          placeholder="e.g. env-staging, ui, backend"
        />
      </div>
    </div>
    
    <!-- Description -->
    <div class="mb-4">
        <label class="form-label fw-semibold">Description</label>
        <textarea v-model="localForm.description" class="form-control" style="height: 200px;" placeholder="Tulis detail tugas..."></textarea>
    </div>

    <!-- Buttons -->
    <div class="d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn-primary d-flex align-items-center gap-2">
        Save Changes
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { UsersRepository } from '../../db/localStorage'

const props = defineProps(['task'])
const emit = defineEmits(['save', 'cancel'])

const localForm = ref({ ...props.task })
const users = ref([])

watch(() => props.task, (newVal) => {
    localForm.value = { ...newVal }
}, { deep: true })

const fetchUsers = () => {
  users.value = UsersRepository.getAll()
}

const emitSave = () => {
    Object.assign(props.task, localForm.value)
    emit('save')
}

onMounted(fetchUsers)
</script>
