<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Tambah Utang</h5>
      <CButton color="secondary" @click="$router.push('/debts')">Kembali</CButton>
    </div>
    <CCard>
      <CCardBody>
        <CForm @submit.prevent="onSubmit">
          <div class="row">
            <div class="col-md-4 mb-3">
              <CFormLabel for="lender">Pemberi Utang</CFormLabel>
              <CFormInput id="lender" v-model="form.lender" required />
            </div>
            <div class="col-md-4 mb-3">
              <CFormLabel for="amount">Jumlah</CFormLabel>
              <CFormInput type="number" id="amount" v-model.number="form.amount" required />
            </div>
            <div class="col-md-4 mb-3">
              <CFormLabel for="due">Jatuh Tempo</CFormLabel>
              <CFormInput type="date" id="due" v-model="form.dueDate" required />
            </div>
            <div class="col-md-4 mb-3">
              <CFormLabel for="status">Status</CFormLabel>
              <CFormInput id="status" v-model="form.status" placeholder="Belum Lunas / Lunas" required />
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
import { debtsRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel } from '@coreui/vue'

export default {
  name: 'AccountingDebtsCreateView',
  components: { CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel },
  setup() {
    const router = useRouter()
    const form = ref({ lender: '', amount: 0, dueDate: new Date().toISOString().slice(0,10), status: 'Belum Lunas' })
    const onSubmit = async () => { await debtsRepo.add({ ...form.value }); router.push('/debts') }
    return { form, onSubmit }
  }
}
</script>


