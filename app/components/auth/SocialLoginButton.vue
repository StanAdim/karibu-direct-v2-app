<script setup lang="ts">
import { computed } from 'vue'
import { socialBrandIcons } from '~/utils/icons'

interface Props {
  provider: 'google' | 'facebook' | 'twitter' | 'apple'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<{
  click: []
}>()

const providerConfig = {
  google: {
    label: 'Google',
    bgClass: 'bg-white hover:bg-gray-50',
    textClass: 'text-slate-700'
  },
  facebook: {
    label: 'Facebook',
    bgClass: 'bg-[#1877F2] hover:bg-[#166FE5]',
    textClass: 'text-white'
  },
  twitter: {
    label: 'Twitter',
    bgClass: 'bg-black hover:bg-gray-900',
    textClass: 'text-white'
  },
  apple: {
    label: 'Apple',
    bgClass: 'bg-black hover:bg-gray-900',
    textClass: 'text-white'
  }
}

const config = computed(() => providerConfig[props.provider])

const brandIcon = computed(() => socialBrandIcons[props.provider])
</script>

<template>
  <button
    :class="[
      'flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm transition-all',
      config.bgClass,
      config.textClass,
      loading && 'opacity-70 cursor-not-allowed'
    ]"
    :disabled="loading"
    @click="$emit('click')"
  >
    <FaIcon
      :icon="brandIcon"
      class="h-5 w-5 shrink-0"
    />

    <span>{{ config.label }}</span>
  </button>
</template>
