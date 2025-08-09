<template>
  <section class="hero-section">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <h1 class="display-4">{{ title }}</h1>
          <p class="lead">{{ description }}</p>
          <a href="#" class="btn btn-primary btn-lg" @click.prevent="onShopNow">
            {{ buttonText }}
          </a>
        </div>
        <div class="col-lg-6">
          <img
            :src="heroImage"
            class="img-fluid rounded"
            :alt="imageAlt"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'HeroSection',
  setup() {
    const router = useRouter()
    const title = 'Selamat Datang di UMKM Marketplace'
    const description = 'Temukan produk-produk berkualitas dari UMKM lokal Indonesia'
    const buttonText = 'Mulai Belanja'
    const heroImage = 'https://placehold.co/600x400'
    const imageAlt = 'Hero Image'
    
    const onShopNow = () => {
      router.push('/products')
    }

    return {
      title,
      description,
      buttonText,
      heroImage,
      imageAlt,
      onShopNow
    }
  }
}
</script>

<style scoped>
.hero-section {
  background-color: #f8f9fa;
  padding: 80px 0;
}

.display-4 {
  font-weight: bold;
  margin-bottom: 1rem;
}

.lead {
  margin-bottom: 2rem;
}

.btn-lg {
  padding: 0.75rem 2rem;
}

.img-fluid {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.img-fluid:hover {
  transform: scale(1.02);
}
</style>
