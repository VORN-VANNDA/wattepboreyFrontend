<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Search, Newspaper, Bell, Layers, CalendarDays, ArrowRight, Clock, MapPin, LayoutGrid, Flower2, Users, BookOpen, Images } from 'lucide-vue-next'
import api from '../lib/api'
import { useApiResource } from '../composables/useApiResource'
import { publicPath } from '../lib/publicLinks'
import { postImage } from '../lib/pchumBen'
import { newsCategories, dateParts } from '../lib/news'

const route = useRoute()
const router = useRouter()
const { data: posts, loading, error, load } = useApiResource(() => api.get('/news'))
const { data: events, error: eventsError, loading: eventsLoading, load: loadEvents } = useApiResource(() => api.get('/events?status=upcoming'))
const filters = reactive({ q: '', category: '', month: '' })
const visibleCount = ref(6)
const showAllEvents = ref(false)
watch(() => route.query, query => {
  filters.q = typeof query.q === 'string' ? query.q : ''
  filters.category = newsCategories.some(c => c.value === query.category) ? query.category : ''
  filters.month = typeof query.month === 'string' && /^\d{4}-\d{2}$/.test(query.month) ? query.month : ''
  visibleCount.value = 6
}, { immediate: true })
function search() {
  router.replace({ path: '/news', query: { ...(filters.q.trim() ? { q: filters.q.trim() } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.month ? { month: filters.month } : {}) } })
}
function selectCategory(value) { filters.category = value; search() }
const matchedPosts = computed(() => posts.value.filter(post => {
  const q = String(route.query.q || '').trim().toLocaleLowerCase()
  return (!route.query.category || post.category === route.query.category)
    && (!route.query.month || post.event_date?.startsWith(String(route.query.month)))
    && (!q || `${post.title} ${post.excerpt} ${post.description}`.toLocaleLowerCase().includes(q))
}))
const announcements = computed(() => posts.value.filter(post => post.category === 'announcement').slice(0, 4))
const categoryIcons = { ceremony: Flower2, announcement: Bell, community: Users, dharma: BookOpen, media: Images }
const months = computed(() => [...new Set(posts.value.map(post => post.event_date.slice(0, 7)))].sort().reverse())
const monthLabel = value => new Date(`${value}-01T12:00:00`).toLocaleDateString('km-KH', { month: 'long', year: 'numeric' })
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const upcoming = computed(() => events.value.filter(event => event.event_date && event.event_date.slice(0, 10) >= today).sort((a, b) => a.event_date.localeCompare(b.event_date)))
const visibleEvents = computed(() => upcoming.value.slice(0, showAllEvents.value ? undefined : 3))
</script>

