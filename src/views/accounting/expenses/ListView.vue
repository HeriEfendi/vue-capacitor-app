<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Daftar Pengeluaran</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/expenses/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="expense in expenses" :key="expense.id">
          <ion-label>
            <h2>{{ expense.description }}</h2>
            <p>{{ expense.category }} • {{ formatDate(expense.date) }}</p>
          </ion-label>
          <ion-note slot="end" color="danger">{{ formatPrice(expense.amount) }}</ion-note>
          <ion-button fill="clear" color="medium" @click="$router.push(`/expenses/${expense.id}/edit`)">
            <ion-icon :icon="pencilOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click="onDelete(expense.id)">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref } from 'vue'
import { expensesRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'AccountingExpensesListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonButtons, IonBackButton },
  setup() {
    const expenses = ref([])
    const fetchAll = async () => { expenses.value = await expensesRepo.getAll() }
    const onDelete = async (id) => { await expensesRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    return { expenses, onDelete, formatPrice, formatDate, addOutline, trashOutline, pencilOutline }
  }
}
</script>


