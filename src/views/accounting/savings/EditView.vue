<template>
  <ion-page class="app-page" v-if="loaded">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div>
            <ion-title class="app-hero-title">Edit Tabungan</ion-title>
            <p class="app-hero-subtitle">Perbarui data tabungan.</p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <ion-card class="mobile-card mx-3 mt-3">
        <ion-card-content>
          <div class="form-stack">
            <div class="field-group">
              <label class="field-label">Sumber Tabungan</label>
              <input type="text" v-model="form.source" class="form-control app-control" />
            </div>
            <div class="field-group">
              <label class="field-label">Jumlah</label>
              <input type="number" v-model.number="form.amount" class="form-control app-control" />
            </div>
            <div class="field-group">
              <label class="field-label">Tanggal</label>
              <input type="date" v-model="form.date" class="form-control app-control" />
            </div>
            <div class="field-group">
              <label class="field-label">Kategori</label>
              <select v-model="form.category" class="form-control app-control">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          <div class="mobile-card-footer mt-3">
            <ion-button class="btn-action light" router-link="/savings">Batal</ion-button>
            <ion-button class="btn-action primary" @click="onSubmit">Simpan Perubahan</ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { savingsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent } from '@ionic/vue';

export default {
  name: 'AccountingSavingsEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loaded = ref(false)
    const categories = ['Rekening Bank', 'Reksadana', 'Kripto', 'E-Wallet', 'Saham', 'Logam Mulia', 'Lainnya']
    const form = ref({ source: '', amount: 0, date: new Date().toISOString().slice(0,10), category: 'Rekening Bank' })
    const load = async () => {
      const id = Number(route.params.id)
      const data = await savingsRepo.getById(id)
      if (!data) return router.push('/savings')
      form.value = { 
        source: data.source, 
        amount: data.amount, 
        date: (data.date || new Date().toISOString()).slice(0,10),
        category: data.category || 'Rekening Bank'
      }
      loaded.value = true
    }
    const onSubmit = async () => { await savingsRepo.update(Number(route.params.id), { ...form.value }); router.push('/savings') }
    onMounted(load)
    return { form, onSubmit, loaded, categories }
  }
}
</script>
