<template>
  <ion-page>
    <ion-content class="home-page">
      <section class="home-hero">
        <div>
          <p class="hero-eyebrow">Dashboard</p>
          <h1>Halo, mau kelola apa hari ini?</h1>
          <p class="hero-subtitle">Akses cepat semua modul kerja dan catatan bisnis dalam satu tempat.</p>
        </div>
      </section>

      <ion-grid class="menu-grid">
        <ion-row>
          <ion-col size="6" size-sm="4" size-md="3" size-lg="2" v-for="item in menuItems" :key="item.path">
            <router-link :to="item.path" class="menu-link">
              <ion-card class="menu-card" :style="{ '--accent': item.accent }">
                <ion-card-content class="menu-card-content">
                  <div class="menu-icon-wrap">
                    <ion-icon :icon="item.icon" />
                  </div>
                  <div class="menu-text">
                    <span class="menu-title">{{ item.name }}</span>
                    <span class="menu-desc">{{ item.description }}</span>
                  </div>
                  <ion-badge v-if="item.name !== 'Profile'" class="menu-count">{{ item.count }}</ion-badge>
                </ion-card-content>
              </ion-card>
            </router-link>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonBadge } from '@ionic/vue';
import { checkboxOutline, documentTextOutline, walletOutline, basketOutline, personOutline, cashOutline, timeOutline, cartOutline, layersOutline, informationCircleOutline } from 'ionicons/icons';

export default {
  name: 'HomeView',
  components: {
    IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonBadge
  },
  setup() {
    const menuItems = ref([
      { name: 'To Do', path: '/todo-personal', icon: checkboxOutline, count: 0, description: 'Tugas pribadi', accent: '#3b82f6' },
      { name: 'To Do Team', path: '/todo', icon: checkboxOutline, count: 0, description: 'Kerja tim', accent: '#8b5cf6' },
      { name: 'Buku Kas', path: '/buku_kas', icon: documentTextOutline, count: 0, description: 'Bisnis, hobi & renovasi', accent: '#10b981' },
      { name: 'Ceklok', path: '/ceklok', icon: timeOutline, count: 0, description: 'Presensi kerja', accent: '#06b6d4' },
      { name: 'Pengeluaran', path: '/expenses', icon: cashOutline, count: 0, description: 'Keluar dana', accent: '#f59e0b' },
      { name: 'Kasir (POS)', path: '/cashier', icon: cartOutline, count: 0, description: 'Penjualan & Kasir', accent: '#059669' },
      { name: 'Tabungan', path: '/capital', icon: walletOutline, count: 0, description: 'Modal usaha', accent: '#d97706' },
      { name: 'Produk', path: '/products', icon: basketOutline, count: 0, description: 'Stok produk', accent: '#ef4444' },
      { name: 'Manajemen Stok', path: '/stock', icon: layersOutline, count: 0, description: 'Monitor & atur stok', accent: '#a855f7' },
      { name: 'Tentang Aplikasi', path: '/about', icon: informationCircleOutline, description: 'Tentang & Developer', accent: '#0ea5e9' },
    ])

    const fetchCounts = async () => {
      try {
        const { initDB } = await import('@/db')
        const db = await initDB()
        const todos = await db.getAll('todos')
        const teamTodos = await db.getAll('team_todos')
        const projects = await db.getAll('projects')
        const ceklokLogs = await db.getAll('ceklok_logs').catch(() => [])

        const updateCount = (path, count) => {
          const item = menuItems.value.find(m => m.path === path);
          if (item) item.count = count;
        };

        updateCount('/todo-personal', todos.length);
        updateCount('/todo', teamTodos.length);
        updateCount('/buku_kas', projects.length);
        updateCount('/ceklok', ceklokLogs.length);

        const { capitalCostsRepo, ProductRepository, salesRepo, expensesRepo } = await import('../db/repositories')
        updateCount('/expenses', (await expensesRepo.getAll()).length);
        
        const allProducts = await ProductRepository.getAll()
        const lowStockItems = allProducts.filter(p => p.stock <= 5)

        updateCount('/cashier', (await salesRepo.getAll()).length);
        updateCount('/capital', (await capitalCostsRepo.getAll()).length);
        updateCount('/products', allProducts.length);
        updateCount('/stock', lowStockItems.length);
      } catch (e) {
        console.error('Gagal memuat count:', e)
      }
    }

    onIonViewWillEnter(fetchCounts)
    onMounted(fetchCounts)

    return { menuItems }
  }
}
</script>
