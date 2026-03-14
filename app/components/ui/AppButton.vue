<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  color?: 'primary' | 'neutral' | 'danger' | 'success'
  size?: 'sm' | 'md'
  icon?: string
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  /** When set, renders as NuxtLink instead of button (for navigation CTAs). */
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  size: 'md',
  iconPosition: 'left',
  type: 'button',
  block: false
})

const isLink = computed(() => Boolean(props.to))
const tag = computed(() => (isLink.value ? 'NuxtLink' : 'button'))

const colorClasses: Record<Props['color'], string> = {
  primary: 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0',
  neutral: 'bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  danger: 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:-translate-y-0.5 active:translate-y-0',
  success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0'
}

const sizeClasses: Record<Props['size'], string> = {
  sm: 'px-4 py-2 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2'
}

</script>

<template>
  <component
    :is="tag"
    :type="isLink ? undefined : props.type"
    :to="isLink ? props.to : undefined"
    :class="[
      'inline-flex items-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 disabled:opacity-60 disabled:cursor-not-allowed no-underline',
      sizeClasses[props.size],
      colorClasses[props.color],
      props.block ? 'w-full justify-center' : ''
    ]"
    v-bind="$attrs"
  >
    <span
      v-if="props.icon && props.iconPosition === 'left'"
      class="material-symbols-outlined shrink-0"
      :class="props.size === 'sm' ? 'text-sm' : 'text-base'"
    >
      {{ props.icon }}
    </span>

    <span>
      <slot />
    </span>

    <span
      v-if="props.icon && props.iconPosition === 'right'"
      class="material-symbols-outlined shrink-0"
      :class="props.size === 'sm' ? 'text-sm' : 'text-base'"
    >
      {{ props.icon }}
    </span>
  </component>
</template>

