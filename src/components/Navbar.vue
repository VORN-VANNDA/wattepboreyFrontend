<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Menu, X, HeartHandshake } from 'lucide-vue-next'

const route = useRoute()
const mobileOpen = ref(false)
const scrolled = ref(false)
const isHome = computed(() => route.path === '/')
const solidNav = computed(() => !isHome.value || scrolled.value || mobileOpen.value)

const navLinks = computed(() => [
  { to: '/', label: ('ទំព័រដើម ') },
  { to: '/about', label: ('អំពីវត្ត') },
  { to: '/dhamma', label: ('សប្បុរសជន') },
  { to: '/events', label: ('ព្រឹត្តិការណ៍') },
  { to: '/gallery', label: ('បណ្តុំរូបភាព') },
  { to: '/contact', label: ('ទំនាក់ទំនង') },
])

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function closeMobile() {
  mobileOpen.value = false
}

function updateScrollState() {
  scrolled.value = window.scrollY > 24
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
})

watch(
  () => route.path,
  () => {
    closeMobile()
    updateScrollState()
  }
)
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="
      solidNav
        ? 'border-b border-black/5 bg-white/95 shadow-sm backdrop-blur'
        : 'border-b border-white/10 bg-transparent'
    "
  >
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-3" @click="closeMobile">
        <img
          src="/logo.png"
          alt="Wat Tepborey logo"
          class="h-14 w-14 rounded-full border border-gold/40 object-cover"
        />
        <span class="leading-tight">
          <span
            class="block font-display text-lg transition-colors"
            :class="solidNav ? 'text-forest' : 'text-white'"
          >
            វត្តទេពបុរី
          </span>
          <span
            class="block text-xs tracking-wide transition-colors"
            :class="solidNav ? 'text-gray-500' : 'text-white/80'"
          >
            Wat Tepborey
          </span>
        </span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="hidden items-center gap-8 md:flex">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="border-b-2 pb-1 font-khmer text-[20px] font-medium transition-colors"
          :class="
            isActive(link.to)
              ? 'border-gold text-gold'
              : solidNav
                ? 'border-transparent text-forest/70 hover:text-gold'
                : 'border-transparent text-white/90 hover:text-gold-light'
          "
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Right cluster: donate -->
<!-- Right cluster: Facebook -->
<div class="hidden items-center gap-5 md:flex">
  <a 
    href="https://www.facebook.com/share/19RV7KW4zY/?mibextid=wwXIfr" 
    target="_blank" 
    rel="noopener noreferrer" 
    class="btn-gold !px-5 !py-2.5 text-sm inline-flex items-center gap-2"
  >
    <!-- Icon Facebook -->
    <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    Facebook Page
  </a>
</div>

      <!-- Mobile menu toggle -->
      <button
        type="button"
        class="grid h-10 w-10 place-items-center rounded-lg transition-colors md:hidden"
        :class="solidNav ? 'text-forest' : 'text-white'"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        @click="mobileOpen = !mobileOpen"
      >
        <X v-if="mobileOpen" class="h-6 w-6" />
        <Menu v-else class="h-6 w-6" />
      </button>
    </div>

    <!-- Mobile panel -->
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="border-t border-black/5 bg-white px-5 pb-6 pt-2 md:hidden">
        <nav class="flex flex-col divide-y divide-black/5">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="py-3 font-khmer text-base"
            :class="isActive(link.to) ? 'font-semibold text-gold-dark' : 'text-forest/80'"
            @click="closeMobile"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="mt-4 flex justify-end">
          <RouterLink to="/contact" class="btn-gold !px-5 !py-2.5 text-sm" @click="closeMobile">
            <HeartHandshake class="h-4 w-4" />
            Facebook Page
          </RouterLink>
        </div>
      </div>
    </transition>
  </header>
</template>
