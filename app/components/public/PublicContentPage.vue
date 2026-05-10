<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  eyebrow?: string
}

defineProps<Props>()
</script>

<template>
  <div class="public-container public-section">
    <div class="mx-auto max-w-3xl">
      <header class="mb-8 md:mb-10">
        <p v-if="eyebrow" class="public-eyebrow">
          {{ eyebrow }}
        </p>
        <h1 class="public-heading-xl mt-2">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="public-prose-muted mt-3 max-w-2xl">
          {{ subtitle }}
        </p>
      </header>
      <div
        class="public-card-surface space-y-4 p-6 text-sm leading-relaxed text-slate-600 md:p-10 md:text-base dark:text-slate-300"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
