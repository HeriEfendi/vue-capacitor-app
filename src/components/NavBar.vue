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
  background-color: #ffffff; /* White background */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Softer shadow */
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1030;
}

.navbar-brand {
  font-weight: 700; /* Bolder brand name */
  font-size: 1.5rem;
  color: var(--bs-dark);
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem;
  color: #555; /* Slightly muted color for nav links */
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover,
.router-link-exact-active {
  color: var(--bs-primary) !important;
}

/* Optional: Add a subtle underline effect on hover/active */
.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bs-primary);
  transition: width 0.3s ease-in-out;
}

.nav-link:hover::after,
.router-link-exact-active::after {
  width: 100%;
}
</style>

