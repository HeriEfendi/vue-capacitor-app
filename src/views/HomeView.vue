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
import { TodoRepository } from '../db/localStorage'
import { ProductRepository, capitalCostsRepo, CategoryRepository } from '../db/repositories'

export default {
  name: 'HomeView',
  components: { CIcon },
  setup() {
    const menuItems = ref([
      { name: 'To Do', path: '/todo-personal', icon: cilTask, repo: TodoRepository, count: 0, filter: (d) => d.filter(t => t.type === 'personal' || !t.type).length },
      { name: 'To Do Team', path: '/todo', icon: cilTask, repo: TodoRepository, count: 0, filter: (d) => d.filter(t => t.type === 'team').length },
      { name: 'Manajemen Proyek', path: '/catatan_proyek', icon: cilDescription, repo: CategoryRepository, count: 0 },
      { name: 'Tabungan', path: '/capital', icon: cilWallet, repo: capitalCostsRepo, count: 0 },
      { name: 'Produk Jadi', path: '/products', icon: cilBasket, repo: ProductRepository, count: 0 },
      { name: 'Profile', path: '/profile', icon: cilUser, repo: null, count: 0 },
    ])

    const loadCounts = async () => {
      for (const item of menuItems.value) {
        if (item.repo) {
          try {
            const data = await item.repo.getAll()
            // Special handling: if CategoryRepository.getAll() returns items in an array, count the length
            item.count = item.filter ? item.filter(data) : (data ? data.length : 0)
          } catch (e) {
            item.count = 0
          }
        }
      }
    }

    onMounted(loadCounts)

    return { menuItems }
  }
}
</script>
