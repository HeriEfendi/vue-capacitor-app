<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Daftar Produk</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/products/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col v-for="product in products" :key="product.id" size="12" size-sm="6" size-md="4">
            <ion-card>
              <ion-img :src="product.imageURL" :alt="product.name" />
              <ion-card-header>
                <ion-card-title>{{ product.name }}</ion-card-title>
                <ion-card-subtitle>{{ formatPrice(product.price) }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="d-flex justify-content-end">
                  <ion-button fill="clear" color="medium" router-link="`/products/${product.id}/edit`">
                    <ion-icon :icon="pencilOutline" />
                  </ion-button>
                  <ion-button fill="clear" color="danger" @click="deleteProduct(product.id)">
                    <ion-icon :icon="trashOutline" />
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ProductRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButtons, IonBackButton, IonImg } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'ProductsListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButtons, IonBackButton, IonImg },
  setup() {
    const products = ref([])
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const fetchData = async () => {
      products.value = await ProductRepository.getAll();
      products.value.forEach(product => {
        if (product.image) {
          product.imageURL = typeof product.image === 'string' ? product.image : URL.createObjectURL(product.image)
        } else {
          product.imageURL = 'https://via.placeholder.com/200x150?text=No+Image'
        }
      })
    }
    const deleteProduct = async (id) => { await ProductRepository.delete(id); fetchData() }
    onMounted(fetchData)
    return { products, formatPrice, deleteProduct, addOutline, trashOutline, pencilOutline }
  }
}
</script>


