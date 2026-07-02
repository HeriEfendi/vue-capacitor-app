<template>
  <div class="d-flex wrapper">
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100 bg-light flex-grow-1">
      <AppHeader />
      <div class="body flex-grow-1 px-3">
        <CContainer lg>
          <router-view />
        </CContainer>
      </div>
      <AppFooter />
    </div>
    <div
      v-if="$store.state.sidebarVisible"
      class="sidebar-overlay d-lg-none"
      @click="$store.commit('updateSidebarVisible', false)"
    ></div>
  </div>
</template>

<script>
import { CContainer } from '@coreui/vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

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
    const route = useRoute()
    const isSidebarMinimized = computed(() => !store.state.sidebarVisible)

    watch(() => route.path, () => {
      if (window.innerWidth < 768) {
        store.commit('updateSidebarVisible', false)
      }
    })

    return {
      isSidebarMinimized,
    }
  },
}
</script>

