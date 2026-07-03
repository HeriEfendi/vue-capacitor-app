<template>
  <CSidebar
    :visible="$store.state.sidebarVisible"
    :unfoldable="false"
    responsive
    placement="end"
    :color-scheme="isDark ? 'dark' : 'light'"
    class="border-end c-sidebar"
    style="width: 100% !important; max-width: 100% !important;"
    @visible-change="(value) => $store.commit('updateSidebarVisible', value)"
  >
  <div style="height: 70px;"></div>
    <CSidebarNav>
      <CNavItem>
        <RouterLink to="/dashboard" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilSpeedometer" />
          <span>Dashboard</span>
        </RouterLink>
      </CNavItem>
      <CNavTitle>Pesonal</CNavTitle>
      <CNavItem>
        <RouterLink to="/todo-personal" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilTask" />
          <span>To Do</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/todo" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilTask" />
          <span>To Do Team</span>
        </RouterLink>
      </CNavItem>
      <CNavTitle>Akuntansi</CNavTitle>
      <CNavItem>
        <RouterLink to="/catatan_proyek" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilDescription" />
          <span>Catatan Proyek</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/capital" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilWallet" />
          <span>Tabungan</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/expenses" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilArrowBottom" />
          <span>Pengeluaran</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/incomes" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilArrowTop" />
          <span>Pendapatan</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/debts" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilCreditCard" />
          <span>Utang</span>
        </RouterLink>
      </CNavItem>
      <CNavTitle>Supply Chain</CNavTitle>
      <CNavItem>
        <RouterLink to="/products" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilBasket" />
          <span>Produk Jadi</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/raw-materials" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Bahan Baku</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/categories" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilList" />
          <span>Kategori</span>
        </RouterLink>
      </CNavItem>

      <!-- ─── General Setting ──────────────────────────────── -->
      <CNavTitle>General Setting</CNavTitle>
      <CNavItem>
        <RouterLink to="/users" class="nav-link d-flex align-items-center gap-2" active-class="active">
          <CIcon custom-class-name="nav-icon" :icon="cilPeople" />
          <span>Users</span>
        </RouterLink>
      </CNavItem>
      <CNavItem>
        <RouterLink to="/profile" class="nav-link d-flex align-items-center gap-2" active-class="active">
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
import { cilSpeedometer, cilBasket, cilList, cilPeople, cilTask, cilUser, cilDescription, cilWallet, cilArrowBottom, cilArrowTop, cilCreditCard } from '@coreui/icons'
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
      cilSpeedometer, cilBasket, cilList, cilPeople, cilTask, cilUser, cilDescription, cilWallet, cilArrowBottom, cilArrowTop, cilCreditCard
    }
  },
}
</script>

