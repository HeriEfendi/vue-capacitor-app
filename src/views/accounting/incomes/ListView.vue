<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Daftar Pendapatan</h5>
      <CButton color="primary" @click="$router.push('/incomes/create')">Tambah Pendapatan</CButton>
    </div>
    <CCard>
      <CCardBody>
        <CTable striped responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Deskripsi</CTableHeaderCell>
              <CTableHeaderCell>Jumlah</CTableHeaderCell>
              <CTableHeaderCell>Tanggal</CTableHeaderCell>
              <CTableHeaderCell class="text-end">Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(income, index) in incomes" :key="income.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>{{ income.description }}</CTableDataCell>
              <CTableDataCell>{{ formatPrice(income.amount) }}</CTableDataCell>
              <CTableDataCell>{{ formatDate(income.date) }}</CTableDataCell>
              <CTableDataCell class="text-end">
                <CButton color="warning" size="sm" @click="$router.push(`/incomes/${income.id}/edit`)">Edit</CButton>
                <CButton color="danger" size="sm" class="ms-2" @click="onDelete(income.id)">Hapus</CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  </div>
  </template>

<script>
import { onMounted, ref } from 'vue'
import { incomesRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue'

export default {
  name: 'AccountingIncomesListView',
  components: { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow },
  setup() {
    const incomes = ref([])
    const fetchAll = async () => { incomes.value = await incomesRepo.getAll() }
    const onDelete = async (id) => { await incomesRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    onMounted(fetchAll)
    return { incomes, onDelete, formatPrice, formatDate }
  }
}
</script>


