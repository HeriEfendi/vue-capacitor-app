<template>
  <router-view />
</template>

<script>
import { provide } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'App',
  setup() {
    const store = useStore();
    provide('sidebarVisible', store.state.sidebarVisible);
  },
};
</script>

