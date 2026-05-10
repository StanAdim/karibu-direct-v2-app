<script setup lang="ts">
import { ref } from 'vue'
import SearchBar from '~/components/public/SearchBar.vue'

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

const emit = defineEmits<{
  search: [query: string, location?: string]
}>()

function handleSearch(): void {
  emit('search', searchQuery.value, selectedLocation.value.trim() || undefined)
}
</script>

<template>
  <section class="relative isolate px-4 pb-2 pt-4 sm:px-6 sm:pt-6 md:pb-4">
    <div class="public-container !px-0 sm:!px-0 lg:!px-0">
      <div
        class="relative mx-auto max-w-7xl overflow-hidden rounded-[var(--radius-public-hero)] min-h-[min(32rem,78vh)] md:min-h-[min(38rem,85vh)]
          shadow-[0_32px_80px_-24px_rgb(15_23_42_/_0.35)] ring-1 ring-white/10 dark:ring-white/5"
      >
        <div class="absolute inset-0 bg-slate-950" aria-hidden="true" />

        <div
          v-if="backgroundImage"
          class="absolute inset-0 bg-cover bg-center transition-transform duration-[1.6s] ease-out motion-safe:md:scale-100"
          :style="`background-image: url('${backgroundImage}')`"
          aria-hidden="true"
        />

        <!-- Overlays: readability + premium depth -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/45 dark:from-[#05040a] dark:via-slate-950/85"
          aria-hidden="true"
        />
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary-600/25 via-transparent to-violet-900/30 mix-blend-soft-light dark:mix-blend-screen"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
          style="background: radial-gradient(ellipse 90% 70% at 50% 100%, rgb(0 0 0), transparent 55%)"
          aria-hidden="true"
        />

        <div
          class="relative z-10 flex min-h-[inherit] flex-col items-center justify-center px-5 py-14 text-center sm:px-8 md:px-12 md:py-20"
        >
          <p
            class="animate-fade-in mb-5 text-xs font-bold uppercase tracking-[0.28em] text-primary-200/95"
          >
            Find your next experience
          </p>

          <h1
            class="animate-slide-up max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[3.5rem]"
          >
            {{ title }}<span
              v-if="highlight"
              class="bg-gradient-to-r from-primary-200 via-white to-violet-200 bg-clip-text font-semibold text-transparent not-italic"
            >{{ highlight }}</span>
          </h1>

          <p
            v-if="subtitle"
            class="animation-delay-200 animate-slide-up mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg md:text-xl"
          >
            {{ subtitle }}
          </p>

          <div v-if="showSearch" class="animation-delay-400 animate-slide-up mt-10 w-full">
            <SearchBar
              v-model:search="searchQuery"
              v-model:location="selectedLocation"
              :show-location-select="showLocationSelect"
              :locations="props.locations"
              @submit="handleSearch"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
