<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
    src: null
  }
)

const imgError = ref(false)

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base'
}

const initials = computed(() => {
  const parts = props.alt.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]![0] + parts[1]![0]).toUpperCase()
  }
  if (parts[0]) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return '?'
})

function onImgError() {
  imgError.value = true
}

watch(
  () => props.src,
  () => {
    imgError.value = false
  }
)

const attrs = useAttrs()
const rootClass = computed(() => attrs.class)
</script>

<template>
  <span
    class="inline-flex shrink-0 rounded-full"
    :class="rootClass"
  >
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt"
      :class="[
        'rounded-full object-cover ring-2 ring-white dark:ring-slate-800',
        sizeClasses[size]
      ]"
      v-bind="{ ...attrs, class: undefined }"
      @error="onImgError"
    >
    <div
      v-else
      :class="[
        'flex items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 ring-2 ring-white dark:bg-primary-950/50 dark:text-primary-300 dark:ring-slate-800',
        sizeClasses[size]
      ]"
      v-bind="{ ...attrs, class: undefined }"
    >
      {{ initials }}
    </div>
  </span>
</template>
