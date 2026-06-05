<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'
import '@/assets/css/user/list-user.css'
import MainLayout from '@/components/layout/MainLayout.vue'

import { getUsers, updateUserRole, updateUserStatus } from '@/services/userService'
import { auth, db } from '@/services/firebase'
import { getInitial } from '@/utils/stringHelper'
import { useLoadingStore } from '@/stores/loadingStore'
import { useToastStore } from '@/stores/toastStore'

const loadingStore = useLoadingStore()
const toastStore = useToastStore()

const users = ref([])
const currentAdmin = ref(null)

const searchText = ref('')
const viewMode = ref('table')
const quickFilter = ref('')
const roleFilter = ref('')

const currentPage = ref(1)
const pageSize = 4
const currentCursor = ref(null)
const nextCursor = ref(null)
const hasNextPage = ref(false)
const cursorHistory = ref([])

const sortField = ref('createdAt')
const sortAsc = ref(false)

const fromDate = ref(null)
const toDate = ref(null)

const errorImages = ref(new Set())
let searchTimer = null

const isRootAdmin = computed(() => currentAdmin.value?.isImportant === true)

const getAuthUser = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

const loadCurrentAdmin = async () => {
  const authUser = await getAuthUser()
  const uid = authUser?.uid
  if (!uid) return

  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) {
    currentAdmin.value = { uid: snap.id, ...snap.data() }
  }

  if (currentAdmin.value?.isImportant === true || !authUser.email) {
    return
  }

  const emailQuery = query(
    collection(db, 'users'),
    where('email', '==', authUser.email),
    limit(1),
  )
  const emailSnap = await getDocs(emailQuery)
  const emailDoc = emailSnap.docs[0]

  if (emailDoc?.exists()) {
    currentAdmin.value = { uid: emailDoc.id, ...emailDoc.data() }
  }
}

const toQueryDate = (value) => {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const buildQueryParams = (cursor = currentCursor.value) => ({
  pageSize,
  cursor,
  search: searchText.value.trim() || null,
  role: roleFilter.value || null,
  fromDate: toQueryDate(fromDate.value),
  toDate: toQueryDate(toDate.value),
  sortField: sortField.value,
  sortDirection: sortAsc.value ? 'asc' : 'desc',
})

const loadUsers = async (cursor = currentCursor.value) => {
  loadingStore.show()

  try {
    const result = await getUsers(buildQueryParams(cursor))
    users.value = (result.items || []).map((user) => {
      const isCurrentRootAdmin =
        currentAdmin.value?.isImportant === true &&
        (user.uid === currentAdmin.value.uid || user.email === currentAdmin.value.email)

      return isCurrentRootAdmin ? { ...user, isImportant: true } : user
    })
    nextCursor.value = result.nextCursor || null
    hasNextPage.value = result.hasNextPage === true
  } catch (err) {
    toastStore.error('Không tải được danh sách user')
  } finally {
    loadingStore.hide()
  }
}

const resetPaginationAndLoad = async () => {
  currentPage.value = 1
  currentCursor.value = null
  nextCursor.value = null
  cursorHistory.value = []
  await loadUsers(null)
}

onMounted(async () => {
  await loadCurrentAdmin()
  await loadUsers()
})

const onImageError = (uid) => {
  errorImages.value.add(uid)
}

const sort = async (field) => {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value
  } else {
    sortField.value = field
    sortAsc.value = true
  }

  await resetPaginationAndLoad()
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

const applyQuickFilter = async () => {
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

  if (quickFilter.value) {
    toDate.value = now
  }

  await resetPaginationAndLoad()
}

watch(searchText, () => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    resetPaginationAndLoad()
  }, 350)
})

const nextPage = async () => {
  if (!hasNextPage.value || !nextCursor.value) return

  cursorHistory.value.push(currentCursor.value)
  currentCursor.value = nextCursor.value
  currentPage.value++
  await loadUsers(currentCursor.value)
}

const prevPage = async () => {
  if (currentPage.value <= 1) return

  currentCursor.value = cursorHistory.value.pop() || null
  currentPage.value--
  await loadUsers(currentCursor.value)
}

const isAdminRole = (user) => user.role?.toLowerCase() === 'admin'
const canManageAdminTarget = (user) => !isAdminRole(user) || isRootAdmin.value
const canChangeRole = (user) =>
  isRootAdmin.value && user.uid !== currentAdmin.value?.uid && user.isImportant !== true

