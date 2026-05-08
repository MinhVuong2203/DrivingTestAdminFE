<script setup>
import { useLoadingStore } from '@/stores/loadingStore'

const loadingStore = useLoadingStore()
</script>

<template>
  <div v-if="loadingStore.isLoading" class="loading">
    <img src="/src/assets/image/loading.gif" class="loader" />
  </div>
</template>