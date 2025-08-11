<template>
  <div class="container py-4" v-if="form">
    <h3 class="mb-3">Edit Bahan Baku</h3>
    <CCard>
      <CCardBody>
        <CForm @submit.prevent="save">
          <div class="mb-3">
            <CFormLabel>Nama</CFormLabel>
            <CFormInput v-model="form.name" required />
          </div>
          <div class="mb-3">
            <CFormLabel>Satuan</CFormLabel>
            <CFormInput v-model="form.unit" required />
          </div>
          <div class="mb-3">
            <CFormLabel>Stok</CFormLabel>
            <CFormInput type="number" v-model.number="form.stock" required />
          </div>
          <CButton type="submit" color="primary">Simpan</CButton>
          <router-link to="/raw-materials" class="btn btn-secondary ms-2">Batal</router-link>
        </CForm>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RawMaterialsRepository } from '../../../db/repositories'
import { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton } from '@coreui/vue'

export default {
  name: 'RawMaterialsEditView',
  components: { CCard, CCardBody, CForm, CFormInput, CFormLabel, CButton },
  setup() {
    const route = useRoute(); const router = useRouter()
    const form = ref(null)
    onMounted(async () => { form.value = await RawMaterialsRepository.getById(Number(route.params.id)) })
    const save = async () => { await RawMaterialsRepository.update(form.value.id, form.value); router.push('/raw-materials') }
    return { form, save }
  }
}
</script>


