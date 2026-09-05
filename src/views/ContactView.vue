<script setup>
import { useLocale } from '../composables/useLocale'
import { reactive, ref } from 'vue'
import { MapPin, Phone, Clock, Facebook, Send } from 'lucide-vue-next'

import api from '../lib/api'

const { t } = useLocale()

const form = reactive({ full_name: '', email: '', message: '' })
const submitting = ref(false)
const feedback = ref(null) // { type: 'success' | 'error', text: string }

async function handleSubmit() {
  submitting.value = true
  feedback.value = null
  try {
    await api.post('/contact', form)
    feedback.value = { type: 'success', text: t('contact.success') }
    form.full_name = ''
    form.email = ''
    form.message = ''
  } catch (err) {
    feedback.value = {
      type: 'error',
      text: err?.response?.data?.message || t('contact.failure'),
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <section class="bg-forest-dark py-20 text-center text-white">
      <h1 class="font-display text-3xl sm:text-4xl">{{ t('contact.title') }}</h1>
      <p class="mx-auto mt-4 max-w-xl px-5 text-sm text-white/70 sm:text-base">
        {{ t('contact.subtitle') }}
      </p>
    </section>

    <section class="mx-auto max-w-6xl px-5 py-16 lg:px-10">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <!-- Info column -->
        <div>
          <h2 class="font-display text-xl text-forest">{{ t('contact.infoHeading') }}</h2>

          <div class="mt-8 space-y-7">
            <div class="flex gap-4">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream text-forest">
                <MapPin class="h-5 w-5" />
              </span>
              <div>
                <p class="font-khmer font-semibold text-forest">{{ t('contact.address') }}</p>
                <p class="mt-1 text-sm text-gray-500">ភូមិខ្នារ, ឃុំក្រាំងធ្នង់, ស្រុកចាទី, ខេត្តតាកែវ</p>
              </div>
            </div>

            <div class="flex gap-4">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream text-forest">
                <Phone class="h-5 w-5" />
              </span>
              <div>
                <p class="font-khmer font-semibold text-forest">{{ t('contact.phone') }}</p>
                <p class="mt-1 text-sm text-gray-500">+855 12 345 678</p>
                <p class="text-sm text-gray-500">+855 98 765 432</p>
              </div>
            </div>

            <div class="flex gap-4">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream text-forest">
                <Clock class="h-5 w-5" />
              </span>
              <div>
                <p class="font-khmer font-semibold text-forest">{{ t('contact.hours') }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ t('contact.hoursValue') }}</p>
              </div>
            </div>

            <div class="flex gap-4">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream text-forest">
                <Facebook class="h-5 w-5" />
              </span>
              <div>
                <p class="font-khmer font-semibold text-forest">{{ t('contact.social') }}</p>
                <a
                  href="https://www.facebook.com/share/19RV7KW4zY/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-1 block text-sm text-gold-dark hover:underline"
                >
                  វត្តទេពបុរី - Tep Borey Pagoda
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="card p-7 sm:p-9">
          <h2 class="font-display text-xl text-forest">{{ t('contact.formHeading') }}</h2>

          <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
            <div>
              <label for="full_name" class="mb-1.5 block text-sm font-medium text-gray-700">
                {{ t('contact.name') }}
              </label>
              <input
                id="full_name"
                v-model="form.full_name"
                type="text"
                required
                placeholder="John Doe"
                class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:border-gold"
              />
            </div>

            <div>
              <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700">
                {{ t('contact.email') }}
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="john@example.com"
                class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:border-gold"
              />
            </div>

            <div>
              <label for="message" class="mb-1.5 block text-sm font-medium text-gray-700">
                {{ t('contact.message') }}
              </label>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="5"
                placeholder="..."
                class="w-full resize-none rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:border-gold"
              />
            </div>

            <button type="submit" :disabled="submitting" class="btn-gold w-full disabled:opacity-60">
              <Send class="h-4 w-4" />
              {{ submitting ? t('contact.sending') : t('contact.send') }}
            </button>

            <p
              v-if="feedback"
              class="text-sm"
              :class="feedback.type === 'success' ? 'text-green-600' : 'text-red-500'"
            >
              {{ feedback.text }}
            </p>
          </form>
        </div>
      </div>
    </section>

    <!-- Map -->
    <section class="mx-auto max-w-6xl px-5 pb-20 lg:px-10">
      <div class="h-96 overflow-hidden rounded-xl2 border border-black/5">
        <iframe class="h-full w-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.8265743094407!2d104.80205207536711!3d11.34737468883824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310943e233c3ebd1%3A0x519e468478ec9845!2sTep%20Borei%20Pagoda!5e0!3m2!1sen!2skh!4v1788622898245!5m2!1sen!2skh" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>
    </section>
  </div>
</template>
