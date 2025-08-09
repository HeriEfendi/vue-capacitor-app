<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">UMKM Marketplace</router-link>
      <button
        class="navbar-toggler"
        type="button"
        @click="isNavOpen = !isNavOpen"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        class="collapse navbar-collapse"
        :class="{ 'show': isNavOpen }"
        id="navbarNav"
      >
        <ul class="navbar-nav ms-auto">
          <li v-for="item in menuItems" :key="item.path" class="nav-item">
            <!-- Gunakan router-link untuk navigasi -->
            <router-link
              class="nav-link"
              :to="item.path"
              @click="isNavOpen = false"
              >{{ item.name }}</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import { ref } from 'vue'
export default {
  name: 'NavBar',
  setup() {
    const isNavOpen = ref(false)

    const menuItems = [
      { name: 'Home', path: '/' },
      { name: 'Produk', path: '/products' },
      { name: 'Kategori', path: '/categories' },
      { name: 'Tentang Kami', path: '/about' },
      { name: 'Kontak', path: '/contact' }
    ]

    return {
      isNavOpen,
      menuItems
    }
  }
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1030;
}

.navbar-brand {
  font-weight: bold;
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem;
}

/* vue-router akan secara otomatis menambahkan class ini ke link yang aktif */
.router-link-exact-active {
  color: var(--bs-primary) !important;
  font-weight: bold;
}
</style>
