<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Bahan Baku</h3>
      <router-link to="/raw-materials/create" class="btn btn-primary">Tambah</router-link>
    </div>
    <CCard>
      <CCardBody>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nama</CTableHeaderCell>
              <CTableHeaderCell>Satuan</CTableHeaderCell>
              <CTableHeaderCell>Stok</CTableHeaderCell>
              <CTableHeaderCell>Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(row, idx) in items" :key="row.id" @click="goEdit(row.id)" style="cursor:pointer">
              <CTableDataCell>{{ idx + 1 }}</CTableDataCell>
              <CTableDataCell>{{ row.name }}</CTableDataCell>
              <CTableDataCell>{{ row.unit }}</CTableDataCell>
              <CTableDataCell>{{ row.stock }}</CTableDataCell>
              <CTableDataCell>
                <router-link :to="`/raw-materials/${row.id}/edit`" class="btn btn-warning btn-sm">Edit</router-link>
                <CButton color="danger" size="sm" class="ms-2" @click.stop="remove(row.id)">Hapus</CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { RawMaterialsRepository } from '../db/repositories'
import { useRouter } from 'vue-router'
import { CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton } from '@coreui/vue'

export default {
  name: 'RawMaterialsListView',
  components: { CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton },
  setup() {
    const router = useRouter()
    const items = ref([])
    const fetchAll = async () => { items.value = await RawMaterialsRepository.getAll() }
    const goEdit = (id) => router.push(`/raw-materials/${id}/edit`)
    const remove = async (id) => { await RawMaterialsRepository.delete(id); fetchAll() }
    onMounted(fetchAll)
    return { items, goEdit, remove }
  }
}
</script>


