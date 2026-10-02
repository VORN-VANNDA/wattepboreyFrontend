<script setup>
import { watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, BookOpen, Download } from 'lucide-vue-next'
import api from '../lib/api'
import { useApiResource } from '../composables/useApiResource'
import { recordId } from '../lib/publicLinks'
import { postImage } from '../lib/pchumBen'
import { bookCategoryLabel } from '../lib/books'
const route = useRoute()
const { data: book, loading, error, load } = useApiResource(() => api.get(`/books/${recordId(route.params.id)}`), { initial: null, immediate: false })
watch(() => route.params.id, () => load(), { immediate: true })
</script>
<template>
  <main class="mx-auto max-w-6xl px-5 py-12 font-khmer lg:px-10">
    <RouterLink to="/books" class="inline-flex items-center gap-2 text-sm text-forest"><ArrowLeft class="h-4 w-4" /> ត្រឡប់ទៅបណ្ណាល័យ</RouterLink>
    <div v-if="loading" class="mt-8 h-96 animate-pulse rounded-xl bg-cream" />
    <div v-else-if="error" class="mt-8 text-red-600" role="alert">{{ error }} <button class="ml-2 underline" @click="load()">ព្យាយាមម្ដងទៀត</button></div>
    <article v-else-if="book" class="mt-8">
      <div class="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <img :src="postImage(book.cover_url)" :alt="book.title" class="w-full max-w-xs rounded-xl bg-cream object-contain shadow-card" />
        <div><span class="rounded-full bg-forest/10 px-3 py-1 text-sm text-forest">{{ bookCategoryLabel(book.category) }}</span><h1 class="mt-5 text-2xl font-bold leading-[1.8] text-forest sm:text-3xl">{{ book.title }}</h1><p class="mt-3 text-gray-500">អ្នកនិពន្ធ៖ {{ book.author || 'វត្តទេពបុរី' }}<span v-if="book.publication_year"> · {{ book.publication_year }}</span></p><p v-if="book.description" class="mt-5 whitespace-pre-wrap break-words leading-loose text-gray-700">{{ book.description }}</p><a :href="book.pdf_url" target="_blank" rel="noopener noreferrer" class="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 font-semibold text-white hover:bg-gold-dark"><Download class="h-4 w-4" /> បើកសៀវភៅ PDF</a></div>
      </div>
      <section class="mt-10"><h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-forest"><BookOpen class="h-5 w-5 text-gold-dark" />អានសៀវភៅ</h2><iframe :src="book.pdf_url" :title="`អាន ${book.title}`" loading="lazy" class="h-[72vh] min-h-[480px] w-full rounded-xl border border-black/10 bg-cream" /><p class="mt-3 text-sm text-gray-500">បើ PDF មិនបង្ហាញក្នុងទំព័រនេះ សូមចុច «បើកសៀវភៅ PDF» ខាងលើ។</p></section>
    </article>
  </main>
</template>
