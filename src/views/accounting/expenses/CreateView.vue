<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/expenses" /></ion-buttons>
        <ion-title>Tambah Pengeluaran</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Deskripsi</ion-label><ion-input v-model="form.description" /></ion-item>
            <ion-item><ion-label position="stacked">Jumlah</ion-label><ion-input type="number" v-model.number="form.amount" /></ion-item>
            <ion-item><ion-label position="stacked">Tanggal</ion-label><ion-input type="date" v-model="form.date" /></ion-item>
            <ion-item><ion-label position="stacked">Kategori</ion-label><ion-input v-model="form.category" /></ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="onSubmit">Simpan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { expensesRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';

export default {
  name: 'AccountingExpensesCreateView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList },
  setup() {
    const router = useRouter()
    const form = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0,10), category: '' })
    const onSubmit = async () => { await expensesRepo.add({ ...form.value }); router.push('/expenses') }
    return { form, onSubmit }
  }
}
</script>


