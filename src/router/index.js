import { createRouter, createWebHistory } from 'vue-router'
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
        name: 'ProductsList',
        component: () => import('../views/ProductsListView.vue'),
      },
      { path: 'products/create', name: 'ProductCreate', component: () => import('../views/ProductCreateView.vue') },
      { path: 'products/:id/edit', name: 'ProductEdit', component: () => import('../views/ProductEditView.vue') },
      {
        path: 'raw-materials',
        name: 'RawMaterialsList',
        component: () => import('../views/RawMaterialsListView.vue'),
      },
      { path: 'raw-materials/create', name: 'RawMaterialsCreate', component: () => import('../views/RawMaterialsCreateView.vue') },
      { path: 'raw-materials/:id/edit', name: 'RawMaterialsEdit', component: () => import('../views/RawMaterialsEditView.vue') },
      {
        path: 'categories',
        name: 'CategoriesList',
        component: () => import('../views/CategoriesListView.vue'),
      },
      { path: 'categories/create', name: 'CategoryCreate', component: () => import('../views/CategoryCreateView.vue') },
      { path: 'categories/:id/edit', name: 'CategoryEdit', component: () => import('../views/CategoryEditView.vue') },
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
      { path: ':pathMatch(.*)*', name: 'NotFoundChild', component: () => import('../views/NotFound.vue'), meta: { bare: true } },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue'), meta: { bare: true } },
]

const router = createRouter({
  history: createWebHistory(),
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