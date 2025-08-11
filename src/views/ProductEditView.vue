<template>
  <div class="container py-4" v-if="product">
    <h3 class="mb-3">Edit Produk</h3>
    <CCard>
      <CCardBody>
        <CForm @submit.prevent="save">
          <div class="mb-3">
            <CFormLabel for="name">Nama Produk</CFormLabel>
            <CFormInput id="name" v-model="product.name" required />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <CFormLabel for="price">Harga</CFormLabel>
              <CFormInput type="number" id="price" v-model.number="product.price" required />
            </div>
            <div class="col-md-6 mb-3">
              <CFormLabel for="stock">Stok</CFormLabel>
              <CFormInput type="number" id="stock" v-model.number="product.stock" required />
            </div>
          </div>
          <div class="mb-3">
            <CFormLabel for="description">Deskripsi</CFormLabel>
            <CFormTextarea id="description" rows="3" v-model="product.description" />
          </div>
          <div class="mb-3">
            <CFormLabel for="image">Gambar</CFormLabel>
            <CFormInput type="file" id="image" @change="handleImageUpload" />
          </div>
          <CButton type="submit" color="primary">Simpan</CButton>
          <router-link to="/products" class="btn btn-secondary ms-2">Batal</router-link>
        </CForm>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProductRepository } from '../db/repositories'
import { CCard, CCardBody, CForm, CFormInput, CFormLabel, CFormTextarea, CButton } from '@coreui/vue'

export default {
  name: 'ProductEditView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CFormTextarea, CButton },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const product = ref(null)
    onMounted(async () => { product.value = await ProductRepository.getById(Number(route.params.id)) })
    const handleImageUpload = (e) => { const f = e.target.files[0]; if (f) product.value.image = f }
    const save = async () => { await ProductRepository.update(product.value.id, product.value); router.push('/products') }
    return { product, handleImageUpload, save }
  }
}
</script>


