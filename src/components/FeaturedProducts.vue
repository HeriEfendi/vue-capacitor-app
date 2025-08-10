<template>
  <section class="featured-products bg-light">
    <div class="container">
      <h2 class="text-center mb-4">Produk Unggulan</h2>
      <div class="row">
        <div
          v-for="product in products"
          :key="product.id"
          class="col-md-3 mb-4"
        >
          <div class="card product-card">
            <img
              :src="product.image"
              class="card-img-top"
              :alt="product.name"
            >
            <div class="card-body">
              <h5 class="card-title">{{ product.name }}</h5>
              <p class="card-text">{{ formatPrice(product.price) }}</p>
              <a
                href="#"
                class="btn btn-primary"
                @click.prevent="onBuyNow(product)"
              >
                Beli Sekarang
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'FeaturedProducts',
  props: {
    products: {
      type: Array,
      required: true
    }
  },
  setup(props, { emit }) {
    const formatPrice = (price) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(price)
    }

    const router = useRouter()
    
    const onBuyNow = (product) => {
      emit('buy-product', product)
      router.push(`/product/${product.id}`)
    }

    return {
      formatPrice,
      onBuyNow
    }
  }
}
</script>

<style scoped>
.featured-products {
  padding: 60px 0;
  background-color: #ffffff; /* Use a clean white background */
}

h2 {
  font-weight: 700;
  margin-bottom: 3rem; /* More space below the title */
}

.product-card {
  border: 1px solid #e9ecef; /* Subtle border */
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
  overflow: hidden; /* Hide overflowing parts of the image */
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.card-img-top {
  height: 220px;
  object-fit: cover;
}

.card-body {
  padding: 1.5rem;
  text-align: center; /* Center align content */
}

.card-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--bs-dark);
  margin-bottom: 0.5rem;
}

.card-text {
  color: var(--bs-primary);
  font-weight: 700; /* Bolder price */
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.btn-primary {
  width: 100%; /* Full-width button */
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-radius: 8px;
}
</style>

