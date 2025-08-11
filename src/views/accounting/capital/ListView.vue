<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Daftar Modal</h5>
      <CButton color="primary" @click="$router.push('/capital/create')">Tambah Modal</CButton>
    </div>
    <CCard>
      <CCardBody>
        <CTable striped responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Sumber</CTableHeaderCell>
              <CTableHeaderCell>Jumlah</CTableHeaderCell>
              <CTableHeaderCell>Tanggal</CTableHeaderCell>
              <CTableHeaderCell class="text-end">Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(row, index) in items" :key="row.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>{{ row.source }}</CTableDataCell>
              <CTableDataCell>{{ formatPrice(row.amount) }}</CTableDataCell>
              <CTableDataCell>{{ formatDate(row.date) }}</CTableDataCell>
              <CTableDataCell class="text-end">
                <CButton color="warning" size="sm" @click="$router.push(`/capital/${row.id}/edit`)">Edit</CButton>
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
import { capitalCostsRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue'

export default {
  name: 'AccountingCapitalListView',
  components: { CButton, CCard, CCardBody, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow },
  setup() {
    const items = ref([])
    const fetchAll = async () => { items.value = await capitalCostsRepo.getAll() }
    const onDelete = async (id) => { await capitalCostsRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    onMounted(fetchAll)
    return { items, onDelete, formatPrice, formatDate }
  }
}
</script>


