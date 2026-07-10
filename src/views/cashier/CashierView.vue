<template>
  <ion-page>
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <ion-title class="app-hero-title" style="padding: 0;">Kasir (POS)</ion-title>
          </div>
          <p class="app-hero-subtitle" style="margin: 0;">Lakukan transaksi penjualan cepat dan pantau arus kas secara real-time.</p>
        </div>
      </ion-toolbar>
    </ion-header> 

    <ion-content class="app-content-wrap bg-light">
      <!-- Tabs Segment -->
      <div class="px-3 pt-3 mb-3">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="pos">
            <ion-label>POS / Kasir</ion-label>
          </ion-segment-button>
          <ion-segment-button value="dashboard">
            <ion-label>Monitoring</ion-label>
          </ion-segment-button>
          <ion-segment-button value="riwayat">
            <ion-label>Riwayat</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- TAB 1: POS / KASIR -->
      <div v-if="activeTab === 'pos'" class="ion-padding">

        <div class="row g-1">
          <!-- Right side: Shopping Cart -->
          <ion-col size="12" size-lg="4" class="mt-3">
            <div class="mobile-card container-padded">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0">Keranjang Belanja</h5>
                <span class="badge bg-indigo">{{ cartCount }} item</span>
              </div>

              <!-- Cart List -->
              <div v-if="cart.length === 0" class="text-center py-5 text-muted">
                <ion-icon :icon="cartOutline" style="font-size: 3rem;" class="mb-2" />
                <p>Keranjang masih kosong.</p>
              </div>

              <div v-else>
                <div class="cart-items-wrap mb-3" style="max-height: 280px; overflow-y: auto;">
                  <div v-for="item in cart" :key="item.id" class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div style="max-width: 60%;">
                      <span class="fw-semibold text-dark text-truncate d-block" style="font-size: 0.9rem;">{{ item.name }}</span>
                      <small class="text-muted">{{ formatPrice(item.price) }} x {{ item.quantity }}</small>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                      <button class="btn btn-action btn-sm warning p-1" @click="decreaseQty(item)">
                        <ion-icon :icon="removeOutline" />
                      </button>
                      <span class="px-2 text-dark fw-bold" style="font-size: 0.9rem;">{{ item.quantity }}</span>
                      <button class="btn btn-action btn-sm success p-1" @click="addToCart(item, true)">
                        <ion-icon :icon="addOutline" />
                      </button>
                      <button class="btn btn-action btn-sm danger p-1 ms-2" @click="removeFromCart(item)">
                        <ion-icon :icon="trashOutline" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Discount Selector -->
                <div class="form-section px-0 mb-3">
                  <label class="form-label d-flex justify-content-between">
                    <span>Diskon</span>
                    <strong class="text-teal">{{ discount }}%</strong>
                  </label>
                  <input type="range" class="form-range" min="0" max="50" step="5" v-model.number="discount" />
                </div>

                <!-- Notes Form -->
                <div class="form-section px-0 mb-3">
                  <label class="form-label">Catatan Pesanan</label>
                  <input type="text" class="form-control app-control" v-model="notes" placeholder="Contoh: Tanpa es, manis" />
                </div>

                <!-- Financial Calculation Summary -->
                <div class="bg-light rounded p-3 mb-3 border">
                  <div class="d-flex justify-content-between text-muted mb-1 small">
                    <span>Subtotal</span>
                    <span>{{ formatPrice(subtotal) }}</span>
                  </div>
                  <div class="d-flex justify-content-between text-muted mb-1 small" v-if="discountAmount > 0">
                    <span>Diskon ({{ discount }}%)</span>
                    <span class="text-danger">-{{ formatPrice(discountAmount) }}</span>
                  </div>
                  <div class="d-flex justify-content-between text-muted mb-2 small">
                    <span>Pajak (10%)</span>
                    <span>{{ formatPrice(tax) }}</span>
                  </div>
                  <div class="d-flex justify-content-between fw-black text-dark border-top pt-2 fs-5">
                    <span>Total</span>
                    <span class="text-indigo">{{ formatPrice(grandTotal) }}</span>
                  </div>
                </div>

                <!-- Checkout Action -->
                <button class="btn btn-action primary w-100 py-3 fw-bold fs-6" @click="openCheckout">
                  Bayar / Checkout
                </button>
              </div>
            </div>
          </ion-col>

          <!-- Left side: Products catalog -->
          <ion-col size="12" size-lg="8">
            <div class="mobile-card container-padded mb-3">
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control app-control mb-3" 
                placeholder="Cari produk..." 
              />

              <!-- Category filter chips -->
              <div class="filter-chips--mobile">
                <button 
                  type="button" 
                  class="btn btn-action btn-sm me-1"
                  :class="selectedCategory === 'all' ? 'primary' : 'light'"
                  @click="selectedCategory = 'all'"
                >
                  Semua
                </button>
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  type="button" 
                  class="btn btn-action btn-sm me-1"
                  :class="selectedCategory === cat.id ? 'primary' : 'light'"
                  @click="selectedCategory = cat.id"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Products Grid -->
            <div v-if="filteredProducts.length === 0" class="empty-state text-center py-5 mobile-card container-padded">
              <ion-icon :icon="basketOutline" style="font-size: 3rem;" class="text-muted mb-2" />
              <p class="text-muted">Tidak ada produk tersedia.</p>
            </div>

            <div v-else class="project-actions d-grid gap-2 m-2 mb-0">
              <div v-for="product in filteredProducts" :key="product.id" class="mb-2">
                <div 
                  class="mobile-card h-100 p-2 d-flex flex-column justify-content-between cursor-pointer pos-product-card"
                  :class="{ 'opacity-50': product.stock === 0 }"
                  @click="product.stock > 0 && addToCart(product)"
                >
                  <div>
                    <div class="position-relative text-center rounded-3 overflow-hidden mb-2" style="height: 100px; background: #f0edff;">
                      <img v-if="product.imageURL" :src="product.imageURL" class="w-100 h-100" style="object-fit: cover;" />
                      <div v-else class="d-flex h-100 align-items-center justify-content-center text-muted"><ion-icon :icon="basketOutline" style="font-size:2rem;" /></div>
                      <span v-if="product.stock === 0" class="badge bg-danger position-absolute top-0 start-0 m-1">Habis</span>
                      <span v-else-if="product.stock <= 5" class="badge bg-warning text-dark position-absolute top-0 start-0 m-1">Sisa {{ product.stock }}</span>
                    </div>
                    <div class="px-1 text-start">
                      <h6 class="fw-bold text-dark mb-1 text-truncate" :title="product.name">{{ product.name }}</h6>
                      <span class="text-muted small d-block mb-1">{{ getCategoryName(product.categoryId) }}</span>
                    </div>
                  </div>
                  <div class="px-1 d-flex justify-content-between align-items-center mt-auto">
                    <span class="text-indigo fw-bold" style="font-size: 0.85rem;">{{ formatPrice(product.price) }}</span>
                    <button class="btn btn-action success btn-sm p-1 d-flex align-items-center" :disabled="product.stock === 0">
                      <ion-icon :icon="addOutline" style="font-size: 1rem;" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ion-col>

        </div>
      </div>

      <!-- TAB 2: MONITORING / DASHBOARD -->
      <div v-if="activeTab === 'dashboard'" class="ion-padding">
        <!-- Dashboard Metrics KPI Card -->
        <div class="row g-2 mb-4">
          <div class="col-6 col-md-3">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Penjualan Hari Ini</small>
              <div class="fs-4 fw-black text-indigo mt-1">{{ formatPrice(kpiMetrics.salesToday) }}</div>
              <small class="text-muted small mt-1 d-block">{{ kpiMetrics.countToday }} Transaksi</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Pendapatan Bulan Ini</small>
              <div class="fs-4 fw-black text-teal mt-1">{{ formatPrice(kpiMetrics.salesMonth) }}</div>
              <small class="text-muted small mt-1 d-block">{{ kpiMetrics.countMonth }} Transaksi</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Transaksi Total</small>
              <div class="fs-4 fw-black text-amber mt-1">{{ salesHistory.length }}</div>
              <small class="text-muted small mt-1 d-block">Seluruh transaksi</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="mobile-card p-3 h-100">
              <small class="text-muted d-block">Rata-rata Keranjang</small>
              <div class="fs-4 fw-black text-primary mt-1">{{ formatPrice(kpiMetrics.avgBasket) }}</div>
              <small class="text-muted small mt-1 d-block">Per transaksi</small>
            </div>
          </div>
        </div>

        <!-- Sales Trend Chart -->
        <div class="mobile-card p-3 mb-4">
          <h6 class="fw-bold text-dark mb-3">Grafik Penjualan 7 Hari Terakhir</h6>
          <div v-if="chartSeries[0].data.length > 0">
            <VueApexCharts type="area" height="260" :options="chartOptions" :series="chartSeries" />
          </div>
          <div v-else class="text-center py-4 text-muted">
            Belum ada data penjualan 7 hari terakhir.
          </div>
        </div>

        <!-- Top Selling Products -->
        <div class="mobile-card p-3 mb-4">
          <h6 class="fw-bold text-dark mb-3">Produk Terlaris</h6>
          <div v-if="topProducts.length === 0" class="text-center py-3 text-muted">
            Belum ada data produk terjual.
          </div>
          <div v-else class="list-group list-group-flush">
            <div v-for="(p, index) in topProducts" :key="index" class="list-group-item d-flex justify-content-between align-items-center py-2 px-1">
              <div>
                <span class="fw-black text-indigo me-2">#{{ index + 1 }}</span>
                <span class="text-dark fw-bold">{{ p.name }}</span>
              </div>
              <div class="text-end">
                <span class="badge bg-success me-2">{{ p.qtySold }} terjual</span>
                <span class="fw-semibold text-muted">{{ formatPrice(p.revenue) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: RIWAYAT TRANSAKSI -->
      <div v-if="activeTab === 'riwayat'" class="ion-padding">
        <!-- Actions & Export -->
        <div class="d-flex justify-content-between align-items-center mb-3 px-1">
          <h6 class="fw-bold text-dark mb-0">Daftar Transaksi</h6>
          <button class="btn btn-action success btn-sm" @click="exportExcel">
            <ion-icon :icon="downloadOutline" class="me-1" /> Export Excel
          </button>
        </div>

        <div v-if="salesHistory.length === 0" class="text-center py-5 text-muted mobile-card">
          <ion-icon :icon="calendarOutline" style="font-size: 3rem;" class="mb-2" />
          <p>Belum ada riwayat transaksi penjualan.</p>
        </div>

        <!-- Transaction Cards -->
        <div v-else>
          <div 
            v-for="sale in salesHistory" 
            :key="sale.id" 
            class="mobile-card p-3 mb-3 border-start border-4 border-teal"
          >
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge bg-indigo mb-1 me-1">INV-{{ sale.id }}</span>
                <span class="badge bg-secondary mb-1">{{ formatPaymentMethod(sale.paymentMethod) }}</span>
                <h6 class="fw-bold text-dark mb-0">{{ formatDateTime(sale.createdAt) }}</h6>
              </div>
              <div class="d-flex gap-1">
                <button class="btn btn-light btn-sm text-primary" @click="openReceipt(sale)" title="Lihat Struk">
                  <ion-icon :icon="documentTextOutline" /> Detail
                </button>
                <button class="btn btn-light btn-sm text-danger" @click="confirmDeleteSale(sale.id)" title="Hapus">
                  <ion-icon :icon="trashOutline" />
                </button>
              </div>
            </div>

            <div class="mt-2 text-muted small">
              <strong>Item:</strong>
              <div v-for="(item, idx) in sale.items" :key="idx" class="d-flex justify-content-between">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>{{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>

            <div class="d-flex justify-content-between fw-bold text-dark border-top pt-2 mt-2" style="font-size: 0.95rem;">
              <span>Total Akhir:</span>
              <span class="text-indigo">{{ formatPrice(sale.totalAmount) }}</span>
            </div>

            <div v-if="sale.notes" class="mt-2 p-2 bg-light rounded text-muted" style="font-size: 0.8rem; font-style: italic;">
              "{{ sale.notes }}"
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- CHECKOUT PAYMENT MODAL -->
    <ion-modal ref="checkoutModal" :is-open="checkoutModalVisible" @didDismiss="checkoutModalVisible = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Pembayaran POS</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="checkoutModalVisible = false">Batal</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding bg-light">
        <div class="mobile-card p-3 mb-4">
          <div class="text-center py-3">
            <small class="text-muted d-block">TOTAL PEMBAYARAN</small>
            <div class="fs-2 fw-black text-indigo">{{ formatPrice(grandTotal) }}</div>
          </div>
        </div>

        <div class="mobile-card p-3 mb-4">
          <h6 class="fw-bold text-dark mb-3">Metode Pembayaran</h6>
          <div class="d-flex gap-2 mb-4">
            <button 
              type="button" 
              class="btn flex-fill btn-outline-teal"
              :class="{ 'active': paymentMethod === 'cash' }"
              @click="paymentMethod = 'cash'; amountPaid = grandTotal"
            >Tunai</button>
            <button 
              type="button" 
              class="btn flex-fill btn-outline-teal"
              :class="{ 'active': paymentMethod === 'qris' }"
              @click="paymentMethod = 'qris'; amountPaid = grandTotal"
            >QRIS / E-Wallet</button>
            <button 
              type="button" 
              class="btn flex-fill btn-outline-teal"
              :class="{ 'active': paymentMethod === 'card' }"
              @click="paymentMethod = 'card'; amountPaid = grandTotal"
            >Debit/Kartu</button>
          </div>

          <div v-if="paymentMethod === 'cash'">
            <div class="form-section px-0 mb-3">
              <label class="form-label">Uang Diterima (Tunai)</label>
              <input type="number" class="form-control app-control fs-4 fw-bold text-dark" v-model.number="amountPaid" />
            </div>

            <!-- Quick Cash Buttons -->
            <div class="d-flex flex-wrap gap-2 mb-3">
              <button type="button" class="btn btn-light btn-sm border" @click="amountPaid = grandTotal">Pas</button>
              <button type="button" class="btn btn-light btn-sm border" @click="addQuickCash(10000)">+10k</button>
              <button type="button" class="btn btn-light btn-sm border" @click="addQuickCash(20000)">+20k</button>
              <button type="button" class="btn btn-light btn-sm border" @click="amountPaid = 50000">50k</button>
              <button type="button" class="btn btn-light btn-sm border" @click="amountPaid = 100000">100k</button>
            </div>

            <!-- Change display -->
            <div class="d-flex justify-content-between align-items-center p-3 rounded" :class="changeAmount >= 0 ? 'bg-success-light' : 'bg-danger-light'">
              <span class="fw-semibold text-dark">Kembalian:</span>
              <span class="fs-4 fw-black" :class="changeAmount >= 0 ? 'text-success' : 'text-danger'">
                {{ changeAmount >= 0 ? formatPrice(changeAmount) : 'Kurang ' + formatPrice(Math.abs(changeAmount)) }}
              </span>
            </div>
          </div>

          <div v-else class="alert-info-box mt-2">
            <div class="d-flex gap-2">
              <span>💳</span>
              <div style="font-size: 0.78rem; color: #1e40af; line-height: 1.45;">
                <strong>QRIS atau Kartu:</strong> Nominal pembayaran akan disamakan secara otomatis sesuai tagihan ({{ formatPrice(grandTotal) }}). Pastikan pembayaran eksternal telah berhasil sebelum menekan tombol Selesai.
              </div>
            </div>
          </div>
        </div>

        <div class="p-3">
          <button 
            class="btn btn-action primary w-100 py-3 fw-bold fs-6" 
            :disabled="amountPaid < grandTotal" 
            @click="completeCheckout"
          >
            Selesaikan Transaksi
          </button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- DETAILED RECEIPT / STRUK MODAL -->
    <ion-modal ref="receiptModal" :is-open="receiptModalVisible" @didDismiss="receiptModalVisible = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Struk Penjualan</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="receiptModalVisible = false">Tutup</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding bg-light">
        <div v-if="activeSale" class="receipt-box-card mobile-card p-4 mx-2">
          <!-- Receipt Print Header -->
          <div class="text-center border-bottom pb-3 mb-3">
            <h4 class="fw-black mb-1 text-dark">SME Marketplace</h4>
            <p class="text-muted small mb-0">Jl. Pembangunan No. 12, Jakarta</p>
            <p class="text-muted small">Telp: 0812-3456-7890</p>
            <div class="badge bg-indigo mt-1">INV-{{ activeSale.id }}</div>
          </div>

          <!-- Invoice Details -->
          <div class="mb-3 small text-dark">
            <div class="d-flex justify-content-between mb-1">
              <span>Tanggal:</span>
              <span class="fw-semibold">{{ formatDateTime(activeSale.createdAt) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Metode:</span>
              <span class="fw-semibold">{{ formatPaymentMethod(activeSale.paymentMethod) }}</span>
            </div>
          </div>

          <!-- Items list -->
          <div class="border-bottom pb-2 mb-3">
            <div v-for="item in activeSale.items" :key="item.productId" class="d-flex justify-content-between py-1 text-dark" style="font-size: 0.9rem;">
              <div>
                <span class="fw-bold">{{ item.name }}</span>
                <div class="text-muted small">{{ formatPrice(item.price) }} x {{ item.quantity }}</div>
              </div>
              <span class="fw-semibold">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>

          <!-- Calculation -->
          <div class="mb-3 text-dark" style="font-size: 0.92rem;">
            <div class="d-flex justify-content-between mb-1">
              <span>Subtotal:</span>
              <span>{{ formatPrice(activeSale.subtotal || getSaleSubtotal(activeSale)) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-1 text-danger" v-if="activeSale.discountAmount > 0 || getSaleDiscount(activeSale) > 0">
              <span>Diskon ({{ activeSale.discount || 0 }}%):</span>
              <span>-{{ formatPrice(activeSale.discountAmount || getSaleDiscount(activeSale)) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Pajak (10%):</span>
              <span>{{ formatPrice(activeSale.taxAmount || getSaleTax(activeSale)) }}</span>
            </div>
            <div class="d-flex justify-content-between border-top pt-2 fw-black fs-5">
              <span>Total Akhir:</span>
              <span class="text-indigo">{{ formatPrice(activeSale.totalAmount) }}</span>
            </div>
            <div class="d-flex justify-content-between text-muted mt-2 small">
              <span>Bayar:</span>
              <span>{{ formatPrice(activeSale.amountPaid) }}</span>
            </div>
            <div class="d-flex justify-content-between text-muted small">
              <span>Kembali:</span>
              <span>{{ formatPrice(activeSale.changeAmount) }}</span>
            </div>
          </div>

          <div v-if="activeSale.notes" class="alert-info-box mb-3 py-2 px-3">
            <small class="d-block text-muted">Catatan:</small>
            <span class="text-dark small">"{{ activeSale.notes }}"</span>
          </div>

          <!-- Footer -->
          <div class="text-center pt-3 border-top text-muted small">
            <p class="mb-0 fw-semibold">Terima Kasih atas Kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
          </div>
        </div>

        <div class="px-2 pb-4">
          <button class="btn btn-action primary w-100 py-3 fw-bold" @click="printReceipt">
            <ion-icon :icon="printOutline" class="me-2" /> Cetak Struk
          </button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Hapus Sale Alert -->
    <ion-alert
      :is-open="deleteSaleId !== null"
      header="Hapus Transaksi"
      message="Apakah Anda yakin ingin menghapus catatan transaksi ini? Stok tidak akan dikembalikan otomatis."
      :buttons="[
        { text: 'Batal', role: 'cancel', handler: () => { deleteSaleId = null } },
        { text: 'Hapus', role: 'destructive', handler: () => { deleteSale() } }
      ]"
      @didDismiss="deleteSaleId = null"
    />

    <!-- Hidden Receipt Print Div -->
    <div id="print-section" class="d-none">
      <div v-if="activeSale" style="font-family: monospace; width: 300px; padding: 20px; color: black; background: white; font-size: 12px; line-height: 1.4;">
        <div style="text-align: center; border-bottom: 1px dashed black; padding-bottom: 10px; margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px; font-size: 16px;">SME MARKETPLACE</h3>
          <p style="margin: 0;">Jl. Pembangunan No. 12, Jakarta</p>
          <p style="margin: 0;">Telp: 0812-3456-7890</p>
          <p style="margin: 5px 0 0;">INV-{{ activeSale.id }}</p>
        </div>

        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Tgl:</span>
            <span>{{ formatDateTime(activeSale.createdAt) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Kasir:</span>
            <span>Administrator</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Cara Bayar:</span>
            <span>{{ formatPaymentMethod(activeSale.paymentMethod) }}</span>
          </div>
        </div>

        <div style="border-bottom: 1px dashed black; padding-bottom: 10px; margin-bottom: 10px;">
          <div v-for="item in activeSale.items" :key="item.productId" style="margin-bottom: 8px;">
            <div style="font-weight: bold;">{{ item.name }}</div>
            <div style="display: flex; justify-content: space-between;">
              <span>{{ formatPrice(item.price) }} x{{ item.quantity }}</span>
              <span>{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <div style="border-bottom: 1px dashed black; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>{{ formatPrice(activeSale.subtotal || getSaleSubtotal(activeSale)) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: red;" v-if="activeSale.discountAmount > 0 || getSaleDiscount(activeSale) > 0">
            <span>Diskon ({{ activeSale.discount || 0 }}%):</span>
            <span>-{{ formatPrice(activeSale.discountAmount || getSaleDiscount(activeSale)) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Pajak (10%):</span>
            <span>{{ formatPrice(activeSale.taxAmount || getSaleTax(activeSale)) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px;">
            <span>TOTAL:</span>
            <span>{{ formatPrice(activeSale.totalAmount) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 5px;">
            <span>Bayar:</span>
            <span>{{ formatPrice(activeSale.amountPaid) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Kembali:</span>
            <span>{{ formatPrice(activeSale.changeAmount) }}</span>
          </div>
        </div>

        <div v-if="activeSale.notes" style="margin-bottom: 10px; font-style: italic; border-bottom: 1px dashed black; padding-bottom: 5px;">
          Catatan: "{{ activeSale.notes }}"
        </div>

        <div style="text-align: center;">
          <p style="margin: 0; font-weight: bold;">Terima Kasih!</p>
          <p style="margin: 0;">Barang yang sudah dibeli tidak dapat ditukar.</p>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script>
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { ProductRepository, CategoryRepository, salesRepo, stockMutationsRepo } from '../../db/repositories'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonButtons, IonBackButton, IonModal, IonAlert, toastController } from '@ionic/vue';
import { addOutline, removeOutline, trashOutline, cartOutline, basketOutline, printOutline, downloadOutline, calendarOutline, documentTextOutline } from 'ionicons/icons';
import { readProductImage } from '../../composables/useProductImage';
import * as XLSX from 'xlsx';

const VueApexCharts = defineAsyncComponent(() => import("vue3-apexcharts"));

export default {
  name: 'CashierView',
  components: { 
    IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, 
    IonSegment, IonSegmentButton, IonLabel, IonButtons, IonBackButton, IonModal, IonAlert, VueApexCharts 
  },
  setup() {
    const activeTab = ref('pos')
    const products = ref([])
    const categories = ref([])
    const salesHistory = ref([])
    
    // POS/Cart states
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const cart = ref([])
    const discount = ref(0)
    const notes = ref('')

    // Checkout modal states
    const checkoutModalVisible = ref(false)
    const paymentMethod = ref('cash')
    const amountPaid = ref(0)

    // Detailed receipt modal states
    const receiptModalVisible = ref(false)
    const activeSale = ref(null)
    const deleteSaleId = ref(null)

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

    const getCategoryName = (catId) => {
      const cat = categories.value.find(c => c.id === catId)
      return cat ? cat.name : 'Lainnya'
    }

    const loadData = async () => {
      categories.value = await CategoryRepository.getAll()
      const data = await ProductRepository.getAll()
      await Promise.all(data.map(async (p) => {
        if (p.image) {
          p.imageURL = await readProductImage(p.image)
        } else {
          p.imageURL = null
        }
      }))
      products.value = data
      salesHistory.value = (await salesRepo.getAll()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    onMounted(loadData)

    // POS Products Filter
    const filteredProducts = computed(() => {
      return products.value.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = selectedCategory.value === 'all' || p.categoryId === selectedCategory.value
        return matchesSearch && matchesCategory
      })
    })

    // Cart Calculations
    const cartCount = computed(() => cart.value.reduce((total, item) => total + item.quantity, 0))
    const subtotal = computed(() => cart.value.reduce((total, item) => total + (item.price * item.quantity), 0))
    const discountAmount = computed(() => Math.round((subtotal.value * discount.value) / 100))
    const tax = computed(() => Math.round((subtotal.value - discountAmount.value) * 0.1))
    const grandTotal = computed(() => subtotal.value - discountAmount.value + tax.value)
    const changeAmount = computed(() => amountPaid.value - grandTotal.value)

    const showToast = async (msg, color = 'success') => {
      const toast = await toastController.create({
        message: msg,
        duration: 2000,
        color: color,
        position: 'top'
      })
      await toast.present()
    }

    const addToCart = (product, isIncreaseOnly = false) => {
      const existing = cart.value.find(item => item.id === product.id)
      const currentQty = existing ? existing.quantity : 0
      
      if (currentQty + 1 > product.stock) {
        showToast(`Stok tidak mencukupi! Hanya tersedia ${product.stock} unit.`, 'warning')
        return
      }

      if (existing) {
        existing.quantity++
      } else {
        cart.value.push({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          quantity: 1
        })
      }
    }

    const decreaseQty = (item) => {
      const existing = cart.value.find(c => c.id === item.id)
      if (existing) {
        existing.quantity--
        if (existing.quantity <= 0) {
          removeFromCart(item)
        }
      }
    }

    const removeFromCart = (item) => {
      cart.value = cart.value.filter(c => c.id !== item.id)
    }

    const openCheckout = () => {
      paymentMethod.value = 'cash'
      amountPaid.value = grandTotal.value
      checkoutModalVisible.value = true
    }

    const addQuickCash = (amt) => {
      amountPaid.value += amt
    }

    const completeCheckout = async () => {
      if (amountPaid.value < grandTotal.value) {
        showToast('Jumlah uang dibayarkan kurang!', 'danger')
        return
      }

      // Check stock once more
      for (const item of cart.value) {
        const prod = await ProductRepository.getById(item.id)
        if (!prod || prod.stock < item.quantity) {
          showToast(`Stok ${item.name} tidak mencukupi untuk diselesaikan!`, 'danger')
          return
        }
      }

      // Save transaction first
      const saleRecord = {
        items: cart.value.map(c => ({
          productId: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity
        })),
        subtotal: subtotal.value,
        discount: discount.value,
        discountAmount: discountAmount.value,
        taxAmount: tax.value,
        totalAmount: grandTotal.value,
        paymentMethod: paymentMethod.value,
        amountPaid: amountPaid.value,
        changeAmount: changeAmount.value,
        notes: notes.value
      }

      const savedSale = await salesRepo.add(saleRecord)
      activeSale.value = savedSale

      // Deduct stock and log mutation
      for (const item of cart.value) {
        const prod = await ProductRepository.getById(item.id)
        const newStock = prod.stock - item.quantity
        await ProductRepository.update(item.id, { ...prod, stock: newStock })

        await stockMutationsRepo.add({
          productId: item.id,
          type: 'sale',
          changeQuantity: -item.quantity,
          beforeStock: prod.stock,
          afterStock: newStock,
          notes: `Penjualan POS INV-${savedSale.id}`
        })
      }

      // Clear POS cart states
      cart.value = []
      discount.value = 0
      notes.value = ''
      amountPaid.value = 0

      checkoutModalVisible.value = false
      await loadData()
      showToast('Transaksi berhasil disimpan!', 'success')
      
      // Auto open receipt printed
      receiptModalVisible.value = true
    }

    const openReceipt = (sale) => {
      activeSale.value = sale
      receiptModalVisible.value = true
    }

    const getSaleSubtotal = (sale) => sale.subtotal || sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const getSaleDiscount = (sale) => sale.discountAmount || Math.round((getSaleSubtotal(sale) * (sale.discount || 0)) / 100)
    const getSaleTax = (sale) => sale.taxAmount || Math.round((getSaleSubtotal(sale) - getSaleDiscount(sale)) * 0.1)

    const printReceipt = () => {
      // Show hidden print div for printing, run print, then hide it
      const printSection = document.getElementById('print-section')
      if (printSection) {
        const originalContent = document.body.innerHTML
        const printContent = printSection.innerHTML
        
        // We can open a small popup window and print to avoid breaking vue instance
        const popupWin = window.open('', '_blank', 'width=350,height=600')
        popupWin.document.open()
        popupWin.document.write(`
          <html>
            <head>
              <title>Print Receipt</title>
              <style>
                body { margin: 0; padding: 20px; font-family: monospace; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body onload="window.print();window.close();">
              ${printContent}
            </body>
          </html>
        `)
        popupWin.document.close()
      }
    }

    const confirmDeleteSale = (id) => {
      deleteSaleId.value = id
    }

    const deleteSale = async () => {
      if (deleteSaleId.value !== null) {
        await salesRepo.delete(deleteSaleId.value)
        showToast('Transaksi penjualan berhasil dihapus!', 'success')
        deleteSaleId.value = null
        await loadData()
      }
    }

    const formatPaymentMethod = (method) => {
      if (method === 'cash') return 'Tunai'
      if (method === 'qris') return 'QRIS'
      if (method === 'card') return 'Debit/Kartu'
      return method
    }

    const formatDateTime = (isoString) => {
      if (!isoString) return ''
      const date = new Date(isoString)
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    // Monitoring KPI Analytics Computations
    const kpiMetrics = computed(() => {
      const todayStr = new Date().toISOString().split('T')[0]
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const todaySales = salesHistory.value.filter(s => s.createdAt.startsWith(todayStr))
      const monthSales = salesHistory.value.filter(s => {
        const d = new Date(s.createdAt)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })

      const salesTodaySum = todaySales.reduce((sum, s) => sum + s.totalAmount, 0)
      const salesMonthSum = monthSales.reduce((sum, s) => sum + s.totalAmount, 0)

      const totalRevenue = salesHistory.value.reduce((sum, s) => sum + s.totalAmount, 0)
      const avgBasketVal = salesHistory.value.length > 0 ? Math.round(totalRevenue / salesHistory.value.length) : 0

      return {
        salesToday: salesTodaySum,
        countToday: todaySales.length,
        salesMonth: salesMonthSum,
        countMonth: monthSales.length,
        avgBasket: avgBasketVal
      }
    })

    // Top Selling Products Calculation
    const topProducts = computed(() => {
      const map = {}
      salesHistory.value.forEach(sale => {
        sale.items.forEach(item => {
          if (!map[item.name]) {
            map[item.name] = { name: item.name, qtySold: 0, revenue: 0 }
          }
          map[item.name].qtySold += item.quantity
          map[item.name].revenue += item.price * item.quantity
        })
      })

      return Object.values(map)
        .sort((a, b) => b.qtySold - a.qtySold)
        .slice(0, 5)
    })

    // Trend Chart Options and Data
    const chartSeries = computed(() => {
      // Daily revenue for last 7 days
      const seriesData = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        
        const daySales = salesHistory.value.filter(s => s.createdAt.startsWith(dateStr))
        const dayTotal = daySales.reduce((sum, s) => sum + s.totalAmount, 0)
        
        seriesData.push(dayTotal)
      }

      return [{
        name: 'Omset Penjualan',
        data: seriesData
      }]
    })

    const chartOptions = computed(() => {
      const categoriesData = []
      const today = new Date()

      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        categoriesData.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }))
      }

      return {
        chart: {
          id: 'sales-trend',
          toolbar: { show: false },
          sparkline: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3, colors: ['#6366f1'] },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 90, 100]
          }
        },
        xaxis: {
          categories: categoriesData,
          labels: { style: { colors: '#64748b', fontWeight: 600 } }
        },
        yaxis: {
          labels: {
            formatter: (val) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(val),
            style: { colors: '#64748b', fontWeight: 600 }
          }
        },
        tooltip: {
          y: {
            formatter: (val) => formatPrice(val)
          }
        },
        colors: ['#6366f1']
      }
    })

    // Export Sales History report to Excel
    const exportExcel = () => {
      if (salesHistory.value.length === 0) {
        showToast('Tidak ada data transaksi untuk diekspor!', 'warning')
        return
      }

      const rows = []
      salesHistory.value.forEach(sale => {
        sale.items.forEach(item => {
          rows.push({
            'ID Transaksi': 'INV-' + sale.id,
            'Tanggal': formatDateTime(sale.createdAt),
            'Cara Bayar': formatPaymentMethod(sale.paymentMethod),
            'Nama Produk': item.name,
            'Harga Satuan': item.price,
            'Jumlah': item.quantity,
            'Subtotal Item': item.price * item.quantity,
            'Diskon Transaksi (%)': sale.discount || 0,
            'Diskon Transaksi (IDR)': sale.discountAmount || 0,
            'Pajak Transaksi (10%)': sale.taxAmount || 0,
            'Total Akhir Transaksi': sale.totalAmount,
            'Uang Diterima': sale.amountPaid,
            'Uang Kembalian': sale.changeAmount,
            'Catatan': sale.notes || ''
          })
        })
      })

      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Penjualan_Kasir')

      // Set columns widths
      const max_width = rows.reduce((w, r) => Math.max(w, Object.keys(r).length), 10)
      worksheet['!cols'] = Array(max_width).fill({ wch: 18 })

      XLSX.writeFile(workbook, `Laporan_Kasir_SME_${new Date().toISOString().split('T')[0]}.xlsx`)
      showToast('Laporan Excel berhasil diunduh!', 'success')
    }

    return {
      activeTab,
      products,
      categories,
      salesHistory,
      searchQuery,
      selectedCategory,
      cart,
      discount,
      notes,
      checkoutModalVisible,
      paymentMethod,
      amountPaid,
      receiptModalVisible,
      activeSale,
      deleteSaleId,
      formatPrice,
      getCategoryName,
      filteredProducts,
      cartCount,
      subtotal,
      discountAmount,
      tax,
      grandTotal,
      changeAmount,
      addToCart,
      decreaseQty,
      removeFromCart,
      openCheckout,
      addQuickCash,
      completeCheckout,
      openReceipt,
      getSaleSubtotal,
      getSaleDiscount,
      getSaleTax,
      printReceipt,
      confirmDeleteSale,
      deleteSale,
      formatPaymentMethod,
      formatDateTime,
      kpiMetrics,
      topProducts,
      chartSeries,
      chartOptions,
      exportExcel,
      addOutline,
      removeOutline,
      trashOutline,
      cartOutline,
      basketOutline,
      printOutline,
      downloadOutline,
      calendarOutline,
      documentTextOutline
    }
  }
}
</script>

<style scoped>
.pos-product-card {
  transition: transform 0.15s ease;
}
.pos-product-card:active {
  transform: scale(0.96);
}
.sticky-cart {
  position: sticky;
  top: 15px;
}
.bg-success-light {
  background-color: #d1e7dd !important;
}
.bg-danger-light {
  background-color: #f8d7da !important;
}
.text-success {
  color: #0f5132 !important;
}
.text-danger {
  color: #842029 !important;
}
.receipt-box-card {
  font-family: 'Courier New', Courier, monospace;
}
</style>
