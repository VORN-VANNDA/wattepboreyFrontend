export const bookCategories = [
  { value: 'dhamma', label: 'ធម៌ / Dhamma' },
  { value: 'ethics', label: 'សីលធម៌-អប់រំ / Ethics' },
  { value: 'history', label: 'ប្រវត្តិសាស្ត្រ / History' },
  { value: 'philosophy', label: 'ទស្សនវិជ្ជា / Philosophy' },
]
export const bookCategoryLabel = value => bookCategories.find(item => item.value === value)?.label || 'សៀវភៅ'
