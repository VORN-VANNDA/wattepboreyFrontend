<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LogIn, Loader2 } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'

const { login } = useAuth()
const router = useRouter()
const route = useRoute()

const form = reactive({ username: '', password: '' })
const submitting = ref(false)
const error = ref('')

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  try {
    await login(form.username, form.password)
    router.push(route.query.redirect || '/admin/members')
  } catch (err) {
    error.value = err?.response?.data?.message || 'ចូលប្រើប្រាស់មិនជោគជ័យ សូមពិនិត្យមើលឈ្មោះ/ពាក្យសម្ងាត់។'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-forest-dark px-5">
    <div class="w-full max-w-sm rounded-xl2 bg-white p-8 shadow-card">
      <div class="text-center">
        <p class="font-display text-xl text-forest">វត្តទេពបុរី</p>
        <p class="mt-1 text-sm text-gray-500">Admin Dashboard</p>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="username" class="mb-1.5 block text-sm font-medium text-gray-700">
            ឈ្មោះអ្នកប្រើប្រាស់
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            autocomplete="username"
            class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:border-gold"
          />
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700">
            ពាក្យសម្ងាត់
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:border-gold"
          />
        </div>

        <button type="submit" :disabled="submitting" class="btn-gold w-full disabled:opacity-60">
          <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
          <LogIn v-else class="h-4 w-4" />
          ចូលប្រើប្រាស់
        </button>

        <p v-if="error" class="text-center text-sm text-red-500">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
