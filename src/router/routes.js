
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/chart', component: () => import('pages/Chart.vue') },
      { path: '/graph', component: () => import('pages/Graph.vue') },
      { path: '/journal', component: () => import('pages/Journal.vue') },
      { path: '/edit', component: () => import('pages/Edit.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
