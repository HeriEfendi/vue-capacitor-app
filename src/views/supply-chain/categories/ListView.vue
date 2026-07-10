<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Kategori Produk</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/categories/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <div class="px-2 pt-2">
        <!-- Empty State -->
        <div v-if="categories.length === 0" class="empty-state text-center py-5">
          <ion-icon :icon="listOutline" style="font-size: 3rem;" class="text-muted mb-2" />
          <p class="text-muted">Belum ada kategori yang dibuat.</p>
        </div>

        <!-- Categories List Card -->
        <div v-else class="mobile-card p-3">
          <h6 class="fw-bold text-dark mb-3">Daftar Kategori</h6>
          <div class="list-group list-group-flush">
            <div 
              v-for="cat in categories" 
              :key="cat.id" 
              class="list-group-item d-flex justify-content-between align-items-center py-3 px-1 border-bottom-dashed"
            >
              <div>
                <span class="fw-semibold text-dark fs-6">{{ cat.name }}</span>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-light btn-sm text-primary py-1 px-2 border" @click="goEdit(cat.id)">
                  <ion-icon :icon="createOutline" />
                </button>
                <button class="btn btn-light btn-sm text-danger py-1 px-2 border" @click="confirmDelete(cat.id)">
                  <ion-icon :icon="trashOutline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Alert -->
      <ion-alert
        :is-open="deleteId !== null"
        header="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak bisa dibatalkan."
        :buttons="[
          { text: 'Batal', role: 'cancel', handler: () => { deleteId = null } },
          { text: 'Hapus', role: 'destructive', handler: () => { remove() } }
        ]"
        @didDismiss="deleteId = null"
      />
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { CategoryRepository } from '../../../db/repositories'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonBackButton, IonAlert, toastController } from '@ionic/vue';
import { addOutline, trashOutline, createOutline, listOutline } from 'ionicons/icons';

export default {
  name: 'CategoriesListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonBackButton, IonAlert },
  setup() {
    const router = useRouter()
    const categories = ref([])
    const deleteId = ref(null)

    const fetch = async () => {
      categories.value = await CategoryRepository.getAll()
    }

    const goEdit = (id) => router.push(`/categories/${id}/edit`)
    
    const confirmDelete = (id) => {
      deleteId.value = id
    }

    const remove = async () => {
      if (deleteId.value !== null) {
        await CategoryRepository.delete(deleteId.value)
        const toast = await toastController.create({
          message: 'Kategori berhasil dihapus!',
          duration: 2000,
          color: 'success',
          position: 'top'
        })
        await toast.present()
        deleteId.value = null
        await fetch()
      }
    }

    onMounted(fetch)

    return { categories, deleteId, goEdit, confirmDelete, remove, addOutline, trashOutline, createOutline, listOutline }
  }
}
</script>

<style scoped>
.border-bottom-dashed {
  border-bottom: 1px dashed rgba(0,0,0,0.08) !important;
}
.border-bottom-dashed:last-child {
  border-bottom: none !important;
}
</style>
