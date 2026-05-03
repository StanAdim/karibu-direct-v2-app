<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, useAttrs } from 'vue'
import { appIconShouldSpin, resolveAppIcon } from '~/utils/icons'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** `i-lucide-*` key or former Material Symbols ligature name (e.g. `search`, `favorite_border`) */
    name: string
    /** Pixel size; omit to size via Tailwind (`text-lg`, `h-6 w-6`, …) */
    size?: number | string
    /** @deprecated Font Awesome uses fixed stroke; ignored */
    strokeWidth?: number | string
    spin?: boolean
  }>(),
  {
    strokeWidth: 2,
    spin: false
  }
)

const icon = computed(() => resolveAppIcon(props.name))

const spinning = computed(
  () => props.spin || appIconShouldSpin(props.name)
)

const attrs = useAttrs()

const mergedClass = computed(() => {
  const c = attrs.class
  const base = 'shrink-0'
  if (!c) return base
  return Array.isArray(c) ? [base, ...c] : [base, c]
})

const fontSizeStyle = computed(() =>
  typeof props.size === 'number' ? { fontSize: `${props.size}px`, width: '1em', height: '1em' } : undefined
)
</script>

<template>
  <FontAwesomeIcon
    :icon="icon"
    :spin="spinning"
    :style="fontSizeStyle"
    :class="mergedClass"
    v-bind="{ ...attrs, class: undefined }"
  />
</template>
