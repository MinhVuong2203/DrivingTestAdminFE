<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import api from '@/services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showForgotModal = ref(false)
const forgotStep = ref('email')
const forgotEmail = ref('')
const forgotOtp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const forgotLoading = ref(false)
const forgotMessage = ref('')
const forgotError = ref('')

const isActiveAccount = (status) => (status || 'active').toLowerCase() === 'active'

const login = async () => {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu'
    return
  }

  try {
    loading.value = true

    const result = await signInWithEmailAndPassword(auth, email.value.trim(), password.value)
    const uid = result.user.uid

    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await signOut(auth)
      errorMessage.value = 'Tài khoản không tồn tại trong hệ thống'
      return
    }

    const userData = userSnap.data()

    if (userData.role?.toLowerCase() !== 'admin') {
      await signOut(auth)
      errorMessage.value = 'Tài khoản này không có quyền quản trị'
      return
    }

    if (!isActiveAccount(userData.status)) {
      await signOut(auth)
      errorMessage.value = 'Tài khoản quản trị đang bị khóa'
      return
    }

    router.push('/')
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Sai tài khoản hoặc mật khẩu'
  } finally {
    loading.value = false
  }
}

const getApiMessage = (error, fallback) => {
  const data = error.response?.data
  if (typeof data === 'string') return data
  return data?.message || fallback
}

const resetForgotForm = () => {
  forgotStep.value = 'email'
  forgotEmail.value = email.value.trim()
  forgotOtp.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showNewPassword.value = false
  showConfirmPassword.value = false
  forgotMessage.value = ''
  forgotError.value = ''
}

const openForgotPassword = () => {
  resetForgotForm()
  showForgotModal.value = true
}

const closeForgotPassword = () => {
  showForgotModal.value = false
  resetForgotForm()
}

const requestForgotOtp = async () => {
  forgotMessage.value = ''
  forgotError.value = ''

  if (!forgotEmail.value.trim()) {
    forgotError.value = 'Vui lòng nhập Gmail admin'
    return
  }

  try {
    forgotLoading.value = true
    const res = await api.post('/api/admin/password-reset/request-otp', {
      email: forgotEmail.value.trim(),
    })
    forgotStep.value = 'reset'
    forgotMessage.value = res.data?.message || 'Nếu email hợp lệ, OTP đã được gửi đến Gmail của bạn'
  } catch (error) {
    console.error(error)
    forgotError.value = getApiMessage(error, 'Không thể gửi OTP. Vui lòng thử lại sau')
  } finally {
    forgotLoading.value = false
  }
}

