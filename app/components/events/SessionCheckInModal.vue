<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { Session } from '~/types'

const props = defineProps<{
  modelValue: boolean
  session: Session | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [qrCode: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const qrCode = ref('')

watch(
  () => props.modelValue,
  open => {
    if (open) qrCode.value = ''
  }
)

function handleCancel() {
  isOpen.value = false
}

function handleSubmit() {
  const code = qrCode.value.trim()
  if (!code) return
  emit('submit', code)
}
</script>

<template>
  <AppModal
    v-model="isOpen"
    max-width="md"
    align="top"
  >
    <div class="flex flex-col gap-5">
      <header class="space-y-1">
        <p class="text-sm font-medium uppercase tracking-wide text-primary-600">
          Check-in
        </p>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Live check-in
        </h2>
        <p
          v-if="session"
          class="text-sm text-gray-600 dark:text-gray-400"
        >
          {{ session.title }}
        </p>
      </header>

      <p class="text-xs text-gray-500 dark:text-gray-400">
        Scan or paste a ticket QR payload. This uses the attendance check-in endpoint and can be extended for camera-based QR later.
      </p>

      <AppInput
        v-model="qrCode"
        label="QR OR TICKET CODE"
        placeholder="Paste code"
        class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
        @keyup.enter="handleSubmit"
      />

      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          @click="handleCancel"
        >
          Cancel
        </button>
        <AppButton
          type="button"
          :loading="loading"
          :disabled="!qrCode.trim()"
          @click="handleSubmit"
        >
          Check in
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
