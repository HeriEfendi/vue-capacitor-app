<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/capital" /></ion-buttons>
        <ion-title>Tambah Modal</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Sumber</ion-label><input type="text" v-model="form.source" /></ion-item>
            <ion-item><ion-label position="stacked">Jumlah</ion-label><input type="number" v-model.number="form.amount" /></ion-item>
            <ion-item><ion-label position="stacked">Tanggal</ion-label><input type="date" v-model="form.date" /></ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="onSubmit">Simpan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { capitalCostsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';

export default {
  name: 'AccountingCapitalCreateView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList },
  setup() {
    const router = useRouter()
    const form = ref({ source: '', amount: 0, date: new Date().toISOString().slice(0,10) })
    const onSubmit = async () => { await capitalCostsRepo.add({ ...form.value }); router.push('/capital') }
    return { form, onSubmit }
  }
}
</script>


