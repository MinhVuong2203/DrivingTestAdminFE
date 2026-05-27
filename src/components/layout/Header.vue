<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'

import { useThemeStore } from '@/stores/themeStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { auth } from '@/services/firebase'

const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const router = useRouter()

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const logout = async () => {
  await signOut(auth)
  router.push('/login')
}
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
        {{ themeStore.isDark ? '☀️' : '🌙' }}
      </button>

      <div class="header-user" @click="toggleDropdown">
        <div class="user-avatar">A</div>

        <div class="user-info">
          <span class="user-name">Admin</span>
          <span class="user-role">Quản trị viên</span>
        </div>

        <div v-if="showDropdown" class="user-dropdown">
          <a class="dropdown-item" href="#">Hồ sơ</a>
          <a class="dropdown-item" href="#">Cài đặt</a>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" type="button" @click.stop="logout">Đăng xuất</button>
        </div>
      </div>
    </div>
  </header>
</template>
