<template>
  <ion-page v-if="loaded">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/capital" /></ion-buttons>
        <ion-title>Edit Modal</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Sumber</ion-label><input type="text" v-model="form.source" /></ion-item>
            <ion-item><ion-label position="stacked">Jumlah</ion-label><input type="number" v-model.number="form.amount" /></ion-item>
            <ion-item><ion-label position="stacked">Tanggal</ion-label><input type="date" v-model="form.date" /></ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="onSubmit">Simpan Perubahan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { capitalCostsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';

export default {
  name: 'AccountingCapitalEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loaded = ref(false)
    const form = ref({ source: '', amount: 0, date: new Date().toISOString().slice(0,10) })
    const load = async () => {
      const id = Number(route.params.id)
      const data = await capitalCostsRepo.getById(id)
      if (!data) return router.push('/capital')
      form.value = { source: data.source, amount: data.amount, date: (data.date || new Date().toISOString()).slice(0,10) }
      loaded.value = true
    }
    const onSubmit = async () => { await capitalCostsRepo.update(Number(route.params.id), { ...form.value }); router.push('/capital') }
    onMounted(load)
    return { form, onSubmit, loaded }
  }
}
</script>


