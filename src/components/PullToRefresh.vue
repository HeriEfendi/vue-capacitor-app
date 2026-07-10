<template>
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>
  <slot />
</template>

<script setup>
import { IonRefresher, IonRefresherContent } from '@ionic/vue';

const handleRefresh = (event) => {
  window.location.reload();
  event.target.complete();
};
</script>
