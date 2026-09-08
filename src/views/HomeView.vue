<script setup>

import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

import { RouterLink, useRouter } from 'vue-router'

import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Landmark,
  QrCode
} from 'lucide-vue-next'

import { useApiResource } from '../composables/useApiResource'

import api from '../lib/api'

import SectionHeading from '../components/SectionHeading.vue'


// ============================================================
// Router
// ============================================================

const router = useRouter()


// ============================================================
// Members
// ============================================================

const {
  data: members,
  loading: membersLoading,
  error: membersError,
  load: loadMembers
} = useApiResource(() => api.get('/members'))


const abbot = computed(() => {

  return (
    members.value.find((m) => m.is_featured) ||
    members.value.find((m) => m.category === 'monk')
  )

})


const teamPreview = computed(() => {

  return members.value
    .filter((m) => m.id !== abbot.value?.id)
    .slice(0, 4)

})


// ============================================================
// Site Settings
// ============================================================

const {
  data: settings
} = useApiResource(
  () => api.get('/settings'),
  {
    initial: {}
  }
)


const heroBannerUrl = computed(() => {

  return (
    settings.value?.hero_banner_url ||
    'https://placehold.co/1600x900/13291D/F7F6F1?text=Wat+Tepborey'
  )

})


// ============================================================
// Home Slides
// ============================================================

const {
  data: slides,
  loading: slidesLoading,
  error: slidesError,
  load: loadSlides
} = useApiResource(
  () => api.get('/slides?active=1')
)


const MAX_HOME_SLIDES = 3
const AUTOPLAY_INTERVAL = 5000 // 5 វិនាទី


// យក slide ថ្មីៗបំផុត ៣ ដើម្បីបង្ហាញនៅទំព័រដើម
const displaySlides = computed(() => {

  return [...slides.value]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0)
      const dateB = new Date(b.created_at || b.updated_at || 0)
      return dateB - dateA
    })
    .slice(0, MAX_HOME_SLIDES)

})


const activeSlideIndex = ref(0)

// Tracks which way the carousel is moving so the transition can slide
// content in from the matching direction ('next' = right-to-left, 'prev' = left-to-right).
const slideDirection = ref('next')


const activeSlide = computed(() => {

  return displaySlides.value[activeSlideIndex.value] || null

})


function previousSlide() {

  if (!displaySlides.value.length) return

  slideDirection.value = 'prev'

  activeSlideIndex.value =
    (activeSlideIndex.value - 1 + displaySlides.value.length) %
    displaySlides.value.length

  restartAutoplay()

}


function nextSlide() {

  if (!displaySlides.value.length) return

  slideDirection.value = 'next'

  activeSlideIndex.value =
    (activeSlideIndex.value + 1) %
    displaySlides.value.length

}


function setActiveSlide(index) {

  slideDirection.value = index >= activeSlideIndex.value ? 'next' : 'prev'

  activeSlideIndex.value = index

  restartAutoplay()

}


// ============================================================
// Slide Autoplay
// ============================================================

let autoplayTimer = null


function startAutoplay() {

  stopAutoplay()

  if (displaySlides.value.length > 1) {
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL)
  }

}


function stopAutoplay() {

  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }

}


function restartAutoplay() {

  startAutoplay()

}


// ពេល slide ថ្មីមកដល់ (admin upload) → reset ទៅ index 0 និង restart autoplay
watch(displaySlides, () => {

  activeSlideIndex.value = 0

  restartAutoplay()

})


onMounted(startAutoplay)

onUnmounted(stopAutoplay)


// ============================================================
// Slide Navigation
// ============================================================

const activeSlideDestination = computed(() => {

  return activeSlide.value?.id
    ? `/slides/${activeSlide.value.id}`
    : null

})


function handleSlideCardClick() {

  const dest = activeSlideDestination.value

  if (!dest) return

  router.push(dest)

}


// ============================================================
// Abbot
// ============================================================

const abbotName = computed(() => {

  return abbot.value?.name || ''

})


const abbotBio = computed(() => {

  return abbot.value?.bio || 'មិនទាន់មានព័ត៌មានអំពីព្រះសង្ឃ'

})


// ============================================================
// Temple History Photos
// ============================================================

const {
  data: historyPhotos,
  loading: historyPhotosLoading
} = useApiResource(() =>
  api.get('/gallery?category=architecture')
)


const historyImages = computed(() => {

  return historyPhotos.value
    .filter((photo) => photo.image_url)
    .slice(0, 1)

})


