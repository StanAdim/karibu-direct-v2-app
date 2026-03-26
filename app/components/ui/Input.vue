<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  icon?: string
  trailingIcon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  autocomplete?: string
  min?: string | number
  max?: string | number
  step?: string | number
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  size: 'lg',
  required: false,
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

function handleInput(value: string | number) {
  emit('update:modelValue', value)
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target) return
  handleInput(target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <span
        v-if="icon"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none"
      >
        <UIcon
          :name="icon"
          class="size-4"
        />
      </span>

      <input
        :value="modelValue != null ? String(modelValue) : ''"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :class="[
          'w-full min-h-11 rounded-xl border bg-white px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-200 dark:border-slate-700',
          icon ? 'pl-11 pr-3' : 'px-3',
          trailingIcon ? 'pr-11' : ''
        ]"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <button
        v-if="trailingIcon"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        tabindex="-1"
      >
        <UIcon
          :name="trailingIcon"
          class="size-4"
        />
      </button>
    </div>

    <p
      v-if="hint && !error"
      class="text-xs text-slate-500 dark:text-slate-400 ml-1"
    >
      {{ hint }}
    </p>

    <p
      v-if="error"
      class="text-xs text-red-500 ml-1"
    >
      {{ error }}
    </p>
  </div>
</template>
