<template>
  <div class="home">
    <!-- Navbar Component -->
    <nav-bar />

    <!-- Hero Section -->
    <hero-section />

    <!-- Kategori Section -->
    <category-section :categories="categories" />

    <!-- Featured Products -->
    <featured-products :products="featuredProducts" />

    <!-- Why Choose Us -->
    <why-choose-us />

    <!-- Footer Component -->
    <app-footer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import HeroSection from '../components/HeroSection.vue'
import CategorySection from '../components/CategorySection.vue'
import FeaturedProducts from '../components/FeaturedProducts.vue'
import WhyChooseUs from '../components/WhyChooseUs.vue'
import AppFooter from '../components/AppFooter.vue'
import { CategoryRepository, ProductRepository } from '../db/repositories'
export default {
  name: 'HomeView',
  components: {
    NavBar,
    HeroSection,
    CategorySection,
    FeaturedProducts,
    WhyChooseUs,
    AppFooter
  },
  setup() {
    const categories = ref([])
    const featuredProducts = ref([])
    const fetchData = async () => {
      try {
        categories.value = await CategoryRepository.getAll()
        featuredProducts.value = await ProductRepository.getFeatured()
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      categories,
      featuredProducts
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
