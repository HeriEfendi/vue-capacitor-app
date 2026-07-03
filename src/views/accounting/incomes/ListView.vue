<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="m-0">Daftar Pendapatan</h5>
      <CButton color="primary" @click="$router.push('/incomes/create')">Tambah Pendapatan</CButton>
    </div>
    <CCard>
      <CCardBody>
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Deskripsi</th>
              <th>Jumlah</th>
              <th>Tanggal</th>
              <th class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(income, index) in incomes" :key="income.id">
              <td>{{ index + 1 }}</td>
              <td><span class="fw-semibold text-dark">{{ income.description }}</span></td>
              <td><span class="badge bg-success-subtle text-success">{{ formatPrice(income.amount) }}</span></td>
              <td class="text-secondary">{{ formatDate(income.date) }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" @click="$router.push(`/incomes/${income.id}/edit`)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="onDelete(income.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </CCardBody>
    </CCard>
  </div>
  </template>

<script>
import { onMounted, ref } from 'vue'
import { incomesRepo } from '../../../db/repositories'
import { CButton, CCard, CCardBody } from '@coreui/vue'

export default {
  name: 'AccountingIncomesListView',
  components: { CButton, CCard, CCardBody },
  setup() {
    const incomes = ref([])
    const fetchAll = async () => { incomes.value = await incomesRepo.getAll() }
    const onDelete = async (id) => { await incomesRepo.delete(id); fetchAll() }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID')
    onMounted(fetchAll)
    return { incomes, onDelete, formatPrice, formatDate }
  }
}
</script>


