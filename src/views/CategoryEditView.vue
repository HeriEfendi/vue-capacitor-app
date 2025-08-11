<template>
  <div class="container py-4" v-if="name !== null">
    <h3 class="mb-3">Edit Kategori</h3>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CategoryRepository } from '../db/repositories'
import { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton } from '@coreui/vue'

export default {
  name: 'CategoryEditView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton },
  setup() {
    const route = useRoute(); const router = useRouter()
    const name = ref(null)
    onMounted(async () => { const data = await CategoryRepository.getById(Number(route.params.id)); name.value = data?.name || '' })
    const save = async () => { await CategoryRepository.update(Number(route.params.id), { name: name.value }); router.push('/categories') }
    return { name, save }
  }
}
</script>


