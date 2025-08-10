<template>
  <div class="container py-4">
    <CCard>
      <CCardHeader><strong>Pengeluaran</strong></CCardHeader>
      <CCardBody>
        <CForm @submit.prevent="addExpense">
          <div class="row">
            <div class="col-md-4 mb-3">
              <CFormLabel for="exp_desc">Deskripsi</CFormLabel>
              <CFormInput id="exp_desc" v-model="newExpense.description" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="exp_amount">Jumlah</CFormLabel>
              <CFormInput type="number" id="exp_amount" v-model.number="newExpense.amount" required />
            </div>
            <div class="col-md-3 mb-3">
              <CFormLabel for="exp_date">Tanggal</CFormLabel>
              <CFormInput type="date" id="exp_date" v-model="newExpense.date" required />
            </div>
            <div class="col-md-2 mb-3">
              <CFormLabel for="exp_type">Kategori</CFormLabel>
              <CFormInput id="exp_type" v-model="newExpense.category" required />
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
              <CTableHeaderCell>Kategori</CTableHeaderCell>
              <CTableHeaderCell>Aksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(expense, index) in expenses" :key="expense.id">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === expense.id">
                  <CFormInput v-model="editState.description" />
                </template>
                <template v-else>{{ expense.description }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === expense.id">
                  <CFormInput type="number" v-model.number="editState.amount" />
                </template>
                <template v-else>{{ formatPrice(expense.amount) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === expense.id">
                  <CFormInput type="date" v-model="editState.date" />
                </template>
                <template v-else>{{ formatDate(expense.date) }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === expense.id">
                  <CFormInput v-model="editState.category" />
                </template>
                <template v-else>{{ expense.category }}</template>
              </CTableDataCell>
              <CTableDataCell>
                <template v-if="editId === expense.id">
                  <CButton color="success" size="sm" @click="saveEdit">Simpan</CButton>
                  <CButton color="secondary" size="sm" class="ms-2" @click="cancelEdit">Batal</CButton>
                </template>
                <template v-else>
                  <CButton color="warning" size="sm" @click="startEdit(expense)">Edit</CButton>
                  <CButton color="danger" size="sm" class="ms-2" @click="deleteExpense(expense.id)">Hapus</CButton>
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
import { expensesRepo } from '../db/repositories'
import { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/vue'

export default {
  name: 'ExpensesView',
  components: { CCard, CCardHeader, CCardBody, CForm, CFormInput, CFormLabel, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell },
  setup() {
    const expenses = ref([])
    const newExpense = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0,10), category: '' })
    const editId = ref(null)
    const editState = ref({ description: '', amount: 0, date: new Date().toISOString().slice(0,10), category: '' })

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')

    const fetchAll = async () => {
      expenses.value = await expensesRepo.getAll()
    }

    const addExpense = async () => {
      await expensesRepo.add({ ...newExpense.value })
      newExpense.value = { description: '', amount: 0, date: new Date().toISOString().slice(0,10), category: '' }
      fetchAll()
    }

    const startEdit = (exp) => {
      editId.value = exp.id
      editState.value = { description: exp.description, amount: exp.amount, date: exp.date?.slice(0,10) || new Date().toISOString().slice(0,10), category: exp.category }
    }
    const cancelEdit = () => { editId.value = null }
    const saveEdit = async () => {
      if (editId.value != null) {
        await expensesRepo.update(editId.value, { ...editState.value })
        cancelEdit(); fetchAll()
      }
    }
    const deleteExpense = async (id) => { await expensesRepo.delete(id); fetchAll() }

    onMounted(fetchAll)
    return { expenses, newExpense, editId, editState, addExpense, startEdit, cancelEdit, saveEdit, deleteExpense, formatPrice, formatDate }
  }
}
</script>


