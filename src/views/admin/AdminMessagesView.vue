<script setup>
import { ref } from 'vue'
import { Trash2, Mail, MailOpen } from 'lucide-vue-next'
import api from '../../lib/api'

const messages = ref([])
const loading = ref(true)
const error = ref('')

async function fetchMessages() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/contact')
    messages.value = res.data.data
  } catch (err) {
    error.value = err?.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

async function toggleRead(message) {
  const nextState = !message.is_read
  message.is_read = nextState // optimistic update
  try {
    await api.patch(`/contact/${message.id}/read`, { is_read: nextState })
  } catch {
    message.is_read = !nextState // revert on failure
  }
}

async function handleDelete(message) {
  if (!confirm(`លុបសារពី "${message.full_name}"?`)) return
  try {
    await api.delete(`/contact/${message.id}`)
    messages.value = messages.value.filter((m) => m.id !== message.id)
  } catch (err) {
    error.value = err?.response?.data?.message || err.message
  }
}

fetchMessages()
</script>

<template>
  <div>
    <div>
      <h1 class="font-display text-2xl text-forest">សារទំនាក់ទំនង (Messages)</h1>
      <p class="mt-1 text-sm text-gray-500">សារដែលបញ្ជូនមកពីទម្រង់ទំនាក់ទំនងលើគេហទំព័រ</p>
    </div>

    <div v-if="loading" class="mt-8 space-y-3">
      <div v-for="n in 3" :key="n" class="h-20 animate-pulse rounded-xl2 bg-white" />
    </div>
    <p v-else-if="error" class="mt-8 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="!messages.length" class="mt-8 text-sm text-gray-400">មិនទាន់មានសារនៅឡើយទេ</p>

    <div v-else class="mt-8 space-y-3">
      <article
        v-for="message in messages"
        :key="message.id"
        class="card flex items-start gap-4 p-5"
        :class="{ 'border-gold/40 bg-gold/5': !message.is_read }"
      >
        <button
          type="button"
          class="mt-0.5 shrink-0 text-gray-400 transition hover:text-gold-dark"
          :title="message.is_read ? 'សម្គាល់ថាមិនទាន់អាន' : 'សម្គាល់ថាបានអាន'"
          @click="toggleRead(message)"
        >
          <MailOpen v-if="message.is_read" class="h-5 w-5" />
          <Mail v-else class="h-5 w-5 text-gold-dark" />
        </button>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p class="font-khmer font-semibold text-forest">{{ message.full_name }}</p>
            <p class="text-xs text-gray-400">{{ new Date(message.created_at).toLocaleString() }}</p>
          </div>
          <a :href="`mailto:${message.email}`" class="text-xs text-gold-dark hover:underline">{{ message.email }}</a>
          <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ message.message }}</p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
          @click="handleDelete(message)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </article>
    </div>
  </div>
</template>
