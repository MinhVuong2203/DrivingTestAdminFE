<script setup>
import { computed, onMounted, ref } from 'vue'

import MainLayout from '@/components/layout/MainLayout.vue'
import { getAdminStatistics, getAdMobReport } from '@/services/statisticsService'
import { useLoadingStore } from '@/stores/loadingStore'
import { useToastStore } from '@/stores/toastStore'

import '@/assets/css/statistics/statistics.css'

const loadingStore = useLoadingStore()
const toastStore = useToastStore()

const selectedRange = ref('month')
const customFromDate = ref('')
const customToDate = ref('')
const expandedRow = ref('users')
const statistics = ref(null)
const adMobReport = ref([])

const rangeOptions = [
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
]

const overview = computed(() => statistics.value?.overview || {})
const charts = computed(() => statistics.value?.charts || {})
const details = computed(() => statistics.value?.details || {})

const formatNumber = (value = 0) => new Intl.NumberFormat('vi-VN').format(value || 0)

const formatPercent = (value = 0) =>
  new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 1,
  }).format(value || 0)

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('vi-VN')
}

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatInputDate = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const getSelectedPeriod = () => {
  if (selectedRange.value === 'custom') {
    return {
      startDate: customFromDate.value,
      endDate: customToDate.value,
    }
  }

  const end = new Date()
  const start = new Date(end)

  if (selectedRange.value === 'year') {
    start.setMonth(0, 1)
  } else if (selectedRange.value === 'quarter') {
    const quarterStartMonth = Math.floor(end.getMonth() / 3) * 3
    start.setMonth(quarterStartMonth, 1)
  } else {
    start.setDate(1)
  }

  return {
    startDate: formatInputDate(start),
    endDate: formatInputDate(end),
  }
}

const getAdMobRevenueVnd = (row = {}) =>
  Number(row.estimatedEarningsVnd ?? Number(row.estimatedEarnings || 0) * Number(row.usdToVndRate || 26330))

const getAdMobEcpmVnd = (row = {}) =>
  Number(row.ecpmVnd ?? Number(row.ecpm || 0) * Number(row.usdToVndRate || 26330))

const displayRange = computed(() => {
  if (selectedRange.value === 'custom' && customFromDate.value && customToDate.value) {
    return `${customFromDate.value} đến ${customToDate.value}`
  }

  return rangeOptions.find((option) => option.value === selectedRange.value)?.label || 'Tháng'
})

const getPeakPoint = (points = []) => {
  if (!points.length) return null
  return points.reduce((peak, point) => (Number(point.count || 0) > Number(peak.count || 0) ? point : peak), points[0])
}

const getRecentPoints = (points = []) => [...points].slice(-5).reverse()

const sumPoints = (points = []) => points.reduce((sum, point) => sum + Number(point.count || 0), 0)

const getInitial = (value = '') => value.trim().charAt(0).toUpperCase() || 'A'

const getReadablePoints = (points = []) => [...points].slice(-8).reverse()

const summaryRows = computed(() => [
  {
    key: 'users',
    label: 'Người dùng',
    current: overview.value.totalUsers,
    recent: overview.value.newUsers,
    recentLabel: 'user mới',
    icon: 'bi-people',
    tone: 'blue',
    unit: 'user',
    points: charts.value.users || [],
    items: details.value.users || [],
    note: 'Tài khoản được tạo mới trong kỳ đang xem.',
  },
  {
    key: 'vipPayments',
    label: 'Nạp VIP',
    current: overview.value.totalVipPayments,
    recent: overview.value.newVipPayments,
    recentLabel: 'lượt nạp mới',
    icon: 'bi-gem',
    tone: 'green',
    unit: 'lượt',
    points: charts.value.vipPayments || [],
    items: details.value.vipPayments || [],
    note: `Doanh thu kỳ này: ${formatCurrency(overview.value.newVipRevenue)}`,
  },
  {
    key: 'posts',
    label: 'Bài đăng',
    current: overview.value.totalPosts,
    recent: overview.value.newPosts,
    recentLabel: 'bài mới',
    icon: 'bi-file-earmark-text',
    tone: 'amber',
    unit: 'bài',
    points: charts.value.posts || [],
    items: details.value.posts || [],
    note: 'Bài đăng mới hợp lệ trên diễn đàn.',
  },
  {
    key: 'comments',
    label: 'Bình luận',
    current: overview.value.totalComments,
    recent: overview.value.newComments,
    recentLabel: 'bình luận mới',
    icon: 'bi-chat-dots',
    tone: 'rose',
    unit: 'bình luận',
    points: charts.value.comments || [],
    items: details.value.comments || [],
    note: 'Bình luận mới hợp lệ trên các bài đăng.',
  },
])

