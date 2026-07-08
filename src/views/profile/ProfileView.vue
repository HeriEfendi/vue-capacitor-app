<template>
  <ion-page class="app-page">
    <ion-header class="app-header">
      <ion-toolbar class="app-toolbar">
        <div class="app-hero profile-hero">
          <div class="profile-head">
            <img src="/profil.jpg" alt="Foto Profil Ahmad Heri Efendi" class="profile-avatar" />
            <div>
              <p class="eyebrow">Profile</p>
              <ion-title class="app-hero-title">Ahmad Heri Efendi</ion-title>
              <p class="app-hero-subtitle">Full-Stack Web Developer • ERP • Mobile-first business tools</p>
            </div>
          </div>
          <ion-buttons class="app-action-row">
            <ion-button class="btn-action primary" href="mailto:hheri58@gmail.com">
              <ion-icon slot="start" :icon="mailOutline" /> Email
            </ion-button>
            <ion-button class="btn-action dark" href="https://github.com/HeriEfendi" target="_blank">
              <ion-icon slot="start" :icon="logoGithub" /> GitHub
            </ion-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-content-wrap">
      <div class="summary-grid">
        <ion-card v-for="stat in stats" :key="stat.label" class="summary-card stat-card shadow-soft" :class="stat.color">
          <div class="stat-top">
            <div class="icon-box-small">{{ stat.icon }}</div>
            <span>{{ stat.label }}</span>
          </div>
          <div class="stat-value">{{ stat.val }}</div>
        </ion-card>
      </div>

      <ion-card class="mobile-card profile-card">
        <ion-card-header class="mobile-card-header">
          <span class="pill-badge done">Tentang Saya</span>
          <ion-card-title class="mobile-card-title">Developer yang fokus ke sistem bisnis</ion-card-title>
          <ion-card-subtitle class="mobile-card-subtitle">
            IT Programmer dengan {{ years }}+ tahun pengalaman dalam pengembangan web, ERP, dan sistem korporat.
            Fokus pada Laravel, Vue.js, MariaDB, Redis, dan aplikasi mobile berbasis Capacitor.
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="skill-chips">
            <span v-for="skill in skills.slice(0, 4)" :key="skill.name" class="pill-badge medium">{{ skill.name }}</span>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card class="mobile-card">
        <ion-card-header class="mobile-card-header">
          <span class="pill-badge progress">Experience</span>
          <ion-card-title class="mobile-card-title">Riwayat Kerja</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="timeline">
            <div v-for="exp in experiences" :key="exp.company" class="timeline-item">
              <span class="timeline-dot"></span>
              <div class="timeline-content">
                <div class="mobile-card-top">
                  <h3>{{ exp.role }}</h3>
                  <span class="pill-badge low">{{ exp.period }}</span>
                </div>
                <p class="company">{{ exp.company }}</p>
                <p class="desc">{{ exp.desc }}</p>
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card class="mobile-card">
        <ion-card-header class="mobile-card-header">
          <span class="pill-badge todo">Skills</span>
          <ion-card-title class="mobile-card-title">Tech Stack</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-for="skill in skills" :key="skill.name" class="skill-row">
            <div class="metric-row">
              <span class="metric-label"><ion-icon :icon="skill.icon" /> {{ skill.name }}</span>
              <span class="metric-value">{{ skill.level }}%</span>
            </div>
            <ion-progress-bar :value="skill.level / 100" class="thick-progress skill-progress" />
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonBadge, IonProgressBar, IonButtons } from '@ionic/vue';
import { mailOutline, logoGithub, logoLaravel, logoVue, serverOutline, logoAndroid, terminalOutline } from 'ionicons/icons';

export default {
  name: 'ProfileView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonBadge, IonProgressBar, IonButtons },
  setup() {
    const skills = ref([
      { name: 'Laravel / PHP', level: 90, icon: logoLaravel },
      { name: 'Vue.js / Nuxt', level: 88, icon: logoVue },
      { name: 'MariaDB / MySQL', level: 85, icon: serverOutline },
      { name: 'Redis / Queue', level: 75, icon: serverOutline },
      { name: 'Capacitor / Android', level: 65, icon: logoAndroid },
      { name: 'Linux / DevOps', level: 72, icon: terminalOutline },
    ])

    const experiences = ref([
      { role: 'Information Technology Programmer', company: 'Kotakin Group', period: '2023 - Present', desc: 'Maintenance & development ERP features, internal APIs, & system performance.' },
      { role: 'Information Technology Programmer', company: 'PT Lestari Mulia Sentosa', period: '2022 - 2023', desc: 'System migration (Delphi/PHP to Laravel) & database management.' },
      { role: 'IT Programmer & IT Support', company: 'PT Omega Mas', period: '2019 - 2022', desc: 'System migration (VB.Net to Web), network administration, & technical support.' },
    ])

    const now = new Date()
    const years = now.getFullYear() - 2019 - (now.getMonth() < 7 ? 1 : 0)

    const stats = ref([
      { label: 'Tahun Exp.', val: years + '+', icon: 'XP', color: 'stat-blue' },
      { label: 'Projects', val: '20+', icon: 'PR', color: 'stat-green' },
      { label: 'Clients', val: '10+', icon: 'CL', color: 'stat-purple' },
      { label: 'Mobile Apps', val: '3', icon: 'AP', color: 'stat-amber' },
    ])

    return { skills, experiences, stats, years, mailOutline, logoGithub }
  }
}
</script>
