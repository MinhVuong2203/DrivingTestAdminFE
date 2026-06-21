<script setup>
import MainLayout from '@/components/layout/MainLayout.vue'

import '@/assets/css/home.css'

const appHighlights = [
  {
    title: 'Ôn thi GPLX',
    text: 'Ứng dụng hỗ trợ học lý thuyết, luyện đề, xem biển báo và tra cứu lỗi giao thông.',
    icon: 'bi-journal-check',
  },
  {
    title: 'Nhận diện biển báo',
    text: 'Người dùng có thể dùng ảnh để nhận diện biển báo và lưu lịch sử tra cứu.',
    icon: 'bi-camera',
  },
  {
    title: 'Cộng đồng học lái xe',
    text: 'Diễn đàn giúp người dùng chia sẻ kinh nghiệm, đặt câu hỏi và trao đổi nội dung.',
    icon: 'bi-chat-square-heart',
  },
]

const managementLinks = [
  {
    title: 'Thống kê',
    text: 'Xem báo cáo người dùng, doanh thu VIP, bài đăng và bình luận theo khoảng thời gian.',
    icon: 'bi-bar-chart-line',
    to: '/statistics',
    label: 'Mở thống kê',
  },
  {
    title: 'Người dùng',
    text: 'Quản lý tài khoản, trạng thái hoạt động và quyền của người dùng trong hệ thống.',
    icon: 'bi-people',
    to: '/users',
    label: 'Quản lý người dùng',
  },
  {
    title: 'Gói VIP',
    text: 'Cấu hình gói VIP, giá bán, thời hạn và theo dõi các gói đang cung cấp.',
    icon: 'bi-gem',
    to: '/vip-management',
    label: 'Quản lý VIP',
  },
  {
    title: 'Diễn đàn',
    text: 'Theo dõi bài đăng, bình luận và xử lý nội dung không phù hợp trong cộng đồng.',
    icon: 'bi-chat-dots',
    to: '/forum-manager',
    label: 'Quản lý diễn đàn',
  },
  {
    title: 'Phản hồi',
    text: 'Đọc góp ý từ người dùng, theo dõi trạng thái xử lý và lưu câu trả lời trên hệ thống.',
    icon: 'bi-reply-all',
    to: '/feedback',
    label: 'Mở phản hồi',
  },
]

const adminNotes = [
  'Kiểm tra trang Thống kê trước khi đánh giá tình hình vận hành.',
  'Rà soát người dùng bị khóa hoặc có dấu hiệu bất thường.',
  'Theo dõi nội dung diễn đàn để giữ môi trường trao đổi an toàn.',
  'Cập nhật gói VIP khi có thay đổi về giá hoặc quyền lợi.',
]
</script>

<template>
  <MainLayout>
    <section class="overview-page">
      <header class="overview-hero">
        <div class="hero-copy">
          <span class="overview-eyebrow">Quản trị</span>
          <h1>Tổng quan quản trị ứng dụng học lái xe</h1>
          <p>
            Đây là khu vực điều phối cho hệ thống ôn thi GPLX. Admin có thể đi nhanh tới
            thống kê, người dùng, gói VIP, diễn đàn và phản hồi mà không cần xem lại số
            liệu ở trang này.
          </p>
        </div>

        <div class="hero-panel">
          <span>Vai trò trang này</span>
          <strong>Cổng giới thiệu và điều hướng</strong>
          <p>
            Trang Thống kê là nơi xem số liệu chi tiết. Trang Tổng quan chỉ tóm tắt chức
            năng và dẫn tới khu vực cần quản lý.
          </p>
        </div>
      </header>

      <section class="overview-section">
        <div class="section-title-block">
          <span>Ứng dụng mobile</span>
          <h2>Người dùng đang sử dụng app để làm gì?</h2>
        </div>

        <div class="highlight-grid">
          <article
            v-for="item in appHighlights"
            :key="item.title"
            class="highlight-card"
          >
            <i class="bi" :class="item.icon"></i>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section class="overview-section">
        <div class="section-title-block">
          <span>Khu vực quản lý</span>
          <h2>Đi tới chức năng chính</h2>
        </div>

        <div class="management-grid">
          <router-link
            v-for="item in managementLinks"
            :key="item.to"
            :to="item.to"
            class="management-card"
          >
            <div class="management-icon">
              <i class="bi" :class="item.icon"></i>
            </div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
              <span>
                {{ item.label }}
                <i class="bi bi-arrow-right"></i>
              </span>
            </div>
          </router-link>
        </div>
      </section>

      <section class="overview-bottom">
        <article class="guide-panel">
          <div class="section-title-block">
            <span>Gợi ý vận hành</span>
            <h2>Thứ tự kiểm tra nhanh</h2>
          </div>

          <ol class="admin-note-list">
            <li v-for="note in adminNotes" :key="note">{{ note }}</li>
          </ol>
        </article>

        <article class="public-links-panel">
          <div class="section-title-block">
            <span>Trang công khai</span>
            <h2>Liên kết ngoài khu quản trị</h2>
          </div>

          <div class="public-link-list">
            <router-link to="/download-app">
              <i class="bi bi-download"></i>
              Tải ứng dụng
            </router-link>
            <router-link to="/development-team">
              <i class="bi bi-person-workspace"></i>
              Nhóm phát triển
            </router-link>
            <router-link to="/privacy-policy">
              <i class="bi bi-shield-lock"></i>
              Chính sách bảo mật
            </router-link>
            <router-link to="/terms-of-use">
              <i class="bi bi-file-earmark-text"></i>
              Điều khoản sử dụng
            </router-link>
          </div>
        </article>
      </section>
    </section>
  </MainLayout>
</template>
