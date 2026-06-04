<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import '@/assets/css/public-pages.css'

const route = useRoute()

const paymentInfo = computed(() => {
  const params = route.query

  return [
    { label: 'Mã đơn hàng', value: params.orderCode },
    { label: 'Mã giao dịch', value: params.id },
    { label: 'Trạng thái', value: params.status },
    { label: 'Mã phản hồi', value: params.code },
    { label: 'Hủy thanh toán', value: params.cancel },
  ].filter((item) => item.value !== undefined && item.value !== '')
})
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
      <div class="public-hero">
        <div>
          <span class="public-eyebrow">
            <i class="bi bi-credit-card-2-front"></i>
            PayOS
          </span>

          <h1>Thanh toán đã được ghi nhận</h1>

          <p class="public-lead">
            Cảm ơn bạn đã sử dụng gói VIP của Driving Test. Hệ thống sẽ đồng bộ trạng thái thanh
            toán, sau đó bạn có thể mở lại ứng dụng để kiểm tra quyền lợi VIP.
          </p>

          <div class="public-actions">
            <router-link class="public-button" to="/download-app">
              <i class="bi bi-phone"></i>
              Tải hoặc mở ứng dụng
            </router-link>

            <router-link class="public-button-secondary" to="/privacy-policy">
              <i class="bi bi-shield-check"></i>
              Chính sách riêng tư
            </router-link>
          </div>
        </div>

        <aside class="payment-panel" aria-label="Thông tin giao dịch">
          <div class="payment-icon success">
            <i class="bi bi-check2-circle"></i>
          </div>

          <h2>Hoàn tất thanh toán</h2>
          <p>Nếu VIP chưa hiển thị ngay, vui lòng chờ vài phút rồi đăng nhập lại ứng dụng.</p>

          <div v-if="paymentInfo.length" class="payment-details">
            <div v-for="item in paymentInfo" :key="item.label" class="payment-detail-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>
