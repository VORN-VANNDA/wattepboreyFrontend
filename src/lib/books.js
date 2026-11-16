export const bookCategories = [
  { value: 'dhamma', label: 'ធម៌ / Dhamma' },
  { value: 'ethics', label: 'សីលធម៌-អប់រំ / Ethics' },
  { value: 'history', label: 'ប្រវត្តិសាស្ត្រ / History' },
  { value: 'philosophy', label: 'ទស្សនវិជ្ជា / Philosophy' },
]
export const bookCategoryLabel = value => bookCategories.find(item => item.value === value)?.label || 'សៀវភៅ'

export function bookPdfPreviewUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    if (url.hostname === 'drive.google.com') {
      const id = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.searchParams.get('id')
      return id && /^[a-zA-Z0-9_-]+$/.test(id) ? `https://drive.google.com/file/d/${id}/preview` : ''
    }
    return url.href
  } catch { return '' }
}
