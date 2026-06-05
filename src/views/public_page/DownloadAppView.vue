<script setup>
import { computed, onMounted, ref } from 'vue'

import image1 from '@/assets/image/image1.png'
import image2 from '@/assets/image/image2.png'
import image3 from '@/assets/image/image3.png'
import image4 from '@/assets/image/image4.png'
import '@/assets/css/download-app.css'

const appNameDisplay = 'Kiến thức lái xe 600'
const apkFileName = 'app-release.apk'
const apkUrl = `${import.meta.env.BASE_URL}downloads/${apkFileName}`
const fallbackApkSizeBytes = 32773848
const apkSizeBytes = ref(fallbackApkSizeBytes)

const screenshots = [
  {
    src: image1,
    alt: 'Màn hình ôn tập câu hỏi của ứng dụng Kiến thức lái xe 600',
  },
  {
    src: image2,
    alt: 'Màn hình thi thử của ứng dụng Kiến thức lái xe 600',
  },
  {
    src: image3,
    alt: 'Màn hình tra cứu biển báo của ứng dụng Kiến thức lái xe 600',
  },
  {
    src: image4,
    alt: 'Màn hình tiện ích học lái xe của ứng dụng Kiến thức lái xe 600',
  },
]

const publicLinks = [
  { to: '/terms-of-use', icon: 'bi-file-text', label: 'Điều khoản sử dụng' },
  { to: '/privacy-policy', icon: 'bi-shield-lock', label: 'Chính sách bảo mật' },
  { to: '/development-team', icon: 'bi-people', label: 'Đội ngũ phát triển' },
]

const formatFileSize = (bytes) => {
  if (!bytes) return 'Đang kiểm tra'

  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / 1024 ** exponent

  return `${size.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`
}

const apkSize = computed(() => formatFileSize(apkSizeBytes.value))

onMounted(async () => {
  try {
    const response = await fetch(apkUrl, { method: 'HEAD' })
    const contentLength = Number(response.headers.get('content-length'))

    if (Number.isFinite(contentLength) && contentLength > 0) {
      apkSizeBytes.value = contentLength
    }
  } catch {
    apkSizeBytes.value = fallbackApkSizeBytes
  }
})
</script>

<template>
  <main class="download-app-page">
    <nav class="public-links" aria-label="Liên kết công khai">
      <router-link v-for="link in publicLinks" :key="link.to" class="public-link" :to="link.to">
        <i :class="`bi ${link.icon}`"></i>
        <span>{{ link.label }}</span>
      </router-link>
    </nav>

    <section class="download-hero" aria-labelledby="download-app-title">
      <div class="download-content">
        <div class="download-badge">
          <i class="bi bi-android2"></i>
          Android APK
        </div>

        <h1 id="download-app-title">{{ appNameDisplay }}</h1>

        <p class="download-description">
          Ứng dụng ôn tập 600 câu hỏi lý thuyết lái xe, thi thử, ghi nhớ câu sai và tra cứu kiến
          thức giao thông ngay trên điện thoại Android.
        </p>

        <div class="download-actions">
          <a
            class="download-button"
            :href="apkUrl"
            :download="apkFileName"
            :aria-label="`Tải ${appNameDisplay}`"
          >
            <i class="bi bi-download"></i>
            Tải APK
          </a>

          <div class="download-meta" aria-label="Thông tin file tải xuống">
            <!-- <span>
              <i class="bi bi-file-earmark-arrow-down"></i>
              {{ apkFileName }}
            </span> -->
            <span>
              <i class="bi bi-hdd"></i>
              {{ apkSize }}
            </span>
          </div>
        </div>
      </div>

      <div class="download-showcase" aria-label="Ảnh chụp màn hình ứng dụng">
        <figure
          v-for="(screenshot, index) in screenshots"
          :key="screenshot.src"
          class="showcase-card"
          :class="{ 'showcase-card-offset': index % 2 === 1 }"
        >
          <div class="showcase-image">
            <img :src="screenshot.src" :alt="screenshot.alt" loading="eager" />
          </div>
        </figure>
      </div>
    </section>

    <section class="download-details" aria-label="Thông tin ứng dụng">
      <div class="detail-item">
        <i class="bi bi-car-front-fill"></i>
        <span>{{ appNameDisplay }}</span>
      </div>
      <div class="detail-item">
        <i class="bi bi-shield-check"></i>
        <span>Cài đặt trực tiếp trên Android</span>
      </div>
      <div class="detail-item">
        <i class="bi bi-database-check"></i>
        <span>Dung lượng: {{ apkSize }}</span>
      </div>
    </section>
  </main>
</template>
