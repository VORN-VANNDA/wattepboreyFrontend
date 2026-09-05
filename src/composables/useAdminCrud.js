// composables/useAdminCrud.js
// One hook powers list/create/update/delete for every dashboard resource
// (members, events, videos, gallery) so each admin view only needs to
// supply its own form fields, not its own fetch plumbing.

import { ref } from 'vue'
import api from '../lib/api'

export function useAdminCrud(resourcePath) {
  const items = ref([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get(resourcePath)
      items.value = res.data.data
    } catch (err) {
      error.value = err?.response?.data?.message || err.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    saving.value = true
    error.value = null
    try {
      await api.post(resourcePath, payload)
      await fetchAll()
      return true
    } catch (err) {
      error.value = err?.response?.data?.message || err.message
      return false
    } finally {
      saving.value = false
    }
  }

  async function update(id, payload) {
    saving.value = true
    error.value = null
    try {
      await api.put(`${resourcePath}/${id}`, payload)
      await fetchAll()
      return true
    } catch (err) {
      error.value = err?.response?.data?.message || err.message
      return false
    } finally {
      saving.value = false
    }
  }

  async function remove(id) {
    error.value = null
    try {
      await api.delete(`${resourcePath}/${id}`)
      items.value = items.value.filter((item) => item.id !== id)
      return true
    } catch (err) {
      error.value = err?.response?.data?.message || err.message
      return false
    }
  }

  fetchAll()

  return { items, loading, saving, error, fetchAll, create, update, remove }
}
