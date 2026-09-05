<script setup>
import { RouterLink } from 'vue-router'
// ១. ប្តូរ Instagram ទៅជា Send (Icon Telegram)
import { Phone, MapPin, Facebook, Youtube, Send } from 'lucide-vue-next'

const quickLinks = [
  { to: '/about', label: 'អំពីវត្ត' },
  { to: '/dhamma', label: 'ធម្មៈ' },
  { to: '/events', label: 'ព្រឹត្តិការណ៍' },
  { to: '/gallery', label: 'វិចិត្រសាល' },
  { to: '/contact', label: 'ទំនាក់ទំនង' },
]

// ២. ប្តូរ icon និង label ទៅជា Telegram
const socialLinks = [
  { href: 'https://www.facebook.com/share/19RV7KW4zY/?mibextid=wwXIfr', icon: Facebook, label: 'Facebook' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
  { href: 'https://t.me/VornVannda', icon: Send, label: 'Telegram' },
]

const year = new Date().getFullYear()
</script>

<template>
  <div class="border-t border-white/10 opacity-75"></div>

  <footer class="bg-forest-dark text-white/80">
    <div class="mx-auto max-w-7xl px-5 py-5">
      <div class="grid grid-cols-1 gap-12 md:grid-cols-3">

        <!-- Column 1: identity + contact -->
        <div>
          <h3 class="font-display text-xl text-gold">
            វត្តទេពបុរី
          </h3>

          <p class="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            វត្តទេពបុរី ជាទីកន្លែងសម្រាប់សិក្សាព្រះធម៌
            អប់រំ និងចូលរួមសកម្មភាពសាសនា និងសង្គម។
          </p>

          <div class="mt-5 space-y-2.5 text-sm">

            <p class="flex items-center gap-2.5 text-white/70">
              <Phone class="h-4 w-4 shrink-0 text-gold" />
              +855 107 990 80
            </p>

            <p class="flex items-start gap-2.5 text-white/70">
              <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-gold" />

              <span>
                ភូមិខ្នារ, ឃុំក្រាំងធ្នង់, ស្រុកចាទី,
                ខេត្តតាកែវ
              </span>
            </p>

          </div>
        </div>

        <!-- Column 2: quick links -->
        <div>
          <h4 class="font-khmer text-base font-semibold text-white">
            តំណភ្ជាប់រហ័ស
          </h4>

          <ul class="mt-4 space-y-2.5 text-sm">
            <li v-for="link in quickLinks" :key="link.to">
              <RouterLink :to="link.to" class="text-white/60 transition-colors hover:text-gold">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Column 3: social + donate -->
        <div>
          <h4 class="font-khmer text-base font-semibold text-white">
            បណ្តាញសង្គម
          </h4>

          <div class="mt-4 flex gap-3">
            <a v-for="social in socialLinks" :key="social.label" :href="social.href" target="_blank"
              rel="noopener noreferrer" :aria-label="social.label"
              class="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-gold hover:text-forest-dark">
              <component :is="social.icon" class="h-4 w-4" />
            </a>
          </div>

          <a href="https://www.facebook.com/share/19RV7KW4zY/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
            class="btn-gold mt-5 !px-5 !py-2.5 text-sm inline-flex items-center gap-2">
            Facebook Page
          </a>
        </div>

      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-white/10"></div>

    <!-- Copyright -->
    <div class="mx-auto max-w-7xl px-5 py-5 lg:px-10">
      <p class="flex flex-wrap items-center justify-center gap-x-3 text-center text-xs text-white/40">
        <span>
          © {{ year }} វត្តទេពបុរី. រក្សាសិទ្ធិគ្រប់យ៉ាង។
        </span>

        <span class="text-white/20">·</span>

        <RouterLink to="/admin/login" class="hover:text-white/60">
          Admin
        </RouterLink>
      </p>
    </div>

  </footer>
</template>