<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Tambah Modal</h5>
      <CButton color="secondary" @click="$router.push('/capital')">Kembali</CButton>
    </div>
    <CCard>
      <CCardBody>
        <CForm @submit.prevent="onSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <CFormLabel for="source">Sumber</CFormLabel>
              <CFormInput id="source" v-model="form.source" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="amount">Jumlah</CFormLabel>
              <CFormInput type="number" id="amount" v-model.number="form.amount" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="date">Tanggal</CFormLabel>
              <CFormInput type="date" id="date" v-model="form.date" required />
            </div>
          </div>
          <CButton type="submit" color="primary">Simpan</CButton>
        </CForm>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { capitalCostsRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel } from '@coreui/vue'

export default {
  name: 'AccountingCapitalCreateView',
  components: { CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel },
  setup() {
    const router = useRouter()
    const form = ref({ source: '', amount: 0, date: new Date().toISOString().slice(0,10) })
    const onSubmit = async () => { await capitalCostsRepo.add({ ...form.value }); router.push('/capital') }
    return { form, onSubmit }
  }
}
</script>


