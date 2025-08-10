<template>
  <div class="container py-4">
    <CCard>
      <CCardHeader><strong>Pendapatan</strong></CCardHeader>
      <CCardBody>
        <CForm @submit.prevent="addIncome">
          <div class="row">
            <div class="col-md-6 mb-3">
              <CFormLabel for="inc_desc">Deskripsi</CFormLabel>
              <CFormInput id="inc_desc" v-model="newIncome.description" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="inc_amount">Jumlah</CFormLabel>
              <CFormInput type="number" id="inc_amount" v-model.number="newIncome.amount" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="inc_date">Tanggal</CFormLabel>
              <CFormInput type="date" id="inc_date" v-model="newIncome.date" required />
            </div>
          </div>
          <CButton type="submit" color="primary">Tambah</CButton>
        </CForm>
        <hr class="my-4" />
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Deskripsi</CTableHeaderCell>
              <CTableHeaderCell>Jumlah</CTableHeaderCell>
              <CTableHeaderCell>Tanggal</CTableHeaderCell>
              <CTableHeaderCell>Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(income, index) in incomes" :key="income.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === income.id">
                  <CFormInput v-model="editState.description" />
                </template>
                <template v-else>{{ income.description }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === income.id">
                  <CFormInput type="number" v-model.number="editState.amount" />
                </template>
                <template v-else>{{ formatPrice(income.amount) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === income.id">
                  <CFormInput type="date" v-model="editState.date" />
                </template>
                <template v-else>{{ formatDate(income.date) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === income.id">
                  <CButton color="success" size="sm" @click="saveEdit">Simpan</CButton>
                  <CButton color="secondary" size="sm" class="ms-2" @click="cancelEdit">Batal</CButton>
                </template>
                <template v-else>
                  <CButton color="warning" size="sm" @click="startEdit(income)">Edit</CButton>
                  <CButton color="danger" size="sm" class="ms-2" @click="deleteIncome(income.id)">Hapus</CButton>
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
import { incomesRepo } from '../db/repositories'
import { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'

export default {
  name: 'IncomesView',
  components: { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell },
  setup() {
    const incomes = ref([])
    const newIncome = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0,10) })
    const editId = ref(null)
    const editState = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0,10) })

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')

    const fetchAll = async () => { incomes.value = await incomesRepo.getAll() }
    const addIncome = async () => { await incomesRepo.add({ ...newIncome.value }); newIncome.value = { description: '', amount: 0, date: new Date().toISOString().slice(0,10) }; fetchAll() }
    const startEdit = (row) => { editId.value = row.id; editState.value = { description: row.description, amount: row.amount, date: row.date?.slice(0,10) || new Date().toISOString().slice(0,10) } }
    const cancelEdit = () => { editId.value = null }
    const saveEdit = async () => { if (editId.value != null) { await incomesRepo.update(editId.value, { ...editState.value }); cancelEdit(); fetchAll() } }
    const deleteIncome = async (id) => { await incomesRepo.delete(id); fetchAll() }

    onMounted(fetchAll)
    return { incomes, newIncome, editId, editState, addIncome, startEdit, cancelEdit, saveEdit, deleteIncome, formatPrice, formatDate }
  }
}
</script>


