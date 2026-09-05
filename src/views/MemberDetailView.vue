<script setup>
import { useLocale } from '../composables/useLocale'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, HeartHandshake, FileText } from 'lucide-vue-next'

import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'

const route = useRoute()
const { locale, t } = useLocale()

const {
  data: member,
  loading,
  error,
  load,
} = useApiResource(() => api.get(`/members/${route.params.id}`), { initial: null })

const displayName = computed(() =>
  locale.value === 'en' && member.value?.name_en ? member.value.name_en : member.value?.name
)

const biography = computed(() => {
  if (!member.value) return ''
  if (locale.value === 'en' && member.value.bio_en) return member.value.bio_en
  return member.value.bio || t('home.abbotBio')
})

const biographyParagraphs = computed(() =>
  biography.value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
)
</script>

<template>
  <div>
    <section class="bg-forest-dark py-14 text-white">
      <div class="mx-auto max-w-5xl px-5 lg:px-10">
        <RouterLink
          to="/about"
          class="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-gold"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('nav.about') }}
        </RouterLink>

        <div class="mt-8 text-center">
          <h1 class="mx-auto max-w-2xl font-display text-2xl leading-[1.7] sm:text-3xl">
            {{ loading ? t('common.loading') : t('home.abbotPretitle') }}
          </h1>
        </div>
      </div>
    </section>

<section class="bg-cream py-20">
  <div class="mx-auto max-w-6xl px-5 lg:px-10">

    <template v-if="member">

      <div class="grid grid-cols-1 gap-10 md:grid-cols-[1fr_380px]">

        <!-- LEFT: Biography scrolls -->
        <article class="fade-in">

          <div class="mb-8">
            <span
              class="inline-flex items-center gap-2 rounded-full
                     bg-gold/15 px-3 py-1 text-sm font-semibold text-gold-dark"
            >
              <HeartHandshake class="h-4 w-4" />
              {{ member.role }}
            </span>

            <h2
              class="mt-5 font-khmer text-3xl font-bold
                     leading-[2.2] text-forest sm:text-4xl"
            >
              {{ displayName }}
            </h2>
          </div>

          <!-- Biography -->
          <div
            class="font-khmer text-lg leading-[2.2] text-gray-700
                   sm:text-xl sm:leading-[2.3]"
          >
            <p
              v-for="(paragraph, index) in biographyParagraphs"
              :key="index"
              class="mb-7"
            >
              {{ paragraph }}
            </p>
          </div>

          <!-- PDF -->
          <a
            v-if="member.bio_pdf_url"
            :href="member.bio_pdf_url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-outline mt-8 inline-flex !py-2.5 text-sm"
          >
            <FileText class="h-4 w-4" />
            ទាញយកប្រវត្តិរូបជា PDF
          </a>

        </article>


        <!-- RIGHT: Image stays while scrolling -->
        <aside class="md:sticky md:top-24 md:self-start">

          <div class="card overflow-hidden bg-white p-5">
            <img
              :src="
                member.image_url ||
                'https://placehold.co/420x520/1A3626/F7F6F1?text=Abbot'
              "
              :alt="displayName"
              class="w-full rounded-xl object-cover
                     shadow-card ring-1 ring-gold/20"
            />
          </div>

        </aside>

      </div>

    </template>

  </div>
</section>
  </div>
</template>