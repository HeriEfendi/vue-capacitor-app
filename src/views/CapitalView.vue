<template>
  <div class="container py-4">
    <CCard>
      <CCardHeader><strong>Modal</strong></CCardHeader>
      <CCardBody>
        <CForm @submit.prevent="addCapital">
          <div class="row">
            <div class="col-md-6 mb-3">
              <CFormLabel for="source">Sumber</CFormLabel>
              <CFormInput id="source" v-model="newCapital.source" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="amount">Jumlah</CFormLabel>
              <CFormInput type="number" id="amount" v-model.number="newCapital.amount" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="date">Tanggal</CFormLabel>
              <CFormInput type="date" id="date" v-model="newCapital.date" required />
            </div>
          </div>
          <CButton type="submit" color="primary">Tambah</CButton>
        </CForm>
        <hr class="my-4" />
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Sumber</CTableHeaderCell>
              <CTableHeaderCell>Jumlah</CTableHeaderCell>
              <CTableHeaderCell>Tanggal</CTableHeaderCell>
              <CTableHeaderCell>Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(row, index) in capitals" :key="row.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === row.id">
                  <CFormInput v-model="editState.source" />
                </template>
                <template v-else>{{ row.source }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === row.id">
                  <CFormInput type="number" v-model.number="editState.amount" />
                </template>
                <template v-else>{{ formatPrice(row.amount) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === row.id">
                  <CFormInput type="date" v-model="editState.date" />
                </template>
                <template v-else>{{ formatDate(row.date) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === row.id">
                  <CButton color="success" size="sm" @click="saveEdit">Simpan</CButton>
                  <CButton color="secondary" size="sm" class="ms-2" @click="cancelEdit">Batal</CButton>
                </template>
                <template v-else>
                  <CButton color="warning" size="sm" @click="startEdit(row)">Edit</CButton>
                  <CButton color="danger" size="sm" class="ms-2" @click="deleteCapital(row.id)">Hapus</CButton>
                </template>
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
import { capitalCostsRepo } from '../db/repositories'
import { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'

export default {
  name: 'CapitalView',
  components: { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell },
  setup() {
    const capitals = ref([])
    const newCapital = ref({ source: '', amount: 0, date: new Date().toISOString().slice(0,10) })
    const editId = ref(null)
    const editState = ref({ source: '', amount: 0, date: new Date().toISOString().slice(0,10) })

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')

    const fetchAll = async () => { capitals.value = await capitalCostsRepo.getAll() }
    const addCapital = async () => { await capitalCostsRepo.add({ ...newCapital.value }); newCapital.value = { source: '', amount: 0, date: new Date().toISOString().slice(0,10) }; fetchAll() }
    const startEdit = (row) => { editId.value = row.id; editState.value = { source: row.source, amount: row.amount, date: row.date?.slice(0,10) || new Date().toISOString().slice(0,10) } }
    const cancelEdit = () => { editId.value = null }
    const saveEdit = async () => { if (editId.value != null) { await capitalCostsRepo.update(editId.value, { ...editState.value }); cancelEdit(); fetchAll() } }
    const deleteCapital = async (id) => { await capitalCostsRepo.delete(id); fetchAll() }

    onMounted(fetchAll)
    return { capitals, newCapital, editId, editState, addCapital, startEdit, cancelEdit, saveEdit, deleteCapital, formatPrice, formatDate }
  }
}
</script>


