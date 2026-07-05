<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Daftar Tabungan</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/capital/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="row in items" :key="row.id">
          <ion-label>
            <h2>{{ row.source }}</h2>
            <p>{{ formatDate(row.date) }}</p>
          </ion-label>
          <ion-note slot="end">{{ formatPrice(row.amount) }}</ion-note>
          <ion-button fill="clear" color="medium" @click="$router.push(`/capital/${row.id}/edit`)">
            <ion-icon :icon="pencilOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click="onDelete(row.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { capitalCostsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'AccountingCapitalListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton },
  setup() {
    const items = ref([])
    const fetchAll = async () => { items.value = await capitalCostsRepo.getAll() }
    const onDelete = async (id) => { await capitalCostsRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    return { items, onDelete, formatPrice, formatDate, addOutline, trashOutline, pencilOutline }
  }
}
</script>


