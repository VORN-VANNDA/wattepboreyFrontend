// composables/useAuth.js
// Singleton auth state so the token is shared across every component
// that calls useAuth() — same pattern as useLocale().

import { ref, computed } from 'vue'
import api from '../lib/api'

const TOKEN_KEY = 'wt_admin_token'
const ADMIN_KEY = 'wt_admin_user'

const token = ref(localStorage.getItem(TOKEN_KEY) || null)
const admin = ref(JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null'))

function persist() {
  if (token.value) {
    localStorage.setItem(TOKEN_KEY, token.value)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin.value))
  } else {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  }
}

async function login(username, password) {
  const res = await api.post('/auth/login', { username, password })
  token.value = res.data.data.token
  admin.value = res.data.data.admin
  persist()
}

function logout() {
  token.value = null
  admin.value = null
  persist()
}

export function useAuth() {
  return {
    token,
    admin,
    isAuthenticated: computed(() => !!token.value),
    login,
    logout,
  }
}
