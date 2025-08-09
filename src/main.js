import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { seedDatabase } from './db/schema'

// Styles
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'

// Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Initialize and seed database
seedDatabase().then(() => {
  console.log('Database seeded successfully.');
}).catch(error => {
  console.error('Failed to seed database:', error)
});

const app = createApp(App)

app.use(router)

app.mount('#app')
