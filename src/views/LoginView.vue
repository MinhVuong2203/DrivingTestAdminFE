<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

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

    router.push('/')
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Sai tài khoản hoặc mật khẩu'
  } finally {
    loading.value = false
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

          <!-- <button class="forgot-btn" type="button">Quên mật khẩu?</button> -->

            <p class="login-note">
              Chỉ dành cho quản trị viên của đội ngũ phát triển ứng dụng Kiến thức lái xe 600
            </p>
                  
        </form>
      </div>
    </section>
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
