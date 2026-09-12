<script setup>
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
      <h1 class="font-display text-3xl sm:text-4xl">សប្បុរសជន</h1>
      <p class="mx-auto mt-4 max-w-xl px-5 text-sm text-white/70 sm:text-base">
        ដោយក្តីដឹងគុណដល់លោកអ្នកសប្បុរសជនទាំងឡាយ ដែលបានឧបត្ថម្ភគាំទ្រដល់វត្តទេពបុរីជានិច្ច។
      </p>
    </section>

    <!-- =========================================
         DONOR CARDS
    ========================================== -->
    <section class="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="n in 8" :key="n" class="flex flex-col items-center gap-3">
          <div class="h-28 w-28 animate-pulse rounded-full bg-cream sm:h-32 sm:w-32" />
          <div class="h-3 w-20 animate-pulse rounded bg-cream" />
        </div>
      </div>

      <!-- Error -->
      <p v-else-if="error" class="text-center text-sm text-red-500">
        {{ error }}
        <button type="button" class="ml-2 font-semibold underline hover:no-underline" @click="load()">
          ព្យាយាមម្តងទៀត
        </button>
      </p>

      <!-- Empty -->
      <p v-else-if="!donors.length" class="text-center text-sm text-gray-500">
        មិនទាន់មានទិន្នន័យសប្បុរសជននៅឡើយទេ។
      </p>

      <!-- Donor Grid -->
      <div v-else class="fade-in grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="donor in donors" :key="donor.id" class="flex flex-col items-center text-center">
          <img
            :src="donor.image_url || 'https://placehold.co/300x300/2C5038/F7F6F1?text=%F0%9F%99%8F'"
            :alt="donor.name"
            class="h-28 w-28 rounded-full border-4 object-cover sm:h-32 sm:w-32"
            style="border-color: #d8c58a"
          />
          <p class="mt-4 font-khmer text-sm font-bold text-forest sm:text-base">{{ donor.name }}</p>
          <span
            class="mt-1.5 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark"
          >
            {{ donor.role }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
