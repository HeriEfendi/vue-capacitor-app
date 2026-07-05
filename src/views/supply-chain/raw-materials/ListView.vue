<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Bahan Baku</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/raw-materials/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="row in items" :key="row.id">
          <ion-label>
            <h2>{{ row.name }}</h2>
            <p>{{ row.unit }}</p>
          </ion-label>
          <ion-note slot="end">{{ row.stock }} stok</ion-note>
          <ion-button fill="clear" color="medium" @click="goEdit(row.id)">
            <ion-icon :icon="pencilOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click.stop="remove(row.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { RawMaterialsRepository } from '../../../db/repositories'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton, IonBadge } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'RawMaterialsListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton, IonBadge },
  setup() {
    const router = useRouter()
    const items = ref([])
    const fetchAll = async () => { items.value = await RawMaterialsRepository.getAll() }
    const goEdit = (id) => router.push(`/raw-materials/${id}/edit`)
    const remove = async (id) => { await RawMaterialsRepository.delete(id); fetchAll() }
    onMounted(fetchAll)
    return { items, goEdit, remove, addOutline, trashOutline, pencilOutline }
  }
}
</script>


