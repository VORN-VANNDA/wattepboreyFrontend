import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  // ---- Public site ----------------------------------------------------
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/members/:id',
    name: 'member-detail',
    component: () => import('../views/MemberDetailView.vue'),
  },
  {
    path: '/dhamma',
    name: 'dhamma',
    component: () => import('../views/DhammaView.vue'),
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('../views/EventsView.vue')
  },
  {
  path: '/events/:id',
  name: 'event-detail',
  component: () => import('../views/EventDetail.vue'),
},
  {
    path: '/slides/:id',
    name: 'slide-detail',
    component: () => import('../views/SlideDetailView.vue'),
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('../views/GalleryView.vue'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/ContactView.vue'),
  },

  // ---- Admin dashboard --------------------------------------------------
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/AdminLoginView.vue'),
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'admin-members' } },
      {
        path: 'members',
        name: 'admin-members',
        component: () => import('../views/admin/AdminMembersView.vue'),
      },
      {
        path: 'slides',
        name: 'admin-slides',
        component: () => import('../views/admin/AdminSlidesView.vue'),
      },
      {
        path: 'events',
        name: 'admin-events',
        component: () => import('../views/admin/AdminEventsView.vue'),
      },
      {
        path: 'videos',
        name: 'admin-videos',
        component: () => import('../views/admin/AdminVideosView.vue'),
      },
      {
        path: 'gallery',
        name: 'admin-gallery',
        component: () => import('../views/admin/AdminGalleryView.vue'),
      },
      {
        path: 'donors',
        name: 'admin-donors',
        component: () => import('../views/admin/AdminDonorsView.vue'),
      },
      {
        path: 'messages',
        name: 'admin-messages',
        component: () => import('../views/admin/AdminMessagesView.vue'),
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('../views/admin/AdminSettingsView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Gate every /admin/* route (except the login page itself) behind a valid
// dashboard token. Unauthenticated visits are bounced to /admin/login with
// a `redirect` query param so they land back where they meant to go.
router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
