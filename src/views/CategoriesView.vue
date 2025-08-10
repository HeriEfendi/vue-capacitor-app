<template>
  <div>
    <div class="container py-4">
      <CCard>
        <CCardHeader><strong>Kategori</strong></CCardHeader>
        <CCardBody>
          <CForm @submit.prevent="addCategory">
            <div class="mb-3">
              <CFormLabel for="cat_name">Nama Kategori</CFormLabel>
              <CFormInput type="text" id="cat_name" v-model="newCategory.name" required />
            </div>
            <CButton type="submit" color="primary">Tambah Kategori</CButton>
          </CForm>
          <hr class="my-4" />
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Nama</CTableHeaderCell>
                <CTableHeaderCell>Aksi</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(category, index) in categories" :key="category.id">
                <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                <CTableDataCell>
                  <template v-if="editId === category.id">
                    <CFormInput v-model="editCategory.name" />
                  </template>
                  <template v-else>
                    {{ category.name }}
                  </template>
                </CTableDataCell>
                <CTableDataCell>
                  <template v-if="editId === category.id">
                    <CButton color="success" size="sm" @click="saveEdit">Simpan</CButton>
                    <CButton color="secondary" size="sm" class="ms-2" @click="cancelEdit">Batal</CButton>
                  </template>
                  <template v-else>
                    <CButton color="warning" size="sm" @click="startEdit(category)">Edit</CButton>
                    <CButton color="danger" size="sm" class="ms-2" @click="deleteCategory(category.id)">Hapus</CButton>
                  </template>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { CategoryRepository } from '../db/repositories'
import { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'

export default {
  name: 'CategoriesView',
  components: {
    CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
  },
  setup() {
    const categories = ref([])
    const newCategory = ref({ name: '' })
    const editId = ref(null)
    const editCategory = ref({ name: '' })

    const fetchCategories = async () => {
      categories.value = await CategoryRepository.getAll()
    }

    const addCategory = async () => {
      await CategoryRepository.add({ name: newCategory.value.name })
      newCategory.value = { name: '' }
      fetchCategories()
    }

    const startEdit = (category) => {
      editId.value = category.id
      editCategory.value = { name: category.name }
    }

    const cancelEdit = () => {
      editId.value = null
      editCategory.value = { name: '' }
    }

    const saveEdit = async () => {
      if (editId.value != null) {
        await CategoryRepository.update(editId.value, { name: editCategory.value.name })
        cancelEdit()
        fetchCategories()
      }
    }

    const deleteCategory = async (id) => {
      await CategoryRepository.delete(id)
      fetchCategories()
    }

    onMounted(fetchCategories)

    return { categories, newCategory, addCategory, editId, editCategory, startEdit, cancelEdit, saveEdit, deleteCategory }
  }
}
</script>
