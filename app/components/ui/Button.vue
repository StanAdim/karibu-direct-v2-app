<script setup lang="ts">
interface Props {
  variant?: 'solid' | 'outline' | 'ghost' | 'soft' | 'link'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'solid',
  color: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  iconPosition: 'left',
  type: 'button'
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <UButton
    :variant="variant"
    :color="color"
    :size="size"
    :loading="loading"
    :disabled="disabled || loading"
    :block="block"
    :icon="iconPosition === 'left' ? icon : undefined"
    :trailing-icon="iconPosition === 'right' ? icon : undefined"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </UButton>
</template>
