<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  hoverable?: boolean
  clickable?: boolean
  to?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'outline',
  hoverable: false,
  clickable: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <UCard
    :variant="variant"
    :color="color"
    :to="to"
    :class="[
      hoverable && 'transition-shadow hover:shadow-md',
      clickable && 'cursor-pointer'
    ]"
    @click="$emit('click', $event)"
  >
    <template
      v-if="title || icon || $slots.header"
      #header
    >
      <slot name="header">
        <div class="flex items-center gap-3">
          <UIcon
            v-if="icon"
            :name="icon"
            class="size-5 text-gray-500 dark:text-gray-400"
          />
          <div>
            <h3
              v-if="title"
              class="text-base font-semibold text-gray-900 dark:text-white"
            >
              {{ title }}
            </h3>
            <p
              v-if="description"
              class="mt-1 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ description }}
            </p>
          </div>
        </div>
      </slot>
    </template>

    <slot />

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UCard>
</template>
