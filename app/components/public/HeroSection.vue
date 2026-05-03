<script setup lang="ts">
interface Props {
  title: string
  highlight?: string
  subtitle?: string
  backgroundImage?: string
  showSearch?: boolean
  showLocationSelect?: boolean
  locations?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  showLocationSelect: true,
  locations: () => ['Dar es Salaam', 'Arusha', 'Zanzibar', 'Tanga', 'Mwanza'],
})

const searchQuery = ref('')
const selectedLocation = ref('')

const locationSelectOptions = computed(() =>
  [...new Set(
    (props.locations ?? []).filter(
      (loc): loc is string => typeof loc === 'string' && loc.trim().length > 0
    )
  )].map(loc => {
    const trimmed = loc.trim()
    return { label: trimmed, value: trimmed }
  })
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

const emit = defineEmits<{
  search: [query: string, location?: string]
}>()

function handleSearch() {
  emit('search', searchQuery.value, selectedLocation.value || undefined)
}
</script>

<template>
  <section class="relative px-4 py-6 md:py-8">
    <div class="">
      <div class="relative overflow-visible rounded-3xl bg-slate-900 min-h-[420px] md:min-h-[600px] flex items-center px-6 py-16 md:px-12 md:py-24">
        <!-- Background Image -->
        <div
          v-if="backgroundImage"
          class="absolute inset-0 z-0 overflow-hidden rounded-3xl bg-cover bg-center scale-105"
          :style="`background-image: url('${backgroundImage}')`"
        />

        <!-- Gradient Overlay -->
        <div class="absolute inset-0 z-10 overflow-hidden rounded-3xl bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-slate-900/50" />

        <!-- Content -->
        <div class="relative z-20 w-full mx-auto max-w-4xl text-center">
          <h2 class="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl tracking-tight">
            {{ title }}<span v-if="highlight" class="italic text-primary-300">{{ highlight }}</span>
          </h2>

          <p v-if="subtitle" class="mt-5 text-lg text-white/90 md:text-xl max-w-2xl mx-auto">
            {{ subtitle }}
          </p>

          <!-- Search Bar: off-white rounded bar, Search button on right -->
          <div
            v-if="showSearch"
            class="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto rounded-2xl bg-white/95 dark:bg-slate-800/95 p-2 shadow-xl"
          >
            <div class="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 px-4 py-3 min-w-0">
              <AppLucideIcon name="search" class="text-slate-400 shrink-0" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search events, artists..."
                class="w-full border-none bg-transparent p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 outline-none text-sm md:text-base"
                @keyup.enter="handleSearch"
              />
            </div>

            <template v-if="showLocationSelect">
              <div class="hero-location-select relative z-[200] flex flex-1 min-w-0 items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 px-4 py-3 sm:max-w-[220px]">
                <AppLucideIcon name="location_on" class="text-slate-400 shrink-0" />
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
            </template>

            <AppButton
              type="button"
              icon="search"
              class="shrink-0"
              @click="handleSearch"
            >
              Search
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
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
