<template>
  <div class="container py-4">
    <CCard>
      <CCardHeader><strong>Utang</strong></CCardHeader>
      <CCardBody>
        <CForm @submit.prevent="addDebt">
          <div class="row">
            <div class="col-md-3 mb-3">
              <CFormLabel for="lender">Pemberi Utang</CFormLabel>
              <CFormInput id="lender" v-model="newDebt.lender" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="amount">Jumlah</CFormLabel>
              <CFormInput type="number" id="amount" v-model.number="newDebt.amount" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="due">Jatuh Tempo</CFormLabel>
              <CFormInput type="date" id="due" v-model="newDebt.dueDate" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="status">Status</CFormLabel>
              <CFormInput id="status" v-model="newDebt.status" placeholder="Belum Lunas / Lunas" required />
            </div>
          </div>
          <CButton type="submit" color="primary">Tambah</CButton>
        </CForm>
        <hr class="my-4" />
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Pemberi</CTableHeaderCell>
              <CTableHeaderCell>Jumlah</CTableHeaderCell>
              <CTableHeaderCell>Jatuh Tempo</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(debt, index) in debts" :key="debt.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === debt.id">
                  <CFormInput v-model="editState.lender" />
                </template>
                <template v-else>{{ debt.lender }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === debt.id">
                  <CFormInput type="number" v-model.number="editState.amount" />
                </template>
                <template v-else>{{ formatPrice(debt.amount) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === debt.id">
                  <CFormInput type="date" v-model="editState.dueDate" />
                </template>
                <template v-else>{{ formatDate(debt.dueDate) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === debt.id">
                  <CFormInput v-model="editState.status" />
                </template>
                <template v-else>{{ debt.status }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === debt.id">
                  <CButton color="success" size="sm" @click="saveEdit">Simpan</CButton>
                  <CButton color="secondary" size="sm" class="ms-2" @click="cancelEdit">Batal</CButton>
                </template>
                <template v-else>
                  <CButton color="warning" size="sm" @click="startEdit(debt)">Edit</CButton>
                  <CButton color="danger" size="sm" class="ms-2" @click="deleteDebt(debt.id)">Hapus</CButton>
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
import { debtsRepo } from '../db/repositories'
import { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'

export default {
  name: 'DebtsView',
  components: { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell },
  setup() {
    const debts = ref([])
    const newDebt = ref({ lender: '', amount: 0, dueDate: new Date().toISOString().slice(0,10), status: 'Belum Lunas' })
    const editId = ref(null)
    const editState = ref({ lender: '', amount: 0, dueDate: new Date().toISOString().slice(0,10), status: 'Belum Lunas' })

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')

    const fetchAll = async () => { debts.value = await debtsRepo.getAll() }
    const addDebt = async () => { await debtsRepo.add({ ...newDebt.value }); newDebt.value = { lender: '', amount: 0, dueDate: new Date().toISOString().slice(0,10), status: 'Belum Lunas' }; fetchAll() }
    const startEdit = (row) => { editId.value = row.id; editState.value = { lender: row.lender, amount: row.amount, dueDate: row.dueDate?.slice(0,10) || new Date().toISOString().slice(0,10), status: row.status } }
    const cancelEdit = () => { editId.value = null }
    const saveEdit = async () => { if (editId.value != null) { await debtsRepo.update(editId.value, { ...editState.value }); cancelEdit(); fetchAll() } }
    const deleteDebt = async (id) => { await debtsRepo.delete(id); fetchAll() }

    onMounted(fetchAll)
    return { debts, newDebt, editId, editState, addDebt, startEdit, cancelEdit, saveEdit, deleteDebt, formatPrice, formatDate }
  }
}
</script>


