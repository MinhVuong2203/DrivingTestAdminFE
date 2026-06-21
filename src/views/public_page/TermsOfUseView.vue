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
        <i class="bi bi-file-earmark-text"></i>
        Điều khoản
      </span>

      <h1 class="public-title">Điều khoản sử dụng</h1>

      <p class="public-lead">
        Khi truy cập hoặc sử dụng Kiến thức lái xe 600, bạn đồng ý tuân thủ các điều khoản dưới đây. Nội
        dung này giúp bảo vệ người dùng, dữ liệu học tập và chất lượng dịch vụ.
      </p>

      <div class="policy-wrap mt-4">
        <section class="policy-section">
          <h2>1. Phạm vi sử dụng</h2>
          <p>
            Kiến thức lái xe 600 cung cấp công cụ ôn luyện, thi thử, tra cứu biển báo, quản lý tiến độ học
            tập và một số tính năng hỗ trợ khác. Ứng dụng không thay thế tư vấn pháp lý hoặc tài
            liệu chính thức từ cơ quan có thẩm quyền.
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Tài khoản người dùng</h2>
          <ul>
            <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và hoạt động trên tài khoản.</li>
            <li>Không sử dụng tài khoản để giả mạo, phát tán nội dung sai lệch hoặc gây hại.</li>
            <li>Hệ thống có thể tạm khóa tài khoản khi phát hiện hành vi vi phạm nghiêm trọng.</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. Gói VIP và thanh toán</h2>
          <p>
            Gói VIP được kích hoạt sau khi thanh toán thành công và hệ thống xác nhận giao dịch.
            Trường hợp phát sinh lỗi kỹ thuật, người dùng có thể liên hệ đội ngũ phát triển kèm mã
            đơn hàng để được hỗ trợ kiểm tra.
          </p>
        </section>

        <section class="policy-section">
          <h2>4. Nội dung và hành vi bị cấm</h2>
          <ul>
            <li>Không sao chép, phân phối lại nội dung ứng dụng khi chưa được cho phép.</li>
            <li>Không khai thác lỗi hệ thống, can thiệp API hoặc cố tình phá hoại dịch vụ.</li>
            <li>Không đăng tải nội dung xúc phạm, vi phạm pháp luật hoặc ảnh hưởng người khác.</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>5. Thay đổi điều khoản</h2>
          <p>
            Điều khoản có thể được cập nhật để phù hợp với sản phẩm, yêu cầu vận hành hoặc quy định
            pháp luật. Phiên bản mới sẽ có hiệu lực khi được công bố trên hệ thống.
          </p>
          <p class="updated-note">Cập nhật lần cuối: 04/06/2026</p>
        </section>
      </div>
    </section>
  </main>
</template>
