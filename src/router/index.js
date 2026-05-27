import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import HomeView from '../views/HomeView.vue'
import UsersView from '@/views/user/UsersView.vue'
import VipManagementView from '@/views/vip/VipManagementView.vue'
import ForumManagerView from '@/views/forum_manager/ForumManagerView.vue'
import DownloadAppView from '@/views/DownloadAppView.vue'
import LoginView from '@/views/LoginView.vue'

import { auth, db } from '@/services/firebase'

const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

const isAdmin = async (uid) => {
  const userSnap = await getDoc(doc(db, 'users', uid))
  return userSnap.exists() && userSnap.data().role?.toLowerCase() === 'admin'
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
      meta: { public: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const user = await getCurrentUser()

  if (to.meta.public) {
    if (to.name === 'login' && user && await isAdmin(user.uid)) return '/'
    return true
  }

  if (!user) return '/login'

  const admin = await isAdmin(user.uid)
  if (!admin) {
    await signOut(auth)
    return '/login'
  }

  return true
})

export default router
