<script setup>
import { useSidebarStore } from '@/stores/sidebarStore'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const sidebarStore = useSidebarStore()
const route = useRoute()

// Trigger icon khi hover
onMounted(() => {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const icon = item.querySelector('lord-icon')
      if (icon?.playerInstance) {
        icon.playerInstance.playFromBeginning()
      }
    })
  })
})

// Loop icon khi active, dừng khi không active
watch(
  () => route.path,
  () => {
    setTimeout(() => {
      // Dừng tất cả icons
      document.querySelectorAll('.nav-item lord-icon').forEach((icon) => {
        if (icon?.playerInstance) {
          icon.playerInstance.pause()
        }
      })

      // Loop icon của item đang active
      const activeItem = document.querySelector('.nav-item.active')
      if (activeItem) {
        const icon = activeItem.querySelector('lord-icon')
        if (icon?.playerInstance) {
          // Set trigger thành loop
          icon.setAttribute('trigger', 'loop')
          icon.playerInstance.playFromBeginning()
        }
      }
    }, 100)
  },
  { immediate: true },
)
</script>

<template>
  <aside class="sidebar">
    <!-- BRAND -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <i class="bi bi-shield-check"></i>
      </div>

      <div class="brand-text">
        Drive Prep Manager
        <span class="brand-sub"> Admin Dashboard </span>
      </div>
    </div>

    <!-- NAV -->
    <nav class="sidebar-nav">
      <!-- DASHBOARD -->
      <router-link to="/" class="nav-item" active-class="active">
        <lord-icon
          src="https://cdn.lordicon.com/zldpstex.json"
          trigger="hover"
          delay="100"
          stroke="bold"
          colors="primary:#242424,secondary:#e83a30"
          class="nav-icon"
        >
        </lord-icon>
        <span class="nav-label"> TỔNG QUAN </span>
      </router-link>

      <!-- USERS -->
      <router-link to="/users" class="nav-item" active-class="active">
        <lord-icon
          src="https://cdn.lordicon.com/rzsnbiaw.json"
          trigger="hover"
          delay="100"
          stroke="bold"
          state="morph-group"
          colors="primary:#242424,secondary:#e83a30"
          class="nav-icon"
        >
        </lord-icon>
        <span class="nav-label"> NGƯỜI DÙNG </span>
      </router-link>

      <!-- VIP -->
      <router-link to="/vip-management" class="nav-item" active-class="active">
        <lord-icon
          src="https://cdn.lordicon.com/zldpstex.json"
          trigger="hover"
          delay="100"
          stroke="bold"
          colors="primary:#242424,secondary:#e83a30"
          class="nav-icon"
        >
        </lord-icon>
        <span class="nav-label"> GÓI VIP </span>
      </router-link>
    </nav>
  </aside>
</template>
