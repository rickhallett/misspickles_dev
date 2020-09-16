const routes = [
  {
    path: '/',
    component: () => import('layouts/Main.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/chart', component: () => import('pages/Chart.vue') },
      { path: '/graph', component: () => import('pages/Graph.vue') },
      { path: '/stats', component: () => import('pages/Stats.vue') },
      { path: '/journal', component: () => import('pages/Journal.vue') },
      { path: '/edit', component: () => import('pages/Edit.vue') },
      { path: '/settings', component: () => import('pages/Settings.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
];

export default routes;
