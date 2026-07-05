<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/raw-materials" /></ion-buttons>
        <ion-title>Tambah Bahan Baku</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Nama</ion-label><ion-input v-model="form.name" /></ion-item>
            <ion-item><ion-label position="stacked">Satuan</ion-label><ion-input v-model="form.unit" /></ion-item>
            <ion-item><ion-label position="stacked">Stok</ion-label><ion-input type="number" v-model.number="form.stock" /></ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="save">Simpan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { RawMaterialsRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';

export default {
  name: 'RawMaterialsCreateView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton },
  setup() {
    const router = useRouter()
    const form = ref({ name: '', unit: '', stock: 0 })
    const save = async () => { await RawMaterialsRepository.add(form.value); router.push('/raw-materials') }
    return { form, save }
  }
}
</script>