const chartSections = computed(() =>
  summaryRows.value.map((row) => ({
    key: row.key,
    title: row.key === 'users' ? 'User mới' : row.key === 'vipPayments' ? 'Nạp VIP' : `${row.label} mới`,
    unit: row.unit,
    points: row.points,
    tone: row.tone,
  })),
)

const totalRangeActivity = computed(() =>
  summaryRows.value.reduce((total, row) => total + Number(row.recent || 0), 0),
)

const adMobTotals = computed(() => {
  const rows = adMobReport.value || []
  const totalEarnings = rows.reduce((sum, row) => sum + Number(row.estimatedEarnings || 0), 0)
  const totalEarningsVnd = rows.reduce((sum, row) => sum + getAdMobRevenueVnd(row), 0)
  const totalImpressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0)
  const totalClicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0)
  const avgEcpmVnd = rows.length
    ? rows.reduce((sum, row) => sum + getAdMobEcpmVnd(row), 0) / rows.length
    : 0

  return {
    totalEarnings,
    totalEarningsVnd,
    totalImpressions,
    totalClicks,
    avgEcpmVnd,
    usdToVndRate: rows[0]?.usdToVndRate || 26330,
  }
})

const vipRevenueInRange = computed(() => Number(overview.value.newVipRevenue || 0))
const totalRevenueInRange = computed(() => vipRevenueInRange.value + adMobTotals.value.totalEarningsVnd)

const revenueShares = computed(() => {
  const total = totalRevenueInRange.value
  const admobPercent = total ? (adMobTotals.value.totalEarningsVnd / total) * 100 : 0
  const vipPercent = total ? (vipRevenueInRange.value / total) * 100 : 0

  return {
    admobPercent,
    vipPercent,
    admobAngle: (admobPercent / 100) * 360,
  }
})

const revenueDonutStyle = computed(() => {
  if (!totalRevenueInRange.value) {
    return {
      background: 'conic-gradient(#e5e7eb 0deg 360deg)',
    }
  }

  return {
    background: `conic-gradient(#2563eb 0deg ${revenueShares.value.admobAngle}deg, #10b981 ${revenueShares.value.admobAngle}deg 360deg)`,
  }
})

const maxPointCount = (points = []) => Math.max(1, ...points.map((point) => Number(point.count || 0)))

const buildPolyline = (points = []) => {
  if (!points.length) return ''

  const max = maxPointCount(points)
  const lastIndex = Math.max(points.length - 1, 1)

  return points
    .map((point, index) => {
      const x = (index / lastIndex) * 100
      const y = 92 - (Number(point.count || 0) / max) * 76
      return `${x},${Math.max(10, y)}`
    })
    .join(' ')
}

const getDetailTitle = (row, item) => {
  if (row.key === 'users') return item.displayName || item.email || item.uid
  if (row.key === 'vipPayments') return item.packageName || item.packageId || `Order ${item.orderCode}`
  if (row.key === 'posts') return item.authorName || item.authorId || 'Bài đăng mới'
  return item.authorName || item.authorId || 'Bình luận mới'
}

