<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-vue-next'
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
const props = defineProps({ blob: { type: Blob, required: true } })
const frame = ref(null)
const pageNumber = ref(1)
const pageCount = ref(0)
const zoom = ref(1)
const loading = ref(true)
const error = ref('')
const estimatedHeight = ref(900)
const pages = ref([])
const pageNodes = new Map()
const canvasNodes = new Map()
const activePages = new Set()
const renderTasks = new Map()
const renderVersions = new Map()
let pdf = null
let resizeObserver = null
let renderObserver = null
let currentObserver = null
let generation = 0
let pageRatio = 1.4
let lastFrameWidth = 0

function setPageNode(number, element) {
  if (element) pageNodes.set(number, element)
  else pageNodes.delete(number)
}

function setCanvasNode(number, element) {
  if (element) canvasNodes.set(number, element)
  else canvasNodes.delete(number)
}

function releasePage(number) {
  activePages.delete(number)
  renderVersions.set(number, (renderVersions.get(number) || 0) + 1)
  renderTasks.get(number)?.cancel()
  const canvas = canvasNodes.get(number)
  if (canvas) {
    canvas.width = 0
    canvas.height = 0
    canvas.style.width = ''
    canvas.style.height = ''
  }
}

async function renderPage(number) {
  const document = pdf
  const canvas = canvasNodes.get(number)
  const container = pageNodes.get(number)
  if (!document || !canvas || !container || !frame.value) return
  const version = (renderVersions.get(number) || 0) + 1
  renderVersions.set(number, version)
  const previousTask = renderTasks.get(number)
  if (previousTask) {
    previousTask.cancel()
    try { await previousTask.promise } catch { /* Cancellation is expected. */ }
    if (renderTasks.get(number) === previousTask) renderTasks.delete(number)
  }
  let task = null
  try {
    const page = await document.getPage(number)
    if (pdf !== document || version !== renderVersions.get(number) || !activePages.has(number)) return
    const natural = page.getViewport({ scale: 1 })
    const width = Math.max(200, frame.value.clientWidth - 24) * zoom.value
    const pixels = Math.min(window.devicePixelRatio || 1, 2)
    const viewport = page.getViewport({ scale: (width / natural.width) * pixels })
    container.style.minHeight = `${Math.ceil(width * natural.height / natural.width) + 24}px`
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    canvas.style.width = `${Math.ceil(viewport.width / pixels)}px`
    canvas.style.height = `${Math.ceil(viewport.height / pixels)}px`
    task = page.render({ canvasContext: canvas.getContext('2d'), viewport })
    renderTasks.set(number, task)
    await task.promise
  } catch (cause) {
    if (cause?.name !== 'RenderingCancelledException' && pdf === document) {
      error.value = 'មិនអាចបង្ហាញទំព័រនេះបាន។'
    }
  } finally {
    if (task && renderTasks.get(number) === task) renderTasks.delete(number)
  }
}

function observePages() {
  renderObserver?.disconnect()
  currentObserver?.disconnect()
  renderObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const number = Number(entry.target.dataset.page)
      if (entry.isIntersecting) {
        if (!activePages.has(number)) {
          activePages.add(number)
          renderPage(number)
        }
      } else if (activePages.has(number)) {
        releasePage(number)
      }
    }
  }, { rootMargin: '1200px 0px' })
  currentObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
    if (visible.length) pageNumber.value = Number(visible[0].target.dataset.page)
  }, { rootMargin: '-45% 0px -45% 0px' })
  for (const element of pageNodes.values()) {
    renderObserver.observe(element)
    currentObserver.observe(element)
  }
}

function updatePageHeights() {
  if (!frame.value) return
  estimatedHeight.value = Math.ceil(Math.max(200, frame.value.clientWidth - 24) * zoom.value * pageRatio) + 24
  for (const element of pageNodes.values()) element.style.minHeight = `${estimatedHeight.value}px`
  for (const number of activePages) renderPage(number)
}

