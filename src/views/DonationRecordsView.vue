<script setup>
import { computed, ref } from 'vue'
import { Search, FileSpreadsheet, Printer, ChevronLeft, ChevronRight, BookOpen } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'

const KHR_PER_USD = 4100
const PAGE_SIZE = 9

const { data: featured, loading: featuredLoading } = useApiResource(() => api.get('/donation-records/featured'))
const { data: records, loading, error, load } = useApiResource(() => api.get('/donation-records'))

const searchTerm = ref('')
const activeCampaign = ref('all')
const currentPage = ref(1)

const campaigns = computed(() => {
  const set = new Set(records.value.map((r) => r.campaign))
  return Array.from(set)
})

const filteredRecords = computed(() => {
  let list = records.value
  if (activeCampaign.value !== 'all') {
    list = list.filter((r) => r.campaign === activeCampaign.value)
  }
  if (searchTerm.value.trim()) {
    const q = searchTerm.value.trim().toLowerCase()
    list = list.filter(
      (r) =>
        r.donor_name.toLowerCase().includes(q) ||
        (r.address && r.address.toLowerCase().includes(q))
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / PAGE_SIZE)))
const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredRecords.value.slice(start, start + PAGE_SIZE)
})

function goToPage(page) {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value)
}

function setCampaignFilter(campaign) {
  activeCampaign.value = campaign
  currentPage.value = 1
}

function formatAmount(record) {
  const n = Number(record.amount)
  return record.currency === 'USD' ? `$${n.toLocaleString()}` : `${n.toLocaleString()} ៛`
}

function convertedAmount(record) {
  const n = Number(record.amount)
  if (record.currency === 'USD') {
    return `≈ ${Math.round(n * KHR_PER_USD).toLocaleString()} ៛`
  }
  return `≈ $${(n / KHR_PER_USD).toFixed(2)}`
}

// Stable color per campaign name (same campaign always gets the same tag color)
const TAG_COLORS = [
  'bg-amber-50 text-amber-700',
  'bg-emerald-50 text-emerald-700',
  'bg-sky-50 text-sky-700',
  'bg-rose-50 text-rose-700',
  'bg-violet-50 text-violet-700',
  'bg-cyan-50 text-cyan-700',
]
function campaignColor(campaign) {
  let hash = 0
  for (let i = 0; i < campaign.length; i++) hash = (hash * 31 + campaign.charCodeAt(i)) >>> 0
  return TAG_COLORS[hash % TAG_COLORS.length]
}

function exportToExcel() {
  const rows = filteredRecords.value.map((r, i) => ({
    'ល.រ': i + 1,
    'ឈ្មោះសប្បុរសជន': r.donor_name,
    'អាសយដ្ឋាន': r.address || '',
    'កម្មវិធីបុណ្យ': r.campaign,
    'ចំនួនប្រាក់': r.amount,
    'រូបិយប័ណ្ណ': r.currency,
    'កាលបរិច្ឆេទ': r.donation_date,
  }))
  const sheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'សប្បុរសជន')
  XLSX.writeFile(workbook, 'wat-tepborey-donations.xlsx')
}

function handlePrint() {
  window.print()
}
</script>