const getDetailSubtitle = (row, item) => {
  if (row.key === 'users') return item.email || item.uid
  if (row.key === 'vipPayments') return `${formatCurrency(item.amount)} · ${item.userId || 'Không rõ user'}`
  if (row.key === 'posts') return item.content || 'Bài đăng không có nội dung'
  return item.content || 'Bình luận không có nội dung'
}

const getDetailMeta = (row, item) => {
  if (row.key === 'users') return `Tạo lúc ${formatDateTime(item.createdAt)} · ${item.status || 'unknown'}`
  if (row.key === 'vipPayments') return `Thanh toán ${formatDateTime(item.paidAt)} · #${item.orderCode}`
  if (row.key === 'posts') {
    return `${formatDateTime(item.createdAt)} · ${formatNumber(item.likeCount)} like · ${formatNumber(item.commentCount)} bình luận`
  }
  return `${formatDateTime(item.createdAt)} · post ${item.postId || '-'} · ${formatNumber(item.likeCount)} like`
}

const toggleRow = (key) => {
  expandedRow.value = expandedRow.value === key ? '' : key
}

const setPresetRange = (range) => {
  selectedRange.value = range
  customFromDate.value = ''
  customToDate.value = ''
  loadStatistics()
}

const applyCustomRange = () => {
  if (!customFromDate.value || !customToDate.value) {
    toastStore.warning('Vui lòng chọn đủ từ ngày và đến ngày')
    return
  }

  if (customFromDate.value > customToDate.value) {
    toastStore.warning('Từ ngày không được lớn hơn đến ngày')
    return
  }

  selectedRange.value = 'custom'
  loadStatistics()
}

const loadStatistics = async () => {
  try {
    loadingStore.show()

    const period = getSelectedPeriod()
    const params = { from: period.startDate, to: period.endDate }

    const [statisticsData, adMobData] = await Promise.all([getAdminStatistics(params), getAdMobReport(period)])

    statistics.value = statisticsData
    adMobReport.value = adMobData
  } catch {
    toastStore.error('Không tải được dữ liệu thống kê')
  } finally {
    loadingStore.hide()
  }
}

onMounted(loadStatistics)
</script>

