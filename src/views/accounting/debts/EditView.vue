<template>
  <ion-page v-if="loaded">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/debts" /></ion-buttons>
        <ion-title>Edit Utang</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Pemberi Utang</ion-label><ion-input v-model="form.lender" /></ion-item>
            <ion-item><ion-label position="stacked">Jumlah</ion-label><ion-input type="number" v-model.number="form.amount" /></ion-item>
            <ion-item><ion-label position="stacked">Jatuh Tempo</ion-label><ion-input type="date" v-model="form.dueDate" /></ion-item>
            <ion-item>
                <ion-label position="stacked">Status</ion-label>
                <ion-select v-model="form.status">
                    <ion-select-option value="Belum Lunas">Belum Lunas</ion-select-option>
                    <ion-select-option value="Lunas">Lunas</ion-select-option>
                </ion-select>
            </ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="onSubmit">Simpan Perubahan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debtsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonSelect, IonSelectOption } from '@ionic/vue';

export default {
  name: 'AccountingDebtsEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonSelect, IonSelectOption },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loaded = ref(false)
    const form = ref({ lender: '', amount: 0, dueDate: new Date().toISOString().slice(0,10), status: 'Belum Lunas' })
    const load = async () => {
      const id = Number(route.params.id)
      const data = await debtsRepo.getById(id)
      if (!data) return router.push('/debts')
      form.value = { lender: data.lender, amount: data.amount, dueDate: (data.dueDate || new Date().toISOString()).slice(0,10), status: data.status }
      loaded.value = true
    }
    const onSubmit = async () => { await debtsRepo.update(Number(route.params.id), { ...form.value }); router.push('/debts') }
    onMounted(load)
    return { form, onSubmit, loaded }
  }
}
</script>


