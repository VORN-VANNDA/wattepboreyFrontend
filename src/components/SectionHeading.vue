<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  align: { type: String, default: 'center' }, // 'center' | 'start'
})
</script>

<template>
  <div :class="align === 'center' ? 'text-center' : 'text-left'">
    <h2
      class="section-heading font-display text-2xl leading-[1.7] text-forest sm:text-3xl"
      :class="align === 'center' ? '' : 'section-heading--start'"
    >
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mx-auto mt-5 max-w-2xl text-sm text-gray-500 sm:text-base" :class="align === 'center' ? '' : 'mx-0'">
      {{ subtitle }}
    </p>
  </div>
</template>
