<template>
  <ion-toast
    :is-open="isOpen"
    :message="message"
    :class="color === 'success' ? 'toast-success' : 'toast-error'"
    :style="{
      '--background': color === 'success' ? '#4caf50' : '#f44336',
      '--color': '#fff',
      '--border-radius': '16px',
      '--box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
      '--min-height': '60px'
    }"
    position="top"
    duration="5000"
    @didDismiss="$emit('dismiss')"
  >
    <div style="align-items: center; gap: 10px; padding: 10px;">
      <ion-icon :icon="color === 'success' ? checkmarkCircleOutline : closeCircleOutline" style="font-size: 24px;" />
      <span>{{ message }}</span>
    </div>
  </ion-toast>
</template>

<script setup lang="ts">
import { IonToast, IonIcon } from '@ionic/vue';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

defineProps<{
  isOpen: boolean;
  message: string;
  color: 'success' | 'error';
}>();

defineEmits(['dismiss']);
</script>
