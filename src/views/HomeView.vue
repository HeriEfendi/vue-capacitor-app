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

    onMounted(fetchCounts)

    return { menuItems }
  }
}
</script>

<style scoped>
.home-page {
  --background: linear-gradient(180deg, #eef6ff 0%, #f8fbff 42%, #ffffff 100%);
}
.home-hero {
  margin: 18px 16px 10px;
  padding: 22px 20px;
  border-radius: 28px;
  color: white;
  background:
    radial-gradient(circle at top right, rgba(255,255,255,0.34), transparent 34%),
    linear-gradient(135deg, #0f766e 0%, #2563eb 54%, #7c3aed 100%);
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.22);
}
.hero-eyebrow {
  margin: 0 0 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.82;
}
.home-hero h1 {
  margin: 0;
  font-size: clamp(1.45rem, 6vw, 2.35rem);
  line-height: 1.08;
  font-weight: 900;
}
.hero-subtitle {
  margin: 10px 0 0;
  max-width: 560px;
  font-size: 0.92rem;
  line-height: 1.45;
  opacity: 0.86;
}
.menu-grid {
  --ion-grid-column-padding: 8px;
  padding: 0 8px 22px;
}
.menu-link {
  display: block;
  height: 100%;
  text-decoration: none;
}
.menu-card {
  height: 154px;
  margin: 0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.menu-card:active {
  transform: scale(0.98);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}
.menu-card-content {
  position: relative;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.menu-card-content::after {
  content: '';
  position: absolute;
  right: -22px;
  bottom: -28px;
  width: 88px;
  height: 88px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}
.menu-icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, white);
}
.menu-icon-wrap ion-icon {
  font-size: 1.55rem;
}
.menu-text {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 3px;
}
.menu-title {
  color: #111827;
  font-weight: 900;
  font-size: 0.95rem;
  line-height: 1.15;
}
.menu-desc {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.2;
}
.menu-count {
  position: absolute;
  top: 14px;
  right: 14px;
  --background: var(--accent);
  --color: white;
  min-width: 24px;
  font-weight: 800;
}
@media (min-width: 768px) {
  .home-hero {
    margin: 24px 24px 14px;
    padding: 30px;
  }
  .menu-grid {
    padding-inline: 16px;
  }
  .menu-card {
    height: 168px;
  }
}
</style>
