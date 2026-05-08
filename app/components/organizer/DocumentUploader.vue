<script setup lang="ts">
import type { OrganizationDocumentKind } from '~/types/organizer'

const props = defineProps<{
  label: string
  description?: string
  kind: OrganizationDocumentKind
  accept: string
  maxBytes: number
  existingUrl?: string | null
  disabled?: boolean
  progress?: number | null
  error?: string | null
}>()

const emit = defineEmits<{
  select: [file: File]
  retry: []
}>()

const dragOver = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const localError = ref<string | null>(null)

function validateFile(file: File): string | null {
  if (file.size > props.maxBytes) {
    const mb = (props.maxBytes / (1024 * 1024)).toFixed(1)
    return `File is too large (max ${mb} MB).`
  }
  return null
}

function onFile(file: File | null | undefined): void {
  localError.value = null
  if (!file) return
  const err = validateFile(file)
  if (err) {
    localError.value = err
    return
  }
  emit('select', file)
}

function onDrop(e: DragEvent): void {
  dragOver.value = false
  if (props.disabled) return
  const f = e.dataTransfer?.files?.[0]
  if (f) onFile(f)
}

function onInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  onFile(f ?? null)
  input.value = ''
}

function openPicker(): void {
  if (props.disabled) return
  inputRef.value?.click()
}

const showError = computed(() => props.error || localError.value)
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="text-sm font-semibold text-slate-900 dark:text-white">
          {{ label }}
        </p>
        <p
          v-if="description"
          class="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
        >
          {{ description }}
        </p>
      </div>
      <button
        v-if="existingUrl && !disabled"
        type="button"
        class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        @click.stop="emit('retry')"
      >
        Replace
      </button>
    </div>

    <div
      role="button"
      tabindex="0"
      :class="[
        'rounded-2xl border-2 border-dashed transition-colors p-4 text-center cursor-pointer outline-none',
        dragOver
          ? 'border-primary-500 bg-primary-500/5'
          : 'border-slate-200 dark:border-slate-700 hover:border-primary-400/60 bg-slate-50/50 dark:bg-slate-800/40',
        disabled ? 'opacity-60 pointer-events-none' : ''
      ]"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @click="openPicker"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="inputRef"
        type="file"
        class="sr-only"
        :accept="accept"
        :disabled="disabled"
        @change="onInput"
      >
      <AppLucideIcon
        name="upload"
        class="text-2xl text-slate-400 mx-auto"
      />
      <p class="text-sm text-slate-600 dark:text-slate-300 mt-2">
        Drag & drop or click to upload
      </p>
      <p
        v-if="progress != null && progress >= 0 && progress < 100"
        class="text-xs font-medium text-primary-600 mt-2"
      >
        Uploading… {{ progress }}%
      </p>
    </div>

    <div
      v-if="existingUrl"
      class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900"
    >
      <a
        :href="existingUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm font-semibold text-primary-600 dark:text-primary-400 truncate flex-1 min-w-0"
      >
        View current file
      </a>
      <AppLucideIcon
        name="open_in_new"
        class="text-slate-400 shrink-0"
      />
    </div>

    <p
      v-if="showError"
      class="text-xs font-medium text-red-600 dark:text-red-400"
    >
      {{ showError }}
    </p>
  </div>
</template>
