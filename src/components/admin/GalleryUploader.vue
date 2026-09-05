<script setup>
import { ref } from 'vue'
import { Upload, Loader2, X, ImagePlus } from 'lucide-vue-next'
import api from '../../lib/api'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // array of image URLs
  folder: { type: String, required: true }, // 'members' | 'events' | 'gallery' | 'videos' | 'settings' | 'slides'
  label: { type: String, default: 'រូបភាពបន្ថែម' },
  max: { type: Number, default: 12 }, // safety cap so a slide can't grow unbounded
})
const emit = defineEmits(['update:modelValue'])

const uploading = ref(false)
const error = ref('')
const fileInput = ref(null)

// Multiple files can be selected at once — each uploads to the same
// /upload endpoint used by the single-image uploader, then all the
// resulting URLs are appended to the gallery array together.
async function handleFilesChange(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  const remaining = props.max - props.modelValue.length
  if (remaining <= 0) {
    error.value = `អាចដាក់រូបភាពបានច្រើនបំផុត ${props.max} សន្លឹកប៉ុណ្ណោះ`
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  const toUpload = files.slice(0, remaining)

  uploading.value = true
  error.value = ''

  try {
    const uploadedUrls = []

    for (const file of toUpload) {
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post(`/upload?folder=${props.folder}&type=image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      uploadedUrls.push(res.data.data.url)
    }

    emit('update:modelValue', [...props.modelValue, ...uploadedUrls])
  } catch (err) {
    error.value = err?.response?.data?.message || 'Upload failed'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeImage(index) {
  const next = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', next)
}
</script>

<template>
  <div>
    <label class="mb-1.5 block text-sm font-medium text-gray-700">
      {{ label }}
      <span class="font-normal text-gray-400">({{ modelValue.length }}/{{ max }})</span>
    </label>

    <div class="flex flex-wrap gap-3">

      <!-- Existing images -->
      <div
        v-for="(url, index) in modelValue"
        :key="url + index"
        class="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-cream"
      >
        <img :src="url" alt="" class="h-full w-full object-cover" />
        <button
          type="button"
          class="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
          aria-label="លុបរូបភាព"
          @click="removeImage(index)"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Add button -->
      <label
        v-if="modelValue.length < max"
        class="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 text-gray-400 transition hover:border-gold hover:text-gold-dark"
      >
        <Loader2 v-if="uploading" class="h-5 w-5 animate-spin" />
        <ImagePlus v-else class="h-5 w-5" />
        <span class="text-[10px] font-medium">{{ uploading ? 'កំពុងផ្ទុក...' : 'បន្ថែម' }}</span>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          class="hidden"
          :disabled="uploading"
          @change="handleFilesChange"
        />
      </label>

    </div>

    <p class="mt-1.5 text-xs text-gray-400">
      អាចជ្រើសរើសរូបភាពច្រើនសន្លឹកក្នុងពេលតែមួយ។ ចុចលើ <Upload class="inline h-3 w-3" /> សញ្ញា × ដើម្បីលុប។
    </p>

    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
