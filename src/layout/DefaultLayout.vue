<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="app-main d-flex flex-column min-vh-100 bg-light">
      <AppHeader />
      <div class="flex-grow-1 px-3">
        <CContainer lg>
          <router-view v-slot="{ Component, route }">
            <component :is="Component" />
          </router-view>
        </CContainer>
      </div>
      <AppFooter />
    </div>
  </div>
</template>

<script>
import { CContainer } from '@coreui/vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'DefaultLayout',
  components: {
    AppHeader,
    AppSidebar,
    AppFooter,
    CContainer,
  },
  setup() {
    const store = useStore()
    const isSidebarMinimized = computed(() => !store.state.sidebarVisible)

    return {
      isSidebarMinimized,
    }
  },
}
</script>

