<template>
  <ion-page>
    <ion-content class="ion-padding">
      <h5 class="fw-bold mb-3 ion-padding-start">MENU</h5>
      <ion-grid>
        <ion-row>
          <ion-col size="6" size-sm="4" size-md="3" size-lg="2" v-for="item in menuItems" :key="item.path">
            <router-link :to="item.path" class="text-decoration-none">
              <ion-card class="ion-text-center shadow-sm" style="border-radius: 15px; height: 130px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <ion-card-content class="d-flex flex-column align-items-center">
                  <ion-icon :icon="item.icon" size="large" class="mb-2" color="primary" />
                  <span class="small fw-bold text-dark">{{ item.name }}</span>
                  <span v-if="item.name !== 'Profile'" class="text-muted" style="font-size: 0.75rem;">{{ item.count }} datas</span>
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
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon } from '@ionic/vue';
import { checkboxOutline, documentTextOutline, walletOutline, basketOutline, personOutline } from 'ionicons/icons';
import { cilTask, cilDescription, cilWallet, cilBasket, cilUser } from '@coreui/icons'

export default {
  name: 'HomeView',
  components: { 
    IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon 
  },
  setup() {
    const menuItems = ref([
      { name: 'To Do', path: '/todo-personal', icon: checkboxOutline, count: 0 },
      { name: 'To Do Team', path: '/todo', icon: checkboxOutline, count: 0 },
      { name: 'Manajemen Proyek', path: '/catatan_proyek', icon: documentTextOutline, count: 0 },
      { name: 'Tabungan', path: '/capital', icon: walletOutline, count: 0 },
      { name: 'Produk Jadi', path: '/products', icon: basketOutline, count: 0 },
      { name: 'Profile', path: '/profile', icon: personOutline, count: 0 },
    ])

    const fetchCounts = async () => {
      try {
        const { initDB } = await import('@/db')
        const db = await initDB()
        const todos = await db.getAll('todos')
        const teamTodos = await db.getAll('team_todos')
        const projects = await db.getAll('projects')
        
        menuItems.value[0].count = todos.length
        menuItems.value[1].count = teamTodos.length
        menuItems.value[2].count = projects.length
        
        // Use Dexie repositories for other stores
        const { capitalCostsRepo, ProductRepository } = await import('../db/repositories')
        menuItems.value[3].count = (await capitalCostsRepo.getAll()).length
        menuItems.value[4].count = (await ProductRepository.getAll()).length
      } catch (e) {
        console.error('Gagal memuat count:', e)
      }
    }

    onMounted(fetchCounts)



    return { menuItems }
  }
}
</script>
