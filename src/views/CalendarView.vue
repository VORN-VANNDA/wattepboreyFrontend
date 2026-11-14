<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Clipboard, Clock3, Plus, Send } from 'lucide-vue-next'
import momentkh from '@thyrith/momentkh'
import api from '../lib/api'

const KEY_NAME = 'wt_calendar_access_key'
const timezone = 'Asia/Phnom_Penh'
const monthNames = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
const weekdays = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']
const khNumber = value => String(value).replace(/[0-9]/g, digit => '០១២៣៤៥៦៧៨៩'[Number(digit)])

function cambodiaToday() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).filter(part => part.type !== 'literal').map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
function dateParts(date) { return date.split('-').map(Number) }
function prettyDate(date) {
  const [year, month, day] = dateParts(date)
  return `${khNumber(day)} ${monthNames[month - 1]} ${khNumber(year)}`
}
function lunarFor(date) {
  const [year, month, day] = dateParts(date)
  const result = momentkh.fromGregorian(year, month, day)
  const lunar = result.khmer
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  const nextLunar = momentkh.fromGregorian(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()).khmer
  const holy = lunar.day === 8 || (lunar.moonPhase === 0 && lunar.day === 15) ||
    (lunar.moonPhase === 1 && nextLunar.moonPhase === 0)
  return { label: momentkh.format(result, 'dN ខែm'), short: momentkh.format(result, 'dN'),
    full: momentkh.format(result), holy }
}
function fullKhmerDate(date, lunar = lunarFor(date)) {
  const [year, month, day] = dateParts(date)
  return `${lunar.full} ត្រូវនឹងថ្ងៃទី${khNumber(day)} ខែ${monthNames[month - 1]} ឆ្នាំ${khNumber(year)}។`
}
function countdown(startsAt) {
  const date = new Date(`${startsAt}:00+07:00`)
  const minutes = Math.ceil((date.getTime() - now.value) / 60000)
  if (minutes <= 0) return 'កម្មវិធីបានចាប់ផ្ដើម'
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const rest = minutes % 60
  return days ? `នៅសល់ ${khNumber(days)} ថ្ងៃ ${khNumber(hours)} ម៉ោង` :
    `នៅសល់ ${khNumber(hours)} ម៉ោង ${khNumber(rest)} នាទី`
}

const today = ref(cambodiaToday())
const [initialYear, initialMonth] = dateParts(today.value)
const year = ref(initialYear)
const month = ref(initialMonth)
const selected = ref(today.value)
const now = ref(Date.now())
const holidays = ref([])
const events = ref([])
const telegramConnected = ref(false)
const telegramAvailable = ref(false)
const accessKey = ref(localStorage.getItem(KEY_NAME) || '')
const recoveryInput = ref('')
const showRecovery = ref(false)
const showForm = ref(false)
const editingId = ref(null)
const busy = ref(false)
const feedback = ref('')
const error = ref('')
const form = reactive({ title: '', startsAt: `${today.value}T09:00`, reminderMinutes: 0 })
let timer

const holidayMap = computed(() => {
  const map = new Map()
  for (const item of holidays.value) {
    if (!map.has(item.date)) map.set(item.date, [])
    map.get(item.date).push(item)
  }
  return map
})
const eventMap = computed(() => {
  const map = new Map()
  for (const item of events.value) {
    const date = item.startsAt.slice(0, 10)
    if (!map.has(date)) map.set(date, [])
    map.get(date).push(item)
  }
  return map
})
const calendarDays = computed(() => {
  const first = new Date(Date.UTC(year.value, month.value - 1, 1)).getUTCDay()
  const count = new Date(Date.UTC(year.value, month.value, 0)).getUTCDate()
  const cells = Array(first).fill(null)
  for (let day = 1; day <= count; day++) {
    const date = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ date, day, lunar: lunarFor(date), holidays: holidayMap.value.get(date) || [], events: eventMap.value.get(date) || [] })
  }
  while (cells.length % 7) cells.push(null)
  return cells
})
const selectedInfo = computed(() => ({
  lunar: lunarFor(selected.value),
  full: fullKhmerDate(selected.value),
  holidays: holidayMap.value.get(selected.value) || [],
  events: eventMap.value.get(selected.value) || [],
}))
const upcoming = computed(() => events.value
  .filter(item => new Date(`${item.startsAt}:00+07:00`).getTime() >= now.value - 3600000)
  .slice(0, 4))

