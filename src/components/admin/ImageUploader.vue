<script setup>
import { ref } from 'vue'
import { Upload, Loader2, ImageOff } from 'lucide-vue-next'
import api from '../../lib/api'

const props = defineProps({
  modelValue: { type: String, default: '' },
  folder: { type: String, required: true }, // 'members' | 'events' | 'gallery' | 'videos' | 'settings' | 'slides'
  label: { type: String, default: 'រូបភាព' },
})
const emit = defineEmits(['update:modelValue'])

const uploading = ref(false)
const error = ref('')
const fileInput = ref(null)

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  uploading.value = true
  error.value = ''

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await api.post(`/upload?folder=${props.folder}&type=image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    emit('update:modelValue', res.data.data.url)
  } catch (err) {
    error.value = err?.response?.data?.message || 'Upload failed'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div>
    <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ label }}</label>

    <div class="flex items-center gap-4">
      <div class="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-black/10 bg-cream">
        <img v-if="modelValue" :src="modelValue" alt="" class="h-full w-full object-cover" />
        <ImageOff v-else class="h-6 w-6 text-gray-300" />
      </div>

      <label
        class="flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-forest transition hover:border-gold hover:text-gold-dark"
      >
        <Loader2 v-if="uploading" class="h-4 w-4 animate-spin" />
        <Upload v-else class="h-4 w-4" />
        {{ uploading ? 'កំពុងផ្ទុកឡើង...' : 'ជ្រើសរើសរូបភាព' }}
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="hidden"
          :disabled="uploading"
          @change="handleFileChange"
        />
      </label>
    </div>

    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
