<script setup>
import { useSidebarStore } from '@/stores/sidebarStore'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const sidebarStore = useSidebarStore()
const route = useRoute()

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

watch(
  () => route.path,
  () => {
    setTimeout(() => {
      document.querySelectorAll('.nav-item lord-icon').forEach((icon) => {
        if (icon?.playerInstance) {
          icon.playerInstance.pause()
        }
      })

      const activeItem = document.querySelector('.nav-item.active')
      if (activeItem) {
        const icon = activeItem.querySelector('lord-icon')
        if (icon?.playerInstance) {
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
    <div class="sidebar-brand">
      <div class="brand-logo">
        <i class="bi bi-shield-check"></i>
      </div>

      <div class="brand-text">
        Manager
        <span class="brand-sub">Kiến thức lái xe 600</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" active-class="active">
        <lord-icon
          src="https://cdn.lordicon.com/rpvomrgr.json"
          trigger="hover"
          delay="100"
          stroke="bold"
          colors="primary:#242424,secondary:#e83a30"
          class="nav-icon"
        >
        </lord-icon>
        <span class="nav-label"> TỔNG QUAN </span>
      </router-link>

      <router-link to="/statistics" class="nav-item" active-class="active">
        <lord-icon
          src="https://cdn.lordicon.com/abwrkdvl.json"
          trigger="hover"
          delay="100"
          stroke="bold"
          colors="primary:#242424,secondary:#e83a30"
          class="nav-icon"
        >
        </lord-icon>
        <span class="nav-label"> THỐNG KÊ </span>
      </router-link>

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

      <router-link to="/forum-manager" class="nav-item" active-class="active">
        <lord-icon
          src="https://cdn.lordicon.com/aksvbzmu.json"
          trigger="hover"
          delay="100"
          stroke="bold"
          colors="primary:#242424,secondary:#e83a30"
          class="nav-icon"
        >
        </lord-icon>
        <span class="nav-label"> DIỄN ĐÀN </span>
      </router-link>

      <router-link to="/feedback" class="nav-item" active-class="active">
        <lord-icon
          src="https://cdn.lordicon.com/ayhtotha.json"
          trigger="hover"
          delay="100"
          stroke="bold"
          colors="primary:#242424,secondary:#e83a30"
          class="nav-icon"
        >
        </lord-icon>
        <span class="nav-label"> PHẢN HỒI </span>
      </router-link>
    </nav>
  </aside>
</template>
