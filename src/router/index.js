import { createRouter, createWebHashHistory } from 'vue-router'
import DefaultLayout from '../layout/DefaultLayout.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: HomeView, // Assuming HomeView is your dashboard for now
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/ProductsView.vue'),
      },
      {
        path: 'raw-materials',
        name: 'RawMaterials',
        component: () => import('../views/RawMaterialsView.vue'),
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/CategoriesView.vue'),
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('../views/ExpensesView.vue'),
      },
      {
        path: 'incomes',
        name: 'Incomes',
        component: () => import('../views/IncomesView.vue'),
      },
      {
        path: 'debts',
        name: 'Debts',
        component: () => import('../views/DebtsView.vue'),
      },
      {
        path: 'capital',
        name: 'Capital',
        component: () => import('../views/CapitalView.vue'),
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('../views/AboutView.vue'),
      },
      {
        path: 'contact',
        name: 'Contact',
        component: () => import('../views/ContactView.vue'),
      },
      // Add other routes from your README here
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(), // Using Hash History is better for Capacitor
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }

  },
})

export default router