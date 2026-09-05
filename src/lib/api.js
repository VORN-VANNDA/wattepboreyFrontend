import axios from 'axios'

// In dev, Vite proxies /api → http://localhost:5000 (see vite.config.js),
// so a relative base URL works for both dev and a same-origin production
// deploy. Override with VITE_API_URL if the API is hosted elsewhere.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

const TOKEN_KEY = 'wt_admin_token'
const ADMIN_KEY = 'wt_admin_user'

// Attach the dashboard JWT (if present) to every outgoing request.
// Reads localStorage directly rather than importing useAuth() to avoid
// a circular import (useAuth calls this same api instance to log in).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If a stored token is invalid or has expired, clear it and bounce back
// to the login screen instead of leaving the dashboard in a broken state.
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
