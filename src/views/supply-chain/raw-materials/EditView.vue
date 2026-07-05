<template>
  <ion-page v-if="form">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/raw-materials" /></ion-buttons>
        <ion-title>Edit Bahan Baku</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Nama</ion-label><ion-input v-model="form.name" /></ion-item>
            <ion-item><ion-label position="stacked">Satuan</ion-label><ion-input v-model="form.unit" /></ion-item>
            <ion-item><ion-label position="stacked">Stok</ion-label><ion-input type="number" v-model.number="form.stock" /></ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="save">Simpan Perubahan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RawMaterialsRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';

export default {
  name: 'RawMaterialsEditView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton },
  setup() {
    const route = useRoute(); const router = useRouter()
    const form = ref(null)
    onMounted(async () => { form.value = await RawMaterialsRepository.getById(Number(route.params.id)) })
    const save = async () => { await RawMaterialsRepository.update(form.value.id, form.value); router.push('/raw-materials') }
    return { form, save }
  }
}
</script>


