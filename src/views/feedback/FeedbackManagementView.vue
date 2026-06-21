<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import MainLayout from '@/components/layout/MainLayout.vue'
import { getFeedbacks, markFeedbackSpam, saveFeedbackReply } from '@/services/feedbackService'
import { useLoadingStore } from '@/stores/loadingStore'
import { useToastStore } from '@/stores/toastStore'

import '@/assets/css/feedback/feedback-manager.css'

const loadingStore = useLoadingStore()
const toastStore = useToastStore()

const feedbacks = ref([])
const loading = ref(false)
const error = ref('')
const keyword = ref('')
const statusFilter = ref('all')
const selectedFeedbackId = ref('')
const replyDraft = ref('')
const saving = ref(false)

const filters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'open', label: 'Chưa trả lời' },
  { value: 'replied', label: 'Đã trả lời' },
  { value: 'spam', label: 'Nghi spam' },
]

const getFeedbackStatus = (feedback) => {
  if (feedback?.status === 'spam' || feedback?.spamRisk) return 'spam'
  if (feedback?.replyText || feedback?.replies?.length) return 'replied'
  return feedback?.status || 'open'
}

const selectedFeedback = computed(() => {
  if (!selectedFeedbackId.value) return null
  return (
    feedbacks.value.find((feedback) => feedback.feedbackId === selectedFeedbackId.value) || null
  )
})

const filteredFeedbacks = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return feedbacks.value.filter((feedback) => {
    const status = getFeedbackStatus(feedback)
    if (statusFilter.value !== 'all' && status !== statusFilter.value) return false

    if (!normalizedKeyword) return true

    const haystack = [
      feedback.displayName,
      feedback.email,
      feedback.content,
      feedback.platform,
      feedback.replyText,
      ...(feedback.replies || []).map((reply) => reply.content),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedKeyword)
  })
})

const openCount = computed(
  () => feedbacks.value.filter((feedback) => getFeedbackStatus(feedback) === 'open').length,
)

const repliedCount = computed(
  () => feedbacks.value.filter((feedback) => getFeedbackStatus(feedback) === 'replied').length,
)

const spamCount = computed(
  () => feedbacks.value.filter((feedback) => getFeedbackStatus(feedback) === 'spam').length,
)

const selectedStatus = computed(() => getFeedbackStatus(selectedFeedback.value))
const selectedIsSpam = computed(() => selectedStatus.value === 'spam')

watch(
  () => selectedFeedback.value?.feedbackId,
  () => {
    replyDraft.value = ''
  },
)

const patchFeedback = (feedbackId, patch) => {
  const index = feedbacks.value.findIndex((feedback) => feedback.feedbackId === feedbackId)
  if (index === -1) return
  feedbacks.value[index] = {
    ...feedbacks.value[index],
    ...patch,
  }
}

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

const statusLabel = (status) => {
  const labels = {
    open: 'Chưa trả lời',
    replied: 'Đã trả lời',
    spam: 'Nghi spam',
  }

  return labels[status] || 'Chưa trả lời'
}

const sourceLabel = (source) => {
  const labels = {
    auto_ai: 'AI tự động',
    ai: 'AI hỗ trợ',
    manual: 'Admin',
    fallback: 'Mẫu tự động',
  }

  return labels[source] || 'Chưa có'
}

const sendReply = async (source = 'manual') => {
  if (!selectedFeedback.value || saving.value) return

  const trimmedReply = replyDraft.value.trim()
  if (!trimmedReply) {
    toastStore.error('Vui lòng nhập nội dung phản hồi thêm.')
    return
  }

  saving.value = true

  try {
    await saveFeedbackReply(selectedFeedback.value.feedbackId, trimmedReply, source)
    const newReply = {
      id: `${Date.now()}`,
      content: trimmedReply,
      authorName: 'Quản trị viên',
      source,
      createdAt: new Date(),
    }

    patchFeedback(selectedFeedback.value.feedbackId, {
      status: 'replied',
      replyText: trimmedReply,
      replySource: source,
      replyAuthor: 'Quản trị viên',
      repliedAt: new Date(),
      replies: [...(selectedFeedback.value.replies || []), newReply],
    })
    replyDraft.value = ''
    toastStore.success('Đã lưu phản hồi thêm.')
  } catch (err) {
    toastStore.error(err?.message || 'Không thể lưu phản hồi.')
  } finally {
    saving.value = false
  }
}