async function loadHolidays() {
  try {
    const response = await api.get('/calendar/holidays', { params: { year: year.value } })
    holidays.value = response.data.data
  } catch {
    error.value = 'មិនអាចទាញថ្ងៃឈប់សម្រាកបាន។'
  }
}
async function loadMine() {
  if (!accessKey.value) return
  try {
    const response = await api.get('/calendar/mine', { headers: { 'X-Calendar-Key': accessKey.value } })
    events.value = response.data.events
    telegramConnected.value = response.data.telegramConnected
    telegramAvailable.value = response.data.telegramAvailable
  } catch {
    error.value = 'មិនអាចទាញកម្មវិធីផ្ទាល់ខ្លួនបាន។ សូមពិនិត្យសោប្រតិទិនរបស់អ្នក។'
  }
}
async function ensureKey() {
  if (accessKey.value) return accessKey.value
  const response = await api.post('/calendar/profiles')
  accessKey.value = response.data.key
  localStorage.setItem(KEY_NAME, accessKey.value)
  return accessKey.value
}
function changeMonth(delta) {
  const next = new Date(Date.UTC(year.value, month.value - 1 + delta, 1))
  if (next.getUTCFullYear() < 2020 || next.getUTCFullYear() > 2100) return
  year.value = next.getUTCFullYear()
  month.value = next.getUTCMonth() + 1
  selected.value = `${year.value}-${String(month.value).padStart(2, '0')}-01`
}
function goToday() {
  today.value = cambodiaToday()
  ;[year.value, month.value] = dateParts(today.value)
  selected.value = today.value
}
function selectDate(date) { selected.value = date }
async function copyDate() {
  const text = `${selectedInfo.value.full} (${selected.value})`
  try {
    await navigator.clipboard.writeText(text)
    feedback.value = 'បានចម្លងថ្ងៃរួចហើយ'
  } catch { error.value = 'មិនអាចចម្លងថ្ងៃបាននៅលើ browser នេះ។' }
}
function newEvent() {
  editingId.value = null
  Object.assign(form, { title: '', startsAt: `${selected.value}T09:00`, reminderMinutes: 0 })
  showForm.value = true
  feedback.value = ''
}
function editEvent(event) {
  editingId.value = event.id
  Object.assign(form, { title: event.title, startsAt: event.startsAt, reminderMinutes: event.reminderMinutes })
  showForm.value = true
}
async function saveEvent() {
  busy.value = true
  error.value = ''
  try {
    const key = await ensureKey()
    const body = { title: form.title, startsAt: form.startsAt, reminderMinutes: Number(form.reminderMinutes) }
    const options = { headers: { 'X-Calendar-Key': key } }
    if (editingId.value) await api.put(`/calendar/mine/events/${editingId.value}`, body, options)
    else await api.post('/calendar/mine/events', body, options)
    showForm.value = false
    await loadMine()
    feedback.value = 'បានរក្សាទុកកម្មវិធីរួចហើយ'
  } catch { error.value = 'រក្សាទុកមិនបាន។ សូមពិនិត្យឈ្មោះ ថ្ងៃ និងម៉ោង។' }
  finally { busy.value = false }
}
async function deleteEvent(id) {
  busy.value = true
  try {
    await api.delete(`/calendar/mine/events/${id}`, { headers: { 'X-Calendar-Key': accessKey.value } })
    await loadMine()
    feedback.value = 'បានលុបកម្មវិធីរួចហើយ'
  } catch { error.value = 'លុបកម្មវិធីមិនបាន។' }
  finally { busy.value = false }
}
async function connectTelegram() {
  busy.value = true
  error.value = ''
  try {
    const key = await ensureKey()
    const response = await api.post('/calendar/mine/telegram-link', {}, { headers: { 'X-Calendar-Key': key } })
    window.location.assign(response.data.url)
  } catch {
    error.value = 'Telegram bot មិនទាន់បានកំណត់នៅ backend ឬការភ្ជាប់បរាជ័យ។'
    busy.value = false
  }
}
async function disconnectTelegram() {
  busy.value = true
  try {
    await api.post('/calendar/mine/telegram-disconnect', {}, { headers: { 'X-Calendar-Key': accessKey.value } })
    await loadMine()
  } catch { error.value = 'ផ្ដាច់ Telegram មិនបាន។' }
  finally { busy.value = false }
}
async function restoreKey() {
  const key = recoveryInput.value.trim()
  if (!key) return
  try {
    await api.get('/calendar/mine', { headers: { 'X-Calendar-Key': key } })
    accessKey.value = key
    localStorage.setItem(KEY_NAME, key)
    recoveryInput.value = ''
    showRecovery.value = false
    await loadMine()
    feedback.value = 'បានស្ដារកម្មវិធីរបស់អ្នករួចហើយ'
  } catch { error.value = 'សោប្រតិទិននេះមិនត្រឹមត្រូវ។' }
}
async function copyKey() {
  await navigator.clipboard.writeText(accessKey.value)
  feedback.value = 'បានចម្លងសោស្ដារកម្មវិធីរួចហើយ'
}