<template>
  <div>
    <section class="bg-forest-dark py-16 text-center text-white">
      <h1 class="font-display text-3xl sm:text-4xl">ប្រវត្តិសប្បុរសជន និងកុសលសទ្ធា</h1>
      <p class="mx-auto mt-4 max-w-xl px-5 text-sm text-white/70 sm:text-base">
        កំណត់ត្រានៃការឧបត្ថម្ភ និងសទ្ធាកុសលដែលបានចូលរួមចំណែកអភិវឌ្ឍវត្តទេពបុរី។
      </p>
    </section>

    <!-- FEATURED CARDS -->
    <section class="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <div v-if="featuredLoading" class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div v-for="n in 3" :key="n" class="h-96 animate-pulse rounded-xl2 bg-cream" />
      </div>

      <div v-else-if="featured.length" class="fade-in grid grid-cols-1 gap-8 md:grid-cols-3">
        <article
          v-for="item in featured"
          :key="item.id"
          class="card overflow-hidden"
        >
          <div class="relative">
            <img
              :src="item.featured_image_url || 'https://placehold.co/500x350/2C5038/F7F6F1?text=Wat+Tepborey'"
              :alt="item.donor_name"
              class="h-56 w-full object-cover"
            />
            <span
              v-if="item.featured_badge"
              class="absolute right-3 top-3 rounded-full bg-forest-dark/85 px-3 py-1 text-xs font-semibold text-white"
            >
              {{ item.featured_badge }}
            </span>
          </div>
          <div class="p-6 text-center">
            <h3 class="font-khmer text-lg font-bold text-forest">{{ item.donor_name }}</h3>
            <p v-if="item.featured_description" class="mt-2 text-sm leading-relaxed text-gray-500">
              {{ item.featured_description }}
            </p>
            <span
              v-if="item.featured_tier_label"
              class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold text-gold-dark"
            >
              ✨ {{ item.featured_tier_label }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- LEDGER TABLE -->
    <section class="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
      <div class="card overflow-hidden">
        <div class="flex flex-col gap-4 border-b border-black/5 bg-cream/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="flex items-center gap-2 font-display text-lg text-forest">
            <BookOpen class="h-5 w-5 text-gold-dark" />
            តារាងបញ្ជីបុណ្យទាន និងកុសលសប្បុរសជន
          </h2>
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="ស្វែងរកឈ្មោះ ឬទីតាំង..."
                class="w-56 rounded-full border border-black/10 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-gold"
                @input="currentPage = 1"
              />
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-forest transition hover:border-gold"
              @click="exportToExcel"
            >
              <FileSpreadsheet class="h-4 w-4" />
              Excel
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-forest transition hover:border-gold"
              @click="handlePrint"
            >
              <Printer class="h-4 w-4" />
              បោះពុម្ព
            </button>
          </div>
        </div>

        <!-- Campaign filter tabs -->
        <div v-if="campaigns.length" class="flex flex-wrap gap-2 border-b border-black/5 p-5">
          <button
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeCampaign === 'all' ? 'bg-gold text-forest-dark' : 'bg-cream text-gray-500 hover:bg-gold/20'"
            @click="setCampaignFilter('all')"
          >
            ទាំងអស់
          </button>
          <button
            v-for="c in campaigns"
            :key="c"
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeCampaign === c ? 'bg-gold text-forest-dark' : 'bg-cream text-gray-500 hover:bg-gold/20'"
            @click="setCampaignFilter(c)"
          >
            {{ c }}
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="bg-cream/40 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-5 py-3">ល.រ</th>
                <th class="px-5 py-3">ឈ្មោះសប្បុរសជន</th>
                <th class="px-5 py-3">អាសយដ្ឋាន</th>
                <th class="px-5 py-3">កម្មវិធីបុណ្យ</th>
                <th class="px-5 py-3 text-right">ចំនួនប្រាក់</th>
                <th class="px-5 py-3">កាលបរិច្ឆេទ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-black/5">
              <tr v-if="loading">
                <td colspan="6" class="px-5 py-10 text-center text-gray-400">កំពុងផ្ទុក...</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="6" class="px-5 py-10 text-center text-red-500">
                  {{ error }}
                  <button type="button" class="ml-2 font-semibold underline hover:no-underline" @click="load()">
                    ព្យាយាមម្តងទៀត
                  </button>
                </td>
              </tr>
              <tr v-else-if="!filteredRecords.length">
                <td colspan="6" class="px-5 py-10 text-center text-gray-400">មិនទាន់មានទិន្នន័យ</td>
              </tr>
              <tr v-for="(record, index) in pagedRecords" v-else :key="record.id" class="hover:bg-cream/30">
                <td class="px-5 py-3 text-gray-400">{{ String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(3, '0') }}</td>
                <td class="px-5 py-3">
                  <p class="font-medium text-forest">{{ record.donor_name }}</p>
                  <p v-if="record.donor_subtitle" class="mt-0.5 text-xs text-gray-400">{{ record.donor_subtitle }}</p>
                </td>
                <td class="px-5 py-3 text-gray-500">{{ record.address || '—' }}</td>
                <td class="px-5 py-3">
                  <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="campaignColor(record.campaign)">
                    {{ record.campaign }}
                  </span>
                </td>
                <td class="px-5 py-3 text-right">
                  <p class="font-semibold text-forest">{{ formatAmount(record) }}</p>
                  <p class="text-xs text-gray-400">{{ convertedAmount(record) }}</p>
                </td>
                <td class="px-5 py-3 text-gray-500">{{ record.donation_date }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredRecords.length" class="flex items-center justify-between border-t border-black/5 p-5">
          <p class="text-xs text-gray-400">
            បង្ហាញ {{ pagedRecords.length }} ក្នុងចំណោម {{ filteredRecords.length }} កំណត់ត្រាសប្បុរសជន
          </p>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-cream disabled:opacity-30"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>
            <span class="grid h-8 w-8 place-items-center rounded-full bg-gold text-sm font-semibold text-forest-dark">
              {{ currentPage }}
            </span>
            <span class="text-xs text-gray-400">/ {{ totalPages }}</span>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-cream disabled:opacity-30"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
