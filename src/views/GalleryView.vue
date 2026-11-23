<script setup>
import { useLocale } from '../composables/useLocale'
import { ref, computed, watch } from 'vue'
import { Search, Images, X, ChevronLeft, ChevronRight, Download } from 'lucide-vue-next'

import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'
import SectionHeading from '../components/SectionHeading.vue'

const { t } = useLocale()

const searchTerm = ref('')
const activeYear = ref('all')
const activeCategory = ref('all')
const selectedAlbum = ref(null)
const selectedIndex = ref(0)
const downloading = ref(false)

const { data: years } = useApiResource(() => api.get('/gallery/years'))
const { data: photos, loading, error, load } = useApiResource(() => api.get('/gallery'))

const categories = [
  { value: 'all', kh: 'ទាំងអស់', en: 'All' },
  { value: 'ceremony', kh: 'ពិធីបុណ្យទាន', en: 'Ceremonies' },
  { value: 'architecture', kh: 'ស្ថាបត្យកម្មវត្ត', en: 'Architecture' },
  { value: 'community', kh: 'សកម្មភាពសង្គម', en: 'Community' },
]

// Re-fetch from the API whenever a filter tab changes.
watch([activeYear, activeCategory], () => {
  load({
    year: activeYear.value !== 'all' ? activeYear.value : undefined,
    category: activeCategory.value !== 'all' ? activeCategory.value : undefined,
  })
})

const filteredPhotos = computed(() => {
  if (!searchTerm.value.trim()) return photos.value
  const q = searchTerm.value.trim().toLowerCase()
  return photos.value.filter((p) => p.title.toLowerCase().includes(q))
})

// Photos uploaded together share the same event/album name, category and year.
// Grouping here preserves existing records without a database migration.
const albums = computed(() => {
  const groups = new Map()
  for (const photo of filteredPhotos.value) {
    const key = `${photo.year}|${photo.category}|${photo.title}`
    if (!groups.has(key)) groups.set(key, { key, title: photo.title, year: photo.year, category: photo.category, photos: [] })
    groups.get(key).photos.push(photo)
  }
  return [...groups.values()]
})

function openAlbum(album, index = 0) {
  selectedAlbum.value = album
  selectedIndex.value = index
}
function closeAlbum() { selectedAlbum.value = null; selectedIndex.value = 0 }
function stepPhoto(offset) {
  if (!selectedAlbum.value) return
  const total = selectedAlbum.value.photos.length
  selectedIndex.value = (selectedIndex.value + offset + total) % total
}