const templeHistoryPreview =
  'វត្តទេពបុរី ស្ថិតនៅភូមិខ្នារ-ត្បែង ឃុំក្រាំងធ្នង់ ស្រុកបាទី ខេត្តតាកែវ។ វត្តនេះត្រូវបានកសាងឡើងនៅឆ្នាំ ១៩៥៥-១៩៥៦ ដោយព្រះគ្រូឃោសាវិសុទ្ធ ឡុង ឪ និងពុទ្ធបរិស័ទចំណុះជើងវត្ត។ ក្រោយឆ្នាំ ១៩៧៩ វត្តបានចាប់ផ្តើមកសាងឡើងវិញ ហើយបន្តអភិវឌ្ឍសមិទ្ធផលនានារហូតមកដល់បច្ចុប្បន្ន។'


const templeHistoryFacts = [
  {
    label: 'ទីតាំង',
    value: 'ស្រុកបាទី ខេត្តតាកែវ'
  },
  {
    label: 'ឆ្នាំកសាង',
    value: '១៩៥៥-១៩៥៦'
  },
  {
    label: 'កសាងឡើងវិញ',
    value: 'ក្រោយឆ្នាំ ១៩៧៩'
  }
]


// ============================================================
// Static Donation Projects
// ============================================================

const projects = [

  {
    title: 'ប្រាសាភទ្ទកប្ប',

    desc:
      'ប្រាសាភទ្ទកប្ប គឺជាកន្លែងសម្រាប់តម្កល់ព្រះពុទ្ធរូប និងសម្រាប់គោរមបូជាព្រះពុទ្ធរូប។',

    image:
      '../../public/brasat.jpg',

    badge: 'សាងសង់រួច',

    goals: [
      'កន្លែងតម្កល់ព្រះពុទ្ធរូប',
      'មានបួនទិស',
      'សម្រាប់គោរមបូជា'
    ]
  },


  {
    title: 'ទិដ្ឋភាពទូទៅវត្តទេពបុរី',

    desc:
      'ទីសការបូជាដ៏រមណីយដ្ឋាន គ្របដណ្ដប់ដោយធម្មជាតិបៃតងស្រស់ បង្ហាញពីភាពស្ងប់ស្ងាត់ និងសទ្ធាជ្រះថ្លារបស់ពុទ្ធសាសនិកជន។',

    image:
      '/thewat.jpg',

    badge: '',

    goals: [
      'ទេសភាពបៃតងស្រស់បំព្រង',
      'សំណង់ព្រះវិហារ និងកុដិសង្ឃ',
      'ទីតាំងស្ថិតក្នុងភាពស្ងប់ស្ងាត់ និងសុខសាន្ត'
    ]
  }

]

</script>


<template>

  <div>


    <!-- ============================================================
         HERO
    ============================================================ -->

    <section class="relative flex h-[560px] items-center justify-center overflow-hidden">

      <img :src="heroBannerUrl" alt="" class="absolute inset-0 h-full w-full object-cover" />


      <div class="absolute inset-0 bg-gradient-to-b from-forest-dark/70 via-forest-dark/60 to-forest-dark/90"></div>


      <div class="relative z-10 mx-auto max-w-3xl px-6 text-center">

        <h1 class="font-display text-4xl leading-[1.65] text-white sm:text-6xl">
          វត្តទេពបុរី
        </h1>


        <p class="mt-5 font-khmer text-base text-white/80 sm:text-lg">
          កន្លែងសម្រាប់សិក្សាព្រះធម៌ និងការរួមចំណែកក្នុងសហគមន៍
        </p>


        <RouterLink to="/about" class="btn-gold mt-8">

          ស្វែងយល់បន្ថែម

          <ArrowRight class="h-4 w-4" />

        </RouterLink>

      </div>

    </section>



    <!-- ============================================================
         FEATURED CARD SLIDER
    ============================================================ -->

    <section class="bg-white px-5 py-16 lg:px-10">

      <div class="mx-auto max-w-6xl">


        <!-- Loading -->

        <div v-if="slidesLoading" class="h-[420px] animate-pulse rounded-xl2 bg-cream"></div>


        <!-- Slide -->

        <article v-else-if="activeSlide"
          class="fade-in group relative overflow-hidden rounded-xl2 border border-black/5 bg-white shadow-card transition hover:shadow-lg md:h-[420px]"
          @mouseenter="stopAutoplay" @mouseleave="startAutoplay">

          <!-- Sliding content — fixed card size never changes between slides;
               only this inner block swaps, with a smooth slide/fade transition. -->

          <Transition :name="slideDirection === 'next' ? 'slide-next' : 'slide-prev'" mode="out-in">

            <div :key="activeSlide.id" class="grid h-full md:grid-cols-[1.08fr_0.92fr]" :class="activeSlideDestination
                ? 'cursor-pointer'
                : ''
              " @click="handleSlideCardClick">


              <!-- Image -->

 <div class="relative h-72 overflow-hidden bg-cream md:h-full">

  <img :src="activeSlide.image_url 
        ? (activeSlide.image_url.startsWith('http') 
            ? activeSlide.image_url 
            : `https://tebpoery-backend.onrender.com${activeSlide.image_url.startsWith('/') ? '' : '/'}${activeSlide.image_url}`)
        : '/brasat.jpg'" 
     :alt="activeSlide.title"
     class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />

