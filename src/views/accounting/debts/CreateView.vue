<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/debts" /></ion-buttons>
        <ion-title>Tambah Utang</ion-title>
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
        <ion-button expand="block" class="ion-margin-top" @click="onSubmit">Simpan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { debtsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonSelect, IonSelectOption } from '@ionic/vue';

export default {
  name: 'AccountingDebtsCreateView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonSelect, IonSelectOption },
  setup() {
    const router = useRouter()
    const form = ref({ lender: '', amount: 0, dueDate: new Date().toISOString().slice(0,10), status: 'Belum Lunas' })
    const onSubmit = async () => { await debtsRepo.add({ ...form.value }); router.push('/debts') }
    return { form, onSubmit }
  }
}
</script>