const toggleSpam = async () => {
  if (!selectedFeedback.value || saving.value) return

  const nextSpamState = !selectedIsSpam.value
  const nextStatus =
    selectedFeedback.value.replyText || selectedFeedback.value.replies?.length ? 'replied' : 'open'
  saving.value = true

  try {
    await markFeedbackSpam(selectedFeedback.value.feedbackId, nextSpamState, nextStatus)
    patchFeedback(selectedFeedback.value.feedbackId, {
      status: nextSpamState ? 'spam' : nextStatus,
      spamRisk: nextSpamState,
      spamReason: nextSpamState ? 'Admin đánh dấu nội dung có dấu hiệu spam.' : '',
    })
    toastStore.success(nextSpamState ? 'Đã đánh dấu spam.' : 'Đã bỏ đánh dấu spam.')
  } catch (err) {
    toastStore.error(err?.message || 'Không thể cập nhật trạng thái spam.')
  } finally {
    saving.value = false
  }
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
          <h2>Quản lý phản hồi</h2>
        </div>

        <button class="feedback-reload-btn" type="button" @click="loadFeedbacks">
          <i class="bi bi-arrow-clockwise"></i>
          Tải lại
        </button>
      </header>

      <div class="feedback-summary">
        <article class="feedback-summary-card">
          <span>Tổng phản hồi</span>
          <strong>{{ feedbacks.length }}</strong>
        </article>

        <article class="feedback-summary-card open">
          <span>Chưa trả lời</span>
          <strong>{{ openCount }}</strong>
        </article>

        <article class="feedback-summary-card replied">
          <span>Đã trả lời</span>
          <strong>{{ repliedCount }}</strong>
        </article>

        <article class="feedback-summary-card spam">
          <span>Nghi spam</span>
          <strong>{{ spamCount }}</strong>
        </article>
      </div>

      <div class="feedback-toolbar">
        <input
          v-model="keyword"
          class="feedback-search"
          type="text"
          placeholder="Tìm theo email, tên, nội dung, câu trả lời..."
        />

        <div class="feedback-filter-group" aria-label="Bộ lọc phản hồi">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="feedback-filter-btn"
            :class="{ active: statusFilter === filter.value }"
            type="button"
            @click="statusFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
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
            :class="[
              { active: feedback.feedbackId === selectedFeedbackId },
              `is-${getFeedbackStatus(feedback)}`,
            ]"
            type="button"
            @click="selectFeedback(feedback.feedbackId)"
          >
            <div class="feedback-list-top">
              <strong>{{ feedback.displayName || feedback.email || 'Người dùng ẩn danh' }}</strong>
              <span class="feedback-status" :class="getFeedbackStatus(feedback)">
                {{ statusLabel(getFeedbackStatus(feedback)) }}
              </span>
            </div>

            <div class="feedback-list-meta">
              <span>{{ feedback.email || 'Không có email' }}</span>
              <span>{{ feedback.platform }}</span>
            </div>

            <p>{{ feedback.content }}</p>

            <div class="feedback-list-bottom">
              <small>{{ formatDate(feedback.timestamp) }}</small>
              <span v-if="feedback.replySource" class="feedback-mini-chip">
                {{ sourceLabel(feedback.replySource) }}
              </span>
            </div>
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
                <span class="feedback-chip" :class="selectedStatus">
                  {{ statusLabel(selectedStatus) }}
                </span>
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
              <div class="feedback-detail-card">
                <span>Lần trả lời cuối</span>
                <strong>{{ sourceLabel(selectedFeedback.replySource) }}</strong>
              </div>
              <div class="feedback-detail-card">
                <span>Thời điểm</span>
                <strong>{{ formatDate(selectedFeedback.repliedAt) }}</strong>
              </div>
            </div>

            <article class="feedback-message-box">
              <div>
                <h4>Nội dung phản hồi</h4>
                <p>{{ selectedFeedback.content }}</p>
              </div>
            </article>

            <article v-if="selectedFeedback.spamRisk" class="feedback-spam-note">
              <i class="bi bi-shield-exclamation"></i>
              <div>
                <strong>Nội dung có dấu hiệu spam</strong>
                <p>
                  {{ selectedFeedback.spamReason || 'AI hoặc admin đã đánh dấu cần kiểm tra.' }}
                </p>
              </div>
            </article>

            <article class="feedback-thread-box">
              <h4>Lịch sử trả lời</h4>
              <div v-if="!selectedFeedback.replies?.length" class="feedback-thread-empty">
                Chưa có câu trả lời nào.
              </div>
              <div
                v-for="reply in selectedFeedback.replies"
                v-else
                :key="reply.id"
                class="feedback-thread-item"
              >
                <div class="feedback-thread-meta">
                  <strong>{{ sourceLabel(reply.source) }}</strong>
                  <span>{{ formatDate(reply.createdAt) }}</span>
                </div>
                <p>{{ reply.content }}</p>
              </div>
            </article>

            <article class="feedback-reply-box">
              <div class="feedback-reply-head">
                <h4>Phản hồi thêm</h4>

                <button class="feedback-tool-btn warning" type="button" @click="toggleSpam">
                  <i class="bi bi-shield-exclamation"></i>
                  {{ selectedIsSpam ? 'Bỏ spam' : 'Đánh dấu spam' }}
                </button>
              </div>

              <textarea
                v-model="replyDraft"
                class="feedback-reply-textarea"
                placeholder="Nhập phản hồi bổ sung cho người dùng..."
              ></textarea>

              <div class="feedback-reply-actions">
                <small>{{ replyDraft.trim().length }} ký tự</small>
                <button
                  class="feedback-save-btn"
                  type="button"
                  :disabled="saving || !replyDraft.trim()"
                  @click="sendReply('manual')"
                >
                  <i class="bi bi-reply-fill"></i>
                  {{ saving ? 'Đang lưu...' : 'Gửi phản hồi thêm' }}
                </button>
              </div>
            </article>
          </template>

          <div v-else class="feedback-state">Chọn một phản hồi để xem chi tiết.</div>
        </section>
      </div>
    </section>
  </MainLayout>
</template>
