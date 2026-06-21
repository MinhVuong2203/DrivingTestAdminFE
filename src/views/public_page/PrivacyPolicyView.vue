<script setup>
import '@/assets/css/public-pages.css'
</script>

<template>
  <main class="public-page">
    <nav class="public-nav" aria-label="Điều hướng công khai">
      <router-link class="public-brand" to="/download-app">
         <img src="@/assets/image/avatar.png" alt="Logo" class="logo-image"/>
        Kiến thức lái xe 600
      </router-link>

      <div class="public-links">
        <router-link to="/development-team">Đội ngũ</router-link>
        <router-link to="/terms-of-use">Điều khoản</router-link>
        <router-link to="/privacy-policy">Riêng tư</router-link>
      </div>
    </nav>

    <section class="public-shell">
      <span class="public-eyebrow">
        <i class="bi bi-shield-lock"></i>
        Quyền riêng tư
      </span>

      <h1 class="public-title">Chính sách riêng tư</h1>

      <p class="public-lead">
        Chính sách này mô tả cách Driving Kiến thức lái xe 600 thu thập, sử dụng và bảo vệ thông tin trong quá trình
        bạn dùng ứng dụng luyện thi giấy phép lái xe.
      </p>

      <div class="policy-wrap mt-4">
        <section class="policy-section">
          <h2>1. Thông tin được thu thập</h2>
          <ul>
            <li>Thông tin tài khoản như email, tên hiển thị và trạng thái đăng nhập.</li>
            <li>Dữ liệu học tập như lịch sử làm bài, tiến độ, câu sai và cài đặt cá nhân.</li>
            <li>Dữ liệu thanh toán cần thiết để xác nhận gói VIP, bao gồm mã đơn và trạng thái.</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>2. Mục đích sử dụng</h2>
          <p>
            Thông tin được dùng để cung cấp tính năng học tập, đồng bộ tiến độ, xác thực người dùng,
            kích hoạt quyền lợi VIP, gửi thông báo cần thiết và cải thiện chất lượng dịch vụ.
          </p>
        </section>

        <section class="policy-section">
          <h2>3. Bảo vệ dữ liệu</h2>
          <p>
            Dữ liệu được lưu trữ và xử lý thông qua các dịch vụ có cơ chế bảo mật phù hợp. Đội ngũ
            phát triển giới hạn quyền truy cập dữ liệu theo nhu cầu vận hành và hỗ trợ người dùng.
          </p>
        </section>

        <section class="policy-section">
          <h2>4. Chia sẻ thông tin</h2>
          <p>
            Kiến thức lái xe 600 không bán thông tin cá nhân của người dùng. Một số dữ liệu có thể được chia
            sẻ với nhà cung cấp dịch vụ thanh toán, xác thực hoặc hạ tầng khi cần thiết để vận hành
            ứng dụng.
          </p>
        </section>

        <section class="policy-section">
          <h2>5. Quyền của người dùng</h2>
          <ul>
            <li>Bạn có thể yêu cầu kiểm tra, chỉnh sửa hoặc xóa dữ liệu tài khoản khi phù hợp.</li>
            <li>
              Bạn có thể ngừng sử dụng dịch vụ hoặc liên hệ đội ngũ nếu có thắc mắc về dữ liệu.
            </li>
            <li>Các yêu cầu hỗ trợ sẽ được xử lý dựa trên khả năng xác minh tài khoản.</li>
          </ul>
          <p class="updated-note">Cập nhật lần cuối: 04/06/2026</p>
        </section>
      </div>
    </section>
  </main>
</template>
