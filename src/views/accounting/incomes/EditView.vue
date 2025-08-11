<template>
  <div class="container py-4" v-if="loaded">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Edit Pendapatan</h5>
      <CButton color="secondary" @click="$router.push('/incomes')">Kembali</CButton>
    </div>
    <CCard>
      <CCardBody>
        <CForm @submit.prevent="onSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <CFormLabel for="inc_desc">Deskripsi</CFormLabel>
              <CFormInput id="inc_desc" v-model="form.description" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="inc_amount">Jumlah</CFormLabel>
              <CFormInput type="number" id="inc_amount" v-model.number="form.amount" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="inc_date">Tanggal</CFormLabel>
              <CFormInput type="date" id="inc_date" v-model="form.date" required />
            </div>
          </div>
          <CButton type="submit" color="primary">Simpan Perubahan</CButton>
        </CForm>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { incomesRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel } from '@coreui/vue'

export default {
  name: 'AccountingIncomesEditView',
  components: { CButton, CCard, CCardBody, CForm, CFormInput, CFormLabel },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loaded = ref(false)
    const form = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0,10) })
    const load = async () => {
      const id = Number(route.params.id)
      const data = await incomesRepo.getById(id)
      if (!data) return router.push('/incomes')
      form.value = { description: data.description, amount: data.amount, date: (data.date || new Date().toISOString()).slice(0,10) }
      loaded.value = true
    }
    const onSubmit = async () => { await incomesRepo.update(Number(route.params.id), { ...form.value }); router.push('/incomes') }
    onMounted(load)
    return { form, onSubmit, loaded }
  }
}
</script>


