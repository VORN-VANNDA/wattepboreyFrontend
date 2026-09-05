<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2, Star } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'
import PdfUploader from '../../components/admin/PdfUploader.vue'

const { items: members, loading, saving, error, create, update, remove } = useAdminCrud('/members')

const modalOpen = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  name: '',
  name_en: '',
  role: '',
  category: 'monk',
  bio: '',
  bio_en: '',
  bio_pdf_url: '',
  image_url: '',
  display_order: 0,
  is_featured: false,
})
const form = reactive(emptyForm())

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  modalOpen.value = true
}

function openEdit(member) {
  editingId.value = member.id
  Object.assign(form, {
    name: member.name,
    name_en: member.name_en || '',
    role: member.role,
    category: member.category,
    bio: member.bio || '',
    bio_en: member.bio_en || '',
    bio_pdf_url: member.bio_pdf_url || '',
    image_url: member.image_url || '',
    display_order: member.display_order,
    is_featured: !!member.is_featured,
  })
  modalOpen.value = true
}

async function handleSubmit() {
  const ok = editingId.value ? await update(editingId.value, form) : await create(form)
  if (ok) modalOpen.value = false
}

async function handleDelete(member) {
  if (confirm(`លុប "${member.name}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
    await remove(member.id)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-forest">សមាជិក (Members)</h1>
        <p class="mt-1 text-sm text-gray-500">គ្រប់គ្រងព្រះសង្ឃ និងគណៈកម្មការវត្ត</p>
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
            <th class="px-5 py-3">ឈ្មោះ</th>
            <th class="px-5 py-3">តួនាទី</th>
            <th class="px-5 py-3">ប្រភេទ</th>
            <th class="px-5 py-3 text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
          <tr v-if="loading">
            <td colspan="5" class="px-5 py-8 text-center text-gray-400">កំពុងផ្ទុក...</td>
          </tr>
          <tr v-else-if="!members.length">
            <td colspan="5" class="px-5 py-8 text-center text-gray-400">មិនទាន់មានទិន្នន័យ</td>
          </tr>
          <tr v-for="member in members" v-else :key="member.id" class="hover:bg-cream/50">
            <td class="px-5 py-3">
              <img
                :src="member.image_url || 'https://placehold.co/100x100/2C5038/F7F6F1?text=%F0%9F%99%8F'"
                class="h-10 w-10 rounded-full object-cover"
                alt=""
              />
            </td>
            <td class="px-5 py-3 font-medium text-forest">
              <span class="flex items-center gap-1.5">
                {{ member.name }}
                <Star v-if="member.is_featured" class="h-3.5 w-3.5 fill-gold text-gold" />
              </span>
            </td>
            <td class="px-5 py-3 text-gray-500">{{ member.role }}</td>
            <td class="px-5 py-3">
              <span class="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
                {{ member.category === 'monk' ? 'ព្រះសង្ឃ' : 'គណៈកម្មការ' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-2">
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-cream hover:text-forest" @click="openEdit(member)">
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="handleDelete(member)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែសមាជិក' : 'បន្ថែមសមាជិកថ្មី'" @close="modalOpen = false">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ឈ្មោះ (Khmer)</label>
          <input v-model="form.name" type="text" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Name (English) — optional</label>
          <input v-model="form.name_en" type="text" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">តួនាទី (Role)</label>
          <input v-model="form.role" type="text" required placeholder="ព្រះគ្រូចៅអធិការ" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ប្រវត្តិរូប (Khmer)</label>
          <p class="mb-1.5 text-xs text-gray-400">អាចវាយបញ្ចូលអត្ថបទវែងបានគ្មានដែនកំណត់ (ដូចជាចម្លងពី Microsoft Word)។</p>
          <textarea
            v-model="form.bio"
            rows="12"
            placeholder="សរសេរប្រវត្តិរូបព្រះគ្រូចៅអធិការ..."
            class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-gold"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Biography (English) — optional</label>
          <textarea
            v-model="form.bio_en"
            rows="8"
            class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-gold"
          />
        </div>

        <PdfUploader v-model="form.bio_pdf_url" folder="members" label="ឯកសារ PDF ប្រវត្តិរូប (ជម្រើស)" />

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ប្រភេទ</label>
            <select v-model="form.category" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold">
              <option value="monk">ព្រះសង្ឃ (Monk)</option>
              <option value="committee">គណៈកម្មការ (Committee)</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">លំដាប់ (Order)</label>
            <input v-model.number="form.display_order" type="number" min="0" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <ImageUploader v-model="form.image_url" folder="members" label="រូបភាព" />

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="form.is_featured" type="checkbox" class="h-4 w-4 rounded border-black/20 text-gold focus:ring-gold" />
          បង្ហាញជាព្រះគ្រូចៅអធិការ (Featured / Abbot spotlight)
        </label>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <button type="submit" :disabled="saving" class="btn-gold w-full disabled:opacity-60">
          {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
