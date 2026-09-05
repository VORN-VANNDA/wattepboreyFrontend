<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'

const { items: photos, loading, saving, error, create, update, remove } = useAdminCrud('/gallery')

const categoryLabels = {
  ceremony: 'ពិធីបុណ្យទាន',
  architecture: 'ស្ថាបត្យកម្ម',
  community: 'សកម្មភាពសង្គម',
  other: 'ផ្សេងៗ',
}

const modalOpen = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  title: '',
  category: 'other',
  year: new Date().getFullYear(),
  image_url: '',
})
const form = reactive(emptyForm())

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  modalOpen.value = true
}

function openEdit(photo) {
  editingId.value = photo.id
  Object.assign(form, {
    title: photo.title,
    category: photo.category,
    year: photo.year,
    image_url: photo.image_url,
  })
  modalOpen.value = true
}

async function handleSubmit() {
  const ok = editingId.value ? await update(editingId.value, form) : await create(form)
  if (ok) modalOpen.value = false
}

async function handleDelete(photo) {
  if (confirm(`លុប "${photo.title}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
    await remove(photo.id)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-forest">បណ្ណាល័យរូបភាព (Gallery)</h1>
        <p class="mt-1 text-sm text-gray-500">គ្រប់គ្រងរូបភាពនានារបស់វត្ត</p>
      </div>
      <button type="button" class="btn-gold !py-2.5 text-sm" @click="openCreate">
        <Plus class="h-4 w-4" />
        បន្ថែមថ្មី
      </button>
    </div>

    <div v-if="loading" class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      <div v-for="n in 6" :key="n" class="aspect-square animate-pulse rounded-xl2 bg-white" />
    </div>
    <p v-else-if="!photos.length" class="mt-8 text-sm text-gray-400">មិនទាន់មានទិន្នន័យ</p>

    <div v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      <div v-for="photo in photos" :key="photo.id" class="group relative aspect-square overflow-hidden rounded-xl2 border border-black/5">
        <img :src="photo.image_url" :alt="photo.title" class="h-full w-full object-cover" />
        <div class="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
          <div class="flex justify-end gap-1.5">
            <button type="button" class="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-forest" @click="openEdit(photo)">
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button type="button" class="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-500" @click="handleDelete(photo)">
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
          <p class="truncate text-xs text-white">{{ photo.title }} · {{ photo.year }}</p>
        </div>
      </div>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែរូបភាព' : 'បន្ថែមរូបភាពថ្មី'" @close="modalOpen = false">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ចំណងជើង</label>
          <input v-model="form.title" type="text" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ប្រភេទ</label>
            <select v-model="form.category" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold">
              <option v-for="(label, value) in categoryLabels" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ឆ្នាំ</label>
            <input v-model.number="form.year" type="number" required min="2000" max="2100" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <ImageUploader v-model="form.image_url" folder="gallery" label="រូបភាព" />

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <button type="submit" :disabled="saving || !form.image_url" class="btn-gold w-full disabled:opacity-60">
          {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
