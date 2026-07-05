<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button v-if="!isDashboard" @click="goBack" class="rounded-circle" style="--background: white; --color: black;">
          <ion-icon slot="icon-only" :icon="arrowBack" />
        </ion-button>
      </ion-buttons>
      <ion-title class="ion-text-center">HDEV MOBILE</ion-title>
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

