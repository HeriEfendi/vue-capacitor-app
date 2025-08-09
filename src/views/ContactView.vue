<template>
  <div>
    <nav-bar />
    <div class="container py-5">
      <h1>Kontak</h1>
      <p>Halaman ini sedang dalam pengembangan</p>
    </div>
    <app-footer />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AppFooter from '../components/AppFooter.vue'

export default {
  name: 'ContactView',
  components: {
    NavBar,
    AppFooter
  }
}
</script>
