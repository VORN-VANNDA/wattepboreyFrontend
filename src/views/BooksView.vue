<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, BookOpen, Bookmark, Flower2, GraduationCap, Landmark, Lightbulb, ArrowRight } from 'lucide-vue-next'
import api from '../lib/api'
import { useApiResource } from '../composables/useApiResource'
import { publicPath } from '../lib/publicLinks'
import { postImage } from '../lib/pchumBen'
import { bookCategories, bookCategoryLabel } from '../lib/books'

const { data: books, loading, error, load } = useApiResource(() => api.get('/books'))
const query = ref('')
const category = ref('')
const saved = ref([])
const icons = { dhamma: Flower2, ethics: GraduationCap, history: Landmark, philosophy: Lightbulb }
onMounted(() => { try { saved.value = JSON.parse(localStorage.getItem('wt_saved_books') || '[]') } catch { saved.value = [] } })
function toggleSaved(id) {
  saved.value = saved.value.includes(id) ? saved.value.filter(item => item !== id) : [...saved.value, id]
  try { localStorage.setItem('wt_saved_books', JSON.stringify(saved.value)) } catch { /* Storage can be disabled. */ }
}
const filtered = computed(() => books.value.filter(book => (!category.value || book.category === category.value)
  && (!query.value.trim() || `${book.title} ${book.author} ${book.description || ''}`.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase()))))
</script>

<template>
  <div class="font-khmer text-forest">
    <section class="relative isolate overflow-hidden bg-forest-dark">
      <img src="/hero-book.png" alt="" class="absolute inset-0 -z-20 h-full w-full object-cover object-center" fetchpriority="high" />
      <div class="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-10">
        <h1 class="font-khmer text-4xl font-bold leading-loose text-white sm:text-5xl">បណ្ណាល័យសៀវភៅ</h1>
        <div class="mt-4 flex items-center gap-2 text-gold" aria-hidden="true"><span>✧</span><span class="h-px w-20 bg-gold"></span></div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-5 py-8 lg:px-10">
      <div class="relative mx-auto max-w-2xl"><Search class="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-forest-light/60" /><label for="book-search" class="sr-only">ស្វែងរកសៀវភៅ</label><input id="book-search" v-model="query" type="search" placeholder="ស្វែងរកចំណងជើងសៀវភៅ ឬអ្នកនិពន្ធ..." class="w-full rounded-full border border-black/10 bg-white py-4 pl-14 pr-5 shadow-sm outline-none focus:border-gold" /></div>
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <button :aria-pressed="category === ''" class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition" :class="category === '' ? 'border-forest bg-forest text-white' : 'border-black/10 bg-white hover:border-gold'" @click="category = ''"><BookOpen class="h-4 w-4" /> ទាំងអស់ / All</button>
        <button v-for="item in bookCategories" :key="item.value" :aria-pressed="category === item.value" class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition" :class="category === item.value ? 'border-forest bg-forest text-white' : 'border-black/10 bg-white hover:border-gold'" @click="category = item.value"><component :is="icons[item.value]" class="h-4 w-4" /> {{ item.label }}</button>
      </div>

      <div v-if="loading" class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"><div v-for="n in 6" :key="n" class="h-72 animate-pulse rounded-xl bg-cream" /></div>
      <div v-else-if="error" class="mt-10 text-center" role="alert"><p class="text-red-600">មិនអាចទាញសៀវភៅបាន។</p><button class="mt-3 text-gold-dark underline" @click="load()">ព្យាយាមម្ដងទៀត</button></div>
      <p v-else-if="!filtered.length" class="mt-10 text-center leading-loose text-gray-500">{{ books.length ? 'មិនមានសៀវភៅដែលត្រូវនឹងការស្វែងរក។' : 'សៀវភៅនឹងបង្ហាញនៅទីនេះពេល Admin បញ្ចូល។' }}</p>
      <div v-else class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <article v-for="book in filtered" :key="book.id" class="flex min-w-0 flex-col rounded-xl border border-black/5 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-card">
          <RouterLink :to="publicPath('books', book.id)" class="block aspect-[3/4] overflow-hidden rounded-lg bg-cream"><img :src="postImage(book.cover_url)" :alt="book.title" loading="lazy" class="h-full w-full object-contain transition duration-300 hover:scale-105" /></RouterLink>
          <h2 class="mt-3 line-clamp-2 min-h-[3.5em] text-sm font-semibold leading-[1.75]"><RouterLink :to="publicPath('books', book.id)" class="hover:text-gold-dark">{{ book.title }}</RouterLink></h2>
          <p class="mt-1 truncate text-xs text-gray-500">{{ book.author || 'វត្តទេពបុរី' }}</p>
          <span class="mt-2 w-fit rounded-md px-2 py-0.5 text-xs" :class="book.category === 'ethics' ? 'bg-gold/15 text-gold-dark' : 'bg-forest-light/10 text-forest'">{{ bookCategoryLabel(book.category) }}</span>
          <div class="mt-auto flex gap-2 pt-4"><RouterLink :to="publicPath('books', book.id)" class="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gold px-2 py-2 text-xs font-semibold text-white hover:bg-gold-dark"><BookOpen class="h-3.5 w-3.5" /> អានសៀវភៅ <ArrowRight class="h-3 w-3" /></RouterLink><button type="button" :aria-label="saved.includes(book.id) ? 'ដកសៀវភៅចេញពីបញ្ជីរក្សាទុក' : 'រក្សាទុកសៀវភៅ'" :aria-pressed="saved.includes(book.id)" class="rounded-lg border border-black/10 p-2" :class="saved.includes(book.id) ? 'text-gold-dark' : 'text-forest'" @click="toggleSaved(book.id)"><Bookmark class="h-4 w-4" :fill="saved.includes(book.id) ? 'currentColor' : 'none'" /></button></div>
        </article>
      </div>
    </div>
  </div>
</template>
