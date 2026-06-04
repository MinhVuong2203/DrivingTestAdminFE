<script setup>
import '@/assets/css/public-pages.css'

const members = [
  {
    name: 'Nguyễn Minh An',
    initials: 'NA',
    role: 'Trưởng nhóm',
    description: 'Phụ trách kiến trúc hệ thống, luồng thanh toán VIP và điều phối phát triển.',
    email: 'nguyenminhan@drivingtest.app',
    phone: '+84 901 234 101',
  },
  {
    name: 'Trần Gia Bảo',
    initials: 'TB',
    role: 'Backend Developer',
    description: 'Xây dựng API, xử lý dữ liệu người dùng, gói VIP, diễn đàn và tích hợp PayOS.',
    email: 'trangiabao@drivingtest.app',
    phone: '+84 901 234 102',
  },
  {
    name: 'Lê Hoàng My',
    initials: 'LM',
    role: 'Mobile Developer',
    description:
      'Phát triển ứng dụng Flutter, luyện thi, nhận diện biển báo và trải nghiệm người học.',
    email: 'lehoangmy@drivingtest.app',
    phone: '+84 901 234 103',
  },
  {
    name: 'Phạm Quốc Huy',
    initials: 'PH',
    role: 'Frontend Developer',
    description: 'Thiết kế giao diện quản trị, dashboard, quản lý người dùng và trang công khai.',
    email: 'phamquochuy@drivingtest.app',
    phone: '+84 901 234 104',
  },
]
</script>

<template>
  <main class="public-page">
    <nav class="public-nav" aria-label="Điều hướng công khai">
      <router-link class="public-brand" to="/download-app">
        <span class="public-brand-icon"><i class="bi bi-car-front-fill"></i></span>
        Driving Test
      </router-link>

      <div class="public-links">
        <router-link to="/development-team">Đội ngũ</router-link>
        <router-link to="/terms-of-use">Điều khoản</router-link>
        <router-link to="/privacy-policy">Riêng tư</router-link>
      </div>
    </nav>

    <section class="public-shell">
      <span class="public-eyebrow">
        <i class="bi bi-people"></i>
        Nhóm phát triển
      </span>

      <h1 class="public-title">Đội ngũ phát triển</h1>

      <p class="public-lead">
        Chúng tôi xây dựng Driving Test với mục tiêu giúp người học ôn luyện giấy phép lái xe thuận
        tiện hơn, theo dõi tiến độ rõ ràng hơn và sử dụng nội dung học tập an toàn.
      </p>

      <div class="team-grid mt-4">
        <article v-for="member in members" :key="member.email" class="member-card">
          <div class="member-avatar">{{ member.initials }}</div>

          <div class="member-body">
            <h2>{{ member.name }}</h2>
            <span class="member-role">{{ member.role }}</span>
            <p>{{ member.description }}</p>

            <div class="contact-list">
              <a :href="`mailto:${member.email}`">
                <i class="bi bi-envelope"></i>
                {{ member.email }}
              </a>
              <a :href="`tel:${member.phone.replaceAll(' ', '')}`">
                <i class="bi bi-telephone"></i>
                {{ member.phone }}
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
