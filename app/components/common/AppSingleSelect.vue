<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

const model = defineModel<string | null>({ default: null })

const props = withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    disabled?: boolean
    placeholder?: string
    options: SelectOption[]
    showSelectedChip?: boolean
    searchable?: boolean
    searchPlaceholder?: string
  }>(),
  {
    label: 'Select item',
    hint: undefined,
    error: undefined,
    disabled: false,
    placeholder: 'Select an option',
    showSelectedChip: true,
    searchable: false,
    searchPlaceholder: 'Search options...'
  }
)

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const searchQuery = ref('')

onClickOutside(root, () => {
  open.value = false
  searchQuery.value = ''
})

const selectedOption = computed(() => {
  const selected = model.value
  if (!selected) return null
  return props.options.find(option => option.value === selected) ?? null
})

const displayText = computed(() => selectedOption.value?.label ?? props.placeholder)
const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(option =>
    option.label.toLowerCase().includes(q)
    || option.value.toLowerCase().includes(q)
  )
})

function selectOption(option: SelectOption) {
  if (props.disabled || option.disabled) return
  model.value = option.value
  searchQuery.value = ''
  open.value = false
}

function clearSelection() {
  if (props.disabled) return
  model.value = null
}

function toggleOpen() {
  open.value = !open.value
  if (!open.value) {
    searchQuery.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
      {{ label }}
    </label>
    <p
      v-if="hint"
      class="text-xs text-slate-500 dark:text-slate-400 ml-1 -mt-0.5"
    >
      {{ hint }}
    </p>

    <div
      ref="root"
      class="relative"
    >
      <button
        type="button"
        class="flex w-full min-h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600"
        :disabled="disabled"
        :class="error ? 'border-red-500 dark:border-red-500' : ''"
        @click="toggleOpen"
      >
        <span :class="selectedOption ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'">
          {{ displayText }}
        </span>
        <UIcon
          name="i-lucide-chevron-down"
          class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
          :class="{ 'rotate-180': open }"
        />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="open"
          class="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div
            v-if="searchable"
            class="sticky top-0 z-10 border-b border-slate-200 bg-white px-2 pb-2 pt-1 dark:border-slate-700 dark:bg-slate-800"
          >
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
          </div>

          <p
            v-if="options.length === 0"
            class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400"
          >
            No options available.
          </p>
          <p
            v-else-if="filteredOptions.length === 0"
            class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400"
          >
            No matching options.
          </p>

          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 dark:hover:bg-slate-700/80"
            :disabled="option.disabled"
            @click="selectOption(option)"
          >
            <span>{{ option.label }}</span>
            <UIcon
              v-if="model === option.value"
              name="i-lucide-check"
              class="h-4 w-4 text-primary-600 dark:text-primary-400"
            />
          </button>
        </div>
      </Transition>
    </div>

    <div
      v-if="selectedOption && showSelectedChip"
      class="flex flex-wrap gap-1.5 ml-0.5"
    >
      <span class="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-200">
        {{ selectedOption.label }}
        <button
          type="button"
          class="rounded p-0.5 hover:bg-primary-100 dark:hover:bg-primary-900"
          :disabled="disabled"
          aria-label="Clear selection"
          @click="clearSelection"
        >
          <UIcon
            name="i-lucide-x"
            class="h-3 w-3"
          />
        </button>
      </span>
    </div>

    <p
      v-if="error"
      class="text-xs text-red-500 ml-1"
    >
      {{ error }}
    </p>
  </div>
</template>
