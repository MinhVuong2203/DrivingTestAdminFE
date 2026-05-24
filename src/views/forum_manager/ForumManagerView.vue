<script setup>
import { onMounted, ref, computed } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import '@/assets/css/forum_manager/forum-manager.css'
import { useLoadingStore } from '@/stores/loadingStore'
import { getPosts } from '@/services/forumManager'

const loadingStore = useLoadingStore()

const posts = ref([])
const loading = ref(false)
const error = ref('')

const currentPage = ref(1)
const pageSize = ref(6)

const totalPages = computed(() => {
  return Math.ceil(posts.value.length / pageSize.value) || 1
})

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return posts.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const loadPosts = async () => {
  loading.value = true
  loadingStore.show()
  error.value = ''

  try {
    const data = await getPosts()

    posts.value = data.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    currentPage.value = 1
  } catch (err) {
    error.value = err?.response?.data || 'Không thể tải bài viết'
  } finally {
    loading.value = false
    loadingStore.hide()
  }
}

function formatDate(value) {
  if (!value) return 'Không rõ thời gian'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('vi-VN')
}

function isValidImage(url) {
  if (!url) return false
  if (url === 'string') return false
  return url.startsWith('http://') || url.startsWith('https://')
}

onMounted(() => {
  loadPosts()
})
</script>

<template>
  <MainLayout>
    <div class="forum-page">
      <div class="page-header">
        <div>
          <h2>Quản lý diễn đàn</h2>
          <p>Danh sách tất cả bài viết trong hệ thống</p>
        </div>

        <button class="reload-btn" @click="loadPosts">
          Tải lại
        </button>
      </div>

      <div v-if="loading" class="state-box">
        Đang tải bài viết...
      </div>

      <div v-else-if="error" class="error-box">
        {{ error }}
      </div>

      <div v-else-if="posts.length === 0" class="state-box">
        Chưa có bài viết nào
      </div>

      <template v-else>
        <div class="post-grid">
          <div
            v-for="post in pagedPosts"
            :key="post.postId"
            class="post-card"
          >
            <div class="post-top">
              <div class="author">
                <img
                  v-if="post.authorAvatar && post.authorAvatar !== 'string'"
                  :src="post.authorAvatar"
                  alt="avatar"
                />

                <div v-else class="avatar-placeholder">
                  {{ post.authorName?.charAt(0) || 'U' }}
                </div>

                <div>
                  <h3>{{ post.authorName || 'Người dùng' }}</h3>
                  <span>{{ formatDate(post.createdAt) }}</span>
                </div>
              </div>

              <span
                class="status"
                :class="post.isDeleted ? 'deleted' : post.status ? 'active' : 'hidden'"
              >
                {{ post.isDeleted ? 'Đã xóa' : post.status ? 'Đang hiển thị' : 'Đã ẩn' }}
              </span>
            </div>

            <p class="content">
              {{ post.content }}
            </p>

            <img
              v-if="isValidImage(post.imageUrl)"
              class="post-image"
              :src="post.imageUrl"
              alt="post image"
            />

            <div v-if="post.address" class="address">
              📍 {{ post.address }}
            </div>

            <div class="stats">
              <span>❤️ {{ post.likeCount || 0 }} lượt thích</span>
              <span>💬 {{ post.commentCount || 0 }} bình luận</span>
            </div>

            <div class="meta">
              <span>ID: {{ post.postId }}</span>
              <span>Tác giả: {{ post.authorId }}</span>
            </div>
          </div>
        </div>

        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            Prev
          </button>

          <span class="page-info">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            Next
          </button>
        </div>
      </template>
    </div>
  </MainLayout>
</template>