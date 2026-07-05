<template>
  <ion-page>
    <AppSidebar />
    <ion-header>
      <AppHeader />
    </ion-header>
    <ion-content id="main-content">
      <div class="ion-padding">
        <ion-router-outlet />
      </div>
      <AppFooter />
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonRouterOutlet } from '@ionic/vue';
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
    IonPage,
    IonContent,
    IonRouterOutlet
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

