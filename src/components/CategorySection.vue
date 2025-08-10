<template>
  <section class="py-5">
    <div class="container">
      <h2 class="text-center mb-4">Kategori Produk</h2>
      <div class="row">
        <div
          v-for="category in categories"
          :key="category.id"
          class="col-md-3"
        >
          <div class="card category-card" @click="onCategoryClick(category)">
            <img
              :src="category.image"
              class="card-img-top"
              :alt="category.name"
            >
            <div class="card-body text-center">
              <h5 class="card-title">{{ category.name }}</h5>
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
  name: 'CategorySection',
  props: {
    categories: {
      type: Array,
      required: true
    }
  },
  setup(props, { emit }) {
    const router = useRouter()
    
    const onCategoryClick = (category) => {
      emit('category-selected', category)
      router.push(`/category/${category.id}`)
    }

    return {
      onCategoryClick
    }
  }
}
</script>

<style scoped>
.category-card {
  cursor: pointer;
  border: none;
  border-radius: 15px; /* Softer radius */
  overflow: hidden; /* Important for the image overlay effect */
  position: relative;
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
}

.card-img-top {
  width: 100%;
  height: 250px; /* A bit taller */
  object-fit: cover;
  transition: transform 0.4s ease;
}

.category-card:hover .card-img-top {
  transform: scale(1.05); /* Zoom effect on hover */
}

.card-body {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
  padding: 1.5rem 1rem;
  transition: all 0.4s ease;
}

.card-title {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0;
  transform: translateY(10px); /* Initially moved down */
  transition: transform 0.4s ease;
}

.category-card:hover .card-title {
  transform: translateY(0); /* Move up on hover */
}
</style>

