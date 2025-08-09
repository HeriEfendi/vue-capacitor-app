<template>
  <div>
    <nav-bar />
    <div class="container py-5">
      <h1>Detail Produk</h1>
      <p>ID Produk: {{ $route.params.id }}</p>
      <p>Halaman ini sedang dalam pengembangan.</p>
    </div>
    <app-footer />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AppFooter from '../components/AppFooter.vue'

export default {
  name: 'ProductDetailView',
  components: {
    NavBar,
    AppFooter
  }
}
</script>
