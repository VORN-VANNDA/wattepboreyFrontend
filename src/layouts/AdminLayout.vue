<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import {
  Users,
  PanelsTopLeft,
  CalendarDays,
  Video,
  Image as ImageIcon,
  HeartHandshake,
  BookOpen,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

const { admin, logout } = useAuth()
const router = useRouter()

const navItems = [
  { to: '/admin/members', label: 'សមាជិក (Members)', icon: Users },
  { to: '/admin/slides', label: 'ស្លាយទំព័រដើម (Slides)', icon: PanelsTopLeft },
  { to: '/admin/events', label: 'ព្រឹត្តិការណ៍ (Events)', icon: CalendarDays },
  { to: '/admin/videos', label: 'វីដេអូ (Videos)', icon: Video },
  { to: '/admin/gallery', label: 'រូបភាព (Gallery)', icon: ImageIcon },
  { to: '/admin/donors', label: '🙏 នាមសប្បុរស (Donors)', icon: HeartHandshake },
  { to: '/admin/donation-records', label: 'ប្រវត្តិសប្បុរសជន (Records)', icon: BookOpen },
  { to: '/admin/messages', label: 'សារទំនាក់ទំនង (Messages)', icon: Mail },
  { to: '/admin/settings', label: 'ការកំណត់ (Settings)', icon: Settings },
]

function handleLogout() {
  logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-cream">
    <!-- Sidebar -->
    <aside class="flex w-64 shrink-0 flex-col bg-forest-dark text-white/80">
      <div class="border-b border-white/10 px-6 py-6">
        <p class="font-display text-lg text-gold">វត្តទេពបុរី</p>
        <p class="text-xs text-white/40">Admin Dashboard</p>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-6">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          active-class="bg-white/10 text-gold"
          exact-active-class="bg-white/10 text-gold"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="space-y-1 border-t border-white/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5"
        >
          <ExternalLink class="h-4 w-4" />
          មើលគេហទំព័រ
        </a>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/60 transition-colors hover:bg-white/5"
          @click="handleLogout"
        >
          <LogOut class="h-4 w-4" />
          ចាកចេញ ({{ admin?.username }})
        </button>
      </div>
    </aside>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-8">
      <RouterView />
    </main>
  </div>
</template>
