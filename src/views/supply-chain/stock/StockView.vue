<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" />
        </ion-buttons>
        <ion-title>Manajemen Stok</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap bg-light">
      <!-- Tabs Segment -->
      <div class="px-3 pt-3">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="monitoring">
            <ion-label>Monitoring Stok</ion-label>
          </ion-segment-button>
          <ion-segment-button value="mutasi">
            <ion-label>Riwayat Mutasi</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- TAB 1: MONITORING STOK -->
      <div v-if="activeTab === 'monitoring'" class="ion-padding">
        <!-- Stock Metrics Dashboard Card -->
        <div class="row g-2 mb-4">
          <div class="col-4">
            <div class="mobile-card p-3 h-100 text-center">
              <small class="text-muted d-block" style="font-size: 0.75rem;">Total Produk</small>
              <div class="fs-4 fw-black text-indigo mt-1">{{ products.length }}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="mobile-card p-3 h-100 text-center">
              <small class="text-muted d-block" style="font-size: 0.75rem;">Total Stok Item</small>
              <div class="fs-4 fw-black text-teal mt-1">{{ totalStockCount }}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="mobile-card p-3 h-100 text-center">
              <small class="text-muted d-block" style="font-size: 0.75rem;">Total Nilai Stok</small>
              <div class="fs-5 fw-black text-amber mt-1 text-truncate" :title="formatPrice(totalStockValue)">
                {{ formatPrice(totalStockValue) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="mobile-card p-3 mb-3">
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control app-control mb-3" 
            placeholder="Cari produk..." 
          />

          <!-- Quick Stock Filters -->
          <div class="filter-chips--mobile">
            <button 
              type="button" 
              class="btn btn-action btn-sm me-1"
              :class="statusFilter === 'all' ? 'primary' : 'light'"
              @click="statusFilter = 'all'"
            >
              Semua ({{ products.length }})
            </button>
            <button 
              type="button" 
              class="btn btn-action btn-sm me-1"
              :class="statusFilter === 'low' ? 'warning' : 'light'"
              @click="statusFilter = 'low'"
            >
              Stok Tipis ({{ lowStockCount }})
            </button>
            <button 
              type="button" 
              class="btn btn-action btn-sm me-1"
              :class="statusFilter === 'out' ? 'danger' : 'light'"
              @click="statusFilter = 'out'"
            >
              Habis ({{ outOfStockCount }})
            </button>
          </div>
        </div>

        <!-- Products List for stock adjustment -->
        <div v-if="filteredProducts.length === 0" class="empty-state text-center py-5 mobile-card">
          <ion-icon :icon="basketOutline" style="font-size: 3rem;" class="text-muted mb-2" />
          <p class="text-muted">Tidak ada produk yang sesuai dengan filter.</p>
        </div>

        <div v-else class="list-group">
          <div 
            v-for="prod in filteredProducts" 
            :key="prod.id" 
            class="mobile-card p-3 mb-2 cursor-pointer stock-item-card"
            @click="openAdjustment(prod)"
          >
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-3" style="max-width: 70%;">
                <div class="rounded bg-light overflow-hidden flex-shrink-0" style="width: 50px; height: 50px; display: grid; place-items: center;">
                  <img :src="prod.imageURL" :alt="prod.name" style="max-width: 100%; max-height: 100%; object-fit: cover;" />
                </div>
                <div>
                  <h6 class="fw-bold text-dark mb-1 text-truncate">{{ prod.name }}</h6>
                  <span class="badge bg-secondary mb-0" style="font-size: 0.65rem;">{{ getCategoryName(prod.categoryId) }}</span>
                </div>
              </div>

              <div class="text-end">
                <span class="text-muted small d-block mb-1">Nilai: {{ formatPrice(prod.price * prod.stock) }}</span>
                <span v-if="prod.stock === 0" class="badge bg-danger fs-6 px-3 py-1">Habis</span>
                <span v-else-if="prod.stock <= 5" class="badge bg-warning text-dark fs-6 px-3 py-1">Tipis ({{ prod.stock }})</span>
                <span v-else class="badge bg-success fs-6 px-3 py-1">Stok: {{ prod.stock }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: RIWAYAT MUTASI -->
      <div v-if="activeTab === 'mutasi'" class="ion-padding">
        <!-- Actions & Export -->
        <div class="d-flex justify-content-between align-items-center mb-3 px-1">
          <h6 class="fw-bold text-dark mb-0">Catatan Mutasi Stok</h6>
          <button class="btn btn-action success btn-sm" @click="exportExcel">
            <ion-icon :icon="downloadOutline" class="me-1" /> Export Excel
          </button>
        </div>

        <div class="mobile-card p-3 mb-3">
          <input 
            type="text" 
            v-model="historySearchQuery" 
            class="form-control app-control" 
            placeholder="Filter nama produk..." 
          />
        </div>

        <div v-if="filteredMutations.length === 0" class="empty-state text-center py-5 mobile-card">
          <ion-icon :icon="calendarOutline" style="font-size: 3rem;" class="mb-2" />
          <p>Belum ada riwayat mutasi stok.</p>
        </div>

        <!-- Mutation Logs Cards -->
        <div v-else>
          <div 
            v-for="log in filteredMutations" 
            :key="log.id" 
            class="mobile-card p-3 mb-2 border-start border-4"
            :class="getMutationBorderClass(log.changeQuantity)"
          >
            <div class="d-flex justify-content-between align-items-center mb-1">
              <div>
                <h6 class="fw-bold text-dark mb-0">{{ getProductName(log.productId) }}</h6>
                <small class="text-muted">{{ formatDateTime(log.createdAt) }}</small>
              </div>
              <div class="text-end">
                <span class="badge" :class="getMutationBadgeClass(log.changeQuantity)" style="font-size: 0.9rem;">
                  {{ log.changeQuantity > 0 ? '+' : '' }}{{ log.changeQuantity }}
                </span>
                <small class="text-muted d-block mt-1">Stok: {{ log.beforeStock }} ➜ {{ log.afterStock }}</small>
              </div>
            </div>
            <div class="text-muted small mt-2 p-2 bg-light rounded" style="font-size: 0.8rem; font-style: italic;">
              Keterangan: {{ log.notes || 'Penyesuaian stok' }}
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- ADJUST STOCK MODAL -->
    <ion-modal ref="adjustModal" :is-open="adjustModalVisible" @didDismiss="adjustModalVisible = false">
      <ion-header>
        <ion-toolbar class="header-dark">
          <ion-title>Penyesuaian Stok</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="adjustModalVisible = false">Batal</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding bg-light" v-if="selectedProduct">
        <div class="mobile-card p-3 mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded bg-light overflow-hidden" style="width: 60px; height: 60px; display: grid; place-items: center;">
              <img :src="selectedProduct.imageURL" :alt="selectedProduct.name" style="max-width: 100%; max-height: 100%; object-fit: cover;" />
            </div>
            <div>
              <h5 class="fw-bold text-dark mb-1">{{ selectedProduct.name }}</h5>
              <span class="badge bg-secondary">{{ getCategoryName(selectedProduct.categoryId) }}</span>
            </div>
          </div>
          <hr />
          <div class="d-flex justify-content-between align-items-center text-dark">
            <span>Stok Saat Ini:</span>
            <span class="fs-4 fw-black text-indigo">{{ selectedProduct.stock }} unit</span>
          </div>
        </div>

        <div class="mobile-card p-3 mb-4">
          <h6 class="fw-bold text-dark mb-3">Form Penyesuaian</h6>
          
          <div class="form-stack">
            <div class="field-group mb-3">
              <label class="field-label">Tipe Penyesuaian</label>
              <select v-model="adjustmentType" class="form-select app-control">
                <option value="add">Tambah Stok (Barang Masuk)</option>
                <option value="reduce">Kurangi Stok (Barang Keluar/Rusak)</option>
              </select>
            </div>

            <div class="field-group mb-3">
              <label class="field-label">Jumlah Unit</label>
              <input type="number" class="form-control app-control fs-4 fw-bold text-dark" v-model.number="adjustmentQty" min="1" />
            </div>

            <div class="field-group mb-3">
              <label class="field-label">Alasan</label>
              <select v-model="adjustmentReason" class="form-select app-control">
                <option v-if="adjustmentType === 'add'" value="Barang Masuk">Barang Masuk / Pembelian</option>
                <option v-if="adjustmentType === 'add'" value="Opname Stok">Kelebihan Stok (Opname)</option>
                <option v-if="adjustmentType === 'reduce'" value="Barang Rusak">Barang Rusak / Cacat</option>
                <option v-if="adjustmentType === 'reduce'" value="Kadaluarsa">Kadaluarsa</option>
                <option v-if="adjustmentType === 'reduce'" value="Penyusutan">Penyusutan / Selisih Opname</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div class="field-group mb-3">
              <label class="field-label">Catatan Tambahan (Opsional)</label>
              <input type="text" class="form-control app-control" v-model="adjustmentNotes" placeholder="Contoh: Audit stok bulanan" />
            </div>
          </div>
        </div>

        <div class="p-3">
          <button 
            class="btn btn-action primary w-100 py-3 fw-bold fs-6" 
            :disabled="adjustmentQty <= 0" 
            @click="saveAdjustment"
          >
            Simpan Penyesuaian
          </button>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ProductRepository, CategoryRepository, stockMutationsRepo } from '../../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonButtons, IonBackButton, IonModal, toastController } from '@ionic/vue';
import { basketOutline, addOutline, removeOutline, downloadOutline, calendarOutline } from 'ionicons/icons';
import * as XLSX from 'xlsx';

export default {
  name: 'StockView',
  components: {
    IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
    IonSegment, IonSegmentButton, IonLabel, IonButtons, IonBackButton, IonModal
  },
  setup() {
    const activeTab = ref('monitoring')
    const products = ref([])
    const categories = ref([])
    const mutations = ref([])

    // Filters
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const historySearchQuery = ref('')

    // Adjustment Modal
    const adjustModalVisible = ref(false)
    const selectedProduct = ref(null)
    const adjustmentType = ref('add')
    const adjustmentQty = ref(1)
    const adjustmentReason = ref('Barang Masuk')
    const adjustmentNotes = ref('')

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

    const getCategoryName = (catId) => {
      const cat = categories.value.find(c => c.id === catId)
      return cat ? cat.name : 'Lainnya'
    }

    const getProductName = (prodId) => {
      const prod = products.value.find(p => p.id === prodId)
      return prod ? prod.name : 'Produk Terhapus'
    }

    const loadData = async () => {
      categories.value = await CategoryRepository.getAll()
      const data = await ProductRepository.getAll()
      data.forEach(p => {
        if (p.image) {
          p.imageURL = typeof p.image === 'string' ? p.image : URL.createObjectURL(p.image)
        } else {
          p.imageURL = 'https://via.placeholder.com/200x150?text=No+Image'
        }
      })
      products.value = data
      mutations.value = (await stockMutationsRepo.getAll()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    onMounted(loadData)

    // Global Metrics
    const totalStockCount = computed(() => products.value.reduce((sum, p) => sum + p.stock, 0))
    const totalStockValue = computed(() => products.value.reduce((sum, p) => sum + (p.price * p.stock), 0))
    const lowStockCount = computed(() => products.value.filter(p => p.stock > 0 && p.stock <= 5).length)
    const outOfStockCount = computed(() => products.value.filter(p => p.stock === 0).length)

    // Filter products
    const filteredProducts = computed(() => {
      return products.value.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        let matchesStatus = true
        if (statusFilter.value === 'low') {
          matchesStatus = p.stock > 0 && p.stock <= 5
        } else if (statusFilter.value === 'out') {
          matchesStatus = p.stock === 0
        }
        return matchesSearch && matchesStatus
      })
    })

    // Filter mutations
    const filteredMutations = computed(() => {
      return mutations.value.filter(m => {
        const prodName = getProductName(m.productId).toLowerCase()
        return prodName.includes(historySearchQuery.value.toLowerCase())
      })
    })

    const showToast = async (msg, color = 'success') => {
      const toast = await toastController.create({
        message: msg,
        duration: 2000,
        color: color,
        position: 'top'
      })
      await toast.present()
    }

    const openAdjustment = (product) => {
      selectedProduct.value = product
      adjustmentType.value = 'add'
      adjustmentQty.value = 1
      adjustmentReason.value = 'Barang Masuk'
      adjustmentNotes.value = ''
      adjustModalVisible.value = true
    }

    const saveAdjustment = async () => {
      if (adjustmentQty.value <= 0) {
        showToast('Jumlah unit penyesuaian harus lebih dari 0!', 'danger')
        return
      }

      const prod = selectedProduct.value
      const beforeStock = prod.stock
      const changeQty = adjustmentType.value === 'add' ? adjustmentQty.value : -adjustmentQty.value
      const afterStock = beforeStock + changeQty

      if (afterStock < 0) {
        showToast('Stok akhir tidak boleh negatif!', 'danger')
        return
      }

      // Update product stock
      await ProductRepository.update(prod.id, { ...prod, stock: afterStock })

      // Log stock mutation
      await stockMutationsRepo.add({
        productId: prod.id,
        type: adjustmentType.value === 'add' ? 'addition' : 'reduction',
        changeQuantity: changeQty,
        beforeStock: beforeStock,
        afterStock: afterStock,
        notes: adjustmentReason.value + (adjustmentNotes.value ? `: ${adjustmentNotes.value}` : '')
      })

      showToast('Penyesuaian stok berhasil disimpan!', 'success')
      adjustModalVisible.value = false
      await loadData()
    }

    // Styles helper
    const getMutationBorderClass = (qty) => {
      if (qty > 0) return 'border-success'
      if (qty < 0 && Math.abs(qty) >= 10) return 'border-danger'
      return 'border-warning'
    }

    const getMutationBadgeClass = (qty) => {
      if (qty > 0) return 'bg-success'
      return 'bg-danger'
    }

    const formatDateTime = (isoString) => {
      if (!isoString) return ''
      const date = new Date(isoString)
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    // Export Excel
    const exportExcel = () => {
      if (mutations.value.length === 0) {
        showToast('Tidak ada data mutasi untuk diekspor!', 'warning')
        return
      }

      const rows = mutations.value.map(m => ({
        'Nama Produk': getProductName(m.productId),
        'Tipe Mutasi': m.changeQuantity > 0 ? 'Penambahan' : 'Pengurangan',
        'Jumlah Perubahan': m.changeQuantity,
        'Stok Sebelum': m.beforeStock,
        'Stok Sesudah': m.afterStock,
        'Tanggal Log': formatDateTime(m.createdAt),
        'Keterangan / Alasan': m.notes || ''
      }))

      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mutasi_Stok')

      worksheet['!cols'] = Array(7).fill({ wch: 18 })

      XLSX.writeFile(workbook, `Laporan_Mutasi_Stok_SME_${new Date().toISOString().split('T')[0]}.xlsx`)
      showToast('Laporan Mutasi Excel berhasil diunduh!', 'success')
    }

    return {
      activeTab,
      products,
      categories,
      mutations,
      searchQuery,
      statusFilter,
      historySearchQuery,
      adjustModalVisible,
      selectedProduct,
      adjustmentType,
      adjustmentQty,
      adjustmentReason,
      adjustmentNotes,
      formatPrice,
      getCategoryName,
      getProductName,
      totalStockCount,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      filteredProducts,
      filteredMutations,
      openAdjustment,
      saveAdjustment,
      getMutationBorderClass,
      getMutationBadgeClass,
      formatDateTime,
      exportExcel,
      basketOutline,
      addOutline,
      removeOutline,
      downloadOutline,
      calendarOutline
    }
  }
}
</script>

<style scoped>
.stock-item-card {
  transition: transform 0.15s ease;
}
.stock-item-card:active {
  transform: scale(0.98);
}
</style>
