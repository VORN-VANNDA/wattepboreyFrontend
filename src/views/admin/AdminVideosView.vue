<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'

const { items: videos, loading, saving, error, create, update, remove } = useAdminCrud('/videos')

const modalOpen = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  title: '',
  youtube_url: '',
  duration: '',
  thumbnail_url: '',
  channel_name: 'Wat Tepborey Official',
  display_order: 0,
})
const form = reactive(emptyForm())

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  modalOpen.value = true
}

function openEdit(video) {
  editingId.value = video.id
  Object.assign(form, {
    title: video.title,
    youtube_url: video.youtube_url,
    duration: video.duration || '',
    thumbnail_url: video.thumbnail_url || '',
    channel_name: video.channel_name || 'Wat Tepborey Official',
    display_order: video.display_order,
  })
  modalOpen.value = true
}

async function handleSubmit() {
  const ok = editingId.value ? await update(editingId.value, form) : await create(form)
  if (ok) modalOpen.value = false
}

async function handleDelete(video) {
  if (confirm(`លុប "${video.title}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
    await remove(video.id)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-forest">វីដេអូ (Videos)</h1>
        <p class="mt-1 text-sm text-gray-500">គ្រប់គ្រងវីដេអូអប់រំធម៌</p>
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
            <th class="px-5 py-3">រូបភាព</th>
            <th class="px-5 py-3">ចំណងជើង</th>
            <th class="px-5 py-3">រយៈពេល</th>
            <th class="px-5 py-3 text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
          <tr v-if="loading">
            <td colspan="4" class="px-5 py-8 text-center text-gray-400">កំពុងផ្ទុក...</td>
          </tr>
          <tr v-else-if="!videos.length">
            <td colspan="4" class="px-5 py-8 text-center text-gray-400">មិនទាន់មានទិន្នន័យ</td>
          </tr>
          <tr v-for="video in videos" v-else :key="video.id" class="hover:bg-cream/50">
            <td class="px-5 py-3">
              <img
                :src="video.thumbnail_url || 'https://placehold.co/120x80/1A3626/F7F6F1?text=Video'"
                class="h-10 w-16 rounded object-cover"
                alt=""
              />
            </td>
            <td class="px-5 py-3 font-medium text-forest">
              <a :href="video.youtube_url" target="_blank" rel="noopener noreferrer" class="hover:underline">
                {{ video.title }}
              </a>
            </td>
            <td class="px-5 py-3 text-gray-500">{{ video.duration || '—' }}</td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-2">
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-cream hover:text-forest" @click="openEdit(video)">
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="handleDelete(video)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែវីដេអូ' : 'បន្ថែមវីដេអូថ្មី'" @close="modalOpen = false">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ចំណងជើង</label>
          <input v-model="form.title" type="text" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">តំណ YouTube</label>
          <input v-model="form.youtube_url" type="url" required placeholder="https://youtube.com/watch?v=..." class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">រយៈពេល (e.g. 15:20)</label>
            <input v-model="form.duration" type="text" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">លំដាប់ (Order)</label>
            <input v-model.number="form.display_order" type="number" min="0" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ឈ្មោះឆានែល</label>
          <input v-model="form.channel_name" type="text" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <ImageUploader v-model="form.thumbnail_url" folder="videos" label="រូបភាព Thumbnail" />

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <button type="submit" :disabled="saving" class="btn-gold w-full disabled:opacity-60">
          {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
