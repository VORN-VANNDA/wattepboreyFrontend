<script setup>
import { ref } from 'vue'
import { Save, Loader2 } from 'lucide-vue-next'
import api from '../../lib/api'
import ImageUploader from '../../components/admin/ImageUploader.vue'

const heroBannerUrl = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saved = ref(false)

async function fetchSettings() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/settings')
    heroBannerUrl.value = res.data.data.hero_banner_url || ''
  } catch (err) {
    error.value = err?.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    await api.put('/settings', { hero_banner_url: heroBannerUrl.value })
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (err) {
    error.value = err?.response?.data?.message || err.message
  } finally {
    saving.value = false
  }
}

fetchSettings()
</script>

<template>
  <div class="max-w-xl">
    <div>
      <h1 class="font-display text-2xl text-forest">ការកំណត់គេហទំព័រ (Site Settings)</h1>
      <p class="mt-1 text-sm text-gray-500">គ្រប់គ្រងរូបភាព Hero Banner លើទំព័រដើម</p>
    </div>

    <div class="card mt-8 p-6 sm:p-8">
      <div v-if="loading" class="h-24 animate-pulse rounded-lg bg-cream" />

      <form v-else class="space-y-6" @submit.prevent="handleSave">
        <ImageUploader
          v-model="heroBannerUrl"
          folder="settings"
          label="រូបភាព Hero Banner (ទំព័រដើម)"
        />
        <p class="-mt-3 text-xs text-gray-400">
          បង្ហាញនៅផ្ទាំងខាងលើគេហទំព័រដើម ខ្នាតល្អបំផុតប្រហែល 1600×900px។ បើមិនកំណត់ទេ រូបភាពទំនេរនឹងបង្ហាញជំនួសវិញ។
        </p>

        <div class="flex items-center gap-3">
          <button type="submit" :disabled="saving" class="btn-gold !py-2.5 text-sm disabled:opacity-60">
            <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
            <Save v-else class="h-4 w-4" />
            {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
          </button>
          <span v-if="saved" class="text-sm text-green-600">បានរក្សាទុកដោយជោគជ័យ!</span>
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
