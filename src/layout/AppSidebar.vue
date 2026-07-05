<template>
  <ion-menu content-id="main-content" side="end">
    <ion-content>
      <ion-list>
        <ion-list-header>Personal</ion-list-header>
        <ion-item router-link="/todo-personal" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="checkmarkCircleOutline" />
          <ion-label>To Do</ion-label>
        </ion-item>
        <ion-item router-link="/todo" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="checkmarkCircleOutline" />
          <ion-label>To Do Team</ion-label>
        </ion-item>

        <ion-list-header>Keuangan</ion-list-header>
        <ion-item router-link="/catatan_proyek" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="documentTextOutline" />
          <ion-label>Manajemen Proyek</ion-label>
        </ion-item>
        <ion-item router-link="/capital" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="walletOutline" />
          <ion-label>Tabungan</ion-label>
        </ion-item>
        <ion-item router-link="/expenses" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="arrowDownCircleOutline" />
          <ion-label>Pengeluaran</ion-label>
        </ion-item>
        <ion-item router-link="/incomes" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="arrowUpCircleOutline" />
          <ion-label>Pendapatan</ion-label>
        </ion-item>
        <ion-item router-link="/debts" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="cardOutline" />
          <ion-label>Utang</ion-label>
        </ion-item>

        <ion-list-header>Supply Chain</ion-list-header>
        <ion-item router-link="/products" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="basketOutline" />
          <ion-label>Produk Jadi</ion-label>
        </ion-item>
        <ion-item router-link="/raw-materials" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="listOutline" />
          <ion-label>Bahan Baku</ion-label>
        </ion-item>
        <ion-item router-link="/categories" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="listOutline" />
          <ion-label>Kategori</ion-label>
        </ion-item>

        <ion-list-header>General Setting</ion-list-header>
        <ion-item router-link="/users" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="peopleOutline" />
          <ion-label>Users</ion-label>
        </ion-item>
        <ion-item router-link="/profile" router-direction="root" lines="none">
          <ion-icon slot="start" :icon="personOutline" />
          <ion-label>Profile</ion-label>
        </ion-item>

        <ion-item button @click="exitApp" lines="none" class="text-danger">
          <ion-icon slot="start" :icon="logOutOutline" />
          <ion-label>Tutup Aplikasi</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script>
import { IonMenu, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonIcon } from '@ionic/vue';
import { checkmarkCircleOutline, documentTextOutline, walletOutline, arrowDownCircleOutline, arrowUpCircleOutline, cardOutline, basketOutline, listOutline, peopleOutline, personOutline, logOutOutline } from 'ionicons/icons';
import { useStore } from 'vuex'
import { computed } from 'vue'

export default {
  name: 'AppSidebar',
  components: {
    IonMenu, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonIcon
  },
  setup() {
    const store = useStore()
    const isDark = computed(() => store.state.theme === 'dark')

    return {
      isDark,
      exitApp: () => {
        if (navigator.app && navigator.app.exitApp) {
          navigator.app.exitApp();
        } else {
          window.close();
        }
      },
      checkmarkCircleOutline, documentTextOutline, walletOutline, arrowDownCircleOutline, arrowUpCircleOutline, cardOutline, basketOutline, listOutline, peopleOutline, personOutline, logOutOutline
    }
  },
}
</script>

