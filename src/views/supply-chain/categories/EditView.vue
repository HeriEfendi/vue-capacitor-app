<template>
  <ion-page v-if="name !== null">
    <ion-header>
      <ion-toolbar class="header-dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/categories" />
        </ion-buttons>
        <ion-title>Edit Kategori</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <div class="mobile-card p-4">
        <h5 class="fw-bold text-dark mb-4">Informasi Kategori</h5>

        <div class="form-stack">
          <div class="field-group mb-4">
            <label class="field-label">Nama Kategori</label>
            <input type="text" v-model="name" class="form-control app-control" placeholder="Contoh: Makanan, Minuman, Pakaian" />
          </div>
        </div>
      </div>

      <div class="p-3">
        <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="save">
          Simpan Perubahan
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, toastController } from '@ionic/vue';

export default {
  name: 'CategoryEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const name = ref(null)

    onMounted(async () => {
      const data = await CategoryRepository.getById(Number(route.params.id))
      name.value = data?.name || ''
    })

    const showToast = async (msg, color = 'danger') => {
      const toast = await toastController.create({
        message: msg,
        duration: 2000,
        color: color,
        position: 'top'
      })
      await toast.present()
    }

    const save = async () => {
      if (!name.value.trim()) {
        await showToast('Nama kategori tidak boleh kosong!')
        return
      }

      await CategoryRepository.update(Number(route.params.id), { name: name.value.trim() })
      await showToast('Kategori berhasil diperbarui!', 'success')
      router.push('/categories')
    }

    return { name, save }
  }
}
</script>
