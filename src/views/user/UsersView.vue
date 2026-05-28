<script setup>
import { ref, computed, onMounted } from 'vue'
import '@/assets/css/user/list-user.css'
import MainLayout from '@/components/layout/MainLayout.vue'

import { getUsers, updateUserStatus } from '@/services/userService'
import { getInitial } from '@/utils/stringHelper'
import { useLoadingStore } from '@/stores/loadingStore'
import { useToastStore } from '@/stores/toastStore'

const loadingStore = useLoadingStore()
const toastStore = useToastStore()

const users = ref([])

const searchText = ref('')
const viewMode = ref('table')
const quickFilter = ref('')

const currentPage = ref(1)
const pageSize = 10

const sortField = ref('createdAt')
const sortAsc = ref(false)

const fromDate = ref(null)
const toDate = ref(null)

const errorImages = ref(new Set())

// ==========================
// LOAD USERS
// ==========================
const loadUsers = async () => {
  loadingStore.show()

  try {
    users.value = await getUsers()
  } catch (err) {
    toastStore.error('Không tải được danh sách user')
  } finally {
    loadingStore.hide()
  }
}

onMounted(loadUsers)

// ==========================
// IMAGE FALLBACK
// ==========================
const onImageError = (uid) => {
  errorImages.value.add(uid)
}

// ==========================
// SORT
// ==========================
const sort = (field) => {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value
  } else {
    sortField.value = field
    sortAsc.value = true
  }
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'bi bi-arrow-down-up sort-icon'

  return sortAsc.value ? 'bi bi-arrow-up sort-icon active' : 'bi bi-arrow-down sort-icon active'
}

const formatDateTime = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('vi-VN')
}

// ==========================
// QUICK FILTER
// ==========================
const applyQuickFilter = () => {
  const now = new Date()

  switch (quickFilter.value) {
    case 'week':
      fromDate.value = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break

    case 'month':
      fromDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
      break

    case 'year':
      fromDate.value = new Date(now.getFullYear(), 0, 1)
      break

    default:
      fromDate.value = null
      toDate.value = null
      break
  }

  toDate.value = now
  currentPage.value = 1
}

// ==========================
// FILTER + SORT
// ==========================
const processedUsers = computed(() => {
  let filtered = users.value.filter((u) => {
    const matchSearch =
      !searchText.value ||
      u.displayName?.toLowerCase().includes(searchText.value.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchText.value.toLowerCase())

    const createdAt = u.createdAt ? new Date(u.createdAt) : null

    const matchDate =
      (!fromDate.value || createdAt >= fromDate.value) &&
      (!toDate.value || createdAt <= toDate.value)

    return matchSearch && matchDate
  })

  filtered.sort((a, b) => {
    const field = sortField.value

    let valueA = a[field]
    let valueB = b[field]

    if (field === 'createdAt') {
      valueA = valueA ? new Date(valueA) : new Date(0)
      valueB = valueB ? new Date(valueB) : new Date(0)
    }

    if (valueA < valueB) return sortAsc.value ? -1 : 1

    if (valueA > valueB) return sortAsc.value ? 1 : -1

    return 0
  })

  return filtered
})

// ==========================
// PAGINATION
// ==========================
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return processedUsers.value.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  return Math.ceil(processedUsers.value.length / pageSize)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// ==========================
// UPDATE STATUS
// ==========================
/* const oldConfirmToggleStatus = async (user, newStatus) => {
  const action = newStatus === 'locked' ? 'khóa' : 'mở'

  const ok = confirm(`Bạn có chắc muốn ${action} tài khoản ${user.displayName}?`)

  if (!ok) return

  await toggleStatus(user, newStatus)
}

const oldToggleStatus = async (user, newStatus) => {
  try {
    await updateUserStatus(user.uid, newStatus)

    user.status = newStatus

    toastStore.success(`Đã cập nhật ${user.displayName}`)
  } catch {
    toastStore.error('Cập nhật trạng thái thất bại')
  }
}
*/
const confirmToggleStatus = async (user, newStatus) => {
  let lockDays = null

  if (newStatus === 'locked') {
    const rawDays = prompt(
      'Nhập số ngày khóa tài khoản. Bỏ trống nếu muốn khóa vô thời hạn.',
    )

    if (rawDays === null) return

    const trimmedDays = rawDays.trim()
    if (trimmedDays !== '') {
      const parsedDays = Number(trimmedDays)

      if (!Number.isInteger(parsedDays) || parsedDays <= 0) {
        toastStore.error('Số ngày khóa phải là số nguyên lớn hơn 0')
        return
      }

      lockDays = parsedDays
    }
  }

  const action = newStatus === 'locked' ? 'khóa' : 'mở khóa'
  const durationText = lockDays ? ` trong ${lockDays} ngày` : ''
  const ok = confirm(`Bạn có chắc muốn ${action} tài khoản ${user.displayName}${durationText}?`)

  if (!ok) return

  await toggleStatus(user, newStatus, lockDays)
}