async function downloadCurrent() {
  const photo = selectedAlbum.value?.photos[selectedIndex.value]
  if (!photo || downloading.value) return
  downloading.value = true
  try {
    const response = await fetch(photo.image_url)
    if (!response.ok) throw new Error('Download failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const extension = photo.image_url.match(/\.(jpe?g|png|webp|gif)(?:[?#]|$)/i)?.[1] || 'jpg'
    link.href = url
    link.download = `${selectedAlbum.value.title}-${selectedIndex.value + 1}.${extension}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch {
    window.open(photo.image_url, '_blank', 'noopener,noreferrer')
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div>
    <section class="bg-forest-dark py-20 text-center text-white">
      <h1 class="font-display text-3xl sm:text-4xl">{{ t('gallery.title') }}</h1>
      <p class="mx-auto mt-4 max-w-2xl px-5 text-sm leading-loose text-white/75 sm:text-base">ទស្សនារូបភាពសកម្មភាព ពិធីបុណ្យ និងទិដ្ឋភាពនានារបស់វត្តទេពបុរី។</p>
    </section>

    <section class="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <!-- Search -->
      <div class="relative mx-auto max-w-xl">
        <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="t('gallery.searchPlaceholder')"
          class="w-full rounded-full border border-black/10 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gold"
        />
      </div>

      <!-- Year tabs -->
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          class="rounded-full px-4 py-1.5 text-sm font-medium transition"
          :class="activeYear === 'all' ? 'bg-gold text-forest-dark' : 'bg-cream text-gray-500 hover:bg-gold/20'"
          @click="activeYear = 'all'"
        >
          {{ t('common.all') }}
        </button>
        <button
          v-for="year in years"
          :key="year"
          type="button"
          class="rounded-full px-4 py-1.5 text-sm font-medium transition"
          :class="String(activeYear) === String(year) ? 'bg-gold text-forest-dark' : 'bg-cream text-gray-500 hover:bg-gold/20'"
          @click="activeYear = year"
        >
          {{ year }}
        </button>
      </div>

      <!-- Category tabs -->
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          type="button"
          class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
          :class="
            activeCategory === cat.value
              ? 'border-forest bg-forest text-white'
              : 'border-black/10 text-gray-500 hover:border-forest/40'
          "
          @click="activeCategory = cat.value"
        >
          {{ t('common.all') === cat.en ? cat.kh : (cat.kh + ' / ' + cat.en) }}
        </button>
      </div>

      <!-- Grid -->
      <div v-if="loading" class="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="n in 8" :key="n" class="aspect-square animate-pulse rounded-xl2 bg-cream" />
      </div>
      <p v-else-if="error" class="mt-12 text-center text-sm text-red-500">
        {{ t('common.error') }}
        <button type="button" class="ml-2 font-semibold underline hover:no-underline" @click="load()">
          ព្យាយាមម្តងទៀត
        </button>
      </p>
      <p v-else-if="!albums.length" class="mt-12 text-center text-sm text-gray-500">
        {{ t('common.empty') }}
      </p>

      <div v-else class="fade-in mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <button
          v-for="album in albums"
          :key="album.key"
          type="button"
          class="group relative aspect-square overflow-hidden rounded-xl2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          @click="openAlbum(album)"
        >
          <img
            :src="album.photos[0].image_url || 'https://placehold.co/500x500/2C5038/F7F6F1?text=Wat+Tepborey'"
            :alt="album.title"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <figcaption
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-xs text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
          >
            <span class="block font-semibold">{{ album.title }}</span>
            <span class="mt-1 flex items-center gap-1 text-white/80"><Images class="h-3.5 w-3.5" /> {{ album.photos.length }} រូប · {{ album.year }}</span>
          </figcaption>
        </button>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="selectedAlbum" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" :aria-label="selectedAlbum.title" @click.self="closeAlbum">
        <div class="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
          <button type="button" class="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white" aria-label="បិទ" @click="closeAlbum"><X class="h-5 w-5" /></button>
          <div class="mb-4 flex items-start justify-between gap-3 pr-10"><div><h2 class="font-khmer text-xl font-semibold text-forest">{{ selectedAlbum.title }}</h2><p class="mt-1 text-sm text-gray-500">{{ selectedAlbum.year }} · {{ selectedAlbum.photos.length }} រូប</p></div><button type="button" :disabled="downloading" class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gold px-3 py-2 text-sm font-semibold text-forest hover:bg-gold/10 disabled:opacity-50" @click="downloadCurrent"><Download class="h-4 w-4" /> {{ downloading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុករូប' }}</button></div>
          <div class="relative rounded-xl bg-cream p-2 sm:p-4">
            <img :src="selectedAlbum.photos[selectedIndex].image_url" :alt="selectedAlbum.title" class="mx-auto max-h-[68vh] w-auto max-w-full rounded-lg object-contain" />
            <button v-if="selectedAlbum.photos.length > 1" type="button" class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white" aria-label="រូបមុន" @click="stepPhoto(-1)"><ChevronLeft class="h-6 w-6" /></button>
            <button v-if="selectedAlbum.photos.length > 1" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white" aria-label="រូបបន្ទាប់" @click="stepPhoto(1)"><ChevronRight class="h-6 w-6" /></button>
          </div>
          <div v-if="selectedAlbum.photos.length > 1" class="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8">
            <button v-for="(photo, index) in selectedAlbum.photos" :key="photo.id" type="button" class="aspect-square overflow-hidden rounded-md ring-offset-2" :class="index === selectedIndex ? 'ring-2 ring-gold' : 'opacity-70 hover:opacity-100'" @click="selectedIndex = index"><img :src="photo.image_url" :alt="`${selectedAlbum.title} ${index + 1}`" class="h-full w-full object-cover" /></button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
