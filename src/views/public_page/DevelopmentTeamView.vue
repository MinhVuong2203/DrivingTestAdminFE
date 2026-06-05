<script setup>
import '@/assets/css/public-pages.css'

const members = [
  {
    name: 'Nguyễn Minh Vương',
    role: 'Trưởng nhóm',
    email: 'vuonghihihihi@gmail.com',
    phone: '+84 818 214 849',
  },
  {
    name: 'Nguyễn Văn Hưng',
    role: 'Thành viên',
    email: 'vanhungvn741@gmail.com',
    phone: '+84 797 579 550',
  },
  {
    name: 'Nguyễn Lê Hoàng Minh',
    role: 'Thành viên',
    email: 'oopsmask7@gmail.com',
    phone: '+84 338 914 938',
  },
  {
    name: 'Nguyễn Bình Minh',
    role: 'Thành viên',
    email: 'minhnguyen14536@gmail.com',
    phone: '+84 393 098 766',
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
        Chúng tôi xây dựng Kiến thức lái xe 600 với mục tiêu giúp người học ôn luyện giấy phép lái xe thuận
        tiện hơn, theo dõi tiến độ rõ ràng hơn và sử dụng nội dung học tập an toàn.
      </p>

      <div class="team-grid mt-4">
        <article v-for="member in members" :key="member.email" class="member-card">
          <div class="member-body">
            <h2>{{ member.name }}</h2>
            <span class="member-role">{{ member.role }}</span>

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
