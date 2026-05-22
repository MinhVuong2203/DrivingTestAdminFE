<script setup>
import { computed, onMounted, ref } from 'vue'

import MainLayout from '@/components/layout/MainLayout.vue'

import '@/assets/css/vip/vip-management.css'

import {
  getVipPackages,
  createVipPackage,
  updateVipPackage,
  deleteVipPackage,
  toggleVipPackageStatus,
} from '@/services/vipPackageService'

import { useToastStore } from '@/stores/toastStore'
import { useLoadingStore } from '@/stores/loadingStore'

const toastStore = useToastStore()
const loadingStore = useLoadingStore()

/* =========================================
   STATE
========================================= */

const allPackages = ref([])

const searchKeyword = ref('')

const filterStatus = ref('all')

const showModal = ref(false)

const isEditMode = ref(false)

const isSaving = ref(false)

const showDeleteConfirm = ref(false)

const isDeleting = ref(false)

const packageToDelete = ref(null)

const DEFAULT_DESCRIPT = [
  'Không hiển thị quảng cáo',
  'Không giới hạn truy cập nhận diện biển báo',
  'Mở full bộ đề',
  'Gắn sao trên diễn đàn',
]

const THEME_OPTIONS = [
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'green', label: 'Green' },
]

const createEmptyPackage = () => ({
  id: null,
  vipName: '',
  vipPrice: 0,
  priceInline: null,
  isPeriod: false,
  vipTime: null,
  descript: [...DEFAULT_DESCRIPT],
  isActive: true,
  colorTheme: 'blue',
})

const currentPackage = ref(createEmptyPackage())

const getPackageDescriptions = (pkg) => {
  if (Array.isArray(pkg.descript)) return pkg.descript
  if (Array.isArray(pkg.features)) return pkg.features
  if (pkg.description) return [pkg.description]
  return DEFAULT_DESCRIPT
}

const formatDuration = (pkg) => (pkg.isPeriod ? 'Vĩnh viễn' : `${pkg.vipTime || 0} ngày`)

const buildPayload = () => {
  const priceInline = Number(currentPackage.value.priceInline)

  const payload = {
    ...currentPackage.value,
    vipPrice: Number(currentPackage.value.vipPrice),
    priceInline: priceInline > 0 ? priceInline : null,
    descript: [...DEFAULT_DESCRIPT],
  }

  if (payload.isPeriod) {
    payload.vipTime = null
  } else {
    payload.vipTime = Number(payload.vipTime)
  }

  return payload
}

const handlePeriodChange = () => {
  if (currentPackage.value.isPeriod) {
    currentPackage.value.vipTime = null
  }
}

/* =========================================
   FILTERED
========================================= */

const filteredPackages = computed(() => {
  let result = [...allPackages.value]

  // STATUS
  if (filterStatus.value === 'active') {
    result = result.filter((p) => p.isActive)
  }

  if (filterStatus.value === 'inactive') {
    result = result.filter((p) => !p.isActive)
  }

  // SEARCH
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()

    result = result.filter(
      (p) =>
        (p.vipName || '').toLowerCase().includes(keyword) ||
        getPackageDescriptions(p).some((item) => item.toLowerCase().includes(keyword)),
    )
  }

  return result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
})

/* =========================================
   LOAD
========================================= */

const loadPackages = async () => {
  try {
    loadingStore.show()

    allPackages.value = await getVipPackages()
  } catch (err) {
    toastStore.error('Không tải được danh sách VIP')
  } finally {
    loadingStore.hide()
  }
}

/* =========================================
   FILTER
========================================= */

const filterByStatus = (status) => {
  filterStatus.value = status
}

/* =========================================
   CREATE
========================================= */

const openCreateModal = () => {
  isEditMode.value = false

  currentPackage.value = {
    ...createEmptyPackage(),
  }

  showModal.value = true
}

/* =========================================
   EDIT
========================================= */

const openEditModal = (pkg) => {
  isEditMode.value = true

  currentPackage.value = {
    ...pkg,
    vipTime: pkg.vipTime ?? null,
    descript: [...DEFAULT_DESCRIPT],
  }

  showModal.value = true
}

/* =========================================
   CLOSE MODAL
========================================= */

const closeModal = () => {
  showModal.value = false
}

/* =========================================
   SAVE
========================================= */

const savePackage = async () => {
  try {
    // VALIDATION
    if (!currentPackage.value.vipName) {
      toastStore.warning('Vui lòng nhập tên gói VIP')

      return
    }

    if (currentPackage.value.vipPrice <= 0) {
      toastStore.warning('Giá phải lớn hơn 0')

      return
    }

    if (!currentPackage.value.isPeriod && currentPackage.value.vipTime <= 0) {
      toastStore.warning('Thời gian phải lớn hơn 0')

      return
    }

    isSaving.value = true

    if (isEditMode.value) {
      await updateVipPackage(currentPackage.value.id, buildPayload())
    } else {
      await createVipPackage(buildPayload())
    }

    toastStore.success(isEditMode.value ? 'Cập nhật thành công' : 'Tạo gói VIP thành công')

    closeModal()

    await loadPackages()
  } catch {
    toastStore.error('Lưu gói VIP thất bại')
  } finally {
    isSaving.value = false
  }
}

