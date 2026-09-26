<script setup>
import { recordId } from '../lib/publicLinks'
import { watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, CalendarDays } from 'lucide-vue-next'
import api from '../lib/api'
import { useApiResource } from '../composables/useApiResource'
import { postImage, postDate } from '../lib/pchumBen'
const route = useRoute()
const { data: post, loading, error, load } = useApiResource(() => api.get(`/pchum-ben/${recordId(route.params.id)}`), { initial: null, immediate: false })
watch(() => recordId(route.params.id), () => load(), { immediate: true })
</script>
<template>
  <main class="mx-auto max-w-5xl px-5 py-12 lg:px-10">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm text-forest"><ArrowLeft class="h-4 w-4" /> ត្រឡប់ទៅទំព័រដើម</RouterLink>
    <div v-if="loading" class="mt-8 h-96 animate-pulse rounded-2xl bg-cream" aria-label="កំពុងផ្ទុក" />
    <div v-else-if="error" class="my-16 text-center" role="alert"><p class="text-red-600">{{ error }}</p><button class="mt-4 text-gold-dark underline" @click="load()">ព្យាយាមម្ដងទៀត</button></div>
    <article v-else-if="post" class="mt-8">
      <p class="text-sm font-semibold text-gold-dark">ពិធីបុណ្យកាន់បិណ្ឌ</p>
      <h1 class="mt-3 font-display text-2xl leading-relaxed text-forest sm:text-4xl">{{ post.title }}</h1>
      <p class="my-5 flex items-center gap-2 text-sm text-gray-500"><CalendarDays class="h-4 w-4" /><time :datetime="post.event_date">{{ postDate(post.event_date) }}</time></p>
      <img :src="postImage(post.images[0])" :alt="post.title" class="max-h-[600px] w-full rounded-2xl bg-cream object-contain" />
      <p v-if="post.excerpt" class="mt-8 text-lg leading-loose text-forest">{{ post.excerpt }}</p>
      <p class="mt-5 whitespace-pre-wrap break-words leading-loose text-gray-600">{{ post.description }}</p>
      <section v-if="post.images.length > 1" class="mt-12">
        <h2 class="mb-5 font-display text-xl text-forest">រូបភាពសកម្មភាព</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <a v-for="(url, i) in post.images.slice(1)" :key="`${url}-${i}`" :href="postImage(url)" target="_blank" rel="noopener noreferrer" :aria-label="`មើលរូបភាព ${i + 2}`">
            <img :src="postImage(url)" :alt="`${post.title} — ${i + 2}`" loading="lazy" class="w-full rounded-xl bg-cream object-contain" />
          </a>
        </div>
      </section>
    </article>
  </main>
</template>
