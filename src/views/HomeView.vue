<template>
  <div class="container-fluid p-3">
    <h5 class="fw-bold mb-3">MENU</h5>
    <div class="row g-4">
      <div v-for="item in menuItems" :key="item.path" class="col-6 col-sm-4 col-md-3 col-lg-2">
        <router-link :to="item.path" class="text-decoration-none">
          <div class="card p-3 d-flex flex-column align-items-center justify-content-center text-center shadow-sm" style="border-radius: 15px; border: none; height: 130px;">
            <CIcon :icon="item.icon" size="xl" class="mb-2 text-primary" />
            <span class="small fw-bold text-dark">{{ item.name }}</span>
            <span v-if="item.name !== 'Profile'" class="text-muted" style="font-size: 0.75rem;">{{ item.count }} datas</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { CIcon } from '@coreui/icons-vue'
import { cilTask, cilDescription, cilWallet, cilBasket, cilUser } from '@coreui/icons'
import { ProductRepository, capitalCostsRepo, CategoryRepository } from '../db/repositories'

export default {
  name: 'HomeView',
  components: { CIcon },
  setup() {
    const menuItems = ref([
      { name: 'To Do', path: '/todo-personal', icon: cilTask, count: 0 },
      { name: 'To Do Team', path: '/todo', icon: cilTask, count: 0 },
      { name: 'Manajemen Proyek', path: '/catatan_proyek', icon: cilDescription, count: 0 },
      { name: 'Tabungan', path: '/capital', icon: cilWallet, count: 0 },
      { name: 'Produk Jadi', path: '/products', icon: cilBasket, count: 0 },
      { name: 'Profile', path: '/profile', icon: cilUser, count: 0 },
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
