<script setup lang="ts">
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
    icon: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
    bgClass: 'bg-white hover:bg-gray-50',
    textClass: 'text-slate-700'
  },
  facebook: {
    label: 'Facebook',
    icon: 'https://www.facebook.com/images/fb_icon_325x325.png',
    bgClass: 'bg-[#1877F2] hover:bg-[#166FE5]',
    textClass: 'text-white'
  },
  twitter: {
    label: 'Twitter',
    icon: '',
    bgClass: 'bg-black hover:bg-gray-900',
    textClass: 'text-white'
  },
  apple: {
    label: 'Apple',
    icon: '',
    bgClass: 'bg-black hover:bg-gray-900',
    textClass: 'text-white'
  }
}

const config = computed(() => providerConfig[props.provider])
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
    <!-- Provider Icon -->
    <img
      v-if="config.icon"
      :src="config.icon"
      :alt="config.label"
      class="w-5 h-5 object-contain"
    />
    <span v-else-if="provider === 'twitter'" class="text-lg">𝕏</span>
    <span v-else-if="provider === 'apple'" class="material-symbols-outlined"></span>

    <!-- Label -->
    <span>{{ config.label }}</span>
  </button>
</template>
