<script setup>
import { computed, onMounted, ref } from 'vue'

import MainLayout from '@/components/layout/MainLayout.vue'
import { getFeedbacks } from '@/services/feedbackService'
import { useLoadingStore } from '@/stores/loadingStore'

import '@/assets/css/feedback/feedback-manager.css'

const loadingStore = useLoadingStore()

const feedbacks = ref([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const selectedFeedbackId = ref('')

const filteredFeedbacks = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return feedbacks.value.filter((feedback) => {
    if (!normalizedKeyword) return true

    const haystack = [feedback.displayName, feedback.email, feedback.content, feedback.platform]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedKeyword)
  })
})

const selectedFeedback = computed(() => {
  if (!selectedFeedbackId.value) return null
  return feedbacks.value.find((feedback) => feedback.feedbackId === selectedFeedbackId.value) || null
})

const androidCount = computed(
  () => feedbacks.value.filter((feedback) => feedback.platform?.toLowerCase() === 'android').length,
)

const iosCount = computed(
  () => feedbacks.value.filter((feedback) => feedback.platform?.toLowerCase() === 'ios').length,
)

const loadFeedbacks = async () => {
  loading.value = true
  error.value = ''
  loadingStore.show()

  try {
    const feedbackData = await getFeedbacks()
    feedbacks.value = feedbackData

    if (feedbackData.length === 0) {
      selectedFeedbackId.value = ''
      return
    }

    const hasCurrentSelection = feedbackData.some(
      (feedback) => feedback.feedbackId === selectedFeedbackId.value,
    )

    if (!hasCurrentSelection) {
      selectedFeedbackId.value = feedbackData[0].feedbackId
    }
  } catch (err) {
    error.value = err?.message || 'Không thể tải danh sách phản hồi.'
  } finally {
    loading.value = false
    loadingStore.hide()
  }
}

const selectFeedback = (feedbackId) => {
  selectedFeedbackId.value = feedbackId
}

const formatDate = (value) => {
  if (!value) return 'Chưa có'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian'

  return date.toLocaleString('vi-VN')
}

onMounted(() => {
  loadFeedbacks()
})
</script>

<template>
  <MainLayout>
    <section class="feedback-page">
      <header class="feedback-header">
        <div>
          <h2>Phản hồi</h2>
          <p>Đọc góp ý từ ứng dụng mobile và xem chi tiết phản hồi của người dùng.</p>
        </div>

        <button class="feedback-reload-btn" @click="loadFeedbacks">Tải lại</button>
      </header>

      <div class="feedback-summary">
        <article class="feedback-summary-card">
          <span>Tổng phản hồi</span>
          <strong>{{ feedbacks.length }}</strong>
        </article>

        <article class="feedback-summary-card pending">
          <span>Android</span>
          <strong>{{ androidCount }}</strong>
        </article>

        <article class="feedback-summary-card">
          <span>iOS</span>
          <strong>{{ iosCount }}</strong>
        </article>
      </div>

      <div class="feedback-toolbar">
        <input
          v-model="keyword"
          class="feedback-search"
          type="text"
          placeholder="Tìm theo email, tên, nội dung..."
        />
      </div>

      <div v-if="loading" class="feedback-state">Đang tải phản hồi...</div>
      <div v-else-if="error" class="feedback-error">{{ error }}</div>
      <div v-else class="feedback-layout">
        <aside class="feedback-list-panel">
          <div v-if="filteredFeedbacks.length === 0" class="feedback-state">
            Không có phản hồi phù hợp.
          </div>

          <button
            v-for="feedback in filteredFeedbacks"
            v-else
            :key="feedback.feedbackId"
            class="feedback-list-item"
            :class="{ active: feedback.feedbackId === selectedFeedbackId }"
            @click="selectFeedback(feedback.feedbackId)"
          >
            <div class="feedback-list-top">
              <strong>{{ feedback.displayName || feedback.email || 'Người dùng ẩn danh' }}</strong>
            </div>

            <div class="feedback-list-meta">
              <span>{{ feedback.email || 'Không có email' }}</span>
              <span>{{ feedback.platform }}</span>
            </div>

            <p>{{ feedback.content }}</p>
            <small>{{ formatDate(feedback.timestamp) }}</small>
          </button>
        </aside>

        <section class="feedback-detail-panel">
          <template v-if="selectedFeedback">
            <div class="feedback-detail-head">
              <div>
                <h3>{{ selectedFeedback.displayName || 'Người dùng ẩn danh' }}</h3>
                <p>{{ selectedFeedback.email || 'Không có email' }}</p>
              </div>

              <div class="feedback-detail-badges">
                <span class="feedback-chip">{{ selectedFeedback.platform }}</span>
              </div>
            </div>

            <div class="feedback-detail-grid">
              <div class="feedback-detail-card">
                <span>UID</span>
                <strong>{{ selectedFeedback.userId || 'Không có' }}</strong>
              </div>
              <div class="feedback-detail-card">
                <span>Gửi lúc</span>
                <strong>{{ formatDate(selectedFeedback.timestamp) }}</strong>
              </div>
            </div>

            <article class="feedback-message-box">
              <h4>Nội dung phản hồi</h4>
              <p>{{ selectedFeedback.content }}</p>
            </article>
          </template>

          <div v-else class="feedback-state">Chọn một phản hồi để xem chi tiết.</div>
        </section>
      </div>
    </section>
  </MainLayout>
</template>
