<template>
  <div class="container-fluid py-4">
    <!-- ─── Row 1: Welcome Banner + Market Watch ─────────────── -->
    <div class="row g-4 mb-4">
      <!-- Welcome / Profile Summary -->
      <div class="col-12 col-md-8">
        <CCard class="h-100 overflow-hidden">
          <div class="d-flex h-100">
            <CCardBody class="d-flex flex-column justify-content-between p-4" style="flex:1">
              <div>
                <div class="text-primary fw-bold small text-uppercase mb-1">Professional Summary</div>
                <h4 class="fw-black mb-1">Ahmad Heri Efendi</h4>
                <p class="text-secondary fw-semibold mb-2">Full-Stack Web Developer (IT Programmer)</p>
                <p class="text-secondary small mb-3" style="line-height:1.7">
                  An <strong>IT Programmer</strong> with 5+ years experience in web application development, ERP software, and mobile apps with Capacitor/Android.
                </p>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span class="badge bg-danger-subtle text-danger rounded-pill"><i class="fab fa-laravel me-1"></i>Laravel</span>
                  <span class="badge bg-success-subtle text-success rounded-pill"><i class="fab fa-vuejs me-1"></i>Vue 3</span>
                  <span class="badge bg-primary-subtle text-primary rounded-pill"><i class="fas fa-database me-1"></i>MariaDB</span>
                  <span class="badge rounded-pill" style="background:#ede7f6;color:#6a1b9a"><i class="fas fa-server me-1"></i>Redis</span>
                  <span class="badge bg-warning-subtle text-warning rounded-pill"><i class="fab fa-android me-1"></i>Capacitor</span>
                </div>
              </div>
              <div>
                <router-link to="/profile" class="btn btn-primary btn-sm">
                  View Full Profile <i class="fas fa-arrow-right ms-1"></i>
                </router-link>
              </div>
            </CCardBody>
            <div class="d-none d-sm-flex align-items-end justify-content-center p-3" style="width:160px;background:linear-gradient(180deg,#e8eaf6 0%,#c5cae9 100%)">
              <img
                src="https://i.pravatar.cc/200?img=33"
                alt="Profile"
                class="rounded-circle shadow"
                width="100"
                height="100"
                style="object-fit:cover;border:3px solid white"
              />
            </div>
          </div>
        </CCard>
      </div>

      <!-- Market Watch (Live Crypto) -->
      <div class="col-12 col-md-4">
        <CCard class="h-100">
          <CCardBody class="p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold">Market Watch</span>
                <i class="fas fa-sync-alt text-primary spin-icon" :class="{spinning: loadingPrices}"></i>
              </div>
              <p class="text-secondary small mb-3">Live market data · refresh 10s</p>

              <div v-if="loadingPrices && cryptoPrices[0].price === 0" class="text-center py-4">
                <div class="spinner-border text-primary spinner-border-sm"></div>
                <div class="small text-secondary mt-2">Connecting to exchange...</div>
              </div>
              <div v-else class="d-flex flex-column gap-2">
                <div
                  v-for="coin in cryptoPrices"
                  :key="coin.symbol"
                  class="d-flex align-items-center justify-content-between p-2 rounded-3 border-dark-subtle bg-body-tertiary border"
                >
                  <div class="d-flex align-items-center gap-2">
                    <div
                      class="coin-icon rounded-circle d-flex align-items-center justify-content-center text-white"
                      :style="`background:${coin.color};width:34px;height:34px`"
                    >
                      <i :class="coin.icon" style="font-size:14px"></i>
                    </div>
                    <div>
                      <div class="fw-bold small">{{ coin.name }}</div>
                      <div class="text-secondary" style="font-size:11px">{{ coin.symbol }}</div>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold small">
                      Rp{{ coin.price ? coin.price.toLocaleString('id-ID', {minimumFractionDigits:0, maximumFractionDigits:0}) : '0' }}
                    </div>
                    <div
                      class="small fw-semibold d-flex align-items-center justify-content-end gap-1"
                      :class="coin.change >= 0 ? 'text-success' : 'text-danger'"
                    >
                      <i :class="coin.change >= 0 ? 'fas fa-trending-up' : 'fas fa-trending-down'" style="font-size:11px"></i>
                      {{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>

    <!-- ─── Row 2: Stats Cards ──────────────────────────────── -->
    <div class="row g-4 mb-4">
      <!-- Users Stats -->
      <div class="col-12 col-md-4">
        <CCard class="h-100 border-0 shadow-sm stat-card-users">
          <CCardBody class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div class="text-uppercase small fw-bold text-indigo mb-1">User Base</div>
                <div class="display-6 fw-black text-indigo">{{ usersCount }}</div>
              </div>
              <div class="stat-icon bg-indigo-light rounded-circle d-flex align-items-center justify-content-center" style="width:52px;height:52px">
                <i class="fas fa-users text-indigo fa-lg"></i>
              </div>
            </div>
            <p class="text-muted small mb-3">Total registered users stored in local storage.</p>
            <router-link to="/users" class="btn btn-sm btn-indigo text-white">Manage Users</router-link>
          </CCardBody>
        </CCard>
      </div>

      <!-- Todo Stats -->
      <div class="col-12 col-md-4">
        <CCard class="h-100 border-0 shadow-sm stat-card-todo">
          <CCardBody class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div class="text-uppercase small fw-bold text-success mb-1">To Do List</div>
                <div class="display-6 fw-black text-success">{{ todoStats.done }}<span class="fs-5 text-muted">/{{ todoStats.total }}</span></div>
              </div>
              <div class="stat-icon rounded-circle d-flex align-items-center justify-content-center" style="width:52px;height:52px;background:#e8f5e9">
                <i class="fas fa-check-double text-success fa-lg"></i>
              </div>
            </div>
            <div class="mb-2">
              <div class="d-flex justify-content-between small text-success fw-semibold mb-1">
                <span>Completion Rate</span>
                <span>{{ todoStats.rate }}%</span>
              </div>
              <div class="progress" style="height:8px;border-radius:10px">
                <div class="progress-bar bg-success" :style="`width:${todoStats.rate}%`" style="border-radius:10px"></div>
              </div>
            </div>
            <div class="d-flex justify-content-between small text-muted mb-3">
              <span>Active: {{ todoStats.inProgress + todoStats.toDo }}</span>
              <span>In Progress: {{ todoStats.inProgress }}</span>
            </div>
            <router-link to="/todo" class="btn btn-sm btn-success">Task Board</router-link>
          </CCardBody>
        </CCard>
      </div>

      <!-- UMKM / Supply Chain Quick Stats -->
      <div class="col-12 col-md-4">
        <CCard class="h-100 border-0 shadow-sm stat-card-product">
          <CCardBody class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div class="text-uppercase small fw-bold text-warning mb-1">Supply Chain</div>
                <div class="display-6 fw-black text-warning">{{ productCount }}</div>
              </div>
              <div class="stat-icon rounded-circle d-flex align-items-center justify-content-center" style="width:52px;height:52px;background:#fff8e1">
                <i class="fas fa-boxes text-warning fa-lg"></i>
              </div>
            </div>
            <p class="text-muted small mb-3">Total products & materials in inventory.</p>
            <router-link to="/products" class="btn btn-sm btn-warning text-dark">View Inventory</router-link>
          </CCardBody>
        </CCard>
      </div>
    </div>

    <!-- ─── Row 3: Urgent Tasks + Recent Users ──────────────── -->
    <div class="row g-4">
      <!-- Urgent Tasks -->
      <div class="col-12 col-md-6">
        <CCard class="h-100">
          <CCardBody class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div class="fw-bold text-dark">Urgent Pending Tasks</div>
                <div class="text-muted small">High priority tasks requiring attention</div>
              </div>
              <router-link to="/todo" class="btn btn-sm btn-outline-primary text-decoration-none">View All</router-link>
            </div>

            <div v-if="urgentTasks.length === 0" class="text-center py-4 text-muted">
              <i class="fas fa-check-circle fa-2x text-success mb-2 d-block"></i>
              No pending tasks. Great job! 🎉
            </div>
            <div v-else class="list-group list-group-flush">
              <div
                v-for="task in urgentTasks"
                :key="task.id"
                class="list-group-item list-group-item-action px-0 py-3 border-bottom"
              >
                <div class="d-flex align-items-start gap-3">
                  <div
                    class="priority-dot rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center mt-1"
                    :style="`background:${getPriorityBg(task.priority)};width:30px;height:30px`"
                  >
                    <i :class="getPriorityIcon(task.priority)" :style="`color:${getPriorityColor(task.priority)};font-size:12px`"></i>
                  </div>
                  <div class="flex-grow-1">
                    <router-link :to="`/todo/${task.id}/edit`" class="text-decoration-none fw-semibold text-primary small d-block">
                      {{ task.work_id }} - {{ task.title }}
                    </router-link>
                    <div class="text-muted" style="font-size:11px">
                      Due: {{ task.due_date || 'No date' }} · {{ task.assignee?.name || 'Unassigned' }}
                    </div>
                  </div>
                  <span
                    class="badge flex-shrink-0"
                    :class="task.status === 'IN PROGRESS' ? 'bg-warning text-dark' : 'bg-primary'"
                    style="font-size:10px"
                  >
                    {{ task.status }}
                  </span>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>

      <!-- Recent Users -->
      <div class="col-12 col-md-6">
        <CCard class="h-100">
          <CCardBody class="p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div class="fw-bold text-dark">Recent Registered Users</div>
                <div class="text-muted small">Latest members added to User Management</div>
              </div>
              <router-link to="/users" class="btn btn-sm btn-outline-primary text-decoration-none">View All</router-link>
            </div>

            <div v-if="recentUsers.length === 0" class="text-center py-4 text-muted">
              <i class="fas fa-user-slash fa-2x mb-2 d-block"></i>
              No users registered yet.
            </div>
            <table v-else class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th class="small">Avatar</th>
                  <th class="small">Name</th>
                  <th class="small">Email</th>
                  <th class="small">Joined</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in recentUsers" :key="user.id" class="align-middle">
                  <td>
                    <img
                      :src="user.avatar || `https://i.pravatar.cc/150?u=${user.email}`"
                      class="rounded-circle border"
                      width="28" height="28"
                      style="object-fit:cover"
                    />
                  </td>
                  <td class="fw-semibold small">{{ user.name }}</td>
                  <td class="text-muted small">{{ user.email }}</td>
                  <td class="small text-muted">{{ formatDate(user.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </CCardBody>
        </CCard>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { CCard, CCardBody } from '@coreui/vue'
import { UsersRepository, TodoRepository } from '../db/localStorage'
import { ProductRepository } from '../db/repositories'

export default {
  name: 'HomeView',
  components: { CCard, CCardBody },
  setup() {
    // ── Crypto Prices ────────────────────────────────────────────
    const cryptoPrices = ref([
      { symbol: 'USDIDR', name: 'USD/IDR', price: 16000, change: 0, icon: 'fas fa-dollar-sign', color: '#2ecc71' },
      { symbol: 'BBCA', name: 'Bank BCA', price: 9500, change: 1.2, icon: 'fas fa-university', color: '#3498db' },
      { symbol: 'BBRI', name: 'Bank BRI', price: 4800, change: -0.5, icon: 'fas fa-university', color: '#e67e22' },
      { symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0, icon: 'fab fa-bitcoin', color: '#f7931a' },
      { symbol: 'ETH', name: 'Ethereum', price: 0, change: 0, icon: 'fas fa-gem', color: '#627eea' },
    ])
    const loadingPrices = ref(false)
    let priceInterval = null

    const fetchPrices = async () => {
      loadingPrices.value = true
      try {
        // Use CoinGecko for crypto, mock others due to stock/forex API restrictions in free tier
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
        const data = await res.json()
        
        const conversionRate = 16000 // Approximate IDR/USD
        cryptoPrices.value.forEach(coin => {
          if (coin.symbol === 'BTC') {
            coin.price = data.bitcoin.usd * conversionRate
            coin.change = data.bitcoin.usd_24h_change
          } else if (coin.symbol === 'ETH') {
            coin.price = data.ethereum.usd * conversionRate
            coin.change = data.ethereum.usd_24h_change
          }
        })
      } catch (e) {
        console.error('Price fetch failed:', e)
      } finally {
        loadingPrices.value = false
      }
    }

    // ── Stats ────────────────────────────────────────────────────
    const usersCount = ref(0)
    const todoStats = ref({ total: 0, done: 0, inProgress: 0, toDo: 0, rate: 0 })
    const urgentTasks = ref([])
    const recentUsers = ref([])
    const productCount = ref(0)

    const loadStats = async () => {
      usersCount.value = UsersRepository.getAll().length
      todoStats.value = TodoRepository.getStats()
      urgentTasks.value = TodoRepository.getHighPriorityPending(4)
      recentUsers.value = UsersRepository.getAll().slice(-4).reverse()
      try {
        const products = await ProductRepository.getAll()
        productCount.value = products.length
      } catch { productCount.value = 0 }
    }

    // ── Priority Helpers ─────────────────────────────────────────
    const getPriorityIcon = (p) => {
      const m = { Highest: 'fas fa-angle-double-up', High: 'fas fa-angle-up', Medium: 'fas fa-minus', Low: 'fas fa-angle-down' }
      return m[p] || 'fas fa-minus'
    }
    const getPriorityColor = (p) => {
      const m = { Highest: '#c62828', High: '#e53935', Medium: '#fb8c00', Low: '#1e88e5' }
      return m[p] || '#757575'
    }
    const getPriorityBg = (p) => {
      const m = { Highest: '#ffebee', High: '#ffcdd2', Medium: '#fff3e0', Low: '#e3f2fd' }
      return m[p] || '#f5f5f5'
    }

    const formatDate = (d) => {
      if (!d) return '-'
      return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    onMounted(() => {
      loadStats()
      fetchPrices()
      priceInterval = setInterval(fetchPrices, 60000)
    })

    onUnmounted(() => {
      if (priceInterval) clearInterval(priceInterval)
    })

    return {
      cryptoPrices, loadingPrices,
      usersCount, todoStats, urgentTasks, recentUsers, productCount,
      getPriorityIcon, getPriorityColor, getPriorityBg, formatDate,
    }
  }
}
</script>

<style scoped>
/* Stat Cards */
.stat-card-users { border-left: 4px solid #5c6bc0 !important; background: var(--bs-body-bg); }
.stat-card-todo  { border-left: 4px solid #66bb6a !important; background: var(--bs-body-bg); }
.stat-card-product { border-left: 4px solid #ffa726 !important; background: var(--bs-body-bg); }

[data-theme="dark"] .table-light { --bs-table-bg: #1f2937; --bs-table-color: #e5e7eb; }
[data-theme="dark"] .border-dark-subtle { border-color: #374151 !important; }
[data-theme="dark"] .bg-body-tertiary { background: #1f2937 !important; }

.text-indigo { color: #3949ab !important; }
.bg-indigo-light { background: #e8eaf6 !important; }
.btn-indigo { background: #3949ab; border-color: #3949ab; }
.btn-indigo:hover { background: #283593; border-color: #283593; }

/* Spinning icon */
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spin-icon { transition: transform 0.3s; }
.spin-icon.spinning { animation: spin 1s linear infinite; }

/* Coin icon */
.coin-icon { font-size: 14px; }

/* Priority dot */
.priority-dot { transition: transform 0.2s; }

/* List group item */
.list-group-item:last-child { border-bottom: none !important; }
</style>
