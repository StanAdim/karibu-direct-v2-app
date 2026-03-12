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

withDefaults(defineProps<Props>(), {
  showSearch: true,
  showLocationSelect: true,
  locations: () => ['Dar es Salaam', 'Arusha', 'Zanzibar', 'Mwanza', 'Dodoma']
})

const searchQuery = ref('')
const selectedLocation = ref('')

const emit = defineEmits<{
  search: [query: string, location?: string]
}>()

function handleSearch() {
  emit('search', searchQuery.value, selectedLocation.value || undefined)
}
</script>

<template>
  <section class="relative px-6 py-12 md:py-20">
    <div class="mx-auto max-w-7xl">
      <div class="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-20 text-center md:px-16 md:py-32">
        <!-- Background Image -->
        <div
          v-if="backgroundImage"
          class="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          :style="`background-image: url('${backgroundImage}')`"
        />

        <!-- Gradient Overlay -->
        <div class="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <!-- Content -->
        <div class="relative z-20 mx-auto max-w-3xl">
          <h2 class="text-4xl font-black leading-tight text-white md:text-6xl tracking-tight">
            {{ title }}
            <span v-if="highlight" class="text-primary-400">{{ highlight }}</span>
          </h2>

          <p v-if="subtitle" class="mt-6 text-lg text-slate-300 md:text-xl">
            {{ subtitle }}
          </p>

          <!-- Search Bar -->
          <div
            v-if="showSearch"
            class="mt-10 flex flex-col items-center gap-3 md:flex-row md:rounded-2xl md:bg-white md:p-2 md:shadow-2xl"
          >
            <!-- Search Input -->
            <div class="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 md:bg-transparent">
              <span class="material-symbols-outlined text-slate-400">search</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search events, artists..."
                class="w-full border-none bg-transparent p-0 text-slate-900 placeholder-slate-400 focus:ring-0 outline-none"
                @keyup.enter="handleSearch"
              />
            </div>

            <!-- Location Select -->
            <template v-if="showLocationSelect">
              <div class="h-8 w-px bg-slate-200 hidden md:block" />

              <div class="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 md:bg-transparent">
                <span class="material-symbols-outlined text-slate-400">location_on</span>
                <select
                  v-model="selectedLocation"
                  class="w-full border-none bg-transparent p-0 text-slate-900 focus:ring-0 outline-none"
                >
                  <option value="">All Locations</option>
                  <option v-for="loc in locations" :key="loc" :value="loc">
                    {{ loc }}
                  </option>
                </select>
              </div>
            </template>

            <!-- Search Button -->
            <button
              class="w-full rounded-xl bg-primary-500 px-8 py-4 text-base font-bold text-white md:w-auto hover:bg-primary-500/90 transition-colors"
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
