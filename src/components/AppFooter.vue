<template>
  <footer class="bg-dark text-light py-4">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5>{{ companyInfo.name }}</h5>
          <p>{{ companyInfo.description }}</p>
        </div>
        <div class="col-md-4">
          <h5>Quick Links</h5>
          <ul class="list-unstyled">
            <li v-for="link in quickLinks" :key="link.path">
              <a
                href="#"
                class="text-light"
                @click.prevent="navigate(link.path)"
              >
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>
        <div class="col-md-4">
          <h5>Hubungi Kami</h5>
          <p>
            Email: {{ contact.email }}<br>
            Phone: {{ contact.phone }}<br>
            Alamat: {{ contact.address }}
          </p>
        </div>
      </div>
      <div class="text-center mt-3">
        <p class="mb-0">&copy; {{ currentYear }} {{ companyInfo.name }}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AppFooter',
  setup() {
    const companyInfo = {
      name: 'UMKM Marketplace',
      description: 'Platform marketplace yang mendukung pertumbuhan UMKM di Indonesia dengan menghubungkan pembeli dan penjual lokal.'
    }

    const quickLinks = [
      { name: 'Home', path: '/' },
      { name: 'Produk', path: '/products' },
      { name: 'Tentang Kami', path: '/about' },
      { name: 'Kontak', path: '/contact' }
    ]

    const contact = {
      email: 'info@umkm-marketplace.com',
      phone: '(021) 1234-5678',
      address: 'Jl. UMKM No. 123, Jakarta'
    }

    const currentYear = computed(() => new Date().getFullYear())

    const router = useRouter()
    
    const navigate = (path) => {
      router.push(path)
    }

    return {
      companyInfo,
      quickLinks,
      contact,
      currentYear,
      navigate
    }
  }
}
</script>

<style scoped>
footer {
  margin-top: auto;
}

h5 {
  font-weight: 600;
  margin-bottom: 1.5rem;
}

ul li {
  margin-bottom: 0.5rem;
}

a {
  text-decoration: none;
  transition: opacity 0.3s;
}

a:hover {
  opacity: 0.8;
}

p {
  line-height: 1.6;
}
</style>
