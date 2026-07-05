<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>User Management</ion-title>
        <ion-buttons slot="end">
            <ion-button @click="openCreateDialog"><ion-icon slot="icon-only" :icon="addOutline" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <div v-if="loading" class="ion-text-center"><ion-spinner /></div>
        <ion-list v-else>
            <ion-item v-for="user in users" :key="user.id">
                <ion-avatar slot="start"><ion-img :src="user.avatar || `https://i.pravatar.cc/150?u=${user.email}`" /></ion-avatar>
                <ion-label>
                    <h2>{{ user.name }}</h2>
                    <p>{{ user.email }}</p>
                    <p class="small text-muted">Joined: {{ formatDate(user.created_at) }}</p>
                </ion-label>
                <ion-button slot="end" fill="clear" color="danger" @click="deleteUser(user.id)"><ion-icon slot="icon-only" :icon="trashOutline" /></ion-button>
            </ion-item>
        </ion-list>
    </ion-content>

    <ion-modal :is-open="createDialog" @didDismiss="createDialog = false">
        <ion-header>
            <ion-toolbar>
                <ion-title>Create User</ion-title>
                <ion-buttons slot="end"><ion-button @click="createDialog = false"><ion-icon :icon="closeOutline" /></ion-button></ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item><ion-label position="stacked">Name</ion-label><ion-input v-model="newUser.name" /></ion-item>
            <ion-item><ion-label position="stacked">Email</ion-label><ion-input type="email" v-model="newUser.email" /></ion-item>
            <ion-button expand="block" class="ion-margin-top" :disabled="saving" @click="saveUser">Save User</ion-button>
        </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonList, IonAvatar, IonImg, IonModal, IonSpinner, IonIcon } from '@ionic/vue';
import { addOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { UsersRepository } from '@/db/usersRepository'

export default {
  name: 'UsersListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonList, IonAvatar, IonImg, IonModal, IonSpinner, IonIcon },
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
