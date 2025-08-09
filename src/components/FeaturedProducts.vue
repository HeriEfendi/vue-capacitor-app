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
}

.product-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-text {
  color: var(--bs-primary);
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
</style>
