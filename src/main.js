import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initializeDatabase } from './db/db'

initializeDatabase().then(() => {
  createApp(App).mount('#app')
}).catch((error) => {
  console.error('Failed to initialize database', error)
  createApp(App).mount('#app')
})
