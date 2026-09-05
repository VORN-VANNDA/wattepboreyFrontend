<script setup>
import { useLocale } from '../composables/useLocale'
import { ref, computed, watch } from 'vue'
import { Search } from 'lucide-vue-next'

import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'
import SectionHeading from '../components/SectionHeading.vue'

const { t } = useLocale()

const searchTerm = ref('')
const activeYear = ref('all')
const activeCategory = ref('all')

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
</script>

<template>
  <div>
    <section class="bg-forest-dark py-20 text-center text-white">
      <h1 class="font-display text-3xl sm:text-4xl">{{ t('gallery.title') }}</h1>
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
      <p v-else-if="!filteredPhotos.length" class="mt-12 text-center text-sm text-gray-500">
        {{ t('common.empty') }}
      </p>

      <div v-else class="fade-in mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <figure
          v-for="photo in filteredPhotos"
          :key="photo.id"
          class="group relative aspect-square overflow-hidden rounded-xl2"
        >
          <img
            :src="photo.image_url || 'https://placehold.co/500x500/2C5038/F7F6F1?text=Wat+Tepborey'"
            :alt="photo.title"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <figcaption
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white opacity-0 transition group-hover:opacity-100"
          >
            {{ photo.title }}
          </figcaption>
        </figure>
      </div>
    </section>
  </div>
</template>
