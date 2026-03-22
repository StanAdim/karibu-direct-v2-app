<script setup lang="ts">
import { computed } from 'vue'
import type { ConfirmOptions } from '~/composables/useConfirmDialog'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'

interface Props {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmOptions['variant']
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const variantConfig = computed(() => {
  const configs = {
    danger: {
      icon: 'warning',
      iconWrap: 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400',
      confirmColor: 'danger' as const
    },
    warning: {
      icon: 'error_outline',
      iconWrap: 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400',
      confirmColor: 'primary' as const
    },
    info: {
      icon: 'info',
      iconWrap: 'bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400',
      confirmColor: 'primary' as const
    }
  }
  return configs[props.variant]
})

/** Warning uses primary color with amber styling (AppButton has no built-in warning). */
const confirmButtonClasses = computed(() => {
  if (props.variant !== 'warning') return ''
  return '!bg-amber-500 !text-white shadow-lg shadow-amber-500/25 hover:!bg-amber-600 hover:!-translate-y-0.5 active:!translate-y-0 focus-visible:!ring-amber-400'
})

function handleClose() {
  if (!props.loading) {
    emit('update:open', false)
    emit('cancel')
  }
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <AppModal
    :model-value="open"
    max-width="sm"
    align="center"
    @update:model-value="(v) => { if (!v) handleClose() }"
  >
    <div class="pr-10">
      <div class="flex items-start gap-4">
        <div
          :class="[
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
            variantConfig.iconWrap
          ]"
        >
          <span class="material-symbols-outlined text-[26px] leading-none">
            {{ variantConfig.icon }}
          </span>
        </div>

        <div class="min-w-0 flex-1 pt-0.5">
          <h3 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {{ title }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {{ message }}
          </p>
        </div>
      </div>

      <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <AppButton
          color="neutral"
          block
          class="sm:block sm:w-auto"
          :disabled="loading"
          @click="handleClose"
        >
          {{ cancelText }}
        </AppButton>
        <AppButton
          :color="variantConfig.confirmColor"
          block
          class="sm:block sm:w-auto"
          :class="confirmButtonClasses"
          :disabled="loading"
          @click="handleConfirm"
        >
          <span
            v-if="loading"
            class="material-symbols-outlined shrink-0 animate-spin text-base"
          >
            progress_activity
          </span>
          <span>{{ confirmText }}</span>
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
