<script setup>
import MainLayout from '@/components/layout/MainLayout.vue'
import { useToastStore } from '@/stores/toastStore'
import { useLoadingStore } from '@/stores/loadingStore'

const toastStore = useToastStore()
const loadingStore = useLoadingStore()

const showLoading = async () => {
  loadingStore.show()

  setTimeout(() => {
    loadingStore.hide()
  }, 3000)
}
</script>

<template>
  <MainLayout>
    <h1>Hello Vue</h1>

    <button @click="toastStore.success('Toast success')">Show Success</button>

    <button @click="toastStore.error('Toast error')">Show Error</button>

    <button @click="toastStore.show('Toast info', 'info', 'Thông báo', 60000)">Show Info</button>

    <button @click="showLoading">Show Loading</button>
  </MainLayout>
</template>
