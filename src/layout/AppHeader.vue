<template>
  <CHeader position="fixed" class="border-0 w-100 bg-transparent pt-0" style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 1050 !important; min-height: 50px;">
    <CContainer fluid class="d-flex align-items-center justify-content-between p-2" style="max-width: 100%;">
      <div class="d-flex align-items-center">
        <CHeaderToggler 
          v-if="!isDashboard" 
          @click="goBack" 
          class="rounded-circle border-0 p-2 d-flex align-items-center justify-content-center"
          style="width: 40px; height: 40px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
        >
          <CIcon icon="cil-arrow-left" size="lg" />
        </CHeaderToggler>
      </div>
      <div class="flex-grow-1 d-flex justify-content-center">
        <router-link to="/" class="rounded-pill d-flex align-items-center justify-content-center px-4" style="height: 40px; width: 90%; font-weight: 700; font-size: 0.9rem; color: #333; background: rgba(255, 255, 255, 0.8); box-shadow: 0 1px 2px rgba(0,0,0,0.05); text-decoration: none;">
          HDEV MOBILE
        </router-link>
      </div>
      <div class="d-flex align-items-center">
        <CHeaderToggler 
          class="rounded-circle border-0 p-2 d-flex align-items-center justify-content-center" 
          @click="toggleSidebar"
          style="width: 40px; height: 40px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
        >
          <CIcon icon="cil-menu" size="lg" />
        </CHeaderToggler>
      </div>
    </CContainer>
  </CHeader>
</template>

<script>
import { CContainer, CHeader, CHeaderToggler } from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilMenu, cilArrowLeft } from '@coreui/icons'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'AppHeader',
  components: {
    CContainer,
    CHeader,
    CHeaderToggler,
    CIcon,
  },
  setup() {
    const store = useStore()
    const isDark = computed(() => store.state.theme === 'dark')
    const route = useRoute()
    const isDashboard = computed(() => route.path === '/dashboard')
    const goBack = () => window.history.back()

    const toggleSidebar = () => {
      store.commit('updateSidebarVisible', !store.state.sidebarVisible)
    }
    
    return { cilMenu, cilArrowLeft, isDashboard, goBack, toggleSidebar }
  },
}
</script>

