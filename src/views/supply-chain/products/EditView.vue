<template>
  <ion-page v-if="product">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/products" /></ion-buttons>
        <ion-title>Edit Produk</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Nama Produk</ion-label><ion-input v-model="product.name" /></ion-item>
            <ion-item><ion-label position="stacked">Harga</ion-label><ion-input type="number" v-model.number="product.price" /></ion-item>
            <ion-item><ion-label position="stacked">Stok</ion-label><ion-input type="number" v-model.number="product.stock" /></ion-item>
            <ion-item><ion-label position="stacked">Deskripsi</ion-label><ion-textarea v-model="product.description" /></ion-item>
            <ion-item>
                <ion-label position="stacked">Gambar</ion-label>
                <input type="file" @change="handleImageUpload" />
            </ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="save">Simpan Perubahan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProductRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonTextarea } from '@ionic/vue';

export default {
  name: 'ProductEditView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonTextarea },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const product = ref(null)
    onMounted(async () => { product.value = await ProductRepository.getById(Number(route.params.id)) })
    const handleImageUpload = (e) => { const f = e.target.files[0]; if (f) product.value.image = f }
    const save = async () => { await ProductRepository.update(product.value.id, product.value); router.push('/products') }
    return { product, handleImageUpload, save }
  }
}
</script>


