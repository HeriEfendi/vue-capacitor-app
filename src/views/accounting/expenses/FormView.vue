<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div>
            <p class="eyebrow">Accounting</p>
            <ion-title class="app-hero-title">{{ isEdit ? 'Edit Pengeluaran' : 'Tambah Pengeluaran' }}</ion-title>
            <p class="app-hero-subtitle">Input cepat nominal, kategori, dan tanggal dengan layout mobile yang rapi.</p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div v-if="!loaded" class="loading-state">Memuat data...</div>

      <ion-card v-else class="mobile-card">
        <ion-card-content>
          <div class="form-stack">
            <div class="field-group">
              <label class="field-label">Deskripsi</label>
              <ion-input v-model="form.description" placeholder="Deskripsi pengeluaran" class="app-control" />
            </div>
            <div class="field-group">
              <label class="field-label">Jumlah</label>
              <ion-input v-model="form.amount" type="number" inputmode="decimal" class="app-control" />
            </div>
            <div class="field-group">
              <label class="field-label">Tanggal</label>
              <ion-input v-model="form.date" type="date" class="app-control" />
            </div>
            <div class="field-group">
              <label class="field-label">Kategori</label>
              <ion-input v-model="form.category" placeholder="Kategori" class="app-control" />
            </div>
          </div>

          <div class="mobile-card-footer mt-3">
            <ion-button class="btn-action light" router-link="/expenses">Batal</ion-button>
            <ion-button class="btn-action primary" @click="onSubmit">{{ isEdit ? 'Simpan Perubahan' : 'Simpan' }}</ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>
import { computed, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'
import { expensesRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonIcon, IonCard, IonCardContent, IonInput } from '@ionic/vue';
import { chevronBackOutline } from 'ionicons/icons'

export default {
  name: 'AccountingExpensesFormView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonIcon, IonCard, IonCardContent, IonInput },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loaded = ref(false)
    const form = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0, 10), category: '' })
    const isEdit = computed(() => Boolean(route.params.id))
    
    const resetForm = () => {
      form.value = { description: '', amount: 0, date: new Date().toISOString().slice(0, 10), category: '' }
    }

    const load = async () => {
      if (!isEdit.value) {
        resetForm()
        loaded.value = true
        return
      }
      const data = await expensesRepo.getById(Number(route.params.id))
      if (!data) return router.push('/expenses')
      form.value = {
        description: data.description || '',
        amount: data.amount || 0,
        date: (data.date || new Date().toISOString()).slice(0, 10),
        category: data.category || '',
      }
      loaded.value = true
    }

    const onSubmit = async () => {
      const payload = { ...form.value, amount: Number(form.value.amount) }
      if (isEdit.value) await expensesRepo.update(Number(route.params.id), payload)
      else await expensesRepo.add(payload)
      await router.push('/expenses')
    }

    onIonViewWillEnter(load)

    return { form, onSubmit, loaded, isEdit, chevronBackOutline }
  }
}
</script>