<template>
  <div class="font-khmer text-forest">
    <section class="relative isolate overflow-hidden bg-forest-dark">
      <img src="/news.png" alt="" class="absolute inset-0 -z-20 h-full w-full object-cover object-center" fetchpriority="high" />
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-forest-dark/50 via-forest-dark/15 to-transparent"></div>
      <div class="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-10">
        <h1 class="font-khmer text-4xl font-bold leading-loose text-white sm:text-5xl sm:leading-loose">ព័ត៌មានទូទៅ</h1>
        <div class="my-3 flex items-center gap-2 text-gold" aria-hidden="true"><span>✧</span><span class="h-px w-20 bg-gold"></span></div>
        <p class="max-w-xl text-base leading-loose text-white/90 sm:text-lg sm:leading-loose">តាមដានព័ត៌មាន សេចក្ដីជូនដំណឹង សកម្មភាពសង្គម និងកម្មវិធីបុណ្យទាន នានារបស់វត្តទេពបុរី។</p>
      </div>
    </section>

    <div class="border-b border-black/5 bg-cream/70">
      <form class="mx-auto grid max-w-7xl gap-3 px-5 py-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto] lg:px-10" @submit.prevent="search">
        <label class="relative"><span class="sr-only">ស្វែងរកព័ត៌មាន</span><Search class="absolute left-4 top-3.5 h-5 w-5 text-forest-light/60" /><input v-model="filters.q" type="search" placeholder="ស្វែងរកព័ត៌មាន..." class="w-full rounded-lg border border-black/10 bg-white py-3 pl-12 pr-4 outline-none focus:border-gold" /></label>
        <label><span class="sr-only">ប្រភេទព័ត៌មាន</span><select v-model="filters.category" class="w-full rounded-lg border border-black/10 bg-white px-4 py-3"><option value="">ប្រភេទទាំងអស់</option><option v-for="item in newsCategories" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>
        <label><span class="sr-only">ជ្រើសរើសខែ និងឆ្នាំ</span><select v-model="filters.month" class="w-full rounded-lg border border-black/10 bg-white px-4 py-3"><option value="">គ្រប់ខែ / ឆ្នាំ</option><option v-for="month in months" :key="month" :value="month">{{ monthLabel(month) }}</option></select></label>
        <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-6 py-3 font-semibold text-white transition hover:bg-forest-light"><Search class="h-5 w-5" /> ស្វែងរក</button>
      </form>
    </div>

    <div class="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:px-10">
      <div class="min-w-0">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 class="flex items-center gap-3 text-2xl font-bold leading-loose"><Newspaper class="h-7 w-7 text-gold-dark" /> {{ route.query.category || route.query.q || route.query.month ? 'លទ្ធផលស្វែងរក' : 'ព័ត៌មានថ្មីៗ' }}</h2>
          <button v-if="route.query.category || route.query.q || route.query.month" class="text-sm text-gold-dark" @click="router.replace('/news')">មើលទាំងអស់ →</button>
        </div>
        <div v-if="loading" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"><div v-for="n in 3" :key="n" class="h-80 animate-pulse rounded-xl bg-cream" /></div>
        <div v-else-if="error" class="rounded-xl border border-red-100 p-8 text-center" role="alert"><p class="text-red-600">មិនអាចទាញព័ត៌មានបាន។</p><button class="mt-3 text-gold-dark underline" @click="load()">ព្យាយាមម្ដងទៀត</button></div>
        <p v-else-if="!matchedPosts.length" class="rounded-xl border border-black/5 bg-cream/40 p-10 text-center text-gray-500">មិនមានព័ត៌មានដែលត្រូវនឹងការស្វែងរកនេះទេ។</p>
        <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <RouterLink v-for="post in matchedPosts.slice(0, visibleCount)" :key="post.id" :to="publicPath('news', post.id)" class="group flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card">
            <div class="relative aspect-[1.7] overflow-hidden bg-cream"><img :src="postImage(post.images[0])" :alt="post.title" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" /><div class="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-2 text-center shadow-sm"><strong class="block text-xl leading-none">{{ dateParts(post.event_date).day }}</strong><span class="text-[10px] font-semibold">{{ dateParts(post.event_date).month }}</span></div></div>
            <div class="flex flex-1 flex-col p-4"><h3 class="text-lg font-semibold leading-[1.8]">{{ post.title }}</h3><p class="mb-5 mt-2 line-clamp-3 text-sm leading-loose text-gray-500">{{ post.excerpt || post.description }}</p><div class="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3 text-xs"><time :datetime="post.event_date" class="flex items-center gap-1.5 text-gray-500"><CalendarDays class="h-3.5 w-3.5" />{{ post.event_date }}</time><span class="flex items-center gap-1 text-gold-dark">អានបន្ត <ArrowRight class="h-4 w-4" /></span></div></div>
          </RouterLink>
        </div>
        <button v-if="matchedPosts.length > visibleCount" class="mx-auto mt-6 block rounded-lg border border-gold px-6 py-2.5 text-gold-dark" @click="visibleCount += 6">មើលព័ត៌មានបន្ថែម</button>

        <section v-if="announcements.length" class="mt-10">
          <div class="mb-5 flex items-center justify-between gap-3"><h2 class="flex items-center gap-3 text-2xl font-bold leading-loose"><Bell class="h-7 w-7 text-gold-dark" />សេចក្ដីជូនដំណឹង</h2><button class="shrink-0 text-sm text-gold-dark" @click="selectCategory('announcement')">មើលទាំងអស់ →</button></div>
          <div class="grid gap-4 sm:grid-cols-2"><RouterLink v-for="post in announcements" :key="post.id" :to="publicPath('news', post.id)" class="flex items-center gap-3 rounded-lg border border-black/5 bg-white p-2 shadow-sm hover:border-gold/40"><img :src="postImage(post.images[0])" :alt="post.title" loading="lazy" class="h-20 w-20 shrink-0 rounded-md object-cover" /><div class="min-w-0 flex-1"><h3 class="line-clamp-2 text-sm font-semibold leading-loose">{{ post.title }}</h3><time :datetime="post.event_date" class="mt-1 block text-xs text-gray-500">{{ post.event_date }}</time></div><ArrowRight class="mr-1 h-7 w-7 shrink-0 rounded-full bg-gold/10 p-1 text-gold-dark" /></RouterLink></div>
        </section>
      </div>

      <aside class="space-y-5">
        <section class="rounded-xl border border-black/5 bg-cream/30 p-5">
          <h2 class="mb-4 flex items-center gap-3 text-lg font-semibold"><Layers class="h-5 w-5 text-gold-dark" />ប្រភេទព័ត៌មាន</h2>
          <button :aria-pressed="!route.query.category" class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm" :class="!route.query.category ? 'bg-gold/10 text-gold-dark' : 'hover:bg-cream'" @click="selectCategory('')"><LayoutGrid class="h-5 w-5" />ទាំងអស់<span class="ml-auto rounded-full bg-forest/5 px-2 text-xs text-forest">{{ posts.length }}</span></button>
          <button v-for="item in newsCategories" :key="item.value" :aria-pressed="route.query.category === item.value" class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm" :class="route.query.category === item.value ? 'bg-gold/10 text-gold-dark' : 'hover:bg-cream'" @click="selectCategory(item.value)"><component :is="categoryIcons[item.value]" class="h-5 w-5 shrink-0" />{{ item.label }}<span class="ml-auto rounded-full bg-forest/5 px-2 text-xs text-forest">{{ posts.filter(post => post.category === item.value).length }}</span></button>
        </section>
        <section class="rounded-xl border border-gold/15 bg-gold/5 p-5">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gold-dark"><CalendarDays class="h-5 w-5" />ព្រឹត្តិការណ៍ខាងមុខ</h2>
          <p v-if="eventsLoading" class="text-sm text-gray-500">កំពុងផ្ទុក...</p>
          <button v-else-if="eventsError" class="text-sm text-gold-dark underline" @click="loadEvents()">ព្យាយាមទាញកម្មវិធីម្ដងទៀត</button>
          <p v-else-if="!upcoming.length" class="text-sm leading-loose text-gray-500">មិនទាន់មានកម្មវិធីខាងមុខ។</p>
          <div v-else class="space-y-3"><RouterLink v-for="event in visibleEvents" :key="event.id" :to="publicPath('events', event.id)" class="flex gap-3 rounded-xl border border-black/5 bg-white p-3"><div class="h-fit rounded-lg bg-cream px-2 py-2 text-center"><strong class="block text-xl leading-none">{{ dateParts(event.event_date).day }}</strong><span class="text-[10px]">{{ dateParts(event.event_date).month }}</span></div><div class="min-w-0"><h3 class="text-sm font-semibold leading-loose">{{ event.title }}</h3><p v-if="event.start_time" class="mt-1 flex items-center gap-1 text-xs text-gray-500"><Clock class="h-3 w-3" />{{ event.start_time.slice(0, 5) }}<span v-if="event.end_time">– {{ event.end_time.slice(0, 5) }}</span></p><p v-if="event.location" class="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin class="h-3 w-3 shrink-0" />{{ event.location }}</p></div></RouterLink></div>
          <button v-if="upcoming.length > 3" class="mt-4 w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-forest" @click="showAllEvents = !showAllEvents">{{ showAllEvents ? 'បង្ហាញតិច' : 'មើលកម្មវិធីទាំងអស់' }}</button>
        </section>
      </aside>
    </div>
  </div>
</template>
