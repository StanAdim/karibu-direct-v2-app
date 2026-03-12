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
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
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
</script>

<template>
  <UFormField
    :label="label"
    :hint="hint"
    :error="error"
    :required="required"
  >
    <UInput
      :model-value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :icon="icon"
      :trailing-icon="trailingIcon"
      :size="size"
      :autocomplete="autocomplete"
      :color="error ? 'error' : undefined"
      @update:model-value="handleInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
  </UFormField>
</template>
