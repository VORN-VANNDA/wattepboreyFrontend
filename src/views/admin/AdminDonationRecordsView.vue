<script setup>
import { reactive, ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Star } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'

const { items: records, loading, saving, error, create, update, remove } = useAdminCrud('/donation-records')

const CURRENCIES = ['USD', 'KHR']

const modalOpen = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  donor_name: '',
  donor_subtitle: '',
  address: '',
  campaign: '',
  amount: '',
  currency: 'USD',
  donation_date: new Date().toISOString().slice(0, 10),
  is_featured: false,
  featured_image_url: '',
  featured_badge: '',
  featured_description: '',
  featured_tier_label: '',
  display_order: 0,
})
const form = reactive(emptyForm())

function openCreate() {
  editingId.value = null
  const maxOrder = records.value.reduce((max, r) => Math.max(max, r.display_order ?? 0), -1)
  Object.assign(form, emptyForm(), { display_order: maxOrder + 1 })
  modalOpen.value = true
}

function openEdit(record) {
  editingId.value = record.id
  Object.assign(form, {
    donor_name: record.donor_name,
    donor_subtitle: record.donor_subtitle || '',
    address: record.address || '',
    campaign: record.campaign,
    amount: record.amount,
    currency: record.currency,
    donation_date: record.donation_date,
    is_featured: !!record.is_featured,
    featured_image_url: record.featured_image_url || '',
    featured_badge: record.featured_badge || '',
    featured_description: record.featured_description || '',
    featured_tier_label: record.featured_tier_label || '',
    display_order: record.display_order || 0,
  })
  modalOpen.value = true
}

async function handleSubmit() {
  const ok = editingId.value ? await update(editingId.value, form) : await create(form)
  if (ok) modalOpen.value = false
}

async function handleDelete(record) {
  if (confirm(`លុប "${record.donor_name}"? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`)) {
    await remove(record.id)
  }
}

function formatAmount(record) {
  const n = Number(record.amount)
  const formatted = record.currency === 'USD' ? `$${n.toLocaleString()}` : `${n.toLocaleString()} ៛`
  return formatted
}

const sortedRecords = computed(() =>
  [...records.value].sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date))
)
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl text-forest">ប្រវត្តិសប្បុរសជន (Donation Records)</h1>
        <p class="mt-1 text-sm text-gray-500">គ្រប់គ្រងតារាងកំណត់ត្រាបុណ្យទាន + card សំខាន់ៗលើទំព័រសាធារណៈ</p>
      </div>
      <button type="button" class="btn-gold !py-2.5 text-sm" @click="openCreate">
        <Plus class="h-4 w-4" />
        បន្ថែមកំណត់ត្រាថ្មី
      </button>
    </div>

    <div class="mt-8 overflow-hidden rounded-xl2 border border-black/5 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-cream text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th class="px-5 py-3">ឈ្មោះសប្បុរសជន</th>
            <th class="px-5 py-3">កម្មវិធីបុណ្យ</th>
            <th class="px-5 py-3">ចំនួនប្រាក់</th>
            <th class="px-5 py-3">កាលបរិច្ឆេទ</th>
            <th class="px-5 py-3">លេចធ្លោ</th>
            <th class="px-5 py-3 text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5">
          <tr v-if="loading">
            <td colspan="6" class="px-5 py-8 text-center text-gray-400">កំពុងផ្ទុក...</td>
          </tr>
          <tr v-else-if="!records.length">
            <td colspan="6" class="px-5 py-8 text-center text-gray-400">មិនទាន់មានទិន្នន័យ</td>
          </tr>
          <tr v-for="record in sortedRecords" v-else :key="record.id" class="hover:bg-cream/50">
            <td class="px-5 py-3">
              <p class="font-medium text-forest">{{ record.donor_name }}</p>
              <p v-if="record.donor_subtitle" class="mt-0.5 text-xs text-gray-500">{{ record.donor_subtitle }}</p>
            </td>
            <td class="px-5 py-3">
              <span class="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">{{ record.campaign }}</span>
            </td>
            <td class="px-5 py-3 font-semibold text-forest">{{ formatAmount(record) }}</td>
            <td class="px-5 py-3 text-gray-500">{{ record.donation_date }}</td>
            <td class="px-5 py-3">
              <Star v-if="record.is_featured" class="h-4 w-4 fill-gold text-gold" />
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-5 py-3">
              <div class="flex justify-end gap-2">
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-cream hover:text-forest" @click="openEdit(record)">
                  <Pencil class="h-4 w-4" />
                </button>
                <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="handleDelete(record)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែកំណត់ត្រា' : 'បន្ថែមកំណត់ត្រាថ្មី'" @close="modalOpen = false">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ឈ្មោះសប្បុរសជន</label>
            <input v-model="form.donor_name" type="text" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ចំណងជើងរង (ជម្រើស)</label>
            <input v-model="form.donor_subtitle" type="text" placeholder="កុសលចេតនាព្រះឡៃ" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">អាសយដ្ឋាន (ជម្រើស)</label>
          <input v-model="form.address" type="text" placeholder="រាជធានីភ្នំពេញ" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">កម្មវិធីបុណ្យ / គោលបំណង</label>
          <input v-model="form.campaign" type="text" required placeholder="មហាកុសលសាងកុដិ" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          <p class="mt-1.5 text-xs text-gray-400">អ្នកវាយបញ្ចូលដោយខ្លួនឯង — ឧ. កសាងចាក់បេតុង, កសាងព្រះពុទ្ធរូប, កសាងសាលាធម៌</p>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ចំនួនប្រាក់</label>
            <input v-model.number="form.amount" type="number" min="0" step="0.01" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">រូបិយប័ណ្ណ</label>
            <select v-model="form.currency" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold">
              <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">កាលបរិច្ឆេទ</label>
          <input v-model="form.donation_date" type="date" required class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="form.is_featured" type="checkbox" class="h-4 w-4 rounded border-black/20 text-gold focus:ring-gold" />
          បង្ហាញជា card លេចធ្លោនៅផ្នែកខាងលើទំព័រ
        </label>

        <template v-if="form.is_featured">
          <hr class="border-black/5" />
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">ព័ត៌មាន Card លេចធ្លោ</p>

          <ImageUploader v-model="form.featured_image_url" folder="donation-records" label="រូបភាព Card" />

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ស្លាក Badge (ជ្រុងខាងលើ)</label>
            <input v-model="form.featured_badge" type="text" placeholder="កម្ពស់ប្រសិទ្ធភាពខ្ពស់" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ការពិពណ៌នា</label>
            <textarea v-model="form.featured_description" rows="3" class="w-full resize-none rounded-lg border border-black/10 px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-gold" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">ស្លាកកម្រិត (ប៊ូតុងខាងក្រោម)</label>
            <input v-model="form.featured_tier_label" type="text" placeholder="មហាកុសលសន្ទឹកសន្ទាប់" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700">លំដាប់បង្ហាញ</label>
            <input v-model.number="form.display_order" type="number" min="0" class="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
        </template>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <button type="submit" :disabled="saving" class="btn-gold w-full disabled:opacity-60">
          {{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
        </button>
      </form>
    </AdminModal>
  </div>
</template>
