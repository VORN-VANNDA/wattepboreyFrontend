<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, ExternalLink, Images } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'
import GalleryUploader from '../../components/admin/GalleryUploader.vue'

const { items: slides, loading, saving, error, update, create, remove } = useAdminCrud('/slides')

const modalOpen = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  title: '',
  subtitle: '',
  badge: '',
  image_url: '',
  gallery_images: [],
  primary_label: 'Facebook',
  primary_url: '',
  secondary_label: 'អានបន្ថែម',
  secondary_url: '/events',
  display_order: 0,
  is_active: true,
})
const form = reactive(emptyForm())

function openCreate() {
  editingId.value = null
  // New slides go at the end by default so they don't jump ahead of existing ones.
  const maxOrder = slides.value.reduce((max, s) => Math.max(max, s.display_order ?? 0), -1)
  Object.assign(form, emptyForm(), { display_order: maxOrder + 1 })
  modalOpen.value = true
}

function openEdit(slide) {
  editingId.value = slide.id
  Object.assign(form, {
    title: slide.title,
    subtitle: slide.subtitle || '',
    badge: slide.badge || '',
    image_url: slide.image_url || '',
    gallery_images: Array.isArray(slide.gallery_images) ? [...slide.gallery_images] : [],
    primary_label: slide.primary_label || '',
    primary_url: slide.primary_url || '',
    secondary_label: slide.secondary_label || '',
    secondary_url: slide.secondary_url || '',
    display_order: slide.display_order || 0,
    is_active: !!slide.is_active,
  })
  modalOpen.value = true
}

async function handleSubmit() {
  const ok = editingId.value ? await update(editingId.value, form) : await create(form)
  if (ok) modalOpen.value = false
}

