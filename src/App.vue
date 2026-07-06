<template>
  <ion-app>
    <AppSidebar />
    <ion-router-outlet id="main-content" />

  </ion-app>
</template>

<script>

import AppSidebar from './layout/AppSidebar.vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { provide } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'App',
  components: { AppSidebar, IonApp, IonRouterOutlet },
  setup() {
    const store = useStore();
    provide('sidebarVisible', store.state.sidebarVisible);
  },
};
</script>