</div>

              <!-- Content -->

              <div class="flex flex-col justify-center overflow-hidden p-8 text-left sm:p-10 lg:p-12">


                <!-- Badge -->

                <p v-if="activeSlide.badge" class="font-khmer text-sm font-semibold leading-7 text-gold-dark">

                  {{ activeSlide.badge }}

                </p>


                <!-- Title (clamped so long titles never grow the card) -->

                <h2
                  class="mt-4 overflow-hidden pt-1 font-display text-2xl leading-[2] text-forest [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box] sm:text-xl sm:leading-[1.9]">

                  {{ activeSlide.title }}

                </h2>


                <!-- Subtitle (clamped — full text is on the "អានបន្ថែម" page) -->

                <p v-if="activeSlide.subtitle"
                  class="mt-4 max-w-xl overflow-hidden pt-1 text-sm leading-[1.9] text-gray-600 [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box] sm:text-base">

                  {{ activeSlide.subtitle }}

                </p>


                <!-- Buttons -->

                <div class="mt-7 flex flex-wrap gap-3">


                  <!-- Primary URL -->

                  <a v-if="activeSlide.primary_url" :href="activeSlide.primary_url" target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    @click.stop>

                    <ExternalLink class="h-4 w-4" />

                    {{ activeSlide.primary_label || 'Facebook' }}

                  </a>


                  <!-- Read More -->

                  <RouterLink v-if="activeSlide.id" :to="`/slides/${activeSlide.id}`"
                    class="inline-flex items-center justify-center rounded-full border border-forest px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white"
                    @click.stop>

                    {{ activeSlide.secondary_label || 'អានបន្ថែម' }}

                  </RouterLink>


                </div>

              </div>

            </div>

          </Transition>


          <!-- Previous -->

          <button v-if="displaySlides.length > 1" type="button"
            class="absolute left-4 top-36 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-forest shadow-card transition hover:bg-gold hover:text-forest-dark md:left-5 md:top-1/2"
            aria-label="Previous slide" @click.stop="previousSlide">

            <ChevronLeft class="h-5 w-5" />

          </button>


          <!-- Next -->

          <button v-if="displaySlides.length > 1" type="button"
            class="absolute right-4 top-36 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-forest shadow-card transition hover:bg-gold hover:text-forest-dark md:right-5 md:top-1/2"
            aria-label="Next slide" @click.stop="nextSlide">

            <ChevronRight class="h-5 w-5" />

          </button>


        </article>

        <!-- Error (fetch failed) -->

        <div v-else-if="slidesError"
          class="grid h-[280px] place-items-center rounded-xl2 border border-red-100 bg-red-50 px-6 text-center">
          <div>
            <p class="text-sm text-red-600">មិនអាចទាញយកទិន្នន័យស្លាយបានទេ សូមព្យាយាមម្តងទៀត។</p>
            <button type="button"
              class="mt-3 rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              @click="loadSlides()">
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        </div>


        <!-- Dots -->

        <div v-if="displaySlides.length > 1" class="mt-5 flex justify-center gap-2">

          <button v-for="(slide, index) in displaySlides" :key="slide.id" type="button"
            class="h-2.5 rounded-full transition-all" :class="index === activeSlideIndex
                ? 'w-8 bg-gold'
                : 'w-2.5 bg-forest/20 hover:bg-forest/40'
              " :aria-label="`ទៅ Slide ${index + 1}`" @click="setActiveSlide(index)"></button>

        </div>


      </div>

    </section>



    <!-- ============================================================
         ABOUT + HISTORY PHOTO
    ============================================================ -->

    <section class="mx-auto max-w-7xl px-5 py-20 lg:px-10">

      <SectionHeading title="ប្រវត្តិវត្តទេពបុរី" />


      <div class="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">


        <!-- About -->

        <article class="card flex min-h-[360px] flex-col overflow-hidden p-6 sm:p-7">

          <div
            class="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark">
            <Landmark class="h-4 w-4" />
            សង្ខេបប្រវត្តិ
          </div>


          <p class="text-sm leading-8 text-gray-600 sm:text-[20px] sm:leading-8">
            {{ templeHistoryPreview }}
          </p>


          <div class="mt-5 grid grid-cols-1   gap-3 sm:grid-cols-3">
            <div v-for="fact in templeHistoryFacts" :key="fact.label" class="rounded-lg bg-cream px-4 py-2.5 ">
              <p class="text-xl font-semibold text-gold-dark">
                {{ fact.label }}
              </p>
              <p class="mt-1 text-sl leading-7 text-forest">
                {{ fact.value }}
              </p>
            </div>
          </div>


          <RouterLink to="/about" class="btn-gold mt-6 w-fit !px-5 !py-2.5 text-sm">

            អានបន្ថែម

            <ArrowRight class="h-4 w-4" />

          </RouterLink>

        </article>


        <!-- History Photos -->

        <aside class="min-h-[360px]">

          <!-- Loading -->

          <div v-if="historyPhotosLoading" class="h-full min-h-[360px] animate-pulse rounded-xl2 bg-cream">

          </div>


          <!-- Images -->
          <div v-else-if="historyImages.length" class="fade-in h-full">
            <figure v-for="photo in historyImages" :key="photo.id"
              class="h-full min-h-[360px] overflow-hidden rounded-xl2 bg-white shadow-card ring-1 ring-black/5">
              <img :src="photo.image_url" :alt="photo.title"
                class="h-full min-h-[360px] w-full rounded-xl2 object-cover" />
            </figure>
          </div>

          <!-- Fallback (no photo yet, or failed to load) — decorative section, keep it quiet -->
          <div v-else class="grid h-full min-h-[360px] place-items-center rounded-xl2 bg-cream text-sm text-gray-400">
            វត្តទេពបុរី
          </div>

        </aside>

      </div>

    </section>



    <!-- ============================================================
         ABBOT SPOTLIGHT
    ============================================================ -->

    <section class="bg-cream py-20">

      <div class="mx-auto max-w-5xl px-5 lg:px-10">


        <SectionHeading title="ព្រះចៅអធិការ" />


        <!-- Loading -->

        <div v-if="membersLoading" class="mt-12 h-80 animate-pulse rounded-xl2 bg-white"></div>


        <!-- Abbot -->

        <div v-else-if="abbot"
          class="fade-in card mt-12 grid grid-cols-1 items-center gap-10 p-8 md:grid-cols-[1fr_280px] md:p-10 lg:p-12">


          <!-- Text -->

          <div class="order-2 text-center md:order-1 md:text-left">

            <span class="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark">
              ព្រះចៅអធិការ
            </span>


            <h3 class=" my-6 font-display text-lg leading-[1.75] text-forest sm:text-xl">
              {{ abbotName }}
            </h3>


            <p
              class="mt-5 overflow-hidden pt-1 text-xl leading-8 text-gray-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] ">
              {{ abbotBio }}
            </p>


            <RouterLink :to="`/members/${abbot.id}`" class="btn-gold mt-7 !px-6 !py-2.5 text-sm">

              អានបន្ថែម

              <ArrowRight class="h-4 w-4" />

            </RouterLink>

          </div>


          <!-- Image -->

          <div class="order-1 md:order-2">

            <img :src="abbot.image_url ||
              'https://placehold.co/420x520/1A3626/F7F6F1?text=Abbot'
              " :alt="abbotName"
              class="mx-auto aspect-[4/5] w-full max-w-[280px] rounded-xl2 border-4 border-white object-cover shadow-card ring-1 ring-gold/20" />

          </div>


        </div>

        <!-- Error (fetch failed) -->

        <div v-else-if="membersError"
          class="mt-12 grid h-40 place-items-center rounded-xl2 border border-red-100 bg-red-50 px-6 text-center">
          <div>
            <p class="text-sm text-red-600">មិនអាចទាញយកព័ត៌មានបានទេ សូមព្យាយាមម្តងទៀត។</p>
            <button type="button"
              class="mt-3 rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              @click="loadMembers()">
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        </div>

      </div>

    </section>



    <!-- ============================================================
         DONATION PROJECTS
    ============================================================ -->

    <section class="bg-cream py-20">

      <div class="mx-auto max-w-7xl px-5 lg:px-10">


        <SectionHeading title="សមទ្ធិផលរបស់វត្ត" subtitle="គម្រោងដែលបានអភិវឌ្ឍ និងត្រូវបានសម្រេចជាស្ថាពរ" />


        <div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">

          <article v-for="project in projects" :key="project.title" class="card overflow-hidden">


            <!-- Image -->

            <div class="relative">

              <img :src="project.image" :alt="project.title" class="h-52 w-full object-cover" />


              <span
                class="absolute left-4 top-4 rounded-full bg-forest-dark/80 px-3 py-1 text-xs font-semibold text-white">
                {{ project.badge }}
              </span>

            </div>


            <!-- Content -->

            <div class="p-6 sm:p-8">

              <h3 class="font-display text-lg leading-[1.7] text-forest">
                {{ project.title }}
              </h3>


              <p class="mt-3 text-sm leading-relaxed text-gray-600">
                {{ project.desc }}
              </p>


              <ul class="mt-5 space-y-2">

                <li v-for="goal in project.goals" :key="goal" class="flex items-start gap-2 text-sm text-gray-600">

                  <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />

                  {{ goal }}

                </li>

              </ul>


              <RouterLink to="/contact" class="btn-gold mt-6 w-full !py-2.5 text-sm">
                ចូលរួមបរិច្ចាគ
              </RouterLink>

            </div>

          </article>

        </div>

      </div>

    </section>



    <!-- ============================================================
         DONATE / SUPPORT
    ============================================================ -->

    <section class="bg-forest-dark py-20 text-white">
      <div class="mx-auto max-w-4xl px-5 text-center lg:px-10">

        <h2 class="font-display text-2xl leading-[1.7] sm:text-3xl">
          ភ្ជាប់ទំនាក់ទំនងជាមួយយើងខ្ញុំ
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-sm text-white/60 sm:text-base">
          តាមដានសកម្មភាព ការអប់រំធម៌ និងព្រឹត្តិការណ៍ផ្សេងៗរបស់វត្តតាមរយៈបណ្តាញសង្គមហ្វេសប៊ុក។
        </p>

        <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">

          <div class="rounded-xl2 bg-white/5 p-6 text-left flex flex-col justify-between h-full">
            <div>
              <div class="mb-3 flex items-center gap-2">
                <svg class="h-6 w-6 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <h3 class="font-khmer font-semibold text-white">
                  ទំព័រហ្វេសប៊ុកផ្លូវការ
                </h3>
              </div>

              <p class="mt-4 font-display text-lg tracking-wide">
                វត្តទេពបុរី - Wat Tepborey
              </p>
              <p class="mt-2 text-xs text-white/60 leading-relaxed">
                ទទួលបានព័ត៌មានថ្មីៗ កម្មវិធីបុណ្យ និងស្តាប់ព្រះធម៌ទេសនាជារៀងរាល់ថ្ងៃ។
              </p>
            </div>

            <div class="mt-6">
              <a href="https://www.facebook.com/share/19RV7KW4zY/?mibextid=wwXIfr" target="_blank"
                rel="noopener noreferrer"
                class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1877F2]/90">
                ចូលទៅកាន់ Facebook Page
              </a>
            </div>
          </div>

          <div class="rounded-xl2 bg-white/5 p-6 text-left">
            <div class="mb-3 flex items-center gap-2 text-gold">
              <QrCode class="h-5 w-5" />
              <h3 class="font-khmer font-semibold text-white">
                ស្កេន QR Code ហ្វេសប៊ុក
              </h3>
            </div>

            <p class="mb-5 text-xs text-white/60">
              សូមស្កេនទីនេះដើម្បីចូលទៅកាន់ទំព័រហ្វេសប៊ុករបស់យើងខ្ញុំ។
            </p>

            <div class="grid h-32 w-32 overflow-hidden place-items-center rounded-lg bg-white p-1">
              <img src="../../public/QRCode_facebook_page.jpg" alt="Facebook QR Code"
                class="h-full w-full object-contain" />
            </div>
          </div>

        </div>
      </div>
    </section>


  </div>

</template>


<style scoped>
/* Smooth slide + fade when the featured card switches slides.
   Direction matches the arrow/dot the user triggered ('next' slides
   in from the right, 'prev' slides in from the left). */

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.4s ease, opacity 0.35s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>