async function handleDelete(slide) {
  if (confirm(`លុប slide "${slide.title}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
    await remove(slide.id)
  }
}

// Slides are already sorted by display_order — moving one up/down just
// swaps its order value with its neighbor, no manual number-typing needed.
async function moveSlide(index, direction) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= slides.value.length) return
  const a = slides.value[index]
  const b = slides.value[targetIndex]
  await update(a.id, { ...a, display_order: b.display_order })
  await update(b.id, { ...b, display_order: a.display_order })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-forest">ស្លាយទំព័រដើម (Home Slides)</h1>
        <p class="mt-1 text-sm text-gray-500">
          គ្រប់គ្រង card slide ក្រោម hero banner — ណែនាំ ៣-៤ slide សម្រាប់ carousel ស្អាត
        </p>
      </div>
      <button type="button" class="btn-gold !py-2.5 text-sm" @click="openCreate">
        <Plus class="h-4 w-4" />
        បន្ថែមថ្មី
      </button>
    </div>

    <div class="mt-8 overflow-hidden rounded-xl2 border border-black/5 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-cream text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th class="px-5 py-3">លំដាប់</th>
            <th class="px-5 py-3">រូបភាព</th>
            <th class="px-5 py-3">ចំណងជើង</th>
            <th class="px-5 py-3">ស្ថានភាព</th>
            <th class="px-5 py-3 text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
          <tr v-if="loading">
            <td colspan="5" class="px-5 py-8 text-center text-gray-400">កំពុងផ្ទុក...</td>
          </tr>
          <tr v-else-if="!slides.length">
            <td colspan="5" class="px-5 py-8 text-center text-gray-400">
              មិនទាន់មាន slide ទេ — ចុច "បន្ថែមថ្មី" ដើម្បីបង្កើត slide ដំបូង
            </td>
          </tr>
          <tr v-for="(slide, index) in slides" v-else :key="slide.id" class="hover:bg-cream/50">
            <td class="px-5 py-3">
              <div class="flex flex-col gap-0.5">
                <button
                  type="button"
                  class="rounded p-0.5 text-gray-400 hover:bg-cream hover:text-forest disabled:opacity-20"
                  :disabled="index === 0"
                  @click="moveSlide(index, -1)"
                >
                  <ChevronUp class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded p-0.5 text-gray-400 hover:bg-cream hover:text-forest disabled:opacity-20"
                  :disabled="index === slides.length - 1"
                  @click="moveSlide(index, 1)"
                >
                  <ChevronDown class="h-4 w-4" />
                </button>
              </div>
            </td>
            <td class="px-5 py-3">
              <div class="relative w-fit">
                <img :src="slide.image_url" class="h-12 w-20 rounded-lg object-cover" alt="" />
                <span
                  v-if="slide.gallery_images?.length"
                  class="absolute -bottom-1.5 -right-1.5 inline-flex items-center gap-1 rounded-full bg-forest-dark px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  :title="`មានរូបភាពបន្ថែម ${slide.gallery_images.length} សន្លឹក`"
                >
                  <Images class="h-2.5 w-2.5" />{{ slide.gallery_images.length }}
                </span>
              </div>
            </td>
            <td class="px-5 py-3">
              <p class="font-medium text-forest">{{ slide.title }}</p>
              <p class="mt-1 line-clamp-1 text-xs text-gray-500">{{ slide.subtitle }}</p>
            </td>
            <td class="px-5 py-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                :class="slide.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                <Eye v-if="slide.is_active" class="h-3.5 w-3.5" />
                <EyeOff v-else class="h-3.5 w-3.5" />
                {{ slide.is_active ? 'បង្ហាញ' : 'លាក់' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-2">
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-cream hover:text-forest" @click="openEdit(slide)">
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="handleDelete(slide)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែស្លាយ' : 'បន្ថែមស្លាយថ្មី'" @close="modalOpen = false">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <ImageUploader v-model="form.image_url" folder="slides" label="រូបភាពស្លាយ (រូបធំ)" />
            <p class="mt-1.5 text-xs text-gray-400">
              ណែនាំ៖ រូបផ្តេក (landscape) យ៉ាងតិច 1200×800px គុណភាពច្បាស់ — នេះជារូបធំបង្ហាញនៅ card ដើម
            </p>
          </div>

          <div class="border-t border-black/5 pt-5">
            <GalleryUploader
              v-model="form.gallery_images"
              folder="slides"
              label="រូបភាពបន្ថែម (Gallery)"
            />
            <p class="mt-1.5 text-xs text-gray-400">
              រូបភាពទាំងនេះនឹងបង្ហាញនៅខាងក្រោមរូបធំ ក្នុងទំព័រលម្អិតរបស់ស្លាយ (Slide Detail)
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ចំណងជើង</label>
            <input v-model="form.title" type="text" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ស្លាក (Badge) — ជម្រើស</label>
            <input v-model="form.badge" type="text" placeholder="ព្រឹត្តិការណ៍ថ្មី" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ពិពណ៌នា</label>
            <textarea v-model="form.subtitle" rows="3" class="w-full resize-none rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">ប៊ូតុង ១ — ឈ្មោះ</label>
              <input v-model="form.primary_label" type="text" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">ប៊ូតុង ១ — តំណ URL</label>
              <input v-model="form.primary_url" type="text" placeholder="https://facebook.com/..." class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">ប៊ូតុង ២ — ឈ្មោះ</label>
              <input v-model="form.secondary_label" type="text" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">ប៊ូតុង ២ — តំណ URL</label>
              <input v-model="form.secondary_url" type="text" placeholder="/events" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <p class="-mt-3 text-xs text-gray-400">
            URL ខាងក្នុងគេហទំព័រ (ដូចជា <code>/events</code>) ចុចហើយប្តូរទំព័រផ្ទាល់ខ្លួន URL ខាងក្រៅ (ដូចជា Facebook) បើកទំព័រថ្មី
          </p>

          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-black/20 text-gold focus:ring-gold" />
            បង្ហាញលើទំព័រដើម
          </label>

          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

          <button type="submit" :disabled="saving || !form.image_url" class="btn-gold w-full disabled:opacity-60">
            {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
          </button>
        </form>

        <!-- Live preview — mirrors the real slide card layout on HomeView -->
        <div class="lg:sticky lg:top-0">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">មើលជាមុន</p>
          <div class="overflow-hidden rounded-xl2 border border-black/10 bg-white shadow-sm">
            <div class="relative h-32 bg-cream">
              <img v-if="form.image_url" :src="form.image_url" class="h-full w-full object-cover" alt="" />
              <div v-else class="grid h-full place-items-center text-xs text-gray-300">គ្មានរូបភាព</div>
            </div>
            <div class="p-4 text-center">
              <p v-if="form.badge" class="text-[11px] font-semibold text-gold-dark">{{ form.badge }}</p>
              <p class="mt-1 font-display text-sm text-forest">{{ form.title || 'ចំណងជើងស្លាយ' }}</p>
              <p v-if="form.subtitle" class="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-gray-500">
                {{ form.subtitle }}
              </p>
              <div class="mt-3 flex flex-wrap justify-center gap-1.5">
                <span v-if="form.primary_label" class="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                  <ExternalLink class="h-2.5 w-2.5" />{{ form.primary_label }}
                </span>
                <span v-if="form.secondary_label" class="rounded-full border border-forest px-2.5 py-1 text-[10px] font-semibold text-forest">
                  {{ form.secondary_label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Gallery preview thumbnails -->
          <div v-if="form.gallery_images.length" class="mt-4">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              រូបភាពបន្ថែម ({{ form.gallery_images.length }})
            </p>
            <div class="grid grid-cols-4 gap-1.5">
              <img
                v-for="(url, i) in form.gallery_images"
                :key="url + i"
                :src="url"
                class="aspect-square w-full rounded-md object-cover"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
