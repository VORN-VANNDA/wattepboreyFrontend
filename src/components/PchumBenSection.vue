<script setup>
import { publicPath } from '../lib/publicLinks'
import { RouterLink } from 'vue-router'
import { ArrowRight, CalendarDays } from 'lucide-vue-next'

import api from '../lib/api'
import { useApiResource } from '../composables/useApiResource'
import { postImage, postDate } from '../lib/pchumBen'
const { data: posts, loading, error, load } = useApiResource(() => api.get('/pchum-ben'))
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-16 lg:px-10" aria-labelledby="pchum-ben-heading">
    <header class="text-center">
      <p class="text-sm font-semibold leading-loose text-gold-dark [word-spacing:0.12em]">បច្ចុប្បន្នភាព &amp; សកម្មភាព</p>
      <h2 id="pchum-ben-heading" class="mt-3 font-display text-2xl leading-[1.9] text-forest [word-spacing:0.15em] sm:text-3xl sm:leading-[1.9]">ព័ត៌មាន &amp; ព្រឹត្តិការណ៍ថ្មីៗ</h2>
      <div class="mx-auto mt-5 h-1 w-16 rounded-full bg-gold" aria-hidden="true"></div>
      <p class="mx-auto mt-6 max-w-2xl text-sm leading-loose text-forest-light/80 [word-spacing:0.08em] sm:text-base sm:leading-loose">ស្វែងយល់ពីពិធីបុណ្យប្រពៃណី សកម្មភាពអប់រំ និងកិច្ចការមនុស្សធម៌របស់វត្តទេពបុរី</p>
    </header>
    <div v-if="loading" class="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-label="កំពុងផ្ទុក">
      <div v-for="n in 3" :key="n" class="h-80 animate-pulse rounded-2xl bg-cream" />
    </div>
    <div v-else-if="error" class="mt-10 text-center text-gray-500" role="alert">
      មិនអាចទាញយកព័ត៌មានបាន។ <button class="text-gold-dark underline" @click="load()">ព្យាយាមម្ដងទៀត</button>
    </div>
    <p v-else-if="!posts.length" class="mt-10 text-center text-gray-500">ព័ត៌មានពិធីបុណ្យកាន់បិណ្ឌនឹងផ្សាយនៅទីនេះ។</p>
    <div v-else class="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink v-for="post in posts" :key="post.id" :to="publicPath('pchum-ben', post.id)" class="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card focus-visible:outline-gold">
        <div class="relative aspect-video overflow-hidden bg-cream">
          <img :src="postImage(post.images[0])" :alt="post.title" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          <span class="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-forest">កាន់បិណ្ឌ</span>
        </div>
        <div class="flex flex-1 flex-col p-5">
          <p class="flex items-center gap-2 text-xs text-gray-500"><CalendarDays class="h-4 w-4 text-gold-dark" /><time :datetime="post.event_date">{{ postDate(post.event_date) }}</time></p>
          <h3 class="mt-3 font-display text-lg leading-relaxed text-forest">{{ post.title }}</h3>
          <p class="mb-5 mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">{{ post.excerpt || post.description }}</p>
          <span class="mt-auto flex items-center justify-between border-t border-black/5 pt-4 text-sm text-gold-dark">អានបន្ត <ArrowRight class="h-4 w-4" /></span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
