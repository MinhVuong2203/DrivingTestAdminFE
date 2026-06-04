<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { useThemeStore } from '@/stores/themeStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { auth, db } from '@/services/firebase'
import { getInitial } from '@/utils/stringHelper'

const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const router = useRouter()

const showDropdown = ref(false)
const showProfileModal = ref(false)
const adminProfile = ref(null)

const displayName = computed(() => adminProfile.value?.displayName || auth.currentUser?.displayName || 'Admin')
const email = computed(() => adminProfile.value?.email || auth.currentUser?.email || '-')
const photoURL = computed(() => adminProfile.value?.photoURL || auth.currentUser?.photoURL || '')
const roleLabel = computed(() => adminProfile.value?.isImportant ? 'Admin' : 'Quản trị viên')
const statusLabel = computed(() => adminProfile.value?.status || 'active')

const getAuthUser = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

const loadAdminProfile = async () => {
  const user = await getAuthUser()
  if (!user?.uid) return

  const snap = await getDoc(doc(db, 'users', user.uid))
  if (snap.exists()) {
    adminProfile.value = { uid: snap.id, ...snap.data() }
    return
  }

  adminProfile.value = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    role: 'admin',
  }
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const openProfile = () => {
  showDropdown.value = false
  showProfileModal.value = true
}

const closeProfile = () => {
  showProfileModal.value = false
}

const logout = async () => {
  showDropdown.value = false
  await signOut(auth)
  router.push('/login')
}

onMounted(loadAdminProfile)
</script>

<template>
  <header class="main-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="sidebarStore.toggleSidebar()">
        ☰
      </button>

      <div class="header-breadcrumb">
        Trang chủ
      </div>
    </div>

    <div class="header-center">
      <input class="search-input" placeholder="Tìm kiếm..." />
    </div>

    <div class="header-right">
      <button class="header-btn" @click="themeStore.toggleTheme()">
        <i class="bi" :class="themeStore.isDark ? 'bi-sun' : 'bi-moon'"></i>
      </button>

      <div class="header-user" @click="toggleDropdown">
        <img v-if="photoURL" :src="photoURL" class="user-avatar-img" alt="Avatar" />
        <div v-else class="user-avatar">{{ getInitial(displayName) }}</div>

        <div class="user-info">
          <span class="user-name">{{ displayName }}</span>
          <span class="user-role">{{ roleLabel }}</span>
        </div>

        <i class="bi bi-chevron-down header-user-chevron"></i>

        <div v-if="showDropdown" class="user-dropdown" @click.stop>
          <button class="dropdown-item profile" type="button" @click="openProfile">
            <i class="bi bi-person-badge"></i>
            <span>Hồ sơ</span>
          </button>

          <div class="dropdown-divider"></div>

          <button class="dropdown-item logout" type="button" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <div v-if="showProfileModal" class="profile-modal-backdrop" @click="closeProfile">
      <section class="profile-modal" @click.stop>
        <button class="profile-modal-close" type="button" @click="closeProfile">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="profile-modal-head">
          <img v-if="photoURL" :src="photoURL" class="profile-avatar-img" alt="Avatar" />
          <div v-else class="profile-avatar">{{ getInitial(displayName) }}</div>

          <div>
            <h3>{{ displayName }}</h3>
            <span class="profile-role" :class="{ root: adminProfile?.isImportant }">
              {{ roleLabel }}
            </span>
          </div>
        </div>

        <div class="profile-info-grid">
          <div class="profile-info-row">
            <span>Email</span>
            <strong>{{ email }}</strong>
          </div>


          <div class="profile-info-row">
            <span>Trạng thái</span>
            <strong>{{ statusLabel }}</strong>
          </div>

          <div class="profile-info-row">
            <span>Vai trò</span>
            <strong>{{ adminProfile?.role || 'admin' }}</strong>
          </div>
        </div>

        <div class="profile-modal-actions">
          <button type="button" class="profile-close-btn" @click="closeProfile">Đóng</button>
          <button type="button" class="profile-logout-btn" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
            Đăng xuất
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
