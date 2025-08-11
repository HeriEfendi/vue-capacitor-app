<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Daftar Pengeluaran</h5>
      <CButton color="primary" @click="$router.push('/expenses/create')">Tambah Pengeluaran</CButton>
    </div>
    <CCard>
      <CCardBody>
        <CTable striped responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Deskripsi</CTableHeaderCell>
              <CTableHeaderCell>Kategori</CTableHeaderCell>
              <CTableHeaderCell>Jumlah</CTableHeaderCell>
              <CTableHeaderCell>Tanggal</CTableHeaderCell>
              <CTableHeaderCell class="text-end">Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(expense, index) in expenses" :key="expense.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>{{ expense.description }}</CTableDataCell>
              <CTableDataCell>{{ expense.category }}</CTableDataCell>
              <CTableDataCell>{{ formatPrice(expense.amount) }}</CTableDataCell>
              <CTableDataCell>{{ formatDate(expense.date) }}</CTableDataCell>
              <CTableDataCell class="text-end">
                <CButton color="warning" size="sm" @click="$router.push(`/expenses/${expense.id}/edit`)">Edit</CButton>
                <CButton color="danger" size="sm" class="ms-2" @click="onDelete(expense.id)">Hapus</CButton>
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
import { expensesRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue'

export default {
  name: 'AccountingExpensesListView',
  components: { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow },
  setup() {
    const expenses = ref([])
    const fetchAll = async () => { expenses.value = await expensesRepo.getAll() }
    const onDelete = async (id) => { await expensesRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    onMounted(fetchAll)
    return { expenses, onDelete, formatPrice, formatDate }
  }
}
</script>


