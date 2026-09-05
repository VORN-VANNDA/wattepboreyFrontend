<script setup>
import { useLocale } from '../composables/useLocale'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-vue-next'


import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'

const { t } = useLocale()

const {
  data: events,
  loading,
  error,
  load,
} = useApiResource(() => api.get('/events'))

const activeEvents = computed(() =>
  events.value.filter((e) => e.status !== 'past')
)

const pastEvents = computed(() =>
  events.value.filter((e) => e.status === 'past')
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
</script>

<template>
  <div>

    <!-- =========================================
         PAGE HEADER
    ========================================== -->
    <section
      class="bg-forest-dark py-20 text-center text-white"
    >
      <h1
        class="font-display text-3xl sm:text-4xl"
      >
        {{ t('events.title') }}
      </h1>

      <p
        class="mx-auto mt-4 max-w-xl px-5 text-sm text-white/70 sm:text-base"
      >
        {{ t('events.subtitle') }}
      </p>
    </section>


    <!-- =========================================
         UPCOMING EVENTS
    ========================================== -->
    <section
      class="mx-auto max-w-5xl px-5 py-16 lg:px-10"
    >

      <h2
        class="font-display text-xl text-forest"
      >
        {{ t('events.upcomingHeading') }}
      </h2>


      <!-- LOADING -->
      <div
        v-if="loading"
        class="mt-6 space-y-6"
      >
        <div
          v-for="n in 2"
          :key="n"
          class="h-40 animate-pulse rounded-xl2 bg-cream"
        ></div>
      </div>


      <!-- ERROR -->
      <p
        v-else-if="error"
        class="mt-6 text-sm text-red-500"
      >
        {{ t('common.error') }}
        <button type="button" class="ml-2 font-semibold underline hover:no-underline" @click="load()">
          ព្យាយាមម្តងទៀត
        </button>
      </p>


      <!-- EMPTY -->
      <p
        v-else-if="!activeEvents.length"
        class="mt-6 text-sm text-gray-500"
      >
        {{ t('common.empty') }}
      </p>


      <!-- EVENT LIST -->
      <div
        v-else
        class="fade-in mt-6 space-y-6"
      >

        <!-- =====================================
             EVENT CARD
        ====================================== -->
        <RouterLink
          v-for="event in activeEvents"
          :key="event.id"
          :to="`/events/${event.id}`"
          class="group block"
        >

          <article
            class="card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:flex-row"
          >

            <!-- =================================
                 IMAGE
            ================================== -->
            <div
              class="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-64"
            >

              <img
                :src="
                  event.image_url ||
                  'https://placehold.co/500x400/1A3626/F7F6F1?text=Event'
                "
                :alt="event.title"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />


              <!-- ===============================
                   WEEKLY BADGE
              ================================ -->
              <div
                v-if="event.status === 'weekly'"
                class="absolute left-4 top-4 rounded-lg bg-white px-3 py-1.5 text-center shadow-sm"
              >
                <p
                  class="text-xs font-semibold text-forest"
                >
                  {{ t('events.weeklyBadge') }}
                </p>
              </div>


              <!-- ===============================
                   DATE BADGE
              ================================ -->
              <div
                v-else-if="dateParts(event.event_date)"
                class="absolute left-4 top-4 rounded-lg bg-white px-3 py-1.5 text-center shadow-sm"
              >

                <p
                  class="font-display text-lg leading-none text-forest"
                >
                  {{
                    dateParts(event.event_date).day
                  }}
                </p>

                <p
                  class="text-[11px] font-semibold uppercase text-gold-dark"
                >
                  {{
                    dateParts(event.event_date).month
                  }}
                </p>

              </div>

            </div>


            <!-- =================================
                 EVENT CONTENT
            ================================== -->
            <div
              class="flex flex-1 flex-col justify-center p-6 sm:p-7"
            >

              <!-- TITLE -->
              <h3
                class="font-khmer text-lg font-semibold text-forest transition-colors group-hover:text-gold-dark"
              >
                {{ event.title }}
              </h3>


              <!-- ===============================
                   EVENT INFORMATION
              ================================ -->
              <div
                class="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500"
              >

                <!-- Recurrence -->
                <span
                  v-if="event.recurrence"
                  class="flex items-center gap-1.5"
                >
                  <Calendar class="h-3.5 w-3.5" />

                  {{ event.recurrence }}
                </span>


                <!-- Date -->
                <span
                  v-else-if="event.event_date"
                  class="flex items-center gap-1.5"
                >
                  <Calendar class="h-3.5 w-3.5" />

                  {{ event.event_date }}
                </span>


                <!-- Time -->
                <span
                  v-if="event.start_time"
                  class="flex items-center gap-1.5"
                >
                  <Clock class="h-3.5 w-3.5" />

                  {{
                    formatTimeRange(
                      event.start_time,
                      event.end_time
                    )
                  }}
                </span>


                <!-- Location -->
                <span
                  v-if="event.location"
                  class="flex items-center gap-1.5"
                >
                  <MapPin class="h-3.5 w-3.5" />

                  {{ event.location }}
                </span>

              </div>


              <!-- DESCRIPTION -->
              <p
                class="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600"
              >
                {{ event.description }}
              </p>


              <!-- ===============================
                   READ MORE
              ================================ -->
              <div
                class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-dark"
              >

                <span>
                  អានបន្ថែម
                </span>

                <ArrowRight
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                />

              </div>

            </div>

          </article>

        </RouterLink>

      </div>

    </section>


    <!-- =========================================
         PAST EVENTS
    ========================================== -->
    <section
      class="mx-auto max-w-5xl px-5 pb-20 lg:px-10"
    >

      <h2
        class="font-display text-xl text-forest"
      >
        {{ t('events.pastHeading') }}
      </h2>


      <!-- NO PAST EVENTS -->
      <p
        v-if="!loading && !pastEvents.length"
        class="mt-6 text-sm text-gray-500"
      >
        {{ t('common.empty') }}
      </p>


      <!-- PAST EVENT LIST -->
      <div
        v-else
        class="mt-6 space-y-6"
      >

        <RouterLink
          v-for="event in pastEvents"
          :key="event.id"
          :to="`/events/${event.id}`"
          class="group block"
        >

          <article
            class="card flex items-center justify-between gap-5 p-6 opacity-70 transition-all duration-300 hover:opacity-100 hover:shadow-md"
          >

            <div>

              <h3
                class="font-khmer font-semibold text-forest transition-colors group-hover:text-gold-dark"
              >
                {{ event.title }}
              </h3>

              <p
                class="mt-1 text-xs text-gray-500"
              >
                {{ event.event_date }}
              </p>

            </div>


            <ArrowRight
              class="h-5 w-5 shrink-0 text-gold-dark transition-transform group-hover:translate-x-1"
            />

          </article>

        </RouterLink>

      </div>

    </section>

  </div>
</template>