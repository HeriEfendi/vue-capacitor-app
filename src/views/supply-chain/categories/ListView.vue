<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Kategori</h3>
      <router-link to="/categories/create" class="btn btn-primary">Tambah</router-link>
    </div>
    <CCard>
      <CCardBody>
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nama</CTableHeaderCell>
              <CTableHeaderCell>Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(cat, i) in categories" :key="cat.id" @click="goEdit(cat.id)" style="cursor:pointer">
              <CTableDataCell>{{ i + 1 }}</CTableDataCell>
              <CTableDataCell>{{ cat.name }}</CTableDataCell>
              <CTableDataCell>
                <router-link :to="`/categories/${cat.id}/edit`" class="btn btn-warning btn-sm">Edit</router-link>
                <CButton color="danger" size="sm" class="ms-2" @click.stop="remove(cat.id)">Hapus</CButton>
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
import { CategoryRepository } from '../../../db/repositories'
import { useRouter } from 'vue-router'
import { CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton } from '@coreui/vue'

export default {
  name: 'CategoriesListView',
  components: { CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton },
  setup() {
    const router = useRouter()
    const categories = ref([])
    const fetch = async () => { categories.value = await CategoryRepository.getAll() }
    const goEdit = (id) => router.push(`/categories/${id}/edit`)
    const remove = async (id) => { await CategoryRepository.delete(id); fetch() }
    onMounted(fetch)
    return { categories, goEdit, remove }
  }
}
</script>


