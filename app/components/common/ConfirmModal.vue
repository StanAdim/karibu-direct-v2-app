<script setup lang="ts">
interface Props {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
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
      icon: 'i-lucide-alert-triangle',
      iconColor: 'text-red-500',
      buttonColor: 'error' as const
    },
    warning: {
      icon: 'i-lucide-alert-circle',
      iconColor: 'text-amber-500',
      buttonColor: 'warning' as const
    },
    info: {
      icon: 'i-lucide-info',
      iconColor: 'text-blue-500',
      buttonColor: 'primary' as const
    }
  }
  return configs[props.variant]
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
  <UModal
    :model-value="open"
    @update:model-value="handleClose"
  >
    <template #content>
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div
            :class="[
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
              variant === 'danger' ? 'bg-red-100 dark:bg-red-950' : '',
              variant === 'warning' ? 'bg-amber-100 dark:bg-amber-950' : '',
              variant === 'info' ? 'bg-blue-100 dark:bg-blue-950' : ''
            ]"
          >
            <UIcon
              :name="variantConfig.icon"
              :class="['h-6 w-6', variantConfig.iconColor]"
            />
          </div>

          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ title }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ message }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="outline"
            :disabled="loading"
            @click="handleClose"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            :color="variantConfig.buttonColor"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
