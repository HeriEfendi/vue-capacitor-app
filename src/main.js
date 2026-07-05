import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { seedDatabase } from './db/schema'


// Import CoreUI CSS
import '@coreui/coreui/dist/css/coreui.min.css'
import CIcon from '@coreui/icons-vue';
import * as icons from '@coreui/icons';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'

// Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

async function initializeApp() {
  try {
    await seedDatabase();
    const { UsersRepository } = await import('./db/usersRepository');
    await UsersRepository.seed();
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
  const app = createApp(App);

  app.use(store);
  app.use(router);
  app.provide('icons', icons); // Provide icons globally
  app.component('CIcon', CIcon); // Register CIcon globally

  const vm = app.mount('#app');
  // expose app for header toggle interop
  window.__app__ = vm;
}

initializeApp();

