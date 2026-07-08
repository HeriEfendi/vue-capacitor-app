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
import { checkboxOutline, documentTextOutline, walletOutline, basketOutline, personOutline, cashOutline } from 'ionicons/icons';

export default {
  name: 'HomeView',
  components: {
    IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonBadge
  },
  setup() {
    const menuItems = ref([
      { name: 'To Do', path: '/todo-personal', icon: checkboxOutline, count: 0, description: 'Tugas pribadi', accent: '#2563eb' },
      { name: 'To Do Team', path: '/todo', icon: checkboxOutline, count: 0, description: 'Kerja tim', accent: '#7c3aed' },
      { name: 'Manajemen Proyek', path: '/catatan_proyek', icon: documentTextOutline, count: 0, description: 'Proyek & kas', accent: '#059669' },
      { name: 'Pengeluaran', path: '/expenses', icon: cashOutline, count: 0, description: 'Keluar dana', accent: '#d97706' },
      { name: 'Tabungan', path: '/capital', icon: walletOutline, count: 0, description: 'Modal usaha', accent: '#d97706' },
      { name: 'Produk Jadi', path: '/products', icon: basketOutline, count: 0, description: 'Stok produk', accent: '#dc2626' },
      { name: 'Profile', path: '/profile', icon: personOutline, count: 0, description: 'Data profil', accent: '#0891b2' },
    ])

    const fetchCounts = async () => {
      try {
        const { initDB } = await import('@/db')
        const db = await initDB()
        const todos = await db.getAll('todos')
        const teamTodos = await db.getAll('team_todos')
        const projects = await db.getAll('projects')
        const transactions = await db.getAll('transactions')

        menuItems.value[0].count = todos.length
        menuItems.value[1].count = teamTodos.length
        menuItems.value[2].count = projects.length
        menuItems.value[3].count = transactions.length

        const { capitalCostsRepo, ProductRepository } = await import('../db/repositories')
        menuItems.value[4].count = (await capitalCostsRepo.getAll()).length
        menuItems.value[5].count = (await ProductRepository.getAll()).length
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
