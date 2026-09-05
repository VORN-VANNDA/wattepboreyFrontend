<script setup>
import { useLocale } from '../composables/useLocale'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-vue-next'

import { useApiResource } from '../composables/useApiResource'

import api from '../lib/api'

const route = useRoute()
const { t } = useLocale()

const {
  data: event,
  loading,
  error,
  load,
} = useApiResource(
  () => api.get(`/events/${route.params.id}`),
  { initial: null }
)

function dateParts(isoDate) {
  if (!isoDate) return null

  const d = new Date(isoDate)

  return {
    day: d.getDate(),
    month: d
      .toLocaleDateString('en-US', {
        month: 'short',
      })
      .toUpperCase(),
    year: d.getFullYear(),
  }
}

function formatTimeRange(start, end) {
  if (!start) return ''

  const fmt = (time) => {
    const [h, m] = time.split(':')
    const hour = Number(h)

    const period = hour >= 12 ? 'PM' : 'AM'

    const displayHour =
      hour % 12 === 0 ? 12 : hour % 12

    return `${displayHour}:${m} ${period}`
  }

  return end
    ? `${fmt(start)} - ${fmt(end)}`
    : fmt(start)
}

const date = computed(() =>
  dateParts(event.value?.event_date)
)
</script>


<template>
  <div class="min-h-screen bg-white">

    <!-- =================================
         TOP DARK HERO
    ================================== -->
    <section
      class="bg-forest-dark px-5 py-10 text-white sm:py-14"
    >
      <div class="mx-auto max-w-6xl">

        <RouterLink
          to="/events"
          class="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft class="h-4 w-4" />
          ត្រឡប់ទៅកាន់ព្រឹត្តិការណ៍
        </RouterLink>

      </div>
    </section>


    <!-- =================================
         LOADING
    ================================== -->
    <section
      v-if="loading"
      class="mx-auto max-w-6xl px-5 py-12"
    >
      <div class="animate-pulse">

        <div
          class="h-[400px] rounded-2xl bg-gray-200"
        ></div>

        <div
          class="mt-8 h-8 w-2/3 rounded bg-gray-200"
        ></div>

        <div
          class="mt-5 h-24 rounded bg-gray-200"
        ></div>

      </div>
    </section>


    <!-- =================================
         ERROR
    ================================== -->
    <section
      v-else-if="error"
      class="mx-auto max-w-6xl px-5 py-16"
    >
      <div
        class="rounded-2xl bg-red-50 p-8 text-center text-red-500"
      >
        {{ error }}
        <button type="button" class="ml-2 font-semibold underline hover:no-underline" @click="load()">ព្យាយាមម្តងទៀត</button>
      </div>
    </section>


    <!-- =================================
         DETAIL
    ================================== -->
    <section
      v-else-if="event"
      class="fade-in mx-auto max-w-6xl px-5 py-12 sm:py-16"
    >

      <!-- IMAGE -->
      <div
        class="relative overflow-hidden rounded-3xl"
      >

        <img
          :src="
            event.image_url ||
            'https://placehold.co/1400x700/1A3626/F7F6F1?text=Event'
          "
          :alt="event.title"
          class="aspect-[16/8] w-full object-cover"
        />


        <!-- DATE BOX -->
        <div
          v-if="date"
          class="absolute bottom-5 left-5 rounded-2xl bg-white px-5 py-4 text-center shadow-xl sm:bottom-7 sm:left-7"
        >
          <p
            class="font-display text-3xl leading-none text-forest"
          >
            {{ date.day }}
          </p>

          <p
            class="mt-1 text-xs font-bold tracking-wider text-gold-dark"
          >
            {{ date.month }} {{ date.year }}
          </p>
        </div>

      </div>


      <!-- =================================
           EVENT INFORMATION
      ================================== -->
      <div
        class="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]"
      >

        <!-- LEFT -->
        <main>

          <div
            v-if="event.status === 'weekly'"
            class="mb-3 inline-flex rounded-full bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold-dark"
          >
            ព្រឹត្តិការណ៍ប្រចាំសប្តាហ៍
          </div>


          <h1
            class="font-khmer text-3xl font-semibold leading-[1.6] text-forest sm:text-4xl"
          >
            {{ event.title }}
          </h1>


          <!-- DESCRIPTION -->
          <div
            class="mt-7 border-t border-black/10 pt-7"
          >

            <h2
              class="font-display text-xl text-forest"
            >
              អំពីព្រឹត្តិការណ៍
            </h2>

            <div
              class="mt-5 whitespace-pre-line font-khmer text-base leading-8 text-gray-600"
            >
              {{ event.description }}
            </div>

          </div>

        </main>


        <!-- RIGHT INFO CARD -->
        <aside>

          <div
            class="rounded-2xl bg-cream p-6"
          >

            <h2
              class="font-display text-lg text-forest"
            >
              ព័ត៌មានព្រឹត្តិការណ៍
            </h2>


            <!-- DATE -->
            <div
              v-if="event.event_date"
              class="mt-6 flex gap-3"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
              >
                <Calendar
                  class="h-4 w-4 text-gold-dark"
                />
              </div>

              <div>
                <p class="text-xs text-gray-500">
                  កាលបរិច្ឆេទ
                </p>

                <p
                  class="mt-1 text-sm font-medium text-forest"
                >
                  {{ event.event_date }}
                </p>
              </div>
            </div>


            <!-- TIME -->
            <div
              v-if="event.start_time"
              class="mt-5 flex gap-3"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
              >
                <Clock
                  class="h-4 w-4 text-gold-dark"
                />
              </div>

              <div>
                <p class="text-xs text-gray-500">
                  ម៉ោង
                </p>

                <p
                  class="mt-1 text-sm font-medium text-forest"
                >
                  {{
                    formatTimeRange(
                      event.start_time,
                      event.end_time
                    )
                  }}
                </p>
              </div>
            </div>


            <!-- LOCATION -->
            <div
              v-if="event.location"
              class="mt-5 flex gap-3"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
              >
                <MapPin
                  class="h-4 w-4 text-gold-dark"
                />
              </div>

              <div>
                <p class="text-xs text-gray-500">
                  ទីតាំង
                </p>

                <p
                  class="mt-1 text-sm font-medium text-forest"
                >
                  {{ event.location }}
                </p>
              </div>
            </div>

          </div>

        </aside>

      </div>

    </section>

  </div>
</template>