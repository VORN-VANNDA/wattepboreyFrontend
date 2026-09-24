<script setup>
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'

const route = useRoute()

const {
  data: donor,
  loading,
  error,
  load,
} = useApiResource(() => api.get(`/donors/${route.params.id}`), { initial: null })
</script>

<template>
  <div>
    <section class="bg-forest-dark py-10 text-white">
      <div class="mx-auto max-w-4xl px-5 lg:px-10">
        <RouterLink to="/dhamma" class="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
          <ArrowLeft class="h-4 w-4" />
          សប្បុរសជន
        </RouterLink>
      </div>
    </section>

    <section class="mx-auto max-w-4xl px-5 py-16 lg:px-10">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center gap-4">
        <div class="h-40 w-40 animate-pulse rounded-full bg-cream" />
        <div class="h-5 w-48 animate-pulse rounded bg-cream" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="card p-8 text-center text-red-500">
        {{ error }}
        <button type="button" class="ml-2 font-semibold underline hover:no-underline" @click="load()">
          ព្យាយាមម្តងទៀត
        </button>
      </div>

      <!-- Donor -->
      <div v-else-if="donor" class="fade-in flex flex-col items-center text-center">
        <img
          :src="donor.image_url || 'https://placehold.co/400x400/2C5038/F7F6F1?text=%F0%9F%99%8F'"
          :alt="donor.name"
          class="h-40 w-40 rounded-full border-4 object-cover"
          style="border-color: #d8c58a"
        />
        <h1 class="mt-6 font-display text-2xl text-forest sm:text-3xl">{{ donor.name }}</h1>
        <span class="mt-2 inline-block rounded-full bg-gold/15 px-4 py-1.5 text-sm font-semibold text-gold-dark">
          {{ donor.role }}
        </span>

        <p
          v-if="donor.description"
          class="mx-auto mt-8 max-w-2xl whitespace-pre-line text-left text-sm leading-relaxed text-gray-600 sm:text-base"
        >
          {{ donor.description }}
        </p>
        <p v-else class="mt-8 text-sm text-gray-400">មិនទាន់មានការពិពណ៌នាបន្ថែមទេ។</p>
      </div>
    </section>
  </div>
</template>
