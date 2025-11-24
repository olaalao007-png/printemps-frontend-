// src/router/routes.js
const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    name: 'login'
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        name: 'dashboard'
      },
      {
        path: 'generer-qr',
        component: () => import('pages/GenererQRPage.vue'),
        name: 'generer-qr'
      },
      {
        path: 'scanner-qr',
        component: () => import('pages/ScannerQRPage.vue'),
        name: 'scanner-qr'
      },
      {
        path: 'liste-formulaires',
        component: () => import('pages/FormsListPage.vue'),
        name: 'liste-formulaires'
      },
      {
        path: 'detail-formulaire/:id',
        component: () => import('pages/DetailFormPage.vue'),
        name: 'detail-formulaire'
      }
    ]
  },
  {
    path: '/form/:token',
    component: () => import('pages/FormPage.vue'),
    name: 'public-form'
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes