<template>
  <ion-page class="app-page">
    <ion-header class="app-header mb-3">
    </ion-header>

    <ion-content class="app-content-wrap ion-padding">
      <ion-card class="mobile-card profile-card mx-4">
        <ion-card-header class="mobile-card-header">
          <span class="pill-badge done fs-6">Aplikasi UMKM</span>
          <ion-card-title class="mobile-card-title">HK UMKM (Hasil Karya UMKM)</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Aplikasi ini dikembangkan untuk menjadi solusi satu pintu bagi UMKM dalam mengelola operasional sehari-hari. Fokus utama meliputi efisiensi pencatatan keuangan, monitoring stok yang akurat, serta manajemen presensi karyawan yang transparan.</p>
          <p>Dengan arsitektur yang berpusat pada keamanan data lokal (Offline-First), pengguna memiliki kendali penuh atas data bisnisnya tanpa ketergantungan pada server eksternal, sehingga data tetap aman dan dapat diakses kapan saja.</p>
          <div class="skill-chips mt-3">
            <span class="pill-badge medium">Buku Kas</span>
            <span class="pill-badge medium">Kasir (POS)</span>
            <span class="pill-badge medium">Manajemen Stok</span>
            <span class="pill-badge medium">Presensi (Ceklok)</span>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card class="mobile-card mx-4">
        <ion-card-header class="mobile-card-header">
          <span class="pill-badge progress fs-6">Developer</span>
          <ion-card-title class="mobile-card-title">Ahmad Heri Efendi</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="d-flex align-items-center mb-3">
            <img src="/profil.jpg" alt="Foto Profil" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" />
            <div class="ms-3">
              <div class="d-flex gap-2">
                <ion-buttons class="app-action-row">
                  <ion-button class="btn-action primary" href="mailto:hheri58@gmail.com">
                    <ion-icon slot="start" :icon="mailOutline" /> Email
                  </ion-button>
                  <ion-button class="btn-action dark" href="https://github.com/HeriEfendi" target="_blank">
                    <ion-icon slot="start" :icon="logoGithub" /> GitHub
                  </ion-button>
                </ion-buttons>              
              </div>
            </div>
          </div>
          <h4 class="mt-0">Tentang Developer</h4>
          <p>IT Programmer dengan 5+ tahun pengalaman dalam pengembangan web, ERP, dan sistem korporat. Memiliki dedikasi tinggi dalam menciptakan solusi teknologi yang membantu bisnis kecil dan menengah bertransformasi ke arah digital.</p>
          <p><strong>Spesialisasi:</strong> Laravel, Vue.js, MariaDB, Redis, dan pengembangan aplikasi mobile lintas platform berbasis Capacitor.</p>
          <p><em>"Berkomitmen untuk terus membangun sistem yang efisien, mudah digunakan, dan memberikan nilai tambah nyata bagi produktivitas UMKM."</em></p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/vue';
import { mailOutline, logoGithub } from 'ionicons/icons';

export default {
  name: 'AboutView',
  components: { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButtons, IonBackButton, IonButton, IonIcon }
}
</script>
