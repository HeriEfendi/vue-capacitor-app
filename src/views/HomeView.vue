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

    <CButton color="danger" @click="resetDatabase">Reset Database</CButton>

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
import { db, seedDatabase } from '../db/schema'
import { CButton } from '@coreui/vue';
export default {
  name: 'HomeView',
  components: {
    NavBar,
    HeroSection,
    CategorySection,
    FeaturedProducts,
    WhyChooseUs,
    AppFooter,
    CButton
  },
  setup() {
    const categories = ref([])
    const featuredProducts = ref([])
    const fetchData = async () => {
      try {
        categories.value = await CategoryRepository.getAll();
        featuredProducts.value = await ProductRepository.getFeatured();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const resetDatabase = async () => {
      await db.delete();
      await db.open();
      await seedDatabase();
      fetchData();
    };

    onMounted(() => {
      fetchData()
    })

    return {
      categories,
      featuredProducts,
      resetDatabase
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

