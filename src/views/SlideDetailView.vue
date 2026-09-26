<script setup>
import { publicPath, recordId } from '../lib/publicLinks'
import { useLocale } from '../composables/useLocale'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'


import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'

const route = useRoute()
const { locale, t } = useLocale()

// Current slide
const {
  data: slide,
  loading,
  error,
  load,
} = useApiResource(
  () => api.get(`/slides/${recordId(route.params.id)}`),
  { initial: null }
)

// All slides - for right sidebar
const {
  data: slides,
  loading: slidesLoading,
} = useApiResource(
  () => api.get('/slides'),
  { initial: [] }
)

function localizedField(item, khKey, enKey) {
  return locale.value === 'en' && item?.[enKey]
    ? item[enKey]
    : item?.[khKey]
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url || '')
}

// Current article
const title = computed(() =>
  localizedField(slide.value, 'title', 'title_en') || ''
)

const badge = computed(() =>
  localizedField(slide.value, 'badge', 'badge_en') || ''
)

const description = computed(() =>
  localizedField(slide.value, 'subtitle', 'subtitle_en') || ''
)

const descriptionParagraphs = computed(() =>
  description.value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
)
// Function សម្រាប់ Share ទៅ Facebook
function shareToFacebook() {
  const currentUrl = encodeURIComponent(window.location.href)

  const quote = encodeURIComponent(
    `${title.value}\n\n${description.value}`
  )

  const shareUrl =
    `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${quote}`

  window.open(
    shareUrl,
    '_blank',
    'width=600,height=700'
  )
}

// ============================================================
// Gallery — extra photos beyond the single main image, plus a
// simple lightbox to view them full-size with prev/next.
// ============================================================

const galleryImages = computed(() =>
  Array.isArray(slide.value?.gallery_images) ? slide.value.gallery_images : []
)

const lightboxIndex = ref(null) // null = closed

function openLightbox(index) {
  lightboxIndex.value = index
}

function closeLightbox() {
  lightboxIndex.value = null
}

function lightboxPrev() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value =
    (lightboxIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

function lightboxNext() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % galleryImages.value.length
}

// Related slides — show ALL other slides, sorted newest first,
// so older slides remain reachable even after they drop off the
// home page's 3-slide rotation.
const relatedSlides = computed(() => {
  if (!Array.isArray(slides.value)) return []

  return slides.value
    .filter(item => String(item.id) !== String(recordId(route.params.id)))
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0)
      const dateB = new Date(b.created_at || b.updated_at || 0)
      return dateB - dateA
    })
})
</script>

