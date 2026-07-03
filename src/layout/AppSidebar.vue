<template>
  <CSidebar
    :visible="$store.state.sidebarVisible"
    :unfoldable="false"
    responsive
    :color-scheme="isDark ? 'dark' : 'light'"
    class="border-end c-sidebar"
    @visible-change="(value) => $store.commit('updateSidebarVisible', value)"
  >
    <CSidebarNav>
      <CNavItem>
        <RouterLink to="/dashboard" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilSpeedometer" />
          <span>Dashboard</span>
        </RouterLink>
      </CNavItem>
      <CNavTitle>Supply Chain</CNavTitle>
      <CNavItem>
        <RouterLink to="/products" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilBasket" />
          <span>Produk Jadi</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/raw-materials" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Bahan Baku</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/categories" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Kategori</span>
        </RouterLink>
      </CNavItem>
      <CNavTitle>Akuntansi</CNavTitle>
      <CNavItem>
        <RouterLink to="/expenses" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Pengeluaran</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/incomes" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Pendapatan</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/debts" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Utang</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/capital" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Modal</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/financial-records" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Catatan Keuangan</span>
        </RouterLink>
      </CNavItem>

      <!-- ─── General Setting ──────────────────────────────── -->
      <CNavTitle>General Setting</CNavTitle>
      <CNavItem>
        <RouterLink to="/users" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilPeople" />
          <span>Users</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/todo" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilTask" />
          <span>To Do List</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/profile" class="nav-link d-flex align-items-center gap-2">
          <CIcon custom-class-name="nav-icon" :icon="cilUser" />
          <span>Profile</span>
        </RouterLink>
      </CNavItem>

      <!-- Add other nav items here based on README -->
    </CSidebarNav>
    <CSidebarToggler class="d-none d-lg-flex" @click="$store.commit('toggleSidebar')" />
  </CSidebar>
</template>

<script>
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavTitle,
  CSidebarToggler,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilSpeedometer, cilBasket, cilList, cilPeople, cilTask, cilUser } from '@coreui/icons'
import { useStore } from 'vuex'
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

export default {
  name: 'AppSidebar',
  components: {
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CNavItem,
    CNavTitle,
    CSidebarToggler,
    CIcon,
    RouterLink,
  },
  setup() {
    const store = useStore()
    const isDark = computed(() => store.state.theme === 'dark')

    return {
      isDark,
      cilSpeedometer,
      cilBasket,
      cilList,
      cilPeople,
      cilTask,
      cilUser,
    }
  },
}
</script>

