import axios from 'axios'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
// const api = axios.create({
//   baseURL: 'http://localhost:7211',
// })

const api = axios.create({
  baseURL: 'https://drivingtestadmin-production.up.railway.app',
})

// Firenbase cấp ID Token dạng JWT, nên backend có thể giải mã và 
// xác thực mà không cần phải gọi Firebase API để kiểm tra token 
// hợp lệ hay không. Vì vậy, chúng ta chỉ cần gửi token trong 
// header Authorization là đủ để backend xử lý xác thực và phân quyền.

// Thêm interceptor để tự động thêm token vào header Authorization
api.interceptors.request.use(async (config) => {
  // lấy user hiện tại từ Firebase Auth
  const user = auth.currentUser

  if (user) {
    // nếu có user, lấy token và thêm vào header Authorization
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Thêm interceptor để xử lý lỗi 401 Unauthorized và 403 Forbidden
api.interceptors.response.use(
  response => response,
  async (error) => {
    if ([401, 403].includes(error.response?.status)) {
      await signOut(auth)
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
