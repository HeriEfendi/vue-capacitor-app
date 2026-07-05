<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Daftar Utang</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/debts/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="debt in debts" :key="debt.id">
          <ion-label>
            <h2>{{ debt.lender }}</h2>
            <p>{{ formatDate(debt.dueDate) }}</p>
          </ion-label>
          <div slot="end" class="d-flex flex-column align-items-end">
            <ion-note color="danger">{{ formatPrice(debt.amount) }}</ion-note>
            <ion-badge :color="debt.status === 'Paid' ? 'success' : 'warning'">{{ debt.status }}</ion-badge>
          </div>
          <ion-button fill="clear" color="medium" @click="$router.push(`/debts/${debt.id}/edit`)">
            <ion-icon :icon="pencilOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click="onDelete(debt.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { debtsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton, IonBadge } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'AccountingDebtsListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton, IonBadge },
  setup() {
    const debts = ref([])
    const fetchAll = async () => { debts.value = await debtsRepo.getAll() }
    const onDelete = async (id) => { await debtsRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    return { debts, onDelete, formatPrice, formatDate, addOutline, trashOutline, pencilOutline }
  }
}
</script>


