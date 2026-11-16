<script setup>
import { reactive, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAdminCrud } from '../../composables/useAdminCrud'
import AdminModal from '../../components/admin/AdminModal.vue'
import ImageUploader from '../../components/admin/ImageUploader.vue'
import PdfUploader from '../../components/admin/PdfUploader.vue'
import { bookCategories, bookCategoryLabel } from '../../lib/books'
import { postImage } from '../../lib/pchumBen'
const { items, loading, saving, error, create, update, remove } = useAdminCrud('/books')
const modalOpen = ref(false)
const editingId = ref(null)
const deletingId = ref(null)
const emptyForm = () => ({ title: '', author: '', category: 'dhamma', description: '', cover_url: '', pdf_url: '', publication_year: '' })
const form = reactive(emptyForm())
function open(book) {
  editingId.value = book?.id || null
  Object.assign(form, book ? { title: book.title, author: book.author || '', category: book.category, description: book.description || '', cover_url: book.cover_url, pdf_url: book.pdf_url, publication_year: book.publication_year || '' } : emptyForm())
  error.value = null
  modalOpen.value = true
}
async function save() {
  const data = { ...form, publication_year: form.publication_year || null }
  const ok = editingId.value ? await update(editingId.value, data) : await create(data)
  if (ok) modalOpen.value = false
}
async function deleteBook(book) {
  if (deletingId.value || !confirm(`លុបសៀវភៅ «${book.title}»?`)) return
  deletingId.value = book.id
  try { await remove(book.id) } finally { deletingId.value = null }
}
</script>
<template>
  <div class="font-khmer">
    <div class="flex flex-wrap items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold text-forest">បណ្ណាល័យសៀវភៅ</h1><p class="mt-2 text-sm text-gray-500">បញ្ចូលគម្រប ឯកសារ PDF និងព័ត៌មានសៀវភៅ</p></div><button class="btn-gold" @click="open()"><Plus class="h-4 w-4" /> បន្ថែមសៀវភៅ</button></div>
    <p v-if="error && !modalOpen" class="mt-5 text-red-600" role="alert">{{ error }}</p>
    <p v-if="loading" class="py-10 text-center text-gray-500">កំពុងផ្ទុក...</p>
    <p v-else-if="!items.length" class="py-10 text-center text-gray-500">មិនទាន់មានសៀវភៅ។</p>
    <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="book in items" :key="book.id" class="flex gap-4 rounded-xl border border-black/5 bg-white p-4"><img :src="postImage(book.cover_url)" :alt="book.title" class="h-32 w-24 shrink-0 rounded-md bg-cream object-contain" /><div class="min-w-0 flex-1"><h2 class="font-semibold leading-loose text-forest">{{ book.title }}</h2><p class="text-sm text-gray-500">{{ book.author }}</p><p class="mt-1 text-xs text-gold-dark">{{ bookCategoryLabel(book.category) }}</p><div class="mt-4 flex flex-wrap gap-4"><button class="flex items-center gap-1 text-sm text-forest" @click="open(book)"><Pencil class="h-4 w-4" /> កែប្រែ</button><button :disabled="!!deletingId" class="flex items-center gap-1 text-sm text-red-600 disabled:opacity-50" @click="deleteBook(book)"><Trash2 class="h-4 w-4" /> លុប</button></div></div></article>
    </div>
    <AdminModal :open="modalOpen" :title="editingId ? 'កែប្រែសៀវភៅ' : 'បន្ថែមសៀវភៅ'" @close="!saving && (modalOpen = false)">
      <form class="space-y-5" @submit.prevent="save">
        <label class="block text-sm text-forest">ចំណងជើង<input v-model="form.title" required maxlength="255" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label>
        <div class="grid gap-4 sm:grid-cols-2"><label class="block text-sm text-forest">អ្នកនិពន្ធ<input v-model="form.author" maxlength="150" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label><label class="block text-sm text-forest">ឆ្នាំបោះពុម្ព<input v-model="form.publication_year" type="number" min="1000" max="3000" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label></div>
        <label class="block text-sm text-forest">ប្រភេទ<select v-model="form.category" required class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3"><option v-for="item in bookCategories" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>
        <label class="block text-sm text-forest">សេចក្ដីពិពណ៌នា<textarea v-model="form.description" rows="4" class="mt-2 w-full rounded-lg border border-black/10 px-4 py-3" /></label>
        <ImageUploader v-model="form.cover_url" folder="books" label="រូបគម្របសៀវភៅ" />
        <PdfUploader v-model="form.pdf_url" folder="books" label="ឯកសារសៀវភៅ PDF" />
        <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
        <button type="submit" :disabled="saving || !form.cover_url || !form.pdf_url" class="btn-gold w-full justify-center disabled:opacity-50">{{ saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកសៀវភៅ' }}</button>
      </form>
    </AdminModal>
  </div>
</template>
