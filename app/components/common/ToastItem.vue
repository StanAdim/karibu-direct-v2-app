<script setup lang="ts">
import { computed } from 'vue'
import type { Toast } from '~/composables/useToast'

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  close: [id: string]
}>()

const typeClasses: Record<NonNullable<Toast['type']>, string> = {
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/80 dark:text-emerald-50 dark:border-emerald-700',
  error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/80 dark:text-red-50 dark:border-red-700',
  warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/80 dark:text-amber-50 dark:border-amber-700',
  info: 'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-900/80 dark:text-sky-50 dark:border-sky-700'
}

const iconMap: Record<NonNullable<Toast['type']>, string> = {
  success: 'i-lucide-check-circle',
  error: 'i-lucide-x-circle',
  warning: 'i-lucide-alert-triangle',
  info: 'i-lucide-info'
}

const toastType = computed(() => props.toast.type ?? 'info')
const containerClass = computed(() => typeClasses[toastType.value])
const iconName = computed(() => iconMap[toastType.value])

function handleClose() {
  emit('close', props.toast.id)
}
</script>

<template>
  <div
    class="pointer-events-auto w-80 rounded-lg border px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-sm"
    :class="containerClass"
  >
    <div class="flex items-start gap-3">
      <div class="mt-0.5">
        <UIcon
          :name="iconName"
          class="size-5"
        />
      </div>

      <div class="flex-1">
        <p
          v-if="toast.title"
          class="text-sm font-semibold"
        >
          {{ toast.title }}
        </p>
        <p
          v-if="toast.description"
          class="mt-0.5 text-xs leading-snug opacity-90"
        >
          {{ toast.description }}
        </p>
      </div>

      <button
        type="button"
        class="ml-2 inline-flex size-6 items-center justify-center rounded-full text-xs/none opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
        @click="handleClose"
      >
        ✕
      </button>
    </div>
  </div>
</template>

