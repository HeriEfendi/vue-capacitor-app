<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Manajemen Produk</ion-title>
        <ion-buttons slot="end">
          <ion-button router-link="/products/create">
            <ion-icon slot="icon-only" :icon="addOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <!-- Search Bar -->
      <div class="px-3 pt-3">
        <div class="search-bar-wrap mb-3">
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control app-control" 
            placeholder="Cari nama produk..." 
          />
        </div>

        <!-- Category Filter Chips -->
        <div class="filter-chips--mobile mb-3">
          <button 
            type="button" 
            class="btn btn-action btn-sm me-1"
            :class="selectedCategory === 'all' ? 'primary' : 'light'"
            @click="selectedCategory = 'all'"
          >
            Semua
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            type="button" 
            class="btn btn-action btn-sm me-1"
            :class="selectedCategory === cat.id ? 'primary' : 'light'"
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="empty-state text-center py-5">
        <ion-icon :icon="basketOutline" style="font-size: 3rem;" class="text-muted mb-2" />
        <p class="text-muted">Tidak ada produk ditemukan.</p>
      </div>

      <!-- Product Grid -->
      <ion-grid v-else class="menu-grid">
        <ion-row>
          <ion-col v-for="product in filteredProducts" :key="product.id" size="6" size-sm="4" size-md="3">
            <div class="mobile-card h-100 d-flex flex-column justify-content-between p-2">
              <div>
                <div class="position-relative text-center rounded-3 overflow-hidden mb-2 product-img-wrap">
                  <!-- Gambar dari Filesystem -->
                  <img
                    v-if="product.imageURL"
                    :src="product.imageURL"
                    :alt="product.name"
                    class="product-img"
                  />
                  <!-- Placeholder CSS jika belum ada gambar -->
                  <div v-else class="product-img-placeholder">
                    <ion-icon :icon="basketOutline" style="font-size:2rem;" />
                  </div>
                  <!-- Featured Badge -->
                  <span v-if="product.featured === 1" class="badge bg-warning text-dark position-absolute top-0 start-0 m-1" style="font-size: 0.65rem;">
                    Unggulan
                  </span>
                </div>


                <div class="px-1">
                  <!-- Category name -->
                  <span class="badge bg-secondary mb-1" style="font-size: 0.65rem;">{{ getCategoryName(product.categoryId) }}</span>
                  <h6 class="fw-bold text-dark mb-1 text-truncate" :title="product.name">{{ product.name }}</h6>
                  <p class="text-indigo fw-bold mb-2" style="font-size: 0.85rem;">{{ formatPrice(product.price) }}</p>
                </div>
              </div>

              <div class="px-1 mt-auto">
                <!-- Stock status badge -->
                <div class="mb-2">
                  <span v-if="product.stock === 0" class="badge bg-danger w-100">Habis</span>
                  <span v-else-if="product.stock <= 5" class="badge bg-warning text-dark w-100">Stok Tipis ({{ product.stock }})</span>
                  <span v-else class="badge bg-success w-100">Stok: {{ product.stock }}</span>
                </div>

                <!-- Actions -->
                <div class="d-flex justify-content-between border-top pt-2">
                  <button class="btn btn-light btn-sm text-primary flex-fill me-1 py-1" @click="editProduct(product.id)" title="Edit">
                    <ion-icon :icon="createOutline" />
                  </button>
                  <button class="btn btn-light btn-sm text-danger flex-fill py-1" @click="confirmDelete(product.id)" title="Hapus">
                    <ion-icon :icon="trashOutline" />
                  </button>
                </div>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Delete Alert -->
      <ion-alert
        :is-open="deleteId !== null"
        header="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan."
        :buttons="[
          { text: 'Batal', role: 'cancel', handler: () => { deleteId = null } },
          { text: 'Hapus', role: 'destructive', handler: () => { deleteProduct() } }
        ]"
        @didDismiss="deleteId = null"
      />
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ProductRepository, CategoryRepository } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonAlert, toastController } from '@ionic/vue';
import { addOutline, trashOutline, createOutline, basketOutline } from 'ionicons/icons';
import { readProductImage } from '../../../composables/useProductImage';

export default {
  name: 'ProductsListView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonAlert },
  setup() {
    const router = useRouter()
    const products = ref([])
    const categories = ref([])
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const deleteId = ref(null)

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

    const getCategoryName = (catId) => {
      const cat = categories.value.find(c => c.id === catId)
      return cat ? cat.name : 'Tanpa Kategori'
    }


    const fetchData = async () => {
      categories.value = await CategoryRepository.getAll()
      const data = await ProductRepository.getAll()
      // Load gambar dari Filesystem secara async (h_dev/product/product_XX.webp)
      await Promise.all(data.map(async (product) => {
        if (product.image) {
          // Coba baca dari Capacitor Filesystem
          product.imageURL = await readProductImage(product.image)
        } else {
          product.imageURL = null
        }
      }))
      products.value = data
    }


    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = selectedCategory.value === 'all' || product.categoryId === selectedCategory.value
        return matchesSearch && matchesCategory
      })
    })

    const editProduct = (id) => {
      router.push(`/products/${id}/edit`)
    }

    const confirmDelete = (id) => {
      deleteId.value = id
    }

    const deleteProduct = async () => {
      if (deleteId.value !== null) {
        await ProductRepository.delete(deleteId.value)
        const toast = await toastController.create({
          message: 'Produk berhasil dihapus!',
          duration: 2000,
          color: 'success',
          position: 'top'
        })
        await toast.present()
        deleteId.value = null
        await fetchData()
      }
    }

    onMounted(fetchData)

    return {
      products,
      categories,
      searchQuery,
      selectedCategory,
      filteredProducts,
      deleteId,
      formatPrice,
      getCategoryName,
      editProduct,
      confirmDelete,
      deleteProduct,
      addOutline,
      trashOutline,
      createOutline,
      basketOutline
    }
  }
}
</script>

<style scoped>
.product-img-wrap {
  height: 120px;
  background: #f0edff;
  display: grid;
  place-items: center;
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #b0a0e0;
  width: 100%;
  height: 100%;
}
</style>