const toggleStatus = async (user, newStatus, lockDays = null) => {
  try {
    await updateUserStatus(user.uid, newStatus, lockDays)

    user.status = newStatus
    user.unlockAt =
      newStatus === 'locked' && lockDays
        ? new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000).toISOString()
        : null

    toastStore.success(`Đã cập nhật ${user.displayName}`)
  } catch {
    toastStore.error('Cập nhật trạng thái thất bại')
  }
}
</script>

<template>
  <MainLayout>
    <h3 class="page-title">Quản lý người dùng</h3>

    <div class="toolbar">
      <!-- LEFT -->
      <div class="toolbar-left">
        <input v-model="searchText" placeholder="Tìm kiếm..." />

        <select v-model="quickFilter" @change="applyQuickFilter">
          <option value="">Tất cả</option>

          <option value="week">Tuần này</option>

          <option value="month">Tháng này</option>

          <option value="year">Năm nay</option>
        </select>
      </div>

      <!-- RIGHT -->
      <div class="toolbar-right">
        <div class="view-toggle">
          <i
            class="bi bi-table"
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          ></i>

          <i
            class="bi bi-grid"
            :class="{ active: viewMode === 'card' }"
            @click="viewMode = 'card'"
          ></i>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <table v-if="viewMode === 'table'" class="my-table">
      <thead>
        <tr>
          <th @click="sort('displayName')">
            Người dùng

            <i :class="getSortIcon('displayName')" />
          </th>

          <th @click="sort('email')">
            Email

            <i :class="getSortIcon('email')" />
          </th>

          <th @click="sort('createdAt')">
            Ngày tạo

            <i :class="getSortIcon('createdAt')" />
          </th>

          <th>VIP</th>

          <th>Trạng thái</th>

          <th>Mở khóa lúc</th>

          <th />
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in pagedUsers" :key="u.uid">
          <!-- USER -->
          <td>
            <div class="user-css">
              <div class="avatar-wrapper">
                <img
                  v-if="u.photoURL && !errorImages.has(u.uid)"
                  :src="u.photoURL"
                  class="avatar"
                  @error="onImageError(u.uid)"
                />

                <div v-else class="avatar-fallback">
                  {{ getInitial(u.displayName) }}
                </div>
              </div>

              <div class="user-display">
                {{ u.displayName }}
              </div>
            </div>
          </td>

          <!-- EMAIL -->
          <td>
            {{ u.email }}
          </td>

          <!-- CREATED -->
          <td>
            {{ u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '-' }}
          </td>

          <!-- VIP -->
          <td>
            <span v-if="u.vipUser" class="badge-vip vip-badge-text">
              <i class="bi bi-star-fill" />

              {{ u.vipUser.name }}
            </span>
          </td>

          <!-- STATUS -->
          <td>
            <span class="badge status-badge" :class="u.status === 'active' ? 'active' : 'locked'">
              <i class="bi" :class="u.status === 'active' ? 'bi-check-circle' : 'bi-lock'" />

              {{ u.status }}
            </span>
          </td>

          <!-- UNLOCK AT -->
          <td>
            {{ formatDateTime(u.unlockAt) }}
          </td>

          <!-- ACTION -->
          <td>
            <button
              v-if="u.status === 'active'"
              class="btn-danger"
              @click="confirmToggleStatus(u, 'locked')"
            >
              <i class="bi bi-lock" />
            </button>

            <button v-else class="btn-success" @click="confirmToggleStatus(u, 'active')">
              <i class="bi bi-unlock" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- CARD -->
    <div v-if="viewMode === 'card'" class="card-grid">
      <div v-for="u in pagedUsers" :key="u.uid" class="user-card">
        <div class="avatar-wrapper">
          <img
            v-if="u.photoURL && !errorImages.has(u.uid)"
            :src="u.photoURL"
            class="avatar"
            @error="onImageError(u.uid)"
          />

          <div v-else class="avatar-fallback">
            {{ getInitial(u.displayName) }}
          </div>
        </div>

        <h4>
          {{ u.displayName }}
        </h4>

        <p>
          {{ u.email }}
        </p>

        <span class="vip">
          {{ u.vipUser?.name || '-' }}
        </span>

        <p class="unlock-at">
          Mở khóa: {{ formatDateTime(u.unlockAt) }}
        </p>

        <div class="card-actions">
          <button
            v-if="u.status === 'active'"
            class="btn-danger"
            @click="confirmToggleStatus(u, 'locked')"
          >
            <i class="bi bi-lock" />
          </button>

          <button v-else class="btn-success" @click="confirmToggleStatus(u, 'active')">
            <i class="bi bi-unlock" />
          </button>
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="pagination">
      <button @click="prevPage">Prev</button>

      <span> {{ currentPage }} / {{ totalPages }} </span>

      <button @click="nextPage">Next</button>
    </div>
  </MainLayout>
</template>
