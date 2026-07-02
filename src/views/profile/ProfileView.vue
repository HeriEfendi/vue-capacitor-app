<template>
  <div class="container py-5" style="max-width:900px">

    <!-- Header Card -->
    <CCard class="mb-4 overflow-hidden">
      <div class="profile-banner"></div>
      <CCardBody class="position-relative pt-0">
        <div class="d-flex flex-column flex-md-row align-items-md-end gap-4 mt-n4">
          <!-- Avatar -->
          <div class="profile-avatar-wrapper flex-shrink-0">
            <img
              src="https://i.pravatar.cc/160?img=33"
              alt="Foto Profil"
              class="profile-avatar rounded-circle border border-4 border-white shadow"
              width="120"
              height="120"
            />
          </div>
          <!-- Bio -->
          <div class="flex-grow-1 pb-1">
            <h3 class="fw-black mb-1">Ahmad Heri Efendi</h3>
            <p class="text-primary fw-semibold mb-2">Full-Stack Web Developer (IT Programmer)</p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge rounded-pill bg-indigo text-white">
                <i class="fab fa-laravel me-1"></i>Laravel
              </span>
              <span class="badge rounded-pill bg-success">
                <i class="fab fa-vuejs me-1"></i>Vue 3
              </span>
              <span class="badge rounded-pill bg-primary">
                <i class="fas fa-database me-1"></i>MariaDB
              </span>
              <span class="badge rounded-pill" style="background:#7c3aed;color:white">
                <i class="fas fa-server me-1"></i>Redis
              </span>
              <span class="badge rounded-pill bg-dark">
                <i class="fab fa-linux me-1"></i>Linux
              </span>
              <span class="badge rounded-pill bg-warning text-dark">
                <i class="fab fa-android me-1"></i>Capacitor
              </span>
            </div>
          </div>
          <!-- Contact buttons -->
          <div class="d-flex gap-2 flex-shrink-0">
            <a href="mailto:heri@example.com" class="btn btn-outline-primary btn-sm">
              <i class="fas fa-envelope me-1"></i>Email
            </a>
            <a href="https://github.com" target="_blank" class="btn btn-dark btn-sm">
              <i class="fab fa-github me-1"></i>GitHub
            </a>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <div class="row g-4">
      <!-- Kolom Kiri -->
      <div class="col-12 col-md-7">
        <!-- Tentang Saya -->
        <CCard class="mb-4">
          <CCardBody>
            <h6 class="fw-bold text-uppercase text-muted mb-3">
              <i class="fas fa-user-circle me-2 text-primary"></i>Tentang Saya
            </h6>
            <p class="text-secondary mb-0" style="line-height:1.8">
              Seorang <strong>IT Programmer</strong> dengan pengalaman lebih dari 5 tahun dalam
              pengembangan aplikasi web, software ERP, dan sistem internal perusahaan. Mahir
              dalam memanfaatkan <strong>Laravel</strong>, <strong>Vue.js</strong>,
              <strong>MariaDB</strong>, dan <strong>Redis</strong> untuk membangun solusi
              yang skalabel dan berkinerja tinggi. Saat ini mengembangkan aplikasi
              mobile dengan <strong>Capacitor</strong> untuk Android.
            </p>
          </CCardBody>
        </CCard>

        <!-- Pendidikan -->
        <CCard class="mb-4">
          <CCardBody>
            <h6 class="fw-bold text-uppercase text-muted mb-3">
              <i class="fas fa-graduation-cap me-2 text-primary"></i>Pendidikan
            </h6>
            <div class="d-flex gap-3">
              <div class="edu-icon">
                <i class="fas fa-university text-primary fa-lg"></i>
              </div>
              <div>
                <div class="fw-semibold">Teknik Informatika</div>
                <div class="text-muted small">Universitas Contoh · 2016 – 2020</div>
                <div class="text-secondary small mt-1">GPA 3.75 / 4.00</div>
              </div>
            </div>
          </CCardBody>
        </CCard>

        <!-- Pengalaman Kerja -->
        <CCard>
          <CCardBody>
            <h6 class="fw-bold text-uppercase text-muted mb-3">
              <i class="fas fa-briefcase me-2 text-primary"></i>Pengalaman Kerja
            </h6>
            <div class="timeline">
              <div class="timeline-item" v-for="exp in experiences" :key="exp.company">
                <div class="timeline-dot"></div>
                <div class="timeline-content ms-3">
                  <div class="fw-bold">{{ exp.role }}</div>
                  <div class="text-primary small fw-semibold">{{ exp.company }}</div>
                  <div class="text-muted small">{{ exp.period }}</div>
                  <p class="text-secondary small mt-1 mb-0">{{ exp.desc }}</p>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>

      <!-- Kolom Kanan -->
      <div class="col-12 col-md-5">
        <!-- Skills -->
        <CCard class="mb-4">
          <CCardBody>
            <h6 class="fw-bold text-uppercase text-muted mb-3">
              <i class="fas fa-code me-2 text-primary"></i>Technical Skills
            </h6>
            <div v-for="skill in skills" :key="skill.name" class="mb-3">
              <div class="d-flex justify-content-between small fw-semibold mb-1">
                <span>{{ skill.name }}</span>
                <span class="text-muted">{{ skill.level }}%</span>
              </div>
              <div class="progress" style="height:8px;border-radius:10px">
                <div
                  class="progress-bar"
                  :style="`width:${skill.level}%;background:${skill.color}`"
                  style="border-radius:10px"
                ></div>
              </div>
            </div>
          </CCardBody>
        </CCard>

        <!-- Info Kontak -->
        <CCard class="mb-4">
          <CCardBody>
            <h6 class="fw-bold text-uppercase text-muted mb-3">
              <i class="fas fa-address-card me-2 text-primary"></i>Informasi
            </h6>
            <ul class="list-unstyled mb-0">
              <li class="mb-2">
                <i class="fas fa-map-marker-alt text-muted me-2 fa-fw"></i>
                <span class="small">Indonesia</span>
              </li>
              <li class="mb-2">
                <i class="fas fa-envelope text-muted me-2 fa-fw"></i>
                <span class="small">heri@example.com</span>
              </li>
              <li class="mb-2">
                <i class="fas fa-globe text-muted me-2 fa-fw"></i>
                <span class="small">portfolio.example.com</span>
              </li>
              <li>
                <i class="fab fa-github text-muted me-2 fa-fw"></i>
                <span class="small">github.com/heri-efendi</span>
              </li>
            </ul>
          </CCardBody>
        </CCard>

        <!-- Statistik -->
        <CCard>
          <CCardBody>
            <h6 class="fw-bold text-uppercase text-muted mb-3">
              <i class="fas fa-chart-bar me-2 text-primary"></i>Statistik
            </h6>
            <div class="row g-3 text-center">
              <div class="col-6">
                <div class="stat-card p-3 rounded-3" style="background:#e8eaf6">
                  <div class="fs-3 fw-black text-indigo">5+</div>
                  <div class="small text-muted">Tahun Exp.</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-card p-3 rounded-3" style="background:#e8f5e9">
                  <div class="fs-3 fw-black text-success">20+</div>
                  <div class="small text-muted">Projects</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-card p-3 rounded-3" style="background:#fff3e0">
                  <div class="fs-3 fw-black text-warning">10+</div>
                  <div class="small text-muted">Clients</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-card p-3 rounded-3" style="background:#fce4ec">
                  <div class="fs-3 fw-black" style="color:#c2185b">3</div>
                  <div class="small text-muted">Mobile Apps</div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { CCard, CCardBody } from '@coreui/vue'

