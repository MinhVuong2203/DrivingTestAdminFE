<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'

import { useThemeStore } from '@/stores/themeStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { auth } from '@/services/firebase'

const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const router = useRouter()
const route = useRoute()

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
        <i class="bi bi-list"></i>
      </button>

      <div class="header-breadcrumb">
        {{ route.meta.title || 'Trang chủ' }}
      </div>
    </div>

    <div class="header-center">
      <input class="search-input" placeholder="Tim kiem..." />
    </div>

    <div class="header-right">
      <button class="header-btn" @click="themeStore.toggleTheme()">
        <i class="bi" :class="themeStore.isDark ? 'bi-sun' : 'bi-moon'"></i>
      </button>

      <div class="header-user" @click="toggleDropdown">
        <div class="user-avatar">A</div>

        <div class="user-info">
          <span class="user-name">Admin</span>
          <span class="user-role">Quan tri vien</span>
        </div>

        <div v-if="showDropdown" class="user-dropdown">
          <a class="dropdown-item" href="#">Ho so</a>
          <a class="dropdown-item" href="#">Cai dat</a>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" type="button" @click.stop="logout">Dang xuat</button>
        </div>
      </div>
    </div>
  </header>
</template>
