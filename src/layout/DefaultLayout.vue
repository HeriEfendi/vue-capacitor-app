<template>
  <div class="d-flex wrapper" >
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100 flex-grow-1" style="background: #ecf3fd !important;">
      <AppHeader />
      <div class="body flex-grow-1 px-3" router-view>
        <CContainer lg>
          <router-view />
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

