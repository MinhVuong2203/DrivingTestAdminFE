<script setup>
import '@/assets/css/download-app.css'

const apkFileName = 'app-release.apk'
const apkUrl = `${import.meta.env.BASE_URL}downloads/${apkFileName}`
</script>

<template>
  <main class="download-app-page">
    <section class="download-hero" aria-labelledby="download-app-title">
      <div class="download-content">
        <div class="download-badge">
          <i class="bi bi-android2"></i>
          Android APK
        </div>

        <h1 id="download-app-title">Tải ứng dụng Driving Test</h1>

        <p class="download-description">
          Cài đặt ứng dụng trên điện thoại Android để luyện thi giấy phép lái xe mọi lúc.
        </p>

        <div class="download-actions">
          <a class="download-button" :href="apkUrl" :download="apkFileName">
            <i class="bi bi-download"></i>
            Tải APK
          </a>

          <span class="download-note">File: {{ apkFileName }}</span>
        </div>
      </div>

      <div class="phone-preview" aria-hidden="true">
        <div class="phone-frame">
          <div class="phone-speaker"></div>

          <div class="phone-screen">
            <div class="app-mark">
              <i class="bi bi-car-front-fill"></i>
            </div>

            <div class="screen-title">Driving Test</div>
            <div class="screen-subtitle">Ôn tập. Thi thử. Theo dõi tiến độ.</div>

            <div class="screen-progress">
              <span></span>
            </div>

            <div class="screen-list">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
