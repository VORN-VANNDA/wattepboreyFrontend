ប្រវត្តិវត្តទេពបូរី<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

// The admin dashboard (AdminLoginView + AdminLayout's own children) renders
// its own full-page chrome — the public Navbar/Footer would be redundant
// and visually wrong there, so only show them on public-site routes.
const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const isHomeRoute = computed(() => route.path === '/')
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Navbar v-if="!isAdminRoute" />
    <main class="flex-1" :class="!isAdminRoute && !isHomeRoute ? 'pt-20' : ''">
      <!-- key by path so page-level fetches re-run on route change -->
      <RouterView v-slot="{ Component, route: r }">
        <component :is="Component" :key="r.path" />
      </RouterView>
    </main>
    <Footer v-if="!isAdminRoute" />
  </div>
</template>
