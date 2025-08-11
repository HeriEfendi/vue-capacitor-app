<template>
  <div class="container py-4">
    <h3 class="mb-3">Tambah Kategori</h3>
    <CCard>
      <CCardBody>
        <CForm @submit.prevent="save">
          <div class="mb-3">
            <CFormLabel>Nama</CFormLabel>
            <CFormInput v-model="name" required />
          </div>
          <CButton type="submit" color="primary">Simpan</CButton>
          <router-link to="/categories" class="btn btn-secondary ms-2">Batal</router-link>
        </CForm>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CategoryRepository } from '../db/repositories'
import { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton } from '@coreui/vue'

export default {
  name: 'CategoryCreateView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton },
  setup() {
    const router = useRouter()
    const name = ref('')
    const save = async () => { await CategoryRepository.add({ name: name.value }); router.push('/categories') }
    return { name, save }
  }
}
</script>


