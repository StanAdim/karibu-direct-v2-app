<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    placeholder?: string
    id?: string
    /** Lucide-style name, e.g. i-lucide-search */
    iconName?: string
  }>(),
  {
    placeholder: '',
    id: undefined,
    iconName: 'i-lucide-search'
  }
)

const attrs = useAttrs()
const rootClass = computed(() => ['relative w-full', attrs.class].filter(Boolean))
</script>

<template>
  <div
    :class="rootClass"
    v-bind="{ ...attrs, class: undefined }"
  >
    <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
      <AppLucideIcon
        :name="iconName"
        :size="18"
      />
    </span>
    <input
      :id="id"
      v-model="model"
      type="search"
      autocomplete="off"
      :placeholder="placeholder"
      class="w-full rounded-2xl border-0 bg-sky-50/80 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-inner ring-1 ring-slate-200/60 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-slate-800/80 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-primary-500"
    >
  </div>
</template>
