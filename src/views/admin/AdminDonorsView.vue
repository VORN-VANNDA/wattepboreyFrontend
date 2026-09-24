<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'

const { items: donors, loading, saving, error, create, update, remove } = useAdminCrud('/donors')

const ROLE_OPTIONS = [
  'មហាពុទ្ធសាសនូបត្ថម្ភ',
  'នាមសប្បុរស',
  'មហាឧបាសិកា',
  'មហាឧបាសក',
  'ឧបាសិកា',
  'ឧបាសក',
]

const modalOpen = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  name: '',
  role: 'នាមសប្បុរស',
  description: '',
  image_url: '',
  display_order: 0,
})
const form = reactive(emptyForm())

function openCreate() {
  editingId.value = null
  const maxOrder = donors.value.reduce((max, d) => Math.max(max, d.display_order ?? 0), -1)
  Object.assign(form, emptyForm(), { display_order: maxOrder + 1 })
  modalOpen.value = true
}

function openEdit(donor) {
  editingId.value = donor.id
  Object.assign(form, {
    name: donor.name,
    role: donor.role,
    description: donor.description || '',
    image_url: donor.image_url || '',
    display_order: donor.display_order || 0,
  })
  modalOpen.value = true
}

async function handleSubmit() {
  const ok = editingId.value ? await update(editingId.value, form) : await create(form)
  if (ok) modalOpen.value = false
}

async function handleDelete(donor) {
  if (confirm(`លុប "${donor.name}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
    await remove(donor.id)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-forest">សប្បុរសជន (Donors)</h1>
        <p class="mt-1 text-sm text-gray-500">គ្រប់គ្រងបញ្ជីសប្បុរសជនបង្ហាញលើទំព័រ "សប្បុរសជន"</p>
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
            <th class="px-5 py-3 text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
          <tr v-if="loading">
            <td colspan="4" class="px-5 py-8 text-center text-gray-400">កំពុងផ្ទុក...</td>
          </tr>
          <tr v-else-if="!donors.length">
            <td colspan="4" class="px-5 py-8 text-center text-gray-400">មិនទាន់មានទិន្នន័យ</td>
          </tr>
          <tr v-for="donor in donors" v-else :key="donor.id" class="hover:bg-cream/50">
            <td class="px-5 py-3">
              <img
                :src="donor.image_url || 'https://placehold.co/100x100/2C5038/F7F6F1?text=%F0%9F%99%8F'"
                class="h-10 w-10 rounded-full object-cover"
                alt=""
              />
            </td>
            <td class="px-5 py-3">
              <p class="font-medium text-forest">{{ donor.name }}</p>
              <p v-if="donor.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ donor.description }}</p>
            </td>
            <td class="px-5 py-3">
              <span class="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
                {{ donor.role }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-2">
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-cream hover:text-forest" @click="openEdit(donor)">
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="handleDelete(donor)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែសប្បុរសជន' : 'បន្ថែមសប្បុរសជនថ្មី'" @close="modalOpen = false">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ឈ្មោះ</label>
          <input v-model="form.name" type="text" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">តួនាទី</label>
          <select v-model="form.role" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold">
            <option v-for="option in ROLE_OPTIONS" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">ពិពណ៌នា (ជម្រើស)</label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="សរសេរអំពីការឧបត្ថម្ភរបស់លោក/លោកស្រី..."
            class="w-full resize-none rounded-lg border border-black/10 px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-gold"
          />
        </div>

        <ImageUploader v-model="form.image_url" folder="donors" label="រូបភាព" />

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <button type="submit" :disabled="saving" class="btn-gold w-full disabled:opacity-60">
          {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