/* =========================================
   DELETE
========================================= */

const confirmDelete = (pkg) => {
  packageToDelete.value = pkg
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  packageToDelete.value = null
}

const deletePackageConfirmed = async () => {
  try {
    isDeleting.value = true

    await deleteVipPackage(packageToDelete.value.id)

    toastStore.success('Xóa gói VIP thành công')

    cancelDelete()

    await loadPackages()
  } catch {
    toastStore.error('Xóa gói VIP thất bại')
  } finally {
    isDeleting.value = false
  }
}

/* =========================================
   TOGGLE STATUS
========================================= */

const toggleActiveStatus = async (id) => {
  try {
    loadingStore.show()

    await toggleVipPackageStatus(id)

    toastStore.success('Cập nhật trạng thái thành công')

    await loadPackages()
  } catch {
    toastStore.error('Cập nhật trạng thái thất bại')
  } finally {
    loadingStore.hide()
  }
}

/* ========================================= */

onMounted(loadPackages)
</script>
<template>
  <MainLayout>
    <div class="vip-management">
      <!-- HEADER -->
      <div class="vip-header">
        <div class="vip-header-left">
          <h1>Quản Lý Gói VIP</h1>

          <p>Tạo và quản lý các gói VIP cho người dùng</p>
        </div>

        <div class="vip-header-actions">
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-lg"></i>

            Tạo Gói VIP Mới
          </button>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="vip-toolbar">
        <!-- SEARCH -->
        <div class="vip-search">
          <div class="vip-search-inner">
            <i class="bi bi-search"></i>

            <input v-model="searchKeyword" type="text" placeholder="Tìm kiếm gói VIP..." />
          </div>
        </div>

        <!-- FILTER -->
        <div class="vip-filter-group">
          <button
            class="filter-btn"
            :class="{
              active: filterStatus === 'all',
            }"
            @click="filterByStatus('all')"
          >
            <i class="bi bi-grid"></i>

            Tất cả
          </button>

          <button
            class="filter-btn"
            :class="{
              active: filterStatus === 'active',
            }"
            @click="filterByStatus('active')"
          >
            <i class="bi bi-check-circle"></i>

            Đang hoạt động
          </button>

          <button
            class="filter-btn"
            :class="{
              active: filterStatus === 'inactive',
            }"
            @click="filterByStatus('inactive')"
          >
            <i class="bi bi-x-circle"></i>

            Không hoạt động
          </button>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-if="filteredPackages.length === 0" class="vip-empty">
        <i class="bi bi-gem vip-empty-icon"></i>

        <h3 class="vip-empty-title">Chưa có gói VIP nào</h3>

        <p class="vip-empty-text">
          <template v-if="!searchKeyword"> Bắt đầu bằng cách tạo gói VIP đầu tiên </template>

          <template v-else> Không tìm thấy gói VIP phù hợp với "{{ searchKeyword }}" </template>
        </p>

        <button v-if="!searchKeyword" class="btn btn-primary" @click="openCreateModal">
          <i class="bi bi-plus-lg"></i>

          Tạo Gói VIP Đầu Tiên
        </button>
      </div>

      <!-- GRID -->
      <div v-else class="vip-grid">
        <div
          v-for="pkg in filteredPackages"
          :key="pkg.id"
          class="vip-card"
          :class="`theme-${pkg.colorTheme}`"
        >
          <!-- HEADER -->
          <div class="vip-card-header">
            <div class="vip-card-title-section">
              <!-- BADGE -->
              <div class="vip-card-badge" :class="pkg.isActive ? 'active' : 'inactive'">
                <i :class="pkg.isActive ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>

                <span>
                  {{ pkg.isActive ? 'Hoạt động' : 'Tạm ngưng' }}
                </span>
              </div>

              <!-- TITLE -->
              <h3 class="vip-card-name">
                {{ pkg.vipName }}
              </h3>

              <p class="vip-card-desc">
                {{ pkg.isPeriod ? 'Gói VIP vĩnh viễn' : `Thời hạn ${pkg.vipTime || 0} ngày` }}
              </p>
            </div>

            <!-- ACTIONS -->
            <div class="vip-card-actions">
              <button class="vip-icon-btn" @click="openEditModal(pkg)">
                <i class="bi bi-pencil"></i>
              </button>

              <button class="vip-icon-btn danger" @click="confirmDelete(pkg)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <!-- PRICE -->
          <div class="vip-price-section">
            <div v-if="pkg.priceInline > 0" class="vip-price-inline">
              {{ pkg.priceInline.toLocaleString() }}

              <span> VNĐ </span>
            </div>

            <div class="vip-price">
              {{ pkg.vipPrice.toLocaleString() }}

              <span class="vip-price-currency"> VNĐ </span>
            </div>

            <div class="vip-duration">
              <i class="bi bi-clock"></i>

              <span> {{ formatDuration(pkg) }} </span>
            </div>
          </div>

          <!-- FEATURES -->
          <div v-if="getPackageDescriptions(pkg).length" class="vip-features">
            <div class="vip-features-title">Tính năng</div>

            <ul class="vip-features-list">
              <li v-for="feature in getPackageDescriptions(pkg)" :key="feature">
                <i class="bi bi-check-lg"></i>

                <span>
                  {{ feature }}
                </span>
              </li>
            </ul>
          </div>

          <!-- FOOTER -->
          <div class="vip-card-footer">
            <div class="vip-card-meta">
              <div class="vip-meta-item">
                <i class="bi bi-calendar"></i>

                <span>
                  {{ new Date(pkg.updatedAt || pkg.createdAt).toLocaleDateString('vi-VN') }}
                </span>
              </div>
            </div>

            <button class="btn btn-secondary" @click="toggleActiveStatus(pkg.id)">
              <i :class="pkg.isActive ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>

              {{ pkg.isActive ? 'Tắt' : 'Bật' }}
            </button>
          </div>
        </div>
      </div>

      <!-- CREATE / EDIT MODAL -->
      <div v-if="showModal" class="vip-modal-overlay" @click="closeModal">
        <div class="vip-modal" @click.stop>
          <!-- HEADER -->
          <div class="vip-modal-header">
            <h2 class="vip-modal-title">
              {{ isEditMode ? 'Chỉnh Sửa Gói VIP' : 'Tạo Gói VIP Mới' }}
            </h2>

            <button class="vip-modal-close" @click="closeModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- BODY -->
          <div class="vip-modal-body">
            <!-- NAME -->
            <div class="form-group">
              <label class="form-label required"> Tên Gói VIP </label>

              <input
                v-model="currentPackage.vipName"
                type="text"
                class="form-input"
                placeholder="VD: VIP 6 tháng"
              />
            </div>

            <!-- PRICE + TIME -->
            <div class="form-grid-2">
              <!-- PRICE -->
              <div class="form-group">
                <label class="form-label required"> Giá Gói VIP </label>

                <input
                  v-model="currentPackage.vipPrice"
                  type="number"
                  class="form-input"
                  placeholder="Nhập giá..."
                />
              </div>

              <div class="form-group">
                <label class="form-label"> Giá Gốc </label>

                <input
                  v-model="currentPackage.priceInline"
                  type="number"
                  class="form-input"
                  placeholder="Nhập giá gốc..."
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label"> Loại thời hạn </label>

                <label class="switch-wrapper period-switch">
                  <input
                    v-model="currentPackage.isPeriod"
                    type="checkbox"
                    @change="handlePeriodChange"
                  />

                  <span class="switch-label"> Gói vĩnh viễn </span>
                </label>
              </div>
            </div>

            <!-- TIME -->
            <div v-if="!currentPackage.isPeriod" class="form-group">
              <label class="form-label required"> Thời Hạn (ngày) </label>

              <input
                v-model="currentPackage.vipTime"
                type="number"
                class="form-input"
                placeholder="Nhập số ngày..."
              />
            </div>

            <!-- THEME -->
            <div class="form-group">
              <label class="form-label"> Theme Màu </label>

              <div class="theme-picker">
                <button
                  v-for="theme in THEME_OPTIONS"
                  :key="theme.value"
                  type="button"
                  class="theme-swatch"
                  :class="[`theme-${theme.value}`, { active: currentPackage.colorTheme === theme.value }]"
                  :title="theme.label"
                  @click="currentPackage.colorTheme = theme.value"
                >
                  <span class="theme-swatch-dot"></span>
                </button>
              </div>
            </div>

            <!-- ACTIVE -->
            <div class="form-group">
              <label class="switch-wrapper">
                <input v-model="currentPackage.isActive" type="checkbox" />

                <span class="switch-label"> Kích hoạt ngay sau khi tạo </span>
              </label>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="vip-modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Hủy</button>

            <button class="btn btn-primary" :disabled="isSaving" @click="savePackage">
              <span v-if="isSaving"> Đang lưu... </span>

              <template v-else>
                <i class="bi bi-save"></i>

                {{ isEditMode ? 'Cập Nhật' : 'Tạo Mới' }}
              </template>
            </button>
          </div>
        </div>
      </div>

      <!-- DELETE MODAL -->
      <div v-if="showDeleteConfirm" class="vip-modal-overlay" @click="cancelDelete">
        <div class="vip-modal" style="max-width: 440px" @click.stop>
          <div class="vip-modal-header">
            <h2 class="vip-modal-title">Xác Nhận Xóa</h2>

            <button class="vip-modal-close" @click="cancelDelete">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="vip-modal-body">
            <p>
              Bạn có chắc muốn xóa
              <strong>
                {{ packageToDelete?.vipName }}
              </strong>

              ?
            </p>
          </div>

          <div class="vip-modal-footer">
            <button class="btn btn-secondary" @click="cancelDelete">Hủy</button>

            <button class="btn btn-danger" :disabled="isDeleting" @click="deletePackageConfirmed">
              <span v-if="isDeleting"> Đang xóa... </span>

              <template v-else>
                <i class="bi bi-trash"></i>

                Xóa
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
