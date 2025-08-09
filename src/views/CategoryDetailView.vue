<template>
  <div>
    <nav-bar />
    <div class="container py-5">
      <h1>Detail Kategori</h1>
      <p>ID Kategori: {{ $route.params.id }}</p>
      <p>Halaman ini sedang dalam pengembangan.</p>
    </div>
    <app-footer />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AppFooter from '../components/AppFooter.vue'

export default {
  name: 'CategoryDetailView',
  components: {
    NavBar,
    AppFooter
  }
}
</script>
