<template>
  <div class="container py-4">
    <h3 class="mb-3">Tambah Produk</h3>
    <CCard>
      <CCardBody>
        <CForm @submit.prevent="addProduct">
          <div class="mb-3">
            <CFormLabel for="name">Nama Produk</CFormLabel>
            <CFormInput id="name" v-model="newProduct.name" required />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <CFormLabel for="price">Harga</CFormLabel>
              <CFormInput type="number" id="price" v-model.number="newProduct.price" required />
            </div>
            <div class="col-md-6 mb-3">
              <CFormLabel for="stock">Stok</CFormLabel>
              <CFormInput type="number" id="stock" v-model.number="newProduct.stock" required />
            </div>
          </div>
          <div class="mb-3">
            <CFormLabel for="description">Deskripsi</CFormLabel>
            <CFormTextarea id="description" rows="3" v-model="newProduct.description" />
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
import { ref } from 'vue'
import { ProductRepository } from '../db/repositories'
import { CCard, CCardBody, CForm, CFormInput, CFormLabel, CFormTextarea, CButton } from '@coreui/vue'

export default {
  name: 'ProductCreateView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CFormTextarea, CButton },
  setup(_, { router }) {
    const newProduct = ref({ name: '', price: 0, stock: 0, description: '', image: null })
    const handleImageUpload = (e) => { const f = e.target.files[0]; if (f) newProduct.value.image = f }
    const addProduct = async () => {
      await ProductRepository.add(newProduct.value)
      router.push('/products')
    }
    return { newProduct, handleImageUpload, addProduct }
  }
}
</script>