<template>
  <MainLayout>
    <section class="statistics-workspace">
      <header class="statistics-topbar">
        <div class="statistics-heading">
          <h1>Thống kê hệ thống</h1>
          <p>Theo dõi dữ liệu vận hành trong khoảng {{ displayRange }}.</p>
        </div>

        <div class="period-panel">
          <div class="preset-group">
            <button
              v-for="option in rangeOptions"
              :key="option.value"
              type="button"
              class="preset-btn"
              :class="{ active: selectedRange === option.value }"
              @click="setPresetRange(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="date-range">
            <label>
              <span>Từ</span>
              <input v-model="customFromDate" type="date" />
            </label>
            <label>
              <span>Đến</span>
              <input v-model="customToDate" type="date" />
            </label>
            <button type="button" class="apply-btn" :class="{ active: selectedRange === 'custom' }" @click="applyCustomRange">
              Áp dụng
            </button>
          </div>
        </div>
      </header>

      <div class="operations-strip">
        <div class="strip-metric">
          <span>Hoạt động kỳ này</span>
          <strong>{{ formatNumber(totalRangeActivity) }}</strong>
        </div>
        <div class="strip-metric">
          <span>Doanh thu VIP kỳ này</span>
          <strong>{{ formatCurrency(overview.newVipRevenue) }}</strong>
        </div>
        <div class="strip-metric">
          <span>Tổng doanh thu VIP</span>
          <strong>{{ formatCurrency(overview.totalVipRevenue) }}</strong>
        </div>
      </div>

      <section class="revenue-board">
        <article class="revenue-donut-panel">
          <div class="revenue-panel-head">
            <div>
              <h2>Cơ cấu doanh thu kỳ này</h2>
            </div>
            <strong>{{ formatCurrency(totalRevenueInRange) }}</strong>
          </div>

          <div class="revenue-donut-content">
            <div class="revenue-donut" :style="revenueDonutStyle" aria-label="Cơ cấu doanh thu AdMob và VIP">
              <div>
                <span>Tổng doanh thu</span>
                <strong>{{ formatCurrency(totalRevenueInRange) }}</strong>
              </div>
            </div>

            <div class="revenue-legend">
              <div>
                <i class="legend-dot admob" aria-hidden="true"></i>
                <span>AdMob</span>
                <strong>{{ formatCurrency(adMobTotals.totalEarningsVnd) }}</strong>
                <small>{{ formatPercent(revenueShares.admobPercent) }}%</small>
              </div>
              <div>
                <i class="legend-dot vip" aria-hidden="true"></i>
                <span>Nạp VIP</span>
                <strong>{{ formatCurrency(vipRevenueInRange) }}</strong>
                <small>{{ formatPercent(revenueShares.vipPercent) }}%</small>
              </div>
            </div>
          </div>
        </article>

        <article class="admob-metrics-panel">
          <div class="metric-panel-head">
            <div>
              <h2>Báo cáo AdMob</h2>
              <span>Tỷ giá áp dụng: 1 USD = {{ formatNumber(adMobTotals.usdToVndRate) }} đ</span>
            </div>
            <strong>{{ formatCurrency(adMobTotals.totalEarningsVnd) }}</strong>
          </div>

          <div class="metric-kpis">
            <div>
              <span>Doanh thu gốc</span>
              <strong>${{ formatNumber(adMobTotals.totalEarnings.toFixed(2)) }}</strong>
            </div>
            <div>
              <span>Lượt hiển thị</span>
              <strong>{{ formatNumber(adMobTotals.totalImpressions) }}</strong>
            </div>
            <div>
              <span>Clicks</span>
              <strong>{{ formatNumber(adMobTotals.totalClicks) }}</strong>
            </div>
            <div>
              <span>eCPM quy đổi</span>
              <strong>{{ formatCurrency(adMobTotals.avgEcpmVnd) }}</strong>
            </div>
          </div>
        </article>
      </section>

      <div class="summary-table">
        <div class="summary-head">
          <span>Nhóm dữ liệu</span>
          <span>Tổng hiện tại</span>
          <span>Phát sinh trong kỳ</span>
        </div>

        <template v-for="row in summaryRows" :key="row.key">
          <button
            type="button"
            class="summary-row"
            :class="{ expanded: expandedRow === row.key }"
            @click="toggleRow(row.key)"
          >
            <div class="summary-name">
              <span class="summary-icon" :class="row.tone">
                <i class="bi" :class="row.icon"></i>
              </span>
              <span>{{ row.label }}</span>
            </div>
            <strong>{{ formatNumber(row.current) }}</strong>
            <span class="summary-new">+{{ formatNumber(row.recent) }} {{ row.recentLabel }}</span>
            <i class="bi bi-chevron-down row-chevron"></i>
          </button>

          <div v-if="expandedRow === row.key" class="summary-detail">
            <div class="detail-copy">
              <strong>{{ row.label }} trong kỳ</strong>
              <span>{{ row.note }}</span>
            </div>

            <div class="detail-metrics">
              <div>
                <span>Tổng trong kỳ</span>
                <strong>{{ formatNumber(sumPoints(row.points)) }}</strong>
              </div>
              <div>
                <span>Ngày cao nhất</span>
                <strong v-if="getPeakPoint(row.points)">
                  {{ getPeakPoint(row.points).date }} · {{ formatNumber(getPeakPoint(row.points).count) }}
                </strong>
                <strong v-else>-</strong>
              </div>
              <div>
                <span>Số ngày có dữ liệu</span>
                <strong>{{ formatNumber(row.points.length) }}</strong>
              </div>
            </div>

            <div v-if="row.items?.length" class="detail-records">
              <div class="records-title">Bản ghi mới nhất</div>
              <div
                v-for="item in row.items"
                :key="`${row.key}-${item.uid || item.id || item.postId || item.commentId}`"
                class="record-item"
              >
                <div class="record-avatar" :class="row.tone">
                  <img v-if="row.key === 'users' && item.photoUrl" :src="item.photoUrl" alt="" />
                  <span v-else>{{ getInitial(getDetailTitle(row, item)) }}</span>
                </div>

                <div class="record-main">
                  <strong>{{ getDetailTitle(row, item) }}</strong>
                  <span>{{ getDetailSubtitle(row, item) }}</span>
                  <small>{{ getDetailMeta(row, item) }}</small>
                </div>
              </div>
            </div>

            <div v-if="row.points.length" class="column-chart-wrap">
              <div class="records-title">Biểu đồ theo ngày</div>
              <div class="column-chart" :class="row.tone">
                <div
                  v-for="point in getReadablePoints(row.points).reverse()"
                  :key="`${row.key}-column-${point.date}`"
                  class="column-item"
                  :title="`${point.date}: ${formatNumber(point.count)} ${row.unit}`"
                >
                  <strong>{{ formatNumber(point.count) }}</strong>
                  <div class="column-track">
                    <span :style="{ height: `${Math.max(12, (Number(point.count || 0) / maxPointCount(row.points)) * 100)}%` }"></span>
                  </div>
                  <small>{{ point.date.slice(5) }}</small>
                </div>
              </div>
            </div>

            <div v-else class="detail-empty">Không có dữ liệu trong khoảng thời gian này.</div>

            <div v-if="row.points.length" class="recent-list">
              <span v-for="point in getRecentPoints(row.points)" :key="`${row.key}-recent-${point.date}`">
                {{ point.date }}: <strong>{{ formatNumber(point.count) }}</strong>
              </span>
            </div>
          </div>
        </template>
      </div>

      <div class="chart-board">
        <article v-for="chart in chartSections" :key="chart.key" class="metric-panel">
          <div class="metric-panel-head">
            <div>
              <h2>{{ chart.title }}</h2>
              <span v-if="getPeakPoint(chart.points)">
                Cao nhất: {{ formatNumber(getPeakPoint(chart.points).count) }} {{ chart.unit }} ngày
                {{ getPeakPoint(chart.points).date }}
              </span>
              <span v-else>Chưa có dữ liệu trong kỳ</span>
            </div>
            <strong>{{ formatNumber(sumPoints(chart.points)) }}</strong>
          </div>

          <div v-if="chart.points.length" class="metric-detail">
            <div class="metric-kpis">
              <div>
                <span>Tổng trong kỳ</span>
                <strong>{{ formatNumber(sumPoints(chart.points)) }}</strong>
              </div>
              <div>
                <span>Ngày cao nhất</span>
                <strong>{{ getPeakPoint(chart.points).date }}</strong>
              </div>
              <div>
                <span>Số ngày có phát sinh</span>
                <strong>{{ formatNumber(chart.points.length) }}</strong>
              </div>
            </div>

            <div class="column-chart" :class="chart.tone">
              <div
                v-for="point in getReadablePoints(chart.points).reverse()"
                :key="`${chart.key}-${point.date}`"
                class="column-item"
                :title="`${point.date}: ${formatNumber(point.count)} ${chart.unit}`"
              >
                <strong>{{ formatNumber(point.count) }}</strong>
                <div class="column-track">
                  <span :style="{ height: `${Math.max(12, (Number(point.count || 0) / maxPointCount(chart.points)) * 100)}%` }"></span>
                </div>
                <small>{{ point.date.slice(5) }}</small>
              </div>
            </div>
          </div>

          <div v-else class="empty-panel">
            <i class="bi bi-bar-chart-line"></i>
            <span>Không có dữ liệu</span>
          </div>
        </article>
      </div>
    </section>
  </MainLayout>
</template>
