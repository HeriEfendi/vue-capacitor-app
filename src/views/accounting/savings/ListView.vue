<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero">
          <div class="d-flex align-items-center justify-content-between">
            <ion-title class="app-hero-title">Tabungan</ion-title>
            <ion-buttons slot="end">
              <ion-button class="btn-action primary" @click="$router.push('/savings/create')">
                <ion-icon slot="start" :icon="addOutline" /> Tambah
              </ion-button>
            </ion-buttons>
          </div>
          <p class="app-hero-subtitle">Pantau progres tabungan, aset, dan modal usaha Anda.</p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div class="p-3">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="dashboard"><ion-label>Dashboard</ion-label></ion-segment-button>
          <ion-segment-button value="riwayat"><ion-label>Riwayat</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      <div v-if="activeTab === 'dashboard'" class="ion-padding">
        <div class="project-actions d-grid gap-1 mx-2 mb-3">
            <div class="mobile-card p-3"><small class="text-muted d-block">Bulan Ini</small><div class="fs-6 fw-black text-amber mt-1">{{ formatPrice(summary.monthly) }}</div></div>
            <div class="mobile-card p-3"><small class="text-muted d-block">Tahun Ini</small><div class="fs-6 fw-black text-danger mt-1">{{ formatPrice(summary.yearly) }}</div></div>
        </div>
        <div class="mobile-card container-padded mb-3">
          <h6 class="fw-bold text-dark mb-3">Grafik Bulanan</h6>
          <VueApexCharts v-if="monthlyChartSeries[0].data.length > 0" type="area" height="240" :options="monthlyChartOptions" :series="monthlyChartSeries" />
          <div v-else class="text-center py-4 text-muted">Belum ada data.</div>
        </div>
      </div>

      <div v-if="activeTab === 'riwayat'" class="ion-padding mx-1">
        <div v-for="row in items" :key="row.id" class="mobile-card p-3 mb-3 border-start border-4 border-primary">
          <div class="d-flex justify-content-between">
            <div>
                <div class="fw-bold text-dark">{{ row.source }}</div>
                <span class="badge bg-secondary mb-1 small">{{ row.category || 'Lainnya' }}</span>
                <small class="text-muted d-block">{{ formatDate(row.date) }}</small>
            </div>
            <div class="text-primary fw-bold">{{ formatPrice(row.amount) }}</div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-2">
            <button class="btn btn-light btn-sm" @click="$router.push(`/savings/${row.id}/edit`)"><ion-icon :icon="pencilOutline" /></button>
            <button class="btn btn-light btn-sm text-danger" @click="onDelete(row.id)"><ion-icon :icon="trashOutline" /></button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { onMounted, ref, computed, defineAsyncComponent } from 'vue'
import { savingsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons';
import { onIonViewWillEnter } from '@ionic/vue'
import { useRouter } from 'vue-router'

const VueApexCharts = defineAsyncComponent(() => import("vue3-apexcharts"));

export default {
  name: 'AccountingSavingsListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonSegment, IonSegmentButton, IonLabel, VueApexCharts },
  setup() {
    const router = useRouter()
    const activeTab = ref('dashboard')
    const items = ref([])
    const fetchAll = async () => { items.value = await savingsRepo.getAll() }
    const onDelete = async (id) => { await savingsRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price || 0))
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
    
    const summary = computed(() => {
      const now = new Date();
      const total = (from) => items.value.filter(e => new Date(e.date) >= from).reduce((sum, e) => sum + Number(e.amount || 0), 0)
      return {
        monthly: total(new Date(now.getFullYear(), now.getMonth(), 1)),
        yearly: total(new Date(now.getFullYear(), 0, 1)),
      }
    })

    const monthlyChartSeries = computed(() => {
        const data = []; const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = items.value.filter(e => {
                const ed = new Date(e.date);
                return ed.getFullYear() === m.getFullYear() && ed.getMonth() === m.getMonth();
            }).reduce((s, e) => s + Number(e.amount), 0);
            data.push(val);
        }
        return [{ name: 'Tabungan Bulanan', data }];
    });

    const monthlyChartOptions = {
        chart: { toolbar: { show: false }, type: 'area', zoom: { enabled: false } },
        colors: ['#0d9488'],
        xaxis: { categories: Array.from({length: 6}, (_, i) => {
            const m = new Date(); m.setMonth(m.getMonth() - (5 - i));
            return m.toLocaleDateString('id-ID', { month: 'short' });
        }) },
        yaxis: { labels: { formatter: (val) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val) } }
    };

    onIonViewWillEnter(fetchAll)
    return { activeTab, items, onDelete, formatPrice, formatDate, addOutline, trashOutline, pencilOutline, summary, monthlyChartSeries, monthlyChartOptions }
  }
}
</script>
