<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <ion-card class="ion-padding">
            <div class="d-flex flex-column align-items-center">
                <img src="/profil.jpg" alt="Foto Profil" class="rounded-circle border border-4 border-light shadow-sm mb-3" width="120" height="120" />
                <h3 class="fw-bold mb-1">Ahmad Heri Efendi</h3>
                <p class="text-primary fw-medium mb-3">Full-Stack Web Developer</p>
                <div class="d-flex flex-wrap gap-2 justify-content-center mb-3">
                    <ion-badge color="light" v-for="skill in skills.slice(0,4)" :key="skill.name">{{ skill.name }}</ion-badge>
                </div>
                <div class="d-flex gap-2">
                    <ion-button fill="outline" href="mailto:hheri58@gmail.com"><ion-icon slot="start" :icon="mailOutline" />Email</ion-button>
                    <ion-button fill="solid" color="dark" href="https://github.com/HeriEfendi" target="_blank"><ion-icon slot="start" :icon="logoGithub" />GitHub</ion-button>
                </div>
            </div>
        </ion-card>

        <ion-grid>
            <ion-row>
                <ion-col size="12" size-md="7">
                    <ion-card>
                        <ion-card-header><ion-card-title>Tentang Saya</ion-card-title></ion-card-header>
                        <ion-card-content>
                            <p class="text-secondary small" style="line-height:1.8">IT Programmer dengan {{ years }}+ tahun pengalaman dalam pengembangan web, ERP, dan sistem korporat. Mahir menggunakan Laravel, Vue.js, MariaDB, dan Redis.</p>
                        </ion-card-content>
                    </ion-card>
                    <ion-card>
                        <ion-card-header><ion-card-title>Pengalaman</ion-card-title></ion-card-header>
                        <ion-list>
                            <ion-item v-for="exp in experiences" :key="exp.company">
                                <ion-label>
                                    <h3>{{ exp.role }}</h3>
                                    <p>{{ exp.company }}</p>
                                    <p class="text-muted">{{ exp.period }}</p>
                                </ion-label>
                            </ion-item>
                        </ion-list>
                    </ion-card>
                </ion-col>
                <ion-col size="12" size-md="5">
                    <ion-card>
                        <ion-card-header><ion-card-title>Skills</ion-card-title></ion-card-header>
                        <ion-card-content>
                            <div v-for="skill in skills" :key="skill.name" class="mb-3">
                                <div class="d-flex justify-content-between x-small fw-semibold mb-1">
                                    <span class="d-flex align-items-center">
                                        <ion-icon :icon="skill.icon" class="me-2" /> {{ skill.name }}
                                    </span>
                                </div>
                                <ion-progress-bar :value="skill.level / 100" />
                            </div>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonBadge, IonGrid, IonRow, IonCol, IonProgressBar, IonText } from '@ionic/vue';
import { mailOutline, logoGithub, logoLaravel, logoVue, serverOutline, logoAndroid, terminalOutline } from 'ionicons/icons';

export default {
  name: 'ProfileView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonBadge, IonGrid, IonRow, IonCol, IonProgressBar, IonText },
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

    return { skills, experiences, stats, years, mailOutline, logoGithub, logoLaravel, logoVue, serverOutline, logoAndroid, terminalOutline }
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
