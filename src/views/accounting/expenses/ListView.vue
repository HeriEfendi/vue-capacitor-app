<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div>
            <p class="eyebrow">Accounting</p>
            <ion-title class="app-hero-title">Pengeluaran</ion-title>
            <p class="app-hero-subtitle">Pantau arus keluar harian, mingguan, bulanan, dan tahunan dari layar mobile.</p>
          </div>
          <ion-buttons class="app-action-row">
            <ion-button class="btn-action primary" router-link="/expenses/create">
              <ion-icon slot="start" :icon="addOutline" /> Pengeluaran Baru
            </ion-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div class="summary-grid">
        <ion-card class="summary-card stat-card stat-blue shadow-soft">
          <div class="stat-top"><div class="icon-box-small">D</div><span>Harian</span></div>
          <div class="stat-value">{{ formatPrice(summary.daily) }}</div>
        </ion-card>
        <ion-card class="summary-card stat-card stat-purple shadow-soft">
          <div class="stat-top"><div class="icon-box-small">W</div><span>Mingguan</span></div>
          <div class="stat-value">{{ formatPrice(summary.weekly) }}</div>
        </ion-card>
        <ion-card class="summary-card stat-card stat-amber shadow-soft">
          <div class="stat-top"><div class="icon-box-small">M</div><span>Bulanan</span></div>
          <div class="stat-value">{{ formatPrice(summary.monthly) }}</div>
        </ion-card>
        <ion-card class="summary-card stat-card stat-green shadow-soft">
          <div class="stat-top"><div class="icon-box-small">Y</div><span>Tahunan</span></div>
          <div class="stat-value">{{ formatPrice(summary.yearly) }}</div>
        </ion-card>
      </div>

      <div v-if="expenses.length">
        <ion-card v-for="expense in expenses" :key="expense.id" class="mobile-card">
          <ion-card-content>
            <div class="mobile-card-top">
              <span :class="['pill-badge', 'medium']">{{ expense.category || 'Umum' }}</span>
              <span class="metric-value">{{ formatPrice(expense.amount) }}</span>
            </div>
            <ion-card-title class="mobile-card-title">{{ expense.description }}</ion-card-title>
            <ion-card-subtitle class="mobile-card-subtitle">{{ formatDate(expense.date) }}</ion-card-subtitle>

            <div class="mobile-card-footer mt-3">
              <ion-button class="btn-action light icon-btn" fill="solid" @click="$router.push(`/expenses/${expense.id}/edit`)">
                <ion-icon :icon="pencilOutline" />
              </ion-button>
              <ion-button class="btn-action danger icon-btn" fill="solid" @click="onDelete(expense.id)">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else class="empty-state">Belum ada pengeluaran.</div>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { expensesRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonCard, IonCardContent, IonCardTitle, IonCardSubtitle, IonButtons } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';

export default {
  name: 'AccountingExpensesListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonCard, IonCardContent, IonCardTitle, IonCardSubtitle, IonButtons },
  setup() {
    const expenses = ref([])
    const fetchAll = async () => { expenses.value = await expensesRepo.getAll() }
    const onDelete = async (id) => { await expensesRepo.delete(id); await fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price || 0))
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID') : '-'

    const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
    const startOfWeek = (d) => { const x = startOfDay(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x }
    const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
    const startOfYear = (d) => new Date(d.getFullYear(), 0, 1)

    const summary = computed(() => {
      const now = new Date()
      const total = (from) => expenses.value.filter(e => new Date(e.date) >= from).reduce((sum, e) => sum + Number(e.amount || 0), 0)
      return {
        daily: total(startOfDay(now)),
        weekly: total(startOfWeek(now)),
        monthly: total(startOfMonth(now)),
        yearly: total(startOfYear(now)),
      }
    })

    onMounted(fetchAll)
    return { expenses, onDelete, formatPrice, formatDate, addOutline, trashOutline, pencilOutline, summary }
  }
}
</script>
