<template>
  <div>
    <nav-bar />
    <div class="container py-5">
      <h1>Tentang Kami</h1>
      <p>Halaman ini sedang dalam pengembangan</p>
    </div>
    <app-footer />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AppFooter from '../components/AppFooter.vue'

export default {
  name: 'AboutView',
  components: {
    NavBar,
    AppFooter
  }
}
</script>
