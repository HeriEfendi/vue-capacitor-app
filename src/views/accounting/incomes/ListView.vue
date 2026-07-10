<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Daftar Pendapatan</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/incomes/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="income in incomes" :key="income.id">
          <ion-label>
            <h2>{{ income.description }}</h2>
            <p>{{ formatDate(income.date) }}</p>
          </ion-label>
          <ion-note slot="end" color="success">{{ formatPrice(income.amount) }}</ion-note>
          <ion-button fill="clear" color="medium" @click="$router.push(`/incomes/${income.id}/edit`)">
            <ion-icon :icon="pencilOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click="onDelete(income.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { incomesRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'AccountingIncomesListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton },
  setup() {
    const incomes = ref([])
    const fetchAll = async () => { incomes.value = await incomesRepo.getAll() }
    const onDelete = async (id) => { await incomesRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    return { incomes, onDelete, formatPrice, formatDate, addOutline, trashOutline, pencilOutline }
  }
}
</script>


