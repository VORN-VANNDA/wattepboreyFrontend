<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
})
defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      @click.self="$emit('close')"
    >
      <div class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl2 bg-white p-6 shadow-card sm:p-8">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="font-display text-lg text-forest">{{ title }}</h3>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-gray-400 transition hover:bg-cream hover:text-forest"
            @click="$emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