<template>
  <div class="bg-white min-h-screen">

    <!-- =========================
         HEADER / BACK
    ========================== -->
    <section class="bg-cream py-8 sm:py-10">
      <div class="mx-auto max-w-7xl px-5 lg:px-8">

        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-sm font-semibold text-forest/70 transition hover:text-gold-dark"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('nav.home') }}
        </RouterLink>

      </div>
    </section>


    <!-- =========================
         ARTICLE CONTENT
    ========================== -->
    <section class="pb-16 sm:pb-20">
      <div class="mx-auto max-w-7xl px-5 lg:px-8">

        <!-- Loading -->
        <div
          v-if="loading"
          class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div class="animate-pulse">
            <div class="h-[420px] rounded-2xl bg-gray-200"></div>
            <div class="mt-6 h-5 w-32 rounded bg-gray-200"></div>
            <div class="mt-4 h-10 w-4/5 rounded bg-gray-200"></div>
            <div class="mt-4 h-20 w-full rounded bg-gray-200"></div>
          </div>

          <div class="space-y-5">
            <div
              v-for="i in 4"
              :key="i"
              class="flex gap-4 animate-pulse"
            >
              <div class="h-24 w-32 rounded-xl bg-gray-200"></div>
              <div class="flex-1">
                <div class="h-4 w-20 rounded bg-gray-200"></div>
                <div class="mt-3 h-12 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>


        <!-- Error -->
        <div
          v-else-if="error"
          class="mt-8 rounded-2xl bg-white p-10 text-center text-red-500 shadow-card ring-1 ring-black/5"
        >
          {{ error }}
          <button type="button" class="ml-2 font-semibold underline hover:no-underline" @click="load()">ព្យាយាមម្តងទៀត</button>
        </div>


        <!-- =========================
             MAIN ARTICLE
        ========================== -->
        <div
          v-else-if="slide"
          class="fade-in mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px]"
        >

          <!-- ==================================
               LEFT : FEATURED ARTICLE
          =================================== -->
          <article>

            <!-- Badge + Title — above the photo -->
            <div>

              <p
                v-if="badge"
                class="font-khmer text-sm font-semibold text-gold-dark"
              >
                {{ badge }}
              </p>

              <h1
                class="mt-2 max-w-4xl font-display text-2xl leading-[1.6] text-forest sm:text-3xl lg:text-[20px] lg:leading-[1.5]"
              >
                {{ title }}
              </h1>

            </div>


            <!-- Main Image -->
            <div
              class="mt-5 overflow-hidden rounded-2xl bg-cream"
            >
              <img
                :src="
                  slide.image_url ||
                  'https://placehold.co/1200x700/1A3626/F7F6F1?text=Wat+Tepborey'
                "
                :alt="title"
                class="block aspect-[16/9] w-full object-cover"
              />
            </div>


            <!-- Gallery — extra photos from this event, click to enlarge -->
            <div
              v-if="galleryImages.length"
              class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4"
            >
              <button
                v-for="(url, index) in galleryImages"
                :key="url + index"
                type="button"
                class="group aspect-square overflow-hidden rounded-xl bg-cream"
                @click="openLightbox(index)"
              >
                <img
                  :src="url"
                  :alt="`${title} - ${index + 1}`"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </button>
            </div>


            <!-- Article Text -->
            <div class="pt-6">

              <!-- Description -->
              <div
                v-if="descriptionParagraphs.length"
                class="max-w-4xl space-y-3 text-base leading-8 text-gray-600"
              >
                <p
                  v-for="paragraph in descriptionParagraphs"
                  :key="paragraph"
                >
                  {{ paragraph }}
                </p>
              </div>

              <p
                v-else
                class="text-gray-500"
              >
                {{ t('common.empty') }}
              </p>


              <!-- Facebook / Primary Button -->
     <!-- Facebook Share Button -->
              <div
                v-if="slide"
                class="mt-7 flex justify-end"
              >
                <button
                  type="button"
                  @click="shareToFacebook"
                  class="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
                >
                  <ExternalLink class="h-4 w-4" />
                  ចែករំលែកទៅ Facebook
                </button>
              </div>

            </div>
          </article>


          <!-- ==================================
               RIGHT : RELATED ARTICLES
          =================================== -->
          <aside class="lg:sticky lg:top-8 lg:self-start">

            <div
              class="border-b border-black/10 pb-4"
            >
              <h2
                class="font-display text-xl text-forest"
              >
                អត្ថបទផ្សេងទៀត
              </h2>
            </div>


            <!-- Related Loading -->
            <div
              v-if="slidesLoading"
              class="mt-5 space-y-5"
            >
              <div
                v-for="i in 4"
                :key="i"
                class="flex gap-4 animate-pulse"
              >
                <div class="h-24 w-32 rounded-xl bg-gray-200"></div>

                <div class="flex-1">
                  <div class="h-3 w-16 rounded bg-gray-200"></div>
                  <div class="mt-3 h-12 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>


            <!-- Related Articles -->
            <div
              v-else
              class="mt-5 max-h-[calc(100vh-160px)] divide-y divide-black/10 overflow-y-auto pr-1"
            >

              <RouterLink
                v-for="item in relatedSlides"
                :key="item.id"
                :to="publicPath('slides', item.id)"
                class="group flex gap-4 py-5 first:pt-0"
              >

                <!-- Small Image -->
                <div
                  class="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-cream"
                >
                  <img
                    :src="
                      item.image_url ||
                      'https://placehold.co/400x250/1A3626/F7F6F1?text=Wat+Tepborey'
                    "
                    :alt="
                      localizedField(
                        item,
                        'title',
                        'title_en'
                      )
                    "
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>


                <!-- Text -->
                <div class="min-w-0">

                  <!-- Badge -->
                  <p
                    v-if="
                      localizedField(
                        item,
                        'badge',
                        'badge_en'
                      )
                    "
                    class="font-khmer text-xs font-semibold text-gold-dark"
                  >
                    {{
                      localizedField(
                        item,
                        'badge',
                        'badge_en'
                      )
                    }}
                  </p>


                  <!-- Title -->
                  <h3
                    class="mt-1 font-display text-base leading-7 text-forest transition group-hover:text-gold-dark"
                  >
                    {{
                      localizedField(
                        item,
                        'title',
                        'title_en'
                      )
                    }}
                  </h3>

                </div>

              </RouterLink>


              <!-- Empty -->
              <div
                v-if="!relatedSlides.length"
                class="py-8 text-sm text-gray-500"
              >
                {{ t('common.empty') }}
              </div>

            </div>

          </aside>

        </div>

      </div>
    </section>


    <!-- =========================
         LIGHTBOX — full-size gallery viewer
    ========================== -->
    <Teleport to="body">
      <div
        v-if="lightboxIndex !== null"
        class="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
        @click.self="closeLightbox"
      >

        <button
          type="button"
          class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="បិទ"
          @click="closeLightbox"
        >
          <X class="h-5 w-5" />
        </button>

        <button
          v-if="galleryImages.length > 1"
          type="button"
          class="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          aria-label="រូបភាពមុន"
          @click.stop="lightboxPrev"
        >
          <ChevronLeft class="h-6 w-6" />
        </button>

        <img
          :src="galleryImages[lightboxIndex]"
          :alt="`${title} - ${lightboxIndex + 1}`"
          class="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          @click.stop
        />

        <button
          v-if="galleryImages.length > 1"
          type="button"
          class="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          aria-label="រូបភាពបន្ទាប់"
          @click.stop="lightboxNext"
        >
          <ChevronRight class="h-6 w-6" />
        </button>

        <p class="absolute bottom-5 text-sm text-white/70">
          {{ lightboxIndex + 1 }} / {{ galleryImages.length }}
        </p>

      </div>
    </Teleport>

  </div>
</template>