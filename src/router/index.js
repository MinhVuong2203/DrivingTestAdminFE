import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UsersView from '@/views/user/UsersView.vue'
import VipManagementView from '@/views/vip/VipManagementView.vue'
import ForumManagerView from '@/views/forum_manager/ForumManagerView.vue'
import DownloadAppView from '@/views/DownloadAppView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/users',
      component: UsersView,
    },
    {
      path: '/vip-management',
      component: VipManagementView,
    },
    {
      path: '/forum-manager',
      component: ForumManagerView,
    },
    {
      path: '/download-app',
      component: DownloadAppView,
    },
  ],
})

export default router
