<template>
  <ion-page v-if="loaded">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/expenses" /></ion-buttons>
        <ion-title>Edit Pengeluaran</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Deskripsi</ion-label><ion-input v-model="form.description" /></ion-item>
            <ion-item><ion-label position="stacked">Jumlah</ion-label><ion-input type="number" v-model.number="form.amount" /></ion-item>
            <ion-item><ion-label position="stacked">Tanggal</ion-label><ion-input type="date" v-model="form.date" /></ion-item>
            <ion-item><ion-label position="stacked">Kategori</ion-label><ion-input v-model="form.category" /></ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="onSubmit">Simpan Perubahan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { expensesRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';

export default {
  name: 'AccountingExpensesEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loaded = ref(false)
    const form = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0,10), category: '' })
    const load = async () => {
      const id = Number(route.params.id)
      const data = await expensesRepo.getById(id)
      if (!data) return router.push('/expenses')
      form.value = { description: data.description, amount: data.amount, date: (data.date || new Date().toISOString()).slice(0,10), category: data.category }
      loaded.value = true
    }
    const onSubmit = async () => { await expensesRepo.update(Number(route.params.id), { ...form.value }); router.push('/expenses') }
    onMounted(load)
    return { form, onSubmit, loaded }
  }
}
</script>


