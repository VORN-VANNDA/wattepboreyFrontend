<script setup>
import { RouterLink } from 'vue-router'
import { BookOpen } from 'lucide-vue-next'
import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'

const { data: donors, loading, error, load } = useApiResource(() => api.get('/donors'))
</script>

<template>
  <div>
    <!-- =========================================
         HERO SECTION
    ========================================== -->
    <section class="bg-forest-dark py-20 text-center text-white">
      <h1 class="font-display text-3xl sm:text-4xl">
        សប្បុរសជន
      </h1>

      <p class="mx-auto mt-4 max-w-xl px-5 text-sm text-white/70 sm:text-base">
        ដោយក្តីដឹងគុណដល់លោកអ្នកសប្បុរសជនទាំងឡាយ ដែលបានឧបត្ថម្ភគាំទ្រដល់វត្តទេពបុរីជានិច្ច។
      </p>

      <RouterLink
        to="/donation-records"
        class="btn-gold mt-8 inline-flex !bg-transparent !text-white ring-1 ring-white/40 hover:!bg-white/10"
      >
        <BookOpen class="h-4 w-4" />
        មើលប្រវត្តិសប្បុរសជនពេញលេញ
      </RouterLink>
    </section>

    <!-- =========================================
         DONOR CARDS
    ========================================== -->
    <section class="mx-auto max-w-7xl px-5 py-16 lg:px-10">

      <!-- Loading Skeleton -->
      <div
        v-if="loading"
        class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <div class="aspect-[5/3] w-full animate-pulse bg-gray-200"></div>
          <div class="flex flex-col items-center p-6 text-center">
            <div class="h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
            <div class="mt-3 h-7 w-1/2 animate-pulse rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <p
        v-else-if="error"
        class="text-center text-sm text-red-500"
      >
        {{ error }}
        <button
          type="button"
          class="ml-2 font-semibold underline hover:no-underline"
          @click="load()"
        >
          ព្យាយាមម្តងទៀត
        </button>
      </p>

      <!-- Empty -->
      <p
        v-else-if="!donors.length"
        class="text-center text-sm text-gray-500"
      >
        មិនទាន់មានទិន្នន័យសប្បុរសជននៅឡើយទេ។
      </p>

      <!-- Donor Grid -->
      <div
        v-else
        class="fade-in grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        <RouterLink
          v-for="donor in donors"
          :key="donor.id"
          :to="`/donors/${donor.id}`"
          class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- DONOR IMAGE -->
          <div class="w-full overflow-hidden">
            <img
              :src="
                donor.image_url ||
                'https://placehold.co/900x540/2C5038/F7F6F1?text=%F0%9F%99%8F'
              "
              :alt="donor.name"
              class="aspect-[5/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              style="border-bottom: 4px solid #d8c58a"
            />
          </div>

          <!-- DONOR INFO -->
          <div
            class="flex min-h-[150px] flex-col items-center justify-center bg-white px-6 py-7 text-center"
          >
            <p class="font-khmer text-lg font-bold leading-relaxed text-forest sm:text-xl">
              {{ donor.name }}
            </p>
            <span class="mt-4 inline-block rounded-full bg-gold/15 px-5 py-2 text-sm font-semibold text-gold-dark">
              {{ donor.role }}
            </span>
          </div>
        </RouterLink>
      </div>

    </section>
  </div>
</template>
