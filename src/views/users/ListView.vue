<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0 fw-bold">User Management</h4>
        <small class="text-muted">Manage team members, assignees, and task reporters.</small>
      </div>
      <button class="btn btn-primary d-flex align-items-center gap-2" @click="openCreateDialog">
        <i class="fas fa-user-plus"></i>
        Add User
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Table -->
    <CCard v-else>
      <CCardBody class="p-0">
        <CTable hover responsive class="mb-0">
          <CTableHead class="table-light">
            <CTableRow>
              <CTableHeaderCell style="width:60px">Avatar</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Joined</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width:80px">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="user in users" :key="user.id" class="align-middle">
              <CTableDataCell>
                <img
                  :src="user.avatar || `https://i.pravatar.cc/150?u=${user.email}`"
                  :alt="user.name"
                  class="rounded-circle border"
                  width="36"
                  height="36"
                  style="object-fit: cover;"
                />
              </CTableDataCell>
              <CTableDataCell class="fw-semibold">{{ user.name }}</CTableDataCell>
              <CTableDataCell class="text-muted">{{ user.email }}</CTableDataCell>
              <CTableDataCell class="text-muted small">{{ formatDate(user.created_at) }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteUser(user.id)"
                  title="Hapus User"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-if="users.length === 0">
              <CTableDataCell colspan="5" class="text-center py-5 text-muted">
                <i class="fas fa-users fa-2x mb-2 d-block"></i>
                No users found.
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>

    <!-- Create User Modal -->
    <CModal :visible="createDialog" @close="createDialog = false" backdrop="static" size="sm">
      <CModalHeader>
        <CModalTitle class="fw-bold">Create New User</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <form @submit.prevent="saveUser" id="create-user-form">
          <div class="mb-3">
            <label class="form-label fw-semibold">Name <span class="text-danger">*</span></label>
            <input
              v-model="newUser.name"
              type="text"
              class="form-control"
              placeholder="Full Name"
              required
            />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Email Address <span class="text-danger">*</span></label>
            <input
              v-model="newUser.email"
              type="email"
              class="form-control"
              placeholder="user@example.com"
              required
            />
          </div>
        </form>
      </CModalBody>
      <CModalFooter>
        <button type="button" class="btn btn-outline-secondary" @click="createDialog = false">Cancel</button>
        <button
          type="submit"
          form="create-user-form"
          class="btn btn-primary d-flex align-items-center gap-2"
          :disabled="saving"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm"></span>
          Save User
        </button>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import {
  CCard, CCardBody, CTable, CTableHead, CTableBody, CTableRow,
  CTableHeaderCell, CTableDataCell, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter
} from '@coreui/vue'
import { UsersRepository } from '@/db/usersRepository'

export default {
  name: 'UsersListView',
  components: {
    CCard, CCardBody, CTable, CTableHead, CTableBody, CTableRow,
    CTableHeaderCell, CTableDataCell, CModal, CModalHeader, CModalTitle,
    CModalBody, CModalFooter
  },
  setup() {
    const users = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const createDialog = ref(false)
    const newUser = ref({ name: '', email: '' })

    const fetchUsers = async () => {
      loading.value = true
      try {
        users.value = await UsersRepository.getAll()
      } finally {
        loading.value = false
      }
    }

    const openCreateDialog = () => {
      newUser.value = { name: '', email: '' }
      createDialog.value = true
    }

    const saveUser = async () => {
      if (!newUser.value.name || !newUser.value.email) return
      // Check duplicate email
      const existing = users.value.find(u => u.email === newUser.value.email)
      if (existing) {
        alert('Email sudah terdaftar!')
        return
      }
      saving.value = true
      try {
        await UsersRepository.add(newUser.value)
        await fetchUsers()
        createDialog.value = false
      } finally {
        saving.value = false
      }
    }

    const deleteUser = async (id) => {
      if (confirm('Yakin ingin menghapus user ini? Task yang terkait akan kehilangan assignee/reporter.')) {
        await UsersRepository.delete(id)
        await fetchUsers()
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    }

    onMounted(fetchUsers)

    return { users, loading, saving, createDialog, newUser, openCreateDialog, saveUser, deleteUser, formatDate }
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>
