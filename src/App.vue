<template>
  <router-view />
  <PullToRefresh />
</template>

<script>
import PullToRefresh from './components/PullToRefresh.vue'
import { provide } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'App',
  components: { PullToRefresh },
  setup() {
    const store = useStore();
    provide('sidebarVisible', store.state.sidebarVisible);
  },
};
</script>

