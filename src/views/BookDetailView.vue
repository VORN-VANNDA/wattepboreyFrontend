<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, BookOpen, Download } from 'lucide-vue-next'
import api from '../lib/api'
import { useApiResource } from '../composables/useApiResource'
import { recordId } from '../lib/publicLinks'
import { postImage } from '../lib/pchumBen'
import { bookCategoryLabel, bookPdfPreviewUrl } from '../lib/books'
import BookPdfViewer from '../components/BookPdfViewer.vue'
const route = useRoute()
const { data: book, loading, error, load } = useApiResource(() => api.get(`/books/${recordId(route.params.id)}`), { initial: null, immediate: false })
watch(() => route.params.id, () => load(), { immediate: true })
const readerUrl = ref('')
const readerBlob = ref(null)
const readerLoading = ref(false)
const readerError = ref('')
let requestId = 0
function clearReader() {
  if (readerUrl.value.startsWith('blob:')) URL.revokeObjectURL(readerUrl.value)
  readerUrl.value = ''
  readerBlob.value = null
}
watch(book, async (current) => {
  const id = ++requestId
  clearReader()
  readerError.value = ''
  if (!current?.pdf_url) return
  const previewUrl = bookPdfPreviewUrl(current.pdf_url)
  if (previewUrl && new URL(previewUrl).hostname !== 'res.cloudinary.com' && !new URL(previewUrl).pathname.startsWith('/api/books/pdf-files/')) {
    readerUrl.value = previewUrl
    return
  }
  readerLoading.value = true
  try {
    const response = await api.get(`/books/${current.id}/pdf`, { responseType: 'blob', timeout: 60000 })
    if (id !== requestId) return
    if (!response.data?.size || !/^application\/pdf/i.test(response.data.type)) throw new Error('Invalid PDF')
    readerBlob.value = response.data
    readerUrl.value = URL.createObjectURL(response.data)
  } catch {
    if (id === requestId) readerError.value = 'មិនអាចបង្ហាញឯកសារ PDF នៅពេលនេះបាន។ អាចបើកតាម link ដើមខាងលើ ឬ upload PDF ឡើងវិញក្នុង Admin។'
  } finally {
    if (id === requestId) readerLoading.value = false
  }
}, { immediate: true })
onBeforeUnmount(() => { requestId++; clearReader() })
</script>
<template>
  <main class="mx-auto max-w-6xl px-5 py-12 font-khmer lg:px-10">
    <RouterLink to="/books" class="inline-flex items-center gap-2 text-sm text-forest"><ArrowLeft class="h-4 w-4" /> ត្រឡប់ទៅបណ្ណាល័យ</RouterLink>
    <div v-if="loading" class="mt-8 h-96 animate-pulse rounded-xl bg-cream" />
    <div v-else-if="error" class="mt-8 text-red-600" role="alert">{{ error }} <button class="ml-2 underline" @click="load()">ព្យាយាមម្ដងទៀត</button></div>
    <article v-else-if="book" class="mt-8">
      <div class="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <img :src="postImage(book.cover_url)" :alt="book.title" class="w-full max-w-xs rounded-xl bg-cream object-contain shadow-card" />
        <div><span class="rounded-full bg-forest/10 px-3 py-1 text-sm text-forest">{{ bookCategoryLabel(book.category) }}</span><h1 class="mt-5 text-2xl font-bold leading-[1.8] text-forest sm:text-3xl">{{ book.title }}</h1><p class="mt-3 text-gray-500">អ្នកនិពន្ធ៖ {{ book.author || 'វត្តទេពបុរី' }}<span v-if="book.publication_year"> · {{ book.publication_year }}</span></p><p v-if="book.description" class="mt-5 whitespace-pre-wrap break-words leading-loose text-gray-700">{{ book.description }}</p><div class="mt-6 flex flex-wrap gap-3"><a :href="book.pdf_url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 font-semibold text-white hover:bg-gold-dark"><BookOpen class="h-4 w-4" /> បើក PDF ដើម</a><a v-if="readerUrl.startsWith('blob:')" :href="readerUrl" :download="`${book.title}.pdf`" class="inline-flex items-center gap-2 rounded-lg border border-gold px-5 py-3 font-semibold text-forest"><Download class="h-4 w-4" /> ទាញយក PDF</a></div></div>
      </div>
      <section class="mt-10"><h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-forest"><BookOpen class="h-5 w-5 text-gold-dark" />អានសៀវភៅ</h2><div v-if="readerLoading" class="flex min-h-[320px] items-center justify-center rounded-xl bg-cream text-forest" role="status">កំពុងបើកសៀវភៅ...</div><div v-else-if="readerError" class="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl bg-cream px-5 text-center" role="alert"><p>{{ readerError }}</p><button class="text-gold-dark underline" @click="load()">ព្យាយាមម្ដងទៀត</button></div><BookPdfViewer v-else-if="readerBlob" :blob="readerBlob" /><iframe v-else-if="readerUrl" :src="readerUrl" :title="`អាន ${book.title}`" class="h-[72vh] min-h-[480px] w-full rounded-xl border border-black/10 bg-cream" /></section>
    </article>
  </main>
</template>
