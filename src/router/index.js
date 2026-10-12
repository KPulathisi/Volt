import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

// Hash history: direct links, refreshes and shared configuration links work on any static host.
const routes = [
  { path: '/', component: HomePage, meta: { title: 'The Future Moves Differently' } },
  { path: '/configure', component: () => import('../pages/ConfigurePage.vue'), meta: { title: 'Configure' } },
  { path: '/models', component: () => import('../pages/ModelsPage.vue'), meta: { title: 'Models' } },
  { path: '/technology', component: () => import('../pages/TechnologyPage.vue'), meta: { title: 'Technology' } },
  { path: '/project', component: () => import('../pages/ProjectPage.vue'), meta: { title: 'Project information' } },
  ...(import.meta.env.DEV ? [{ path: '/admin/:section?/:id?', component: () => import('../admin/AdminApp.vue'), props: true, meta: { admin: true, title: 'Admin' } }] : []),
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHashHistory(), routes, scrollBehavior: () => false })
router.afterEach((to) => { document.title = `VOLT · ${to.meta.title || ''}` })
export default router