export default {
  name: 'ProfileView',
  components: { CCard, CCardBody },
  setup() {
    const skills = ref([
      { name: 'Laravel / PHP', level: 90, color: '#ff4500' },
      { name: 'Vue.js / Nuxt', level: 88, color: '#42b883' },
      { name: 'MariaDB / MySQL', level: 85, color: '#1a6faf' },
      { name: 'Redis / Queue', level: 75, color: '#dc382d' },
      { name: 'Capacitor / Android', level: 65, color: '#3ddc84' },
      { name: 'Linux / DevOps', level: 72, color: '#fcc624' },
    ])

    const experiences = ref([
      {
        role: 'Full-Stack Developer',
        company: 'PT. Teknologi Maju',
        period: '2022 – Sekarang',
        desc: 'Membangun sistem ERP internal berbasis Laravel + Vue.js dengan Redis untuk caching.',
      },
      {
        role: 'Web Developer',
        company: 'CV. Digital Kreatif',
        period: '2020 – 2022',
        desc: 'Mengembangkan aplikasi web UMKM dan marketplace lokal.',
      },
      {
        role: 'Junior Programmer',
        company: 'Startup ABC',
        period: '2019 – 2020',
        desc: 'Internship pengembangan fitur backend PHP dan integrasi API.',
      },
    ])

    return { skills, experiences }
  }
}
</script>

<style scoped>
.profile-banner {
  height: 120px;
  background: linear-gradient(135deg, #3949ab 0%, #5c6bc0 50%, #7e57c2 100%);
}
.profile-avatar {
  object-fit: cover;
}
.bg-indigo { background-color: #3949ab !important; }
.text-indigo { color: #3949ab !important; }

/* Timeline */
.timeline { position: relative; }
.timeline-item {
  display: flex;
  align-items: flex-start;
  padding-bottom: 20px;
  position: relative;
}
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 14px;
  width: 2px;
  height: calc(100% - 10px);
  background: #e0e0e0;
}
.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3949ab;
  flex-shrink: 0;
  margin-top: 4px;
}
</style>
