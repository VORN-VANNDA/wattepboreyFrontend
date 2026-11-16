<script setup>
import { onMounted, reactive, ref } from 'vue'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import api from '../../lib/api'

const year = ref(new Date().getFullYear())
const holidays = ref([])
const editingId = ref(null)
const busy = ref(false)
const error = ref('')
const notice = ref('')
const form = reactive({ date: '', title: '', source: '' })

async function load() {
  try {
    const response = await api.get('/calendar/holidays', { params: { year: year.value } })
    holidays.value = response.data.data
  } catch { error.value = 'មិនអាចទាញថ្ងៃបុណ្យបាន។' }
}
function reset() {
  editingId.value = null
  Object.assign(form, { date: '', title: '', source: '' })
}
function edit(item) {
  editingId.value = item.id
  Object.assign(form, { date: item.date, title: item.title, source: item.source || '' })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function save() {
  busy.value = true
  error.value = ''
  try {
    if (editingId.value) await api.put(`/calendar/holidays/${editingId.value}`, form)
    else await api.post('/calendar/holidays', form)
    notice.value = 'បានរក្សាទុកថ្ងៃបុណ្យរួចហើយ'
    reset()
    await load()
  } catch { error.value = 'រក្សាទុកមិនបាន។ សូមពិនិត្យថ្ងៃ និងឈ្មោះ ឬថ្ងៃនេះមានរួចហើយ។' }
  finally { busy.value = false }
}
async function remove(id) {
  busy.value = true
  error.value = ''
  try {
    await api.delete(`/calendar/holidays/${id}`)
    holidays.value = holidays.value.filter(item => item.id !== id)
    notice.value = 'បានលុបថ្ងៃបុណ្យរួចហើយ'
  } catch { error.value = 'លុបមិនបាន។' }
  finally { busy.value = false }
}
onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div class="mb-8 flex items-center gap-3">
      <span class="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-gold-dark"><CalendarDays class="h-6 w-6" /></span>
      <div><h1 class="font-display text-2xl text-forest">ប្រតិទិនខ្មែរ</h1><p class="mt-1 text-sm text-gray-500">កែប្រែថ្ងៃឈប់សម្រាក និងថ្ងៃបុណ្យដែលបង្ហាញជាសាធារណៈ។</p></div>
    </div>
    <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{{ error }}</div>
    <div v-if="notice" class="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800" role="status">{{ notice }}</div>
    <form class="rounded-2xl bg-white p-6 shadow-sm" @submit.prevent="save">
      <h2 class="font-display text-lg text-forest">{{ editingId ? 'កែប្រែថ្ងៃបុណ្យ' : 'បន្ថែមថ្ងៃបុណ្យ' }}</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <label class="text-sm text-gray-700">កាលបរិច្ឆេទ<input v-model="form.date" required type="date" class="mt-1 block w-full rounded-lg border border-black/10 px-3 py-2" /></label>
        <label class="text-sm text-gray-700">ឈ្មោះថ្ងៃបុណ្យ<input v-model.trim="form.title" required maxlength="200" class="mt-1 block w-full rounded-lg border border-black/10 px-3 py-2" /></label>
        <label class="text-sm text-gray-700 sm:col-span-2">ប្រភពផ្លូវការ (បើមាន)<input v-model.trim="form.source" type="url" maxlength="500" placeholder="https://..." class="mt-1 block w-full rounded-lg border border-black/10 px-3 py-2" /></label>
      </div>
      <div class="mt-5 flex gap-2"><button type="submit" :disabled="busy" class="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2 font-semibold text-forest disabled:opacity-50"><Plus class="h-4 w-4" /> រក្សាទុក</button><button v-if="editingId" type="button" class="rounded-lg border px-5 py-2" @click="reset">បោះបង់</button></div>
    </form>
    <section class="mt-7 rounded-2xl bg-white p-6 shadow-sm">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 class="font-display text-lg text-forest">ថ្ងៃបុណ្យក្នុងឆ្នាំ {{ year }}</h2><label class="text-sm">ឆ្នាំ <input v-model.number="year" type="number" min="2020" max="2100" class="ml-2 w-24 rounded-lg border px-2 py-1" @change="load" /></label></div>
      <p v-if="!holidays.length" class="py-10 text-center text-gray-500">មិនទាន់មានថ្ងៃបុណ្យសម្រាប់ឆ្នាំនេះ។ សូមបន្ថែមតាមប្រកាសផ្លូវការ។</p>
      <div v-for="item in holidays" :key="item.id" class="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 py-3">
        <div><p class="font-semibold text-forest">{{ item.title }}</p><p class="mt-1 text-xs text-gray-500">{{ item.date }} <a v-if="item.source" :href="item.source" target="_blank" rel="noopener noreferrer" class="text-gold-dark underline">ប្រភព</a></p></div>
        <div class="flex gap-2"><button type="button" class="rounded-lg border p-2 text-forest hover:bg-cream" aria-label="កែប្រែ" @click="edit(item)"><Pencil class="h-4 w-4" /></button><button type="button" :disabled="busy" class="rounded-lg border p-2 text-red-700 hover:bg-red-50" aria-label="លុប" @click="remove(item.id)"><Trash2 class="h-4 w-4" /></button></div>
      </div>
    </section>
  </div>
</template>
