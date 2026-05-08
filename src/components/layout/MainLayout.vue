<script setup>
import Header from './Header.vue'
import Footer from './Footer.vue'
import NavMenu from './NavMenu.vue'

import Loading from '../common/Loading.vue'
import ToastContainer from '../common/ToastContainer.vue'

import { useThemeStore } from '@/stores/themeStore'
import { useSidebarStore } from '@/stores/sidebarStore'

const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
</script>

<template>
  <div :data-theme="themeStore.isDark ? 'dark' : 'light'">
    <Loading />
    <ToastContainer />

    <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarStore.collapsed }">
      <NavMenu />

      <div class="app-content">
        <Header />

        <main class="page-main">
          <slot />
        </main>

        <Footer />
      </div>
    </div>
  </div>
</template>
