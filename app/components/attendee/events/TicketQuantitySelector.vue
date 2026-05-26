<script setup lang="ts">
interface Props {
  modelValue: number
  min?: number
  max: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function inc() {
  if (props.disabled) return
  if (props.modelValue >= props.max) return
  emit('update:modelValue', props.modelValue + 1)
}

function dec() {
  if (props.disabled) return
  if (props.modelValue <= props.min) return
  emit('update:modelValue', props.modelValue - 1)
}
</script>

<template>
  <div
    class="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-sm"
    :class="disabled ? 'opacity-50 pointer-events-none' : ''"
  >
    <button
      type="button"
      class="size-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary-500 hover:text-white transition-colors disabled:opacity-40"
      :disabled="disabled || modelValue <= min"
      aria-label="Decrease quantity"
      @click="dec"
    >
      <AppLucideIcon name="remove" class="text-lg" />
    </button>
    <span class="min-w-[2rem] text-center font-bold tabular-nums text-slate-900 dark:text-white">{{ modelValue }}</span>
    <button
      type="button"
      class="size-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary-500 hover:text-white transition-colors disabled:opacity-40"
      :disabled="disabled || modelValue >= max"
      aria-label="Increase quantity"
      @click="inc"
    >
      <AppLucideIcon name="add" class="text-lg" />
    </button>
  </div>
</template>
