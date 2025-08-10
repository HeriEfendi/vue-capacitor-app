<template>
  <footer class="app-footer">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4 mb-lg-0">
          <h5>{{ companyInfo.name }}</h5>
          <p class="text-muted">{{ companyInfo.description }}</p>
        </div>
        <div class="col-lg-2 col-md-6 mb-4 mb-lg-0">
          <h5>Quick Links</h5>
          <ul class="list-unstyled">
            <li v-for="link in quickLinks" :key="link.path">
              <a href="#" @click.prevent="navigate(link.path)">
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>
        <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
          <h5>Hubungi Kami</h5>
          <ul class="list-unstyled">
            <li>Email: {{ contact.email }}</li>
            <li>Phone: {{ contact.phone }}</li>
            <li>Alamat: {{ contact.address }}</li>
          </ul>
        </div>
        <div class="col-lg-3">
          <h5>Ikuti Kami</h5>
          <div class="social-icons">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom text-center">
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
.app-footer {
  background-color: var(--bs-dark);
  color: #adb5bd; /* Lighter grey for better readability on dark background */
  padding: 60px 0 20px 0;
  margin-top: auto; /* Pushes footer to the bottom */
}

h5 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

ul {
  padding-left: 0;
}

ul li {
  margin-bottom: 0.75rem;
}

a {
  color: #adb5bd;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #ffffff;
}

.social-icons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #495057;
  color: #ffffff;
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

.social-icons a:hover {
  background-color: var(--bs-primary);
}

.footer-bottom {
  border-top: 1px solid #495057;
  padding-top: 20px;
  margin-top: 40px;
}
</style>

