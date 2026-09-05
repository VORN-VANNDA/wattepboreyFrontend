<script setup>
import { computed, ref, onMounted } from 'vue'
import { useLocale } from '../composables/useLocale'
import { Play, X } from 'lucide-vue-next'
import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'

const { locale, t } = useLocale()

const {
  data: videos,
  loading,
  error,
  load,
} = useApiResource(() => api.get('/videos'))

// ==============================
// Coming Soon Popup
// ==============================
const showComingSoon = ref(false)

onMounted(() => {
  showComingSoon.value = true
})

// ==============================
// Quote
// ==============================
const quote = computed(() =>
  locale.value === 'kh'
    ? 'សន្តិភាពកើតចេញពីខាងក្នុង កុំស្វែងរកវានៅខាងក្រៅ។'
    : 'Peace comes from within. Do not seek it without.'
)

const quoteAuthor = computed(() =>
  locale.value === 'kh'
    ? '- ព្រះសម្មាសម្ពុទ្ធ'
    : '— The Buddha'
)

// ==============================
// Close Popup
// ==============================
const closePopup = () => {
  showComingSoon.value = false
}
</script>

<template>
  <div>

    <!-- =========================================
         COMING SOON POPUP
    ========================================== -->
    <div
      v-if="showComingSoon"
      class="fixed inset-0 z-50 grid place-items-center bg-black/50 px-5 backdrop-blur-sm"
      @click.self="closePopup"
    >
      <div
        class="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >

        <!-- Close Button -->
        <button
          type="button"
          class="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          @click="closePopup"
        >
          <X class="h-5 w-5" />
        </button>

        <!-- Icon -->
        <div
          class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream text-gold-dark"
        >
          <Play class="h-7 w-7 fill-gold-dark" />
        </div>

        <!-- Title -->
        <h2 class="mt-5 font-display text-2xl text-forest">
          {{
            locale === 'kh'
              ? 'មិនទាន់មាន'
              : 'Coming Soon'
          }}
        </h2>

        <!-- Description -->
        <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
          {{
            locale === 'kh'
              ? 'មាតិកាវីដេអូព្រះធម៌នឹងមាននៅពេលខាងមុខ។ សូមអរគុណសម្រាប់ការយោគយល់ និងការរង់ចាំ។'
              : 'Dhamma video content will be available soon. Thank you for your understanding and patience.'
          }}
        </p>

        <!-- Button -->
        <button
          type="button"
          class="mt-6 rounded-full bg-forest px-7 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark"
          @click="closePopup"
        >
          {{
            locale === 'kh'
              ? 'យល់ព្រម'
              : 'Got it'
          }}
        </button>

      </div>
    </div>

    <!-- =========================================
         HERO SECTION
    ========================================== -->
    <section class="bg-forest-dark py-20 text-center text-white">
      <h1 class="font-display text-3xl sm:text-4xl">
        {{ t('dhamma.title') }}
      </h1>

      <p
        class="mx-auto mt-4 max-w-xl px-5 text-sm text-white/70 sm:text-base"
      >
        {{ t('dhamma.subtitle') }}
      </p>
    </section>

    <!-- =========================================
         MAIN CONTENT
    ========================================== -->
    <section
      class="mx-auto max-w-7xl px-5 py-16 lg:px-10"
    >

      <!-- Featured Quote -->
      <div class="card p-10 text-center sm:p-14">

        <p
          class="text-xs font-semibold uppercase tracking-widest text-gold-dark"
        >
          {{ t('dhamma.quoteLabel') }}
        </p>

        <p
          class="mx-auto mt-5 max-w-2xl font-display text-xl leading-relaxed text-forest sm:text-2xl"
        >
          "{{ quote }}"
        </p>

        <p class="mt-4 text-sm text-gray-500">
          {{ quoteAuthor }}
        </p>

      </div>

      <!-- =========================================
           VIDEO SECTION
      ========================================== -->
      <div class="mt-16">

        <!-- Heading -->
        <h2
          class="flex items-center gap-2 font-display text-xl text-forest"
        >
          <Play
            class="h-5 w-5 fill-gold text-gold"
          />

          {{ t('dhamma.videosHeading') }}
        </h2>

        <!-- =====================================
             Loading
        ====================================== -->
        <div
          v-if="loading"
          class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="n in 3"
            :key="n"
            class="h-64 animate-pulse rounded-xl2 bg-cream"
          ></div>
        </div>

        <!-- =====================================
             Error
        ====================================== -->
        <p
          v-else-if="error"
          class="mt-8 text-sm text-red-500"
        >
          {{ t('common.error') }}

          <button
            type="button"
            class="ml-2 font-semibold underline hover:no-underline"
            @click="load()"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </p>

        <!-- =====================================
             Empty
        ====================================== -->
        <p
          v-else-if="!videos.length"
          class="mt-8 text-sm text-gray-500"
        >
          {{ t('common.empty') }}
        </p>

        <!-- =====================================
             Video Grid
        ====================================== -->
        <div
          v-else
          class="fade-in mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >

          <a
            v-for="video in videos"
            :key="video.id"
            :href="video.youtube_url"
            target="_blank"
            rel="noopener noreferrer"
            class="card group overflow-hidden"
          >

            <!-- Thumbnail -->
            <div class="relative">

              <img
                :src="
                  video.thumbnail_url ||
                  'https://placehold.co/500x300/1A3626/F7F6F1?text=Dhamma+Video'
                "
                :alt="video.title"
                class="h-48 w-full object-cover"
              />

              <!-- Play Overlay -->
              <div
                class="absolute inset-0 grid place-items-center bg-black/20 transition-colors group-hover:bg-black/30"
              >
                <span
                  class="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-forest shadow-md"
                >
                  <Play
                    class="h-5 w-5 fill-forest"
                  />
                </span>
              </div>

              <!-- Duration -->
              <span
                v-if="video.duration"
                class="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white"
              >
                {{ video.duration }}
              </span>

            </div>

            <!-- Video Info -->
            <div class="p-5">

              <h3
                class="truncate font-khmer font-semibold text-forest"
              >
                {{ video.title }}
              </h3>

              <p class="mt-1 text-xs text-gray-500">
                {{ video.channel_name }}
              </p>

            </div>

          </a>

        </div>

        <!-- =====================================
             Watch More
        ====================================== -->
        <div class="mt-10 text-center">

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Play
              class="h-4 w-4 fill-white"
            />

            {{ t('dhamma.watchMore') }}
          </a>

        </div>

      </div>

    </section>

  </div>
</template>