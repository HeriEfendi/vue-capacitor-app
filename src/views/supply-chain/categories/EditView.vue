<template>
  <ion-page v-if="name !== null">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/categories" /></ion-buttons>
        <ion-title>Edit Kategori</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Nama</ion-label><ion-input v-model="name" /></ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="save">Simpan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';

export default {
  name: 'CategoryEditView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton },
  setup() {
    const route = useRoute(); const router = useRouter()
    const name = ref(null)
    onMounted(async () => { const data = await CategoryRepository.getById(Number(route.params.id)); name.value = data?.name || '' })
    const save = async () => { await CategoryRepository.update(Number(route.params.id), { name: name.value }); router.push('/categories') }
    return { name, save }
  }
}
</script>


