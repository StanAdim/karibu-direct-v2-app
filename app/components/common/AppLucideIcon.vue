<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** e.g. `i-lucide-calendar` or `calendar` */
    name: string
    size?: number | string
    strokeWidth?: number | string
  }>(),
  {
    size: 20,
    strokeWidth: 2
  }
)

function toLucideComponentName(iName: string): string {
  const raw = iName.replace(/^i-lucide-/, '')
  return raw
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

const Icon = computed(() => {
  const key = toLucideComponentName(props.name) as keyof typeof LucideIcons
  const mod = LucideIcons as Record<string, unknown>
  const C = mod[key]
  if (typeof C === 'object' && C !== null) {
    return C as typeof LucideIcons.Activity
  }
  return LucideIcons.CircleHelp
})

const attrs = useAttrs()
const mergedClass = computed(() => {
  const c = attrs.class
  const base = 'shrink-0'
  if (!c) return base
  return Array.isArray(c) ? [base, ...c] : [base, c]
})
</script>

<template>
  <component
    :is="Icon"
    :size="size"
    :stroke-width="strokeWidth"
    :class="mergedClass"
    v-bind="{ ...attrs, class: undefined }"
  />
</template>
