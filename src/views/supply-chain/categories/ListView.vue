<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Kategori</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/categories/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="cat in categories" :key="cat.id">
          <ion-label>{{ cat.name }}</ion-label>
          <ion-button fill="clear" color="medium" @click="goEdit(cat.id)">
            <ion-icon :icon="pencilOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click="remove(cat.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { CategoryRepository } from '../../../db/repositories'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonButtons, IonBackButton } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'CategoriesListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonButtons, IonBackButton },
  setup() {
    const router = useRouter()
    const categories = ref([])
    const fetch = async () => { categories.value = await CategoryRepository.getAll() }
    const goEdit = (id) => router.push(`/categories/${id}/edit`)
    const remove = async (id) => { await CategoryRepository.delete(id); fetch() }
    onMounted(fetch)
    return { categories, goEdit, remove, addOutline, trashOutline, pencilOutline }
  }
}
</script>