const confirmPasswordReset = async () => {
  forgotMessage.value = ''
  forgotError.value = ''

  if (!forgotEmail.value.trim() || !forgotOtp.value.trim() || !newPassword.value) {
    forgotError.value = 'Vui lòng nhập đầy đủ email, OTP và mật khẩu mới'
    return
  }

  if (newPassword.value.length < 6) {
    forgotError.value = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    forgotError.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  try {
    forgotLoading.value = true
    const res = await api.post('/api/admin/password-reset/confirm', {
      email: forgotEmail.value.trim(),
      otp: forgotOtp.value.trim(),
      newPassword: newPassword.value,
    })
    email.value = forgotEmail.value.trim()
    password.value = ''
    forgotMessage.value = res.data?.message || 'Đổi mật khẩu thành công'

    setTimeout(() => {
      showForgotModal.value = false
      resetForgotForm()
    }, 900)
  } catch (error) {
    console.error(error)
    forgotError.value = getApiMessage(error, 'Không thể đổi mật khẩu. Vui lòng kiểm tra OTP')
  } finally {
    forgotLoading.value = false
  }
}
</script>

<template>
  <main class="admin-login-page">
    <section class="login-panel">
      <div class="login-brand">
        <div class="brand-icon">  
          <i class="bi bi-gear-fill"></i>
        </div>

        <h1>Ứng dụng Quản lý App Kiến thức lái xe 600</h1>
        <ul>
          <li><i class="bi bi-check-circle-fill"></i> Kiểm soát linh hoạt người dùng </li>
          <li><i class="bi bi-check-circle-fill"></i> Cập nhật gói vip nhanh chóng</li>
          <li><i class="bi bi-check-circle-fill"></i> Kiểm soát bài đăng hiệu quả</li>
          <li><i class="bi bi-check-circle-fill"></i> Quản lý dễ dàng, tiện lợi</li>
        </ul>
      </div>

      <div class="login-form-wrap">
        <div class="login-badge">
          <i class="bi bi-fingerprint"></i>
        </div>

        <h2>Đăng nhập</h2>
        <p>Nhập tài khoản được cấp để truy cập hệ thống.</p>

        <form @submit.prevent="login">
          <label>Email</label>
          <div class="input-box">
            <i class="bi bi-person-fill"></i>
            <input v-model="email" type="email" placeholder="abc@gmail.com" />
          </div>

          <label>Mật khẩu</label>
          <div class="input-box">
            <i class="bi bi-lock-fill"></i>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Nhập mật khẩu"
            />
            <button type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <button class="login-btn" type="submit" :disabled="loading">
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            <i class="bi bi-arrow-left-right"></i>
          </button>

          <button class="forgot-btn" type="button" @click="openForgotPassword">
            Quên mật khẩu?
          </button>

            <p class="login-note">
              Chỉ dành cho quản trị viên của đội ngũ phát triển ứng dụng Kiến thức lái xe 600
            </p>
                  
        </form>
      </div>
    </section>

    <div v-if="showForgotModal" class="forgot-overlay" @click.self="closeForgotPassword">
      <section class="forgot-modal" aria-modal="true" role="dialog">
        <button class="modal-close" type="button" aria-label="Đóng" @click="closeForgotPassword">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="forgot-modal-icon">
          <i class="bi bi-envelope-check"></i>
        </div>

        <h3>Quên mật khẩu admin</h3>
        <p v-if="forgotStep === 'email'">
          Nhập Gmail admin để nhận mã OTP xác minh.
        </p>
        <p v-else>
          Nhập OTP đã gửi đến Gmail và đặt mật khẩu mới.
        </p>

        <form v-if="forgotStep === 'email'" @submit.prevent="requestForgotOtp">
          <label>Gmail admin</label>
          <div class="input-box">
            <i class="bi bi-envelope-fill"></i>
            <input v-model="forgotEmail" type="email" placeholder="abc@gmail.com" />
          </div>

          <p v-if="forgotError" class="error-message">{{ forgotError }}</p>
          <p v-if="forgotMessage" class="success-message">{{ forgotMessage }}</p>

          <button class="login-btn" type="submit" :disabled="forgotLoading">
            {{ forgotLoading ? 'Đang gửi OTP...' : 'Gửi OTP' }}
            <i class="bi bi-send"></i>
          </button>
        </form>

        <form v-else @submit.prevent="confirmPasswordReset">
          <label>Gmail admin</label>
          <div class="input-box">
            <i class="bi bi-envelope-fill"></i>
            <input v-model="forgotEmail" type="email" placeholder="abc@gmail.com" />
          </div>

          <label>Mã OTP</label>
          <div class="input-box">
            <i class="bi bi-shield-lock-fill"></i>
            <input v-model="forgotOtp" inputmode="numeric" maxlength="6" placeholder="Nhập OTP" />
          </div>

          <label>Mật khẩu mới</label>
          <div class="input-box">
            <i class="bi bi-lock-fill"></i>
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Ít nhất 6 ký tự"
            />
            <button type="button" @click="showNewPassword = !showNewPassword">
              <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>

          <label>Xác nhận mật khẩu</label>
          <div class="input-box">
            <i class="bi bi-lock-fill"></i>
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword">
              <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>

          <p v-if="forgotError" class="error-message">{{ forgotError }}</p>
          <p v-if="forgotMessage" class="success-message">{{ forgotMessage }}</p>

          <button class="login-btn" type="submit" :disabled="forgotLoading">
            {{ forgotLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu' }}
            <i class="bi bi-check2-circle"></i>
          </button>

          <button class="forgot-btn" type="button" :disabled="forgotLoading" @click="requestForgotOtp">
            Gửi lại OTP
          </button>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 18px;
  background:
    radial-gradient(circle at 16% 26%, rgba(37, 99, 235, 0.32), transparent 16%),
    radial-gradient(circle at 84% 74%, rgba(126, 58, 242, 0.3), transparent 17%),
    linear-gradient(135deg, #081225 0%, #090d18 48%, #150b2c 100%);
}

.login-panel {
  width: min(840px, 100%);
  min-height: 440px;
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 22px;
  background: #111827;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.42);
}

.login-brand {
  padding: 34px;
  color: #fff;
  background: linear-gradient(135deg, #2698df 0%, #7362ee 55%, #a34dec 100%);
}

.brand-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin-bottom: 26px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 28px;
}

.login-brand h1 {
  max-width: 360px;
  margin-bottom: 16px;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 800;
}

.login-brand p {
  margin-bottom: 30px;
  font-size: 14px;
}

.login-brand ul {
  display: grid;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 13px;
  font-weight: 700;
}

.login-brand li {
  display: flex;
  gap: 10px;
  align-items: center;
}

.login-brand li i {
  color: #bbf7d0;
}

.login-form-wrap {
  padding: 36px 34px;
  color: #f8fafc;
  background: #111827;
}

.login-badge {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 14px;
  background: #0b1223;
  color: #d946ef;
  font-size: 24px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.32);
}

.login-form-wrap h2 {
  margin: 0 0 8px;
  font-size: 25px;
  font-weight: 700;
}

.login-form-wrap > p {
  margin-bottom: 22px;
  color: #9fb0c7;
  font-size: 13px;
}

form {
  display: grid;
  gap: 10px;
}

label {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 800;
}

.input-box {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 12px;
  background: #1a2438;
}

.input-box i {
  color: #94a3b8;
  font-size: 15px;
}

.input-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  font-size: 13px;
}

.input-box button {
  border: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 15px;
}

.login-btn {
  height: 46px;
  margin-top: 6px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(90deg, #2454ff, #8338ff);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}

.login-btn:disabled {
  opacity: 0.7;
}

.forgot-btn {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 800;
  font-size: 13px;
}

.forgot-btn:disabled {
  opacity: 0.65;
}

.login-note {
  margin-top: 6px;
  padding: 11px;
  text-align: center;
  border-radius: 12px;
  background: #1a2438;
  color: #b6c4d7;
  font-size: 12px;
}

.error-message {
  margin: 4px 0 0;
  color: #fca5a5;
  font-weight: 600;
}

.success-message {
  margin: 4px 0 0;
  color: #86efac;
  font-weight: 700;
}

.forgot-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(2, 6, 23, 0.76);
  backdrop-filter: blur(10px);
}

.forgot-modal {
  position: relative;
  width: min(420px, 100%);
  max-height: calc(100vh - 36px);
  overflow-y: auto;
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 18px;
  background: #111827;
  color: #f8fafc;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.42);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #1a2438;
  color: #cbd5e1;
}

.forgot-modal-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 14px;
  background: #0b1223;
  color: #60a5fa;
  font-size: 24px;
}

.forgot-modal h3 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
}

.forgot-modal > p {
  margin: 0 0 16px;
  color: #9fb0c7;
  font-size: 13px;
}

@media (max-width: 900px) {
  .admin-login-page {
    padding: 18px;
  }

  .login-panel {
    grid-template-columns: 1fr;
  }

  .login-brand {
    padding: 24px 20px;
  }

  .login-brand h1 {
    font-size: 26px;
  }

  .login-brand p {
    margin-bottom: 22px;
    font-size: 13px;
  }

  .login-brand ul {
    gap: 10px;
    font-size: 12px;
  }

  .login-form-wrap {
    padding: 24px 20px;
  }
}
</style>
