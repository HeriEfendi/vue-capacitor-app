<template>
  <div class="container mt-3 p-0" style="max-width: 800px">
    <CCard class="mb-4 overflow-hidden border-0 shadow-sm">
      <CCardBody class="position-relative pt-0">
        <div class="d-flex flex-column align-items-center text-center mt-n4">
          <img
            src="/profil.jpg"
            alt="Foto Profil"
            class="rounded-circle border border-4 border-white shadow-sm mb-3"
            width="120" height="120"
          />
          <h3 class="fw-bold mb-1">Ahmad Heri Efendi</h3>
          <p class="text-primary fw-medium mb-3">Full-Stack Web Developer</p>
          
          <div class="d-flex flex-wrap gap-2 justify-content-center mb-4">
            <span v-for="skill in skills.slice(0,4)" :key="skill.name" class="badge bg-light text-dark rounded-pill border">
              {{ skill.name }}
            </span>
          </div>

          <div class="d-flex gap-2">
            <a href="mailto:hheri58@gmail.com" class="btn btn-outline-primary btn-sm rounded-pill px-3">Email</a>
            <a href="https://github.com/HeriEfendi" target="_blank" class="btn btn-dark btn-sm rounded-pill px-3">GitHub</a>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <div class="row g-4">
      <div class="col-12 col-md-7">
        <CCard class="mb-4 border-0 shadow-sm">
          <CCardBody>
            <h5 class="fw-bold mb-3">Tentang Saya</h5>
            <p class="text-secondary small" style="line-height:1.8">
              IT Programmer dengan {{ years }}+ tahun pengalaman dalam pengembangan web, ERP, dan sistem korporat. Mahir menggunakan Laravel, Vue.js, MariaDB, dan Redis untuk membangun sistem bisnis yang skalabel dan efisien.
            </p>
          </CCardBody>
        </CCard>

        <CCard class="border-0 shadow-sm mb-4">
          <CCardBody>
            <h5 class="fw-bold mb-3">Pengalaman</h5>
            <div class="timeline ps-2">
              <div class="timeline-item mb-3" v-for="exp in experiences" :key="exp.company">
                <div class="timeline-dot"></div>
                <div class="ms-3">
                  <div class="fw-bold small">{{ exp.role }}</div>
                  <div class="text-primary x-small">{{ exp.company }}</div>
                  <div class="text-muted x-small">{{ exp.period }}</div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>

      <div class="col-12 col-md-5">
        <CCard class="border-0 shadow-sm mb-4">
          <CCardBody>
            <h5 class="fw-bold mb-3">Skills</h5>
            <div v-for="skill in skills" :key="skill.name" class="mb-2">
              <div class="d-flex justify-content-between x-small fw-semibold mb-1">
                <span class="d-flex align-items-center">
                  <i :class="`${skill.icon} me-2 text-dark`"></i>
                  {{ skill.name }}
                </span>
              </div>
              <div class="progress" style="height:6px;">
                <div class="progress-bar bg-dark" :style="`width:${skill.level}%`"></div>
              </div>
            </div>
          </CCardBody>
        </CCard>

        <CCard class="border-0 shadow-sm mb-4">
          <CCardBody>
            <h5 class="fw-bold mb-3">Statistik</h5>
            <div class="row g-2 text-center">
              <div class="col-6" v-for="stat in stats" :key="stat.label">
                <div class="p-2 rounded-3 bg-light">
                  <div class="fw-black text-primary">{{ stat.val }}</div>
                  <div class="x-small text-muted">{{ stat.label }}</div>
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
      { name: 'Laravel / PHP', level: 90, icon: 'fab fa-laravel' },
      { name: 'Vue.js / Nuxt', level: 88, icon: 'fab fa-vuejs' },
      { name: 'MariaDB / MySQL', level: 85, icon: 'fas fa-database' },
      { name: 'Redis / Queue', level: 75, icon: 'fas fa-server' },
      { name: 'Capacitor / Android', level: 65, icon: 'fab fa-android' },
      { name: 'Linux / DevOps', level: 72, icon: 'fab fa-linux' },
    ])

    const experiences = ref([
      {
        role: 'Information Technology Programmer',
        company: 'Kotakin Group',
        period: '2023 - Present',
        desc: 'Maintenance & development ERP features, internal APIs, & system performance.',
      },
      {
        role: 'Information Technology Programmer',
        company: 'PT Lestari Mulia Sentosa',
        period: '2022 - 2023',
        desc: 'System migration (Delphi/PHP to Laravel) & database management.',
      },
      {
        role: 'IT Programmer & IT Support',
        company: 'PT Omega Mas',
        period: '2019 - 2022',
        desc: 'System migration (VB.Net to Web), network administration, & technical support.',
      },
    ])

    const now = new Date();

    const years =
      now.getFullYear() -
      2019 -
      (now.getMonth() < 7 ? 1 : 0);

    const stats = ref([
      { label: 'Tahun Exp.', val: years + '+' },
      { label: 'Projects', val: '20+' },
      { label: 'Clients', val: '10+' },
      { label: 'Mobile Apps', val: '3' },
    ])

    return { skills, experiences, stats, years }
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
