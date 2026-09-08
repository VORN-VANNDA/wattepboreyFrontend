import axios from 'axios'

// ដាក់ Render URL ជា Fallback ជំនួសឱ្យ '/api'
const API_BASE = import.meta.env.VITE_API_URL || 'https://tebpoery-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

const TOKEN_KEY = 'wt_admin_token'
const ADMIN_KEY = 'wt_admin_user'

// Attach the dashboard JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor សម្រាប់ដោះស្រាយ Expired Token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const onAdminRoute = window.location.pathname.startsWith('/admin')
    const onLoginPage = window.location.pathname === '/admin/login'
    if (err.response?.status === 401 && onAdminRoute && !onLoginPage) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ADMIN_KEY)
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api