watch(year, loadHolidays)
onMounted(() => {
  loadHolidays()
  loadMine()
  api.get('/calendar/config').then(response => {
    telegramAvailable.value = response.data.telegramAvailable
  }).catch(() => {})
  timer = setInterval(() => {
    now.value = Date.now()
    today.value = cambodiaToday()
  }, 60000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="bg-[#faf9f5] pb-20 text-forest">
    <section class="relative overflow-hidden bg-forest-dark px-5 py-14 text-white sm:py-20">
      <div class="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-gold/20" aria-hidden="true" />
      <div class="absolute -right-4 -top-12 h-64 w-64 rounded-full border border-gold/20" aria-hidden="true" />
      <div class="relative mx-auto max-w-7xl">
        <p class="mb-3 text-sm font-semibold tracking-wide text-gold-light">ថ្ងៃសំខាន់ · ថ្ងៃសីល · កម្មវិធីរបស់អ្នក</p>
        <h1 class="font-display text-4xl leading-relaxed sm:text-5xl">ប្រតិទិនខ្មែរ</h1>
        <p class="mt-3 max-w-2xl leading-8 text-white/75">មើលថ្ងៃបុណ្យ និងថ្ងៃសីល រៀបចំកម្មវិធីផ្ទាល់ខ្លួន និងទទួលការរំឭកមុនថ្ងៃសំខាន់។</p>
        <div class="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/10 px-4 py-2 text-sm">
          <CalendarDays class="h-4 w-4 text-gold-light" /> ថ្ងៃនេះ · {{ prettyDate(today) }}
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-7xl gap-7 px-4 pt-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
      <div class="min-w-0">
        <div class="rounded-2xl border border-black/5 bg-white p-3 shadow-sm sm:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">ប្រតិទិនប្រចាំខែ</p>
              <h2 class="mt-1 font-display text-2xl">{{ monthNames[month - 1] }} {{ khNumber(year) }}</h2>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-cream" @click="goToday">ថ្ងៃនេះ</button>
              <button type="button" class="rounded-lg border border-black/10 p-2 hover:bg-cream" aria-label="ខែមុន" @click="changeMonth(-1)"><ChevronLeft class="h-5 w-5" /></button>
              <button type="button" class="rounded-lg border border-black/10 p-2 hover:bg-cream" aria-label="ខែបន្ទាប់" @click="changeMonth(1)"><ChevronRight class="h-5 w-5" /></button>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-7 border-b border-black/10 pb-3 text-center text-xs font-semibold text-gray-500 sm:text-sm">
            <span v-for="day in weekdays" :key="day">{{ day }}</span>
          </div>
          <div class="grid grid-cols-7 gap-1 pt-2 sm:gap-2">
            <div v-for="(cell, index) in calendarDays" :key="cell?.date || `blank-${index}`" class="min-h-20 sm:min-h-28">
              <button v-if="cell" type="button" class="flex h-full w-full flex-col rounded-xl border p-1.5 text-left transition sm:p-2.5"
                :class="selected === cell.date ? 'border-gold bg-gold/10 shadow-sm' : cell.holidays.length ? 'border-red-100 bg-red-50 hover:border-red-300' : 'border-transparent hover:bg-cream'"
                :aria-label="`${fullKhmerDate(cell.date, cell.lunar)} ${cell.holidays.map(item => item.title).join(', ')}`"
                :title="fullKhmerDate(cell.date, cell.lunar)"
                :aria-pressed="selected === cell.date" @click="selectDate(cell.date)">
                <span class="grid h-7 w-7 place-items-center rounded-full text-sm font-bold sm:h-8 sm:w-8"
                  :class="cell.date === today ? 'bg-forest text-white' : cell.holidays.length ? 'text-red-700' : 'text-forest'">{{ khNumber(cell.day) }}</span>
                <span class="mt-1 text-[9px] leading-tight text-gray-500 sm:text-[11px]">{{ cell.lunar.short }}</span>
                <span class="mt-auto flex items-center gap-1 pt-1">
                  <span v-if="cell.holidays.length" class="h-1.5 w-1.5 rounded-full bg-red-600" />
                  <img v-if="cell.lunar.holy" src="/buddha-holy.svg" alt="ថ្ងៃសីល" class="h-4 w-4" />
                  <span v-if="cell.events.length" class="h-1.5 w-1.5 rounded-full bg-forest" />
                </span>
                <span v-if="cell.holidays.length" class="hidden line-clamp-1 text-[10px] text-red-700 md:block">{{ cell.holidays[0].title }}</span>
              </button>
            </div>
          </div>
          <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/5 pt-4 text-xs text-gray-600">
            <span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-red-600" /> ថ្ងៃឈប់សម្រាក</span>
            <span class="flex items-center gap-2"><img src="/buddha-holy.svg" alt="" class="h-4 w-4" /> ថ្ងៃសីល</span>
            <span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-forest" /> កម្មវិធីរបស់អ្នក</span>
          </div>
        </div>
        <p v-if="!holidays.length" class="mt-3 text-sm text-gray-500">ថ្ងៃឈប់សម្រាកផ្លូវការឆ្នាំ {{ khNumber(year) }} មិនទាន់បានបញ្ចូល។ ថ្ងៃសីលនៅតែបង្ហាញតាមប្រតិទិនចន្ទគតិ។</p>
        <p v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>
        <p v-if="feedback" class="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{{ feedback }}</p>
      </div>

      <aside class="space-y-5">
        <section class="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold text-gold-dark">ថ្ងៃដែលបានជ្រើស</p>
          <h2 class="mt-2 font-display text-xl leading-relaxed">{{ prettyDate(selected) }}</h2>
          <p class="mt-2 text-sm leading-7 text-gray-600">{{ selectedInfo.full }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span v-if="selectedInfo.lunar.holy" class="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold-dark">☾ ថ្ងៃសីល</span>
            <span v-for="holiday in selectedInfo.holidays" :key="holiday.id" class="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700">{{ holiday.title }}</span>
          </div>
          <div v-if="selectedInfo.events.length" class="mt-4 space-y-3 border-t border-black/5 pt-4">
            <div v-for="item in selectedInfo.events" :key="item.id" class="rounded-xl bg-cream p-3">
              <p class="font-semibold">{{ item.title }}</p>
              <p class="mt-1 text-xs text-gray-600">{{ item.startsAt.slice(11) }} · {{ countdown(item.startsAt) }}</p>
              <div class="mt-2 flex gap-3 text-xs"><button class="text-gold-dark underline" @click="editEvent(item)">កែប្រែ</button><button class="text-red-700 underline" :disabled="busy" @click="deleteEvent(item.id)">លុប</button></div>
            </div>
          </div>
          <div class="mt-5 flex gap-2">
            <button type="button" class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gold px-3 py-2 text-sm text-gold-dark hover:bg-gold/10" @click="copyDate"><Clipboard class="h-4 w-4" /> ចម្លងថ្ងៃ</button>
            <button type="button" class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-forest px-3 py-2 text-sm text-white hover:bg-forest/90" @click="newEvent"><Plus class="h-4 w-4" /> កំណត់កម្មវិធី</button>
          </div>
        </section>

        <section v-if="showForm" class="rounded-2xl border border-gold/30 bg-white p-5 shadow-sm">
          <h2 class="font-display text-lg">{{ editingId ? 'កែប្រែកម្មវិធី' : 'កម្មវិធីថ្មីរបស់អ្នក' }}</h2>
          <form class="mt-4 space-y-3" @submit.prevent="saveEvent">
            <label class="block text-sm">ឈ្មោះកម្មវិធី<input v-model.trim="form.title" required maxlength="160" class="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-gold" placeholder="ឧ. ពិធីបុណ្យគ្រួសារ" /></label>
            <label class="block text-sm">ថ្ងៃ និងម៉ោង<input v-model="form.startsAt" required type="datetime-local" class="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-gold" /></label>
            <label class="block text-sm">រំឭកតាម Telegram<select v-model.number="form.reminderMinutes" class="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"><option :value="0">មិនរំឭក</option><option :value="60">មុន ១ ម៉ោង</option><option :value="1440">មុន ១ ថ្ងៃ</option></select></label>
            <div class="flex gap-2 pt-1"><button type="submit" :disabled="busy" class="flex-1 rounded-lg bg-gold px-4 py-2 font-semibold text-forest disabled:opacity-50">រក្សាទុក</button><button type="button" class="rounded-lg border px-4 py-2" @click="showForm = false">បោះបង់</button></div>
          </form>
        </section>

        <section class="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div class="flex items-center gap-2"><Clock3 class="h-5 w-5 text-gold-dark" /><h2 class="font-display text-lg">កម្មវិធីជិតមកដល់</h2></div>
          <p v-if="!upcoming.length" class="mt-3 text-sm leading-7 text-gray-500">មិនទាន់មានកម្មវិធីផ្ទាល់ខ្លួន។ ជ្រើសថ្ងៃក្នុងប្រតិទិន ដើម្បីកំណត់កម្មវិធី។</p>
          <div v-for="item in upcoming" :key="item.id" class="mt-4 border-t border-black/5 pt-3">
            <p class="font-semibold">{{ item.title }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ prettyDate(item.startsAt.slice(0, 10)) }} · {{ item.startsAt.slice(11) }}</p>
            <p class="mt-1 text-sm font-semibold text-gold-dark">{{ countdown(item.startsAt) }}</p>
          </div>
        </section>

        <section class="rounded-2xl border border-black/5 bg-forest p-5 text-white shadow-sm">
          <div class="flex items-center gap-2"><Bell class="h-5 w-5 text-gold-light" /><h2 class="font-display text-lg">រំឭកតាម Telegram</h2></div>
          <p class="mt-2 text-sm leading-7 text-white/75">ភ្ជាប់ bot ម្ដង ដើម្បីទទួលសារមុនថ្ងៃកម្មវិធីដែលអ្នកបានកំណត់។</p>
          <p v-if="telegramConnected" class="mt-3 text-sm text-green-300">✓ បានភ្ជាប់ Telegram រួចហើយ</p>
          <p v-else-if="!telegramAvailable" class="mt-3 text-sm text-gold-light">មុខងារផ្ញើសារនឹងដំណើរការពេល Admin កំណត់ Telegram bot។</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button v-if="!telegramConnected" type="button" :disabled="busy || !telegramAvailable" class="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-forest disabled:opacity-50" @click="connectTelegram"><Send class="h-4 w-4" /> ភ្ជាប់ Telegram</button>
            <button v-if="telegramConnected" type="button" :disabled="busy" class="rounded-lg border border-white/40 px-4 py-2 text-sm" @click="disconnectTelegram">ផ្ដាច់ Telegram</button>
            <button v-if="accessKey" type="button" class="rounded-lg border border-white/40 px-4 py-2 text-sm" @click="loadMine">ពិនិត្យស្ថានភាព</button>
          </div>
        </section>

        <section class="rounded-2xl border border-black/5 bg-white p-5 text-sm shadow-sm">
          <p class="font-semibold">កម្មវិធីផ្ទាល់ខ្លួន</p>
          <p class="mt-2 leading-6 text-gray-500">កម្មវិធីរបស់អ្នកមានភាពឯកជន។ រក្សាសោខាងក្រោមដើម្បីស្ដារនៅលើឧបករណ៍ផ្សេង។ អ្នកដែលមានសោនេះអាចមើល និងកែកម្មវិធីបាន។</p>
          <button v-if="accessKey" type="button" class="mt-3 text-gold-dark underline" @click="copyKey">ចម្លងសោស្ដារកម្មវិធី</button>
          <button type="button" class="mt-3 block text-forest underline" @click="showRecovery = !showRecovery">ខ្ញុំមានសោរួចហើយ</button>
          <div v-if="showRecovery" class="mt-3 flex gap-2"><input v-model.trim="recoveryInput" type="text" class="min-w-0 flex-1 rounded-lg border px-2 py-2" aria-label="សោស្ដារកម្មវិធី" /><button class="rounded-lg bg-forest px-3 py-2 text-white" @click="restoreKey">ស្ដារ</button></div>
        </section>
      </aside>
    </div>
  </div>
</template>
