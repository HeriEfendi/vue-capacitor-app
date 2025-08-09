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
  transition: transform 0.3s;
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.category-card:hover {
  transform: translateY(-5px);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.card-title {
  margin-bottom: 0;
  font-weight: 600;
}
</style>