const confirmToggleStatus = async (user, newStatus) => {
  if (!canManageAdminTarget(user)) {
    toastStore.error('Admin thường không thể thao tác trên admin khác')
    return
  }

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

const confirmChangeRole = async (user, role) => {
  if (!canChangeRole(user)) return

  const action = role === 'admin' ? 'thăng cấp admin' : 'hạ xuống user'
  const ok = confirm(`Bạn có chắc muốn ${action} cho ${user.displayName}?`)
  if (!ok) return

  try {
    await updateUserRole(user.uid, role)
    user.role = role
    user.isImportant = false
    toastStore.success(`Đã cập nhật quyền ${user.displayName}`)
  } catch {
    toastStore.error('Cập nhật quyền thất bại')
  }
}
</script>

<template>
  <MainLayout>
    <h3 class="page-title">Quản lý người dùng</h3>

    <div class="toolbar">
      <div class="toolbar-left">
        <input v-model="searchText" placeholder="Tìm kiếm theo tên/email..." />

        <select v-model="quickFilter" @change="applyQuickFilter">
          <option value="">Tất cả</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>

        <select v-model="roleFilter" @change="resetPaginationAndLoad">
          <option value="">Tất cả vai trò</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        
      </div>

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

          <th>Vai trò</th>
          <th>VIP</th>
          <th>Trạng thái</th>
          <th>Mở khóa lúc</th>
          <th />
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in users" :key="u.uid">
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

          <td>{{ u.email }}</td>

          <td>
            {{ u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '-' }}
          </td>

          <td>
            <span class="badge role-badge" :class="isAdminRole(u) ? 'admin' : 'user'">
              <i class="bi" :class="isAdminRole(u) ? 'bi-shield-lock' : 'bi-person'" />
              {{ u.isImportant ? 'admin gốc' : u.role || 'user' }}
            </span>
          </td>

          <td>
            <span v-if="u.vipUser" class="badge-vip vip-badge-text">
              <i class="bi bi-star-fill" />
              {{ u.vipUser.name }}
            </span>
          </td>

          <td>
            <span class="badge status-badge" :class="u.status === 'active' ? 'active' : 'locked'">
              <i class="bi" :class="u.status === 'active' ? 'bi-check-circle' : 'bi-lock'" />
              {{ u.status }}
            </span>
          </td>

          <td>{{ formatDateTime(u.unlockAt) }}</td>

          <td>
            <div class="action-group">
              <button
                v-if="canManageAdminTarget(u) && u.status === 'active'"
                class="btn-danger"
                title="Khóa tài khoản"
                @click="confirmToggleStatus(u, 'locked')"
              >
                <i class="bi bi-lock" />
              </button>

              <button
                v-else-if="canManageAdminTarget(u)"
                class="btn-success"
                title="Mở khóa tài khoản"
                @click="confirmToggleStatus(u, 'active')"
              >
                <i class="bi bi-unlock" />
              </button>

              <button
                v-if="canChangeRole(u) && !isAdminRole(u)"
                class="btn-admin"
                title="Thăng cấp admin"
                @click="confirmChangeRole(u, 'admin')"
              >
                <i class="bi bi-shield-plus" />
              </button>

              <button
                v-if="canChangeRole(u) && isAdminRole(u)"
                class="btn-warning"
                title="Hạ xuống user"
                @click="confirmChangeRole(u, 'user')"
              >
                <i class="bi bi-shield-minus" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="viewMode === 'card'" class="card-grid">
      <div v-for="u in users" :key="u.uid" class="user-card">
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

        <h4>{{ u.displayName }}</h4>
        <p>{{ u.email }}</p>

        <span class="badge role-badge" :class="isAdminRole(u) ? 'admin' : 'user'">
          {{ u.isImportant ? 'admin gốc' : u.role || 'user' }}
        </span>

        <span class="vip">{{ u.vipUser?.name || '-' }}</span>

        

        <div class="card-actions action-group">
          <button
            v-if="canManageAdminTarget(u) && u.status === 'active'"
            class="btn-danger"
            title="Khóa tài khoản"
            @click="confirmToggleStatus(u, 'locked')"
          >
            <i class="bi bi-lock" />
          </button>

          <button
            v-else-if="canManageAdminTarget(u)"
            class="btn-success"
            title="Mở khóa tài khoản"
            @click="confirmToggleStatus(u, 'active')"
          >
            <i class="bi bi-unlock" />
          </button>

          <button
            v-if="canChangeRole(u) && !isAdminRole(u)"
            class="btn-admin"
            title="Thăng cấp admin"
            @click="confirmChangeRole(u, 'admin')"
          >
            <i class="bi bi-shield-plus" />
          </button>

          <button
            v-if="canChangeRole(u) && isAdminRole(u)"
            class="btn-warning"
            title="Hạ xuống user"
            @click="confirmChangeRole(u, 'user')"
          >
            <i class="bi bi-shield-minus" />
          </button>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button :disabled="currentPage <= 1" @click="prevPage"><</button>
      <span>Trang {{ currentPage }}</span>
      <button :disabled="!hasNextPage" @click="nextPage">></button>
    </div>
  </MainLayout>
</template>
