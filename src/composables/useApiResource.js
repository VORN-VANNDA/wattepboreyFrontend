// composables/useApiResource.js
// Small shared hook so every view fetches data the same way:
// data / loading / error, plus a `load()` you can re-call with new
// params (used by GalleryView's year/category filters, for example).

import { ref } from 'vue'

export function useApiResource(fetcher, { immediate = true, initial = [] } = {}) {
  const data = ref(initial)
  const loading = ref(immediate)
  const error = ref(null)

  async function load(params) {
    loading.value = true
    error.value = null
    try {
      const res = await fetcher(params)
      data.value = res?.data?.data ?? initial
    } catch (err) {
      error.value = err?.response?.data?.message || err.message || 'Request failed'
    } finally {
      loading.value = false
    }
  }

  if (immediate) load()

  return { data, loading, error, load }
}
