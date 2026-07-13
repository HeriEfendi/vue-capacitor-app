<template>
  <ion-app>
    <AppSidebar />
    <ion-router-outlet id="main-content" />

  </ion-app>
</template>

<script>

import AppSidebar from './layout/AppSidebar.vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { provide, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { App } from '@capacitor/app';

export default {
  name: 'App',
  components: { AppSidebar, IonApp, IonRouterOutlet },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    provide('sidebarVisible', store.state.sidebarVisible);

    let lastBackPress = 0;
    onMounted(() => {
      App.addListener('backButton', () => {
        if (route.name === 'Dashboard') {
          const now = Date.now();
          if (now - lastBackPress < 2000) {
            App.exitApp();
          } else {
            lastBackPress = now;
          }
        } else {
          router.back();
        }
      });
    });
  },
};
</script>

