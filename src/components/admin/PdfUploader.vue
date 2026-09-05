<script setup>
import { ref, computed } from 'vue'
import { Upload, Loader2, FileText, ExternalLink, X } from 'lucide-vue-next'
import api from '../../lib/api'

const props = defineProps({
  modelValue: { type: String, default: '' },
  folder: { type: String, required: true }, // 'members' | 'events' | 'gallery' | 'videos'
  label: { type: String, default: 'ឯកសារ PDF' },
})
const emit = defineEmits(['update:modelValue'])

const uploading = ref(false)
const error = ref('')
const fileInput = ref(null)

const filename = computed(() => {
  if (!props.modelValue) return ''
  try {
    return decodeURIComponent(props.modelValue.split('/').pop())
  } catch {
    return props.modelValue.split('/').pop()
  }
})

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  uploading.value = true
  error.value = ''

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await api.post(`/upload?folder=${props.folder}&type=document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    emit('update:modelValue', res.data.data.url)
  } catch (err) {
    error.value = err?.response?.data?.message || 'ការផ្ទុកឡើងបរាជ័យ (Upload failed)'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function clearFile() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div>
    <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ label }}</label>

    <div v-if="modelValue" class="flex items-center gap-3 rounded-lg border border-black/10 bg-cream px-4 py-3">
      <FileText class="h-5 w-5 shrink-0 text-forest" />
      <a
        :href="modelValue"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 truncate text-sm font-medium text-forest hover:underline"
      >
        {{ filename }}
      </a>
      <a :href="modelValue" target="_blank" rel="noopener noreferrer" class="shrink-0 text-gray-400 hover:text-forest">
        <ExternalLink class="h-4 w-4" />
      </a>
      <button type="button" class="shrink-0 text-gray-400 hover:text-red-500" @click="clearFile">
        <X class="h-4 w-4" />
      </button>
    </div>

    <label
      v-else
      class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/15 px-4 py-4 text-sm font-medium text-forest transition hover:border-gold hover:text-gold-dark"
    >
      <Loader2 v-if="uploading" class="h-4 w-4 animate-spin" />
      <Upload v-else class="h-4 w-4" />
      {{ uploading ? 'កំពុងផ្ទុកឡើង...' : 'ជ្រើសរើសឯកសារ PDF' }}
      <input
        ref="fileInput"
        type="file"
        accept="application/pdf"
        class="hidden"
        :disabled="uploading"
        @change="handleFileChange"
      />
    </label>

    <p v-if="error" class="mt-1.5 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
