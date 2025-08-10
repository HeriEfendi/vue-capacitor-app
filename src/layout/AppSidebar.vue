<template>
  <CSidebar
    :visible="$store.state.sidebarVisible"
    :color-scheme="isDark ? 'dark' : 'light'"
    class="border-end c-sidebar"
    @visible-change="(value) => $store.commit('updateSidebarVisible', value)"
  >
    <CSidebarBrand>UMKM App</CSidebarBrand>
    <CSidebarNav>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'Dashboard' }">
          <CIcon custom-class-name="nav-icon" :icon="cilSpeedometer" />
          <span>Dashboard</span>
        </CNavLink>
      </CNavItem>
      <CNavTitle>Supply Chain</CNavTitle>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'Products' }">
          <CIcon custom-class-name="nav-icon" :icon="cilBasket" />
          <span>Produk Jadi</span>
        </CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'RawMaterials' }">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Bahan Baku</span>
        </CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'Categories' }">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Kategori</span>
        </CNavLink>
      </CNavItem>
      <CNavTitle>Akuntansi</CNavTitle>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'Expenses' }">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Pengeluaran</span>
        </CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'Incomes' }">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Pendapatan</span>
        </CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'Debts' }">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Utang</span>
        </CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink component="RouterLink" :to="{ name: 'Capital' }">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Modal</span>
        </CNavLink>
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
  CNavLink,
  CNavTitle,
  CSidebarToggler,
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilSpeedometer, cilBasket, cilList } from '@coreui/icons'
import { useStore } from 'vuex'
import { computed, onMounted } from 'vue'

export default {
  name: 'AppSidebar',
  components: {
    CSidebar,
    CSidebarBrand,
    CSidebarNav,
    CNavItem,
    CNavLink,
    CNavTitle,
    CSidebarToggler,
    CIcon,
  },
  setup() {
    const store = useStore()
    const isDark = computed(() => (typeof window !== 'undefined' ? window.localStorage.getItem('theme') === 'dark' : false))

    onMounted(() => {
      const saved = window.localStorage.getItem('theme') || 'light'
      document.documentElement.setAttribute('data-theme', saved)
    })

    return {
      store,
      isDark,
      cilSpeedometer,
      cilBasket,
      cilList
    }
  },
}
</script>

