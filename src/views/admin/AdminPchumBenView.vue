<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import api from '../../lib/api'
import { postImage, postDate } from '../../lib/pchumBen'

const { items, loading, saving, error, create, update, remove } = useAdminCrud('/pchum-ben')
const modalOpen = ref(false)
const editingId = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const deletingId = ref(null)
const emptyForm = () => ({ title: '', event_date: '', excerpt: '', description: '', images: [] })
const form = reactive(emptyForm())
function open(post = null) {
  editingId.value = post?.id || null
  Object.assign(form, post ? { title: post.title, event_date: post.event_date, excerpt: post.excerpt, description: post.description, images: [...post.images] } : emptyForm())
  error.value = null
  uploadError.value = ''
  modalOpen.value = true
}
function close() { if (!saving.value && !uploading.value) modalOpen.value = false }
async function save() {
  if (uploading.value || saving.value) return
  if (!form.images.length) { uploadError.value = 'សូមបញ្ចូលរូបភាពយ៉ាងតិចមួយសន្លឹក'; return }
  const payload = { ...form, images: [...form.images] }
  const ok = editingId.value ? await update(editingId.value, payload) : await create(payload)
  if (ok) modalOpen.value = false
}
async function upload(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  if (files.length + form.images.length > 20) {
    uploadError.value = 'អាចបញ្ចូលរូបភាពបានច្រើនបំផុត 20 សន្លឹក'
    event.target.value = ''
    return
  }
  uploading.value = true
  uploadError.value = ''
  try {
    for (const file of files) {
      const body = new FormData()
      body.append('file', file)
      const response = await api.post('/upload?folder=events&type=image', body)
      form.images.push(response.data.data.url)
    }
  } catch (err) {
    uploadError.value = err?.response?.data?.message || 'មិនអាចបញ្ចូលរូបភាពបាន។ សូមព្យាយាមម្ដងទៀត។'
  } finally { uploading.value = false; event.target.value = '' }
}
function cover(index) { const [url] = form.images.splice(index, 1); form.images.unshift(url) }
async function deletePost(post) {
  if (deletingId.value || !confirm(`លុប «${post.title}»?`)) return
  deletingId.value = post.id
  try { await remove(post.id) } finally { deletingId.value = null }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div><h1 class="font-display text-2xl text-forest">ពិធីបុណ្យកាន់បិណ្ឌ</h1><p class="mt-2 text-sm text-gray-500">គ្រប់គ្រងព័ត៌មាន និងរូបភាពដែលបង្ហាញខាងក្រោម slide នៅទំព័រដើម</p></div>
      <button class="btn-gold" @click="open()"><Plus class="h-4 w-4" /> បន្ថែមថ្មី</button>
    </div>
    <p v-if="error && !modalOpen" class="mt-5 text-red-600" role="alert">{{ error }}</p>
    <p v-if="loading" class="py-10 text-center text-gray-500">កំពុងផ្ទុក...</p>
    <p v-else-if="!items.length" class="py-10 text-center text-gray-500">មិនទាន់មានព័ត៌មាន។ ចុច «បន្ថែមថ្មី» ដើម្បីបញ្ចូល។</p>
    <div v-else class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="post in items" :key="post.id" class="overflow-hidden rounded-2xl border border-black/5 bg-white">
        <img :src="postImage(post.images[0])" :alt="post.title" class="aspect-video w-full object-cover" />
        <div class="p-5"><h2 class="font-display text-forest">{{ post.title }}</h2><p class="mt-2 text-xs text-gray-500">{{ postDate(post.event_date) }} · {{ post.images.length }} រូបភាព</p>
          <div class="mt-4 flex gap-3"><button class="inline-flex items-center gap-1 text-sm text-forest" @click="open(post)"><Pencil class="h-4 w-4" /> កែប្រែ</button><button :disabled="!!deletingId" class="inline-flex items-center gap-1 text-sm text-red-600 disabled:opacity-50" @click="deletePost(post)"><Trash2 class="h-4 w-4" /> លុប</button></div>
        </div>
      </article>
    </div>
    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែព័ត៌មានពិធីបុណ្យកាន់បិណ្ឌ' : 'បន្ថែមព័ត៌មានពិធីបុណ្យកាន់បិណ្ឌ'" @close="close">
      <form class="space-y-5" @submit.prevent="save">
        <fieldset :disabled="saving || uploading" class="space-y-5 disabled:opacity-70">
          <label class="block text-sm text-forest">ចំណងជើង<input v-model="form.title" required maxlength="255" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label>
          <label class="block text-sm text-forest">កាលបរិច្ឆេទ<input v-model="form.event_date" required type="date" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label>
          <label class="block text-sm text-forest">អត្ថបទខ្លីសម្រាប់ card<textarea v-model="form.excerpt" maxlength="500" rows="2" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label>
          <label class="block text-sm text-forest">ព័ត៌មានលម្អិត<textarea v-model="form.description" rows="7" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label>
          <div>
            <p class="text-sm font-medium text-forest">រូបភាព ({{ form.images.length }}/20)</p>
            <p class="mt-1 text-xs text-gray-500">រូបទីមួយបង្ហាញលើ card។ អាចជ្រើសរើសរូបភាពច្រើនក្នុងពេលតែមួយ។</p>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" class="mt-3 block w-full text-sm" :disabled="form.images.length >= 20" @change="upload" />
            <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div v-for="(url, index) in form.images" :key="`${url}-${index}`" class="overflow-hidden rounded-lg border border-black/10">
                <img :src="postImage(url)" :alt="`រូបភាព ${index + 1}`" class="aspect-video w-full object-cover" />
                <div class="flex flex-wrap justify-between gap-2 p-2 text-xs"><button type="button" :disabled="index === 0" class="text-forest" @click="cover(index)">{{ index === 0 ? 'រូបលើ card' : 'ដាក់លើ card' }}</button><button type="button" class="text-red-600" @click="form.images.splice(index, 1)">លុប</button></div>
              </div>
            </div>
          </div>
        </fieldset>
        <p v-if="uploading" class="text-sm text-gray-500" role="status">កំពុងបញ្ចូលរូបភាព...</p>
        <p v-if="uploadError || error" class="text-sm text-red-600" role="alert">{{ uploadError || error }}</p>
        <button type="submit" :disabled="saving || uploading" class="btn-gold w-full justify-center disabled:opacity-50">{{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}</button>
      </form>
    </AdminModal>
  </div>
</template>
