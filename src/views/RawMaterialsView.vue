<template>
  <CCard>
    <CCardHeader><strong>Bahan Baku</strong></CCardHeader>
    <CCardBody>
      <CForm @submit.prevent="addRawMaterial">
        <div class="mb-3">
          <CFormLabel for="name">Nama Bahan Baku</CFormLabel>
          <CFormInput type="text" id="name" v-model="newRawMaterial.name" required />
        </div>
        <div class="mb-3">
          <CFormLabel for="unit">Satuan</CFormLabel>
          <CFormInput type="text" id="unit" v-model="newRawMaterial.unit" required />
        </div>
        <div class="mb-3">
          <CFormLabel for="stock">Stok</CFormLabel>
          <CFormInput type="number" id="stock" v-model.number="newRawMaterial.stock" required />
        </div>
        <CButton type="submit" color="primary">Tambah Bahan Baku</CButton>
      </CForm>

      <hr class="my-4" />

      <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
            <CTableHeaderCell scope="col">Satuan</CTableHeaderCell>
            <CTableHeaderCell scope="col">Stok</CTableHeaderCell>
            <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="(rawMaterial, index) in rawMaterials" :key="rawMaterial.id">
            <CTableDataCell>{{ index + 1 }}</CTableDataCell>
            <CTableDataCell>
              <template v-if="editId === rawMaterial.id">
                <CFormInput v-model="editMaterial.name" />
              </template>
              <template v-else>
                {{ rawMaterial.name }}
              </template>
            </CTableDataCell>
            <CTableDataCell>
              <template v-if="editId === rawMaterial.id">
                <CFormInput v-model="editMaterial.unit" />
              </template>
              <template v-else>
                {{ rawMaterial.unit }}
              </template>
            </CTableDataCell>
            <CTableDataCell>
              <template v-if="editId === rawMaterial.id">
                <CFormInput type="number" v-model.number="editMaterial.stock" />
              </template>
              <template v-else>
                {{ rawMaterial.stock }}
              </template>
            </CTableDataCell>
            <CTableDataCell>
              <template v-if="editId === rawMaterial.id">
                <CButton color="success" size="sm" @click="saveEdit">Simpan</CButton>
                <CButton color="secondary" size="sm" class="ms-2" @click="cancelEdit">Batal</CButton>
              </template>
              <template v-else>
                <CButton color="warning" size="sm" @click="startEdit(rawMaterial)">Edit</CButton>
                <CButton color="danger" size="sm" class="ms-2" @click="deleteRawMaterial(rawMaterial.id)">Hapus</CButton>
              </template>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
</template>

<script>
import {
  CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CFormTextarea,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from '@coreui/vue'
import { RawMaterialsRepository } from '../db/repositories'
import { ref, onMounted } from 'vue'
export default {
  name: 'RawMaterialsView',
  components: {
    CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CFormTextarea,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
  },
  setup() {
    const rawMaterials = ref([])
    const newRawMaterial = ref({
      name: '',
      unit: '',
      stock: 0
    })
    const editId = ref(null)
    const editMaterial = ref({ name: '', unit: '', stock: 0 })

    const fetchRawMaterials = async () => {
      rawMaterials.value = await RawMaterialsRepository.getAll()
    }

    const addRawMaterial = async () => {
      await RawMaterialsRepository.add(newRawMaterial.value)
      newRawMaterial.value = {
        name: '',
        unit: '',
        stock: 0
      }
      fetchRawMaterials()
    }

    const startEdit = (rawMaterial) => {
      editId.value = rawMaterial.id
      editMaterial.value = { name: rawMaterial.name, unit: rawMaterial.unit, stock: rawMaterial.stock }
    }

    const cancelEdit = () => {
      editId.value = null
      editMaterial.value = { name: '', unit: '', stock: 0 }
    }

    const saveEdit = async () => {
      if (editId.value != null) {
        await RawMaterialsRepository.update(editId.value, { ...editMaterial.value })
        cancelEdit()
        fetchRawMaterials()
      }
    }

    const deleteRawMaterial = async (id) => {
      await RawMaterialsRepository.delete(id)
      fetchRawMaterials()
    }

    onMounted(() => {
      fetchRawMaterials()
    })

    return {
      rawMaterials,
      newRawMaterial,
      fetchRawMaterials,
      addRawMaterial,
      editId,
      editMaterial,
      startEdit,
      cancelEdit,
      saveEdit,
      deleteRawMaterial
    }
  }
}
</script>