<template>
  <CHeader position="sticky" class="mb-4" :class="[{ 'header-dark': isDark }]" style="left: var(--cui-sidebar-occupy-start, 0);">
    <CContainer fluid class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <CHeaderToggler class="ps-1" @click="$store.commit('toggleSidebar')">
          <CIcon icon="cil-menu" size="lg" />
        </CHeaderToggler>
        <CHeaderBrand class="ms-2 d-none d-lg-block" to="/">
          UMKM App
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
    const isDark = computed(() => window?.localStorage?.getItem('theme') === 'dark')
    const toggleTheme = () => {
      const next = isDark.value ? 'light' : 'dark'
      window.localStorage.setItem('theme', next)
      document.documentElement.setAttribute('data-theme', next)
    }
    onMounted(() => {
      const saved = window.localStorage.getItem('theme') || 'light'
      document.documentElement.setAttribute('data-theme', saved)
    })
    return { cilMenu, isDark, toggleTheme }
  },
}
</script>

