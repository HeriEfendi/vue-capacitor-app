<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Daftar Utang</h5>
      <CButton color="primary" @click="$router.push('/debts/create')">Tambah Utang</CButton>
    </div>
    <CCard>
      <CCardBody>
        <CTable striped responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Pemberi</CTableHeaderCell>
              <CTableHeaderCell>Jumlah</CTableHeaderCell>
              <CTableHeaderCell>Jatuh Tempo</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell class="text-end">Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(row, index) in debts" :key="row.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>{{ row.lender }}</CTableDataCell>
              <CTableDataCell>{{ formatPrice(row.amount) }}</CTableDataCell>
              <CTableDataCell>{{ formatDate(row.dueDate) }}</CTableDataCell>
              <CTableDataCell>{{ row.status }}</CTableDataCell>
              <CTableDataCell class="text-end">
                <CButton color="warning" size="sm" @click="$router.push(`/debts/${row.id}/edit`)">Edit</CButton>
                <CButton color="danger" size="sm" class="ms-2" @click="onDelete(row.id)">Hapus</CButton>
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
import { debtsRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue'

export default {
  name: 'AccountingDebtsListView',
  components: { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow },
  setup() {
    const debts = ref([])
    const fetchAll = async () => { debts.value = await debtsRepo.getAll() }
    const onDelete = async (id) => { await debtsRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    onMounted(fetchAll)
    return { debts, onDelete, formatPrice, formatDate }
  }
}
</script>


