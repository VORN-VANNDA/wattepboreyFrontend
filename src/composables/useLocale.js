// composables/useLocale.js
// The site is Khmer-only — this composable no longer switches languages.
// `locale` is kept (always 'kh') and `t()` is kept as the lookup function
// so existing components/views don't need to change how they call it.

import { ref, computed } from 'vue'
import translations from '../i18n/translations'

const locale = ref('kh')

function t(key) {
  return translations[key] ?? key
}

export function useLocale() {
  return {
    locale,
    isKhmer: computed(() => true),
    t,
  }
}
