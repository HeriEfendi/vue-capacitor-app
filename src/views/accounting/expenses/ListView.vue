<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <ion-title class="app-hero-title" style="padding: 0;">Pengeluaran</ion-title>
            <ion-buttons slot="end">
              <ion-button class="btn-action primary" @click="createExpense">
                <ion-icon slot="start" :icon="addOutline" /> Tambah
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle" style="margin: 0;">Kelola data pengeluaran dan kas pribadi.</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div class="p-3">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="dashboard">
            <ion-label>Dashboard</ion-label>
          </ion-segment-button>
          <ion-segment-button value="riwayat">
            <ion-label>Riwayat</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- DASHBOARD TAB -->
      <div v-if="activeTab === 'dashboard'" class="ion-padding">
        <div class="project-actions d-grid gap-1 mx-2 mb-2">
          <div class="mb-2">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Hari Ini</small>
              <div class="fs-4 fw-black text-teal mt-1">{{ formatPrice(summary.daily) }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Minggu Ini</small>
              <div class="fs-4 fw-black text-indigo mt-1">{{ formatPrice(summary.weekly) }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Bulan Ini</small>
              <div class="fs-4 fw-black text-amber mt-1">{{ formatPrice(summary.monthly) }}</div>
            </div>
          </div>
          <div class="mb-2">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Tahun Ini</small>
              <div class="fs-4 fw-black text-danger mt-1">{{ formatPrice(summary.yearly) }}</div>
            </div>
          </div>
        </div>

        <!-- Daily Chart -->
        <div class="mobile-card container-padded mb-3">
          <h6 class="fw-bold text-dark mb-3">Grafik Harian</h6>
          <div v-if="dailyChartSeries[0].data.length > 0">
            <VueApexCharts type="bar" height="240" :options="dailyChartOptions" :series="dailyChartSeries" />
          </div>
          <div v-else class="text-center py-4 text-muted">Belum ada data harian.</div>
        </div>

        <!-- Weekly Chart -->
        <div class="mobile-card container-padded mb-3">
          <h6 class="fw-bold text-dark mb-3">Grafik Mingguan</h6>
          <div v-if="weeklyChartSeries[0].data.length > 0">
            <VueApexCharts type="area" height="240" :options="weeklyChartOptions" :series="weeklyChartSeries" />
          </div>
          <div v-else class="text-center py-4 text-muted">Belum ada data mingguan.</div>
        </div>

        <!-- Monthly Chart -->
        <div class="mobile-card container-padded mb-3">
          <h6 class="fw-bold text-dark mb-3">Grafik Bulanan</h6>
          <div v-if="monthlyChartSeries[0].data.length > 0">
            <VueApexCharts type="area" height="240" :options="monthlyChartOptions" :series="monthlyChartSeries" />
          </div>
          <div v-else class="text-center py-4 text-muted">Belum ada data bulanan.</div>
        </div>
      </div>

      <!-- RIWAYAT TAB -->
      <div v-if="activeTab === 'riwayat'" class="ion-padding mx-1">
        <div v-if="expenses.length">
          <div v-for="expense in sortedExpenses" :key="expense.id" class="mobile-card p-3 mb-3 border-start border-4 border-primary">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-primary">{{ expense.category || 'Umum' }}</span>
                    <div class="flex-grow-1 text-center fw-bold"><small class="text-muted">{{ formatDate(expense.date) }}</small></div>
                </div>
                <span class="text-dark mb-1">{{ expense.description }}</span>
              </div>
              <div class="d-flex gap-1 ms-2">
                <button class="btn btn-light btn-md text-primary" @click="$router.push(`/expenses/${expense.id}/edit`)" title="Edit">
                  <ion-icon :icon="createOutline" />
                </button>
                <button class="btn btn-light btn-md text-danger" @click="onDelete(expense.id)" title="Hapus">
                  <ion-icon :icon="trashOutline" />
                </button>
              </div>
            </div>

            <div class="d-flex justify-content-between text-dark border-top pt-2 mt-2">
              <span>Jumlah:</span>
              <span class="text-primary fw-bold">{{ formatPrice(expense.amount) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5 text-muted">Belum ada pengeluaran.</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, computed, defineAsyncComponent } from 'vue'
import { onIonViewWillEnter, IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonCard, IonCardContent, IonCardTitle, IonCardSubtitle, IonButtons, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import { expensesRepo } from '../../../db/repositories'
import { useRouter } from 'vue-router'

const VueApexCharts = defineAsyncComponent(() => import("vue3-apexcharts"));

export default {
  name: 'AccountingExpensesListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonCard, IonCardContent, IonCardTitle, IonCardSubtitle, IonButtons, IonSegment, IonSegmentButton, IonLabel, VueApexCharts },
  setup() {
    const router = useRouter()
    const activeTab = ref('dashboard')
    const expenses = ref([])
    const fetchAll = async () => { expenses.value = await expensesRepo.getAll() }
    const onDelete = async (id) => { await expensesRepo.delete(id); await fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price || 0))
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'

    const summary = computed(() => {
      const total = (from) => expenses.value.filter(e => new Date(e.date) >= from).reduce((sum, e) => sum + Number(e.amount || 0), 0)
      const today = new Date(); today.setHours(0, 0, 0, 0);
      // ISO week: Senin = awal minggu. Minggu (getDay=0) dihitung sebagai hari ke-7.
      const dayOfWeek = today.getDay() || 7; // 1=Sen .. 7=Min
      const mondayOfWeek = new Date(today); mondayOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
      return {
        daily: total(new Date(today)),
        weekly: total(new Date(mondayOfWeek)),
        monthly: total(new Date(today.getFullYear(), today.getMonth(), 1)),
        yearly: total(new Date(today.getFullYear(), 0, 1)),
      }
    })
    
    const avgDaily = computed(() => {
        const daysInMonth = new Date().getDate();
        return summary.value.monthly / daysInMonth;
    })

    const dailyChartSeries = computed(() => {
      const data = [];
      const today = new Date(); today.setHours(0, 0, 0, 0);
      // ISO week: Senin = hari ke-1. Minggu (getDay=0) = hari ke-7.
      const dayOfWeek = today.getDay() || 7;
      const monday = new Date(today); monday.setDate(today.getDate() - (dayOfWeek - 1));
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday); d.setDate(monday.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const val = expenses.value.filter(e => e.date && e.date.startsWith(dateStr)).reduce((s, e) => s + Number(e.amount), 0);
        data.push(val);
      }
      return [{ name: 'Pengeluaran', data }];
    });

    const dailyChartOptions = {
      chart: { toolbar: { show: false }, type: 'bar', zoom: { enabled: false } },
      colors: ['#0d9488'],
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: '50%', dataLabels: { position: 'top' } }
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val > 0 ? new Intl.NumberFormat('id-ID').format(val) : '',
        offsetY: -20,
      },
      xaxis: { categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] },
      yaxis: { labels: { formatter: (val) => new Intl.NumberFormat('id-ID').format(val) } },
      tooltip: { y: { formatter: (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val) } }
    };

    const weeklyChartOptions = {
        chart: { toolbar: { show: false }, type: 'area', zoom: { enabled: false } },
        colors: ['#4f46e5'],
        xaxis: { categories: ['M-4', 'M-3', 'M-2', 'M-1', 'Minggu Ini'] },
        yaxis: { labels: { formatter: (val) => new Intl.NumberFormat('id-ID').format(val) } },
        tooltip: { y: { formatter: (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val) } },
        dataLabels: {
          enabled: true,
          formatter: (val) => val > 0 ? new Intl.NumberFormat('id-ID').format(val) : ''
        }
    };
    
    const monthlyChartOptions = {
        chart: { toolbar: { show: false }, type: 'area', zoom: { enabled: false } },
        colors: ['#ea580c'],
        xaxis: { categories: ['B-5', 'B-4', 'B-3', 'B-2', 'B-1', 'Bulan Ini'] },
        yaxis: { labels: { formatter: (val) => new Intl.NumberFormat('id-ID').format(val) } },
        tooltip: { y: { formatter: (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val) } },
        dataLabels: {
          enabled: true,
          formatter: (val) => val > 0 ? new Intl.NumberFormat('id-ID').format(val) : ''
        }
    };

    const weeklyChartSeries = computed(() => {
        const data = [];
        const today = new Date(); today.setHours(0, 0, 0, 0);
        // ISO week: Senin = awal minggu, Minggu (getDay=0) = hari ke-7
        const dayOfWeek = today.getDay() || 7; // 1=Sen .. 7=Min
        const daysFromMonday = dayOfWeek - 1;
        for (let i = 4; i >= 0; i--) {
            const start = new Date(today); start.setDate(today.getDate() - daysFromMonday - (i * 7));
            start.setHours(0, 0, 0, 0);
            const end = new Date(start); end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            const val = expenses.value.filter(e => {
                const ed = new Date(e.date);
                return ed >= start && ed <= end;
            }).reduce((s, e) => s + Number(e.amount), 0);
            data.push(val);
        }
        return [{ name: 'Mingguan', data }];
    });

    const monthlyChartSeries = computed(() => {
        const data = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = expenses.value.filter(e => {
                const ed = new Date(e.date);
                return ed.getFullYear() === m.getFullYear() && ed.getMonth() === m.getMonth();
            }).reduce((s, e) => s + Number(e.amount), 0);
            data.push(val);
        }
        return [{ name: 'Bulanan', data }];
    });

    const createExpense = () => router.push('/expenses/create')
    const sortedExpenses = computed(() => [...expenses.value].sort((a, b) => b.id - a.id))
    
    onIonViewWillEnter(fetchAll)
    return { activeTab, expenses, sortedExpenses, onDelete, formatPrice, formatDate, addOutline, trashOutline, createOutline, summary, createExpense, dailyChartSeries, dailyChartOptions, weeklyChartSeries, weeklyChartOptions, monthlyChartSeries, monthlyChartOptions, avgDaily }
  }
}
</script>
