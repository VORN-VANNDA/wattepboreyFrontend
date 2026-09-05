<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'

const { items: events, loading, saving, error, create, update, remove } = useAdminCrud('/events')

const modalOpen = ref(false)
const editingId = ref(null)

const statusLabels = { upcoming: 'ខាងមុខ', weekly: 'ប្រចាំសប្តាហ៍', past: 'បានបញ្ចប់' }

const emptyForm = () => ({
  title: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location: 'Wat Tepborey',
  description: '',
  image_url: '',
  status: 'upcoming',
  recurrence: '',
})
const form = reactive(emptyForm())

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  modalOpen.value = true
}

function openEdit(event) {
  editingId.value = event.id
  Object.assign(form, {
    title: event.title,
    event_date: event.event_date || '',
    start_time: event.start_time || '',
    end_time: event.end_time || '',
    location: event.location || 'Wat Tepborey',
    description: event.description || '',
    image_url: event.image_url || '',
    status: event.status,
    recurrence: event.recurrence || '',
  })
  modalOpen.value = true
}

async function handleSubmit() {
  const payload = { ...form, event_date: form.event_date || null, recurrence: form.recurrence || null }
  const ok = editingId.value ? await update(editingId.value, payload) : await create(payload)
  if (ok) modalOpen.value = false
}

async function handleDelete(event) {
  if (confirm(`លុប "${event.title}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
    await remove(event.id)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-forest">ព្រឹត្តិការណ៍ (Events)</h1>
        <p class="mt-1 text-sm text-gray-500">គ្រប់គ្រងកម្មវិធីបុណ្យទាន និងព្រឹត្តិការណ៍</p>
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
            <th class="px-5 py-3">ចំណងជើង</th>
            <th class="px-5 py-3">កាលបរិច្ឆេទ</th>
            <th class="px-5 py-3">ស្ថានភាព</th>
            <th class="px-5 py-3 text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
          <tr v-if="loading">
            <td colspan="4" class="px-5 py-8 text-center text-gray-400">កំពុងផ្ទុក...</td>
          </tr>
          <tr v-else-if="!events.length">
            <td colspan="4" class="px-5 py-8 text-center text-gray-400">មិនទាន់មានទិន្នន័យ</td>
          </tr>
          <tr v-for="event in events" v-else :key="event.id" class="hover:bg-cream/50">
            <td class="px-5 py-3 font-medium text-forest">{{ event.title }}</td>
            <td class="px-5 py-3 text-gray-500">{{ event.recurrence || event.event_date || '—' }}</td>
            <td class="px-5 py-3">
              <span class="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
                {{ statusLabels[event.status] }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-2">
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-cream hover:text-forest" @click="openEdit(event)">
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="handleDelete(event)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminModal  :open="modalOpen" :title="editingId ? 'កែប្រែព្រឹត្តិការណ៍' : 'បន្ថែមព្រឹត្តិការណ៍ថ្មី'" @close="modalOpen = false" >
      <form class="space-y-5 " @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ចំណងជើង</label>
          <input v-model="form.title" type="text" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ស្ថានភាព</label>
          <select v-model="form.status" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold">
            <option value="upcoming">ខាងមុខ (Upcoming — has a date)</option>
            <option value="weekly">ប្រចាំសប្តាហ៍ (Weekly — recurring)</option>
            <option value="past">បានបញ្ចប់ (Past)</option>
          </select>
        </div>

        <div v-if="form.status !== 'weekly'">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">កាលបរិច្ឆេទ</label>
          <input v-model="form.event_date" type="date" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>
        <div v-else>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ភាពញឹកញាប់ (e.g. "Every Sunday")</label>
          <input v-model="form.recurrence" type="text" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ម៉ោងចាប់ផ្តើម</label>
            <input v-model="form.start_time" type="time" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ម៉ោងបញ្ចប់</label>
            <input v-model="form.end_time" type="time" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ទីតាំង</label>
          <input v-model="form.location" type="text" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ការពិពណ៌នា</label>
          <textarea v-model="form.description" rows="3" class="w-full resize-none rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <ImageUploader v-model="form.image_url" folder="events" label="រូបភាព" />

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <button type="submit" :disabled="saving" class="btn-gold w-full disabled:opacity-60">
          {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