function goToPage(value) {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1 || number > pageCount.value) return
  pageNumber.value = number
  pageNodes.get(number)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(() => props.blob, async blob => {
  const version = ++generation
  renderObserver?.disconnect()
  currentObserver?.disconnect()
  for (const number of [...activePages]) releasePage(number)
  await pdf?.destroy()
  pdf = null
  pages.value = []
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
    const firstPage = await document.getPage(1)
    if (version !== generation) return
    const size = firstPage.getViewport({ scale: 1 })
    pageRatio = size.height / size.width
    pages.value = Array.from({ length: document.numPages }, (_, index) => index + 1)
    await nextTick()
    updatePageHeights()
    observePages()
    loading.value = false
  } catch {
    if (version === generation) { error.value = 'មិនអាចអាន PDF នេះបាន។'; loading.value = false }
  }
}, { immediate: true })

watch(zoom, updatePageHeights)
onMounted(() => {
  lastFrameWidth = frame.value?.clientWidth || 0
  resizeObserver = new ResizeObserver(() => {
    const width = frame.value?.clientWidth || 0
    if (width && width !== lastFrameWidth) {
      lastFrameWidth = width
      updatePageHeights()
    }
  })
  if (frame.value) resizeObserver.observe(frame.value)
})
onBeforeUnmount(() => {
  generation++
  resizeObserver?.disconnect()
  renderObserver?.disconnect()
  currentObserver?.disconnect()
  for (const number of [...activePages]) releasePage(number)
  pdf?.destroy()
})
</script>

<template>
  <div class="rounded-xl border border-black/10 bg-cream">
    <div class="flex flex-wrap items-center justify-center gap-2 border-b border-black/10 bg-white px-3 py-3 sm:gap-4">
      <button type="button" :disabled="pageNumber <= 1" class="rounded-lg border p-2 disabled:opacity-40" aria-label="ទំព័រមុន" @click="goToPage(pageNumber - 1)"><ChevronLeft class="h-5 w-5" /></button>
      <label class="flex items-center gap-2 text-sm">ទំព័រ <input :value="pageNumber" type="number" min="1" :max="pageCount" class="w-16 rounded border px-2 py-1 text-center" aria-label="លេខទំព័រ" @change="goToPage($event.target.value)" /> / {{ pageCount || '…' }}</label>
      <button type="button" :disabled="pageNumber >= pageCount" class="rounded-lg border p-2 disabled:opacity-40" aria-label="ទំព័របន្ទាប់" @click="goToPage(pageNumber + 1)"><ChevronRight class="h-5 w-5" /></button>
      <span class="mx-1 hidden h-6 border-l border-black/10 sm:block" aria-hidden="true" />
      <button type="button" :disabled="zoom <= 0.7" class="hidden rounded-lg border p-2 disabled:opacity-40 sm:block" aria-label="បង្រួម" @click="zoom = Math.max(0.7, zoom - 0.2)"><ZoomOut class="h-5 w-5" /></button>
      <button type="button" :disabled="zoom >= 2" class="hidden rounded-lg border p-2 disabled:opacity-40 sm:block" aria-label="ពង្រីក" @click="zoom = Math.min(2, zoom + 0.2)"><ZoomIn class="h-5 w-5" /></button>
    </div>
    <div ref="frame" class="relative p-3 text-center">
      <p v-if="loading" class="py-12 text-sm text-gray-500" role="status">កំពុងបង្ហាញទំព័រ...</p>
      <p v-if="error" class="py-16 text-red-600" role="alert">{{ error }}</p>
      <div v-for="number in pages" :key="number" :ref="element => setPageNode(number, element)" :data-page="number" :style="{ minHeight: `${estimatedHeight}px` }" class="mb-4 scroll-mt-24 bg-white shadow-md">
        <canvas :ref="element => setCanvasNode(number, element)" class="mx-auto block max-w-full sm:max-w-none" :aria-label="`ទំព័រសៀវភៅ ${number}`" />
      </div>
    </div>
  </div>
</template>
