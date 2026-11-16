import api from './api'

export function postImage(url) {
  if (!url || !url.startsWith('/uploads/')) return url || ''
  const base = api.defaults.baseURL || '/api'
  return /^https?:\/\//.test(base) ? new URL(url, base).href : url
}
export function postDate(value) {
  return value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}
