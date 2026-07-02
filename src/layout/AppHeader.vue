<template>
  <CHeader position="sticky" class="mb-4" :class="[{ 'header-dark': isDark }]">
    <CContainer fluid class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <CHeaderToggler class="ps-1" @click="toggleSidebar">
          <CIcon icon="cil-menu" size="lg" />
        </CHeaderToggler>
        <CHeaderBrand class="ms-2" to="/">
          H DEV
        </CHeaderBrand>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="small text-secondary d-none d-md-inline">{{ isDark ? 'Dark' : 'Light' }} Mode</span>
        <CFormSwitch color="dark" :checked="isDark" @change="toggleTheme" />
      </div>
    </CContainer>
  </CHeader>
</template>

<script>
import { CContainer, CHeader, CHeaderBrand, CHeaderToggler, CFormSwitch } from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { cilMenu } from '@coreui/icons'
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'AppHeader',
  components: {
    CContainer,
    CHeader,
    CHeaderBrand,
    CHeaderToggler,
    CFormSwitch,
    CIcon,
  },
  setup() {
    const store = useStore()
    const isDark = computed(() => window?.localStorage?.getItem('theme') === 'dark')
    const toggleSidebar = () => {
      store.commit('toggleSidebar')
    }
    const toggleTheme = () => {
      const next = isDark.value ? 'light' : 'dark'
      window.localStorage.setItem('theme', next)
      document.documentElement.setAttribute('data-theme', next)
    }
    onMounted(() => {
      const saved = window.localStorage.getItem('theme') || 'light'
      document.documentElement.setAttribute('data-theme', saved)

    })
    return { cilMenu, isDark, toggleTheme, toggleSidebar }
  },
}
</script>

