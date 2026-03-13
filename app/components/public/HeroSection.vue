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
  locations: () => ['New York, NY', 'Dar es Salaam', 'Arusha', 'Zanzibar', 'London', 'Tokyo']
})

const searchQuery = ref('')
const selectedLocation = ref(props.locations[0] || '')

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
      <div class="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[420px] md:min-h-[600px] flex items-center px-6 py-16 md:px-12 md:py-24">
        <!-- Background Image -->
        <div
          v-if="backgroundImage"
          class="absolute inset-0 z-0 bg-cover bg-center scale-105"
          :style="`background-image: url('${backgroundImage}')`"
        />

        <!-- Gradient Overlay -->
        <div class="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-slate-900/50" />

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
            class="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto rounded-2xl bg-white/95 dark:bg-slate-800/95 p-2 shadow-xl overflow-hidden"
          >
            <div class="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 px-4 py-3 min-w-0">
              <span class="material-symbols-outlined text-slate-400 shrink-0">search</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search events, artists..."
                class="w-full border-none bg-transparent p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 outline-none text-sm md:text-base"
                @keyup.enter="handleSearch"
              />
            </div>

            <template v-if="showLocationSelect">
              <div class="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 px-4 py-3 min-w-0 sm:max-w-[200px]">
                <span class="material-symbols-outlined text-slate-400 shrink-0">location_on</span>
                <select
                  v-model="selectedLocation"
                  class="w-full border-none bg-transparent p-0 text-slate-900 dark:text-white focus:ring-0 outline-none text-sm md:text-base appearance-none"
                >
                  <option value="">All Locations</option>
                  <option v-for="loc in locations" :key="loc" :value="loc">
                    {{ loc }}
                  </option>
                </select>
                <span class="material-symbols-outlined text-slate-400 text-lg shrink-0">expand_more</span>
              </div>
            </template>

            <button
              type="button"
              class="rounded-xl bg-primary-500 px-8 py-3.5 text-base font-bold text-white shrink-0 hover:bg-primary-600 transition-colors"
              @click="handleSearch"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
