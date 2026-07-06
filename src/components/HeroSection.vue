<template>
  <section class="hero-section">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <h1 class="display-4">{{ title }}</h1>
          <p class="lead">{{ description }}</p>
          <a href="#" class="btn btn-primary" @click.prevent="onShopNow">
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
    const heroImage = '404'
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
  /* Subtle gradient background */
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 100px 0;
  text-align: center; /* Center align text on small screens */
}

@media (min-width: 992px) {
  .hero-section {
    text-align: left; /* Left align text on larger screens */
  }
}

.display-4 {
  font-weight: 700; /* Bolder title */
  margin-bottom: 1.5rem;
  color: var(--bs-dark);
}

.lead {
  font-size: 1.25rem;
  color: var(--bs-secondary);
  margin-bottom: 2.5rem;
}

.btn-primary {
  padding: 1rem 2.5rem; /* Larger button */
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px; /* Pill-shaped button */
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2); /* Button shadow */
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.img-fluid {
  border-radius: 15px; /* Softer border-radius for the image */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.img-fluid:hover {
  transform: scale(1.03); /* Slightly larger hover effect */
}
</style>

