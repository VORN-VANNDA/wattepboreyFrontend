export const newsCategories = [
  { value: 'ceremony', label: 'ព្រឹត្តិការណ៍ / បុណ្យទាន' },
  { value: 'announcement', label: 'សេចក្ដីជូនដំណឹង' },
  { value: 'community', label: 'សកម្មភាពសង្គម' },
  { value: 'dharma', label: 'អត្ថបទធម្មៈ' },
  { value: 'media', label: 'រូបភាព និងវីដេអូ' },
]
export const categoryLabel = value => newsCategories.find(item => item.value === value)?.label || 'ព័ត៌មាន'
export function dateParts(value) {
  if (!value) return { day: '—', month: '' }
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return { day: date.getDate().toString().padStart(2, '0'), month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() }
}
