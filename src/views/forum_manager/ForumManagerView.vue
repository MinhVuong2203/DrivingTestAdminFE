<script setup>
import { onMounted, ref, computed } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import '@/assets/css/forum_manager/forum-manager.css'
import { useLoadingStore } from '@/stores/loadingStore'
import { 
  getPosts, 
  getCommentsByPostId, 
  deletePost,
  getModerationKeywords,
  createModerationKeyword,
  toggleModerationKeyword,
  getAutoDeleteStatus,
  updateAutoDeleteStatus 
} from '@/services/forumManager'

const loadingStore = useLoadingStore()

const showCommentModal = ref(false)
const selectedPost = ref(null)
const comments = ref([])
const commentLoading = ref(false)
const commentError = ref('')

const posts = ref([])
const loading = ref(false)
const error = ref('')

const currentPage = ref(1)
const pageSize = ref(6)

const selectedPostIds = ref([])
const isDeleting = ref(false)

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

const selectedCount = computed(() => selectedPostIds.value.length)

const isAllCurrentPageSelected = computed(() => {
  if (pagedPosts.value.length === 0) return false

  return pagedPosts.value.every((post) =>
    selectedPostIds.value.includes(post.postId)
  )
})

const showDeleteModal = ref(false)

const openDeleteModal = () => {
  if (selectedCount.value === 0) return
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  showDeleteModal.value = false
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

const openComments = async (post) => {
  selectedPost.value = post
  showCommentModal.value = true
  commentLoading.value = true
  commentError.value = ''
  comments.value = []

  try {
    comments.value = await getCommentsByPostId(post.postId)
  } catch (err) {
    commentError.value = err?.response?.data || 'Không thể tải bình luận'
  } finally {
    commentLoading.value = false
  }
}

const closeComments = () => {
  showCommentModal.value = false
  selectedPost.value = null
  comments.value = []
  commentError.value = ''
}

const toggleSelectPost = (postId) => {
  if (selectedPostIds.value.includes(postId)) {
    selectedPostIds.value = selectedPostIds.value.filter((id) => id !== postId)
  } else {
    selectedPostIds.value.push(postId)
  }
}

const toggleSelectCurrentPage = () => {
  const currentIds = pagedPosts.value.map((post) => post.postId)

  if (isAllCurrentPageSelected.value) {
    selectedPostIds.value = selectedPostIds.value.filter(
      (id) => !currentIds.includes(id)
    )
  } else {
    const merged = new Set([...selectedPostIds.value, ...currentIds])
    selectedPostIds.value = Array.from(merged)
  }
}

const clearSelection = () => {
  selectedPostIds.value = []
}

const deleteSelectedPosts = async () => {
  if (selectedPostIds.value.length === 0) return

  isDeleting.value = true

  try {
    await Promise.all(
      selectedPostIds.value.map((postId) => deletePost(postId))
    )

    posts.value = posts.value.map((post) => {
      if (selectedPostIds.value.includes(post.postId)) {
        return {
          ...post,
          isDeleted: true,
          status: false,
          updatedAt: new Date().toISOString()
        }
      }

      return post
    })

    selectedPostIds.value = []
    showDeleteModal.value = false

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (err) {
    error.value = err?.response?.data || 'Không thể xóa bài viết'
  } finally {
    isDeleting.value = false
  }
}

const autoDeleteEnabled = ref(false)
const keywords = ref([])
const newKeyword = ref('')
const moderationLoading = ref(false)

const showKeywordModal = ref(false)

const openKeywordModal = () => {
  newKeyword.value = ''
  showKeywordModal.value = true
}

const closeKeywordModal = () => {
  if (moderationLoading.value) return
  showKeywordModal.value = false
}

const loadModerationData = async () => {
  try {
    const setting = await getAutoDeleteStatus()
    autoDeleteEnabled.value = setting.enabled === true

    keywords.value = await getModerationKeywords()
  } catch (err) {
    error.value = err?.response?.data || 'Không thể tải cấu hình kiểm duyệt'
  }
}

const toggleAutoDelete = async () => {
  try {
    moderationLoading.value = true

    const nextValue = !autoDeleteEnabled.value
    await updateAutoDeleteStatus(nextValue)

    autoDeleteEnabled.value = nextValue
  } catch (err) {
    error.value = err?.response?.data || 'Không thể cập nhật tự động xóa'
  } finally {
    moderationLoading.value = false
  }
}

const addKeyword = async () => {
  const value = newKeyword.value.trim()

  if (!value) return

  try {
    moderationLoading.value = true

    const created = await createModerationKeyword(value)

    keywords.value.unshift(created)
    newKeyword.value = ''
    showKeywordModal.value = false
  } catch (err) {
    error.value = err?.response?.data || 'Không thể thêm keyword'
  } finally {
    moderationLoading.value = false
  }
}

const showKeywordManagerModal = ref(false)

const openKeywordManagerModal = () => {
  showKeywordManagerModal.value = true
}

const closeKeywordManagerModal = () => {
  showKeywordManagerModal.value = false
}

const toggleKeyword = async (keyword) => {
  try {
    const nextValue = !keyword.isActive

    await toggleModerationKeyword(keyword.keywordId, nextValue)

    keyword.isActive = nextValue
  } catch (err) {
    error.value = err?.response?.data || 'Không thể cập nhật keyword'
  }
}

onMounted(() => {
  loadPosts()
  loadModerationData()
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

      <div class="moderation-panel compact">
        <div class="moderation-left">
          <h3>Kiểm duyệt nội dung</h3>
          <p>Tự động đánh dấu bài viết là đã xóa nếu nội dung chứa keyword vi phạm.</p>
        </div>

        <div class="moderation-actions">
          <button
            class="auto-delete-btn"
            :class="{ active: autoDeleteEnabled }"
            :disabled="moderationLoading"
            @click="toggleAutoDelete"
          >
            {{ autoDeleteEnabled ? 'Tự động xóa: Bật' : 'Tự động xóa: Tắt' }}
          </button>

          <button class="add-keyword-btn" @click="openKeywordModal">
            + Thêm keyword
          </button>
          <button class="manage-keyword-btn" @click="openKeywordManagerModal">
            Quản lý keyword
          </button>
        </div>
      </div>

      <div class="bulk-actions">
        <label class="select-all">
          <input
            type="checkbox"
            :checked="isAllCurrentPageSelected"
            @change="toggleSelectCurrentPage"
          />
          <span>Chọn tất cả trang hiện tại</span>
        </label>

        <div class="bulk-right">
          <span v-if="selectedCount > 0" class="selected-count">
            Đã chọn {{ selectedCount }} bài viết
          </span>

          <button
            v-if="selectedCount > 0"
            class="clear-btn"
            @click="clearSelection"
          >
            Bỏ chọn
          </button>

          <!-- <button
            class="delete-selected-btn"
            :disabled="selectedCount === 0 || isDeleting"
            @click="deleteSelectedPosts"
          >
            {{ isDeleting ? 'Đang xóa...' : 'Xóa bài vi phạm' }}
          </button> -->
          <button
            class="delete-selected-btn"
            :disabled="selectedCount === 0 || isDeleting"
            @click="openDeleteModal"
          >
            {{ isDeleting ? 'Đang xóa...' : 'Xóa bài vi phạm' }}
          </button>
        </div>
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
            :class="{ selected: selectedPostIds.includes(post.postId) }"
          >
            <label class="post-checkbox" @click.stop>
              <input
                type="checkbox"
                :checked="selectedPostIds.includes(post.postId)"
                @change="toggleSelectPost(post.postId)"
              />
              <span>Chọn bài vi phạm</span>
            </label>
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
              <button class="comment-link" @click="openComments(post)">
                💬 {{ post.commentCount || 0 }} bình luận
              </button>
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
    <div v-if="showDeleteModal" class="delete-modal-backdrop">
      <div class="delete-modal">
        <div class="delete-icon">
          !
        </div>

        <h3>Xóa bài viết vi phạm?</h3>

        <p>
          Bạn đang chọn <b>{{ selectedCount }}</b> bài viết. Các bài viết này sẽ bị xóa khỏi danh sách hiển thị.
        </p>

        <div class="delete-modal-actions">
          <button
            class="cancel-modal-btn"
            :disabled="isDeleting"
            @click="closeDeleteModal"
          >
            Hủy
          </button>

          <button
            class="confirm-delete-btn"
            :disabled="isDeleting"
            @click="deleteSelectedPosts"
          >
            {{ isDeleting ? 'Đang xóa...' : 'Xác nhận xóa' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="showKeywordModal" class="keyword-modal-backdrop">
      <div class="keyword-modal">
        <div class="keyword-modal-header">
          <h3>Thêm keyword vi phạm</h3>
          <button class="keyword-close-btn" @click="closeKeywordModal">×</button>
        </div>

        <p class="keyword-modal-desc">
          Nhập từ khóa vi phạm. Khi bài viết chứa từ khóa này và chế độ tự động xóa đang bật, bài viết sẽ bị đánh dấu là đã xóa.
        </p>

        <input
          v-model="newKeyword"
          class="keyword-modal-input"
          type="text"
          placeholder="Ví dụ: spam, tục tĩu..."
          autofocus
          @keyup.enter="addKeyword"
        />

        <div class="keyword-modal-actions">
          <button
            class="keyword-cancel-btn"
            :disabled="moderationLoading"
            @click="closeKeywordModal"
          >
            Hủy
          </button>

          <button
            class="keyword-submit-btn"
            :disabled="moderationLoading || !newKeyword.trim()"
            @click="addKeyword"
          >
            {{ moderationLoading ? 'Đang thêm...' : 'Thêm keyword' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showKeywordManagerModal" class="keyword-table-backdrop">
      <div class="keyword-table-modal">
        <div class="keyword-table-header">
          <div>
            <h3>Quản lý keyword vi phạm</h3>
            <p>Danh sách tất cả keyword đang dùng để kiểm duyệt bài viết.</p>
          </div>

          <button class="keyword-close-btn" @click="closeKeywordManagerModal">
            ×
          </button>
        </div>

        <div v-if="keywords.length === 0" class="keyword-empty-table">
          Chưa có keyword nào
        </div>

        <div v-else class="keyword-table-wrap">
          <table class="keyword-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Keyword</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in keywords"
                :key="item.keywordId"
              >
                <td>{{ index + 1 }}</td>

                <td>
                  <b>{{ item.keyword }}</b>
                </td>

                <td>
                  <span
                    class="keyword-status"
                    :class="{ active: item.isActive }"
                  >
                    {{ item.isActive ? 'Đang bật' : 'Đang tắt' }}
                  </span>
                </td>

                <td>{{ formatDate(item.createdAt) }}</td>

                <td>
                  <button
                    class="keyword-action-btn"
                    :class="{ off: item.isActive }"
                    @click="toggleKeyword(item)"
                  >
                    {{ item.isActive ? 'Tắt' : 'Bật' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>

<div v-if="showCommentModal" class="fb-backdrop">
  <button class="fb-floating-close" @click="closeComments">×</button>

  <div class="fb-post-modal">
    <div class="fb-modal-header">
      <h3>Bài viết của {{ selectedPost?.authorName || 'Người dùng' }}</h3>
      <button class="fb-close-btn" @click="closeComments">×</button>
    </div>

    <div class="fb-modal-body">
      <div class="fb-post-section">
        <div class="fb-author-row">
          <img
            v-if="isValidImage(selectedPost?.authorAvatar)"
            :src="selectedPost.authorAvatar"
            alt="avatar"
          />
          <div v-else class="fb-avatar">
            {{ selectedPost?.authorName?.charAt(0) || 'U' }}
          </div>

          <div>
            <h4>{{ selectedPost?.authorName || 'Người dùng' }}</h4>
            <span>{{ formatDate(selectedPost?.createdAt) }}</span>
          </div>
        </div>

        <p class="fb-post-content">
          {{ selectedPost?.content }}
        </p>

        <img
          v-if="isValidImage(selectedPost?.imageUrl)"
          class="fb-post-image"
          :src="selectedPost.imageUrl"
          alt="post image"
        />

        <div class="fb-post-stats">
          <span>❤️ {{ selectedPost?.likeCount || 0 }}</span>
          <span>💬 {{ selectedPost?.commentCount || 0 }} bình luận</span>
        </div>
      </div>

      <div class="fb-comment-section">
        <div v-if="commentLoading" class="comment-state">
          Đang tải bình luận...
        </div>

        <div v-else-if="commentError" class="comment-error">
          {{ commentError }}
        </div>

        <div v-else-if="comments.length === 0" class="comment-state">
          Chưa có bình luận nào
        </div>

        <div v-else class="fb-comment-list">
          <div
            v-for="comment in comments"
            :key="comment.commentId"
            class="fb-comment-item"
          >
            <img
              v-if="isValidImage(comment.authorAvatar)"
              :src="comment.authorAvatar"
              alt="avatar"
            />

            <div v-else class="fb-comment-avatar">
              {{ comment.authorName?.charAt(0) || 'U' }}
            </div>

            <div class="fb-comment-main">
              <div class="fb-comment-bubble">
                <h5>{{ comment.authorName || 'Người dùng' }}</h5>
                <p>{{ comment.content }}</p>
              </div>

              <div class="fb-comment-actions">
                <span>{{ formatDate(comment.createdAt) }}</span>
                <b>Thích</b>
                <b>Trả lời</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fb-comment-input">
      <div class="fb-input-avatar">A</div>
      <input placeholder="Viết bình luận..." />
      <button>➤</button>
    </div>
  </div>
</div>
</template>