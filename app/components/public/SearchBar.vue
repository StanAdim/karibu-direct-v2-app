<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  label: string
  value: string
}

interface Props {
  showLocationSelect?: boolean
  locations?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  showLocationSelect: true,
  locations: () => ['Dar es Salaam', 'Arusha', 'Zanzibar', 'Tanga', 'Mwanza'],
})

const searchQuery = defineModel<string>('search', { default: '' })

const selectedLocation = defineModel<string>('location', { default: '' })

const emit = defineEmits<{
  submit: []
}>()

const locationSelectOptions = computed((): SelectOption[] =>
  [...new Set(
    (props.locations ?? []).filter(
      (loc): loc is string => typeof loc === 'string' && loc.trim().length > 0,
    ),
  )].map(loc => {
    const trimmed = loc.trim()
    return { label: trimmed, value: trimmed }
  }),
)

const locationSelectModel = computed({
  get(): string | null {
    const s = selectedLocation.value.trim()
    return s.length ? selectedLocation.value : null
  },
  set(v: string | null) {
    selectedLocation.value = typeof v === 'string' ? v : ''
  },
})

function onSubmit(): void {
  emit('submit')
}
</script>

<template>
  <div
    class="group/search relative z-30 w-full max-w-3xl mx-auto rounded-2xl p-1.5 sm:p-2
      bg-white/95 dark:bg-slate-900/95
      shadow-[var(--shadow-public-float)]
      ring-1 ring-slate-200/80 dark:ring-slate-700/80
      backdrop-blur-xl
      transition-[box-shadow,transform] duration-300
      hover:shadow-[0_32px_64px_-16px_rgb(0_0_0_/_0.22)]
      focus-within:ring-2 focus-within:ring-primary-400/60 focus-within:ring-offset-2 focus-within:ring-offset-transparent dark:focus-within:ring-offset-transparent"
    role="search"
    aria-label="Search events"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div
        class="flex min-h-[3.25rem] flex-1 items-center gap-3 rounded-xl bg-slate-50/95 px-4 py-3 min-w-0
          transition-colors dark:bg-slate-800/80
          group-focus-within/search:bg-white dark:group-focus-within/search:bg-slate-800"
      >
        <AppLucideIcon name="search" class="size-5 shrink-0 text-primary-500/80" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          placeholder="Search events, artists, venues…"
          class="public-focus-ring w-full min-w-0 rounded-md border-none bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none text-sm md:text-base dark:text-white"
          @keyup.enter="onSubmit"
        >
      </div>

      <div
        v-if="showLocationSelect"
        class="hero-location-select relative isolate z-[1] flex min-h-[3.25rem] min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50/95 px-4 py-3 sm:max-w-[13.75rem]
          transition-colors dark:bg-slate-800/80
          group-focus-within/search:bg-white dark:group-focus-within/search:bg-slate-800"
      >
        <AppLucideIcon name="location_on" class="size-5 shrink-0 text-primary-500/80" aria-hidden="true" />
        <AppSingleSelect
          v-model="locationSelectModel"
          hide-label
          placeholder="All locations"
          aria-label="Location"
          :options="locationSelectOptions"
          :show-selected-chip="false"
          class="min-w-0 flex-1"
        />
      </div>

      <AppButton
        type="button"
        icon="search"
        class="!min-h-[3.25rem] shrink-0 justify-center shadow-md shadow-primary-500/25 sm:!px-6"
        @click="onSubmit"
      >
        Search
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.hero-location-select :deep(.flex.flex-col) {
  gap: 0;
}

.hero-location-select :deep(div.relative > button[type="button"]) {
  border: none;
  padding-left: 0;
  padding-right: 0;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  min-height: 0;
  background: transparent !important;
  box-shadow: none !important;
  font-size: 0.9375rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .hero-location-select :deep(div.relative > button[type="button"]) {
    font-size: 1rem;
  }
}

.hero-location-select :deep(div.relative > button:focus) {
  box-shadow: none !important;
  outline: none;
}
</style>
