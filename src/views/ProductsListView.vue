<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Daftar Produk</h3>
      <router-link to="/products/create" class="btn btn-primary">Tambah Produk</router-link>
    </div>

    <CCard>
      <CCardBody>
        <div class="row">
          <div v-for="product in products" :key="product.id" class="col-md-4 mb-4">
            <CCard class="h-100">
              <CImage class="card-img-top" :src="product.imageURL" :alt="product.name" />
              <CCardBody>
                <CCardTitle>{{ product.name }}</CCardTitle>
                <CCardText><strong>{{ formatPrice(product.price) }}</strong></CCardText>
              </CCardBody>
              <CCardFooter>
                <div class="d-flex justify-content-between">
                  <router-link :to="`/products/${product.id}/edit`" class="btn btn-warning btn-sm">Edit</router-link>
                  <CButton color="danger" size="sm" @click="deleteProduct(product.id)">Hapus</CButton>
                </div>
              </CCardFooter>
            </CCard>
          </div>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ProductRepository } from '../db/repositories'
import { CCard, CCardBody, CCardFooter, CCardTitle, CCardText, CButton, CImage } from '@coreui/vue'

export default {
  name: 'ProductsListView',
  components: { CCard, CCardBody, CCardFooter, CCardTitle, CCardText, CButton, CImage },
  setup() {
    const products = ref([])
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const fetchData = async () => {
      products.value = await ProductRepository.getAll();
      products.value.forEach(product => {
        if (product.image) {
          product.imageURL = typeof product.image === 'string' ? product.image : URL.createObjectURL(product.image)
        } else {
          product.imageURL = 'https://via.placeholder.com/200x150?text=No+Image'
        }
      })
    }
    const deleteProduct = async (id) => { await ProductRepository.delete(id); fetchData() }
    onMounted(fetchData)
    return { products, formatPrice, deleteProduct }
  }
}
</script>


