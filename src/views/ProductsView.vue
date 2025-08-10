<template>
  <div>
    <nav-bar />
    <div class="container py-5">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>Tambah Produk Baru</strong>
        </CCardHeader>
        <CCardBody>
          <CForm @submit.prevent="addProduct">
        <div class="mb-3">
              <CFormLabel for="name">Nama Produk</CFormLabel>
              <CFormInput type="text" id="name" v-model="newProduct.name" required />
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
              <CFormTextarea id="description" rows="3" v-model="newProduct.description" required></CFormTextarea>
        </div>
            <div class="mb-3">
              <CFormLabel for="image">Gambar</CFormLabel>
              <CFormInput type="file" id="image" @change="handleImageUpload" />
              </div>
            <CButton type="submit" color="primary">Tambah Produk</CButton>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>
          <strong>Daftar Produk</strong>
        </CCardHeader>
        <CCardBody>
          <div class="row">
            <div
              v-for="product in products"
              :key="product.id"
              class="col-md-4 mb-4"
            >
              <CCard class="h-100">
                <CImage class="card-img-top" :src="product.imageURL" :alt="product.name" />
                <CCardBody>
                  <CCardTitle>{{ product.name }}</CCardTitle>
                  <CCardText><strong>{{ formatPrice(product.price) }}</strong></CCardText>
                </CCardBody>
                <CCardFooter>
                  <div class="d-flex justify-content-between">
                    <CButton color="warning" size="sm" @click="startEdit(product)">Edit</CButton>
                    <CButton color="danger" size="sm" @click="deleteProduct(product.id)">Hapus</CButton>
                  </div>
                </CCardFooter>
              </CCard>
  </div>
          </div>
        </CCardBody>
      </CCard>

      <CCard v-if="editId !== null" class="mt-4">
        <CCardHeader>
          <strong>Edit Produk</strong>
        </CCardHeader>
        <CCardBody>
          <CForm @submit.prevent="saveEdit">
            <div class="mb-3">
              <CFormLabel for="edit_name">Nama Produk</CFormLabel>
              <CFormInput type="text" id="edit_name" v-model="editProductState.name" required />
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <CFormLabel for="edit_price">Harga</CFormLabel>
                <CFormInput type="number" id="edit_price" v-model.number="editProductState.price" required />
              </div>
              <div class="col-md-6 mb-3">
                <CFormLabel for="edit_stock">Stok</CFormLabel>
                <CFormInput type="number" id="edit_stock" v-model.number="editProductState.stock" required />
              </div>
            </div>
            <div class="mb-3">
              <CFormLabel for="edit_description">Deskripsi</CFormLabel>
              <CFormTextarea id="edit_description" rows="3" v-model="editProductState.description" required></CFormTextarea>
            </div>
            <div class="mb-3">
              <CFormLabel for="edit_image">Gambar</CFormLabel>
              <CFormInput type="file" id="edit_image" @change="handleEditImageUpload" />
              <div class="mt-2">
                <CImage :src="editProductState.imageURL || 'https://via.placeholder.com/200x150?text=No+Image'" width="200" />
              </div>
            </div>
            <CButton type="submit" color="success">Simpan Perubahan</CButton>
            <CButton type="button" color="secondary" class="ms-2" @click="cancelEdit">Batal</CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
    <app-footer />
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AppFooter from '../components/AppFooter.vue'
import { ProductRepository } from '../db/repositories'
import { ref, onMounted } from 'vue'
import {
  CCard, CCardHeader, CCardBody, CCardFooter, CCardTitle, CCardText,
  CForm, CFormInput, CFormLabel, CFormTextarea,
  CButton, CImage
} from '@coreui/vue'

export default {
  name: 'ProductsView',
  components: {
    NavBar,
    AppFooter,
    CCard, CCardHeader, CCardBody, CCardFooter, CCardTitle, CCardText,
    CForm, CFormInput, CFormLabel, CFormTextarea,
    CButton, CImage
  },
  setup() {
    const products = ref([])
    const newProduct = ref({
      name: '',
      price: 0,
      stock: 0,
      description: '',
          image: null,
          imageURL: ''
    })
    const editId = ref(null)
    const editProductState = ref({ name: '', price: 0, stock: 0, description: '', image: null, imageURL: '' })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(price)
    }

    const fetchData = async () => {
      products.value = await ProductRepository.getAll();
      products.value.forEach(product => {
        if (product.image) {
          if (typeof product.image === 'string') {
            product.imageURL = product.image;
          } else {
            product.imageURL = URL.createObjectURL(product.image);
          }
        } else {
          product.imageURL = 'https://via.placeholder.com/200x150?text=No+Image';
        }
      });
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        newProduct.value.image = file
        newProduct.value.imageURL = URL.createObjectURL(file)
    }
    }

    const addProduct = async () => {
      if (newProduct.value.image) {
        const id = await ProductRepository.add({
          name: newProduct.value.name,
          price: newProduct.value.price,
          stock: newProduct.value.stock,
          description: newProduct.value.description,
          image: newProduct.value.image
        })

        newProduct.value = {
          name: '',
          price: 0,
          stock: 0,
          description: '',
          image: null,
          imageURL: ''
    }
      fetchData()
      } else {
        alert('Silakan pilih gambar produk')
      }
    }

    const startEdit = (product) => {
      editId.value = product.id
      editProductState.value = {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        image: product.image || null,
        imageURL: product.imageURL || ''
      }
    }

    const cancelEdit = () => {
      editId.value = null
      editProductState.value = { name: '', price: 0, stock: 0, description: '', image: null, imageURL: '' }
    }

    const handleEditImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        editProductState.value.image = file
        editProductState.value.imageURL = URL.createObjectURL(file)
      }
    }

    const saveEdit = async () => {
      if (editId.value != null) {
        await ProductRepository.update(editId.value, {
          name: editProductState.value.name,
          price: editProductState.value.price,
          stock: editProductState.value.stock,
          description: editProductState.value.description,
          image: editProductState.value.image
        })
        cancelEdit()
        fetchData()
      }
    }

    const deleteProduct = async (productId) => {
      await ProductRepository.delete(productId)
      fetchData()
    }

    onMounted(() => {
      fetchData()
    })

    return {
      products,
      newProduct,
      formatPrice,
      addProduct,
      handleImageUpload,
      startEdit,
      deleteProduct
      ,editId,
      editProductState,
      cancelEdit,
      handleEditImageUpload,
      saveEdit
    }
  }
}
</script>

<style scoped>
/* Scoped styles can be removed or reduced as CoreUI takes over */
</style>

