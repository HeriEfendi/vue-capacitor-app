<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button default-href="/products" /></ion-buttons>
        <ion-title>Tambah Produk</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-list>
            <ion-item><ion-label position="stacked">Nama Produk</ion-label><ion-input v-model="newProduct.name" /></ion-item>
            <ion-item><ion-label position="stacked">Harga</ion-label><ion-input type="number" v-model.number="newProduct.price" /></ion-item>
            <ion-item><ion-label position="stacked">Stok</ion-label><ion-input type="number" v-model.number="newProduct.stock" /></ion-item>
            <ion-item><ion-label position="stacked">Deskripsi</ion-label><ion-textarea v-model="newProduct.description" /></ion-item>
            <ion-item>
                <ion-label position="stacked">Gambar</ion-label>
                <input type="file" @change="handleImageUpload" />
            </ion-item>
        </ion-list>
        <ion-button expand="block" class="ion-margin-top" @click="addProduct">Simpan</ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ProductRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonTextarea } from '@ionic/vue';

export default {
  name: 'ProductCreateView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonList, IonTextarea },
  setup() {
    const router = useRouter()
    const newProduct = ref({ name: '', price: 0, stock: 0, description: '', image: null })
    const handleImageUpload = (e) => { const f = e.target.files[0]; if (f) newProduct.value.image = f }
    const addProduct = async () => { await ProductRepository.add(newProduct.value); router.push('/products') }
    return { newProduct, handleImageUpload, addProduct }
  }
}
</script>


