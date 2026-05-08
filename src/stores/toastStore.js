import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
  }),

  actions: {
    show(message, type = 'info', title = '', duration = 5000) {
      const toast = {
        id: Date.now(),
        message,
        type,
        title,
        duration,
      }

      this.toasts.push(toast)

      setTimeout(() => {
        this.remove(toast.id)
      }, duration)
    },

    success(message) {
      this.show(message, 'success', 'Thành công')
    },

    error(message) {
      this.show(message, 'error', 'Lỗi')
    },

    remove(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})
