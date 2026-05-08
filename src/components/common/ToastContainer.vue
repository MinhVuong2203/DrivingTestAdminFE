<script setup>
import { TransitionGroup } from 'vue'

import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()

const removeToast = (id) => {
  toastStore.remove(id)
}
</script>

<template>
  <div class="app-toast-container">

    <TransitionGroup name="toast">

      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="app-toast"
        :class="`app-toast-${toast.type}`"
      >

        <!-- LEFT ICON -->
        <div
          class="app-toast-icon"
          :class="`app-toast-icon-${toast.type}`"
        >

          <!-- SUCCESS -->
          <i
            v-if="toast.type === 'success'"
            class="bi bi-check-circle-fill"
          />

          <!-- ERROR -->
          <i
            v-else-if="toast.type === 'error'"
            class="bi bi-x-circle-fill"
          />

          <!-- WARNING -->
          <i
            v-else-if="toast.type === 'warning'"
            class="bi bi-exclamation-triangle-fill"
          />

          <!-- INFO -->
          <i
            v-else
            class="bi bi-info-circle-fill"
          />

        </div>

        <!-- CONTENT -->
        <div class="app-toast-content">

          <div class="app-toast-title">
            {{ toast.title }}
          </div>

          <div class="app-toast-message">
            {{ toast.message }}
          </div>

        </div>

        <!-- CLOSE -->
        <lord-icon
          src="https://cdn.lordicon.com/yxpgekdi.json"
          trigger="hover"
          stroke="bold"
          state="hover-draw"
          class="app-toast-close"
          @click="removeToast(toast.id)"
        >
        </lord-icon>

      </div>

    </TransitionGroup>

  </div>
</template>