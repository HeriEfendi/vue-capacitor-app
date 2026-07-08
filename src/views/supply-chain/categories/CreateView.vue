<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/categories" />
        </ion-buttons>
        <ion-title>Tambah Kategori</ion-title>
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
          Simpan Kategori
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, toastController } from '@ionic/vue';

export default {
  name: 'CategoryCreateView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton },
  setup() {
    const router = useRouter()
    const name = ref('')

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

      await CategoryRepository.add({ name: name.value.trim() })
      await showToast('Kategori berhasil ditambahkan!', 'success')
      router.push('/categories')
    }

    return { name, save }
  }
}
</script>
