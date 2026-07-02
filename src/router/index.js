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
        component: () => import('../views/supply-chain/products/ListView.vue'),
      },
      { path: 'products/create', name: 'ProductCreate', component: () => import('../views/supply-chain/products/CreateView.vue') },
      { path: 'products/:id/edit', name: 'ProductEdit', component: () => import('../views/supply-chain/products/EditView.vue') },
      {
        path: 'raw-materials',
        name: 'RawMaterialsList',
        component: () => import('../views/supply-chain/raw-materials/ListView.vue'),
      },
      { path: 'raw-materials/create', name: 'RawMaterialsCreate', component: () => import('../views/supply-chain/raw-materials/CreateView.vue') },
      { path: 'raw-materials/:id/edit', name: 'RawMaterialsEdit', component: () => import('../views/supply-chain/raw-materials/EditView.vue') },
      {
        path: 'categories',
        name: 'CategoriesList',
        component: () => import('../views/supply-chain/categories/ListView.vue'),
      },
      { path: 'categories/create', name: 'CategoryCreate', component: () => import('../views/supply-chain/categories/CreateView.vue') },
      { path: 'categories/:id/edit', name: 'CategoryEdit', component: () => import('../views/supply-chain/categories/EditView.vue') },
      {
        path: 'expenses',
        name: 'ExpensesList',
        component: () => import('../views/accounting/expenses/ListView.vue'),
      },
      { path: 'expenses/create', name: 'ExpensesCreate', component: () => import('../views/accounting/expenses/CreateView.vue') },
      { path: 'expenses/:id/edit', name: 'ExpensesEdit', component: () => import('../views/accounting/expenses/EditView.vue') },
      {
        path: 'incomes',
        name: 'IncomesList',
        component: () => import('../views/accounting/incomes/ListView.vue'),
      },
      { path: 'incomes/create', name: 'IncomesCreate', component: () => import('../views/accounting/incomes/CreateView.vue') },
      { path: 'incomes/:id/edit', name: 'IncomesEdit', component: () => import('../views/accounting/incomes/EditView.vue') },
      {
        path: 'debts',
        name: 'DebtsList',
        component: () => import('../views/accounting/debts/ListView.vue'),
      },
      { path: 'debts/create', name: 'DebtsCreate', component: () => import('../views/accounting/debts/CreateView.vue') },
      { path: 'debts/:id/edit', name: 'DebtsEdit', component: () => import('../views/accounting/debts/EditView.vue') },
      {
        path: 'capital',
        name: 'CapitalList',
        component: () => import('../views/accounting/capital/ListView.vue'),
      },
      { path: 'capital/create', name: 'CapitalCreate', component: () => import('../views/accounting/capital/CreateView.vue') },
      { path: 'capital/:id/edit', name: 'CapitalEdit', component: () => import('../views/accounting/capital/EditView.vue') },
      {
        path: 'financial-records',
        name: 'FinancialRecords',
        component: () => import('../views/financial-records/Index.vue'),
      },
      {
        path: 'financial-records/:id',
        name: 'FinancialRecordsDetails',
        component: () => import('../views/financial-records/Details.vue'),
      },

      // ─── Users ──────────────────────────────────────────────────────
      {
        path: 'users',
        name: 'UsersList',
        component: () => import('../views/users/ListView.vue'),
      },

      // ─── Todo List ──────────────────────────────────────────────────
      {
        path: 'todo',
        name: 'TodoList',
        component: () => import('../views/todo/ListView.vue'),
      },
      {
        path: 'todo/create',
        name: 'TodoCreate',
        component: () => import('../views/todo/FormView.vue'),
      },
      {
        path: 'todo/:id/edit',
        name: 'TodoEdit',
        component: () => import('../views/todo/FormView.vue'),
      },

      // ─── Profile ────────────────────────────────────────────────────
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/ProfileView.vue'),
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