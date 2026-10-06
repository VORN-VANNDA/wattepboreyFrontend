<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-vue-next'
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
const props = defineProps({ blob: { type: Blob, required: true } })
const viewer = ref(null)
const frame = ref(null)
const canvas = ref(null)
const pageNumber = ref(1)
const pageCount = ref(0)
const zoom = ref(1)
const loading = ref(true)
const error = ref('')
let pdf = null
let renderTask = null
let observer = null
let generation = 0
let lastScrollY = 0
let lastAutoTurn = 0

async function renderPage() {
  if (!pdf || !canvas.value || !frame.value) return
  const version = ++generation
  renderTask?.cancel()
  renderTask = null
  loading.value = true
  try {
    const page = await pdf.getPage(pageNumber.value)
    if (version !== generation) return
    const natural = page.getViewport({ scale: 1 })
    const available = Math.max(200, frame.value.clientWidth - 24)
    const scale = (available / natural.width) * zoom.value
    const pixels = Math.min(window.devicePixelRatio || 1, 2)
    const viewport = page.getViewport({ scale: scale * pixels })
    const element = canvas.value
    element.width = Math.ceil(viewport.width)
    element.height = Math.ceil(viewport.height)
    element.style.width = `${Math.ceil(viewport.width / pixels)}px`
    element.style.height = `${Math.ceil(viewport.height / pixels)}px`
    renderTask = page.render({ canvasContext: element.getContext('2d'), viewport })
    await renderTask.promise
    if (version === generation) error.value = ''
  } catch (cause) {
    if (version === generation && cause?.name !== 'RenderingCancelledException') error.value = 'មិនអាចបង្ហាញទំព័រនេះបាន។'
  } finally {
    if (version === generation) loading.value = false
  }
}

function goToPage(value) {
  const number = Number(value)
  if (Number.isInteger(number) && number >= 1 && number <= pageCount.value && number !== pageNumber.value) {
    lastAutoTurn = Date.now()
    pageNumber.value = number
    nextTick(() => viewer.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}

function advanceOnScroll() {
  const currentY = window.scrollY
  const scrollingDown = currentY > lastScrollY
  lastScrollY = currentY
  if (!scrollingDown || loading.value || pageNumber.value >= pageCount.value) return
  if (Date.now() - lastAutoTurn < 900) return
  const bounds = viewer.value?.getBoundingClientRect()
  if (!bounds || bounds.top >= window.innerHeight || bounds.bottom < 0) return
  if (bounds.bottom <= window.innerHeight + 24) {
    goToPage(pageNumber.value + 1)
  }
}

watch(() => props.blob, async blob => {
  const version = ++generation
  renderTask?.cancel()
  await pdf?.destroy()
  pdf = null
  pageCount.value = 0
  pageNumber.value = 1
  loading.value = true
  error.value = ''
  try {
    const data = new Uint8Array(await blob.arrayBuffer())
    const task = pdfjs.getDocument({ data })
    const document = await task.promise
    if (version !== generation) { await document.destroy(); return }
    pdf = document
    pageCount.value = document.numPages
    await nextTick()
    await renderPage()
  } catch {
    if (version === generation) { error.value = 'មិនអាចអាន PDF នេះបាន។'; loading.value = false }
  }
}, { immediate: true })
watch([pageNumber, zoom], renderPage)
onMounted(() => {
  observer = new ResizeObserver(() => renderPage())
  if (frame.value) observer.observe(frame.value)
  lastScrollY = window.scrollY
  window.addEventListener('scroll', advanceOnScroll, { passive: true })
})
onBeforeUnmount(() => {
  generation++
  window.removeEventListener('scroll', advanceOnScroll)
  observer?.disconnect()
  renderTask?.cancel()
  pdf?.destroy()
})
</script>

<template>
  <div ref="viewer" class="scroll-mt-24 overflow-hidden rounded-xl border border-black/10 bg-cream">
    <div class="flex flex-wrap items-center justify-center gap-2 border-b border-black/10 bg-white px-3 py-3 sm:gap-4">
      <button type="button" :disabled="pageNumber <= 1" class="rounded-lg border p-2 disabled:opacity-40" aria-label="ទំព័រមុន" @click="goToPage(pageNumber - 1)"><ChevronLeft class="h-5 w-5" /></button>
      <label class="flex items-center gap-2 text-sm">ទំព័រ <input :value="pageNumber" type="number" min="1" :max="pageCount" class="w-16 rounded border px-2 py-1 text-center" aria-label="លេខទំព័រ" @change="goToPage($event.target.value)" /> / {{ pageCount || '…' }}</label>
      <button type="button" :disabled="pageNumber >= pageCount" class="rounded-lg border p-2 disabled:opacity-40" aria-label="ទំព័របន្ទាប់" @click="goToPage(pageNumber + 1)"><ChevronRight class="h-5 w-5" /></button>
      <span class="mx-1 hidden h-6 border-l border-black/10 sm:block" aria-hidden="true" />
      <button type="button" :disabled="zoom <= 0.7" class="hidden rounded-lg border p-2 disabled:opacity-40 sm:block" aria-label="បង្រួម" @click="zoom = Math.max(0.7, zoom - 0.2)"><ZoomOut class="h-5 w-5" /></button>
      <button type="button" :disabled="zoom >= 2" class="hidden rounded-lg border p-2 disabled:opacity-40 sm:block" aria-label="ពង្រីក" @click="zoom = Math.min(2, zoom + 0.2)"><ZoomIn class="h-5 w-5" /></button>
    </div>
    <div ref="frame" class="relative min-h-[320px] touch-pan-y p-3 text-center sm:overflow-x-auto">
      <p v-if="loading" class="absolute inset-x-0 top-10 text-sm text-gray-500" role="status">កំពុងបង្ហាញទំព័រ...</p>
      <p v-if="error" class="py-16 text-red-600" role="alert">{{ error }}</p>
      <canvas ref="canvas" class="mx-auto max-w-full bg-white shadow-md sm:max-w-none" aria-label="ទំព័រសៀវភៅ" />
    </div>
    <div v-if="pageCount > 1" class="flex items-center justify-between gap-3 border-t border-black/10 bg-white px-3 py-3 text-sm sm:justify-center">
      <button type="button" :disabled="pageNumber <= 1" class="rounded-lg border px-3 py-2 disabled:opacity-40" @click="goToPage(pageNumber - 1)">ទំព័រមុន</button>
      <span>{{ pageNumber }} / {{ pageCount }}</span>
      <button type="button" :disabled="pageNumber >= pageCount" class="rounded-lg bg-gold px-3 py-2 text-white disabled:opacity-40" @click="goToPage(pageNumber + 1)">ទំព័របន្ទាប់</button>
    </div>
  </div>
</template>
