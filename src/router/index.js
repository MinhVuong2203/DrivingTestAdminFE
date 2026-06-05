import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import HomeView from '../views/HomeView.vue'
import UsersView from '@/views/user/UsersView.vue'
import VipManagementView from '@/views/vip/VipManagementView.vue'
import ForumManagerView from '@/views/forum_manager/ForumManagerView.vue'
import DownloadAppView from '@/views/public_page/DownloadAppView.vue'
import DevelopmentTeamView from '@/views/public_page/DevelopmentTeamView.vue'
import StatisticsView from '@/views/statistics/StatisticsView.vue'
import LoginView from '@/views/public_page/LoginView.vue'
import PayOsCancelView from '@/views/public_page/PayOsCancelView.vue'
import PayOsReturnView from '@/views/public_page/PayOsReturnView.vue'
import PrivacyPolicyView from '@/views/public_page/PrivacyPolicyView.vue'
import TermsOfUseView from '@/views/public_page/TermsOfUseView.vue'

import { auth, db } from '@/services/firebase'

const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

const canAccessAdmin = async (uid) => {
  const userSnap = await getDoc(doc(db, 'users', uid))
  if (!userSnap.exists()) return false

  const userData = userSnap.data()
  const isAdmin = userData.role?.toLowerCase() === 'admin'
  const isActive = (userData.status || 'active').toLowerCase() === 'active'

  return isAdmin && isActive
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Tổng quan' },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsView,
      meta: { title: 'Thống kê' },
    },
    {
      path: '/users',
      component: UsersView,
      meta: { title: 'Người dùng' },
    },
    {
      path: '/vip-management',
      component: VipManagementView,
      meta: { title: 'Gói VIP' },
    },
    {
      path: '/forum-manager',
      component: ForumManagerView,
      meta: { title: 'Diễn đàn' },
    },
    {
      path: '/download-app',
      component: DownloadAppView,
      meta: { public: true },
    },
    {
      path: '/api/payment/payos-return',
      name: 'payos-return',
      component: PayOsReturnView,
      meta: { public: true },
    },
    {
      path: '/api/payment/payos-cancel',
      name: 'payos-cancel',
      component: PayOsCancelView,
      meta: { public: true },
    },
    {
      path: '/development-team',
      name: 'development-team',
      component: DevelopmentTeamView,
      meta: { public: true },
    },
    {
      path: '/terms-of-use',
      name: 'terms-of-use',
      component: TermsOfUseView,
      meta: { public: true },
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: { public: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const user = await getCurrentUser()

  if (to.meta.public) {
    if (to.name === 'login' && user && (await canAccessAdmin(user.uid))) return '/'
    return true
  }

  if (!user) return '/login'

  const canAccess = await canAccessAdmin(user.uid)
  if (!canAccess) {
    await signOut(auth)
    return '/login'
  }

  return true
})

export default router
