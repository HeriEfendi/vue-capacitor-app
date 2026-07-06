<template>
  <ion-header class="mb-2">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button v-if="!isDashboard" @click="goBack" class="rounded-circle" style="--background: white; --color: black;">
          <ion-icon slot="icon-only" :icon="arrowBack" />
        </ion-button>
      </ion-buttons>
      <ion-title class="ion-text-center justify-content-center">
        <router-link to="/" class="rounded-pill d-flex align-items-center justify-content-center" style="height: 46px; width: 65vw; font-weight: 700; font-size: 0.9rem; color: #333; background: rgba(255, 255, 255, 0.8); box-shadow: 0 1px 2px rgba(0,0,0,0.05); text-decoration: none; margin: 0 auto;">
          HDEV MOBILE
        </router-link>
      </ion-title>
      <ion-buttons slot="end">
        <ion-button @click="toggleSidebar" class="rounded-circle" style="--background: white; --color: black;">
          <ion-icon slot="icon-only" :icon="menu" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon, menuController } from '@ionic/vue';
import { menu, arrowBack } from 'ionicons/icons';
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'AppHeader',
  components: {
    IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon
  },
  setup() {
    const route = useRoute();
    const isDashboard = computed(() => route ? route.path === '/dashboard' : false)
    const goBack = () => window.history.back()

    const toggleSidebar = async () => {
      await menuController.toggle();
    }
    
    return { menu, arrowBack, isDashboard, goBack, toggleSidebar }
  },
}
</script>



